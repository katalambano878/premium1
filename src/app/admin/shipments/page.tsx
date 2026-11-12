import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  booked: "bg-blue-100 text-blue-700",
  in_transit: "bg-amber-100 text-amber-700",
  arrived: "bg-cyan-100 text-cyan-700",
  clearing: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-emerald-100 text-emerald-700",
};

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const supabase = createServiceRoleClient();
  if (!supabase) return <p className="text-slate-500">The database is not connected.</p>;

  let query = supabase
    .from("shipments")
    .select("id, shipment_no, origin, destination, status, method, vessel_name, created_at, clients(company_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (params.status) query = query.eq("status", params.status);

  const { data: shipments } = await query;

  const statusCounts: Record<string, number> = {};
  (shipments || []).forEach((s) => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });

  const stages = ["draft", "booked", "in_transit", "arrived", "clearing", "out_for_delivery", "delivered"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shipment Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{shipments?.length || 0} shipments</p>
        </div>
        <Link
          href="/admin/shipments/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
        >
          <Plus size={16} /> New Shipment
        </Link>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/admin/shipments"
          className={`px-4 py-2.5 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all ${
            !params.status ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          All
        </Link>
        {stages.map((status) => (
          <Link
            key={status}
            href={params.status === status ? "/admin/shipments" : `/admin/shipments?status=${status}`}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all ${
              params.status === status
                ? STATUS_COLORS[status]
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <span className="capitalize">{status.replace(/_/g, " ")}</span>
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Shipment</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Route</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Method</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(shipments || []).length > 0 ? (
                (shipments || []).map((s) => {
                  const client = Array.isArray(s.clients) ? s.clients[0] : s.clients;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3">
                        <Link href={`/admin/shipments/${s.id}`} className="font-semibold text-slate-800 hover:text-[var(--accent)]">
                          {s.shipment_no}
                        </Link>
                        {s.vessel_name && <p className="text-[11px] text-slate-400">{s.vessel_name}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700">{s.origin} → {s.destination}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{client?.company_name || "—"}</td>
                      <td className="px-4 py-3 text-slate-500 capitalize hidden md:table-cell">{s.method}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[s.status] || "bg-slate-100 text-slate-600"}`}>
                          {s.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">
                        {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/shipments/${s.id}`} className="text-slate-400 group-hover:text-[var(--accent)]">
                          <ArrowUpRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No shipments found.
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
