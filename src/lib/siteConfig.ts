/** Public site configuration — override via env where noted */

export const siteConfig = {
  name: "Premium 1 Logistics LTD",
  url: process.env.APP_BASE_URL || "https://premium1logistics.com",
  phone: process.env.NEXT_PUBLIC_SITE_PHONE || "+233 30 123 4567",
  email: process.env.NEXT_PUBLIC_SITE_EMAIL || "info@premium1logistics.com",
  operationsEmail:
    process.env.NEXT_PUBLIC_OPERATIONS_EMAIL || "operations@premium1logistics.com",
  careersEmail: process.env.NEXT_PUBLIC_CAREERS_EMAIL || "careers@premium1logistics.com",
  whatsappE164: process.env.NEXT_PUBLIC_WHATSAPP_E164 || "233301234567",
  addressLine: process.env.NEXT_PUBLIC_ADDRESS || "Airport Residential Area, Accra, Ghana",
  mapEmbedUrl:
    process.env.NEXT_PUBLIC_MAP_EMBED_URL ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.5!2d-0.17!3d5.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMzYnMDAuMCJOIDDCsDEwJzEyLjAiVw!5e0!3m2!1sen!2sgh!4v1",
  calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/premium1logistics/15min",
  responseSlaHours: 24,
  ogImage: "/og-default.jpg",
  sameAs: [
    "https://linkedin.com/company/premium1logistics",
    "https://facebook.com/premium1logistics",
    "https://instagram.com/premium1logistics",
  ],
  licenses: [
    { name: "Ghana Customs House Agent", ref: "GHA-XXXX (replace)", issuer: "GRA Customs Division" },
    { name: "FIATA Corporate Member", ref: "Membership ref on request", issuer: "FIATA" },
    { name: "GCCA — Ghana Chamber of Commerce", ref: "Active member", issuer: "GCCA" },
  ],
  clientLogos: [
    { name: "Asante Trading", abbr: "AT" },
    { name: "Mensah Imports", abbr: "MI" },
    { name: "Osei Industries", abbr: "OI" },
    { name: "West Africa FMCG Co.", abbr: "WA" },
    { name: "Tema Mining Supply", abbr: "TM" },
    { name: "Coastal Retail Group", abbr: "CR" },
  ],
  verticals: [
    { title: "Mining & heavy industry", desc: "Project cargo, oversize, corridor hauls to Sahel." },
    { title: "FMCG & retail", desc: "High-velocity clearance, DC flow, OTIF programmes." },
    { title: "Aid & NGOs", desc: "Donor-compliant documentation, duty exemptions." },
    { title: "Manufacturing", desc: "Raw materials inbound, finished goods export." },
    { title: "E-commerce", desc: "Consolidation, last mile, returns handling." },
    { title: "Healthcare & pharma", desc: "Time-critical shipments with strict documentation and handling controls." },
  ],
};
