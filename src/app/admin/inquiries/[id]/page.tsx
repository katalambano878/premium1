import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Download, FileText, Mail, MessageCircle, Phone } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { query } from "@/lib/db/pool";
import { getSessionUser } from "@/lib/auth/session";
import { canWrite } from "@/lib/auth/roles";
import { INQUIRY_STATUSES } from "@/lib/admin-form";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { AssignSelect } from "@/components/admin/AssignSelect";
import { NoteForm } from "@/components/admin/NoteForm";
import { ConvertButton } from "@/components/admin/ConvertButton";
import { FollowUpForm } from "@/components/admin/FollowUpForm";
import { isOverdue, methodLabel } from "@/components/admin/inquiries/shared";
import {
  ButtonLink,
  Callout,
  Card,
  CardHeader,
  DetailList,
  PageHeader,
  StatusBadge,
  buttonClass,
  formatDateTime,
  initials,
  statusLabel,
  timeAgo,
} from "@/components/admin/ui";
import { updateInquiryStatus, assignInquiry, addInquiryNote, setFollowUp, convertToShipment } from "../actions";

type Inquiry = {
  id: string;
  inquiry_no: string;
  company_name: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  origin: string;
  destination: string;
  cargo: unknown;
  method: string;
  requirements: string | null;
  notes: string | null;
  status: string;
  priority: string | null;
  source: string | null;
  estimated_value: number | null;
  assigned_to: string | null;
  follow_up_at: string | null;
  created_at: string;
};
type FileRow = { id: string; file_url: string; file_type: string | null; created_at: string };
type NoteRow = { id: string; body: string; created_at: string; author_name: string | null };
type StaffRow = { id: string; full_name: string; is_active: boolean };
type ActivityRow = { id: string; action: string; actor_email: string | null; actor_name: string | null; created_at: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const linkClass = "font-medium text-[var(--accent-ink)] underline-offset-4 hover:text-[var(--navy)] hover:underline";

const SOURCE_LABEL: Record<string, string> = {
  website: "Website quote form",
  email: "Email",
  phone: "Phone call",
  referral: "Referral",
  other: "Other",
};

/** "1731400000000-packing-list.pdf" -> "packing-list.pdf" */
function fileName(url: string) {
  const last = url.split("?")[0].split("/").pop() || "File";
  let name = last;
  try {
    name = decodeURIComponent(last);
  } catch {
    // keep the raw name
  }
  return name.replace(/^\d{10,}-/, "") || "File";
}

/** Phone digits in international form for wa.me (Ghana numbers written as 024… become 23324…). */
function whatsappDigits(phone: string | null) {
  let d = (phone || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0") && d.length === 10) d = `233${d.slice(1)}`;
  return d.length >= 9 ? d : "";
}

/** Turns an activity log entry into a plain sentence. */
function activityText(action: string) {
  const status = action.match(/^changed status to (\w+)$/);
  if (status) return `Status changed to ${statusLabel(status[1])}`;
  if (action === "assigned inquiry") return "Assignment changed";
  if (action === "added note") return "Note added";
  if (action === "converted to shipment") return "Converted to a shipment";
  return action.replace(/inquiry/gi, "enquiry").replace(/^./, (c) => c.toUpperCase());
}

const cargoText = (cargo: Record<string, unknown>, key: string) => {
  const v = cargo[key];
  return typeof v === "string" || typeof v === "number" ? String(v).trim() : "";
};

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  if (!createServiceRoleClient()) {
    return (
      <>
        <PageHeader title="Enquiry" back={{ href: "/admin/inquiries", label: "All enquiries" }} />
        <Callout tone="warning" title="The database is not connected">
          This enquiry cannot be shown until the database connection is set up.
        </Callout>
      </>
    );
  }

  const inquiry = (await query<Inquiry>("SELECT * FROM inquiries WHERE id = $1", [id])).rows[0];
  if (!inquiry) notFound();

  const [filesRes, notesRes, staffRes, shipmentRes, activityRes, me] = await Promise.all([
    query<FileRow>("SELECT id, file_url, file_type, created_at FROM inquiry_files WHERE inquiry_id = $1 ORDER BY created_at", [id]),
    query<NoteRow>(
      `SELECT n.id, n.body, n.created_at, s.full_name AS author_name
         FROM inquiry_notes n LEFT JOIN staff_users s ON s.id = n.author_id
        WHERE n.inquiry_id = $1
        ORDER BY n.created_at`,
      [id],
    ),
    query<StaffRow>("SELECT id, full_name, is_active FROM staff_users WHERE is_active = true OR id = $1 ORDER BY full_name", [
      inquiry.assigned_to,
    ]),
    query<{ id: string; shipment_no: string }>("SELECT id, shipment_no FROM shipments WHERE inquiry_id = $1 ORDER BY created_at LIMIT 1", [id]),
    query<ActivityRow>(
      `SELECT a.id, a.action, a.actor_email, s.full_name AS actor_name, a.created_at
         FROM activity_log a LEFT JOIN staff_users s ON lower(s.email) = lower(a.actor_email)
        WHERE a.entity_type = 'inquiry' AND a.entity_id = $1
        ORDER BY a.created_at DESC
        LIMIT 10`,
      [id],
    ),
    getSessionUser().catch(() => null),
  ]);

  const files = filesRes.rows;
  const notes = notesRes.rows;
  const activity = activityRes.rows;
  const shipment = shipmentRes.rows[0];
  const staff = staffRes.rows.map((s) => ({ id: s.id, full_name: s.is_active ? s.full_name : `${s.full_name} (inactive)` }));

  const cargo = inquiry.cargo && typeof inquiry.cargo === "object" ? (inquiry.cargo as Record<string, unknown>) : {};
  const overdue = isOverdue(inquiry.follow_up_at, inquiry.status);
  const waDigits = whatsappDigits(inquiry.phone);
  const replyHref = `mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: your quote request ${inquiry.inquiry_no}`)}`;

  // Why "Convert to shipment" is not offered, if it is not.
  const convertBlocked = shipment
    ? null
    : inquiry.status === "lost"
      ? "This enquiry is marked as lost, so it cannot be converted to a shipment. If the client comes back, change the status first."
      : me && !canWrite(me.role, "shipments")
        ? "Your role cannot create shipments. Ask an operations or admin colleague to convert this enquiry once the client accepts the quote."
        : null;

  const requestItems = [
    { label: "From", value: inquiry.origin },
    { label: "To", value: inquiry.destination },
    { label: "Shipping method", value: methodLabel(inquiry.method) },
    { label: "Cargo type", value: cargoText(cargo, "type") },
    { label: "Quantity", value: cargoText(cargo, "quantity") },
    { label: "Weight", value: cargoText(cargo, "weight") },
    { label: "Dimensions", value: cargoText(cargo, "dimensions") },
    { label: "Received through", value: inquiry.source ? SOURCE_LABEL[inquiry.source] || statusLabel(inquiry.source) : "" },
    ...(inquiry.estimated_value != null
      ? [{ label: "Estimated value", value: `$${Number(inquiry.estimated_value).toLocaleString("en-GB")}` }]
      : []),
    ...(shipment
      ? [
          {
            label: "Shipment",
            value: (
              <Link href={`/admin/shipments/${shipment.id}`} className={linkClass}>
                {shipment.shipment_no}
              </Link>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="max-w-6xl">
      <PageHeader
        back={{ href: "/admin/inquiries", label: "All enquiries" }}
        title={inquiry.inquiry_no}
        badge={
          <>
            <StatusBadge status={inquiry.status} />
            {inquiry.priority && inquiry.priority !== "medium" ? (
              <StatusBadge status={inquiry.priority} label={`${statusLabel(inquiry.priority)} priority`} />
            ) : null}
          </>
        }
        description={
          <>
            Received {formatDateTime(inquiry.created_at)} from {inquiry.full_name}
            {inquiry.company_name ? `, ${inquiry.company_name}` : ""}
          </>
        }
        actions={
          <>
            <label className="flex items-center gap-2 text-[13px] text-slate-500">
              Status
              <StatusSelect currentStatus={inquiry.status} statuses={INQUIRY_STATUSES} action={updateInquiryStatus} entityId={id} />
            </label>
            <label className="flex items-center gap-2 text-[13px] text-slate-500">
              Assigned to
              <AssignSelect currentAssignee={inquiry.assigned_to} staff={staff} action={assignInquiry} entityId={id} />
            </label>
            {shipment ? (
              <ButtonLink href={`/admin/shipments/${shipment.id}`}>
                View shipment <ArrowRight size={16} aria-hidden />
              </ButtonLink>
            ) : convertBlocked ? null : (
              <ConvertButton action={convertToShipment} entityId={id} inquiryNo={inquiry.inquiry_no} contactName={inquiry.full_name} />
            )}
          </>
        }
      />

      {convertBlocked ? (
        <Callout tone="info" className="mb-6">
          {convertBlocked}
        </Callout>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Shipment request" description="What the client asked us to move." />
            <DetailList items={requestItems} />

            <div className="mt-5 border-t border-slate-200 pt-5">
              <h3 className="text-sm font-medium text-[var(--navy)]">Requirements</h3>
              {inquiry.requirements ? (
                <p className="mt-1.5 whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-600">{inquiry.requirements}</p>
              ) : (
                <p className="mt-1.5 text-sm leading-6 text-slate-500">The client did not add any special requirements.</p>
              )}
              {inquiry.notes ? (
                <>
                  <h3 className="mt-5 text-sm font-medium text-[var(--navy)]">Additional notes</h3>
                  <p className="mt-1.5 whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-600">{inquiry.notes}</p>
                </>
              ) : null}
            </div>

            <div className="mt-5 border-t border-slate-200 pt-5">
              <h3 className="text-sm font-medium text-[var(--navy)]">Attached files</h3>
              {files.length > 0 ? (
                <ul className="mt-2 divide-y divide-slate-100">
                  {files.map((f) => {
                    const name = fileName(f.file_url);
                    return (
                      <li key={f.id}>
                        <a
                          href={f.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex min-h-12 items-center gap-3 rounded-lg py-2 text-sm"
                        >
                          <FileText size={18} strokeWidth={1.6} className="shrink-0 text-slate-400" aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-[var(--navy)] underline-offset-4 group-hover:underline">{name}</span>
                            <span className="block text-[13px] text-slate-500">
                              {f.file_type ? `${f.file_type.replace(/^\./, "").toUpperCase()} file, ` : ""}added {timeAgo(f.created_at)}
                            </span>
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-[var(--accent-ink)] group-hover:text-[var(--navy)]">
                            <Download size={15} aria-hidden /> Download
                            <span className="sr-only"> {name}</span>
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  No files were attached. If you need a packing list or invoice, ask the client to email it.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Notes" description="Only staff can see these. Record calls, quotes sent and what was agreed." />
            {notes.length > 0 ? (
              <ol className="mb-5 space-y-4">
                {notes.map((n) => {
                  const author = n.author_name || "Team";
                  return (
                    <li key={n.id} className="flex gap-3">
                      <span
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[13px] font-medium text-slate-600"
                        aria-hidden
                      >
                        {initials(author)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                          <span className="font-medium text-[var(--navy)]">{author}</span>
                          <time dateTime={n.created_at} title={formatDateTime(n.created_at)} className="text-[13px] text-slate-500">
                            {timeAgo(n.created_at)}
                          </time>
                        </p>
                        <p className="mt-0.5 whitespace-pre-wrap break-words text-[15px] leading-6 text-slate-600">{n.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="mb-5 text-sm leading-6 text-slate-500">
                No notes yet. Add the first one after you speak to the client so the rest of the team knows where things stand.
              </p>
            )}
            <NoteForm action={addInquiryNote} entityId={id} fieldName="inquiry_id" placeholder="Write a note for the team…" />
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card as="aside">
            <CardHeader title="Contact" />
            <p className="text-[15px] font-medium text-[var(--navy)]">{inquiry.full_name}</p>
            {inquiry.company_name ? <p className="text-sm text-slate-500">{inquiry.company_name}</p> : null}
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <a href={`mailto:${inquiry.email}`} className={`${linkClass} flex min-h-9 items-center gap-2.5`}>
                  <Mail size={16} className="shrink-0 text-slate-400" aria-hidden />
                  <span className="min-w-0 break-all">{inquiry.email}</span>
                </a>
              </li>
              {inquiry.phone ? (
                <li>
                  <a href={`tel:${inquiry.phone.replace(/[^\d+]/g, "")}`} className={`${linkClass} flex min-h-9 items-center gap-2.5`}>
                    <Phone size={16} className="shrink-0 text-slate-400" aria-hidden />
                    {inquiry.phone}
                  </a>
                </li>
              ) : (
                <li className="flex min-h-9 items-center gap-2.5 text-slate-500">
                  <Phone size={16} className="shrink-0 text-slate-400" aria-hidden />
                  No phone number given
                </li>
              )}
              {waDigits ? (
                <li>
                  <a
                    href={`https://wa.me/${waDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkClass} flex min-h-9 items-center gap-2.5`}
                  >
                    <MessageCircle size={16} className="shrink-0 text-slate-400" aria-hidden />
                    Message on WhatsApp
                  </a>
                </li>
              ) : null}
            </ul>
            <a href={replyHref} className={buttonClass("secondary", "md", "mt-4 w-full")}>
              <Mail size={16} aria-hidden /> Reply by email
            </a>
          </Card>

          <Card as="aside">
            <CardHeader title="Follow-up" description="When to chase this enquiry next." />
            <FollowUpForm action={setFollowUp} entityId={id} current={inquiry.follow_up_at} overdue={overdue} />
          </Card>

          <Card as="aside">
            <CardHeader title="Activity" description="The latest changes to this enquiry." />
            {activity.length > 0 ? (
              <ol className="space-y-3">
                {activity.map((a) => (
                  <li key={a.id} className="text-sm leading-6">
                    <p className="text-[var(--navy)]">{activityText(a.action)}</p>
                    <p className="text-[13px] text-slate-500">
                      {a.actor_name || (a.actor_email && a.actor_email !== "system" ? a.actor_email : "System")},{" "}
                      <time dateTime={a.created_at} title={formatDateTime(a.created_at)}>
                        {timeAgo(a.created_at)}
                      </time>
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm leading-6 text-slate-500">
                Nothing recorded yet. Status changes, assignments and notes will be listed here as they happen.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
