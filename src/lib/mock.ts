import { siteConfig } from "@/lib/siteConfig";

export const MOCK_SERVICES = [
  {
    id: "1",
    name: "Freight Forwarding",
    slug: "freight-forwarding",
    description:
      "End-to-end freight solutions by air, sea, and road across Ghana, West Africa, and international corridors.",
    icon: "Package",
    sort_order: 1,
    image: "/service-freight.png",
  },
  {
    id: "8",
    name: "Ship Agency",
    slug: "ship-agency",
    description:
      "Full, husbandry, and protective agency for vessels at Ghanaian ports, plus meet-and-greet support and structured port briefings.",
    icon: "Anchor",
    sort_order: 2,
    image: "/service-ship.png",
  },
  {
    id: "2",
    name: "Import & Export Handling",
    slug: "import-export-handling",
    description:
      "Streamlined import and export documentation and coordination for seamless cross-border trade.",
    icon: "Ship",
    sort_order: 3,
    image: "/service-import.png",
  },
  {
    id: "3",
    name: "Customs Clearance",
    slug: "customs-clearance",
    description: "Expert customs brokerage ensuring compliant, timely clearance at Ghana and regional ports.",
    icon: "FileCheck",
    sort_order: 4,
    image: "/services-hero.webp",
  },
  {
    id: "4",
    name: "Warehousing & Distribution",
    slug: "warehousing-distribution",
    description: "Secure storage and efficient distribution across our network of facilities.",
    icon: "Warehouse",
    sort_order: 5,
    image: "/services-hero.webp",
  },
  {
    id: "5",
    name: "Inland Transportation & Hauls",
    slug: "inland-transportation-hauls",
    description: "Reliable inland haulage and last-mile delivery across Ghana and the West Africa corridor.",
    icon: "Truck",
    sort_order: 6,
    image: "/services-hero.webp",
  },
  {
    id: "6",
    name: "Door-to-Door Delivery",
    slug: "door-to-door-delivery",
    description: "Complete door-to-door logistics from origin to final destination.",
    icon: "Home",
    sort_order: 7,
    image: "/services-hero.webp",
  },
  {
    id: "7",
    name: "Supply Chain Support Solutions",
    slug: "supply-chain-support-solutions",
    description: "Integrated supply chain consulting and support for complex logistics requirements.",
    icon: "Network",
    sort_order: 8,
    image: "/services-hero.webp",
  },
];

export const MOCK_TESTIMONIALS: Array<{
  id: string;
  client_name: string;
  company: string;
  quote: string;
  rating: number;
  role?: string;
  avatar?: string;
}> = [
  {
    id: "1",
    client_name: "Kwame Asante",
    company: "Asante Trading Ltd",
    quote:
      "Premium 1 Logistics delivered our mining equipment from Tema to Burkina Faso ahead of schedule. Professional, transparent, and reliable.",
    rating: 5,
    role: "Operations Director",
    avatar: "/testimonial-avatar.webp",
  },
  {
    id: "2",
    client_name: "Sarah Mensah",
    company: "Mensah Imports",
    quote:
      "Their customs clearance team saved us days of delays. Clear communication and documentation every step of the way.",
    rating: 5,
    role: "Head of Procurement",
    avatar: "/testimonial-avatar.webp",
  },
  {
    id: "3",
    client_name: "David Osei",
    company: "Osei Industries",
    quote: "We use Premium 1 for all our West Africa shipments. Consistent quality and competitive rates.",
    rating: 5,
    role: "Supply Chain Lead",
    avatar: "/testimonial-avatar.webp",
  },
];

export const MOCK_STATS = [
  { end: 15, suffix: "+", prefix: "", label: "Years experience" },
  { end: 50, suffix: "+", prefix: "", label: "Corporate clients" },
  { end: 12, suffix: "", prefix: "", label: "West Africa routes" },
  { end: 24, suffix: "/7", prefix: "", label: "Operations support" },
];

export const MOCK_COVERAGE = [
  {
    region: "Ghana",
    tagline: "National hub operations",
    cities: ["Accra", "Tema", "Takoradi", "Kumasi", "Tamale"],
    detail:
      "Full truckload and container drayage, bonded warehousing near Tema, and same-day dispatch coordination across the Greater Accra industrial belt.",
  },
  {
    region: "West Africa corridor",
    tagline: "ECOWAS transit",
    cities: ["Lagos", "Abidjan", "Lomé", "Cotonou", "Dakar", "Ouagadougou", "Bamako"],
    detail:
      "Established corridor partnerships for transit documentation, escorts where required, and predictable handoffs at border posts.",
  },
  {
    region: "International",
    tagline: "Global trade lanes",
    cities: ["Europe", "Asia", "Middle East", "Americas"],
    detail:
      "Ocean and air bookings on major trade lanes with carrier diversity, consolidation options, and door-to-door visibility.",
  },
];

export const SITE_SETTINGS = {
  company_name: siteConfig.name,
  tagline: "Corporate freight and logistics across Ghana, West Africa, and international corridors.",
  phone: siteConfig.phone,
  email: siteConfig.email,
  operationsEmail: siteConfig.operationsEmail,
  whatsapp: siteConfig.whatsappE164,
  address: siteConfig.addressLine,
  hours: "Mon–Fri 8:00–18:00 GMT · Emergency line 24/7 for active shipments",
  calendlyUrl: siteConfig.calendlyUrl,
  social: {
    whatsapp: `https://wa.me/${siteConfig.whatsappE164}`,
    facebook: "https://facebook.com/premium1logistics",
    instagram: "https://instagram.com/premium1logistics",
    linkedin: "https://linkedin.com/company/premium1logistics",
  },
};
