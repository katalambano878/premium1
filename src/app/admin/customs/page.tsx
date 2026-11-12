import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-blue-100 text-blue-700",
  query: "bg-amber-100 text-amber-700",
  amended: "bg-purple-100 text-purple-700",
  released: "bg-emerald-100 text-emerald-700",
};

export default async function CustomsPage() {
  const supabase = createServiceRoleClient();
  if (!supabase) return <p className="text-slate-500">The database is not connected.</p>;

  const { data: declarations } = await supabase
    .from("customs_declarations")
    .select("id, declaration_no, shipment_id, shipments(shipment_no), status, duty_amount, tax_amount, submitted_at, released_at, query_deadline, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const statusCounts: Record<string, number> = {};
  (declarations || []).forEach((d) => {
    statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customs Workspace</h1>
          <p className="text-sm text-slate-500 mt-0.5">{declarations?.length || 0} declarations</p>
        </div>
        <Link
          href="/admin/customs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
        >
          <Plus size={16} /> New Declaration
        </Link>
      </div>

      {/* Status Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["draft", "submitted", "query", "amended", "released"].map((status) => (
          <div key={status} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold whitespace-nowrap ${STATUS_COLORS[status]}`}>
            <span className="capitalize">{status}</span>
            <span className="text-xs bg-black/5 px-1.5 py-0.5 rounded-md">{statusCounts[status] || 0}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Declaration #</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Shipment</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Duty</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Tax</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(declarations || []).length > 0 ? (
                (declarations || []).map((d) => {
                  const ship = Array.isArray(d.shipments) ? d.shipments[0] : d.shipments;
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3">
                        <Link href={`/admin/customs/${d.id}`} className="font-semibold text-slate-800 hover:text-[var(--accent)]">
                          {d.declaration_no || "Draft"}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {ship?.shipment_no ? (
                          <Link href={`/admin/shipments/${d.shipment_id}`} className="text-[var(--accent)] text-xs font-semibold hover:underline">
                            {ship.shipment_no}
                          </Link>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[d.status] || ""}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                        {d.duty_amount ? `$${Number(d.duty_amount).toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                        {d.tax_amount ? `$${Number(d.tax_amount).toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">
                        {new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/customs/${d.id}`} className="text-slate-400 group-hover:text-[var(--accent)]">
                          <ArrowUpRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No customs declarations yet.
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
