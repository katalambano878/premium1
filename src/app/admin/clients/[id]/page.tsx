import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard, FileText, Mail, MessageCircle, MessageSquare, Package, Plus, Receipt, Wallet } from "lucide-react";
import { NoteForm } from "@/components/admin/NoteForm";
import { EditClientDialog } from "@/components/admin/clients/EditClientDialog";
import { paymentTermsLabel, whatsappNumber } from "@/components/admin/clients/options";
import { isUuid } from "@/components/admin/finance/format";
import {
  ButtonLink,
  Callout,
  Card,
  CardHeader,
  CardLink,
  DetailList,
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
  buttonClass,
  cx,
  formatDate,
  formatDateTime,
  rowLinkClass,
  tdClass,
  thClass,
  timeAgo,
  trClass,
} from "@/components/admin/ui";
import { query } from "@/lib/db/pool";
import { formatTotals, money, refreshOverdueInvoices, totalsByCurrency } from "@/lib/finance";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { addClientNote, updateClient } from "../actions";

type Client = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string | null;
  notes: string | null;
  tier: string | null;
  industry: string | null;
  credit_limit: number | null;
  payment_terms: string | null;
  created_at: string;
};
type ShipmentRow = { id: string; shipment_no: string; origin: string; destination: string; status: string; created_at: string };
type InvoiceRow = {
  id: string;
  invoice_no: string;
  currency: string;
  total: number;
  paid: number;
  status: string;
  due_date: string | null;
  created_at: string;
};
type NoteRow = { id: string; body: string; created_at: string; full_name: string | null };

const SHIPMENT_LIMIT = 10;
const innerTable = "w-full min-w-[520px] text-left text-sm";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  if (!createServiceRoleClient()) return <Callout tone="warning" title="The database is not connected." />;

  await refreshOverdueInvoices();
  const [{ rows: clientRows }, { rows: shipments }, { rows: shipmentCount }, { rows: invoices }, { rows: notes }] = await Promise.all([
    query<Client>(
      `SELECT id, company_name, contact_name, email, phone, address, notes, tier, industry, credit_limit, payment_terms, created_at
         FROM clients WHERE id = $1`,
      [id],
    ),
    query<ShipmentRow>(
      `SELECT id, shipment_no, origin, destination, status, created_at
         FROM shipments WHERE client_id = $1 ORDER BY created_at DESC LIMIT ${SHIPMENT_LIMIT}`,
      [id],
    ),
    query<{ n: number }>("SELECT COUNT(*)::int AS n FROM shipments WHERE client_id = $1", [id]),
    query<InvoiceRow>(
      `SELECT i.id, i.invoice_no, COALESCE(i.currency, 'USD') AS currency, i.total, COALESCE(p.paid, 0) AS paid,
              i.status, i.due_date, i.created_at
         FROM invoices i
         LEFT JOIN (SELECT invoice_id, SUM(amount) AS paid FROM payments GROUP BY invoice_id) p ON p.invoice_id = i.id
        WHERE i.client_id = $1
        ORDER BY i.created_at DESC`,
      [id],
    ),
    query<NoteRow>(
      `SELECT n.id, n.body, n.created_at, s.full_name
         FROM client_notes n
         LEFT JOIN staff_users s ON s.id = n.author_id
        WHERE n.client_id = $1
        ORDER BY n.created_at DESC`,
      [id],
    ),
  ]);

  const client = clientRows[0];
  if (!client) notFound();

  const tier = client.tier || "standard";
  const totalShipments = shipmentCount[0]?.n || 0;
  const balanceOf = (inv: InvoiceRow) => Math.max(Number(inv.total) - Number(inv.paid), 0);

  // Money is kept per currency: different currencies are never added together.
  const open = invoices.filter((inv) => inv.status === "sent" || inv.status === "overdue");
  const openTotals = totalsByCurrency(open, balanceOf, (inv) => inv.currency).filter((t) => t.total > 0);
  const paidTotals = totalsByCurrency(
    invoices.filter((inv) => inv.status !== "void"),
    (inv) => Number(inv.paid),
    (inv) => inv.currency,
  ).filter((t) => t.total > 0);
  const overdueCount = open.filter((inv) => inv.status === "overdue").length;

  const creditLimit = client.credit_limit === null ? null : Number(client.credit_limit);
  const openUsd = openTotals.find((t) => t.currency === "USD")?.total || 0;
  const overLimit = creditLimit !== null && creditLimit > 0 && openUsd > creditLimit;

  const whatsapp = whatsappNumber(client.phone);
  const description = [client.contact_name, client.industry].filter(Boolean).join(" · ");

  return (
    <div className="max-w-6xl">
      <PageHeader
        title={client.company_name}
        description={description || undefined}
        back={{ href: "/admin/clients", label: "Clients" }}
        badge={<StatusBadge status={tier} />}
        actions={
          <>
            <a href={`mailto:${client.email}`} className={buttonClass("secondary")}>
              <Mail size={16} aria-hidden /> Email
            </a>
            {whatsapp ? (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary")}>
                <MessageCircle size={16} aria-hidden /> WhatsApp
              </a>
            ) : null}
            <ButtonLink href={`/admin/finance/new?client=${client.id}`} variant="secondary">
              <Plus size={16} aria-hidden /> New invoice
            </ButtonLink>
            <ButtonLink href={`/admin/shipments/new?client=${client.id}`}>
              <Plus size={16} aria-hidden /> New shipment
            </ButtonLink>
          </>
        }
      />

      <div className="space-y-6">
        {overLimit && creditLimit !== null ? (
          <Callout tone="warning" title="Over the credit limit">
            This client owes {money(openUsd, "USD")} against a limit of {money(creditLimit, "USD")}. Collect payment before taking on more work on
            credit.
          </Callout>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Shipments" value={totalShipments} icon={Package} hint={totalShipments ? "All time" : "None yet"} />
          <StatCard
            label="Open invoices"
            value={formatTotals(openTotals)}
            icon={Receipt}
            tone={overdueCount ? "bad" : openTotals.length ? "warn" : "default"}
            hint={
              open.length
                ? `${open.length} unpaid${overdueCount ? `, ${overdueCount} overdue` : ""}`
                : "Nothing waiting to be paid"
            }
          />
          <StatCard label="Total paid" value={formatTotals(paidTotals)} icon={Wallet} tone={paidTotals.length ? "good" : "default"} hint="Payments received" />
          <StatCard
            label="Credit limit"
            value={creditLimit !== null && creditLimit > 0 ? money(creditLimit, "USD") : "Not set"}
            icon={CreditCard}
            hint={`Terms: ${paymentTermsLabel(client.payment_terms)}`}
          />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="min-w-0 space-y-6 lg:col-span-2">
            <Card padded={false} className="overflow-hidden">
              <CardHeader
                className="mb-0 px-5 pt-5 sm:px-6"
                title="Shipments"
                description={
                  totalShipments > shipments.length ? `Latest ${shipments.length} of ${totalShipments}` : "Cargo we have moved for this client."
                }
                action={<CardLink href={`/admin/shipments/new?client=${client.id}`}>New shipment</CardLink>}
              />
              {shipments.length ? (
                <div className="mt-4 overflow-x-auto border-t border-slate-200">
                  <table className={innerTable}>
                    <thead>
                      <tr>
                        <th className={thClass}>Shipment</th>
                        <th className={thClass}>Route</th>
                        <th className={thClass}>Status</th>
                        <th className={thClass}>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipments.map((s) => (
                        <tr key={s.id} className={trClass}>
                          <td className={cx(tdClass, "whitespace-nowrap")}>
                            <Link href={`/admin/shipments/${s.id}`} className={rowLinkClass}>
                              {s.shipment_no}
                            </Link>
                          </td>
                          <td className={tdClass}>
                            {s.origin} to {s.destination}
                          </td>
                          <td className={tdClass}>
                            <StatusBadge status={s.status} />
                          </td>
                          <td className={cx(tdClass, "whitespace-nowrap")}>{formatDate(s.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  compact
                  icon={Package}
                  title="No shipments yet"
                  description="When you book cargo for this client it will be listed here with its status."
                  action={
                    <ButtonLink href={`/admin/shipments/new?client=${client.id}`} variant="secondary" size="sm">
                      <Plus size={14} aria-hidden /> New shipment
                    </ButtonLink>
                  }
                />
              )}
            </Card>

            <Card padded={false} className="overflow-hidden">
              <CardHeader
                className="mb-0 px-5 pt-5 sm:px-6"
                title="Invoices"
                description="What this client has been billed and what is still owed."
                action={<CardLink href={`/admin/finance/new?client=${client.id}`}>New invoice</CardLink>}
              />
              {invoices.length ? (
                <div className="mt-4 overflow-x-auto border-t border-slate-200">
                  <table className={innerTable}>
                    <thead>
                      <tr>
                        <th className={thClass}>Invoice</th>
                        <th className={cx(thClass, "text-right")}>Amount</th>
                        <th className={cx(thClass, "text-right")}>Balance</th>
                        <th className={thClass}>Status</th>
                        <th className={thClass}>Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id} className={trClass}>
                          <td className={cx(tdClass, "whitespace-nowrap")}>
                            <Link href={`/admin/finance/${inv.id}`} className={rowLinkClass}>
                              {inv.invoice_no}
                            </Link>
                          </td>
                          <td className={cx(tdClass, "whitespace-nowrap text-right tabular-nums text-[var(--navy)]")}>
                            {money(Number(inv.total), inv.currency)}
                          </td>
                          <td className={cx(tdClass, "whitespace-nowrap text-right tabular-nums")}>
                            {inv.status === "void" || inv.status === "paid" ? "—" : money(balanceOf(inv), inv.currency)}
                          </td>
                          <td className={tdClass}>
                            <StatusBadge status={inv.status} />
                          </td>
                          <td className={cx(tdClass, "whitespace-nowrap", inv.status === "overdue" && "font-medium text-red-700")}>
                            {formatDate(inv.due_date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  compact
                  icon={FileText}
                  title="No invoices yet"
                  description="Bill this client for freight, customs or handling and track what they have paid."
                  action={
                    <ButtonLink href={`/admin/finance/new?client=${client.id}`} variant="secondary" size="sm">
                      <Plus size={14} aria-hidden /> New invoice
                    </ButtonLink>
                  }
                />
              )}
            </Card>
          </div>

          <div className="min-w-0 space-y-6">
            <Card as="aside">
              <CardHeader title="Contact and account" action={<EditClientDialog action={updateClient} client={client} />} />
              <DetailList
                columns={1}
                items={[
                  { label: "Main contact", value: client.contact_name },
                  {
                    label: "Email",
                    value: (
                      <a href={`mailto:${client.email}`} className="text-[var(--accent-ink)] underline-offset-4 hover:underline">
                        {client.email}
                      </a>
                    ),
                  },
                  {
                    label: "Phone",
                    value: (
                      <a href={`tel:${client.phone.replace(/[^\d+]/g, "")}`} className="text-[var(--accent-ink)] underline-offset-4 hover:underline">
                        {client.phone}
                      </a>
                    ),
                  },
                  { label: "Address", value: client.address },
                  { label: "Industry", value: client.industry },
                  { label: "Payment terms", value: paymentTermsLabel(client.payment_terms) },
                  { label: "Client since", value: formatDate(client.created_at) },
                  {
                    label: "Background",
                    value: client.notes ? <span className="whitespace-pre-wrap font-normal text-slate-600">{client.notes}</span> : null,
                  },
                ]}
              />
            </Card>

            <Card as="aside">
              <CardHeader title="Notes" description="Calls, agreements and anything the next person should know." />
              <NoteForm action={addClientNote} entityId={client.id} fieldName="client_id" placeholder="Write a note about this client…" />
              {notes.length ? (
                <ul className="mt-5 space-y-4">
                  {notes.map((n) => (
                    <li key={n.id} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{n.body}</p>
                      <p className="mt-1 text-[13px] text-slate-500">
                        {n.full_name || "Former staff member"} · <time dateTime={n.created_at} title={formatDateTime(n.created_at)}>{timeAgo(n.created_at)}</time>
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact icon={MessageSquare} title="No notes yet" description="Add the first note above so the team shares the same picture." />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
