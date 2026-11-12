import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Box,
  CircleDollarSign,
  Clock,
  FileText,
  Inbox,
  Plus,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { getSessionUser } from "@/lib/auth/session";
import { canAccess } from "@/lib/auth/roles";
import { query } from "@/lib/db/pool";
import { formatTotals, money, refreshOverdueInvoices } from "@/lib/finance";

type MoneyRow = { currency: string; received: number; outstanding: number; overdue: number };

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  quoted: "bg-purple-100 text-purple-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-slate-100 text-slate-500",
  draft: "bg-slate-100 text-slate-600",
  booked: "bg-blue-100 text-blue-700",
  in_transit: "bg-amber-100 text-amber-700",
  arrived: "bg-cyan-100 text-cyan-700",
  clearing: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-emerald-100 text-emerald-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  void: "bg-slate-100 text-slate-400",
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
};

export default async function AdminDashboard() {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return <div className="p-8 text-slate-500">The database is not connected.</div>;
  }

  const me = await getSessionUser();
  const showFinance = !!me && canAccess(me.role, "finance");
  if (showFinance) await refreshOverdueInvoices();

  const now = new Date();
  const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString();

  const [
    { count: inquiryCount },
    { count: shipmentCount },
    { count: clientCount },
    { data: invoiceStats },
    { data: allInquiries },
    { data: recentInquiries },
    { data: recentShipments },
    { data: recentActivity },
    { data: shipmentsByStatus },
    { data: overdueFollowUps },
    { data: customsQueries },
    { data: overdueInvoices },
  ] = await Promise.all([
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
    supabase.from("shipments").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    // Money per currency: payments received, and what is still owed on open invoices.
    showFinance
      ? query<MoneyRow>(
          `SELECT i.currency,
                  COALESCE(SUM(p.paid), 0) AS received,
                  COALESCE(SUM(CASE WHEN i.status IN ('sent','overdue') THEN GREATEST(i.total - COALESCE(p.paid, 0), 0) END), 0) AS outstanding,
                  COALESCE(SUM(CASE WHEN i.status = 'overdue' THEN GREATEST(i.total - COALESCE(p.paid, 0), 0) END), 0) AS overdue
             FROM invoices i
             LEFT JOIN (SELECT invoice_id, SUM(amount) AS paid FROM payments GROUP BY invoice_id) p ON p.invoice_id = i.id
            WHERE i.status <> 'void'
            GROUP BY i.currency`,
        ).then((r) => ({ data: r.rows }))
      : Promise.resolve({ data: [] as MoneyRow[] }),
    supabase.from("inquiries").select("status, estimated_value, created_at").gte("created_at", yearAgo),
    supabase
      .from("inquiries")
      .select("id, inquiry_no, full_name, company_name, status, priority, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("shipments")
      .select("id, shipment_no, origin, destination, status, method, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("activity_log")
      .select("id, entity_type, action, actor_email, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(15),
    supabase.from("shipments").select("status"),
    supabase
      .from("inquiries")
      .select("id, inquiry_no, full_name, follow_up_at")
      .lt("follow_up_at", now.toISOString())
      .not("follow_up_at", "is", null)
      .not("status", "in", "(won,lost)")
      .limit(5),
    supabase
      .from("customs_declarations")
      .select("id, declaration_no, query_deadline")
      .eq("status", "query")
      .limit(5),
    showFinance
      ? supabase.from("invoices").select("id, invoice_no, total, currency, due_date, client_id").eq("status", "overdue").limit(5)
      : Promise.resolve({ data: [] }),
  ]);

  // Pipeline counts
  const pipelineCounts: Record<string, number> = {};
  (allInquiries || []).forEach((i: { status: string }) => {
    pipelineCounts[i.status] = (pipelineCounts[i.status] || 0) + 1;
  });

  // Shipment pipeline counts
  const shipmentPipeline: Record<string, number> = {};
  (shipmentsByStatus || []).forEach((s: { status: string }) => {
    shipmentPipeline[s.status] = (shipmentPipeline[s.status] || 0) + 1;
  });

  // Money totals, kept per currency (never added across currencies)
  const pick = (k: "received" | "outstanding" | "overdue") =>
    ((invoiceStats || []) as MoneyRow[])
      .filter((r) => Number(r[k]) > 0)
      .map((r) => ({ currency: r.currency || "USD", total: Number(r[k]) }));
  const revenueLabel = formatTotals(pick("received"));
  const outstandingLabel = formatTotals(pick("outstanding"));
  const overdueTotals = pick("overdue");

  // Monthly inquiry data for chart
  const monthlyInquiries: Record<string, number> = {};
  (allInquiries || []).forEach((i: { created_at: string }) => {
    const m = i.created_at?.slice(0, 7);
    if (m) monthlyInquiries[m] = (monthlyInquiries[m] || 0) + 1;
  });

  const exceptions = [
    ...(overdueFollowUps || []).map((f: { id: string; inquiry_no: string; full_name: string }) => ({
      type: "follow_up",
      label: `Overdue follow-up: ${f.inquiry_no}`,
      sub: f.full_name,
      href: `/admin/inquiries/${f.id}`,
    })),
    ...(customsQueries || []).map((c: { id: string; declaration_no: string }) => ({
      type: "customs",
      label: `Customs query: ${c.declaration_no || "Pending"}`,
      sub: "Needs response",
      href: `/admin/customs/${c.id}`,
    })),
    ...((overdueInvoices || []) as { id: string; invoice_no: string; total: number; currency: string }[]).map((inv) => ({
      type: "invoice",
      label: `Overdue: ${inv.invoice_no}`,
      sub: money(Number(inv.total), inv.currency),
      href: `/admin/finance/${inv.id}`,
    })),
  ];

  const activeShipments = (shipmentsByStatus || []).filter(
    (s: { status: string }) => !["draft", "delivered"].includes(s.status)
  ).length;

  const pendingInquiries = (pipelineCounts["new"] || 0) + (pipelineCounts["contacted"] || 0);

  const shipmentStages = ["draft", "booked", "in_transit", "arrived", "clearing", "out_for_delivery", "delivered"];
  const pipelineStages = ["new", "contacted", "quoted", "won", "lost"];

  const chartData = pipelineStages.slice(0, 4).map((s) => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: pipelineCounts[s] || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/shipments/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
          >
            <Plus size={16} /> New Shipment
          </Link>
          <Link
            href="/admin/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <Plus size={16} /> New Client
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<Truck size={20} />}
          label="Active Shipments"
          value={activeShipments}
          href="/admin/shipments"
          accent="bg-blue-50 text-blue-600"
        />
        <KPICard
          icon={<Inbox size={20} />}
          label="Pending Inquiries"
          value={pendingInquiries}
          href="/admin/inquiries"
          accent="bg-amber-50 text-amber-600"
        />
        {showFinance ? (
          <>
            <KPICard
              icon={<CircleDollarSign size={20} />}
              label="Payments received"
              value={revenueLabel}
              href="/admin/finance"
              accent="bg-emerald-50 text-emerald-600"
            />
            <KPICard
              icon={<FileText size={20} />}
              label="Outstanding"
              value={outstandingLabel}
              href="/admin/finance"
              accent="bg-purple-50 text-purple-600"
              alert={overdueTotals.length ? `${formatTotals(overdueTotals)} overdue` : undefined}
            />
          </>
        ) : null}
      </div>

      {/* Exception Alerts */}
      {exceptions.length > 0 && (
        <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-sm font-semibold text-red-700">Needs Attention ({exceptions.length})</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {exceptions.slice(0, 6).map((e, i) => (
              <Link
                key={i}
                href={e.href}
                className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-white border border-red-100 hover:border-red-300 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{e.label}</p>
                  <p className="text-[11px] text-slate-500 truncate">{e.sub}</p>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-red-500 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Shipment Pipeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-800">Shipment Pipeline</h2>
          <Link href="/admin/shipments" className="text-xs text-[var(--accent)] font-semibold hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {shipmentStages.map((stage) => {
            const count = shipmentPipeline[stage] || 0;
            const label = stage.replace(/_/g, " ");
            return (
              <Link
                key={stage}
                href={`/admin/shipments?status=${stage}`}
                className="flex-1 min-w-[100px] rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-center hover:border-[var(--accent)]/30 hover:bg-[var(--accent)]/5 transition-colors group"
              >
                <p className="text-2xl font-bold text-slate-800 group-hover:text-[var(--accent)] transition-colors">{count}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1 capitalize">{label}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Charts + Pipeline Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Inquiry Pipeline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Inquiry Pipeline</h2>
            <Link href="/admin/inquiries" className="text-xs text-[var(--accent)] font-semibold hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <DashboardCharts data={chartData} />
        </div>

        {/* Quick Stats */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatBlock label="Total Inquiries" value={inquiryCount || 0} icon={<Inbox size={16} />} />
            <StatBlock label="Total Shipments" value={shipmentCount || 0} icon={<Box size={16} />} />
            <StatBlock label="Total Clients" value={clientCount || 0} icon={<Users size={16} />} />
            <StatBlock
              label="Win Rate"
              value={
                (pipelineCounts["won"] || 0) + (pipelineCounts["lost"] || 0) > 0
                  ? `${Math.round(((pipelineCounts["won"] || 0) / ((pipelineCounts["won"] || 0) + (pipelineCounts["lost"] || 0))) * 100)}%`
                  : "—"
              }
              icon={<TrendingUp size={16} />}
            />
          </div>
        </div>
      </div>

      {/* Recent Tables */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Inquiries */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-sm font-semibold text-slate-800">Recent Inquiries</h2>
            <Link href="/admin/inquiries" className="text-xs text-[var(--accent)] font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="px-5 pb-5">
            {recentInquiries && recentInquiries.length > 0 ? (
              <div className="space-y-2">
                {recentInquiries.map((inq) => (
                  <Link
                    key={inq.id}
                    href={`/admin/inquiries/${inq.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <Inbox size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-[var(--accent)]">{inq.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {inq.inquiry_no} · {inq.company_name || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {inq.priority && inq.priority !== "medium" && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[inq.priority] || ""}`}>
                          {inq.priority}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[inq.status] || "bg-slate-100 text-slate-600"}`}>
                        {inq.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">No inquiries yet.</p>
            )}
          </div>
        </div>

        {/* Recent Shipments */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-sm font-semibold text-slate-800">Recent Shipments</h2>
            <Link href="/admin/shipments" className="text-xs text-[var(--accent)] font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="px-5 pb-5">
            {recentShipments && recentShipments.length > 0 ? (
              <div className="space-y-2">
                {recentShipments.map((s) => (
                  <Link
                    key={s.id}
                    href={`/admin/shipments/${s.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <Truck size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-[var(--accent)]">{s.shipment_no}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {s.origin} → {s.destination}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${STATUS_COLORS[s.status] || "bg-slate-100 text-slate-600"}`}>
                      {s.status?.replace(/_/g, " ")}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">No shipments yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Recent Activity</h2>
        {recentActivity && recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <Clock size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">{a.actor_email?.split("@")[0] || "System"}</span>
                    {" "}{a.action}{" "}
                    <span className="text-slate-500">{a.entity_type}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(a.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">No activity recorded yet.</p>
        )}
      </div>
    </div>
  );
}

function KPICard({
  icon,
  label,
  value,
  href,
  accent,
  alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  href: string;
  accent: string;
  alert?: string;
}) {
  return (
    <Link href={href} className="group rounded-2xl border border-slate-200 bg-white p-4 hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center`}>{icon}</div>
        <ArrowUpRight size={14} className="text-slate-300 group-hover:text-[var(--accent)] transition-colors" />
      </div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
      {alert && <p className="text-[10px] font-semibold text-red-500 mt-1">{alert}</p>}
    </Link>
  );
}

function StatBlock({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
      <div className="flex items-center gap-2 mb-1.5 text-slate-400">{icon}<span className="text-[11px] font-medium">{label}</span></div>
      <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
