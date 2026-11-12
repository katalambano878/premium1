import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, CircleDollarSign, ClipboardCheck, FileText, Inbox, Truck, Users } from "lucide-react";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { ButtonLink, Callout, Card, CardHeader, CardLink, EmptyState, PageHeader, StatCard, StatusBadge, cx, formatDate, initials, statusLabel, timeAgo } from "@/components/admin/ui";
import { MoneyLines } from "@/components/admin/MoneyLines";
import { getSessionUser } from "@/lib/auth/session";
import { canAccess, canWrite } from "@/lib/auth/roles";
import { query } from "@/lib/db/pool";
import { formatTotals, money, refreshOverdueInvoices } from "@/lib/finance";

export const dynamic = "force-dynamic";

type MoneyRow = { currency: string; received: number; outstanding: number; overdue: number };
type Attention = { key: string; icon: typeof Inbox; title: string; detail: string; href: string; tone: "red" | "amber" };

const SHIPMENT_STAGES = ["draft", "booked", "in_transit", "arrived", "clearing", "out_for_delivery", "delivered"] as const;
const ENQUIRY_STAGES = ["new", "contacted", "quoted", "won", "lost"] as const;

const rows = <T,>(sql: string, params: unknown[] = []) =>
  query<T & Record<string, unknown>>(sql, params)
    .then((r) => r.rows as T[])
    .catch((e) => {
      console.error("[dashboard]", e);
      return [] as T[];
    });

export default async function AdminDashboard() {
  const me = await getSessionUser();
  if (!me) return null;
  const can = (resource: string) => canAccess(me.role, resource);
  const showFinance = can("finance");
  if (showFinance) await refreshOverdueInvoices();

  const [
    enquiryCounts,
    shipmentCounts,
    totals,
    moneyRows,
    recentEnquiries,
    recentShipments,
    activity,
    overdueFollowUps,
    customsQueries,
    overdueInvoices,
    unassigned,
    monthly,
  ] = await Promise.all([
    rows<{ status: string; n: number }>("SELECT status, count(*)::int AS n FROM inquiries GROUP BY status"),
    rows<{ status: string; n: number }>("SELECT status, count(*)::int AS n FROM shipments GROUP BY status"),
    rows<{ clients: number; staff: number }>(
      "SELECT (SELECT count(*)::int FROM clients) AS clients, (SELECT count(*)::int FROM staff_users WHERE is_active) AS staff",
    ),
    showFinance
      ? rows<MoneyRow>(
          `SELECT COALESCE(i.currency, 'USD') AS currency,
                  COALESCE(SUM(p.paid), 0) AS received,
                  COALESCE(SUM(CASE WHEN i.status IN ('sent','overdue') THEN GREATEST(i.total - COALESCE(p.paid, 0), 0) END), 0) AS outstanding,
                  COALESCE(SUM(CASE WHEN i.status = 'overdue' THEN GREATEST(i.total - COALESCE(p.paid, 0), 0) END), 0) AS overdue
             FROM invoices i
             LEFT JOIN (SELECT invoice_id, SUM(amount) AS paid FROM payments GROUP BY invoice_id) p ON p.invoice_id = i.id
            WHERE i.status <> 'void'
            GROUP BY 1`,
        )
      : Promise.resolve([] as MoneyRow[]),
    can("inquiries")
      ? rows<{ id: string; inquiry_no: string; full_name: string; company_name: string | null; status: string; priority: string | null; origin: string; destination: string; created_at: string }>(
          "SELECT id, inquiry_no, full_name, company_name, status, priority, origin, destination, created_at FROM inquiries ORDER BY created_at DESC LIMIT 6",
        )
      : Promise.resolve([]),
    can("shipments")
      ? rows<{ id: string; shipment_no: string; origin: string; destination: string; status: string; company_name: string | null; created_at: string }>(
          `SELECT s.id, s.shipment_no, s.origin, s.destination, s.status, c.company_name, s.created_at
             FROM shipments s LEFT JOIN clients c ON c.id = s.client_id ORDER BY s.created_at DESC LIMIT 6`,
        )
      : Promise.resolve([]),
    rows<{ id: string; entity_type: string; action: string; actor_email: string | null; actor_name: string | null; created_at: string }>(
      `SELECT a.id, a.entity_type, a.action, a.actor_email, s.full_name AS actor_name, a.created_at
         FROM activity_log a LEFT JOIN staff_users s ON lower(s.email) = lower(a.actor_email)
        ORDER BY a.created_at DESC LIMIT 10`,
    ),
    can("inquiries")
      ? rows<{ id: string; inquiry_no: string; full_name: string; follow_up_at: string }>(
          `SELECT id, inquiry_no, full_name, follow_up_at FROM inquiries
            WHERE follow_up_at IS NOT NULL AND follow_up_at < NOW() AND status NOT IN ('won','lost')
            ORDER BY follow_up_at LIMIT 5`,
        )
      : Promise.resolve([]),
    can("customs")
      ? rows<{ id: string; declaration_no: string | null; query_deadline: string | null; shipment_no: string | null }>(
          `SELECT d.id, d.declaration_no, d.query_deadline, s.shipment_no FROM customs_declarations d
             LEFT JOIN shipments s ON s.id = d.shipment_id WHERE d.status = 'query' ORDER BY d.query_deadline NULLS LAST LIMIT 5`,
        )
      : Promise.resolve([]),
    showFinance
      ? rows<{ id: string; invoice_no: string; total: number; currency: string | null; due_date: string | null; company_name: string | null }>(
          `SELECT i.id, i.invoice_no, i.total, i.currency, i.due_date, c.company_name FROM invoices i
             LEFT JOIN clients c ON c.id = i.client_id WHERE i.status = 'overdue' ORDER BY i.due_date LIMIT 5`,
        )
      : Promise.resolve([]),
    can("inquiries")
      ? rows<{ n: number }>("SELECT count(*)::int AS n FROM inquiries WHERE status = 'new' AND assigned_to IS NULL AND created_at < NOW() - interval '24 hours'")
      : Promise.resolve([]),
    can("inquiries")
      ? rows<{ month: string; n: number }>(
          `SELECT to_char(date_trunc('month', created_at), 'Mon') AS month, count(*)::int AS n
             FROM inquiries WHERE created_at >= date_trunc('month', NOW()) - interval '5 months'
            GROUP BY date_trunc('month', created_at) ORDER BY date_trunc('month', created_at)`,
        )
      : Promise.resolve([]),
  ]);

  const enquiries = Object.fromEntries(enquiryCounts.map((r) => [r.status, r.n])) as Record<string, number>;
  const shipments = Object.fromEntries(shipmentCounts.map((r) => [r.status, r.n])) as Record<string, number>;
  const totalEnquiries = enquiryCounts.reduce((s, r) => s + r.n, 0);
  const totalShipments = shipmentCounts.reduce((s, r) => s + r.n, 0);
  const activeShipments = totalShipments - (shipments.draft || 0) - (shipments.delivered || 0);
  const toAnswer = (enquiries.new || 0) + (enquiries.contacted || 0);
  const decided = (enquiries.won || 0) + (enquiries.lost || 0);
  const winRate = decided > 0 ? `${Math.round(((enquiries.won || 0) / decided) * 100)}%` : "—";
  const clientCount = totals[0]?.clients || 0;

  const pick = (k: "received" | "outstanding" | "overdue") =>
    moneyRows.filter((r) => Number(r[k]) > 0).map((r) => ({ currency: r.currency, total: Number(r[k]) }));
  const overdueTotals = pick("overdue");

  const attention: Attention[] = [
    ...customsQueries.map((c) => ({
      key: `c-${c.id}`,
      icon: ClipboardCheck,
      title: `Customs query on ${c.declaration_no || c.shipment_no || "a declaration"}`,
      detail: c.query_deadline ? `Answer by ${formatDate(c.query_deadline)}` : "Needs a response",
      href: `/admin/customs/${c.id}`,
      tone: "red" as const,
    })),
    ...overdueInvoices.map((inv) => ({
      key: `i-${inv.id}`,
      icon: CircleDollarSign,
      title: `${inv.invoice_no} is overdue`,
      detail: `${money(Number(inv.total), inv.currency || "USD")}${inv.company_name ? ` · ${inv.company_name}` : ""}${inv.due_date ? ` · due ${formatDate(inv.due_date)}` : ""}`,
      href: `/admin/finance/${inv.id}`,
      tone: "red" as const,
    })),
    ...overdueFollowUps.map((f) => ({
      key: `f-${f.id}`,
      icon: CalendarClock,
      title: `Follow up with ${f.full_name}`,
      detail: `${f.inquiry_no} · was due ${timeAgo(f.follow_up_at)}`,
      href: `/admin/inquiries/${f.id}`,
      tone: "amber" as const,
    })),
    ...(unassigned[0]?.n
      ? [
          {
            key: "unassigned",
            icon: Inbox,
            title: `${unassigned[0].n} new ${unassigned[0].n === 1 ? "enquiry has" : "enquiries have"} waited over 24 hours`,
            detail: "Not yet assigned to anyone",
            href: "/admin/inquiries?status=new",
            tone: "amber" as const,
          },
        ]
      : []),
  ];

  const firstName = (me.fullName || me.email).split(/[\s@]/)[0];
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Accra" }).format(new Date()));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Accra" }).format(new Date());
  const isEmpty = totalEnquiries === 0 && totalShipments === 0 && clientCount === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${firstName}`}
        description={`${today}. ${attention.length ? `${attention.length} ${attention.length === 1 ? "item needs" : "items need"} attention.` : "Nothing is waiting on you right now."}`}
        actions={
          <>
            {canWrite(me.role, "shipments") ? <ButtonLink href="/admin/shipments/new">New shipment</ButtonLink> : null}
            {can("inquiries") ? (
              <ButtonLink href="/admin/inquiries?status=new" variant="secondary">
                Review new enquiries
              </ButtonLink>
            ) : null}
          </>
        }
      />

      {isEmpty ? <GettingStarted isAdmin={me.role === "admin"} canShip={canWrite(me.role, "shipments")} /> : null}

      {/* Headline numbers */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {can("shipments") ? (
          <StatCard label="Active shipments" value={activeShipments} hint={`${shipments.in_transit || 0} in transit · ${shipments.clearing || 0} clearing`} icon={Truck} href="/admin/shipments" />
        ) : null}
        {can("inquiries") ? (
          <StatCard
            label="Enquiries to answer"
            value={toAnswer}
            hint={`${enquiries.new || 0} new · ${enquiries.contacted || 0} contacted`}
            icon={Inbox}
            href="/admin/inquiries"
            tone={(enquiries.new || 0) > 0 ? "warn" : "default"}
          />
        ) : null}
        {showFinance ? (
          <>
            <StatCard label="Payments received" value={<MoneyLines totals={pick("received")} />} hint="All time, by currency" icon={CircleDollarSign} href="/admin/finance" tone="good" />
            <StatCard
              label="Outstanding"
              value={<MoneyLines totals={pick("outstanding")} />}
              hint={overdueTotals.length ? `${formatTotals(overdueTotals)} overdue` : "Nothing overdue"}
              icon={FileText}
              href="/admin/finance"
              tone={overdueTotals.length ? "bad" : "default"}
            />
          </>
        ) : (
          <StatCard label="Clients" value={clientCount} hint="Companies on record" icon={Users} href={can("clients") ? "/admin/clients" : undefined} />
        )}
      </div>

      {/* Needs attention */}
      {attention.length > 0 ? (
        <Card padded={false}>
          <div className="flex items-center gap-2.5 border-b border-slate-200 px-5 py-4 sm:px-6">
            <AlertTriangle size={18} className="text-red-600" strokeWidth={1.8} />
            <h2 className="text-base font-medium text-[var(--navy)]">Needs attention</h2>
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium tabular-nums text-red-800">{attention.length}</span>
          </div>
          <ul>
            {attention.map((a) => (
              <li key={a.key} className="border-b border-slate-100 last:border-b-0">
                <Link href={a.href} className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50 sm:px-6">
                  <span
                    className={cx(
                      "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      a.tone === "red" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700",
                    )}
                  >
                    <a.icon size={17} strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[var(--navy)]">{a.title}</span>
                    <span className="block truncate text-[13px] text-slate-500">{a.detail}</span>
                  </span>
                  <ArrowRight size={16} className="shrink-0 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--navy)]" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : !isEmpty ? (
        <Callout tone="success" icon={CheckCircle2} title="All clear">
          No customs queries, overdue invoices or missed follow-ups.
        </Callout>
      ) : null}

      {/* Shipment pipeline */}
      {can("shipments") ? (
        <Card>
          <CardHeader title="Shipments by stage" description="Where every shipment is right now. Select a stage to see its shipments." action={<CardLink href="/admin/shipments">All shipments</CardLink>} />
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
            {SHIPMENT_STAGES.map((stage, i) => {
              const count = shipments[stage] || 0;
              return (
                <li key={stage}>
                  <Link
                    href={`/admin/shipments?status=${stage}`}
                    className="block h-full rounded-xl border border-slate-200 px-3.5 py-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
                  >
                    <span className="text-xs tabular-nums text-slate-400">0{i + 1}</span>
                    <span className={cx("mt-1 block text-2xl font-medium tabular-nums tracking-[-0.02em]", count ? "text-[var(--navy)]" : "text-slate-300")}>{count}</span>
                    <span className="mt-0.5 block text-[13px] leading-5 text-slate-500">{statusLabel(stage)}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </Card>
      ) : null}

      {/* Recent work */}
      <div className="grid gap-6 lg:grid-cols-2">
        {can("inquiries") ? (
          <Card padded={false}>
            <CardHeader className="mb-0 px-5 pt-5 sm:px-6" title="Latest enquiries" action={<CardLink href="/admin/inquiries">All enquiries</CardLink>} />
            {recentEnquiries.length ? (
              <ul className="mt-3">
                {recentEnquiries.map((inq) => (
                  <li key={inq.id} className="border-t border-slate-100">
                    <Link href={`/admin/inquiries/${inq.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50 sm:px-6">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[var(--navy)]">
                          {inq.full_name}
                          {inq.company_name ? <span className="font-normal text-slate-500"> · {inq.company_name}</span> : null}
                        </span>
                        <span className="block truncate text-[13px] text-slate-500">
                          {inq.origin} → {inq.destination} · {timeAgo(inq.created_at)}
                        </span>
                      </span>
                      {inq.priority === "urgent" || inq.priority === "high" ? <StatusBadge status={inq.priority} /> : null}
                      <StatusBadge status={inq.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact icon={Inbox} title="No enquiries yet" description="Quote requests sent from the website appear here as soon as they arrive." />
            )}
          </Card>
        ) : null}

        {can("shipments") ? (
          <Card padded={false}>
            <CardHeader className="mb-0 px-5 pt-5 sm:px-6" title="Latest shipments" action={<CardLink href="/admin/shipments">All shipments</CardLink>} />
            {recentShipments.length ? (
              <ul className="mt-3">
                {recentShipments.map((s) => (
                  <li key={s.id} className="border-t border-slate-100">
                    <Link href={`/admin/shipments/${s.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50 sm:px-6">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[var(--navy)]">
                          {s.shipment_no}
                          {s.company_name ? <span className="font-normal text-slate-500"> · {s.company_name}</span> : null}
                        </span>
                        <span className="block truncate text-[13px] text-slate-500">
                          {s.origin} → {s.destination}
                        </span>
                      </span>
                      <StatusBadge status={s.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                icon={Truck}
                title="No shipments yet"
                description="Create one directly, or convert a won enquiry into a shipment."
                action={
                  canWrite(me.role, "shipments") ? (
                    <ButtonLink href="/admin/shipments/new" size="sm">
                      New shipment
                    </ButtonLink>
                  ) : undefined
                }
              />
            )}
          </Card>
        ) : null}
      </div>

      {/* Enquiry performance + activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {can("inquiries") ? (
          <Card>
            <CardHeader title="Enquiries" description="Received each month, and how they ended up." />
            <DashboardCharts data={monthly.map((m) => ({ name: m.month, value: m.n }))} />
            <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-200 pt-5 sm:grid-cols-6">
              {ENQUIRY_STAGES.map((stage) => (
                <div key={stage}>
                  <dt className="text-[13px] text-slate-500">{statusLabel(stage)}</dt>
                  <dd className="mt-0.5 text-lg font-medium tabular-nums text-[var(--navy)]">{enquiries[stage] || 0}</dd>
                </div>
              ))}
              <div>
                <dt className="text-[13px] text-slate-500">Win rate</dt>
                <dd className="mt-0.5 text-lg font-medium tabular-nums text-[var(--navy)]">{winRate}</dd>
              </div>
            </dl>
          </Card>
        ) : null}

        <Card>
          <CardHeader title="Recent activity" description="What the team has done lately." />
          {activity.length ? (
            <ol className="space-y-4">
              {activity.map((a) => {
                const who = a.actor_name || (a.actor_email && a.actor_email !== "system" ? a.actor_email.split("@")[0] : "System");
                return (
                  <li key={a.id} className="flex items-start gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">{initials(who)}</span>
                    <p className="min-w-0 flex-1 text-sm leading-6 text-slate-600">
                      <span className="font-medium text-[var(--navy)]">{who}</span> {a.action.replace(/_/g, " ")}
                      <span className="block text-[13px] text-slate-400">{timeAgo(a.created_at)}</span>
                    </p>
                  </li>
                );
              })}
            </ol>
          ) : (
            <EmptyState compact icon={CalendarClock} title="No activity yet" description="Status changes, notes and payments are listed here as the team works." />
          )}
        </Card>
      </div>
    </div>
  );
}

/** First-run guide shown while the dashboard has no records at all. */
function GettingStarted({ isAdmin, canShip }: { isAdmin: boolean; canShip: boolean }) {
  const steps = [
    { title: "Add your first client", body: "Shipments and invoices are always tied to a client company.", href: "/admin/clients/new", cta: "Add a client", show: true },
    { title: "Create a shipment", body: "Or wait for a quote request from the website and convert it.", href: "/admin/shipments/new", cta: "New shipment", show: canShip },
    { title: "Invite your team", body: "Give each person their own sign-in and the right level of access.", href: "/admin/staff", cta: "Manage staff", show: isAdmin },
    { title: "Check company details", body: "Confirm the name, address and contact details staff will see.", href: "/admin/settings", cta: "Open settings", show: isAdmin },
  ].filter((s) => s.show);
  return (
    <Card>
      <CardHeader title="Get set up" description="The dashboard is empty. These steps get it ready for real work." />
      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.href} className="flex flex-col rounded-xl border border-slate-200 p-4">
            <span className="text-xs tabular-nums text-slate-400">Step {i + 1}</span>
            <span className="mt-1 text-[15px] font-medium text-[var(--navy)]">{s.title}</span>
            <span className="mt-1 flex-1 text-[13px] leading-5 text-slate-500">{s.body}</span>
            <ButtonLink href={s.href} variant="secondary" size="sm" className="mt-4 self-start">
              {s.cta}
            </ButtonLink>
          </li>
        ))}
      </ol>
    </Card>
  );
}
