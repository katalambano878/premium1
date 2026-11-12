import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { InquiryFilters } from "@/components/admin/InquiryFilters";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  contacted: "bg-amber-100 text-amber-700 border-amber-200",
  quoted: "bg-purple-100 text-purple-700 border-purple-200",
  won: "bg-emerald-100 text-emerald-700 border-emerald-200",
  lost: "bg-slate-100 text-slate-500 border-slate-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-50 text-red-600 border-red-200",
  high: "bg-orange-50 text-orange-600 border-orange-200",
  medium: "bg-slate-50 text-slate-500 border-slate-200",
  low: "bg-slate-50 text-slate-400 border-slate-100",
};

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = createServiceRoleClient();
  if (!supabase) return <p className="text-slate-500">The database is not connected.</p>;

  let query = supabase
    .from("inquiries")
    .select("id, inquiry_no, full_name, company_name, email, phone, status, priority, source, estimated_value, created_at, follow_up_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (params.status) query = query.eq("status", params.status);
  if (params.priority) query = query.eq("priority", params.priority);

  const { data: inquiries } = await query;

  const filtered = params.q
    ? (inquiries || []).filter(
        (i) =>
          i.full_name?.toLowerCase().includes(params.q!.toLowerCase()) ||
          i.company_name?.toLowerCase().includes(params.q!.toLowerCase()) ||
          i.inquiry_no?.toLowerCase().includes(params.q!.toLowerCase()) ||
          i.email?.toLowerCase().includes(params.q!.toLowerCase())
      )
    : inquiries || [];

  // Pipeline summary
  const statusCounts: Record<string, number> = {};
  (inquiries || []).forEach((i) => {
    statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inquiry Pipeline</h1>
          <p className="text-sm text-slate-500 mt-0.5">{inquiries?.length || 0} total inquiries</p>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["new", "contacted", "quoted", "won", "lost"].map((status) => (
          <Link
            key={status}
            href={params.status === status ? "/admin/inquiries" : `/admin/inquiries?status=${status}`}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all whitespace-nowrap ${
              params.status === status
                ? STATUS_COLORS[status]
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <span className="capitalize">{status}</span>
            <span className="text-xs bg-black/5 px-1.5 py-0.5 rounded-md">{statusCounts[status] || 0}</span>
          </Link>
        ))}
      </div>

      {/* Filters */}
      <InquiryFilters currentStatus={params.status} currentPriority={params.priority} currentSearch={params.q} />

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Inquiry</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Contact</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Source</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden lg:table-cell">Value</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length > 0 ? (
                filtered.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/admin/inquiries/${inq.id}`} className="font-semibold text-slate-800 hover:text-[var(--accent)]">
                        {inq.inquiry_no}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{inq.full_name}</p>
                      <p className="text-xs text-slate-400">{inq.company_name || inq.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-slate-500 capitalize">{inq.source || "website"}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {inq.estimated_value ? (
                        <span className="font-semibold text-slate-700">${Number(inq.estimated_value).toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${PRIORITY_COLORS[inq.priority] || PRIORITY_COLORS.medium}`}>
                        {inq.priority || "medium"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${STATUS_COLORS[inq.status] || ""}`}>
                        {inq.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">
                      {new Date(inq.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/inquiries/${inq.id}`} className="text-slate-400 group-hover:text-[var(--accent)]">
                        <ArrowUpRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    No inquiries found.
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
