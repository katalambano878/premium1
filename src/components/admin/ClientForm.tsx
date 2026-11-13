"use client";

import { useState } from "react";
import { Building2, CreditCard, Mail, MapPin, Phone, UserRound, type LucideIcon } from "lucide-react";
import { ActionForm, SubmitButton } from "./ui-client";
import { ButtonLink, Field, Input, StatusBadge, Textarea, buttonClass, cx, initials, inputClass } from "./ui";
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

type Preview = { company: string; industry: string; address: string; contact: string; email: string; phone: string; tier: string; terms: string; credit: string };

/** A numbered block of the form: icon, title, one line of help, then its fields. */
function Section({
  step,
  icon: Icon,
  title,
  description,
  children,
  boxed,
}: {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
  boxed: boolean;
}) {
  return (
    <fieldset className={cx(boxed ? "rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" : "border-t border-slate-200 pt-5 first:border-t-0 first:pt-0")}>
      <legend className="float-left mb-5 flex w-full items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[var(--navy)]">
          <Icon size={18} strokeWidth={1.7} />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-medium text-[var(--navy)]">
            <span className="mr-2 tabular-nums text-slate-400">{step}</span>
            {title}
          </span>
          <span className="block text-[13px] leading-5 text-slate-500">{description}</span>
        </span>
      </legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

/** A set of radio buttons drawn as selectable cards. */
function ChoiceCards({
  name,
  legend,
  options,
  value,
  onChange,
  columns,
}: {
  name: string;
  legend: string;
  options: { value: string; label: string; hint: string }[];
  value: string;
  onChange: (v: string) => void;
  columns: string;
}) {
  return (
    <div role="radiogroup" aria-label={legend}>
      <p className="mb-1.5 text-sm font-medium text-[var(--navy)]">{legend}</p>
      <div className={cx("grid gap-2", columns)}>
        {options.map((o) => {
          const on = value === o.value;
          return (
            <label
              key={o.value}
              className={cx(
                "relative flex cursor-pointer flex-col rounded-xl border px-3.5 py-3 transition-[border-color,background-color,box-shadow] duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--accent-ink)]",
                on ? "border-[var(--navy)] bg-slate-50 shadow-[inset_0_0_0_1px_var(--navy)]" : "border-slate-300 bg-white hover:border-slate-400",
              )}
            >
              <input type="radio" name={name} value={o.value} checked={on} onChange={() => onChange(o.value)} className="sr-only" />
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-[var(--navy)]">{o.label}</span>
                <span
                  aria-hidden
                  className={cx(
                    "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
                    on ? "border-[var(--navy)] bg-[var(--navy)]" : "border-slate-300 bg-white",
                  )}
                >
                  <span className={cx("h-1.5 w-1.5 rounded-full bg-white transition-opacity duration-150", on ? "opacity-100" : "opacity-0")} />
                </span>
              </span>
              <span className="mt-1 text-[13px] leading-5 text-slate-500">{o.hint}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/** Create or edit a client. Company, contact name, email and phone are required. */
export function ClientForm({ action, client, cancelHref, onCancel, onSaved }: ClientFormProps) {
  const editing = Boolean(client);
  const inDialog = Boolean(onCancel);
  const uid = client?.id || "new";
  const fid = (name: string) => `client-${uid}-${name}`;

  const [p, setP] = useState<Preview>({
    company: client?.company_name || "",
    industry: client?.industry || "",
    address: client?.address || "",
    contact: client?.contact_name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    tier: client?.tier || (editing ? "standard" : "new"),
    terms: client?.payment_terms || "net_30",
    credit: client?.credit_limit != null ? String(client.credit_limit) : "",
  });
  const set = (key: keyof Preview) => (e: React.ChangeEvent<HTMLInputElement>) => setP((prev) => ({ ...prev, [key]: e.target.value }));

  const save = async (formData: FormData) => {
    await action(formData);
    onSaved?.();
  };

  const terms = PAYMENT_TERMS.find((t) => t.value === p.terms);
  const missing = [!p.company.trim() && "company name", !p.contact.trim() && "contact name", !p.email.trim() && "email", !p.phone.trim() && "phone"].filter(Boolean) as string[];
  const creditNumber = Number(p.credit);

  const actions = (
    <>
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
    </>
  );

  const sections = (
    <div className={inDialog ? "space-y-6" : "space-y-4"}>
      <Section step={1} icon={Building2} title="Company" description="Who we are shipping for." boxed={!inDialog}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" htmlFor={fid("company")} required>
            <Input id={fid("company")} name="company_name" required maxLength={200} value={p.company} onChange={set("company")} autoComplete="organization" placeholder="e.g. Asante Trading Ltd" />
          </Field>
          <Field label="Industry" htmlFor={fid("industry")} optional>
            <Input id={fid("industry")} name="industry" maxLength={120} value={p.industry} onChange={set("industry")} placeholder="e.g. Manufacturing" />
          </Field>
          <Field label="Address" htmlFor={fid("address")} optional className="sm:col-span-2">
            <Input id={fid("address")} name="address" maxLength={500} value={p.address} onChange={set("address")} placeholder="Street, city, country" autoComplete="street-address" />
          </Field>
        </div>
      </Section>

      <Section step={2} icon={UserRound} title="Main contact" description="The person we call or email about shipments and invoices." boxed={!inDialog}>
        <div className={cx("grid gap-4 sm:grid-cols-2", !inDialog && "lg:grid-cols-3")}>
          <Field label="Full name" htmlFor={fid("contact")} required className={inDialog ? "sm:col-span-2" : "sm:col-span-2 lg:col-span-1"}>
            <Input id={fid("contact")} name="contact_name" required maxLength={200} value={p.contact} onChange={set("contact")} autoComplete="name" placeholder="e.g. Kwame Asante" />
          </Field>
          <Field label="Email" htmlFor={fid("email")} required>
            <Input id={fid("email")} name="email" type="email" required maxLength={200} value={p.email} onChange={set("email")} autoComplete="email" inputMode="email" placeholder="name@company.com" />
          </Field>
          <Field label="Phone" htmlFor={fid("phone")} required>
            <Input id={fid("phone")} name="phone" type="tel" required maxLength={40} value={p.phone} onChange={set("phone")} autoComplete="tel" inputMode="tel" placeholder="+233 24 000 0000" />
          </Field>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-slate-500">Shipment updates and invoices go to this email. Include the country code in the phone number so WhatsApp links work.</p>
      </Section>

      <Section step={3} icon={CreditCard} title="Account terms" description="How we treat this client and when they pay." boxed={!inDialog}>
        <div className="space-y-5">
          <ChoiceCards name="tier" legend="Client tier" options={CLIENT_TIERS} value={p.tier} onChange={(v) => setP((prev) => ({ ...prev, tier: v }))} columns="sm:grid-cols-3" />
          <ChoiceCards
            name="payment_terms"
            legend="Payment terms"
            options={PAYMENT_TERMS}
            value={p.terms}
            onChange={(v) => setP((prev) => ({ ...prev, terms: v }))}
            columns={inDialog ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}
          />
          <Field label="Credit limit" htmlFor={fid("credit")} optional hint="The most this client may owe at one time. Leave empty for no limit." className="sm:max-w-xs">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-slate-500">USD</span>
              <input
                id={fid("credit")}
                name="credit_limit"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={p.credit}
                onChange={set("credit")}
                placeholder="0.00"
                className={cx(inputClass, "pl-14 tabular-nums")}
              />
            </div>
          </Field>
          {editing ? (
            <Field label="Background" htmlFor={fid("notes")} optional hint="Lasting facts about this client. Day-to-day updates belong in Notes.">
              <Textarea id={fid("notes")} name="notes" rows={3} maxLength={5000} defaultValue={client?.notes || ""} />
            </Field>
          ) : null}
        </div>
      </Section>
    </div>
  );

  if (inDialog) {
    return (
      <ActionForm
        action={save}
        success={editing ? "Client saved" : undefined}
        error="The client could not be saved. Check the details and try again."
        hidden={client ? { id: client.id } : undefined}
      >
        {sections}
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">{actions}</div>
      </ActionForm>
    );
  }

  return (
    <ActionForm
      action={save}
      success={editing ? "Client saved" : undefined}
      error="The client could not be saved. Check the details and try again."
      hidden={client ? { id: client.id } : undefined}
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <div>
        {sections}
        {/* Actions stay in reach on long screens */}
        <div className="sticky bottom-4 z-10 mt-4 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_16px_32px_-20px_rgba(11,31,58,0.35)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:pl-5">
          <p className="hidden text-[13px] text-slate-500 sm:block" aria-live="polite">
            {missing.length ? `Still needed: ${missing.join(", ")}.` : "Ready to save."}
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">{actions}</div>
        </div>
      </div>

      {/* Live preview of the record being created */}
      <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Preview">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="bg-[var(--navy)] px-5 py-5 text-white">
            <p className="text-xs text-white/60">Preview</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-base font-medium">{p.company.trim() ? initials(p.company) : "—"}</span>
              <div className="min-w-0">
                <p className={cx("truncate text-base font-medium", !p.company.trim() && "text-white/50")}>{p.company.trim() || "Company name"}</p>
                <p className="truncate text-[13px] text-white/70">{p.industry.trim() || "Industry not set"}</p>
              </div>
            </div>
          </div>
          <dl className="space-y-3 px-5 py-4 text-sm">
            <PreviewRow icon={UserRound} value={p.contact} placeholder="Contact name" />
            <PreviewRow icon={Mail} value={p.email} placeholder="Email" />
            <PreviewRow icon={Phone} value={p.phone} placeholder="Phone" />
            <PreviewRow icon={MapPin} value={p.address} placeholder="Address not set" />
          </dl>
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-5 py-4">
            <StatusBadge status={p.tier} />
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{terms?.label || "Net 30"}</span>
            {p.credit && creditNumber > 0 ? (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium tabular-nums text-slate-700">
                Limit USD {creditNumber.toLocaleString("en-US")}
              </span>
            ) : null}
          </div>
        </div>

        {!editing ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-[var(--navy)]">After you save</p>
            <ol className="mt-3 space-y-2.5 text-[13px] leading-5 text-slate-600">
              {["You land on the client's page.", "Create their first shipment or invoice from there.", "Notes, shipments and invoices build up their history."].map((line, i) => (
                <li key={line} className="flex gap-2.5">
                  <span className="tabular-nums text-slate-400">{i + 1}</span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </aside>
    </ActionForm>
  );
}

function PreviewRow({ icon: Icon, value, placeholder }: { icon: LucideIcon; value: string; placeholder: string }) {
  const filled = value.trim();
  return (
    <div className="flex items-center gap-2.5">
      <dt className="shrink-0 text-slate-400">
        <Icon size={15} strokeWidth={1.7} aria-hidden />
        <span className="sr-only">{placeholder}</span>
      </dt>
      <dd className={cx("min-w-0 truncate", filled ? "font-medium text-[var(--navy)]" : "text-slate-400")}>{filled || placeholder}</dd>
    </div>
  );
}
