"use server";

import { requireStaff } from "@/lib/auth/session";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";

export async function createInvoice(formData: FormData) {
  await requireStaff();
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const { data: invoiceNo } = await supabase.rpc("gen_invoice_no");

  const items: { description: string; charge_type: string; quantity: number; unit_price: number; amount: number }[] = [];
  let idx = 0;
  while (formData.get(`item_desc_${idx}`)) {
    const qty = Number(formData.get(`item_qty_${idx}`)) || 1;
    const price = Number(formData.get(`item_price_${idx}`)) || 0;
    items.push({
      description: formData.get(`item_desc_${idx}`) as string,
      charge_type: (formData.get(`item_type_${idx}`) as string) || "other",
      quantity: qty,
      unit_price: price,
      amount: qty * price,
    });
    idx++;
  }

  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const taxRate = Number(formData.get("tax_rate")) || 0;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      invoice_no: invoiceNo,
      shipment_id: (formData.get("shipment_id") as string) || null,
      client_id: formData.get("client_id") as string,
      currency: (formData.get("currency") as string) || "USD",
      subtotal,
      tax,
      total,
      status: "draft",
      due_date: (formData.get("due_date") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .select("id")
    .single();

  if (invoice && items.length > 0) {
    await supabase.from("invoice_items").insert(
      items.map((i) => ({ ...i, invoice_id: invoice.id }))
    );
  }

  await logActivity({
    entityType: "invoice",
    entityId: invoice?.id,
    action: "created invoice",
    metadata: { invoice_no: invoiceNo, total },
  });

  revalidatePath("/admin/finance");
  return invoice?.id;
}

export async function updateInvoiceStatus(formData: FormData) {
  await requireStaff();
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "paid") updates.paid_at = new Date().toISOString();

  await supabase.from("invoices").update(updates).eq("id", id);

  await logActivity({
    entityType: "invoice",
    entityId: id,
    action: `marked invoice as ${status}`,
  });

  revalidatePath(`/admin/finance/${id}`);
  revalidatePath("/admin/finance");
}

export async function addPayment(formData: FormData) {
  await requireStaff();
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const invoice_id = formData.get("invoice_id") as string;
  await supabase.from("payments").insert({
    invoice_id,
    amount: Number(formData.get("amount")) || 0,
    method: (formData.get("method") as string) || null,
    reference: (formData.get("reference") as string) || null,
  });

  await logActivity({
    entityType: "invoice",
    entityId: invoice_id,
    action: "recorded payment",
    metadata: { amount: Number(formData.get("amount")) },
  });

  revalidatePath(`/admin/finance/${invoice_id}`);
}
