import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { addPayment } from "../actions";
import { InvoiceStatusButton } from "@/components/admin/InvoiceStatusButton";
import { PaymentForm } from "@/components/admin/PaymentForm";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  void: "bg-slate-100 text-slate-400",
};

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  if (!supabase) return <p>The database is not connected.</p>;

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, clients(company_name, email)")
    .eq("id", id)
    .single();

  if (!invoice) return <p className="text-slate-500">Invoice not found.</p>;

  const { data: items } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", id)
    .order("created_at");

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", id)
    .order("paid_at", { ascending: false });

  const client = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients;
  const totalPaid = (payments || []).reduce((s: number, p) => s + Number(p.amount), 0);
  const balance = Number(invoice.total) - totalPaid;

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/admin/finance" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} /> Back to finance
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{invoice.invoice_no}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {client?.company_name || "Unknown"} · Created {new Date(invoice.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase ${STATUS_COLORS[invoice.status] || ""}`}>
            {invoice.status}
          </span>
        </div>
      </div>

      {/* Status Actions */}
      <div className="flex flex-wrap gap-2">
        {invoice.status === "draft" && (
          <InvoiceStatusButton invoiceId={id} newStatus="sent" label="Mark as Sent" icon="send" />
        )}
        {(invoice.status === "sent" || invoice.status === "overdue") && (
          <InvoiceStatusButton invoiceId={id} newStatus="paid" label="Mark as Paid" icon="check" />
        )}
        {invoice.status !== "void" && invoice.status !== "paid" && (
          <InvoiceStatusButton invoiceId={id} newStatus="void" label="Void" icon="x" variant="danger" />
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 font-medium">Total</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{invoice.currency} {Number(invoice.total).toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 font-medium">Paid</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{invoice.currency} {totalPaid.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500 font-medium">Balance</p>
          <p className={`text-2xl font-bold mt-1 ${balance > 0 ? "text-amber-600" : "text-slate-400"}`}>
            {invoice.currency} {balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Line Items */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Line Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase">Description</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase">Type</th>
              <th className="text-right px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase">Qty</th>
              <th className="text-right px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase">Price</th>
              <th className="text-right px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {(items || []).map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3 text-slate-700 font-medium">{item.description}</td>
                <td className="px-5 py-3 text-slate-500 capitalize">{item.charge_type}</td>
                <td className="px-5 py-3 text-right text-slate-600">{item.quantity}</td>
                <td className="px-5 py-3 text-right text-slate-600">{Number(item.unit_price).toLocaleString()}</td>
                <td className="px-5 py-3 text-right font-semibold text-slate-800">{Number(item.amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-200">
            <tr>
              <td colSpan={4} className="px-5 py-2 text-right text-xs text-slate-500 font-medium">Subtotal</td>
              <td className="px-5 py-2 text-right font-semibold text-slate-700">{Number(invoice.subtotal).toLocaleString()}</td>
            </tr>
            <tr>
              <td colSpan={4} className="px-5 py-2 text-right text-xs text-slate-500 font-medium">Tax</td>
              <td className="px-5 py-2 text-right font-semibold text-slate-700">{Number(invoice.tax).toLocaleString()}</td>
            </tr>
            <tr className="bg-slate-50">
              <td colSpan={4} className="px-5 py-3 text-right text-sm font-bold text-slate-800">Total</td>
              <td className="px-5 py-3 text-right text-lg font-bold text-slate-900">{invoice.currency} {Number(invoice.total).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payments */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Payments</h2>
        {payments && payments.length > 0 ? (
          <div className="space-y-2 mb-4">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{invoice.currency} {Number(p.amount).toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{p.method || "—"} · {p.reference || "No ref"}</p>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(p.paid_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 mb-4">No payments recorded.</p>
        )}

        {balance > 0 && invoice.status !== "void" && (
          <PaymentForm invoiceId={id} action={addPayment} />
        )}
      </div>

      {invoice.notes && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-2">Notes</h2>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
