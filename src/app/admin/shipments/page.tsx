import Link from "next/link";
import { ArrowRight, Plus, SearchX, Ship } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { query } from "@/lib/db/pool";
import {
  ButtonLink,
  Card,
  EmptyState,
  FilterTabs,
  PageHeader,
  StatusBadge,
  TableCard,
  cx,
  formatDate,
  rowLinkClass,
  statusLabel,
  tableClass,
  tdClass,
  thClass,
  timeAgo,
  trClass,
} from "@/components/admin/ui";
import { DbOffline, SearchForm } from "@/components/admin/shipments/parts";
import { SHIPMENT_STAGES, cleanQuery, likePattern, listHref, methodLabel } from "@/components/admin/shipments/format";

type Row = {
  id: string;
  shipment_no: string;
  origin: string;
  destination: string;
  method: string;
  status: string;
  created_at: string;
  eta: string | null;
  client_id: string;
  company_name: string;
  assignee: string | null;
};

const LIMIT = 200;
const BASE = "/admin/shipments";
const SEARCH_WHERE =
  "($1::text IS NULL OR s.shipment_no ILIKE $1 OR s.origin ILIKE $1 OR s.destination ILIKE $1 OR c.company_name ILIKE $1)";

export default async function ShipmentsPage({ searchParams }: { searchParams: Promise<{ status?: string | string[]; q?: string | string[] }> }) {
  const params = await searchParams;
  const q = cleanQuery(params.q);
  const status = SHIPMENT_STAGES.find((s) => s === params.status) || null;

  const header = (
    <PageHeader
      title="Shipments"
      description="Every job you are moving for clients, from booking to delivery."
      actions={
        <ButtonLink href={`${BASE}/new`}>
          <Plus size={16} /> New shipment
        </ButtonLink>
      }
    />
  );

  if (!createServiceRoleClient()) {
    return (
      <>
        {header}
        <DbOffline />
      </>
    );
  }

  const pattern = q ? likePattern(q) : null;
  const [{ rows }, { rows: counts }, { rows: totals }] = await Promise.all([
    query<Row>(
      `SELECT s.id, s.shipment_no, s.origin, s.destination, s.method, s.status, s.created_at,
              COALESCE(NULLIF(s.key_dates->>'arrival', ''), to_char(s.estimated_arrival, 'YYYY-MM-DD')) AS eta,
              c.id AS client_id, c.company_name, u.full_name AS assignee
         FROM shipments s
         JOIN clients c ON c.id = s.client_id
         LEFT JOIN staff_users u ON u.id = s.assigned_to
        WHERE ${SEARCH_WHERE} AND ($2::text IS NULL OR s.status = $2)
        ORDER BY s.created_at DESC
        LIMIT ${LIMIT}`,
      [pattern, status],
    ),
    query<{ status: string; n: number }>(
      `SELECT s.status, count(*)::int AS n
         FROM shipments s JOIN clients c ON c.id = s.client_id
        WHERE ${SEARCH_WHERE}
        GROUP BY s.status`,
      [pattern],
    ),
    query<{ n: number }>("SELECT count(*)::int AS n FROM shipments"),
  ]);

  const countOf = (s: string) => counts.find((c) => c.status === s)?.n || 0;
  const matching = counts.reduce((sum, c) => sum + c.n, 0);
  const total = totals[0]?.n || 0;
  const filtered = Boolean(q || status);

  return (
    <>
      {header}

      {total === 0 ? (
        <Card padded={false}>
          <EmptyState
            icon={Ship}
            title="No shipments yet"
            description="A shipment is one job for a client: where the cargo is coming from, where it is going, and how far along it is. Create one here, or convert a won enquiry."
            action={
              <ButtonLink href={`${BASE}/new`}>
                <Plus size={16} /> New shipment
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <FilterTabs
              items={[
                { label: "All", href: listHref(BASE, { q }), count: matching, active: !status },
                ...SHIPMENT_STAGES.map((s) => ({
                  label: statusLabel(s),
                  href: listHref(BASE, { status: s, q }),
                  count: countOf(s),
                  active: status === s,
                })),
              ]}
            />
            <SearchForm
              action={BASE}
              q={q}
              label="Search shipments"
              placeholder="Shipment no., place or client"
              hidden={{ status }}
            />
          </div>

          {rows.length === 0 ? (
            <Card padded={false}>
              <EmptyState
                icon={SearchX}
                title="No shipments match"
                description={
                  q
                    ? `Nothing matches "${q}"${status ? ` with the status ${statusLabel(status)}` : ""}. Check the spelling or clear the filters.`
                    : `No shipments have the status ${statusLabel(status)} right now.`
                }
                action={
                  <ButtonLink href={BASE} variant="secondary">
                    Clear filters
                  </ButtonLink>
                }
              />
            </Card>
          ) : (
            <TableCard
              footer={
                rows.length >= LIMIT
                  ? `Showing the ${LIMIT} newest shipments. Search or pick a status to narrow the list.`
                  : `${rows.length} ${rows.length === 1 ? "shipment" : "shipments"}${filtered ? " match" : ""}`
              }
            >
              <table className={cx(tableClass, "min-w-[900px]")}>
                <thead>
                  <tr>
                    <th className={thClass}>Shipment no.</th>
                    <th className={thClass}>Client</th>
                    <th className={thClass}>Route</th>
                    <th className={thClass}>Method</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Assigned to</th>
                    <th className={thClass}>ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.id} className={trClass}>
                      <td className={tdClass}>
                        <Link href={`${BASE}/${s.id}`} className={rowLinkClass}>
                          {s.shipment_no}
                        </Link>
                        <p className="mt-0.5 text-[13px] text-slate-500">Created {timeAgo(s.created_at)}</p>
                      </td>
                      <td className={tdClass}>
                        <Link href={`/admin/clients/${s.client_id}`} className="underline-offset-4 hover:text-[var(--navy)] hover:underline">
                          {s.company_name}
                        </Link>
                      </td>
                      <td className={tdClass}>
                        <span className="inline-flex flex-wrap items-center gap-x-1.5">
                          {s.origin}
                          <ArrowRight size={14} className="shrink-0 text-slate-400" aria-label="to" />
                          {s.destination}
                        </span>
                      </td>
                      <td className={tdClass}>{methodLabel(s.method)}</td>
                      <td className={tdClass}>
                        <StatusBadge status={s.status} />
                      </td>
                      <td className={tdClass}>{s.assignee || <span className="text-slate-400">Unassigned</span>}</td>
                      <td className={cx(tdClass, "whitespace-nowrap")}>
                        {s.eta ? formatDate(s.eta) : <span className="text-slate-400">Not set</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableCard>
          )}
        </div>
      )}
    </>
  );
}
