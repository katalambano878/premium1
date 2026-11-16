import { createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Globe, KeyRound, Mail } from "lucide-react";
import { getSessionUser, requireRole } from "@/lib/auth/session";
import { Callout, Card, DeskBanner, DetailList, Field, FormActions, Input, initials } from "@/components/admin/ui";
import { ActionButton, ActionForm, SubmitButton } from "@/components/admin/ui-client";
import { ROLE_INFO } from "@/lib/auth/roles";
import { siteConfig } from "@/lib/siteConfig";
import { staffRecipients } from "@/lib/forms";
import { sendPasswordLink } from "../staff/actions";
import { ensure, id, text } from "@/lib/admin-form";
import { isEmail } from "@/lib/forms";
import { logActivity } from "@/lib/activity";

async function updateSettings(formData: FormData) {
  "use server";
  await requireRole("settings");
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const email = text(formData, "email", 200);
  if (email && !isEmail(email)) throw new Error("Enter a valid email address.");
  ensure(
    await supabase
      .from("site_settings")
      .update({
        company_name: text(formData, "company_name", 200),
        email,
        phone: text(formData, "phone", 40),
        address: text(formData, "address", 500),
        whatsapp: text(formData, "whatsapp", 40),
        tagline: text(formData, "tagline", 300),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id(formData)),
    "save the settings",
  );
  await logActivity({ entityType: "settings", action: "updated company settings" });
  revalidatePath("/admin/settings");
}

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createServiceRoleClient();
  if (!supabase) return <p className="text-slate-500">The database is not connected.</p>;

  const me = await getSessionUser();
  const { data: settings } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  const alerts = staffRecipients();

  return (
    <div className="space-y-6">
      <DeskBanner
        eyebrow="House record · Accra"
        title="Settings"
        accent="for the company"
        description="The name, address and inboxes staff and clients rely on."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card padded={false} className="overflow-hidden shadow-[0_18px_40px_-32px_rgba(11,31,58,0.45)]">
            <div className="h-1 bg-[var(--accent)]" />
            <div className="p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-hover)]">Official record</p>
              <h2 className="mt-1 font-editorial text-3xl text-[var(--navy)]">Company details</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">Shown to staff inside the dashboard. This is the house name on invoices and internal files.</p>
            {settings ? (
              <ActionForm action={updateSettings} success="Company details saved" hidden={{ id: settings.id }} className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Company name" htmlFor="set-company" required>
                    <Input id="set-company" name="company_name" required maxLength={200} defaultValue={settings.company_name || ""} />
                  </Field>
                  <Field label="Email" htmlFor="set-email">
                    <Input id="set-email" name="email" type="email" maxLength={200} defaultValue={settings.email || ""} />
                  </Field>
                  <Field label="Phone" htmlFor="set-phone" hint="With country code, e.g. +233 30 000 0000">
                    <Input id="set-phone" name="phone" type="tel" maxLength={40} defaultValue={settings.phone || ""} />
                  </Field>
                  <Field label="WhatsApp number" htmlFor="set-whatsapp" hint="With country code">
                    <Input id="set-whatsapp" name="whatsapp" type="tel" maxLength={40} defaultValue={settings.whatsapp || ""} />
                  </Field>
                  <Field label="Address" htmlFor="set-address" className="sm:col-span-2">
                    <Input id="set-address" name="address" maxLength={500} defaultValue={settings.address || ""} />
                  </Field>
                  <Field label="Tagline" htmlFor="set-tagline" className="sm:col-span-2" hint="One line describing what the company does.">
                    <Input id="set-tagline" name="tagline" maxLength={300} defaultValue={settings.tagline || ""} />
                  </Field>
                </div>
                <FormActions>
                  <SubmitButton pendingLabel="Saving…">Save company details</SubmitButton>
                </FormActions>
              </ActionForm>
            ) : (
              <Callout tone="warning" title="No company record yet">
                It is created automatically the next time the site is deployed.
              </Callout>
            )}
            </div>
          </Card>

          <Card className="bg-[linear-gradient(180deg,#ffffff_0%,#f4f8f8_100%)] shadow-[0_18px_40px_-32px_rgba(11,31,58,0.35)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-hover)]">Public site</p>
            <h2 className="mt-1 font-editorial text-3xl text-[var(--navy)]">What visitors see</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">These lines are set when the site is deployed. Changing them needs your developer.</p>
            <div className="mt-5">
              <DetailList
                items={[
                  { label: "Phone", value: siteConfig.phone },
                  { label: "WhatsApp", value: `+${siteConfig.whatsappE164}` },
                  { label: "Email", value: siteConfig.email },
                  { label: "Address", value: siteConfig.addressLine },
                ]}
              />
            </div>
            <a
              href="/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--navy)] px-5 text-sm font-semibold text-white hover:bg-[#16335c]"
            >
              <Globe size={15} /> Open the contact page
            </a>
          </Card>
        </div>

        <div className="space-y-6">
          <Card as="aside" className="shadow-[0_18px_40px_-32px_rgba(11,31,58,0.45)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-hover)]">Signed in</p>
            <div className="mt-4 flex items-center gap-4">
              <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--navy)] font-editorial text-xl text-[#b8f3ec]">
                {initials(me?.fullName || me?.email)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-editorial text-2xl leading-none text-[var(--navy)]">{me?.fullName || "Your account"}</p>
                <p className="mt-1 truncate text-sm text-slate-500">{me?.email}</p>
              </div>
            </div>
            {me ? (
              <p className="mt-4 inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-ink)]">{ROLE_INFO[me.role]?.label}</p>
            ) : null}
            {me ? (
              <div className="mt-5 border-t border-slate-200 pt-5">
                <ActionButton
                  action={sendPasswordLink}
                  fields={{ id: me.id }}
                  size="md"
                  success={`Password link emailed to ${me.email}`}
                  error="The email could not be sent. Try again in a moment."
                >
                  <KeyRound size={16} /> Change my password
                </ActionButton>
                <p className="mt-2 text-[13px] leading-5 text-slate-500">We email you a one-hour link to choose a new password.</p>
              </div>
            ) : null}
          </Card>

          <Card as="aside" padded={false} className="overflow-hidden shadow-[0_18px_40px_-32px_rgba(11,31,58,0.45)]">
            <div className="h-1 bg-[var(--accent)]" />
            <div className="p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-hover)]">Inbox</p>
            <h2 className="mt-1 font-editorial text-3xl text-[var(--navy)]">Email alerts</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">Where the website sends new quote requests and contact messages.</p>
            {alerts.length ? (
              <ul className="mt-5 space-y-2">
                {alerts.map((a) => (
                  <li key={a} className="flex items-center gap-3 rounded-2xl bg-[#f4f8f8] px-3 py-2.5 text-sm font-medium text-[var(--navy)]">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--accent-ink)] shadow-sm">
                      <Mail size={15} />
                    </span>
                    <span className="break-all">{a}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5">
                <Callout tone="danger" title="No alert address is set">
                  New quote requests are saved here but nobody is emailed. Ask your developer to set one.
                </Callout>
              </div>
            )}
            <p className="mt-4 text-[13px] leading-5 text-slate-500">
              Clients get an automatic email when their quote is ready and when a shipment is in transit, arrives or is delivered. Their replies go to {siteConfig.email}.
            </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
