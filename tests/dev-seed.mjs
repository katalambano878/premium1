// Fills the LOCAL dev database with sample records so the dashboard can be
// looked at with realistic data. Never run against production: it refuses any
// database whose name does not end in _dev.
//
//   node --env-file=.env.local tests/dev-seed.mjs
//
// Sign in locally with DEV_ADMIN_EMAIL / DEV_ADMIN_PASSWORD from .env.local.
import bcrypt from "bcryptjs";
import pg from "pg";

const url = process.env.DATABASE_URL || "";
if (!/_dev(\?|$)/.test(url)) {
  console.error("Refusing to seed: DATABASE_URL must point at a *_dev database.");
  process.exit(1);
}
const email = process.env.DEV_ADMIN_EMAIL || "admin@premium1.test";
const password = process.env.DEV_ADMIN_PASSWORD;
if (!password) {
  console.error("Set DEV_ADMIN_PASSWORD in .env.local first.");
  process.exit(1);
}

const db = new pg.Client({ connectionString: url });
await db.connect();
const q = (text, params) => db.query(text, params).then((r) => r.rows);
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const dateIn = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

await db.query(`TRUNCATE payments, invoice_items, invoices, customs_declarations, shipment_documents, shipment_events, shipments,
  inquiry_notes, inquiry_files, inquiries, client_notes, clients, activity_log, notifications, rate_limits,
  staff_password_tokens, staff_credentials, staff_users RESTART IDENTITY CASCADE`).catch(async (e) => {
  console.warn("truncate skipped some tables:", e.message);
});

// Staff
const staff = {};
for (const [mail, name, role, active] of [
  [email, "Dev Admin", "admin", true],
  ["ops@premium1.test", "Kojo Boateng", "operations", true],
  ["docs@premium1.test", "Efua Sarpong", "documentation", true],
  ["care@premium1.test", "Abena Owusu", "customer_service", true],
  ["old@premium1.test", "Yaw Darko", "operations", false],
]) {
  const [row] = await q("INSERT INTO staff_users (email, full_name, role, is_active) VALUES ($1,$2,$3,$4) RETURNING id", [mail, name, role, active]);
  staff[role + (active ? "" : "_old")] = row.id;
}
await q("INSERT INTO staff_credentials (email, password_hash) VALUES ($1,$2)", [email, await bcrypt.hash(password, 10)]);
await q("UPDATE staff_users SET last_sign_in_at = NOW() - interval '2 hours' WHERE email = 'ops@premium1.test'");
await q("INSERT INTO staff_credentials (email, password_hash) VALUES ('ops@premium1.test', $1)", [await bcrypt.hash(password, 10)]);

// Clients
const clients = [];
for (const [company, contact, mail, phone, tier, industry, limit, terms] of [
  ["Asante Trading Ltd", "Kwame Asante", "kwame@asantetrading.test", "+233 24 555 0101", "vip", "Mining supply", 50000, "net_30"],
  ["Mensah Imports", "Ama Mensah", "ama@mensahimports.test", "+233 20 555 0102", "standard", "FMCG", 15000, "net_15"],
  ["Osei Industries", "David Osei", "david@oseiindustries.test", "+233 27 555 0103", "standard", "Manufacturing", 25000, "net_30"],
  ["Coastal Retail Group", "Naa Lamptey", "naa@coastalretail.test", "+233 55 555 0104", "new", "Retail", null, "prepaid"],
]) {
  const [row] = await q(
    `INSERT INTO clients (company_name, contact_name, email, phone, address, tier, industry, credit_limit, payment_terms)
     VALUES ($1,$2,$3,$4,'Accra, Ghana',$5,$6,$7,$8) RETURNING id`,
    [company, contact, mail, phone, tier, industry, limit, terms],
  );
  clients.push(row.id);
}
await q("INSERT INTO client_notes (client_id, body, author_id) VALUES ($1, 'Prefers WhatsApp updates. Always needs the duty estimate before arrival.', $2)", [clients[0], staff.customer_service]);

// Enquiries
const inquiries = [];
const inqRows = [
  ["Kwame Asante", "Asante Trading Ltd", "kwame@asantetrading.test", "Shanghai, China", "Kumasi, Ghana", "sea", "won", "high", 12, { type: "Mining spares", weight: "8,400 kg", quantity: "1 x 40ft", dimensions: "" }],
  ["Ama Mensah", "Mensah Imports", "ama@mensahimports.test", "Guangzhou, China", "Tema, Ghana", "sea", "quoted", "medium", 4, { type: "Household goods", weight: "5,200 kg", quantity: "1 x 20ft", dimensions: "" }],
  ["Fatima Bello", "Sahel Agro", "fatima@sahelagro.test", "Tema, Ghana", "Ouagadougou, Burkina Faso", "road", "contacted", "urgent", 2, { type: "Fertiliser", weight: "24,000 kg", quantity: "960 bags", dimensions: "" }],
  ["John Carter", "", "john.carter@example.test", "Dubai, UAE", "Accra, Ghana", "air", "new", "medium", 0, { type: "Medical equipment", weight: "320 kg", quantity: "6 crates", dimensions: "120x80x100" }],
  ["Naa Lamptey", "Coastal Retail Group", "naa@coastalretail.test", "Istanbul, Turkey", "Takoradi, Ghana", "sea", "new", "low", 1, { type: "Clothing", weight: "2,100 kg", quantity: "180 cartons", dimensions: "" }],
  ["Peter Owusu", "Owusu Motors", "peter@owusumotors.test", "Hamburg, Germany", "Tema, Ghana", "sea", "lost", "medium", 30, { type: "Vehicle parts", weight: "3,000 kg", quantity: "12 pallets", dimensions: "" }],
];
for (const [name, company, mail, origin, destination, method, status, priority, age, cargo] of inqRows) {
  const [row] = await q(
    `INSERT INTO inquiries (inquiry_no, full_name, company_name, email, phone, origin, destination, method, cargo, requirements, status, priority, source, created_at, assigned_to, follow_up_at)
     VALUES (gen_inquiry_no(), $1, NULLIF($2,''), $3, '+233 24 555 0199', $4, $5, $6, $7, 'CIF terms. Need delivery within six weeks.', $8, $9, 'website', $10, $11, $12)
     RETURNING id`,
    [name, company, mail, origin, destination, method, cargo, status, priority, daysAgo(age), status === "new" ? null : staff.customer_service, status === "contacted" ? daysAgo(1) : null],
  );
  inquiries.push(row.id);
}
await q("INSERT INTO inquiry_notes (inquiry_id, body, author_id) VALUES ($1, 'Called the client; they want a road quote including border fees.', $2)", [inquiries[2], staff.customer_service]);

// Shipments
const shipments = [];
const shipRows = [
  [clients[0], inquiries[0], "sea", "Shanghai, China", "Kumasi, Ghana", "in_transit", 10],
  [clients[1], null, "sea", "Guangzhou, China", "Tema, Ghana", "clearing", 25],
  [clients[2], null, "air", "Frankfurt, Germany", "Accra, Ghana", "delivered", 40],
  [clients[0], null, "road", "Tema, Ghana", "Bamako, Mali", "booked", 3],
  [clients[3], null, "sea", "Istanbul, Turkey", "Takoradi, Ghana", "draft", 1],
];
for (const [client, inquiry, method, origin, destination, status, age] of shipRows) {
  const [row] = await q(
    `INSERT INTO shipments (shipment_no, inquiry_id, client_id, method, origin, destination, cargo, status, assigned_to, key_dates, created_at)
     VALUES (gen_shipment_no(), $1, $2, $3, $4, $5, '{"type":"General cargo","weight":"5,000 kg"}', $6, $7, $8, $9) RETURNING id`,
    [inquiry, client, method, origin, destination, status, staff.operations, { etd: dateIn(-age + 2), eta: dateIn(-age + 30) }, daysAgo(age)],
  );
  shipments.push(row.id);
  await q("INSERT INTO shipment_events (shipment_id, event_type, message, created_by, created_at) VALUES ($1,'created','Shipment created',$2,$3)", [row.id, staff.operations, daysAgo(age)]);
  if (status !== "draft") {
    await q("INSERT INTO shipment_events (shipment_id, event_type, message, created_by, created_at) VALUES ($1,'status_change',$2,$3,$4)", [row.id, `Status changed to ${status.replace(/_/g, " ")}`, staff.operations, daysAgo(Math.max(age - 2, 0))]);
  }
}

// Customs
await q(
  `INSERT INTO customs_declarations (shipment_id, declaration_no, status, hs_codes, duty_amount, tax_amount, query_details, query_deadline, notes)
   VALUES ($1, 'C-2026-01842', 'query', ARRAY['8431.43','8474.90'], 12400, 3100, 'Customs asked for the manufacturer''s invoice to support the declared value.', $2, 'Valuation query raised at Tema.')`,
  [shipments[1], dateIn(3)],
).catch(async () => {
  await q(
    `INSERT INTO customs_declarations (shipment_id, declaration_no, status, duty_amount, tax_amount, query_details, query_deadline, notes)
     VALUES ($1, 'C-2026-01842', 'query', 12400, 3100, 'Customs asked for the manufacturer''s invoice to support the declared value.', $2, 'Valuation query raised at Tema.')`,
    [shipments[1], dateIn(3)],
  );
});
await q("INSERT INTO customs_declarations (shipment_id, declaration_no, status, duty_amount, tax_amount, released_at) VALUES ($1, 'C-2026-01411', 'released', 2200, 640, NOW() - interval '30 days')", [shipments[2]]);
await q("INSERT INTO customs_declarations (shipment_id, status) VALUES ($1, 'draft')", [shipments[0]]);

// Invoices
async function invoice(client, shipment, currency, status, due, lines, paid) {
  const subtotal = lines.reduce((s, l) => s + l[1] * l[2], 0);
  const [inv] = await q(
    `INSERT INTO invoices (invoice_no, shipment_id, client_id, currency, subtotal, tax, total, status, due_date, paid_at)
     VALUES (gen_invoice_no(), $1, $2, $3, $4, 0, $4, $5, $6, $7) RETURNING id`,
    [shipment, client, currency, subtotal, status, due, status === "paid" ? daysAgo(5) : null],
  );
  for (const [description, quantity, price] of lines) {
    await q("INSERT INTO invoice_items (invoice_id, description, charge_type, quantity, unit_price, amount) VALUES ($1,$2,'freight',$3,$4,$5)", [inv.id, description, quantity, price, quantity * price]);
  }
  if (paid) await q("INSERT INTO payments (invoice_id, amount, method, reference) VALUES ($1,$2,'bank_transfer','TRX-88213')", [inv.id, paid]);
}
await invoice(clients[2], shipments[2], "USD", "paid", dateIn(-20), [["Air freight Frankfurt to Accra", 1, 4200], ["Customs clearance", 1, 650]], 4850);
await invoice(clients[1], shipments[1], "USD", "sent", dateIn(12), [["Ocean freight 1 x 20ft", 1, 2900], ["Port handling", 1, 480]], 1000);
await invoice(clients[0], shipments[0], "GHS", "overdue", dateIn(-6), [["Inland haulage Tema to Kumasi", 1, 18500]], 0);
await invoice(clients[3], shipments[4], "USD", "draft", dateIn(30), [["Ocean freight LCL", 1, 1150]], 0);

// Activity
for (const [type, action, actor, age] of [
  ["shipment", "changed status to in_transit", "ops@premium1.test", 0.2],
  ["invoice", "recorded payment", email, 1],
  ["inquiry", "added note", "care@premium1.test", 1.5],
  ["customs", "updated declaration status to query", "docs@premium1.test", 2],
  ["client", "created client", email, 3],
]) {
  await q("INSERT INTO activity_log (entity_type, action, actor_email, metadata, created_at) VALUES ($1,$2,$3,'{}',$4)", [type, action, actor, daysAgo(age)]);
}

console.log(`Seeded premium1_dev. Sign in at /auth/admin as ${email} (password: DEV_ADMIN_PASSWORD in .env.local).`);
await db.end();
