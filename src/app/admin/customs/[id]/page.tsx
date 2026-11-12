import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { updateDeclarationDetails } from "../actions";
import { DeclarationStatusActions } from "@/components/admin/DeclarationStatusActions";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-blue-100 text-blue-700",
  query: "bg-amber-100 text-amber-700",
  amended: "bg-purple-100 text-purple-700",
  released: "bg-emerald-100 text-emerald-700",
};

export default async function DeclarationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  if (!supabase) return <p>The database is not connected.</p>;

  const { data: decl } = await supabase
    .from("customs_declarations")
    .select("*, shipments(shipment_no, origin, destination)")
    .eq("id", id)
    .single();

  if (!decl) return <p className="text-slate-500">Declaration not found.</p>;

  const ship = Array.isArray(decl.shipments) ? decl.shipments[0] : decl.shipments;
  const hsCodes = Array.isArray(decl.hs_codes) ? decl.hs_codes : [];

  async function handleSave(formData: FormData) {
    "use server";
    formData.set("id", id);
    await updateDeclarationDetails(formData);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/admin/customs" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} /> Back to customs
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {decl.declaration_no || "Draft Declaration"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {ship?.shipment_no && (
              <Link href={`/admin/shipments/${decl.shipment_id}`} className="text-[var(--accent)] hover:underline">
                {ship.shipment_no}
              </Link>
            )}
            {ship && ` · ${ship.origin} → ${ship.destination}`}
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase ${STATUS_COLORS[decl.status] || ""}`}>
          {decl.status}
        </span>
      </div>

      {/* Status Actions */}
      <DeclarationStatusActions declarationId={id} currentStatus={decl.status} />

      {/* Timeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Timeline</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <TimelineItem label="Created" date={decl.created_at} />
          <TimelineItem label="Submitted" date={decl.submitted_at} />
          <TimelineItem label="Released" date={decl.released_at} />
        </div>
      </div>

      {/* Details Form */}
      <form action={handleSave} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-800">Declaration Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Declaration #</label>
            <input name="declaration_no" defaultValue={decl.declaration_no || ""} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">HS Codes (comma-separated)</label>
            <input name="hs_codes" defaultValue={hsCodes.join(", ")} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" placeholder="8471.30, 8541.40" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Duty Amount ($)</label>
            <input name="duty_amount" type="number" step="0.01" defaultValue={decl.duty_amount || ""} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tax Amount ($)</label>
            <input name="tax_amount" type="number" step="0.01" defaultValue={decl.tax_amount || ""} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
          </div>
        </div>

        {decl.status === "query" && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Query Details</label>
              <textarea name="query_details" rows={3} defaultValue={decl.query_details || ""} className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-amber-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200" placeholder="Details of customs query..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Response Deadline</label>
              <input name="query_deadline" type="date" defaultValue={decl.query_deadline?.slice(0, 10) || ""} className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-amber-50/30 text-sm" />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
          <textarea name="notes" rows={3} defaultValue={decl.notes || ""} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
        </div>

        <button type="submit" className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)]">
          Save Details
        </button>
      </form>
    </div>
  );
}

function TimelineItem({ label, date }: { label: string; date?: string | null }) {
  return (
    <div className="text-center p-3 rounded-xl bg-slate-50">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-1">
        {date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
      </p>
    </div>
  );
}
