import Link from "next/link";
import { ArrowRight, Inbox, SearchX } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { query } from "@/lib/db/pool";
import { INQUIRY_STATUSES } from "@/lib/admin-form";
import { InquiryFilters } from "@/components/admin/InquiryFilters";
import { PRIORITIES, inquiriesHref, isOverdue, methodLabel } from "@/components/admin/inquiries/shared";
import {
  ButtonLink,
  Callout,
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

const PAGE_LIMIT = 100;

type InquiryRow = {
  id: string;
  inquiry_no: string;
  full_name: string;
  company_name: string | null;
  email: string;
  origin: string;
  destination: string;
  method: string;
  status: string;
  priority: string | null;
  created_at: string;
  follow_up_at: string | null;
  assignee_name: string | null;
};

// Priority and search conditions; $1 = priority or null, $2 = search pattern or null.
const MATCH_SQL = `($1::text IS NULL OR COALESCE(i.priority, 'medium') = $1)
  AND ($2::text IS NULL
    OR i.inquiry_no ILIKE $2 OR i.full_name ILIKE $2 OR i.company_name ILIKE $2
    OR i.email ILIKE $2 OR i.origin ILIKE $2 OR i.destination ILIKE $2)`;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; priority?: string | string[]; q?: string | string[] }>;
}) {
  const params = await searchParams;

  if (!createServiceRoleClient()) {
    return (
      <>
        <PageHeader title="Enquiries" description="Quote requests from the website, email and phone." />
        <Callout tone="warning" title="The database is not connected">
          Enquiries cannot be shown until the database connection is set up.
        </Callout>
      </>
    );
  }

  const rawStatus = first(params.status);
  const rawPriority = first(params.priority);
  const status = (INQUIRY_STATUSES as readonly string[]).includes(rawStatus || "") ? rawStatus : undefined;
  const priority = (PRIORITIES as readonly string[]).includes(rawPriority || "") ? rawPriority : undefined;
  const q = (first(params.q) || "").trim().slice(0, 100);
  // Escape LIKE wildcards so a typed % or _ is matched literally.
  const pattern = q ? `%${q.replace(/[\\%_]/g, "\\$&")}%` : null;

  const [rowsRes, countsRes, totalRes] = await Promise.all([
    query<InquiryRow>(
      `SELECT i.id, i.inquiry_no, i.full_name, i.company_name, i.email, i.origin, i.destination, i.method,
              i.status, i.priority, i.created_at, i.follow_up_at, s.full_name AS assignee_name
         FROM inquiries i
         LEFT JOIN staff_users s ON s.id = i.assigned_to
        WHERE ${MATCH_SQL} AND ($3::text IS NULL OR i.status = $3)
        ORDER BY i.created_at DESC
        LIMIT ${PAGE_LIMIT}`,
      [priority ?? null, pattern, status ?? null],
    ),
    query<{ status: string; n: number }>(
      `SELECT i.status, COUNT(*)::int AS n FROM inquiries i WHERE ${MATCH_SQL} GROUP BY i.status`,
      [priority ?? null, pattern],
    ),
    query<{ n: number }>("SELECT COUNT(*)::int AS n FROM inquiries"),
  ]);

  const rows = rowsRes.rows;
  const total = totalRes.rows[0]?.n ?? 0;
  const counts: Record<string, number> = {};
  for (const c of countsRes.rows) counts[c.status] = c.n;
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const matching = status ? counts[status] || 0 : allCount;
  const filtered = Boolean(status || priority || q);

  const tabs = [
    { label: "All", href: inquiriesHref({ priority, q }), count: allCount, active: !status },
    ...INQUIRY_STATUSES.map((s) => ({
      label: statusLabel(s),
      href: inquiriesHref({ status: s, priority, q }),
      count: counts[s] || 0,
      active: status === s,
    })),
  ];

  return (
    <>
      <PageHeader
        title="Enquiries"
        description={
          total === 0
            ? "Quote requests from the website, email and phone. Reply, quote, then convert the ones you win into shipments."
            : `${total.toLocaleString("en-GB")} ${total === 1 ? "enquiry" : "enquiries"} in total. Reply, quote, then convert the ones you win into shipments.`
        }
      />

      {total === 0 ? (
        <Card padded={false}>
          <EmptyState
            icon={Inbox}
            title="No enquiries yet"
            description="When someone asks for a quote on the website, their request appears here so the team can reply, quote and follow up."
            action={
              <ButtonLink href="/quote" variant="secondary" target="_blank" rel="noopener noreferrer">
                Open the quote form
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <FilterTabs items={tabs} />
          <InquiryFilters currentStatus={status} currentPriority={priority} currentSearch={q || undefined} />

          {rows.length === 0 ? (
            <Card padded={false}>
              <EmptyState
                icon={SearchX}
                title="No enquiries match"
                description={
                  q
                    ? `Nothing matches "${q}" with the filters you have chosen. Check the spelling or clear the filters to see every enquiry.`
                    : "No enquiries match the filters you have chosen. Clear them to see every enquiry."
                }
                action={
                  <ButtonLink href="/admin/inquiries" variant="secondary">
                    Clear filters
                  </ButtonLink>
                }
              />
            </Card>
          ) : (
            <TableCard
              footer={
                matching > rows.length ? (
                  <>
                    Showing the latest {rows.length} of {matching.toLocaleString("en-GB")}. Search or filter to find older enquiries.
                  </>
                ) : (
                  <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <span>
                      Showing {rows.length} of {matching.toLocaleString("en-GB")}
                    </span>
                    {filtered ? (
                      <Link href="/admin/inquiries" className="font-medium text-[var(--accent-ink)] hover:text-[var(--navy)]">
                        Clear filters
                      </Link>
                    ) : null}
                  </span>
                )
              }
            >
              <table className={cx(tableClass, "min-w-[920px]")}>
                <thead>
                  <tr>
                    <th scope="col" className={thClass}>Enquiry</th>
                    <th scope="col" className={thClass}>Contact</th>
                    <th scope="col" className={thClass}>Route</th>
                    <th scope="col" className={thClass}>Priority</th>
                    <th scope="col" className={thClass}>Status</th>
                    <th scope="col" className={thClass}>Assigned to</th>
                    <th scope="col" className={thClass}>Follow-up</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((inq) => {
                    const overdue = isOverdue(inq.follow_up_at, inq.status);
                    return (
                      <tr key={inq.id} className={trClass}>
                        <td className="border-b border-slate-100 align-middle">
                          <Link href={`/admin/inquiries/${inq.id}`} className="group/link block px-5 py-3.5">
                            <span className={cx(rowLinkClass, "block whitespace-nowrap group-hover/link:underline")}>{inq.inquiry_no}</span>
                            <span className="mt-0.5 block whitespace-nowrap text-[13px] text-slate-500">{timeAgo(inq.created_at)}</span>
                          </Link>
                        </td>
                        <td className={tdClass}>
                          <span className="block max-w-[220px] truncate font-medium text-[var(--navy)]">{inq.full_name}</span>
                          <span className="mt-0.5 block max-w-[220px] truncate text-[13px] text-slate-500">{inq.company_name || inq.email}</span>
                        </td>
                        <td className={tdClass}>
                          <span className="flex max-w-[280px] items-center gap-1.5 text-[var(--navy)]">
                            <span className="truncate">{inq.origin}</span>
                            <ArrowRight size={14} className="shrink-0 text-slate-400" aria-label="to" />
                            <span className="truncate">{inq.destination}</span>
                          </span>
                          <span className="mt-0.5 block text-[13px] text-slate-500">{methodLabel(inq.method)}</span>
                        </td>
                        <td className={tdClass}>
                          {inq.priority && inq.priority !== "medium" ? (
                            <StatusBadge status={inq.priority} />
                          ) : (
                            <span className="sr-only">Medium</span>
                          )}
                        </td>
                        <td className={tdClass}>
                          <StatusBadge status={inq.status} />
                        </td>
                        <td className={cx(tdClass, "whitespace-nowrap")}>
                          {inq.assignee_name || <span className="text-slate-400">Unassigned</span>}
                        </td>
                        <td className={cx(tdClass, "whitespace-nowrap")}>
                          {inq.follow_up_at ? (
                            overdue ? (
                              <span className="font-medium text-red-700">Overdue, {formatDate(inq.follow_up_at)}</span>
                            ) : (
                              formatDate(inq.follow_up_at)
                            )
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
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
