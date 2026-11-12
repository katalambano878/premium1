import { createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Globe, KeyRound, Mail } from "lucide-react";
import { getSessionUser, requireRole } from "@/lib/auth/session";
import { Callout, Card, CardHeader, DetailList, Field, FormActions, Input, PageHeader } from "@/components/admin/ui";
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
      <PageHeader title="Settings" description="Company details, where alerts go, and your own account." />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Company details" description="The official record of the business, shown to staff in the dashboard." />
            {settings ? (
              <ActionForm action={updateSettings} success="Company details saved" hidden={{ id: settings.id }}>
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
          </Card>

          <Card>
            <CardHeader
              title="Contact details on the public website"
              description="What visitors see on premium1logistics.com today. These are set when the site is deployed, so changing them needs your developer."
            />
            <DetailList
              items={[
                { label: "Phone", value: siteConfig.phone },
                { label: "WhatsApp", value: `+${siteConfig.whatsappE164}` },
                { label: "Email", value: siteConfig.email },
                { label: "Address", value: siteConfig.addressLine },
              ]}
            />
            <a
              href="/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-9 items-center gap-2 text-sm font-medium text-[var(--accent-ink)] hover:text-[var(--navy)]"
            >
              <Globe size={15} /> Open the contact page
            </a>
          </Card>
        </div>

        <div className="space-y-6">
          <Card as="aside">
            <CardHeader title="Your account" />
            <DetailList
              columns={1}
              items={[
                { label: "Name", value: me?.fullName },
                { label: "Sign-in email", value: me?.email },
                { label: "Role", value: me ? ROLE_INFO[me.role]?.label : null },
              ]}
            />
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

          <Card as="aside">
            <CardHeader title="Email alerts" description="Where the website sends new quote requests and contact messages." />
            {alerts.length ? (
              <ul className="space-y-2">
                {alerts.map((a) => (
                  <li key={a} className="flex items-center gap-2.5 text-sm font-medium text-[var(--navy)]">
                    <Mail size={15} className="shrink-0 text-slate-400" /> <span className="break-all">{a}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <Callout tone="danger" title="No alert address is set">
                New quote requests are saved here but nobody is emailed. Ask your developer to set one.
              </Callout>
            )}
            <p className="mt-4 text-[13px] leading-5 text-slate-500">
              Clients get an automatic email when their quote is ready and when a shipment is in transit, arrives or is delivered. Their replies go to {siteConfig.email}.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
