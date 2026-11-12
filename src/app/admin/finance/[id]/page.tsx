import Link from "next/link";
import { notFound } from "next/navigation";
import { Ban, CheckCircle2, Clock, Wallet } from "lucide-react";
import { InvoiceStatusButton } from "@/components/admin/InvoiceStatusButton";
import { PaymentForm } from "@/components/admin/PaymentForm";
import { PrintButton } from "@/components/admin/finance/PrintButton";
import { chargeTypeLabel, isUuid, paymentMethodLabel } from "@/components/admin/finance/format";
import {
  Callout,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  StatusBadge,
  buttonClass,
  cx,
  formatDate,
  statusLabel,
  tdClass,
  thClass,
} from "@/components/admin/ui";
import { query } from "@/lib/db/pool";
import { money, refreshOverdueInvoices } from "@/lib/finance";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { addPayment } from "../actions";

type Invoice = {
  id: string;
  invoice_no: string;
  client_id: string;
  shipment_id: string | null;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  company_name: string | null;
  contact_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  shipment_no: string | null;
  origin: string | null;
  destination: string | null;
};
type Item = { id: string; description: string; charge_type: string | null; quantity: number; unit_price: number; amount: number };
type Payment = { id: string; amount: number; method: string | null; reference: string | null; paid_at: string };

// Printing shows the invoice card only: the rest of the dashboard is hidden.
const PRINT_CSS = `
@media print {
  @page { margin: 16mm; }
  html, body { background: #fff !important; }
  body * { visibility: hidden !important; }
  #invoice-print, #invoice-print * { visibility: visible !important; }
  #invoice-print { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; border: 0; border-radius: 0; }
}`;

const itemsTable = "w-full min-w-[560px] text-left text-sm print:min-w-0";
const sectionLabel = "text-[13px] text-slate-500";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  if (!createServiceRoleClient()) return <Callout tone="warning" title="The database is not connected." />;

  await refreshOverdueInvoices();
  const [{ rows: invoiceRows }, { rows: items }, { rows: payments }] = await Promise.all([
    query<Invoice>(
      `SELECT i.id, i.invoice_no, i.client_id, i.shipment_id, COALESCE(i.currency, 'USD') AS currency,
              i.subtotal, i.tax, i.total, i.status, i.due_date, i.paid_at, i.notes, i.created_at,
              c.company_name, c.contact_name, c.email AS client_email, c.phone AS client_phone, c.address AS client_address,
              s.shipment_no, s.origin, s.destination
         FROM invoices i
         LEFT JOIN clients c ON c.id = i.client_id
         LEFT JOIN shipments s ON s.id = i.shipment_id
        WHERE i.id = $1`,
      [id],
    ),
    query<Item>(
      "SELECT id, description, charge_type, quantity, unit_price, amount FROM invoice_items WHERE invoice_id = $1 ORDER BY created_at, id",
      [id],
    ),
    query<Payment>("SELECT id, amount, method, reference, paid_at FROM payments WHERE invoice_id = $1 ORDER BY paid_at DESC", [id]),
  ]);

  const invoice = invoiceRows[0];
  if (!invoice) notFound();

  const cur = invoice.currency;
  const total = Number(invoice.total);
  const subtotal = Number(invoice.subtotal);
  const tax = Number(invoice.tax);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const balance = Math.max(Math.round((total - totalPaid) * 100) / 100, 0);
  const taxPercent = subtotal > 0 && tax > 0 ? Math.round((tax / subtotal) * 10000) / 100 : null;

  const { status } = invoice;
  const isOpen = status === "sent" || status === "overdue";
  const canPay = balance > 0 && status !== "void";
  const paidInFull = status !== "void" && total > 0 && balance <= 0;

  return (
    <div className="max-w-4xl">
      <style>{PRINT_CSS}</style>

      <div className="print:hidden">
        <PageHeader
          title={invoice.invoice_no}
          description={`${invoice.company_name || "Unknown client"} · Issued ${formatDate(invoice.created_at)}`}
          back={{ href: "/admin/finance", label: "Finance" }}
          badge={<StatusBadge status={status} />}
          actions={
            <>
              <PrintButton />
              {status !== "void" && status !== "paid" ? <InvoiceStatusButton invoiceId={id} newStatus="void" /> : null}
              {isOpen ? <InvoiceStatusButton invoiceId={id} newStatus="paid" /> : null}
              {status === "draft" ? <InvoiceStatusButton invoiceId={id} newStatus="sent" /> : null}
              {isOpen && canPay ? (
                <a href="#record-payment" className={buttonClass("primary")}>
                  <Wallet size={16} aria-hidden /> Record payment
                </a>
              ) : null}
            </>
          }
        />
      </div>

      <div className="space-y-6">
        <div className="space-y-3 print:hidden">
          {paidInFull ? (
            <Callout tone="success" icon={CheckCircle2} title="Paid in full">
              {money(totalPaid, cur)} received{invoice.paid_at ? `, completed on ${formatDate(invoice.paid_at)}` : ""}. Nothing more is owed on this
              invoice.
            </Callout>
          ) : null}
          {status === "paid" && !paidInFull ? (
            <Callout tone="info" icon={CheckCircle2} title={`Marked as paid${invoice.paid_at ? ` on ${formatDate(invoice.paid_at)}` : ""}`}>
              Payments recorded here add up to {money(totalPaid, cur)} of {money(total, cur)}. Record the rest below to keep the totals accurate.
            </Callout>
          ) : null}
          {status === "overdue" ? (
            <Callout tone="danger" icon={Clock} title="This invoice is overdue">
              Payment was due on {formatDate(invoice.due_date)}. {money(balance, cur)} is still owed.
            </Callout>
          ) : null}
          {status === "void" ? (
            <Callout tone="info" icon={Ban} title="This invoice is void">
              It is kept for the record but is not counted in any totals and can no longer be changed.
            </Callout>
          ) : null}
          {status === "draft" ? (
            <Callout tone="info" title="Draft">
              Only staff can see this invoice. Print or save it as a PDF for the client, then mark it as sent so it counts as money owed.
            </Callout>
          ) : null}
        </div>

        <Card className="print:border-0 print:p-0">
          <div id="invoice-print">
            <div className="mb-8 hidden items-start justify-between gap-6 border-b border-slate-300 pb-6 print:flex">
              <div>
                <p className="text-xl font-medium text-[var(--navy)]">Premium 1 Logistics LTD</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Airport Residential Area, Accra, Ghana
                  <br />
                  info@premium1logistics.com
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-medium text-[var(--navy)]">Invoice</p>
                <p className="mt-1 text-sm tabular-nums text-slate-600">{invoice.invoice_no}</p>
                {status !== "sent" ? <p className="mt-1 text-sm text-slate-600">{statusLabel(status)}</p> : null}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 print:grid-cols-2">
              <div>
                <h2 className={sectionLabel}>Bill to</h2>
                <p className="mt-1 text-base font-medium text-[var(--navy)]">
                  {invoice.company_name ? (
                    <Link href={`/admin/clients/${invoice.client_id}`} className="underline-offset-4 hover:underline">
                      {invoice.company_name}
                    </Link>
                  ) : (
                    "Unknown client"
                  )}
                </p>
                <div className="mt-1 space-y-0.5 text-sm leading-6 text-slate-600">
                  {invoice.contact_name ? <p>{invoice.contact_name}</p> : null}
                  {invoice.client_address ? <p className="whitespace-pre-line">{invoice.client_address}</p> : null}
                  {invoice.client_email ? <p className="break-words">{invoice.client_email}</p> : null}
                  {invoice.client_phone ? <p>{invoice.client_phone}</p> : null}
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:justify-self-end sm:text-right print:justify-self-end print:text-right">
                <div>
                  <dt className={sectionLabel}>Issued</dt>
                  <dd className="mt-0.5 text-[15px] font-medium text-[var(--navy)]">{formatDate(invoice.created_at)}</dd>
                </div>
                <div>
                  <dt className={sectionLabel}>Due</dt>
                  <dd className={cx("mt-0.5 text-[15px] font-medium", status === "overdue" ? "text-red-700" : "text-[var(--navy)]")}>
                    {invoice.due_date ? formatDate(invoice.due_date) : "On receipt"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className={sectionLabel}>Shipment</dt>
                  <dd className="mt-0.5 text-[15px] font-medium text-[var(--navy)]">
                    {invoice.shipment_id && invoice.shipment_no ? (
                      <>
                        <Link href={`/admin/shipments/${invoice.shipment_id}`} className="underline-offset-4 hover:underline">
                          {invoice.shipment_no}
                        </Link>
                        {invoice.origin && invoice.destination ? (
                          <span className="block text-sm font-normal text-slate-600">
                            {invoice.origin} to {invoice.destination}
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span className="font-normal text-slate-500">Not linked</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="-mx-5 mt-8 overflow-x-auto sm:-mx-6 print:mx-0 print:overflow-visible">
              <table className={itemsTable}>
                <thead>
                  <tr>
                    <th className={cx(thClass, "border-t sm:pl-6 print:pl-0")}>Description</th>
                    <th className={cx(thClass, "border-t")}>Type</th>
                    <th className={cx(thClass, "border-t text-right")}>Qty</th>
                    <th className={cx(thClass, "border-t text-right")}>Unit price</th>
                    <th className={cx(thClass, "border-t text-right sm:pr-6 print:pr-0")}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length ? (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td className={cx(tdClass, "text-[var(--navy)] sm:pl-6 print:pl-0")}>{item.description}</td>
                        <td className={cx(tdClass, "whitespace-nowrap")}>{chargeTypeLabel(item.charge_type)}</td>
                        <td className={cx(tdClass, "text-right tabular-nums")}>{Number(item.quantity)}</td>
                        <td className={cx(tdClass, "whitespace-nowrap text-right tabular-nums")}>{money(Number(item.unit_price), cur)}</td>
                        <td className={cx(tdClass, "whitespace-nowrap text-right font-medium tabular-nums text-[var(--navy)] sm:pr-6 print:pr-0")}>
                          {money(Number(item.amount), cur)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className={cx(tdClass, "sm:pl-6")}>
                        This invoice has no line items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <dl className="mt-6 space-y-2 text-sm sm:ml-auto sm:max-w-xs print:ml-auto print:max-w-xs">
              <div className="flex justify-between gap-6">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="tabular-nums text-[var(--navy)]">{money(subtotal, cur)}</dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="text-slate-500">Tax{taxPercent !== null ? ` (${taxPercent}%)` : ""}</dt>
                <dd className="tabular-nums text-[var(--navy)]">{money(tax, cur)}</dd>
              </div>
              <div className="flex justify-between gap-6 border-t border-slate-200 pt-2">
                <dt className="font-medium text-[var(--navy)]">Total</dt>
                <dd className="font-medium tabular-nums text-[var(--navy)]">{money(total, cur)}</dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="text-slate-500">Amount paid</dt>
                <dd className="tabular-nums text-[var(--navy)]">{money(totalPaid, cur)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6 border-t border-slate-300 pt-3">
                <dt className="font-medium text-[var(--navy)]">Balance due</dt>
                <dd
                  className={cx(
                    "text-2xl font-medium tabular-nums tracking-[-0.02em]",
                    status === "void" ? "text-slate-400" : status === "overdue" ? "text-red-700" : balance > 0 ? "text-[var(--navy)]" : "text-emerald-700",
                  )}
                >
                  {money(status === "void" ? 0 : balance, cur)}
                </dd>
              </div>
            </dl>

            {invoice.notes ? (
              <div className="mt-8 border-t border-slate-200 pt-5">
                <h2 className={sectionLabel}>Notes</h2>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{invoice.notes}</p>
              </div>
            ) : null}
          </div>
        </Card>

        <div id="record-payment" className="scroll-mt-24 print:hidden">
          <Card padded={false} className="overflow-hidden">
            <CardHeader
              className="mb-0 px-5 pt-5 sm:px-6"
              title="Payments"
              description={
                payments.length
                  ? `${money(totalPaid, cur)} received in ${payments.length} ${payments.length === 1 ? "payment" : "payments"}.`
                  : "Money received against this invoice."
              }
            />
            {payments.length ? (
              <div className="mt-4 overflow-x-auto border-t border-slate-200">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr>
                      <th className={cx(thClass, "sm:pl-6")}>Date</th>
                      <th className={thClass}>Method</th>
                      <th className={thClass}>Reference</th>
                      <th className={cx(thClass, "text-right sm:pr-6")}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className={cx(tdClass, "whitespace-nowrap sm:pl-6")}>{formatDate(p.paid_at)}</td>
                        <td className={cx(tdClass, "whitespace-nowrap")}>{paymentMethodLabel(p.method)}</td>
                        <td className={cx(tdClass, "break-all")}>{p.reference || "—"}</td>
                        <td className={cx(tdClass, "whitespace-nowrap text-right font-medium tabular-nums text-[var(--navy)] sm:pr-6")}>
                          {money(Number(p.amount), cur)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                compact
                icon={Wallet}
                title="No payments yet"
                description={
                  canPay
                    ? "When the client pays, in full or in part, record it below. The invoice becomes paid once payments cover the total."
                    : "No payments were recorded against this invoice."
                }
              />
            )}
            {canPay ? (
              <div className="border-t border-slate-200 px-5 py-5 sm:px-6">
                <h3 className="mb-4 text-[15px] font-medium text-[var(--navy)]">Record a payment</h3>
                <PaymentForm key={balance} invoiceId={id} action={addPayment} balance={balance} currency={cur} />
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
