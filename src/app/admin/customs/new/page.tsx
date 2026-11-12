import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createDeclaration } from "../actions";
import { redirect } from "next/navigation";

async function handleCreate(formData: FormData) {
  "use server";
  const id = await createDeclaration(formData);
  redirect(id ? `/admin/customs/${id}` : "/admin/customs");
}

export default async function NewDeclarationPage() {
  const supabase = createServiceRoleClient();
  const { data: shipments } = await supabase
    ?.from("shipments")
    .select("id, shipment_no, origin, destination")
    .order("created_at", { ascending: false })
    .limit(50) || { data: [] };

  return (
    <div className="max-w-2xl">
      <Link href="/admin/customs" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6">
        <ArrowLeft size={16} /> Back to customs
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">New Customs Declaration</h1>

      <form action={handleCreate} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Shipment *</label>
          <select name="shipment_id" required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20">
            <option value="">Select shipment</option>
            {(shipments || []).map((s) => (
              <option key={s.id} value={s.id}>{s.shipment_no} — {s.origin} → {s.destination}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Declaration Number</label>
          <input name="declaration_no" type="text" placeholder="e.g. DEC-2025-001" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Estimated Duty ($)</label>
            <input name="duty_amount" type="number" step="0.01" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Estimated Tax ($)</label>
            <input name="tax_amount" type="number" step="0.01" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes</label>
          <textarea name="notes" rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" placeholder="Notes..." />
        </div>
        <button type="submit" className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm hover:bg-[var(--accent-hover)] transition-colors">
          Create Declaration
        </button>
      </form>
    </div>
  );
}
