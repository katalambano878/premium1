import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowUpRight, Crown, Plus } from "lucide-react";

const TIER_COLORS: Record<string, string> = {
  vip: "bg-amber-100 text-amber-700",
  standard: "bg-slate-100 text-slate-600",
  new: "bg-blue-100 text-blue-700",
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = createServiceRoleClient();
  if (!supabase) return <p className="text-slate-500">The database is not connected.</p>;

  let query = supabase
    .from("clients")
    .select("id, company_name, contact_name, email, phone, tier, industry, credit_limit, created_at")
    .order("company_name")
    .limit(100);

  if (params.tier) query = query.eq("tier", params.tier);

  const { data: clients } = await query;

  const filtered = params.q
    ? (clients || []).filter(
        (c) =>
          c.company_name?.toLowerCase().includes(params.q!.toLowerCase()) ||
          c.contact_name?.toLowerCase().includes(params.q!.toLowerCase()) ||
          c.email?.toLowerCase().includes(params.q!.toLowerCase())
      )
    : clients || [];

  const tierCounts: Record<string, number> = {};
  (clients || []).forEach((c) => {
    const t = c.tier || "standard";
    tierCounts[t] = (tierCounts[t] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client CRM</h1>
          <p className="text-sm text-slate-500 mt-0.5">{clients?.length || 0} clients</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
        >
          <Plus size={16} /> New Client
        </Link>
      </div>

      {/* Tier Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/admin/clients"
          className={`px-4 py-2 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all ${
            !params.tier ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600"
          }`}
        >
          All ({clients?.length || 0})
        </Link>
        {["vip", "standard", "new"].map((tier) => (
          <Link
            key={tier}
            href={params.tier === tier ? "/admin/clients" : `/admin/clients?tier=${tier}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all ${
              params.tier === tier
                ? TIER_COLORS[tier]
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            {tier === "vip" && <Crown size={13} />}
            <span className="uppercase">{tier}</span>
            <span className="text-xs bg-black/5 px-1.5 py-0.5 rounded-md">{tierCounts[tier] || 0}</span>
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden lg:table-cell">Industry</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Tier</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">Credit</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/admin/clients/${c.id}`} className="font-semibold text-slate-800 hover:text-[var(--accent)]">
                        {c.company_name}
                      </Link>
                      <p className="text-[11px] text-slate-400">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{c.contact_name}</td>
                    <td className="px-4 py-3 text-slate-500 capitalize hidden lg:table-cell">{c.industry || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${TIER_COLORS[c.tier || "standard"]}`}>
                        {c.tier || "standard"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden sm:table-cell">
                      {c.credit_limit ? `$${Number(c.credit_limit).toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/clients/${c.id}`} className="text-slate-400 group-hover:text-[var(--accent)]">
                        <ArrowUpRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No clients found.
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
