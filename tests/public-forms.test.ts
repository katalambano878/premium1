import { describe, expect, it } from "vitest";
import { POST as quote } from "@/app/api/inquiries/route";
import { POST as contact } from "@/app/api/contact/route";
import { GET as track } from "@/app/api/track/route";
import { NextRequest } from "next/server";
import { query } from "@/lib/db/pool";
import { freshIp, jsonRequest, validQuote } from "./helpers";
import { sentEmails } from "./setup";

describe("quote request (/api/inquiries)", () => {
  it("saves the enquiry, alerts staff with reply-to the client, and confirms to the client", async () => {
    const res = await quote(jsonRequest("/api/inquiries", validQuote));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.inquiry_no).toMatch(/^INQ-\d{8}-\d{4}$/);

    const { rows } = await query("SELECT * FROM inquiries WHERE id = $1", [data.id]);
    expect(rows[0]).toMatchObject({
      full_name: "Ama Mensah",
      email: "ama@example.com",
      origin: "Shanghai, China",
      method: "sea",
      status: "new",
      source: "website",
    });
    expect(rows[0].cargo).toMatchObject({ type: "Machinery", weight: "1500" });

    const staff = sentEmails.find((m) => m.to[0] === "staff@premium1logistics.com");
    expect(staff?.subject).toContain(data.inquiry_no);
    expect(staff?.reply_to).toBe("ama@example.com");
    expect(staff?.plain_body).toContain(`/admin/inquiries/${data.id}`);
    const confirmation = sentEmails.find((m) => m.to[0] === "ama@example.com");
    expect(confirmation?.plain_body).toContain(data.inquiry_no);
  });

  it("gives each enquiry its own number", async () => {
    const a = await (await quote(jsonRequest("/api/inquiries", validQuote))).json();
    const b = await (await quote(jsonRequest("/api/inquiries", validQuote))).json();
    expect(a.inquiry_no).not.toBe(b.inquiry_no);
  });

  it.each([
    ["no origin", { origin: "" }],
    ["no destination", { destination: "  " }],
    ["bad email", { email: "ama@" }],
    ["no phone", { phone: "" }],
    ["unknown method", { method: "rocket" }],
    ["no name", { full_name: "" }],
  ])("rejects a request with %s", async (_label, patch) => {
    const res = await quote(jsonRequest("/api/inquiries", { ...validQuote, ...patch }));
    expect(res.status).toBe(400);
    expect(sentEmails).toHaveLength(0);
  });

  it("silently rejects bots that fill the hidden field", async () => {
    const res = await quote(jsonRequest("/api/inquiries", { ...validQuote, website: "http://spam" }));
    expect(res.status).toBe(400);
  });

  it("rejects a body that is not JSON", async () => {
    const res = await quote(
      new Request("https://premium1logistics.com/api/inquiries", { method: "POST", body: "nope", headers: { "x-real-ip": freshIp() } }),
    );
    expect(res.status).toBe(400);
  });

  it("caps very long fields instead of storing them whole", async () => {
    const res = await quote(jsonRequest("/api/inquiries", { ...validQuote, requirements: "x".repeat(20000) }));
    const { id } = await res.json();
    const { rows } = await query("SELECT length(requirements) AS n FROM inquiries WHERE id = $1", [id]);
    expect(rows[0].n).toBe(5000);
  });

  it("still saves the enquiry when the mail server is down", async () => {
    globalThis.fetch = (async () => new Response("down", { status: 503 })) as typeof fetch;
    const res = await quote(jsonRequest("/api/inquiries", validQuote));
    expect(res.status).toBe(200);
  });

  it("limits one visitor to 8 requests an hour", async () => {
    const ip = freshIp();
    const statuses: number[] = [];
    for (let i = 0; i < 9; i++) statuses.push((await quote(jsonRequest("/api/inquiries", validQuote, ip))).status);
    expect(statuses.slice(0, 8).every((s) => s === 200)).toBe(true);
    expect(statuses[8]).toBe(429);
  });
});

describe("contact form (/api/contact)", () => {
  const message = { name: "Kofi", email: "kofi@example.com", phone: "", company: "", message: "Do you handle reefer cargo?" };

  it("emails staff with reply-to the sender", async () => {
    const res = await contact(jsonRequest("/api/contact", message));
    expect(res.status).toBe(200);
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0]).toMatchObject({ to: ["staff@premium1logistics.com"], reply_to: "kofi@example.com" });
    expect(sentEmails[0].plain_body).toContain("reefer cargo");
  });

  it("reports failure when the email could not be sent", async () => {
    globalThis.fetch = (async () => new Response("{}", { status: 500 })) as typeof fetch;
    const res = await contact(jsonRequest("/api/contact", message));
    expect(res.status).toBe(502);
  });

  it("rejects short messages and bad emails", async () => {
    expect((await contact(jsonRequest("/api/contact", { ...message, message: "hi" }))).status).toBe(400);
    expect((await contact(jsonRequest("/api/contact", { ...message, email: "kofi" }))).status).toBe(400);
  });

  it("limits one visitor to 5 messages an hour", async () => {
    const ip = freshIp();
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await contact(jsonRequest("/api/contact", message, ip))).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  });
});

describe("shipment tracking (/api/track)", () => {
  const lookup = (ref: string, ip = freshIp()) =>
    track(new NextRequest(`https://premium1logistics.com/api/track?ref=${encodeURIComponent(ref)}`, { headers: { "x-real-ip": ip } }));

  it("finds a shipment by its number, or by the enquiry it came from", async () => {
    const { id: inquiryId, inquiry_no } = await (await quote(jsonRequest("/api/inquiries", validQuote))).json();
    const { rows } = await query<{ id: string; shipment_no: string }>(
      `WITH c AS (
         INSERT INTO clients (company_name, contact_name, email, phone)
         VALUES ('Mensah Imports', 'Ama Mensah', 'ama@example.com', '+233240000000') RETURNING id
       )
       INSERT INTO shipments (shipment_no, inquiry_id, client_id, origin, destination, method, status)
       SELECT gen_shipment_no(), $1, c.id, 'Shanghai', 'Tema', 'sea', 'in_transit' FROM c
       RETURNING id, shipment_no`,
      [inquiryId],
    );
    await query("INSERT INTO shipment_events (shipment_id, event_type, message) VALUES ($1, 'status', 'Departed Shanghai')", [rows[0].id]);

    const byShipment = await lookup(rows[0].shipment_no.toLowerCase());
    expect(byShipment.status).toBe(200);
    const body = await byShipment.json();
    expect(body).toMatchObject({ shipment_no: rows[0].shipment_no, status: "in_transit" });
    expect(body.events[0].message).toBe("Departed Shanghai");

    const byInquiry = await lookup(inquiry_no);
    expect((await byInquiry.json()).shipment_no).toBe(rows[0].shipment_no);
  });

  it("answers 404 for unknown references and 400 for empty ones", async () => {
    expect((await lookup("SHP-00000000-9999")).status).toBe(404);
    expect((await lookup("")).status).toBe(400);
  });

  it("caps lookups so reference numbers can't be stepped through", async () => {
    const ip = freshIp();
    let last = 0;
    for (let i = 0; i < 31; i++) last = (await lookup(`SHP-20260101-${String(i).padStart(4, "0")}`, ip)).status;
    expect(last).toBe(429);
  });
});
