import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Anchor, Box, FileIcon, MapPin, Ship } from "lucide-react";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { AssignSelect } from "@/components/admin/AssignSelect";
import { NoteForm } from "@/components/admin/NoteForm";
import { ShipmentTimeline } from "@/components/admin/ShipmentTimeline";
import { KeyDatesEditor } from "@/components/admin/KeyDatesEditor";
import { NotesEditor } from "@/components/admin/NotesEditor";
import { ShipmentTabs } from "@/components/admin/ShipmentTabs";
import {
  updateShipmentStatus,
  assignShipment,
  addShipmentEvent,
  updateKeyDates,
  updateShipmentNotes,
} from "../actions";

const STATUSES = ["draft", "booked", "in_transit", "arrived", "clearing", "out_for_delivery", "delivered"];

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  if (!supabase) return <p className="p-8 text-slate-500">Database not configured.</p>;

  const { data: shipment } = await supabase
    .from("shipments")
    .select("*, clients(id, company_name, contact_name, email, phone)")
    .eq("id", id)
    .single();

  if (!shipment) notFound();

  const [{ data: events }, { data: docs }, { data: staff }, { data: customs }, { data: invoices }] = await Promise.all([
    supabase.from("shipment_events").select("*").eq("shipment_id", id).order("created_at", { ascending: false }),
    supabase.from("shipment_documents").select("*").eq("shipment_id", id).order("created_at", { ascending: false }),
    supabase.from("staff_users").select("id, full_name").eq("is_active", true).order("full_name"),
    supabase.from("customs_declarations").select("id, declaration_no, status, duty_amount, tax_amount").eq("shipment_id", id),
    supabase.from("invoices").select("id, invoice_no, total, status").eq("shipment_id", id),
  ]);

  const keyDates = (shipment.key_dates && typeof shipment.key_dates === "object")
    ? shipment.key_dates as Record<string, string>
    : {};
  const client = shipment.clients as Record<string, string> | null;
  const cargo = (shipment.cargo && typeof shipment.cargo === "object") ? shipment.cargo as Record<string, string> : {};
  const containers = Array.isArray(shipment.container_nos) ? shipment.container_nos : [];
  const currentStageIdx = STATUSES.indexOf(shipment.status);

  return (
    <div className="max-w-6xl space-y-6">
      <Link href="/admin/shipments" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} /> Back to shipments
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{shipment.shipment_no}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {shipment.origin} → {shipment.destination}
            {shipment.vessel_name && ` · ${shipment.vessel_name}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusSelect
            currentStatus={shipment.status}
            statuses={STATUSES}
            action={updateShipmentStatus}
            entityId={id}
          />
        </div>
      </div>

      {/* Milestone Tracker */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-1 overflow-x-auto">
          {STATUSES.map((stage, idx) => {
            const done = idx <= currentStageIdx;
            const current = idx === currentStageIdx;
            return (
              <div key={stage} className="flex items-center flex-1 min-w-[90px]">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    done
                      ? current
                        ? "bg-[var(--accent)] text-white ring-4 ring-[var(--accent)]/20"
                        : "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-[10px] font-semibold mt-1.5 capitalize whitespace-nowrap ${
                    done ? "text-slate-700" : "text-slate-400"
                  }`}>
                    {stage.replace(/_/g, " ")}
                  </span>
                </div>
                {idx < STATUSES.length - 1 && (
                  <div className={`h-0.5 flex-1 min-w-[20px] mx-1 rounded transition-colors ${
                    idx < currentStageIdx ? "bg-emerald-400" : "bg-slate-200"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabbed Content */}
          <ShipmentTabs
            overviewContent={
              <div className="space-y-6">
                {/* Route & Cargo */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <InfoItem icon={<MapPin size={16} />} label="Origin" value={shipment.origin} />
                  <InfoItem icon={<MapPin size={16} />} label="Destination" value={shipment.destination} />
                  <InfoItem icon={<Ship size={16} />} label="Method" value={shipment.method} />
                  {shipment.vessel_name && <InfoItem icon={<Anchor size={16} />} label="Vessel" value={`${shipment.vessel_name}${shipment.voyage_no ? ` / ${shipment.voyage_no}` : ""}`} />}
                  {shipment.bl_no && <InfoItem icon={<FileIcon size={16} />} label="B/L Number" value={shipment.bl_no} />}
                </div>

                {containers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Containers</h3>
                    <div className="flex flex-wrap gap-2">
                      {containers.map((c: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-100 text-sm font-mono text-slate-700">
                          <Box size={13} className="inline mr-1.5 text-slate-400" />{c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(cargo).length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cargo Details</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {Object.entries(cargo).map(([k, v]) =>
                        v ? (
                          <div key={k} className="flex justify-between p-2.5 rounded-lg bg-slate-50 text-sm">
                            <span className="text-slate-500 capitalize">{k}</span>
                            <span className="font-medium text-slate-700">{v}</span>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )}

                {/* Key Dates */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Key Dates</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { label: "Est. Departure", val: shipment.estimated_departure },
                      { label: "Act. Departure", val: shipment.actual_departure },
                      { label: "Est. Arrival", val: shipment.estimated_arrival },
                      { label: "Act. Arrival", val: shipment.actual_arrival },
                    ].map((d) => (
                      <div key={d.label} className="flex justify-between p-2.5 rounded-lg bg-slate-50 text-sm">
                        <span className="text-slate-500">{d.label}</span>
                        <span className="font-medium text-slate-700">
                          {d.val ? new Date(d.val).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <KeyDatesEditor action={updateKeyDates} entityId={id} current={keyDates} />
                  </div>
                </div>

                {shipment.inquiry_id && (
                  <Link href={`/admin/inquiries/${shipment.inquiry_id}`} className="text-sm text-[var(--accent)] hover:underline">
                    View linked inquiry →
                  </Link>
                )}
              </div>
            }
            documentsContent={
              <div>
                {docs && docs.length > 0 ? (
                  <div className="space-y-2">
                    {docs.map((d) => (
                      <a
                        key={d.id}
                        href={d.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <FileIcon size={18} className="text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{d.file_url.split("/").pop()}</p>
                          <p className="text-[11px] text-slate-400 uppercase">{d.doc_type}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 py-4 text-center">No documents uploaded yet.</p>
                )}
              </div>
            }
            financeContent={
              <div className="space-y-4">
                {/* Cost / Revenue */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Cost</p>
                    <p className="text-lg font-bold text-slate-800">{shipment.currency || "USD"} {Number(shipment.total_cost || 0).toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Revenue</p>
                    <p className="text-lg font-bold text-emerald-600">{shipment.currency || "USD"} {Number(shipment.total_revenue || 0).toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Profit</p>
                    <p className={`text-lg font-bold ${Number(shipment.total_revenue || 0) - Number(shipment.total_cost || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {shipment.currency || "USD"} {(Number(shipment.total_revenue || 0) - Number(shipment.total_cost || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Linked Invoices */}
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Linked Invoices</h3>
                {invoices && invoices.length > 0 ? (
                  <div className="space-y-2">
                    {invoices.map((inv) => (
                      <Link key={inv.id} href={`/admin/finance/${inv.id}`} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50">
                        <span className="text-sm font-semibold text-slate-700">{inv.invoice_no}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">${Number(inv.total).toLocaleString()}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            inv.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                            inv.status === "overdue" ? "bg-red-100 text-red-700" :
                            "bg-slate-100 text-slate-600"
                          }`}>{inv.status}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No invoices linked.</p>
                )}

                {/* Cost / Service Notes */}
                <NotesEditor
                  action={updateShipmentNotes}
                  entityId={id}
                  costNotes={shipment.cost_notes || ""}
                  serviceNotes={shipment.service_notes || ""}
                />
              </div>
            }
            activityContent={
              <div>
                <NoteForm action={addShipmentEvent} entityId={id} fieldName="shipment_id" />
                <div className="mt-4">
                  <ShipmentTimeline events={events || []} />
                </div>
              </div>
            }
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Client */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Client</h2>
            {client ? (
              <div className="space-y-1.5 text-sm">
                <Link href={`/admin/clients/${client.id}`} className="font-semibold text-[var(--accent)] hover:underline block">
                  {client.company_name}
                </Link>
                <p className="text-slate-600">{client.contact_name}</p>
                <p className="text-slate-500 text-xs">{client.email}</p>
                <p className="text-slate-500 text-xs">{client.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No client linked.</p>
            )}
          </div>

          {/* Assignment */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Assigned To</h2>
            <AssignSelect
              currentAssignee={shipment.assigned_to}
              staff={staff || []}
              action={assignShipment}
              entityId={id}
            />
          </div>

          {/* Customs */}
          {customs && customs.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Customs</h2>
              <div className="space-y-2">
                {customs.map((c) => (
                  <Link key={c.id} href={`/admin/customs/${c.id}`} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm font-medium text-slate-700">{c.declaration_no || "Draft"}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      c.status === "released" ? "bg-emerald-100 text-emerald-700" :
                      c.status === "query" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>{c.status}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Vessel & Container Info */}
          {(shipment.vessel_name || shipment.bl_no) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Vessel Info</h2>
              <div className="space-y-2 text-sm">
                {shipment.vessel_name && <p><span className="text-slate-500">Vessel:</span> <span className="font-medium text-slate-800">{shipment.vessel_name}</span></p>}
                {shipment.voyage_no && <p><span className="text-slate-500">Voyage:</span> <span className="font-medium text-slate-800">{shipment.voyage_no}</span></p>}
                {shipment.bl_no && <p><span className="text-slate-500">B/L #:</span> <span className="font-mono font-medium text-slate-800">{shipment.bl_no}</span></p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
      <span className="text-slate-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 capitalize">{value}</p>
      </div>
    </div>
  );
}
