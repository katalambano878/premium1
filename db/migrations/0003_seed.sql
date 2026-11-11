-- Reference data. Safe to re-run.

INSERT INTO services (name, slug, description, icon, sort_order, is_active) VALUES
('Freight Forwarding', 'freight-forwarding', 'End-to-end freight solutions by air, sea, and road across Ghana, West Africa, and international corridors.', 'Package', 1, true),
('Ship Agency', 'ship-agency', 'Full, husbandry, and protective agency for vessels at Ghanaian ports.', 'Anchor', 2, true),
('Import & Export Handling', 'import-export-handling', 'Import and export documentation and coordination for cross-border trade.', 'Ship', 3, true),
('Customs Clearance', 'customs-clearance', 'Customs brokerage for compliant, timely clearance at Ghana and regional ports.', 'FileCheck', 4, true),
('Warehousing & Distribution', 'warehousing-distribution', 'Secure storage and distribution.', 'Warehouse', 5, true),
('Inland Transportation & Hauls', 'inland-transportation-hauls', 'Inland haulage and last-mile delivery across Ghana and the West Africa corridor.', 'Truck', 6, true),
('Door-to-Door Delivery', 'door-to-door-delivery', 'Door-to-door logistics from origin to final destination.', 'Home', 7, true),
('Supply Chain Support Solutions', 'supply-chain-support-solutions', 'Supply chain consulting and support for complex logistics requirements.', 'Network', 8, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO notification_templates (key, channel, subject, body, is_active) VALUES
('inquiry_confirmation', 'email', 'We received your quote request {{inquiry_no}}',
 'Hello {{client_name}},\n\nThank you for your quote request. Your reference is {{inquiry_no}}.\n\nOur team will reply within 24 hours with a written quote or any questions about your shipment. You can reply to this email if you need to add anything.\n\nPremium 1 Logistics\nAirport Residential Area, Accra', true),
('new_inquiry_alert', 'sms', NULL, 'New quote request {{inquiry_no}} from {{client_name}}. Check the admin dashboard.', true)
ON CONFLICT (key, channel) DO NOTHING;
