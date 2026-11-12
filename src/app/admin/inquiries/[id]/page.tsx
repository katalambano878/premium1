import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileIcon, MapPin, Package, Phone, Mail, Building2, Ship, DollarSign, Tag, BarChart3 } from "lucide-react";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { AssignSelect } from "@/components/admin/AssignSelect";
import { NoteForm } from "@/components/admin/NoteForm";
import { ConvertButton } from "@/components/admin/ConvertButton";
import { FollowUpForm } from "@/components/admin/FollowUpForm";
import {
  updateInquiryStatus,
  assignInquiry,
  addInquiryNote,
  setFollowUp,
  convertToShipment,
} from "../actions";

const STATUSES = ["new", "contacted", "quoted", "won", "lost"];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-slate-100 text-slate-600",
  low: "bg-slate-100 text-slate-400",
};

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  if (!supabase) return <p className="p-8 text-slate-500">Database not configured.</p>;

  const { data: inquiry } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .single();

  if (!inquiry) notFound();

  const [{ data: files }, { data: notes }, { data: staff }] = await Promise.all([
    supabase.from("inquiry_files").select("*").eq("inquiry_id", id).order("created_at", { ascending: false }),
    supabase.from("inquiry_notes").select("*, staff_users(full_name)").eq("inquiry_id", id).order("created_at", { ascending: false }),
    supabase.from("staff_users").select("id, full_name").eq("is_active", true).order("full_name"),
  ]);

  const cargo = (inquiry.cargo && typeof inquiry.cargo === "object") ? inquiry.cargo as Record<string, string> : {};

  return (
    <div className="max-w-6xl space-y-6">
      <Link href="/admin/inquiries" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} /> Back to inquiries
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{inquiry.inquiry_no}</h1>
            {inquiry.priority && inquiry.priority !== "medium" && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${PRIORITY_COLORS[inquiry.priority] || ""}`}>
                {inquiry.priority}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            {inquiry.full_name} · Submitted {new Date(inquiry.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusSelect
            currentStatus={inquiry.status}
            statuses={STATUSES}
            action={updateInquiryStatus}
            entityId={id}
          />
          {inquiry.status !== "won" && inquiry.status !== "lost" && (
            <ConvertButton action={convertToShipment} entityId={id} />
          )}
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="flex flex-wrap gap-3">
        {inquiry.source && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
            <Tag size={12} /> Source: <span className="capitalize">{inquiry.source}</span>
          </div>
        )}
        {inquiry.estimated_value && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-xs font-semibold text-emerald-700">
            <DollarSign size={12} /> Est. Value: ${Number(inquiry.estimated_value).toLocaleString()}
          </div>
        )}
        {inquiry.priority && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${PRIORITY_COLORS[inquiry.priority] || PRIORITY_COLORS.medium}`}>
            <BarChart3 size={12} /> Priority: <span className="capitalize">{inquiry.priority}</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route & Cargo */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Shipment Details</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
                <MapPin size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[11px] text-slate-500">Origin</p>
                  <p className="text-sm font-medium text-slate-800">{inquiry.origin}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
                <MapPin size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[11px] text-slate-500">Destination</p>
                  <p className="text-sm font-medium text-slate-800">{inquiry.destination}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
                <Ship size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[11px] text-slate-500">Method</p>
                  <p className="text-sm font-medium text-slate-800 capitalize">{inquiry.method}</p>
                </div>
              </div>
              {Object.keys(cargo).length > 0 && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
                  <Package size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-slate-500">Cargo</p>
                    {Object.entries(cargo).map(([k, v]) =>
                      v ? <p key={k} className="text-sm text-slate-700"><span className="text-slate-500 capitalize">{k}:</span> {v}</p> : null
                    )}
                  </div>
                </div>
              )}
            </div>
            {inquiry.requirements && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[11px] text-slate-500 mb-1">Requirements</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{inquiry.requirements}</p>
              </div>
            )}
          </div>

          {/* Files */}
          {files && files.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Attached Files</h2>
              <div className="space-y-2">
                {files.map((f) => (
                  <a
                    key={f.id}
                    href={f.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <FileIcon size={18} className="text-slate-400" />
                    </div>
                    <span className="text-sm text-slate-700 flex-1 truncate">{f.file_url.split("/").pop()}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{f.file_type}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Communication Notes</h2>
            <NoteForm action={addInquiryNote} entityId={id} fieldName="inquiry_id" />
            {notes && notes.length > 0 ? (
              <div className="mt-4 space-y-3">
                {notes.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-sm text-slate-700">{n.body}</p>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      {n.staff_users?.full_name || "System"} · {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400 text-center">No notes yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Contact</h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm">
                <Building2 size={14} className="text-slate-400" />
                <span className="text-slate-700 font-medium">{inquiry.company_name || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[9px] font-bold text-[var(--accent)]">
                  {inquiry.full_name?.charAt(0)}
                </div>
                <span className="text-slate-700">{inquiry.full_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-slate-400" />
                <a href={`mailto:${inquiry.email}`} className="text-[var(--accent)] hover:underline text-xs">{inquiry.email}</a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-slate-400" />
                <span className="text-slate-700 text-xs">{inquiry.phone}</span>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Assigned To</h2>
            <AssignSelect
              currentAssignee={inquiry.assigned_to}
              staff={staff || []}
              action={assignInquiry}
              entityId={id}
            />
          </div>

          {/* Follow-up */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Follow-up</h2>
            <FollowUpForm action={setFollowUp} entityId={id} current={inquiry.follow_up_at} />
          </div>
        </div>
      </div>
    </div>
  );
}
