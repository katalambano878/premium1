import Link from "next/link";
import { AlertTriangle, Banknote, FileText, Hourglass, Plus, Receipt, SearchX } from "lucide-react";
import {
  ButtonLink,
  Callout,
  EmptyState,
  FilterTabs,
  PageHeader,
  StatCard,
  StatusBadge,
  TableCard,
  cx,
  formatDate,
  rowLinkClass,
  statusLabel,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "@/components/admin/ui";
import { query } from "@/lib/db/pool";
import { money, refreshOverdueInvoices } from "@/lib/finance";
import { MoneyLines } from "@/components/admin/MoneyLines";
import { createServiceRoleClient } from "@/lib/supabase/server";

const STATUSES = ["draft", "sent", "overdue", "paid", "void"];
const LIMIT = 200;

type InvoiceRow = {
  id: string;
  invoice_no: string;
  client_id: string;
  company_name: string | null;
  currency: string;
  total: number;
  paid: number;
  status: string;
  due_date: string | null;
  created_at: string;
};

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  if (!createServiceRoleClient()) return <Callout tone="warning" title="The database is not connected." />;

  const status = STATUSES.includes(params.status || "") ? (params.status as string) : null;

  await refreshOverdueInvoices();
  const [{ rows: invoices }, { rows: counts }, { rows: totals }] = await Promise.all([
    query<InvoiceRow>(
      `SELECT i.id, i.invoice_no, i.client_id, c.company_name, COALESCE(i.currency, 'USD') AS currency,
              i.total, COALESCE(p.paid, 0) AS paid, i.status, i.due_date, i.created_at
         FROM invoices i
         LEFT JOIN clients c ON c.id = i.client_id
         LEFT JOIN (SELECT invoice_id, SUM(amount) AS paid FROM payments GROUP BY invoice_id) p ON p.invoice_id = i.id
        WHERE ($1::text IS NULL OR i.status = $1)
        ORDER BY i.created_at DESC
        LIMIT ${LIMIT + 1}`,
      [status],
    ),
    query<{ status: string; n: number }>("SELECT status, COUNT(*)::int AS n FROM invoices GROUP BY 1"),
    // Totals across all invoices (not just the ones listed), per currency, net of payments.
    query<{ currency: string; invoiced: number; collected: number; outstanding: number; overdue: number }>(
      `SELECT COALESCE(i.currency, 'USD') AS currency,
              SUM(i.total) AS invoiced,
              COALESCE(SUM(p.paid), 0) AS collected,
              COALESCE(SUM(CASE WHEN i.status IN ('sent','overdue') THEN GREATEST(i.total - COALESCE(p.paid, 0), 0) END), 0) AS outstanding,
              COALESCE(SUM(CASE WHEN i.status = 'overdue' THEN GREATEST(i.total - COALESCE(p.paid, 0), 0) END), 0) AS overdue
         FROM invoices i
         LEFT JOIN (SELECT invoice_id, SUM(amount) AS paid FROM payments GROUP BY invoice_id) p ON p.invoice_id = i.id
        WHERE i.status NOT IN ('void', 'draft')
        GROUP BY 1`,
    ),
  ]);

  const per = (k: "invoiced" | "collected" | "outstanding" | "overdue") =>
    <MoneyLines totals={totals.filter((r) => Number(r[k]) > 0).map((r) => ({ currency: r.currency, total: Number(r[k]) }))} />;
  const has = (k: "collected" | "outstanding" | "overdue") => totals.some((r) => Number(r[k]) > 0);

  const total = counts.reduce((sum, c) => sum + c.n, 0);
  const countFor = (value: string) => counts.find((c) => c.status === value)?.n || 0;
  const shown = invoices.slice(0, LIMIT);

  const newInvoice = (
    <ButtonLink href="/admin/finance/new">
      <Plus size={16} aria-hidden /> New invoice
    </ButtonLink>
  );

  return (
    <div>
      <PageHeader title="Finance" description="Invoices, what has been paid and what is still owed." actions={newInvoice} />

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total invoiced" value={per("invoiced")} icon={Receipt} hint="Sent, overdue and paid invoices" />
          <StatCard label="Collected" value={per("collected")} icon={Banknote} tone={has("collected") ? "good" : "default"} hint="Payments received" />
          <StatCard
            label="Outstanding"
            value={per("outstanding")}
            icon={Hourglass}
            tone={has("outstanding") ? "warn" : "default"}
            hint="Billed but not yet paid"
            href="/admin/finance?status=sent"
          />
          <StatCard
            label="Overdue"
            value={per("overdue")}
            icon={AlertTriangle}
            tone={has("overdue") ? "bad" : "default"}
            hint="Past the due date"
            href="/admin/finance?status=overdue"
          />
        </div>

        {total === 0 ? (
          <TableCard>
            <EmptyState
              icon={FileText}
              title="No invoices yet"
              description="An invoice bills a client for freight, customs or handling. Create one, mark it as sent, then record payments as they come in."
              action={newInvoice}
            />
          </TableCard>
        ) : (
          <div className="space-y-4">
            <FilterTabs
              items={[
                { label: "All", href: "/admin/finance", count: total, active: !status },
                ...STATUSES.map((s) => ({
                  label: statusLabel(s),
                  href: `/admin/finance?status=${s}`,
                  count: countFor(s),
                  active: status === s,
                })),
              ]}
            />

            <TableCard
              footer={
                shown.length
                  ? invoices.length > LIMIT
                    ? `Showing the latest ${LIMIT} invoices. Use the status filters to narrow the list.`
                    : `${shown.length} ${shown.length === 1 ? "invoice" : "invoices"}`
                  : undefined
              }
            >
              {shown.length ? (
                <table className={cx(tableClass, "min-w-[860px]")}>
                  <thead>
                    <tr>
                      <th className={thClass}>Invoice</th>
                      <th className={thClass}>Client</th>
                      <th className={cx(thClass, "text-right")}>Amount</th>
                      <th className={cx(thClass, "text-right")}>Paid so far</th>
                      <th className={cx(thClass, "text-right")}>Balance</th>
                      <th className={thClass}>Status</th>
                      <th className={thClass}>Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((inv) => {
                      const paid = Number(inv.paid);
                      const balance = Math.max(Number(inv.total) - paid, 0);
                      const settled = inv.status === "void" || inv.status === "paid";
                      return (
                        <tr key={inv.id} className={trClass}>
                          <td className={cx(tdClass, "whitespace-nowrap")}>
                            <Link href={`/admin/finance/${inv.id}`} className={rowLinkClass}>
                              {inv.invoice_no}
                            </Link>
                            <p className="text-[13px] text-slate-500">Issued {formatDate(inv.created_at)}</p>
                          </td>
                          <td className={tdClass}>
                            {inv.company_name ? (
                              <Link href={`/admin/clients/${inv.client_id}`} className="text-[var(--navy)] underline-offset-4 hover:underline">
                                {inv.company_name}
                              </Link>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className={cx(tdClass, "whitespace-nowrap text-right font-medium tabular-nums text-[var(--navy)]")}>
                            {money(Number(inv.total), inv.currency)}
                          </td>
                          <td className={cx(tdClass, "whitespace-nowrap text-right tabular-nums")}>{paid > 0 ? money(paid, inv.currency) : "—"}</td>
                          <td className={cx(tdClass, "whitespace-nowrap text-right tabular-nums", !settled && balance > 0 && "text-[var(--navy)]")}>
                            {settled ? "—" : money(balance, inv.currency)}
                          </td>
                          <td className={tdClass}>
                            <StatusBadge status={inv.status} />
                          </td>
                          <td className={cx(tdClass, "whitespace-nowrap", inv.status === "overdue" && "font-medium text-red-700")}>
                            {inv.due_date ? formatDate(inv.due_date) : "No due date"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <EmptyState
                  icon={SearchX}
                  title={`No ${statusLabel(status).toLowerCase()} invoices`}
                  description="Nothing has this status right now. Show all invoices to see the rest."
                  action={
                    <ButtonLink href="/admin/finance" variant="secondary">
                      Show all invoices
                    </ButtonLink>
                  }
                />
              )}
            </TableCard>
          </div>
        )}
      </div>
    </div>
  );
}
