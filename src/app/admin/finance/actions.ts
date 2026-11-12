"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { getPool, query } from "@/lib/db/pool";
import { logActivity } from "@/lib/activity";
import { CURRENCIES, INVOICE_STATUSES, ensure, id, num, oneOf, text } from "@/lib/admin-form";
import { createServiceRoleClient } from "@/lib/supabase/server";

const round2 = (n: number) => Math.round(n * 100) / 100;

export async function createInvoice(formData: FormData) {
  await requireRole("finance");
  const clientId = id(formData, "client_id");
  const shipmentId = text(formData, "shipment_id");
  const currency = oneOf(formData, "currency", CURRENCIES);
  const taxRate = Math.max(0, Math.min(100, num(formData, "tax_rate") ?? 0));

  // Every line with a description is kept; blank lines are skipped, not a stopping point.
  const count = Math.min(Number(formData.get("item_count")) || 50, 200);
  const items: { description: string; charge_type: string; quantity: number; unit_price: number; amount: number }[] = [];
  for (let i = 0; i < count; i++) {
    const description = text(formData, `item_desc_${i}`, 500);
    if (!description) continue;
    const quantity = num(formData, `item_qty_${i}`) ?? 1;
    const unitPrice = num(formData, `item_price_${i}`) ?? 0;
    if (quantity <= 0 || unitPrice < 0) throw new Error(`Line ${i + 1}: quantity must be above 0 and price cannot be negative.`);
    items.push({
      description,
      charge_type: text(formData, `item_type_${i}`, 40) || "other",
      quantity,
      unit_price: unitPrice,
      amount: round2(quantity * unitPrice),
    });
  }
  if (!items.length) throw new Error("Add at least one line item with a description.");

  const subtotal = round2(items.reduce((sum, i) => sum + i.amount, 0));
  const tax = round2(subtotal * (taxRate / 100));
  const total = round2(subtotal + tax);

  // The invoice and its lines are saved together or not at all.
  const client = await getPool().connect();
  let invoiceId: string;
  let invoiceNo: string;
  try {
    await client.query("BEGIN");
    const inv = await client.query<{ id: string; invoice_no: string }>(
      `INSERT INTO invoices (invoice_no, shipment_id, client_id, currency, subtotal, tax, total, status, due_date, notes)
       VALUES (gen_invoice_no(), $1, $2, $3, $4, $5, $6, 'draft', $7, $8)
       RETURNING id, invoice_no`,
      [shipmentId, clientId, currency, subtotal, tax, total, text(formData, "due_date", 10), text(formData, "notes")],
    );
    invoiceId = inv.rows[0].id;
    invoiceNo = inv.rows[0].invoice_no;
    for (const item of items) {
      await client.query(
        `INSERT INTO invoice_items (invoice_id, description, charge_type, quantity, unit_price, amount)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [invoiceId, item.description, item.charge_type, item.quantity, item.unit_price, item.amount],
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[finance] create invoice failed", e);
    throw new Error("Could not create the invoice. Please check the details and try again.");
  } finally {
    client.release();
  }

  await logActivity({ entityType: "invoice", entityId: invoiceId, action: "created invoice", metadata: { invoice_no: invoiceNo, total, currency } });
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
  return invoiceId;
}

export async function updateInvoiceStatus(formData: FormData) {
  await requireRole("finance");
  const invoiceId = id(formData);
  const status = oneOf(formData, "status", INVOICE_STATUSES);
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "paid") {
    updates.paid_at = new Date().toISOString();
    // "Mark as paid" records the remaining balance as a payment, so Collected and Balance always agree.
    await query(
      `INSERT INTO payments (invoice_id, amount, method, reference)
       SELECT i.id, i.total - COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id), 0), 'other', 'Marked as paid'
         FROM invoices i
        WHERE i.id = $1 AND i.status <> 'void'
          AND i.total - COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id), 0) > 0`,
      [invoiceId],
    );
  }
  ensure(await supabase.from("invoices").update(updates).eq("id", invoiceId), "update the invoice status");

  await logActivity({ entityType: "invoice", entityId: invoiceId, action: `marked invoice as ${status}` });
  revalidatePath(`/admin/finance/${invoiceId}`);
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
}

export async function addPayment(formData: FormData) {
  await requireRole("finance");
  const invoiceId = id(formData, "invoice_id");
  const amount = num(formData, "amount");
  if (amount === null || amount <= 0) throw new Error("Enter a payment amount above 0.");

  const { rows: state } = await query<{ status: string; balance: number }>(
    `SELECT i.status, i.total - COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id), 0) AS balance
       FROM invoices i WHERE i.id = $1`,
    [invoiceId],
  );
  if (!state[0]) throw new Error("This invoice no longer exists.");
  if (state[0].status === "void") throw new Error("This invoice is void. Payments cannot be added to it.");
  if (state[0].status === "draft") throw new Error("Mark the invoice as sent before recording a payment.");
  if (round2(amount) > round2(Number(state[0].balance))) throw new Error("That is more than the balance still owed on this invoice.");

  const { rows } = await query<{ paid: number; total: number; status: string }>(
    `WITH p AS (
       INSERT INTO payments (invoice_id, amount, method, reference) VALUES ($1, $2, $3, $4) RETURNING invoice_id
     )
     SELECT (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = $1) + $2 AS paid, i.total, i.status
       FROM invoices i WHERE i.id = $1`,
    [invoiceId, round2(amount), text(formData, "method", 40), text(formData, "reference", 200)],
  );

  // Once payments cover the total, the invoice is paid.
  const row = rows[0];
  if (row && row.status !== "void" && row.status !== "paid" && Number(row.paid) >= Number(row.total) && Number(row.total) > 0) {
    await query("UPDATE invoices SET status = 'paid', paid_at = NOW(), updated_at = NOW() WHERE id = $1", [invoiceId]);
  }

  await logActivity({ entityType: "invoice", entityId: invoiceId, action: "recorded payment", metadata: { amount } });
  revalidatePath(`/admin/finance/${invoiceId}`);
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
}
