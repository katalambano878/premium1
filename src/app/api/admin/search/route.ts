import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { canAccess } from "@/lib/auth/roles";
import { query } from "@/lib/db/pool";

export const dynamic = "force-dynamic";

type Hit = { type: string; title: string; subtitle: string; href: string };

/**
 * Record search for the dashboard's ⌘K palette. Staff only, and each staff
 * member only gets hits from the sections their role can open.
 */
export async function GET(request: NextRequest) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const term = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 80);
  if (term.length < 2) return NextResponse.json({ results: [] });
  // Escape LIKE wildcards so "%" and "_" are searched literally.
  const like = `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

  const searches: Promise<Hit[]>[] = [];
  const run = (sql: string, map: (r: Record<string, string>) => Hit) =>
    searches.push(
      query<Record<string, string>>(sql, [like])
        .then((r) => r.rows.map(map))
        .catch((e) => {
          console.error("[admin search]", e);
          return [];
        }),
    );

  if (canAccess(me.role, "inquiries")) {
    run(
      `SELECT id, inquiry_no, full_name, company_name, origin, destination FROM inquiries
        WHERE inquiry_no ILIKE $1 OR full_name ILIKE $1 OR company_name ILIKE $1 OR email ILIKE $1
        ORDER BY created_at DESC LIMIT 5`,
      (r) => ({
        type: "Enquiry",
        title: `${r.inquiry_no} · ${r.full_name}`,
        subtitle: [r.company_name, `${r.origin} → ${r.destination}`].filter(Boolean).join(" · "),
        href: `/admin/inquiries/${r.id}`,
      }),
    );
  }
  if (canAccess(me.role, "shipments")) {
    run(
      `SELECT s.id, s.shipment_no, s.origin, s.destination, c.company_name FROM shipments s
         LEFT JOIN clients c ON c.id = s.client_id
        WHERE s.shipment_no ILIKE $1 OR s.origin ILIKE $1 OR s.destination ILIKE $1 OR c.company_name ILIKE $1
        ORDER BY s.created_at DESC LIMIT 5`,
      (r) => ({
        type: "Shipment",
        title: r.shipment_no,
        subtitle: [r.company_name, `${r.origin} → ${r.destination}`].filter(Boolean).join(" · "),
        href: `/admin/shipments/${r.id}`,
      }),
    );
  }
  if (canAccess(me.role, "clients")) {
    run(
      `SELECT id, company_name, contact_name, email FROM clients
        WHERE company_name ILIKE $1 OR contact_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1
        ORDER BY company_name LIMIT 5`,
      (r) => ({ type: "Client", title: r.company_name, subtitle: [r.contact_name, r.email].filter(Boolean).join(" · "), href: `/admin/clients/${r.id}` }),
    );
  }
  if (canAccess(me.role, "finance")) {
    run(
      `SELECT i.id, i.invoice_no, i.status, c.company_name FROM invoices i
         LEFT JOIN clients c ON c.id = i.client_id
        WHERE i.invoice_no ILIKE $1 OR c.company_name ILIKE $1
        ORDER BY i.created_at DESC LIMIT 5`,
      (r) => ({ type: "Invoice", title: r.invoice_no, subtitle: [r.company_name, r.status].filter(Boolean).join(" · "), href: `/admin/finance/${r.id}` }),
    );
  }
  if (canAccess(me.role, "customs")) {
    run(
      `SELECT d.id, d.declaration_no, d.status, s.shipment_no FROM customs_declarations d
         LEFT JOIN shipments s ON s.id = d.shipment_id
        WHERE d.declaration_no ILIKE $1 OR s.shipment_no ILIKE $1
        ORDER BY d.updated_at DESC NULLS LAST LIMIT 5`,
      (r) => ({
        type: "Declaration",
        title: r.declaration_no || "Declaration (not yet numbered)",
        subtitle: [r.shipment_no, r.status].filter(Boolean).join(" · "),
        href: `/admin/customs/${r.id}`,
      }),
    );
  }

  const results = (await Promise.all(searches)).flat();
  return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
}
