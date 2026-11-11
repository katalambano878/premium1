/** Deep content blocks for god-tier pages */

export const CASE_STUDIES = [
  {
    id: "1",
    industry: "Mining equipment",
    route: "Shanghai → Tema → Ouagadougou",
    challenge: "Oversize units, narrow border windows, donor-funded inspection requirements.",
    outcome: "Delivered 4 days ahead of contractual milestone; zero demurrage on first vessel.",
    metrics: ["18 days total transit", "12 documents coordinated", "3 modes: sea + road + escort"],
    slug: "freight-forwarding",
  },
  {
    id: "2",
    industry: "FMCG importer",
    route: "Rotterdam → Tema → nationwide DC",
    challenge: "Peak-season congestion, LCL to FCL transition, OTIF retail commitments.",
    outcome: "Cleared within 36h of berth; replenishment cycle shortened by 2.1 days avg.",
    metrics: ["99.2% OTIF quarter", "22% dwell reduction", "Single WMS feed"],
    slug: "warehousing-distribution",
  },
  {
    id: "3",
    industry: "Industrial manufacturer",
    route: "Mumbai → Tema",
    challenge: "HS reclassification dispute, cash-flow pressure on duty payment timing.",
    outcome: "Binding ruling obtained; staged duty payment plan; cargo released in 5 working days.",
    metrics: ["GHS 2.1m duty optimised legally", "Zero penalties"],
    slug: "customs-clearance",
  },
];

export const EXTENDED_TESTIMONIALS: Array<{
  id: string;
  client_name: string;
  company: string;
  role?: string;
  quote: string;
  rating: number;
  avatar?: string;
}> = [
  {
    id: "4",
    client_name: "Ama Serwaa",
    company: "Coastal Retail Group",
    role: "Logistics Manager",
    avatar: "/testimonial-avatar.webp",
    quote:
      "Their milestone emails land before we ask. We stopped running parallel spreadsheets for Tema inbound.",
    rating: 5,
  },
  {
    id: "5",
    client_name: "James Koomson",
    company: "Tema Mining Supply",
    role: "Procurement Director",
    avatar: "/testimonial-avatar.webp",
    quote:
      "First project where our Burkina convoy arrived without a single customs stop we did not expect. That is rare.",
    rating: 5,
  },
  {
    id: "6",
    client_name: "Fatima Diallo",
    company: "Sahel Agro Partners",
    role: "COO",
    avatar: "/testimonial-avatar.webp",
    quote:
      "Premium 1 runs our Abidjan–Accra lane as if it were their own P&L. Transparent pass-through on every local charge.",
    rating: 5,
  },
  {
    id: "7",
    client_name: "Eric Boateng",
    company: "Volta Textiles Ltd",
    role: "MD",
    avatar: "/testimonial-avatar.webp",
    quote:
      "From LC documents to final warehouse delivery, one team. Our bank’s doc checker even commented on the consistency.",
    rating: 5,
  },
  {
    id: "8",
    client_name: "Nana Yaa Fremah",
    company: "West Africa FMCG Co.",
    role: "Head of Supply Chain",
    avatar: "/testimonial-avatar.webp",
    quote:
      "We benchmarked three forwarders. Premium 1 was not the cheapest line item—they were the cheapest total landed cost.",
    rating: 5,
  },
];

export const TEAM_LEADERS = [
  {
    name: "Kwesi Owusu",
    role: "Managing Director",
    bio: "25+ years across shipping lines, port operations, and brokerage. Leads key account governance and corridor strategy.",
    cred: "Former operations lead, major West Africa terminal operator",
  },
  {
    name: "Akosua Mensah",
    role: "Head of Customs & Compliance",
    bio: "Licensed house agent; specialises in complex classification, appeals, and donor-funded cargo programmes.",
    cred: "GRA-recognised broker · FIATA diploma",
  },
  {
    name: "Kofi Annan Jr.",
    role: "Director, Freight & Multimodal",
    bio: "Designs sea–air–road combinations for project and FMCG clients; owns carrier relationships and allocation.",
    cred: "Former regional commercial manager, global forwarder",
  },
];

export const CAREERS_ROLES = [
  {
    title: "Senior Customs Broker",
    type: "Full-time · Accra",
    summary:
      "Lead clearances for FMCG and industrial clients; mentor juniors; interface with GRA on complex rulings.",
  },
  {
    title: "Operations Coordinator — Sea Freight",
    type: "Full-time · Tema",
    summary: "Booking management, B/L amendments, pre-arrival filing, client milestone reporting.",
  },
  {
    title: "Business Development — Corridors",
    type: "Full-time · Hybrid",
    summary: "Grow ECOWAS transit book; RFP responses; partner agent governance.",
  },
  {
    title: "Warehouse Supervisor",
    type: "Full-time · Tema corridor",
    summary: "FIFO/FEFO discipline, cycle counts, WMS hygiene, outbound SLA tracking.",
  },
];

export const TRANSIT_BANDS: { lane: string; sea: string; air: string; note: string }[] = [
  { lane: "Asia main hub → Tema (FCL)", sea: "28–38 days", air: "3–6 days", note: "Seasonal blank sailings may add 5–10d" },
  { lane: "Europe → Tema (FCL)", sea: "18–28 days", air: "2–5 days", note: "Feeder vs direct affects range" },
  { lane: "Tema → Accra ICD / Kumasi", sea: "—", air: "—", note: "Road 1–3 days · container gate availability" },
  { lane: "Tema → Ouagadougou (transit)", sea: "—", air: "—", note: "Road 5–9 days · bonds, escorts, border dwell" },
  { lane: "Tema → Bamako (transit)", sea: "—", air: "—", note: "Road 7–12 days · Abidjan routing sometimes faster" },
  { lane: "Lagos → Accra (road)", sea: "—", air: "—", note: "Road 2–4 days · Aflao documentation" },
];

export const SERVICE_CASE_SNIPPETS: Record<string, { title: string; body: string; metric: string }> = {
  "freight-forwarding": {
    title: "Case: Peak-season FCL programme",
    body: "Dual-carrier strategy for a retail client avoided 11-day rollover during Q4; maintained shelf-stock dates.",
    metric: "Zero stock-outs attributed to ocean delay",
  },
  "customs-clearance": {
    title: "Case: Classification appeal",
    body: "Refiled under corrected HS with advance ruling; recovered overpaid duty for prior 6 months on recurring SKU.",
    metric: "7-figure GHS recovery (client confidential)",
  },
  "door-to-door-delivery": {
    title: "Case: Factory to warehouse",
    body: "Guangzhou supplier to Kumasi DC—one invoice, one ops lead, weekly milestone WhatsApp digest.",
    metric: "14-day improvement vs prior multi-vendor setup",
  },
  "warehousing-distribution": {
    title: "Case: DC redesign",
    body: "Relocated buffer from city fringe to Tema-adjacent; reduced drayage cost 19% on landed container.",
    metric: "19% drayage reduction",
  },
  "inland-transportation-hauls": {
    title: "Case: Lowbed convoy",
    body: "Transformer move with police escort; route survey avoided low bridge; delivered Sunday to minimise traffic.",
    metric: "Single-window permits in 9 working days",
  },
  "import-export-handling": {
    title: "Case: L/C alignment",
    body: "Matched B/L and invoice fields to issuing bank checklist before sail—no amendment fees.",
    metric: "US$0 amendment vs typical US$300–800",
  },
  "supply-chain-support-solutions": {
    title: "Case: Network redesign",
    body: "Consolidated two regional hubs into one Tema-adjacent node with secondary cross-dock in Kumasi.",
    metric: "8% lower cost-to-serve modelled Y1",
  },
  "ship-agency": {
    title: "Case: Protective attendance",
    body: "Owner’s rep on a tramp bulker—we verified charterer’s agent DA line items and SOF timings before signing, avoiding a disputed demurrage position.",
    metric: "Aligned SOF before sailing — no post-fixture escalation",
  },
};

export const INSIGHT_AUTHORS = {
  default: {
    name: "Operations Team",
    title: "Premium 1 Logistics",
    bio: "Practitioner notes from our brokerage and freight teams.",
  },
  broker: {
    name: "Akosua Mensah",
    title: "Head of Customs & Compliance",
    bio: "Licensed house agent; 15+ years in Ghana import programmes.",
  },
  freight: {
    name: "Kofi Annan Jr.",
    title: "Director, Freight & Multimodal",
    bio: "Former line manager; focuses on sea–air trade-offs and allocation.",
  },
};
