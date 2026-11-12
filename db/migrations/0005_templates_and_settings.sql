-- Client update emails the dashboard sends on status changes, and the
-- company settings record the Settings page edits. Earlier seeds left these
-- out, so clients would have received a bare "Notification: ..." line.

INSERT INTO notification_templates (key, channel, subject, body, is_active) VALUES
('quote_ready', 'email', 'Your quote for {{inquiry_no}} is ready',
 'Hello {{client_name}},\n\nYour quote for request {{inquiry_no}} is ready. Your coordinator will send it to you separately, or you can reply to this email and we will send it straight away.\n\nIf you would like to go ahead, reply to confirm and we will book the shipment and send a document checklist.\n\nPremium 1 Logistics\nAirport Residential Area, Accra', true),

('shipment_dispatched', 'email', 'Shipment {{shipment_no}} is on its way',
 'Hello {{client_name}},\n\nYour shipment {{shipment_no}} has left origin and is now in transit.\n\nYou can follow its progress at any time here:\nhttps://premium1logistics.com/track?ref={{shipment_no}}\n\nWe will email you again when it arrives. Reply to this email with any questions.\n\nPremium 1 Logistics', true),

('shipment_arrived', 'email', 'Shipment {{shipment_no}} has arrived',
 'Hello {{client_name}},\n\nYour shipment {{shipment_no}} has arrived at the port. We are now preparing customs clearance and will let you know if we need anything from you.\n\nTrack it here:\nhttps://premium1logistics.com/track?ref={{shipment_no}}\n\nPremium 1 Logistics', true),

('shipment_delivered', 'email', 'Shipment {{shipment_no}} has been delivered',
 'Hello {{client_name}},\n\nYour shipment {{shipment_no}} has been delivered. Proof of delivery and duty receipts will follow from your coordinator.\n\nThank you for shipping with Premium 1 Logistics. Reply to this email if anything is not as expected.\n\nPremium 1 Logistics', true),

('shipment_dispatched', 'sms', NULL,
 'Premium 1 Logistics: shipment {{shipment_no}} is now in transit. Track it at premium1logistics.com/track?ref={{shipment_no}}', true),

('shipment_delivered', 'sms', NULL,
 'Premium 1 Logistics: shipment {{shipment_no}} has been delivered. Thank you for shipping with us.', true)
ON CONFLICT (key, channel) DO NOTHING;

-- One company settings row, created only if none exists.
INSERT INTO site_settings (company_name, tagline, email, address)
SELECT 'Premium 1 Logistics LTD',
       'Freight forwarding, customs clearance and delivery across Ghana and West Africa',
       'info@premium1logistics.com',
       'Airport Residential Area, Accra, Ghana'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);
