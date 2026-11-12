import Link from "next/link";
import { ClipboardCheck, Plus } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { query } from "@/lib/db/pool";
import { money } from "@/lib/finance";
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
import { DbOffline } from "@/components/admin/shipments/parts";
import { DECLARATION_STAGES, listHref } from "@/components/admin/shipments/format";

type Row = {
  id: string;
  declaration_no: string | null;
  status: string;
  duty_amount: number | null;
  tax_amount: number | null;
  query_deadline: string | null;
  deadline_near: boolean | null;
  deadline_past: boolean | null;
  updated_at: string | null;
  created_at: string;
  shipment_id: string;
  shipment_no: string;
  currency: string | null;
};

const LIMIT = 200;
const BASE = "/admin/customs";

export default async function CustomsPage({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  const params = await searchParams;
  const status = DECLARATION_STAGES.find((s) => s === params.status) || null;

  const header = (
    <PageHeader
      title="Customs"
      description="Declarations for shipments being cleared: what has been submitted, what customs has queried, and what is released."
      actions={
        <ButtonLink href={`${BASE}/new`}>
          <Plus size={16} /> New declaration
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

  const [{ rows }, { rows: counts }] = await Promise.all([
    query<Row>(
      `SELECT d.id, d.declaration_no, d.status, d.duty_amount, d.tax_amount, d.query_deadline,
              d.query_deadline < NOW() + INTERVAL '3 days' AS deadline_near,
              d.query_deadline::date < CURRENT_DATE AS deadline_past,
              d.updated_at, d.created_at, d.shipment_id, s.shipment_no, s.currency
         FROM customs_declarations d
         JOIN shipments s ON s.id = d.shipment_id
        WHERE ($1::text IS NULL OR d.status = $1)
        ORDER BY d.updated_at DESC NULLS LAST, d.created_at DESC
        LIMIT ${LIMIT}`,
      [status],
    ),
    query<{ status: string; n: number }>("SELECT status, count(*)::int AS n FROM customs_declarations GROUP BY status"),
  ]);

  const countOf = (s: string) => counts.find((c) => c.status === s)?.n || 0;
  const total = counts.reduce((sum, c) => sum + c.n, 0);

  return (
    <>
      {header}

      {total === 0 ? (
        <Card padded={false}>
          <EmptyState
            icon={ClipboardCheck}
            title="No customs declarations yet"
            description="A declaration tracks one shipment through customs: its number, duty and tax, any query customs raises, and its release. Start one when a shipment needs clearing."
            action={
              <ButtonLink href={`${BASE}/new`}>
                <Plus size={16} /> New declaration
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <FilterTabs
            items={[
              { label: "All", href: BASE, count: total, active: !status },
              ...DECLARATION_STAGES.map((s) => ({
                label: statusLabel(s),
                href: listHref(BASE, { status: s }),
                count: countOf(s),
                active: status === s,
              })),
            ]}
          />

          {rows.length === 0 ? (
            <Card padded={false}>
              <EmptyState
                icon={ClipboardCheck}
                title={`No declarations are ${statusLabel(status).toLowerCase()}`}
                description="Pick another status, or go back to the full list."
                action={
                  <ButtonLink href={BASE} variant="secondary">
                    Show all declarations
                  </ButtonLink>
                }
              />
            </Card>
          ) : (
            <TableCard
              footer={
                rows.length >= LIMIT
                  ? `Showing the ${LIMIT} most recently updated declarations. Pick a status to narrow the list.`
                  : `${rows.length} ${rows.length === 1 ? "declaration" : "declarations"}`
              }
            >
              <table className={cx(tableClass, "min-w-[860px]")}>
                <thead>
                  <tr>
                    <th className={thClass}>Declaration no.</th>
                    <th className={thClass}>Shipment</th>
                    <th className={thClass}>Status</th>
                    <th className={cx(thClass, "text-right")}>Duty</th>
                    <th className={cx(thClass, "text-right")}>Tax</th>
                    <th className={thClass}>Query deadline</th>
                    <th className={thClass}>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d) => {
                    const currency = d.currency || "USD";
                    // A deadline only needs chasing while the query is still open.
                    const urgent = d.status === "query" && Boolean(d.deadline_near);
                    return (
                      <tr key={d.id} className={trClass}>
                        <td className={tdClass}>
                          <Link href={`${BASE}/${d.id}`} className={rowLinkClass}>
                            {d.declaration_no || "Not yet numbered"}
                          </Link>
                        </td>
                        <td className={tdClass}>
                          <Link
                            href={`/admin/shipments/${d.shipment_id}`}
                            className="font-medium text-[var(--accent-ink)] underline-offset-4 hover:underline"
                          >
                            {d.shipment_no}
                          </Link>
                        </td>
                        <td className={tdClass}>
                          <StatusBadge status={d.status} />
                        </td>
                        <td className={cx(tdClass, "text-right tabular-nums whitespace-nowrap")}>
                          {d.duty_amount != null ? money(d.duty_amount, currency) : <span className="text-slate-400">—</span>}
                        </td>
                        <td className={cx(tdClass, "text-right tabular-nums whitespace-nowrap")}>
                          {d.tax_amount != null ? money(d.tax_amount, currency) : <span className="text-slate-400">—</span>}
                        </td>
                        <td className={cx(tdClass, "whitespace-nowrap")}>
                          {d.query_deadline ? (
                            <span className={urgent ? "font-medium text-red-700" : undefined}>
                              {formatDate(d.query_deadline)}
                              {urgent ? <span className="block text-[13px] font-normal">{d.deadline_past ? "Overdue" : "Due soon"}</span> : null}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className={cx(tdClass, "whitespace-nowrap")}>{timeAgo(d.updated_at || d.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableCard>
          )}
        </div>
      )}
    </>
  );
}
