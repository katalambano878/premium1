"use client";

import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ActionForm, SubmitButton } from "./ui-client";
import { ButtonLink, Card, Field, FormActions, Input, Select, Textarea, buttonClass, cx } from "./ui";
import { paymentTermsLabel } from "./clients/options";
import { CHARGE_TYPES, CURRENCIES, formatMoney, round2 } from "./finance/format";

interface LineItem {
  key: number;
  description: string;
  charge_type: string;
  quantity: string;
  unit_price: string;
}

const DUE_PICKS = [7, 14, 30];
const LINE_GRID = "grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-[minmax(0,1fr)_8.5rem_5rem_7.5rem_7.5rem_2.25rem] sm:items-center";
const cellLabel = "mb-1 block text-[13px] text-slate-500 sm:sr-only";

/** Today plus `days`, as the YYYY-MM-DD a date input expects. */
function dateInDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const lineAmount = (item: LineItem) => round2((Number(item.quantity) || 0) * (Number(item.unit_price) || 0));

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-medium text-[var(--navy)]">{title}</h2>
      {description ? <p className="mt-0.5 text-sm leading-6 text-slate-500">{description}</p> : null}
    </div>
  );
}

export function InvoiceForm({
  action,
  clients,
  shipments,
  defaultClientId,
  defaultShipmentId,
}: {
  action: (fd: FormData) => Promise<void>;
  clients: { id: string; company_name: string; payment_terms?: string | null }[];
  shipments: { id: string; shipment_no: string; client_id?: string | null; origin?: string | null; destination?: string | null }[];
  defaultClientId?: string;
  defaultShipmentId?: string;
}) {
  const nextKey = useRef(1);
  const [clientId, setClientId] = useState(defaultClientId || "");
  const [shipmentId, setShipmentId] = useState(defaultShipmentId || "");
  const [currency, setCurrency] = useState("USD");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [items, setItems] = useState<LineItem[]>([{ key: 0, description: "", charge_type: "freight", quantity: "1", unit_price: "" }]);

  const client = clients.find((c) => c.id === clientId);
  // Only the chosen client's shipments can be linked. Lists without client ids fall back to showing everything.
  const clientShipments = shipments.filter((s) => (s.client_id ? s.client_id === clientId : true));

  const subtotal = round2(items.filter((i) => i.description.trim()).reduce((sum, i) => sum + lineAmount(i), 0));
  const rate = Math.max(0, Math.min(100, Number(taxRate) || 0));
  const tax = round2(subtotal * (rate / 100));
  const total = round2(subtotal + tax);

  const addItem = () => {
    const key = nextKey.current++;
    setItems((list) => [...list, { key, description: "", charge_type: "other", quantity: "1", unit_price: "" }]);
  };
  const removeItem = (key: number) => setItems((list) => (list.length > 1 ? list.filter((i) => i.key !== key) : list));
  const updateItem = (key: number, patch: Partial<LineItem>) => setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  // What still stops the invoice from being created, in the order staff would fix it.
  const problem = (() => {
    if (!clientId) return "Choose the client this invoice is for.";
    if (!items.some((i) => i.description.trim())) return "Add a description to at least one line.";
    for (const [index, item] of items.entries()) {
      const described = Boolean(item.description.trim());
      if (!described && Number(item.unit_price) > 0) return `Line ${index + 1} has a price but no description.`;
      if (described && !(Number(item.quantity) > 0)) return `Line ${index + 1} needs a quantity above 0.`;
      if (described && Number(item.unit_price) < 0) return `Line ${index + 1} cannot have a negative price.`;
    }
    return null;
  })();

  return (
    <ActionForm action={action} error="The invoice could not be created. Check the details and try again.">
      <input type="hidden" name="item_count" value={items.length} />
      <Card>
        <section>
          <SectionTitle title="Invoice details" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Client" htmlFor="invoice-client" required>
              <Select
                id="invoice-client"
                name="client_id"
                required
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setShipmentId("");
                }}
              >
                <option value="">Choose a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Shipment"
              htmlFor="invoice-shipment"
              optional
              hint={
                !clientId
                  ? "Choose a client to see their shipments."
                  : clientShipments.length
                    ? "Link the shipment this invoice pays for."
                    : "This client has no shipments yet."
              }
            >
              <Select
                id="invoice-shipment"
                name="shipment_id"
                value={shipmentId}
                onChange={(e) => setShipmentId(e.target.value)}
                disabled={!clientId || !clientShipments.length}
              >
                <option value="">No shipment</option>
                {clientId
                  ? clientShipments.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shipment_no}
                        {s.origin && s.destination ? ` · ${s.origin} to ${s.destination}` : ""}
                      </option>
                    ))
                  : null}
              </Select>
            </Field>
            <Field label="Currency" htmlFor="invoice-currency" hint="All amounts on this invoice are in this currency.">
              <Select id="invoice-currency" name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Due date"
              htmlFor="invoice-due"
              optional
              hint={client ? `${client.company_name} is on ${paymentTermsLabel(client.payment_terms)} terms.` : "When payment is expected."}
            >
              <Input id="invoice-due" type="date" name="due_date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Set the due date from today">
                {DUE_PICKS.map((days) => (
                  <button key={days} type="button" onClick={() => setDueDate(dateInDays(days))} className={buttonClass("secondary", "sm")}>
                    {days} days
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </section>

        <section className="mt-8 border-t border-slate-200 pt-6">
          <SectionTitle title="Line items" description="One line per charge. Lines without a description are left off the invoice." />

          <div className={cx(LINE_GRID, "mb-2 hidden text-[13px] text-slate-500 sm:grid")} aria-hidden>
            <span>Description</span>
            <span>Type</span>
            <span>Qty</span>
            <span>Unit price</span>
            <span className="text-right">Line total</span>
            <span />
          </div>

          <ul className="space-y-5 sm:space-y-2">
            {items.map((item, i) => (
              <li key={item.key} className={cx(LINE_GRID, "border-b border-slate-100 pb-5 last:border-b-0 last:pb-0 sm:border-b-0 sm:pb-0")}>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor={`item-desc-${item.key}`} className={cellLabel}>
                    Description, line {i + 1}
                  </label>
                  <Input
                    id={`item-desc-${item.key}`}
                    name={`item_desc_${i}`}
                    value={item.description}
                    onChange={(e) => updateItem(item.key, { description: e.target.value })}
                    maxLength={500}
                    placeholder="e.g. Ocean freight, Tema to Hamburg"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor={`item-type-${item.key}`} className={cellLabel}>
                    Type
                  </label>
                  <Select
                    id={`item-type-${item.key}`}
                    name={`item_type_${i}`}
                    value={item.charge_type}
                    onChange={(e) => updateItem(item.key, { charge_type: e.target.value })}
                  >
                    {CHARGE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label htmlFor={`item-qty-${item.key}`} className={cellLabel}>
                    Qty
                  </label>
                  <Input
                    id={`item-qty-${item.key}`}
                    name={`item_qty_${i}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.key, { quantity: e.target.value })}
                    className="tabular-nums sm:px-2.5"
                  />
                </div>
                <div>
                  <label htmlFor={`item-price-${item.key}`} className={cellLabel}>
                    Unit price
                  </label>
                  <Input
                    id={`item-price-${item.key}`}
                    name={`item_price_${i}`}
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={item.unit_price}
                    onChange={(e) => updateItem(item.key, { unit_price: e.target.value })}
                    placeholder="0.00"
                    className="tabular-nums sm:px-2.5"
                  />
                </div>
                <div className="flex items-baseline justify-between gap-3 sm:block sm:text-right">
                  <span className="text-[13px] text-slate-500 sm:hidden">Line total</span>
                  <span className="text-sm font-medium tabular-nums text-[var(--navy)]">{formatMoney(lineAmount(item), currency)}</span>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    disabled={items.length === 1}
                    aria-label={`Remove line ${i + 1}`}
                    title={items.length === 1 ? "An invoice needs at least one line" : "Remove this line"}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Trash2 size={16} aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button type="button" onClick={addItem} disabled={items.length >= 50} className={buttonClass("secondary", "sm", "mt-4")}>
            <Plus size={14} aria-hidden /> Add line
          </button>

          <dl className="mt-6 space-y-2.5 border-t border-slate-200 pt-5 text-sm sm:ml-auto sm:max-w-sm" aria-live="polite">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="tabular-nums text-[var(--navy)]">{formatMoney(subtotal, currency)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-2 text-slate-500">
                <label htmlFor="invoice-tax">Tax</label>
                <Input
                  id="invoice-tax"
                  name="tax_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  inputMode="decimal"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-20 px-2.5 py-1.5 text-right tabular-nums"
                />
                <span aria-hidden>%</span>
              </dt>
              <dd className="tabular-nums text-[var(--navy)]">{formatMoney(tax, currency)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-slate-200 pt-3">
              <dt className="font-medium text-[var(--navy)]">Total</dt>
              <dd className="text-xl font-medium tabular-nums tracking-[-0.01em] text-[var(--navy)]">{formatMoney(total, currency)}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-8 border-t border-slate-200 pt-6">
          <Field label="Notes" htmlFor="invoice-notes" optional hint="Printed on the invoice. Use it for bank details or payment instructions.">
            <Textarea id="invoice-notes" name="notes" rows={3} maxLength={5000} />
          </Field>
        </section>

        <FormActions>
          <ButtonLink href="/admin/finance" variant="secondary">
            Cancel
          </ButtonLink>
          <SubmitButton pendingLabel="Creating…" disabled={Boolean(problem)}>
            Create invoice
          </SubmitButton>
          <p className="text-sm text-slate-600 sm:order-first sm:mr-auto" role="status">
            {problem || `Ready to create a draft for ${formatMoney(total, currency)}.`}
          </p>
        </FormActions>
      </Card>
    </ActionForm>
  );
}
