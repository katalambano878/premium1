"use client";

import { ActionForm, SubmitButton } from "./ui-client";
import { ButtonLink, Field, FormActions, Input, Select, Textarea, buttonClass } from "./ui";
import { CLIENT_TIERS, PAYMENT_TERMS } from "./clients/options";

interface ClientFormProps {
  action: (formData: FormData) => Promise<void>;
  client?: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
    address?: string | null;
    notes?: string | null;
    tier?: string | null;
    industry?: string | null;
    credit_limit?: number | null;
    payment_terms?: string | null;
  };
  /** Where "Cancel" goes when the form is a page of its own. */
  cancelHref?: string;
  /** Called by "Cancel" when the form sits in a dialog. */
  onCancel?: () => void;
  /** Called after a successful save. */
  onSaved?: () => void;
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-slate-200 pt-5 first:border-t-0 first:pt-0">
      <legend className="float-left mb-4 w-full">
        <span className="block text-[15px] font-medium text-[var(--navy)]">{title}</span>
        {description ? <span className="mt-0.5 block text-[13px] leading-5 text-slate-500">{description}</span> : null}
      </legend>
      <div className="clear-both grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

/** Create or edit a client. Company, contact name, email and phone are required. */
export function ClientForm({ action, client, cancelHref, onCancel, onSaved }: ClientFormProps) {
  const editing = Boolean(client);
  const uid = client?.id || "new";
  const fid = (name: string) => `client-${uid}-${name}`;

  const save = async (formData: FormData) => {
    await action(formData);
    onSaved?.();
  };

  return (
    <ActionForm
      action={save}
      success={editing ? "Client saved" : undefined}
      error="The client could not be saved. Check the details and try again."
      hidden={client ? { id: client.id } : undefined}
      className="space-y-6"
    >
      <Section title="Company">
        <Field label="Company name" htmlFor={fid("company")} required className="sm:col-span-2">
          <Input id={fid("company")} name="company_name" required maxLength={200} defaultValue={client?.company_name} autoComplete="organization" />
        </Field>
        <Field label="Industry" htmlFor={fid("industry")} optional>
          <Input id={fid("industry")} name="industry" maxLength={120} defaultValue={client?.industry || ""} placeholder="e.g. Manufacturing" />
        </Field>
        <Field label="Address" htmlFor={fid("address")} optional>
          <Input id={fid("address")} name="address" maxLength={500} defaultValue={client?.address || ""} placeholder="Street, city, country" autoComplete="street-address" />
        </Field>
      </Section>

      <Section title="Main contact" description="The person we call or email about shipments and invoices.">
        <Field label="Contact name" htmlFor={fid("contact")} required className="sm:col-span-2">
          <Input id={fid("contact")} name="contact_name" required maxLength={200} defaultValue={client?.contact_name} autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor={fid("email")} required>
          <Input id={fid("email")} name="email" type="email" required maxLength={200} defaultValue={client?.email} autoComplete="email" inputMode="email" />
        </Field>
        <Field label="Phone" htmlFor={fid("phone")} required hint="Include the country code, e.g. +233 24 000 0000.">
          <Input id={fid("phone")} name="phone" type="tel" required maxLength={40} defaultValue={client?.phone} autoComplete="tel" inputMode="tel" />
        </Field>
      </Section>

      <Section title="Account">
        <Field
          label="Tier"
          htmlFor={fid("tier")}
          className="sm:col-span-2"
          hint={CLIENT_TIERS.map((t) => `${t.label}: ${t.hint}`).join(" ")}
        >
          <Select id={fid("tier")} name="tier" defaultValue={client?.tier || (editing ? "standard" : "new")}>
            {CLIENT_TIERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Payment terms" htmlFor={fid("terms")} hint="How long the client has to pay an invoice.">
          <Select id={fid("terms")} name="payment_terms" defaultValue={client?.payment_terms || "net_30"}>
            {PAYMENT_TERMS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Credit limit (USD)" htmlFor={fid("credit")} optional hint="The most this client may owe at one time.">
          <Input
            id={fid("credit")}
            name="credit_limit"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            defaultValue={client?.credit_limit ?? ""}
            placeholder="0.00"
          />
        </Field>
        {editing ? (
          <Field
            label="Background"
            htmlFor={fid("notes")}
            optional
            className="sm:col-span-2"
            hint="Lasting facts about this client. Day-to-day updates belong in Notes."
          >
            <Textarea id={fid("notes")} name="notes" rows={3} maxLength={5000} defaultValue={client?.notes || ""} />
          </Field>
        ) : null}
      </Section>

      <FormActions>
        {onCancel ? (
          <button type="button" onClick={onCancel} className={buttonClass("secondary")}>
            Cancel
          </button>
        ) : cancelHref ? (
          <ButtonLink href={cancelHref} variant="secondary">
            Cancel
          </ButtonLink>
        ) : null}
        <SubmitButton pendingLabel="Saving…">{editing ? "Save changes" : "Create client"}</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
