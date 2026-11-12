import { Mail, ShieldCheck, UserPlus, Users } from "lucide-react";
import { Callout, Card, CardHeader, EmptyState, Field, Input, PageHeader, Select, StatusBadge, TableCard, cx, formatDateTime, initials, tableClass, tdClass, thClass, timeAgo, trClass } from "@/components/admin/ui";
import { ActionButton, ActionForm, AutoSelect, SubmitButton } from "@/components/admin/ui-client";
import { ROLE_INFO, type StaffRole } from "@/lib/auth/roles";
import { getSessionUser } from "@/lib/auth/session";
import { query } from "@/lib/db/pool";
import { createStaff, sendPasswordLink, toggleStaffActive, updateStaffRole } from "./actions";

export const dynamic = "force-dynamic";

type StaffRow = {
  id: string;
  full_name: string;
  email: string;
  role: StaffRole;
  is_active: boolean;
  last_sign_in_at: string | null;
  has_password: boolean;
  created_at: string;
};

const ROLE_OPTIONS = (Object.keys(ROLE_INFO) as StaffRole[]).map((r) => ({ value: r, label: ROLE_INFO[r].label }));

export default async function StaffPage() {
  const me = await getSessionUser();
  const { rows: staff } = await query<StaffRow>(
    `SELECT s.id, s.full_name, s.email, s.role, s.is_active, s.last_sign_in_at, s.created_at,
            EXISTS (SELECT 1 FROM staff_credentials c WHERE c.email = s.email) AS has_password
       FROM staff_users s
      ORDER BY s.is_active DESC, s.full_name`,
  );
  const active = staff.filter((s) => s.is_active);
  const activeAdmins = active.filter((s) => s.role === "admin").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        description={`${active.length} active ${active.length === 1 ? "person" : "people"}. Each person signs in with their own email and only sees what their role allows.`}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Add a staff member" description="They get an email with a link to choose their own password. You never see or set it." />
            <ActionForm
              action={createStaff}
              success="Staff member added and invite sent"
              error="Could not finish adding this person. If they appear in the list, use “Send password link”; otherwise check the email address."
              resetOnSuccess
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_13rem_auto] lg:items-end"
            >
              <Field label="Full name" htmlFor="staff-name" required>
                <Input id="staff-name" name="full_name" required maxLength={160} autoComplete="off" placeholder="e.g. Ama Mensah" />
              </Field>
              <Field label="Work email" htmlFor="staff-email" required>
                <Input id="staff-email" name="email" type="email" required maxLength={200} autoComplete="off" placeholder="name@premium1logistics.com" />
              </Field>
              <Field label="Role" htmlFor="staff-role" required>
                <Select id="staff-role" name="role" defaultValue="operations">
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <SubmitButton pendingLabel="Adding…">
                <UserPlus size={16} /> Add and invite
              </SubmitButton>
            </ActionForm>
          </Card>

          {staff.length ? (
            <TableCard>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Person</th>
                    <th className={thClass}>Role</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Last sign-in</th>
                    <th className={cx(thClass, "text-right")}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => {
                    const isMe = me?.id === s.id;
                    const lastAdmin = s.role === "admin" && s.is_active && activeAdmins <= 1;
                    return (
                      <tr key={s.id} className={cx(trClass, !s.is_active && "opacity-70")}>
                        <td className={tdClass}>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[13px] font-medium text-slate-600">
                              {initials(s.full_name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[var(--navy)]">
                                {s.full_name}
                                {isMe ? <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">You</span> : null}
                              </p>
                              <p className="truncate text-[13px] text-slate-500">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className={tdClass}>
                          <AutoSelect
                            action={updateStaffRole}
                            name="role"
                            value={s.role}
                            fields={{ id: s.id }}
                            options={ROLE_OPTIONS}
                            ariaLabel={`Role for ${s.full_name}`}
                            success="Role updated"
                            disabled={lastAdmin || !s.is_active}
                          />
                          {lastAdmin ? <p className="mt-1 text-xs text-slate-500">Only admin; cannot be changed</p> : null}
                        </td>
                        <td className={tdClass}>
                          <StatusBadge status={!s.is_active ? "inactive" : s.has_password ? "active" : "invited"} />
                        </td>
                        <td className={cx(tdClass, "whitespace-nowrap")}>
                          {s.last_sign_in_at ? <span title={formatDateTime(s.last_sign_in_at)}>{timeAgo(s.last_sign_in_at)}</span> : <span className="text-slate-400">Never</span>}
                        </td>
                        <td className={cx(tdClass, "text-right")}>
                          <div className="flex justify-end gap-2">
                            {s.is_active ? (
                              <ActionButton
                                action={sendPasswordLink}
                                fields={{ id: s.id }}
                                success={`Password link emailed to ${s.email}`}
                                error="The email could not be sent. Check the address and try again."
                                title="Emails a one-hour link to set a new password"
                              >
                                <Mail size={14} /> {s.has_password ? "Send password link" : "Resend invite"}
                              </ActionButton>
                            ) : null}
                            {!lastAdmin ? (
                              <ActionButton
                                action={toggleStaffActive}
                                fields={{ id: s.id }}
                                variant={s.is_active ? "danger" : "secondary"}
                                confirm={s.is_active ? (isMe ? "Sign yourself out for good?" : "Confirm: remove access") : undefined}
                                success={s.is_active ? `${s.full_name} can no longer sign in` : `${s.full_name} can sign in again`}
                              >
                                {s.is_active ? "Deactivate" : "Reactivate"}
                              </ActionButton>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableCard>
          ) : (
            <Card>
              <EmptyState icon={Users} title="No staff yet" description="Add the first person above." />
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card as="aside">
            <CardHeader title="What each role can do" />
            <dl className="space-y-4">
              {(Object.keys(ROLE_INFO) as StaffRole[]).map((r) => (
                <div key={r}>
                  <dt className="text-sm font-medium text-[var(--navy)]">{ROLE_INFO[r].label}</dt>
                  <dd className="mt-0.5 text-[13px] leading-5 text-slate-500">{ROLE_INFO[r].summary}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Callout icon={ShieldCheck} title="How access is protected">
            Deactivating someone signs them out at once and cancels any password links they hold. Role changes apply to their next action. There is always at least one admin.
          </Callout>
        </div>
      </div>
    </div>
  );
}
