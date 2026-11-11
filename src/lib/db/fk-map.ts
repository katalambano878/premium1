// Foreign-key map for PostgREST-style embeds (Premium 1 Logistics).
// Mirrors the foreign keys in db/migrations. Update it when a migration adds a
// relationship or a jsonb column.

export interface FkEdge {
  column: string;
  foreignTable: string;
  foreignColumn: string;
}

export const JSONB_COLUMNS: Record<string, Set<string>> = {
  activity_log: new Set(["metadata"]),
  customs_declarations: new Set(["hs_codes"]),
  inquiries: new Set(["cargo"]),
  notifications: new Set(["payload"]),
  shipments: new Set(["cargo", "key_dates", "container_nos"]),
};

const fk = (column: string, foreignTable: string, foreignColumn = "id"): FkEdge => ({ column, foreignTable, foreignColumn });

export const FK_MAP: Record<string, FkEdge[]> = {
  client_notes: [fk("client_id", "clients"), fk("author_id", "staff_users")],
  customs_declarations: [fk("shipment_id", "shipments"), fk("assigned_to", "staff_users")],
  inquiries: [fk("assigned_to", "staff_users")],
  inquiry_files: [fk("inquiry_id", "inquiries")],
  inquiry_notes: [fk("inquiry_id", "inquiries"), fk("author_id", "staff_users")],
  invoice_items: [fk("invoice_id", "invoices")],
  invoices: [fk("shipment_id", "shipments"), fk("client_id", "clients")],
  payments: [fk("invoice_id", "invoices")],
  shipment_documents: [fk("shipment_id", "shipments")],
  shipment_events: [fk("shipment_id", "shipments"), fk("created_by", "staff_users")],
  shipments: [fk("inquiry_id", "inquiries"), fk("client_id", "clients"), fk("assigned_to", "staff_users")],
};
