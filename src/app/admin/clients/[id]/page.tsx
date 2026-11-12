import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Crown, Mail, Phone, Truck, User } from "lucide-react";
import { NoteForm } from "@/components/admin/NoteForm";
import { ClientForm } from "@/components/admin/ClientForm";
import { updateClient, addClientNote } from "../actions";

const TIER_COLORS: Record<string, string> = {
  vip: "bg-amber-100 text-amber-700 border-amber-200",
  standard: "bg-slate-100 text-slate-600 border-slate-200",
  new: "bg-blue-100 text-blue-700 border-blue-200",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  booked: "bg-blue-100 text-blue-700",
  in_transit: "bg-amber-100 text-amber-700",
  arrived: "bg-cyan-100 text-cyan-700",
  clearing: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-emerald-100 text-emerald-700",
};

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  if (!supabase) return <p className="p-8 text-slate-500">Database not configured.</p>;

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!client) notFound();

  const [{ data: shipments }, { data: notes }, { data: invoices }] = await Promise.all([
    supabase
      .from("shipments")
      .select("id, shipment_no, origin, destination, status, created_at")
      .eq("client_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("client_notes")
      .select("*, staff_users(full_name)")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, invoice_no, total, status")
      .eq("client_id", id),
  ]);

  // Financial Summary
  let totalRevenue = 0;
  let outstanding = 0;
  (invoices || []).forEach((inv) => {
    const t = Number(inv.total || 0);
    if (inv.status === "paid") totalRevenue += t;
    if (inv.status === "sent" || inv.status === "overdue") outstanding += t;
  });

  const tier = client.tier || "standard";

  return (
    <div className="max-w-6xl space-y-6">
      <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} /> Back to clients
      </Link>

      {/* Profile Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <span className="text-xl font-bold text-slate-500">
                {client.company_name?.charAt(0)?.toUpperCase() || "C"}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{client.company_name}</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${TIER_COLORS[tier]}`}>
                  {tier === "vip" && <Crown size={10} className="inline mr-0.5" />}
                  {tier}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1"><User size={13} /> {client.contact_name}</span>
                <span className="flex items-center gap-1"><Mail size={13} /> {client.email}</span>
                <span className="flex items-center gap-1"><Phone size={13} /> {client.phone}</span>
              </div>
              {client.industry && <p className="text-xs text-slate-400 mt-1 capitalize">Industry: {client.industry}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 font-medium">Outstanding</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">${outstanding.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 font-medium">Credit Limit</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {client.credit_limit ? `$${Number(client.credit_limit).toLocaleString()}` : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 font-medium">Total Shipments</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{shipments?.length || 0}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipment History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">Shipment History</h2>
              <Link href="/admin/shipments/new" className="text-xs text-[var(--accent)] font-semibold hover:underline">
                + New Shipment
              </Link>
            </div>
            {shipments && shipments.length > 0 ? (
              <div className="space-y-2">
                {shipments.map((s) => (
                  <Link
                    key={s.id}
                    href={`/admin/shipments/${s.id}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Truck size={16} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-[var(--accent)]">{s.shipment_no}</p>
                        <p className="text-[11px] text-slate-500">{s.origin} → {s.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[s.status] || "bg-slate-100"}`}>
                        {s.status?.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">No shipments for this client.</p>
            )}
          </div>

          {/* Invoices */}
          {invoices && invoices.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Invoices</h2>
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
            </div>
          )}

          {/* Communication Notes */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Communication Notes</h2>
            <NoteForm action={addClientNote} entityId={id} fieldName="client_id" />
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
        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Edit Client</h2>
            <ClientForm action={updateClient} client={client} />
          </div>
        </div>
      </div>
    </div>
  );
}
