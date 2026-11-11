-- Premium 1 Logistics: base schema for plain Postgres (fleet-postgres on big-vps).
-- Ported from supabase/migrations 001, 004 and 006. Supabase row-level security
-- policies are dropped: the app connects as the database owner and enforces
-- staff access in middleware and route handlers. Idempotent.

-- ===== from 001_initial_schema.sql
-- Premium 1 Logistics LTD - Initial Schema

-- admins (email pk) - for admin-level access
CREATE TABLE IF NOT EXISTS admins (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- staff_users
CREATE TABLE IF NOT EXISTS staff_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operations', 'documentation', 'customer_service')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- services (CMS for service pages)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- inquiries
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_no TEXT UNIQUE NOT NULL,
  company_name TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  cargo JSONB DEFAULT '{}',
  method TEXT NOT NULL,
  requirements TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
  assigned_to UUID REFERENCES staff_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);

-- inquiry_files
CREATE TABLE IF NOT EXISTS inquiry_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiry_files_inquiry_id ON inquiry_files(inquiry_id);

-- clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- shipments
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_no TEXT UNIQUE NOT NULL,
  inquiry_id UUID REFERENCES inquiries(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  method TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  cargo JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'booked', 'in_transit', 'arrived', 'clearing', 'out_for_delivery', 'delivered')),
  assigned_to UUID REFERENCES staff_users(id),
  key_dates JSONB DEFAULT '{}',
  cost_notes TEXT,
  service_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_client_id ON shipments(client_id);

-- shipment_events
CREATE TABLE IF NOT EXISTS shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES staff_users(id)
);

CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment_id ON shipment_events(shipment_id);

-- shipment_documents
CREATE TABLE IF NOT EXISTS shipment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipment_documents_shipment_id ON shipment_documents(shipment_id);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  recipient TEXT NOT NULL,
  template_key TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  provider_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- notification_templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  subject TEXT,
  body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key, channel)
);

-- testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  company TEXT NOT NULL,
  quote TEXT NOT NULL,
  rating INT DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- site_settings (single row)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT,
  tagline TEXT,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  address TEXT,
  social_whatsapp TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  social_linkedin TEXT,
  seo_default_title TEXT,
  seo_default_description TEXT,
  analytics_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- inquiry_no sequence
CREATE SEQUENCE IF NOT EXISTS inquiry_no_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS shipment_no_seq START 1000;

-- Function to generate inquiry_no
CREATE OR REPLACE FUNCTION gen_inquiry_no() RETURNS TEXT AS $$
  SELECT 'INQ-' || to_char(NOW(), 'YYYYMMDD') || '-' || lpad(nextval('inquiry_no_seq')::text, 4, '0');
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION gen_shipment_no() RETURNS TEXT AS $$
  SELECT 'SHP-' || to_char(NOW(), 'YYYYMMDD') || '-' || lpad(nextval('shipment_no_seq')::text, 4, '0');
$$ LANGUAGE SQL;

-- ===== from 004_notes_and_followups.sql
-- Inquiry notes for communication tracking
CREATE TABLE IF NOT EXISTS inquiry_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  author_id UUID REFERENCES staff_users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inquiry_notes_inquiry ON inquiry_notes(inquiry_id);

-- Client notes for relationship management
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  author_id UUID REFERENCES staff_users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_client_notes_client ON client_notes(client_id);

-- Follow-up scheduling on inquiries
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ;

-- ===== from 006_oms_schema_upgrades.sql
-- God-Level OMS Schema Upgrades
-- New columns on inquiries
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS estimated_value NUMERIC(12,2);
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website' CHECK (source IN ('website','email','phone','referral','other'));
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent'));

-- New columns on clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(12,2);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'net_30';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'standard' CHECK (tier IN ('vip','standard','new'));

-- New columns on shipments
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS vessel_name TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS voyage_no TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS bl_no TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS container_nos JSONB DEFAULT '[]';
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS estimated_departure TIMESTAMPTZ;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS estimated_arrival TIMESTAMPTZ;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS actual_departure TIMESTAMPTZ;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS actual_arrival TIMESTAMPTZ;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS demurrage_starts TIMESTAMPTZ;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS storage_notes TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS total_cost NUMERIC(12,2) DEFAULT 0;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS total_revenue NUMERIC(12,2) DEFAULT 0;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Invoices
CREATE SEQUENCE IF NOT EXISTS invoice_no_seq START 1000;

CREATE OR REPLACE FUNCTION gen_invoice_no() RETURNS TEXT AS $$
  SELECT 'INV-' || to_char(NOW(), 'YYYYMMDD') || '-' || lpad(nextval('invoice_no_seq')::text, 4, '0');
$$ LANGUAGE SQL;

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no TEXT UNIQUE NOT NULL,
  shipment_id UUID REFERENCES shipments(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  currency TEXT DEFAULT 'USD',
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','void')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_shipment ON invoices(shipment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Invoice line items
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  charge_type TEXT,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_price NUMERIC(12,2) DEFAULT 0,
  amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  method TEXT,
  reference TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);

-- Customs declarations
CREATE TABLE IF NOT EXISTS customs_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  declaration_no TEXT,
  hs_codes JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','query','amended','released')),
  submitted_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  duty_amount NUMERIC(12,2),
  tax_amount NUMERIC(12,2),
  notes TEXT,
  query_details TEXT,
  query_deadline TIMESTAMPTZ,
  assigned_to UUID REFERENCES staff_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customs_shipment ON customs_declarations(shipment_id);
CREATE INDEX IF NOT EXISTS idx_customs_status ON customs_declarations(status);

-- Activity log (universal audit trail)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  actor_email TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_actor ON activity_log(actor_email);

-- RLS on new tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customs_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;


