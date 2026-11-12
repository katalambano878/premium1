import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ClipboardCheck, Download, FileText, Mail, Plus, Receipt } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { query } from "@/lib/db/pool";
import { money } from "@/lib/finance";
import {
  ButtonLink,
  Callout,
  Card,
  CardHeader,
  DetailList,
  EmptyState,
  PageHeader,
  StatusBadge,
  buttonClass,
  formatDate,
  formatDateTime,
} from "@/components/admin/ui";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { AssignSelect } from "@/components/admin/AssignSelect";
import { NoteForm } from "@/components/admin/NoteForm";
import { ShipmentTimeline, type ShipmentEvent } from "@/components/admin/ShipmentTimeline";
import { KeyDatesEditor } from "@/components/admin/KeyDatesEditor";
import { NotesEditor } from "@/components/admin/NotesEditor";
import { ShipmentTabs } from "@/components/admin/ShipmentTabs";
import { DocumentUpload } from "@/components/admin/DocumentUpload";
import { CopyTrackingLink } from "@/components/admin/shipments/CopyTrackingLink";
import { ShipmentProgress } from "@/components/admin/shipments/ShipmentProgress";
import { DbOffline } from "@/components/admin/shipments/parts";
import { SHIPMENT_STAGES, isUuid, methodLabel } from "@/components/admin/shipments/format";
import { docTypeLabel, fileNameFromUrl } from "@/components/admin/documents/doc-types";
import { addShipmentEvent, assignShipment, updateKeyDates, updateShipmentNotes, updateShipmentStatus } from "../actions";

type Shipment = {
  id: string;
  shipment_no: string;
  inquiry_id: string | null;
  inquiry_no: string | null;
  client_id: string;
  company_name: string;
  contact_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  method: string;
  origin: string;
  destination: string;
  cargo: unknown;
  status: string;
  assigned_to: string | null;
  key_dates: unknown;
  cost_notes: string | null;
  service_notes: string | null;
  vessel_name: string | null;
  voyage_no: string | null;
  bl_no: string | null;
  container_nos: unknown;
  estimated_departure: string | null;
  estimated_arrival: string | null;
  actual_departure: string | null;
  actual_arrival: string | null;
  total_cost: number | null;
  total_revenue: number | null;
  currency: string | null;
  created_at: string;
};
type Doc = { id: string; doc_type: string; file_url: string; created_at: string };
type Declaration = { id: string; declaration_no: string | null; status: string; duty_amount: number | null; tax_amount: number | null };
type Invoice = { id: string; invoice_no: string; total: number | null; currency: string | null; status: string; due_date: string | null };

const asRecord = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const fieldLabel = (key: string) => key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
const sectionTitle = "text-base font-medium text-[var(--navy)]";
const textLink = "font-medium text-[var(--accent-ink)] underline-offset-4 hover:underline";

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  if (!createServiceRoleClient()) return <DbOffline />;

  const { rows: found } = await query<Shipment>(
    `SELECT s.*, c.company_name, c.contact_name, c.email AS client_email, c.phone AS client_phone, i.inquiry_no
       FROM shipments s
       JOIN clients c ON c.id = s.client_id
       LEFT JOIN inquiries i ON i.id = s.inquiry_id
      WHERE s.id = $1`,
    [id],
  );
  const shipment = found[0];
  if (!shipment) notFound();

  const [{ rows: events }, { rows: docs }, { rows: staff }, { rows: customs }, { rows: invoices }] = await Promise.all([
    query<ShipmentEvent>(
      `SELECT e.id, e.event_type, e.message, e.created_at, u.full_name AS author
         FROM shipment_events e LEFT JOIN staff_users u ON u.id = e.created_by
        WHERE e.shipment_id = $1 ORDER BY e.created_at DESC`,
      [id],
    ),
    query<Doc>("SELECT id, doc_type, file_url, created_at FROM shipment_documents WHERE shipment_id = $1 ORDER BY created_at DESC", [id]),
    query<{ id: string; full_name: string }>("SELECT id, full_name FROM staff_users WHERE is_active = true ORDER BY full_name"),
    query<Declaration>(
      "SELECT id, declaration_no, status, duty_amount, tax_amount FROM customs_declarations WHERE shipment_id = $1 ORDER BY created_at DESC",
      [id],
    ),
    query<Invoice>("SELECT id, invoice_no, total, currency, status, due_date FROM invoices WHERE shipment_id = $1 ORDER BY created_at DESC", [id]),
  ]);

  const currency = shipment.currency || "USD";
  const keyDates: Record<string, string> = {};
  for (const [k, v] of Object.entries(asRecord(shipment.key_dates))) if (typeof v === "string") keyDates[k] = v;
  const cargo = Object.entries(asRecord(shipment.cargo)).filter(([, v]) => (typeof v === "string" && v.trim()) || typeof v === "number");
  const containers = Array.isArray(shipment.container_nos) ? shipment.container_nos.filter((c): c is string => typeof c === "string") : [];
  const cost = Number(shipment.total_cost || 0);
  const revenue = Number(shipment.total_revenue || 0);
  const schedule = [
    { label: "Estimated departure", value: shipment.estimated_departure },
    { label: "Actual departure", value: shipment.actual_departure },
    { label: "Estimated arrival", value: shipment.estimated_arrival },
    { label: "Actual arrival", value: shipment.actual_arrival },
  ].filter((d) => d.value);
  const contact = [shipment.contact_name, shipment.client_phone, shipment.client_email].filter(Boolean).join(" · ");

  const summary: { label: string; value: React.ReactNode }[] = [
    {
      label: "Client",
      value: (
        <>
          <Link href={`/admin/clients/${shipment.client_id}`} className={textLink}>
            {shipment.company_name}
          </Link>
          {contact ? <span className="mt-0.5 block text-sm font-normal text-slate-500">{contact}</span> : null}
        </>
      ),
    },
    {
      label: "Route",
      value: (
        <span className="inline-flex flex-wrap items-center gap-x-1.5">
          {shipment.origin}
          <ArrowRight size={15} className="shrink-0 text-slate-400" aria-label="to" />
          {shipment.destination}
        </span>
      ),
    },
    { label: "Method", value: methodLabel(shipment.method) },
    {
      label: "Cargo",
      value: cargo.length ? (
        <ul className="space-y-0.5">
          {cargo.map(([k, v]) => (
            <li key={k}>
              <span className="font-normal text-slate-500">{fieldLabel(k)}:</span> {String(v)}
            </li>
          ))}
        </ul>
      ) : (
        <span className="font-normal text-slate-500">No cargo details recorded</span>
      ),
    },
    ...(shipment.vessel_name
      ? [{ label: "Vessel", value: `${shipment.vessel_name}${shipment.voyage_no ? `, voyage ${shipment.voyage_no}` : ""}` }]
      : []),
    ...(shipment.bl_no ? [{ label: "Bill of lading no.", value: shipment.bl_no }] : []),
    ...(containers.length ? [{ label: containers.length === 1 ? "Container" : "Containers", value: containers.join(", ") }] : []),
    ...(shipment.inquiry_id
      ? [
          {
            label: "Linked enquiry",
            value: (
              <Link href={`/admin/inquiries/${shipment.inquiry_id}`} className={textLink}>
                {shipment.inquiry_no || "View enquiry"}
              </Link>
            ),
          },
        ]
      : []),
    { label: "Created", value: formatDateTime(shipment.created_at) },
  ];

  return (
    <div className="max-w-5xl">
      <PageHeader
        title={shipment.shipment_no}
        badge={<StatusBadge status={shipment.status} />}
        description={`${shipment.origin} to ${shipment.destination} for ${shipment.company_name}`}
        back={{ href: "/admin/shipments", label: "Shipments" }}
        actions={
          <>
            <div className="flex items-center gap-2 text-[13px] text-slate-500">
              <span aria-hidden>Status</span>
              <StatusSelect currentStatus={shipment.status} statuses={SHIPMENT_STAGES} action={updateShipmentStatus} entityId={id} />
            </div>
            <div className="flex items-center gap-2 text-[13px] text-slate-500">
              <span aria-hidden>Assigned to</span>
              <AssignSelect currentAssignee={shipment.assigned_to} staff={staff} action={assignShipment} entityId={id} />
            </div>
            <CopyTrackingLink shipmentNo={shipment.shipment_no} />
          </>
        }
      />

      <div className="space-y-5">
        <Card>
          <h2 className={`${sectionTitle} mb-5`}>Progress</h2>
          <ShipmentProgress status={shipment.status} />
        </Card>

        <Callout icon={Mail}>
          Changing the status to In transit, Arrived or Delivered emails {shipment.company_name} automatically. In transit and Delivered also
          send a text message.
        </Callout>

        <Card>
          <CardHeader title="Summary" />
          <DetailList columns={3} items={summary} />
        </Card>

        <ShipmentTabs
          tabs={[
            {
              id: "updates",
              label: "Updates",
              count: events.length,
              content: (
                <div className="space-y-5">
                  <div>
                    <NoteForm
                      action={addShipmentEvent}
                      entityId={id}
                      fieldName="shipment_id"
                      placeholder="Write an update, e.g. Vessel berthed at Tema"
                    />
                    <p className="mt-2 text-[13px] leading-5 text-slate-500">
                      Updates appear on the client&apos;s tracking page, so write them for the client. Keep internal remarks in the notes
                      under Invoices and notes.
                    </p>
                  </div>
                  <ShipmentTimeline events={events} />
                </div>
              ),
            },
            {
              id: "dates",
              label: "Key dates",
              content: (
                <div className="space-y-6">
                  <div>
                    <h3 className={sectionTitle}>Milestone dates</h3>
                    <p className="mb-4 mt-0.5 text-sm leading-6 text-slate-500">
                      Fill these in as they become known. Clients see them on the tracking page, and the arrival date is the ETA shown in
                      the shipments list.
                    </p>
                    <KeyDatesEditor action={updateKeyDates} entityId={id} current={keyDates} />
                  </div>
                  {schedule.length ? (
                    <div className="border-t border-slate-200 pt-5">
                      <h3 className={`${sectionTitle} mb-4`}>Carrier schedule</h3>
                      <DetailList columns={2} items={schedule.map((d) => ({ label: d.label, value: formatDate(d.value) }))} />
                    </div>
                  ) : null}
                </div>
              ),
            },
            {
              id: "documents",
              label: "Documents",
              count: docs.length,
              content: docs.length ? (
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className={sectionTitle}>Shipment documents</h3>
                    <DocumentUpload
                      shipments={[{ id, shipment_no: shipment.shipment_no }]}
                      shipmentId={id}
                      variant="secondary"
                      size="sm"
                      label="Upload"
                    />
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {docs.map((d) => {
                      const name = fileNameFromUrl(d.file_url);
                      return (
                        <li key={d.id} className="flex items-center gap-3 py-3">
                          <FileText size={18} strokeWidth={1.6} className="shrink-0 text-slate-400" aria-hidden />
                          <div className="min-w-0 flex-1">
                            <a
                              href={d.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate text-sm font-medium text-[var(--navy)] underline-offset-4 hover:underline"
                            >
                              {name}
                            </a>
                            <p className="text-[13px] text-slate-500">
                              {docTypeLabel(d.doc_type)} · Uploaded {formatDate(d.created_at)}
                            </p>
                          </div>
                          <a href={d.file_url} download className={buttonClass("secondary", "sm")} aria-label={`Download ${name}`}>
                            <Download size={15} aria-hidden /> <span className="hidden sm:inline">Download</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <EmptyState
                  compact
                  icon={FileText}
                  title="No documents yet"
                  description="Keep the bill of lading, commercial invoice, packing list and other paperwork for this shipment here."
                  action={<DocumentUpload shipments={[{ id, shipment_no: shipment.shipment_no }]} shipmentId={id} />}
                />
              ),
            },
            {
              id: "finance",
              label: "Invoices and notes",
              count: invoices.length,
              content: (
                <div className="space-y-6">
                  <DetailList
                    columns={3}
                    items={[
                      { label: "Cost", value: money(cost, currency) },
                      { label: "Revenue", value: money(revenue, currency) },
                      {
                        label: "Profit",
                        value: <span className={revenue - cost < 0 ? "text-red-700" : undefined}>{money(revenue - cost, currency)}</span>,
                      },
                    ]}
                  />
                  <div className="border-t border-slate-200 pt-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className={sectionTitle}>Invoices</h3>
                      {invoices.length ? (
                        <ButtonLink href="/admin/finance/new" variant="secondary" size="sm">
                          <Plus size={15} /> New invoice
                        </ButtonLink>
                      ) : null}
                    </div>
                    {invoices.length ? (
                      <ul className="divide-y divide-slate-100">
                        {invoices.map((inv) => (
                          <li key={inv.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                            <div className="min-w-0">
                              <Link href={`/admin/finance/${inv.id}`} className="text-sm font-medium text-[var(--navy)] underline-offset-4 hover:underline">
                                {inv.invoice_no}
                              </Link>
                              <p className="text-[13px] text-slate-500">{inv.due_date ? `Due ${formatDate(inv.due_date)}` : "No due date"}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium tabular-nums text-[var(--navy)]">
                                {money(Number(inv.total || 0), inv.currency || "USD")}
                              </span>
                              <StatusBadge status={inv.status} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <EmptyState
                        compact
                        icon={Receipt}
                        title="No invoices for this shipment"
                        description="Invoices raised against this shipment are listed here with their status."
                        action={
                          <ButtonLink href="/admin/finance/new" variant="secondary">
                            <Plus size={16} /> New invoice
                          </ButtonLink>
                        }
                      />
                    )}
                  </div>
                  <div className="border-t border-slate-200 pt-5">
                    <h3 className={sectionTitle}>Internal notes</h3>
                    <p className="mb-4 mt-0.5 text-sm leading-6 text-slate-500">Only staff can see these.</p>
                    <NotesEditor
                      action={updateShipmentNotes}
                      entityId={id}
                      costNotes={shipment.cost_notes || ""}
                      serviceNotes={shipment.service_notes || ""}
                    />
                  </div>
                </div>
              ),
            },
            {
              id: "customs",
              label: "Customs",
              count: customs.length,
              content: customs.length ? (
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className={sectionTitle}>Customs declarations</h3>
                    <ButtonLink href={`/admin/customs/new?shipment=${id}`} variant="secondary" size="sm">
                      <Plus size={15} /> New declaration
                    </ButtonLink>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {customs.map((c) => (
                      <li key={c.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                        <div className="min-w-0">
                          <Link href={`/admin/customs/${c.id}`} className="text-sm font-medium text-[var(--navy)] underline-offset-4 hover:underline">
                            {c.declaration_no || "Not yet numbered"}
                          </Link>
                          <p className="text-[13px] text-slate-500">
                            Duty {c.duty_amount != null ? money(c.duty_amount, currency) : "not set"} · Tax{" "}
                            {c.tax_amount != null ? money(c.tax_amount, currency) : "not set"}
                          </p>
                        </div>
                        <StatusBadge status={c.status} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <EmptyState
                  compact
                  icon={ClipboardCheck}
                  title="No customs declaration yet"
                  description="Start a declaration when this shipment needs clearing, then track duty, tax and any customs queries on it."
                  action={
                    <ButtonLink href={`/admin/customs/new?shipment=${id}`} variant="secondary">
                      <Plus size={16} /> New declaration
                    </ButtonLink>
                  }
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
