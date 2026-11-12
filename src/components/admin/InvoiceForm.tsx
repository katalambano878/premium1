"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";

interface LineItem {
  description: string;
  charge_type: string;
  quantity: number;
  unit_price: number;
}

export function InvoiceForm({
  action,
  clients,
  shipments,
}: {
  action: (fd: FormData) => Promise<void>;
  clients: { id: string; company_name: string }[];
  shipments: { id: string; shipment_no: string }[];
}) {
  const [items, setItems] = useState<LineItem[]>([{ description: "", charge_type: "freight", quantity: 1, unit_price: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [pending, startTransition] = useTransition();

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const addItem = () => setItems([...items, { description: "", charge_type: "other", quantity: 1, unit_price: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof LineItem, val: string | number) => {
    setItems(items.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("tax_rate", String(taxRate));
    fd.set("item_count", String(items.length));
    items.forEach((item, i) => {
      fd.set(`item_desc_${i}`, item.description);
      fd.set(`item_type_${i}`, item.charge_type);
      fd.set(`item_qty_${i}`, String(item.quantity));
      fd.set(`item_price_${i}`, String(item.unit_price));
    });
    startTransition(() => action(fd));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Client *</label>
          <select name="client_id" required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20">
            <option value="">Select client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.company_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Shipment (optional)</label>
          <select name="shipment_id" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20">
            <option value="">None</option>
            {shipments.map((s) => (
              <option key={s.id} value={s.id}>{s.shipment_no}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Currency</label>
          <select name="currency" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20">
            <option value="USD">USD</option>
            <option value="GHS">GHS</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Due Date</label>
          <input type="date" name="due_date" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
        </div>
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-slate-600">Line Items</label>
          <button type="button" onClick={addItem} className="text-xs text-[var(--accent)] font-semibold hover:underline flex items-center gap-1">
            <Plus size={14} /> Add item
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-4">
                {i === 0 && <span className="text-[10px] text-slate-400 font-medium">Description</span>}
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                  placeholder="Description"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                />
              </div>
              <div className="col-span-2">
                {i === 0 && <span className="text-[10px] text-slate-400 font-medium">Type</span>}
                <select
                  value={item.charge_type}
                  onChange={(e) => updateItem(i, "charge_type", e.target.value)}
                  className="w-full px-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                >
                  <option value="freight">Freight</option>
                  <option value="customs">Customs</option>
                  <option value="handling">Handling</option>
                  <option value="insurance">Insurance</option>
                  <option value="storage">Storage</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-span-2">
                {i === 0 && <span className="text-[10px] text-slate-400 font-medium">Qty</span>}
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                  min="1"
                  className="w-full px-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                />
              </div>
              <div className="col-span-3">
                {i === 0 && <span className="text-[10px] text-slate-400 font-medium">Unit Price</span>}
                <input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateItem(i, "unit_price", Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="w-full px-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                />
              </div>
              <div className="col-span-1 flex justify-center">
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="p-2 text-slate-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-semibold text-slate-800">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-500 flex items-center gap-2">
            Tax
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              min="0"
              max="100"
              step="0.5"
              className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs"
            />
            %
          </span>
          <span className="font-semibold text-slate-800">${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
          <span className="font-bold text-slate-800">Total</span>
          <span className="font-bold text-slate-900 text-lg">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes</label>
        <textarea name="notes" rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" placeholder="Optional notes..." />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create Invoice"}
      </button>
    </form>
  );
}
