import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { query } from "@/lib/db/pool";
import { SESSION_COOKIE, signSession } from "@/lib/auth/token";
import { testCookies } from "./stubs/next-headers";
import { createStaff as seedStaff, jsonRequest, validQuote } from "./helpers";
import { sentEmails } from "./setup";
import { createStaff, sendPasswordLink } from "@/app/admin/staff/actions";
import { convertToShipment, updateInquiryStatus } from "@/app/admin/inquiries/actions";
import { GET as search } from "@/app/api/admin/search/route";
import { POST as quote } from "@/app/api/inquiries/route";
import { POST as resetPassword } from "@/app/api/admin/password/reset/route";
import { POST as login } from "@/app/api/admin/login/route";
import { getCreateItems, getNavItems } from "@/lib/auth/roles";

type Role = "admin" | "operations" | "documentation" | "customer_service";

async function signInAs(role: Role) {
  const email = `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@premium1logistics.com`;
  const id = await seedStaff(email, role);
  testCookies.jar.set(SESSION_COOKIE, { name: SESSION_COOKIE, value: await signSession({ email, role }) });
  return { id, email };
}
const form = (fields: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
};
const find = (q: string) => search(new NextRequest(`https://premium1logistics.com/api/admin/search?q=${encodeURIComponent(q)}`));

describe("staff invites", () => {
  it("emails a new staff member a link that lets them set a password and sign in", async () => {
    await signInAs("admin");
    const email = `invitee-${Date.now()}@premium1logistics.com`;
    await createStaff(form({ full_name: "New Person", email, role: "operations" }));

    const invite = sentEmails.find((m) => m.to[0] === email);
    expect(invite?.subject).toMatch(/dashboard account/);
    const token = decodeURIComponent(invite!.plain_body.match(/token=([^\s&]+)/)![1]);

    testCookies.clear();
    expect((await resetPassword(jsonRequest("/api/admin/password/reset", { token, password: "tema-harbour-77" }))).status).toBe(200);
    expect((await login(jsonRequest("/api/admin/login", { email, password: "tema-harbour-77" }))).status).toBe(200);
  });

  it("keeps the account but reports it when the invite email fails", async () => {
    await signInAs("admin");
    globalThis.fetch = (async () => new Response("{}", { status: 500 })) as typeof fetch;
    const email = `noemail-${Date.now()}@premium1logistics.com`;
    await expect(createStaff(form({ full_name: "No Email", email, role: "operations" }))).rejects.toThrow(/invite email could not be sent/);
    expect((await query("SELECT 1 FROM staff_users WHERE email = $1", [email])).rows).toHaveLength(1);
  });

  it("lets an admin re-send a password link, but not other roles and not to deactivated staff", async () => {
    const target = await signInAs("operations");
    await expect(sendPasswordLink(form({ id: target.id }))).rejects.toThrow(/cannot change staff/);

    await signInAs("admin");
    await sendPasswordLink(form({ id: target.id }));
    expect(sentEmails.filter((m) => m.to[0] === target.email)).toHaveLength(1);

    await query("UPDATE staff_users SET is_active = false WHERE id = $1", [target.id]);
    await expect(sendPasswordLink(form({ id: target.id }))).rejects.toThrow(/Reactivate/);
  });
});

describe("dashboard record search", () => {
  it("needs a signed-in staff member", async () => {
    testCookies.clear();
    expect((await find("anything")).status).toBe(401);
  });

  it("finds enquiries by name and treats % as plain text", async () => {
    await signInAs("customer_service");
    const marker = `Zephyrine${Date.now()}`;
    await quote(jsonRequest("/api/inquiries", { ...validQuote, full_name: marker }));
    const hits = (await (await find(marker.slice(0, 12))).json()).results;
    expect(hits.some((h: { type: string; title: string }) => h.type === "Enquiry" && h.title.includes(marker))).toBe(true);
    expect((await (await find("%%%")).json()).results).toEqual([]);
    expect((await (await find("a")).json()).results).toEqual([]);
  });

  it("only returns record types the role can open", async () => {
    await signInAs("customer_service");
    const types = new Set((await (await find("INQ-")).json()).results.map((h: { type: string }) => h.type));
    await query(
      `WITH c AS (INSERT INTO clients (company_name, contact_name, email, phone) VALUES ('Searchable Co', 'S', 's@example.com', '1') RETURNING id)
       INSERT INTO invoices (invoice_no, client_id, currency, subtotal, tax, total, status) SELECT gen_invoice_no(), id, 'USD', 1, 0, 1, 'draft' FROM c`,
    );
    const csHits = (await (await find("Searchable")).json()).results.map((h: { type: string }) => h.type);
    expect(csHits).toContain("Client");
    expect(csHits).not.toContain("Invoice");
    expect([...types].every((t) => t === "Enquiry" || t === "Client")).toBe(true);

    await signInAs("operations");
    expect((await (await find("Searchable")).json()).results.map((h: { type: string }) => h.type)).toContain("Invoice");
  });
});

describe("role-aware navigation", () => {
  it("only offers sections and shortcuts each role may use", () => {
    expect(getNavItems("customer_service").map((n) => n.label)).toEqual(["Dashboard", "Enquiries", "Clients"]);
    expect(getCreateItems("customer_service").map((n) => n.label)).toEqual(["New client"]);
    expect(getCreateItems("documentation").map((n) => n.label)).toEqual(["New declaration"]);
    expect(getNavItems("admin")).toHaveLength(9);
  });
});

describe("lost enquiries", () => {
  it("cannot be converted into a shipment", async () => {
    await signInAs("admin");
    const { id } = await (await quote(jsonRequest("/api/inquiries", validQuote))).json();
    await updateInquiryStatus(form({ id, status: "lost" }));
    await expect(convertToShipment(form({ id }))).rejects.toThrow(/marked lost/);
    expect((await query("SELECT count(*)::int AS n FROM shipments WHERE inquiry_id = $1", [id])).rows[0].n).toBe(0);
  });
});
