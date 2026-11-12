import { describe, expect, it } from "vitest";
import { query } from "@/lib/db/pool";
import { SESSION_COOKIE, signSession } from "@/lib/auth/token";
import { testCookies } from "./stubs/next-headers";
import { createStaff, freshIp, jsonRequest, validQuote } from "./helpers";
import { sentEmails } from "./setup";
import { addPayment, createInvoice, updateInvoiceStatus } from "@/app/admin/finance/actions";
import { convertToShipment, addInquiryNote, updateInquiryStatus } from "@/app/admin/inquiries/actions";
import { updateShipmentStatus } from "@/app/admin/shipments/actions";
import { updateDeclarationDetails, updateDeclarationStatus } from "@/app/admin/customs/actions";
import { createStaff as createStaffAction, toggleStaffActive, updateStaffRole } from "@/app/admin/staff/actions";
import { refreshOverdueInvoices } from "@/lib/finance";
import { POST as quote } from "@/app/api/inquiries/route";

type Role = "admin" | "operations" | "documentation" | "customer_service";

/** Signs the test in as a new staff member with this role. */
async function signInAs(role: Role) {
  const email = `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@premium1logistics.com`;
  const id = await createStaff(email, role);
  testCookies.jar.set(SESSION_COOKIE, { name: SESSION_COOKIE, value: await signSession({ email, role }) });
  return { id, email };
}

const form = (fields: Record<string, string | number>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, String(v));
  return fd;
};

async function newClient() {
  const { rows } = await query<{ id: string }>(
    "INSERT INTO clients (company_name, contact_name, email, phone) VALUES ('Asante Trading', 'Kwame Asante', 'kwame@example.com', '+233200000000') RETURNING id",
  );
  return rows[0].id;
}

/** Runs a server action that ends in redirect(); returns the redirect target. */
async function redirectOf(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    const digest = (e as { digest?: string }).digest || "";
    if (digest.startsWith("NEXT_REDIRECT")) return digest.split(";")[2];
    throw e;
  }
  return null;
}

describe("role checks on admin actions", () => {
  it("refuses every write without a session", async () => {
    await expect(createInvoice(form({ client_id: crypto.randomUUID(), currency: "USD" }))).rejects.toThrow(/Not signed in/);
  });

  it("keeps customer service out of finance and shipments", async () => {
    await signInAs("customer_service");
    const clientId = await newClient();
    await expect(
      createInvoice(form({ client_id: clientId, currency: "USD", item_count: 1, item_desc_0: "Freight", item_qty_0: 1, item_price_0: 100 })),
    ).rejects.toThrow(/cannot change finance/);
    await expect(updateShipmentStatus(form({ id: crypto.randomUUID(), status: "booked" }))).rejects.toThrow(/cannot change shipments/);
  });

  it("keeps documentation staff out of enquiries", async () => {
    await signInAs("documentation");
    await expect(updateInquiryStatus(form({ id: crypto.randomUUID(), status: "won" }))).rejects.toThrow(/cannot change inquiries/);
  });

  it("applies a demotion to writes immediately, not when the cookie expires", async () => {
    const me = await signInAs("operations");
    await query("UPDATE staff_users SET role = 'customer_service' WHERE id = $1", [me.id]);
    await expect(updateShipmentStatus(form({ id: crypto.randomUUID(), status: "booked" }))).rejects.toThrow(/cannot change shipments/);
  });

  it("rejects status values the database would refuse", async () => {
    await signInAs("admin");
    await expect(updateInquiryStatus(form({ id: crypto.randomUUID(), status: "maybe" }))).rejects.toThrow(/Invalid status/);
  });
});

describe("invoices and payments", () => {
  it("saves an invoice with every line, skipping blank lines, with tax", async () => {
    await signInAs("operations");
    const clientId = await newClient();
    const invoiceId = await createInvoice(
      form({
        client_id: clientId,
        currency: "GHS",
        tax_rate: 10,
        item_count: 3,
        item_desc_0: "Ocean freight",
        item_qty_0: 1,
        item_price_0: 1000,
        item_desc_1: "",
        item_desc_2: "Port handling",
        item_qty_2: 2,
        item_price_2: 250,
      }),
    );
    const inv = (await query("SELECT * FROM invoices WHERE id = $1", [invoiceId])).rows[0];
    expect(inv).toMatchObject({ currency: "GHS", subtotal: 1500, tax: 150, total: 1650, status: "draft" });
    expect(inv.invoice_no).toMatch(/^INV-\d{8}-\d{4}$/);
    const items = (await query("SELECT description FROM invoice_items WHERE invoice_id = $1 ORDER BY amount DESC", [invoiceId])).rows;
    expect(items.map((i) => i.description)).toEqual(["Ocean freight", "Port handling"]);
  });

  it("saves nothing when a line is invalid", async () => {
    await signInAs("admin");
    const clientId = await newClient();
    const before = (await query("SELECT count(*)::int AS n FROM invoices")).rows[0].n;
    await expect(
      createInvoice(form({ client_id: clientId, currency: "USD", item_count: 1, item_desc_0: "Freight", item_qty_0: 0, item_price_0: 10 })),
    ).rejects.toThrow(/quantity/);
    await expect(createInvoice(form({ client_id: clientId, currency: "USD", item_count: 0 }))).rejects.toThrow(/at least one line/);
    expect((await query("SELECT count(*)::int AS n FROM invoices")).rows[0].n).toBe(before);
  });

  it("marks an invoice paid once payments cover it, not before", async () => {
    await signInAs("admin");
    const invoiceId = await createInvoice(
      form({ client_id: await newClient(), currency: "USD", item_count: 1, item_desc_0: "Freight", item_qty_0: 1, item_price_0: 500 }),
    );
    await updateInvoiceStatus(form({ id: invoiceId, status: "sent" }));
    await addPayment(form({ invoice_id: invoiceId, amount: 200, method: "bank" }));
    expect((await query("SELECT status FROM invoices WHERE id = $1", [invoiceId])).rows[0].status).toBe("sent");
    await addPayment(form({ invoice_id: invoiceId, amount: 300, method: "bank" }));
    const inv = (await query("SELECT status, paid_at FROM invoices WHERE id = $1", [invoiceId])).rows[0];
    expect(inv.status).toBe("paid");
    expect(inv.paid_at).toBeTruthy();
    await expect(addPayment(form({ invoice_id: invoiceId, amount: 0 }))).rejects.toThrow(/above 0/);
  });

  it("refuses overpayments and payments on draft or void invoices", async () => {
    await signInAs("admin");
    const invoiceId = (await createInvoice(
      form({ client_id: await newClient(), currency: "USD", item_count: 1, item_desc_0: "Freight", item_qty_0: 1, item_price_0: 100 }),
    )) as string;
    await expect(addPayment(form({ invoice_id: invoiceId, amount: 50 }))).rejects.toThrow(/Mark the invoice as sent/);
    await updateInvoiceStatus(form({ id: invoiceId, status: "sent" }));
    await expect(addPayment(form({ invoice_id: invoiceId, amount: 150 }))).rejects.toThrow(/more than the balance/);
    await updateInvoiceStatus(form({ id: invoiceId, status: "void" }));
    await expect(addPayment(form({ invoice_id: invoiceId, amount: 50 }))).rejects.toThrow(/void/);
  });

  it("records the balance as a payment when an invoice is marked paid", async () => {
    await signInAs("admin");
    const invoiceId = (await createInvoice(
      form({ client_id: await newClient(), currency: "USD", item_count: 1, item_desc_0: "Freight", item_qty_0: 1, item_price_0: 400 }),
    )) as string;
    await updateInvoiceStatus(form({ id: invoiceId, status: "sent" }));
    await addPayment(form({ invoice_id: invoiceId, amount: 150 }));
    await updateInvoiceStatus(form({ id: invoiceId, status: "paid" }));
    const { rows } = await query("SELECT SUM(amount) AS paid FROM payments WHERE invoice_id = $1", [invoiceId]);
    expect(Number(rows[0].paid)).toBe(400);
  });

  it("turns sent invoices past their due date into overdue", async () => {
    await signInAs("admin");
    const invoiceId = await createInvoice(
      form({ client_id: await newClient(), currency: "USD", due_date: "2026-01-01", item_count: 1, item_desc_0: "Freight", item_qty_0: 1, item_price_0: 50 }),
    );
    await updateInvoiceStatus(form({ id: invoiceId, status: "sent" }));
    await refreshOverdueInvoices();
    expect((await query("SELECT status FROM invoices WHERE id = $1", [invoiceId])).rows[0].status).toBe("overdue");
  });
});

describe("enquiries to shipments", () => {
  it("converts an enquiry once, reusing the client by email in any case", async () => {
    const me = await signInAs("operations");
    const uniqueEmail = `reuse-${Date.now()}@example.com`;
    const existing = (
      await query<{ id: string }>(
        "INSERT INTO clients (company_name, contact_name, email, phone) VALUES ('Mensah Imports', 'Ama', $1, '1') RETURNING id",
        [uniqueEmail],
      )
    ).rows[0].id;
    const { id: inquiryId } = await (await quote(jsonRequest("/api/inquiries", { ...validQuote, email: uniqueEmail.toUpperCase() }, freshIp()))).json();

    const to = await redirectOf(convertToShipment(form({ id: inquiryId })));
    const ship = (await query("SELECT * FROM shipments WHERE inquiry_id = $1", [inquiryId])).rows;
    expect(ship).toHaveLength(1);
    expect(to).toBe(`/admin/shipments/${ship[0].id}`);
    expect(ship[0].client_id).toBe(existing);
    expect((await query("SELECT status FROM inquiries WHERE id = $1", [inquiryId])).rows[0].status).toBe("won");
    const ev = (await query("SELECT created_by FROM shipment_events WHERE shipment_id = $1", [ship[0].id])).rows[0];
    expect(ev.created_by).toBe(me.id);

    // A double-click doesn't make a second shipment.
    await redirectOf(convertToShipment(form({ id: inquiryId })));
    expect((await query("SELECT count(*)::int AS n FROM shipments WHERE inquiry_id = $1", [inquiryId])).rows[0].n).toBe(1);
  });

  it("records who wrote a note", async () => {
    const me = await signInAs("customer_service");
    const { id: inquiryId } = await (await quote(jsonRequest("/api/inquiries", validQuote))).json();
    await addInquiryNote(form({ inquiry_id: inquiryId, body: "Called the client" }));
    expect((await query("SELECT author_id FROM inquiry_notes WHERE inquiry_id = $1", [inquiryId])).rows[0].author_id).toBe(me.id);
  });

  it("sends the client a real email when their quote is ready, once", async () => {
    await signInAs("admin");
    const { id: inquiryId } = await (await quote(jsonRequest("/api/inquiries", validQuote))).json();
    sentEmails.length = 0;
    await updateInquiryStatus(form({ id: inquiryId, status: "quoted" }));
    await updateInquiryStatus(form({ id: inquiryId, status: "quoted" }));
    const mails = sentEmails.filter((m) => m.to[0] === validQuote.email);
    expect(mails).toHaveLength(1);
    expect(mails[0].subject).toMatch(/quote for INQ-/);
    expect(mails[0].plain_body).not.toContain("Notification:");
    expect(mails[0].reply_to).toBe("info@premium1logistics.com");
  });

  it("emails the client a tracking link when the shipment goes in transit", async () => {
    await signInAs("operations");
    const { id: inquiryId } = await (await quote(jsonRequest("/api/inquiries", validQuote))).json();
    const shipmentPath = await redirectOf(convertToShipment(form({ id: inquiryId })));
    const shipmentId = shipmentPath!.split("/").pop()!;
    sentEmails.length = 0;
    await updateShipmentStatus(form({ id: shipmentId, status: "in_transit" }));
    const mail = sentEmails.find((m) => m.to[0] === validQuote.email);
    expect(mail?.subject).toMatch(/is on its way/);
    expect(mail?.plain_body).toMatch(/premium1logistics\.com\/track\?ref=SHP-/);
  });
});

describe("customs", () => {
  it("keeps the query details when the declaration is saved after the query", async () => {
    await signInAs("documentation");
    const { id: inquiryId } = await (await quote(jsonRequest("/api/inquiries", validQuote))).json();
    await signInAs("operations");
    const shipmentId = (await redirectOf(convertToShipment(form({ id: inquiryId }))))!.split("/").pop()!;
    await signInAs("documentation");
    const declId = (
      await query<{ id: string }>("INSERT INTO customs_declarations (shipment_id, status) VALUES ($1, 'draft') RETURNING id", [shipmentId])
    ).rows[0].id;

    await updateDeclarationStatus(form({ id: declId, status: "query" }));
    await updateDeclarationDetails(form({ id: declId, query_details: "HS code challenged", query_deadline: "2026-12-01", duty_amount: "0" }));
    await updateDeclarationStatus(form({ id: declId, status: "amended" }));
    await updateDeclarationDetails(form({ id: declId, declaration_no: "C-123", duty_amount: "0" }));

    const d = (await query("SELECT * FROM customs_declarations WHERE id = $1", [declId])).rows[0];
    expect(d.query_details).toBe("HS code challenged");
    expect(d.declaration_no).toBe("C-123");
    expect(d.duty_amount).toBe(0);
  });
});

describe("staff management", () => {
  it("only lets admins manage staff, and rejects duplicate emails", async () => {
    await signInAs("operations");
    await expect(createStaffAction(form({ full_name: "X", email: "x@premium1logistics.com", role: "admin" }))).rejects.toThrow(/cannot change staff/);
    await signInAs("admin");
    const email = `new-${Date.now()}@premium1logistics.com`;
    await createStaffAction(form({ full_name: "New Person", email, role: "operations" }));
    await expect(createStaffAction(form({ full_name: "Again", email: email.toUpperCase(), role: "operations" }))).rejects.toThrow(/already has/);
  });

  it("never leaves the team without an active admin", async () => {
    await query("UPDATE staff_users SET is_active = false WHERE role = 'admin'");
    const me = await signInAs("admin");
    await expect(updateStaffRole(form({ id: me.id, role: "operations" }))).rejects.toThrow(/at least one active admin/);
    await expect(toggleStaffActive(form({ id: me.id }))).rejects.toThrow(/at least one active admin/);
  });
});

describe("seeded data", () => {
  it("has every template the dashboard sends, and a settings row", async () => {
    const keys = (await query<{ k: string }>("SELECT key || ':' || channel AS k FROM notification_templates WHERE is_active")).rows.map((r) => r.k);
    for (const k of [
      "inquiry_confirmation:email",
      "quote_ready:email",
      "shipment_dispatched:email",
      "shipment_arrived:email",
      "shipment_delivered:email",
      "shipment_dispatched:sms",
      "shipment_delivered:sms",
      "new_inquiry_alert:sms",
    ]) {
      expect(keys).toContain(k);
    }
    expect((await query("SELECT count(*)::int AS n FROM site_settings")).rows[0].n).toBe(1);
  });
});
