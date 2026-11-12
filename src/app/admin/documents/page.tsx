import Link from "next/link";
import { Download, FileText, FolderOpen, SearchX } from "lucide-react";
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
  buttonClass,
  cx,
  formatDate,
  rowLinkClass,
  tableClass,
  tdClass,
  thClass,
  timeAgo,
  trClass,
} from "@/components/admin/ui";
import { DocumentUpload } from "@/components/admin/DocumentUpload";
import { DbOffline, SearchForm } from "@/components/admin/shipments/parts";
import { cleanQuery, likePattern, listHref } from "@/components/admin/shipments/format";
import { DOC_TYPES, docTypeLabel, fileNameFromUrl } from "@/components/admin/documents/doc-types";

type Row = {
  id: string;
  doc_type: string;
  file_url: string;
  created_at: string;
  shipment_id: string;
  shipment_no: string;
};

const LIMIT = 200;
const BASE = "/admin/documents";
// $1 matches shipment numbers; $2 matches the file name only (not its folder), with spaces
// loosened because stored names have them replaced.
const SEARCH_WHERE = "($1::text IS NULL OR s.shipment_no ILIKE $1 OR regexp_replace(d.file_url, '^.*/', '') ILIKE $2)";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ type?: string | string[]; q?: string | string[] }> }) {
  const params = await searchParams;
  const q = cleanQuery(params.q);
  const type = typeof params.type === "string" ? params.type.replace(/[^a-z_]/g, "").slice(0, 40) || null : null;

  const description = "Bills of lading, invoices, packing lists and other paperwork, filed under the shipment they belong to.";

  if (!createServiceRoleClient()) {
    return (
      <>
        <PageHeader title="Documents" description={description} />
        <DbOffline />
      </>
    );
  }

  const pattern = q ? likePattern(q) : null;
  const namePattern = pattern ? pattern.replace(/ /g, "_") : null;
  const [{ rows }, { rows: counts }, { rows: totals }, { rows: shipments }] = await Promise.all([
    query<Row>(
      `SELECT d.id, d.doc_type, d.file_url, d.created_at, d.shipment_id, s.shipment_no
         FROM shipment_documents d
         JOIN shipments s ON s.id = d.shipment_id
        WHERE ${SEARCH_WHERE} AND ($3::text IS NULL OR d.doc_type = $3)
        ORDER BY d.created_at DESC
        LIMIT ${LIMIT}`,
      [pattern, namePattern, type],
    ),
    query<{ doc_type: string; n: number }>(
      `SELECT d.doc_type, count(*)::int AS n
         FROM shipment_documents d JOIN shipments s ON s.id = d.shipment_id
        WHERE ${SEARCH_WHERE}
        GROUP BY d.doc_type`,
      [pattern, namePattern],
    ),
    query<{ n: number }>("SELECT count(*)::int AS n FROM shipment_documents"),
    query<{ id: string; shipment_no: string }>("SELECT id, shipment_no FROM shipments ORDER BY created_at DESC LIMIT 300"),
  ]);

  const total = totals[0]?.n || 0;
  const matching = counts.reduce((sum, c) => sum + c.n, 0);
  const countOf = (t: string) => counts.find((c) => c.doc_type === t)?.n || 0;
  // Known types in their usual order, then anything else found in the data; only types that have files (or are selected).
  const known: string[] = DOC_TYPES.map((t) => t.value);
  const tabTypes = [...known, ...counts.map((c) => c.doc_type).filter((t) => !known.includes(t))].filter(
    (t) => countOf(t) > 0 || t === type,
  );

  return (
    <>
      <PageHeader title="Documents" description={description} actions={<DocumentUpload shipments={shipments} />} />

      {total === 0 ? (
        <Card padded={false}>
          <EmptyState
            icon={FolderOpen}
            title="No documents yet"
            description="This is where shipment paperwork lives: bills of lading, commercial invoices, packing lists, certificates of origin, customs declarations, insurance certificates and delivery notes. Upload a file and choose the shipment it belongs to."
            action={<DocumentUpload shipments={shipments} />}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <FilterTabs
              items={[
                { label: "All", href: listHref(BASE, { q }), count: matching, active: !type },
                ...tabTypes.map((t) => ({
                  label: docTypeLabel(t),
                  href: listHref(BASE, { type: t, q }),
                  count: countOf(t),
                  active: type === t,
                })),
              ]}
            />
            <SearchForm action={BASE} q={q} label="Search documents" placeholder="File name or shipment no." hidden={{ type }} />
          </div>

          {rows.length === 0 ? (
            <Card padded={false}>
              <EmptyState
                icon={SearchX}
                title="No documents match"
                description={
                  q
                    ? `Nothing matches "${q}"${type ? ` under ${docTypeLabel(type)}` : ""}. Try part of the file name or the shipment number.`
                    : `Nothing has been filed under ${docTypeLabel(type)} yet.`
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
                  ? `Showing the ${LIMIT} newest documents. Search or pick a type to narrow the list.`
                  : `${rows.length} ${rows.length === 1 ? "document" : "documents"}`
              }
            >
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>File</th>
                    <th className={thClass}>Shipment</th>
                    <th className={thClass}>Uploaded</th>
                    <th className={cx(thClass, "text-right")}>
                      <span className="sr-only">Download</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d) => {
                    const name = fileNameFromUrl(d.file_url);
                    return (
                      <tr key={d.id} className={trClass}>
                        <td className={tdClass}>
                          <div className="flex items-center gap-3">
                            <FileText size={18} strokeWidth={1.6} className="shrink-0 text-slate-400" aria-hidden />
                            <div className="min-w-0">
                              <a
                                href={d.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open in a new tab"
                                className={cx(rowLinkClass, "block max-w-[18rem] truncate")}
                              >
                                {name}
                              </a>
                              <StatusBadge label={docTypeLabel(d.doc_type)} tone="slate" className="mt-1" />
                            </div>
                          </div>
                        </td>
                        <td className={tdClass}>
                          <Link
                            href={`/admin/shipments/${d.shipment_id}`}
                            className="font-medium text-[var(--accent-ink)] underline-offset-4 hover:underline"
                          >
                            {d.shipment_no}
                          </Link>
                        </td>
                        <td className={cx(tdClass, "whitespace-nowrap")}>
                          <time dateTime={d.created_at} title={timeAgo(d.created_at)}>
                            {formatDate(d.created_at)}
                          </time>
                        </td>
                        <td className={cx(tdClass, "text-right")}>
                          <a href={d.file_url} download className={buttonClass("secondary", "sm")} aria-label={`Download ${name}`}>
                            <Download size={15} aria-hidden /> Download
                          </a>
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
