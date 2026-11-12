import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { query } from "@/lib/db/pool";
import { formatTotals, refreshOverdueInvoices } from "@/lib/finance";

type InvoiceRow = {
  id: string;
  invoice_no: string;
  client_id: string;
  clients: { company_name: string } | null;
  currency: string | null;
  total: number;
  status: string;
  due_date: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  void: "bg-slate-100 text-slate-400",
};

export default async function FinancePage() {
  const supabase = createServiceRoleClient();
  if (!supabase) return <p className="text-slate-500">The database is not connected.</p>;

  await refreshOverdueInvoices();
  const { data: rawInvoices } = await supabase
    .from("invoices")
    .select("id, invoice_no, client_id, clients(company_name), currency, total, status, due_date, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const invoices = (rawInvoices || []) as unknown as InvoiceRow[];

  // Totals across all invoices (not just the 100 listed), per currency, net of payments.
  const { rows: money } = await query<{ currency: string; invoiced: number; collected: number; outstanding: number; overdue: number }>(
    `SELECT COALESCE(i.currency, 'USD') AS currency,
            SUM(i.total) AS invoiced,
            COALESCE(SUM(p.paid), 0) AS collected,
            COALESCE(SUM(CASE WHEN i.status IN ('sent','overdue') THEN GREATEST(i.total - COALESCE(p.paid, 0), 0) END), 0) AS outstanding,
            COALESCE(SUM(CASE WHEN i.status = 'overdue' THEN GREATEST(i.total - COALESCE(p.paid, 0), 0) END), 0) AS overdue
       FROM invoices i
       LEFT JOIN (SELECT invoice_id, SUM(amount) AS paid FROM payments GROUP BY invoice_id) p ON p.invoice_id = i.id
      WHERE i.status NOT IN ('void', 'draft')
      GROUP BY 1`,
  );
  const per = (k: "invoiced" | "collected" | "outstanding" | "overdue") =>
    formatTotals(money.filter((r) => Number(r[k]) > 0).map((r) => ({ currency: r.currency, total: Number(r[k]) })));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finance & Invoicing</h1>
          <p className="text-sm text-slate-500 mt-0.5">{invoices?.length || 0} invoices</p>
        </div>
        <Link
          href="/admin/finance/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
        >
          <Plus size={16} /> Create Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total invoiced", value: per("invoiced"), color: "text-slate-800" },
          { label: "Collected", value: per("collected"), color: "text-emerald-600" },
          { label: "Outstanding", value: per("outstanding"), color: "text-amber-600" },
          { label: "Overdue", value: per("overdue"), color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className={`mt-1 text-xl font-bold leading-tight sm:text-2xl ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Invoice</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">Due</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(invoices || []).length > 0 ? (
                invoices.map((inv) => {
                  const client = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3">
                        <Link href={`/admin/finance/${inv.id}`} className="font-semibold text-slate-800 hover:text-[var(--accent)]">
                          {inv.invoice_no}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{client?.company_name || "—"}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {inv.currency} {Number(inv.total).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[inv.status] || ""}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/finance/${inv.id}`} className="text-slate-400 group-hover:text-[var(--accent)]">
                          <ArrowUpRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No invoices yet. Create your first invoice.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
