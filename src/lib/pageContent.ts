/** Rich copy for service detail pages */

export type ServiceDeepContent = {
  longLead: string;
  /** Optional named sub-lines (e.g. ship agency pillars) rendered as a grid on the detail page */
  offerings?: { title: string; description: string }[];
  /** Optional commercial value cards to make each page sell the service clearly */
  salesPoints?: { title: string; body: string }[];
  highlights: string[];
  whoItServes: string;
  workflow: { title: string; description: string }[];
  differentiators: string[];
  faqs: { q: string; a: string }[];
  relatedSlugs: string[];
};

export const SERVICE_DEEP: Record<string, ServiceDeepContent> = {
  "freight-forwarding": {
    longLead:
      "Freight forwarding should protect commercial outcomes, not just move boxes. We design and execute lane strategy around your delivery promise, landed-cost limits, and compliance exposure. Every booking is handled with visible assumptions, controlled documentation, and escalation-ready milestone management so your team can plan with confidence rather than react to surprises.",
    offerings: [
      {
        title: "Ocean freight programmes",
        description:
          "FCL, LCL, and special-equipment planning with carrier mix, rollover contingencies, and destination handoff governance.",
      },
      {
        title: "Air freight execution",
        description:
          "Time-critical routing with cut-off control, uplift monitoring, and alternative options when capacity tightens.",
      },
      {
        title: "Multimodal orchestration",
        description:
          "Sea-air and road bridge combinations for lanes where speed, cost, and reliability need a blended strategy.",
      },
      {
        title: "Shipment control team",
        description:
          "One operations team managing booking, draft docs, pre-alerts, and exception response from origin to destination.",
      },
    ],
    salesPoints: [
      {
        title: "Lower avoidable delay cost",
        body: "Proactive route and carrier planning reduces rollovers, missed handoffs, and destination dwell penalties.",
      },
      {
        title: "Better working-capital planning",
        body: "Predictable milestone control gives procurement and finance cleaner ETAs for inventory and cash-cycle decisions.",
      },
      {
        title: "Executive-ready transparency",
        body: "Line-item assumptions and escalation trails make shipment decisions defendable at management level.",
      },
    ],
    highlights: [
      "Carrier strategy by lane with primary and fallback options",
      "Draft-to-final document governance before cargo lands",
      "Milestone communication built for operations and finance",
      "Exception playbooks with decision-ready alternatives",
    ],
    whoItServes:
      "Import/export teams, manufacturers, traders, and growth-stage businesses that need forwarding discipline at enterprise standard.",
    workflow: [
      {
        title: "Commercial intake",
        description: "We lock ETA targets, cost boundaries, service tolerances, and non-negotiable compliance conditions.",
      },
      {
        title: "Lane strategy and booking",
        description: "Routing options are compared with assumptions, then space is secured with cut-off and risk controls.",
      },
      {
        title: "Document and milestone control",
        description: "Draft approvals, pre-alerts, and status gates are managed through one accountable operations team.",
      },
      {
        title: "Arrival and handoff",
        description: "We coordinate transfer into clearance, delivery, or warehousing with exception escalation where needed.",
      },
    ],
    differentiators: [
      "Forwarding designed around business outcomes, not rate sheets alone",
      "A named contact for every active shipment",
      "Assumption-driven quoting with explicit re-rate triggers",
    ],
    faqs: [
      {
        q: "How early should we book to avoid rollovers?",
        a: "For most ocean lanes into Ghana, 2-3 weeks before cargo readiness is a safe baseline; peak periods often need longer lead. We provide lane-specific booking windows and fallback options.",
      },
      {
        q: "Can you run regulated or sensitive commodities?",
        a: "Yes, where carrier acceptance and compliance conditions are met. Share permits, MSDS, and handling constraints early so feasibility is confirmed before spend is committed.",
      },
      {
        q: "Do you support recurring-volume contracts?",
        a: "Yes. We can structure lane programmes with review cadence, SLA definitions, and consolidated reporting for recurring flows.",
      },
    ],
    relatedSlugs: ["customs-clearance", "door-to-door-delivery", "import-export-handling", "ship-agency"],
  },
  "import-export-handling": {
    longLead:
      "Most international shipment failures happen in paperwork, not transport. Our import/export handling service works as a document and stakeholder control tower - aligning supplier documents, bank requirements, carrier rules, and customs expectations before they collide. The result is fewer amendment loops, faster release readiness, and cleaner execution across every trade file.",
    offerings: [
      {
        title: "Document QA and harmonization",
        description:
          "Invoice, packing list, certificates, and permit fields aligned before submission to reduce first-review rejection.",
      },
      {
        title: "L/C and banking coordination",
        description:
          "Support for documentary consistency against bank checklists and deadlines to avoid costly post-sailing amendments.",
      },
      {
        title: "Supplier pre-shipment controls",
        description:
          "Upstream guidance on labels, declarations, and supporting docs so destination clearance starts with cleaner inputs.",
      },
      {
        title: "Counterparty synchronization",
        description:
          "Carrier, broker, bank, and client milestones aligned with visible ownership across each handoff point.",
      },
    ],
    salesPoints: [
      {
        title: "Fewer amendment fees",
        body: "Structured field matching before vessel departure helps prevent expensive bank and document correction cycles.",
      },
      {
        title: "Faster release readiness",
        body: "Pre-arrival completeness reduces avoidable delays once cargo reaches destination control points.",
      },
      {
        title: "Lower internal workload",
        body: "One managed point of contact cuts the manual follow-up burden on procurement and logistics teams.",
      },
    ],
    highlights: [
      "Document integrity checks before shipment milestones",
      "Commodity-specific checklists with compliance traceability",
      "One line of communication across all parties",
      "Archive-ready close-out packs per shipment",
    ],
    whoItServes:
      "Import managers, export coordinators, distributors, and trading teams handling multi-party documentation risk.",
    workflow: [
      {
        title: "Shipment onboarding",
        description: "Trade terms, counterparties, and document sets are captured into a single control workflow.",
      },
      {
        title: "Gap and risk screening",
        description: "Classification, valuation, and certificate gaps are flagged and resolved before movement.",
      },
      {
        title: "Stakeholder alignment",
        description: "Bank, supplier, broker, and carrier cut-offs are synchronized with explicit task ownership.",
      },
      {
        title: "Execution close-out",
        description: "Submission, response, and completion evidence are tracked until full document closure.",
      },
    ],
    differentiators: [
      "Paperwork handled as an operational control discipline",
      "L/C-aware execution with commercial deadline sensitivity",
      "Audit-friendly document retention by shipment reference",
    ],
    faqs: [
      {
        q: "Do you assist with letters of credit?",
        a: "Yes. We map shipping documents to L/C fields and timing windows before issuance and again before final release.",
      },
      {
        q: "Can you review supplier documents before shipment?",
        a: "Yes. Pre-shipment review is one of the fastest ways to reduce destination clearance friction and amendment risk.",
      },
      {
        q: "Do you support both imports and exports?",
        a: "Yes. We run full document governance on both sides, including permit mapping and stakeholder synchronization.",
      },
    ],
    relatedSlugs: ["customs-clearance", "freight-forwarding", "supply-chain-support-solutions", "ship-agency"],
  },
  "customs-clearance": {
    longLead:
      "Customs is where weak assumptions become real cost. We run clearance as a compliance-first operation with broker-led control of classification, valuation, permit readiness, and assessment responses. You get lawful outcomes, stronger predictability on release timing, and cleaner evidence for internal governance and external audit.",
    offerings: [
      {
        title: "Pre-clearance architecture",
        description:
          "HS review, permit checks, IDF readiness, and landed-duty forecasting before cargo arrival.",
      },
      {
        title: "Declaration management",
        description:
          "Controlled submissions with complete supporting packs and immediate follow-up on authority responses.",
      },
      {
        title: "Inspection coordination",
        description:
          "Examination planning, evidence handling, and rapid issue resolution to keep release moving.",
      },
      {
        title: "Transit and post-clearance support",
        description:
          "Bond handling for inland corridors plus documentation support for internal or statutory audits.",
      },
    ],
    salesPoints: [
      {
        title: "Lower compliance risk",
        body: "Broker-led classification and document controls reduce exposure to penalties and avoidable disputes.",
      },
      {
        title: "Better landed-cost accuracy",
        body: "Duty and levy forecasts before arrival improve pricing decisions and budget reliability.",
      },
      {
        title: "Faster exception handling",
        body: "Structured responses during assessment and inspection reduce idle-time at critical clearance stages.",
      },
    ],
    highlights: [
      "Classification support with documented rationale",
      "Pre-arrival duty/levy visibility for planning teams",
      "Inspection response protocol with escalation ownership",
      "Transit bond handling for ECOWAS-connected flows",
    ],
    whoItServes:
      "Importers, enterprise procurement teams, and forwarders needing strong in-country brokerage and governance discipline.",
    workflow: [
      { title: "Pre-arrival preparation", description: "We lock compliance prerequisites before vessel or flight milestones." },
      { title: "Entry filing", description: "Declarations are submitted with controlled support packs and tracking checkpoints." },
      { title: "Assessment and inspection", description: "Queries and examinations are handled with evidence-first response discipline." },
      { title: "Release and handoff", description: "Gate-out and onward movement are coordinated with completion documentation." },
    ],
    differentiators: [
      "Senior broker involvement on complex commodity cases",
      "SLA-oriented query and assessment response model",
      "Post-clearance support for audit and control evidence",
    ],
    faqs: [
      {
        q: "What documents do I need for general cargo?",
        a: "Usually invoice, packing list, transport document, IDF, and commodity-specific permits. We issue a tailored checklist by HS line before filing.",
      },
      {
        q: "Can you support classification disputes or reviews?",
        a: "Yes. We support evidence prep and classification review workflows where formal clarification is needed.",
      },
      {
        q: "Do you handle transit movements after clearance?",
        a: "Yes. We coordinate release into inland transport, including bond-related requirements for corridor routes.",
      },
    ],
    relatedSlugs: ["import-export-handling", "warehousing-distribution", "inland-transportation-hauls", "ship-agency"],
  },
  "ship-agency": {
    longLead:
      "Ship agency performance is measured in hours saved, disputes avoided, and confidence maintained between vessel and shore office. We act as a disciplined local command point at Ghana ports - controlling authority interface, DA quality, husbandry execution, and protective oversight so owners and charterers stay informed and in control throughout the call.",
    offerings: [
      {
        title: "Full ship agency",
        description:
          "End-to-end call handling from inward clearance through sailing, with coordinated reporting to your operations centre.",
      },
      {
        title: "Husbandry agency",
        description:
          "Crew, spares, bunkers, stores, launches, and support services sequenced to protect berth-time efficiency.",
      },
      {
        title: "Protective agency",
        description:
          "Independent oversight where another commercial agent is nominated, including SOF and DA scrutiny.",
      },
      {
        title: "Meet-and-greet concierge",
        description:
          "Controlled transit support for principals and superintendents through Accra with schedule-aligned handoff.",
      },
      {
        title: "Information packs",
        description:
          "Pre-arrival call intelligence on local requirements, process expectations, and indicative cost structures.",
      },
      {
        title: "Port and terminal liaison",
        description:
          "Real-time authority and terminal interface translated into practical status updates for shore decision-making.",
      },
    ],
    salesPoints: [
      {
        title: "Fewer call-time surprises",
        body: "Structured pre-arrival planning reduces unplanned delays and fragmented communication during active calls.",
      },
      {
        title: "Stronger DA confidence",
        body: "Line-item discipline and verification improve financial transparency and reduce post-fixture disputes.",
      },
      {
        title: "One point of contact",
        body: "Owners, charterers, and technical teams stay aligned through one accountable local coordination point.",
      },
    ],
    highlights: [
      "Coverage across tanker, bulk, ro/ro, project, and general cargo calls",
      "Charter-party aware communication and execution discipline",
      "DA control model built for approval traceability",
      "Protective and full agency options under one team",
    ],
    whoItServes:
      "Owners, operators, charterers, and technical managers requiring high-confidence local representation at Tema and Takoradi.",
    workflow: [
      { title: "Pre-arrival control", description: "Appointment, authority prep, ETA alignment, and DA baseline are established." },
      { title: "Alongside execution", description: "Clearance, attendance, husbandry, and surveys run to agreed operational priorities." },
      { title: "Live call governance", description: "Structured update cadence, issue escalation, and stakeholder alignment are maintained." },
      { title: "Departure close-out", description: "SOF/DA reconciliation and final documentation are delivered for finance and records." },
    ],
    differentiators: [
      "Bridge-level and charter-party-level fluency in one operations team",
      "Vetted supplier ecosystem with compliance-first operating standards",
      "Protective depth for risk-sensitive fixtures and call structures",
    ],
    faqs: [
      {
        q: "Which Ghana ports do you cover?",
        a: "Primary coverage is Tema and Takoradi, with related principal/superintendent transit support through Accra when required.",
      },
      {
        q: "When should we appoint protective rather than full agency?",
        a: "Protective agency is best where another agent is commercially nominated but you need independent local oversight of call events, SOF, and DA quality.",
      },
      {
        q: "Can you work with our existing husbandry suppliers?",
        a: "Yes, provided they meet operational, safety, and invoicing standards required for controlled call execution.",
      },
    ],
    relatedSlugs: ["freight-forwarding", "customs-clearance", "import-export-handling"],
  },
  "warehousing-distribution": {
    longLead:
      "Warehousing should improve service reliability and cash efficiency, not add blind cost. We design and operate storage and distribution around SKU behavior, throughput rhythm, and delivery commitments. From buffer stock near gateways to multi-point outbound, we focus on accurate inventory, disciplined dispatch, and reporting you can actually use to make decisions.",
    offerings: [
      {
        title: "Inbound and put-away control",
        description:
          "Receiving, quality checks, location assignment, and discrepancy logging with accountability at every handoff.",
      },
      {
        title: "Inventory governance",
        description:
          "Cycle counts, FIFO/FEFO controls, and batch-level visibility tailored to your commodity and compliance profile.",
      },
      {
        title: "Pick-pack-dispatch operations",
        description:
          "Order fulfilment run against route cut-offs, carrier schedules, and customer service expectations.",
      },
      {
        title: "Performance reporting",
        description:
          "Operational exports and KPI summaries structured for ERP ingestion or management-sheet decision workflows.",
      },
    ],
    salesPoints: [
      {
        title: "Higher inventory accuracy",
        body: "Structured control points reduce stock variances and improve confidence in available-to-promise numbers.",
      },
      {
        title: "Lower cost-to-serve",
        body: "Optimized storage and dispatch logic reduce unnecessary handling and emergency transport spend.",
      },
      {
        title: "More reliable fulfilment",
        body: "Cut-off aligned outbound planning improves OTIF performance across distribution routes.",
      },
    ],
    highlights: [
      "Warehouse operations designed around real throughput behavior",
      "Traceability readiness for regulated and sensitive product lines",
      "Dispatch discipline linked to lane and customer cut-offs",
      "KPI reporting tied to business decisions, not vanity metrics",
    ],
    whoItServes:
      "Retail, FMCG, industrial, and e-commerce teams that need dependable inventory and outbound performance in Ghana.",
    workflow: [
      { title: "Network fit and setup", description: "We align facility model, SKU profile, and service targets before launch." },
      { title: "Control framework", description: "SOPs, stock logic, and reporting standards are configured for daily execution." },
      { title: "Operational cadence", description: "Inbound, storage, and outbound activities run to defined cut-offs and controls." },
      { title: "Continuous optimization", description: "KPI reviews drive process refinements for speed, accuracy, and margin impact." },
    ],
    differentiators: [
      "Flexibility in commercial model without lowering control quality",
      "Clear operational ownership from receiving to dispatch",
      "Scalable structure for growth from overflow to dedicated models",
    ],
    faqs: [
      {
        q: "Do we need a long-term contract to start?",
        a: "No. We support short-term overflow, seasonal volumes, and dedicated longer-term programmes depending on throughput confidence.",
      },
      {
        q: "Can you support batch and expiry controls?",
        a: "Yes. FIFO/FEFO and batch-level rules are configured based on your product and compliance requirements.",
      },
      {
        q: "Do you integrate with client systems?",
        a: "Yes. Reporting can be structured for ERP import or dashboard workflows, depending on your operating setup.",
      },
    ],
    relatedSlugs: ["inland-transportation-hauls", "door-to-door-delivery", "supply-chain-support-solutions"],
  },
  "inland-transportation-hauls": {
    longLead:
      "Inland transport success is determined before wheels move. We treat haulage as a controlled operation with route intelligence, equipment-fit planning, permit readiness, and checkpoint governance. Whether port drayage, oversize project cargo, or corridor runs into landlocked markets, we execute for predictability and defensible performance.",
    offerings: [
      {
        title: "Port and inland drayage",
        description:
          "Container and loose-cargo movement from port and ICD nodes into warehouse or project destinations.",
      },
      {
        title: "Project and heavy-haul moves",
        description:
          "Lowbed and special-configuration transport with route survey and handling controls for oversized cargo.",
      },
      {
        title: "Cross-border corridor execution",
        description:
          "Permit, escort, and border-process support for ECOWAS-linked transit requirements.",
      },
      {
        title: "Active movement control team",
        description:
          "Checkpoint updates and exception escalation for live visibility throughout the journey.",
      },
    ],
    salesPoints: [
      {
        title: "Reduced route-risk exposure",
        body: "Pre-dispatch route and permit validation reduces preventable stoppages and compliance complications.",
      },
      {
        title: "Better delivery predictability",
        body: "Checkpoint governance and escalation paths improve confidence in promised delivery windows.",
      },
      {
        title: "Transparent movement economics",
        body: "Fuel, toll, permit, and handling components are clearly separated for commercial clarity.",
      },
    ],
    highlights: [
      "Equipment assignment matched to cargo and road constraints",
      "Structured route risk and compliance preparation",
      "Corridor partner coordination with border-process awareness",
      "Documented delivery and exception close-out discipline",
    ],
    whoItServes:
      "Project teams, industrial operators, and enterprise supply chains needing dependable inland and corridor movement execution.",
    workflow: [
      { title: "Route and risk planning", description: "Road, bridge, permit, and curfew constraints are validated before dispatch." },
      { title: "Equipment and load strategy", description: "Vehicle type and securing method are engineered for cargo profile and safety." },
      { title: "Transit monitoring", description: "Active updates and escalation playbooks keep stakeholders informed during movement." },
      { title: "Delivery and closure", description: "POD, exception records, and commercial completion are captured and confirmed." },
    ],
    differentiators: [
      "Planning-led haulage model rather than dispatch-only execution",
      "Operational oversight throughout live transit windows",
      "Commercial transparency on pass-through route cost components",
    ],
    faqs: [
      {
        q: "Can you handle oversize or heavy-lift movements?",
        a: "Yes. We coordinate route survey, permit pathway, escort requirements, and movement windows based on cargo envelope and corridor rules.",
      },
      {
        q: "Do you provide transit tracking updates?",
        a: "Yes. Active movements are monitored through checkpoint updates with clear escalation triggers for exceptions.",
      },
      {
        q: "Can you run cross-border corridor deliveries?",
        a: "Yes. We support corridor execution into regional destinations subject to route, permit, and border-process requirements.",
      },
    ],
    relatedSlugs: ["door-to-door-delivery", "warehousing-distribution", "freight-forwarding"],
  },
  "door-to-door-delivery": {
    longLead:
      "Door-to-door is valuable only when accountability is real. We integrate pickup, main carriage, clearance, and final-mile delivery under one operations owner and one managed line of communication. You get simpler vendor management without sacrificing transparency on timing, cost, or compliance responsibilities.",
    offerings: [
      {
        title: "Origin pickup and export prep",
        description:
          "Supplier-side collection and export-document coordination with readiness checks before movement.",
      },
      {
        title: "International carriage control",
        description:
          "Ocean or air main-leg management selected against service-level and landed-cost objectives.",
      },
      {
        title: "Destination clearance and release",
        description:
          "Import-side compliance handling with issue-response support through release completion.",
      },
      {
        title: "Final-mile delivery completion",
        description:
          "Appointment-managed delivery with POD capture, exception reporting, and commercial close-out.",
      },
    ],
    salesPoints: [
      {
        title: "Lower coordination overhead",
        body: "One service chain removes vendor handoff friction and reduces internal follow-up workload.",
      },
      {
        title: "Cleaner accountability model",
        body: "A single operations owner means problems are solved, not passed between disconnected providers.",
      },
      {
        title: "Clearer end-to-end visibility",
        body: "Milestones across all legs are tracked in one place for operations, finance, and compliance stakeholders.",
      },
    ],
    highlights: [
      "Integrated planning from supplier dock to final destination",
      "Main-leg optimization by urgency, cost, and reliability",
      "Destination issue handling under one accountable team",
      "Final delivery governance with proof and close-out records",
    ],
    whoItServes:
      "Teams that want fewer vendor interfaces and stronger execution ownership across end-to-end logistics.",
    workflow: [
      { title: "Scope lock", description: "Incoterms, addresses, cargo limits, and timeline expectations are confirmed upfront." },
      { title: "Origin and transit control", description: "Pickup and main carriage are executed with milestone visibility and proactive updates." },
      { title: "Import-side completion", description: "Clearance and release are coordinated with exception handling where required." },
      { title: "Final-mile close-out", description: "Delivery and POD are completed with full traceability and handover proof." },
    ],
    differentiators: [
      "Single-chain accountability across all transport legs",
      "Commercial transparency despite multi-leg complexity",
      "Escalation-ready support for urgent or sensitive shipments",
    ],
    faqs: [
      {
        q: "Do you support non-standard deliveries (sites, projects, timed drops)?",
        a: "Yes. We scope access constraints, equipment needs, and delivery windows upfront so execution is engineered rather than improvised.",
      },
      {
        q: "Can we use this for recurring imports?",
        a: "Absolutely. We can structure recurring door-to-door programmes with cadence, SLA definitions, and reporting standards.",
      },
      {
        q: "How is pricing structured across multiple legs?",
        a: "Pricing is broken into service fee and pass-through components by leg, with assumptions clearly stated before booking.",
      },
    ],
    relatedSlugs: ["freight-forwarding", "customs-clearance", "inland-transportation-hauls"],
  },
  "supply-chain-support-solutions": {
    longLead:
      "When supply chains scale, hidden inefficiencies compound quickly. Our support solutions combine strategic diagnosis with practical implementation so improvements survive daily operating reality. We help leadership teams redesign flows for measurable gains in service reliability, cost-to-serve, and governance discipline - then support execution until the model is stable.",
    offerings: [
      {
        title: "Network diagnostics",
        description:
          "Current-state mapping of lane cost, service breaks, inventory posture, and control gaps.",
      },
      {
        title: "Design and optimization",
        description:
          "Future-state operating model including lane strategy, stocking logic, and handoff governance.",
      },
      {
        title: "Pilot and transition",
        description:
          "Controlled rollouts with KPI baselines to validate improvements before full deployment.",
      },
      {
        title: "Governance and cadence",
        description:
          "Review frameworks for OTIF, dwell, cost-to-serve, and exception quality across active programmes.",
      },
    ],
    salesPoints: [
      {
        title: "Cost-to-serve visibility",
        body: "Decisions move from intuition to evidence through lane-level and node-level economics.",
      },
      {
        title: "Service-level reliability",
        body: "Control redesign improves OTIF by reducing process breaks and handoff ambiguity.",
      },
      {
        title: "Sustainable operating discipline",
        body: "Cadence and ownership frameworks keep improvements active after project launch.",
      },
    ],
    highlights: [
      "Diagnostic depth tied to implementation realism",
      "Inventory and routing decisions balanced against working capital",
      "KPI architecture built for leadership actionability",
      "Scenario planning for disruption and growth inflection points",
    ],
    whoItServes:
      "COOs, supply-chain leaders, and transformation teams seeking practical, measurable operational improvement.",
    workflow: [
      { title: "Evidence baseline", description: "We quantify current performance, cost drivers, and failure points by flow." },
      { title: "Target model definition", description: "Trade-offs are modeled into a pragmatic future-state design." },
      { title: "Pilot execution", description: "Selected improvements are tested in live operations with tracked KPI outcomes." },
      { title: "Scale and governance", description: "Successful patterns are embedded with cadence, ownership, and review controls." },
    ],
    differentiators: [
      "Strategy work tied directly to field execution realities",
      "Cross-functional alignment between commercial and operations teams",
      "Outcome measurement built into implementation, not added later",
    ],
    faqs: [
      {
        q: "Is this separate from freight execution?",
        a: "It can be advisory-only or integrated with operational delivery. We tailor the model to your internal capability and timeline.",
      },
      {
        q: "How long does a typical engagement run?",
        a: "Most diagnostics begin within weeks, with pilot windows defined by data availability, lane complexity, and change scope.",
      },
      {
        q: "What outputs do leadership teams receive?",
        a: "You receive quantified baselines, design recommendations, pilot results, and governance cadence for ongoing performance control.",
      },
    ],
    relatedSlugs: ["freight-forwarding", "warehousing-distribution", "import-export-handling"],
  },
};

export const DEFAULT_SERVICE_DEEP: ServiceDeepContent = {
  longLead:
    "Our team tailors logistics execution to your commodity, timeline, and compliance profile. From first inquiry through final delivery, you work with experienced coordinators who understand Ghana and the wider West Africa corridor.",
  highlights: [
    "Structured quotation and booking process",
    "Documentation and regulatory alignment",
    "Tracking and proactive exception management",
  ],
  whoItServes: "Corporate clients, SMEs, and international traders.",
  workflow: [
    { title: "Inquiry", description: "Tell us origin, destination, and cargo profile." },
    { title: "Quote", description: "Detailed line items and timelines." },
    { title: "Book", description: "Confirm space and submit paperwork." },
    { title: "Deliver", description: "Track through to POD." },
  ],
  differentiators: ["Reliable execution", "Clear communication", "Compliance-first mindset"],
  faqs: [],
  relatedSlugs: ["freight-forwarding", "customs-clearance"],
};

export type InsightPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime: string;
  published_at: string;
  featured?: boolean;
  authorKey: "default" | "broker" | "freight";
  /** Optional OG and hero image path (e.g. /insights-featured.png or per-article) */
  featuredImage?: string;
};

export const MOCK_INSIGHTS: InsightPost[] = [
  {
    id: "1",
    title: "Logistics in Ghana: A Practical Guide for Importers",
    slug: "logistics-ghana-guide",
    excerpt:
      "Ports, documentation, and timelines—what every procurement team should know before their first container hits Tema.",
    category: "Guides",
    readTime: "8 min read",
    published_at: "2025-03-01",
    featured: true,
    authorKey: "freight",
    featuredImage: "/insights-featured.webp",
  },
  {
    id: "2",
    title: "Customs Clearance: Reducing Delays at Tema",
    slug: "customs-clearance-best-practices",
    excerpt: "Pre-arrival filing, classification discipline, and how to avoid common examination triggers.",
    category: "Compliance",
    readTime: "6 min read",
    published_at: "2025-02-22",
    featured: false,
    authorKey: "broker",
    featuredImage: "/insights-featured.webp",
  },
  {
    id: "3",
    title: "West Africa Freight Corridors in 2025",
    slug: "west-africa-freight-routes",
    excerpt: "Key lanes, transit risks, and mode choices for Abidjan, Lomé, Dakar, and landlocked neighbours.",
    category: "Corridors",
    readTime: "10 min read",
    published_at: "2025-02-14",
    featured: false,
    authorKey: "freight",
    featuredImage: "/insights-featured.webp",
  },
  {
    id: "4",
    title: "Choosing Between LCL and FCL for SME Growth",
    slug: "lcl-fcl-sme",
    excerpt: "When consolidation saves cash flow—and when full containers unlock reliability.",
    category: "Strategy",
    readTime: "5 min read",
    published_at: "2025-02-08",
    featured: false,
    authorKey: "default",
    featuredImage: "/insights-featured.webp",
  },
  {
    id: "5",
    title: "Incoterms 2020: What Logistics Teams Get Wrong",
    slug: "incoterms-logistics",
    excerpt: "A concise refresher on risk transfer and who pays for what on common Ghana trade lanes.",
    category: "Compliance",
    readTime: "7 min read",
    published_at: "2025-01-28",
    featured: false,
    authorKey: "broker",
    featuredImage: "/insights-featured.webp",
  },
  {
    id: "6",
    title: "Warehousing Near Tema: Location Trade-offs",
    slug: "warehousing-tema",
    excerpt: "Drayage cost vs rent—how to size buffer stock and distribution nodes.",
    category: "Operations",
    readTime: "6 min read",
    published_at: "2025-01-15",
    featured: false,
    authorKey: "default",
    featuredImage: "/insights-featured.webp",
  },
  {
    id: "7",
    title: "Sanctions Screening: A Forwarder’s Checklist",
    slug: "sanctions-screening-checklist",
    excerpt: "Why commodity and counterparty screening matters before you book space—and how we document it.",
    category: "Compliance",
    readTime: "5 min read",
    published_at: "2025-03-10",
    featured: false,
    authorKey: "broker",
    featuredImage: "/insights-featured.webp",
  },
  {
    id: "8",
    title: "Carbon Signals in West Africa Ocean Freight",
    slug: "carbon-ocean-freight-west-africa",
    excerpt: "Carrier CII ratings, slow-steaming, and what corporate shippers should ask for in RFPs.",
    category: "Strategy",
    readTime: "7 min read",
    published_at: "2025-03-05",
    featured: false,
    authorKey: "freight",
    featuredImage: "/insights-featured.webp",
  },
];

export type InsightSection = { heading: string; paragraphs: string[] };

export const INSIGHT_SECTIONS: Record<string, InsightSection[]> = {
  "logistics-ghana-guide": [
    {
      heading: "Why Tema dominates inbound flow",
      paragraphs: [
        "Tema remains the primary gateway for containerised imports into Ghana. Understanding terminal cut-offs, stacking rules, and local charge structures before your vessel sails prevents expensive demurrage and storage loops on arrival.",
        "Work backwards from your required delivery date: allow time for discharge, examination (if selected), duty payment, and trucking to your warehouse or ICD. Peak seasons and public holidays compress effective working hours—factor them into your first-mile plan.",
      ],
    },
    {
      heading: "Documentation that survives first review",
      paragraphs: [
        "Commercial invoices should reflect true value and match packing lists line-for-line where possible. HS codes should be consistent across documents; discrepancies are a common trigger for secondary review.",
        "If you use letters of credit, align shipping documents with the L/C fields before cargo sails. Amendments at destination are costly and often impossible once the bill of lading is issued.",
      ],
    },
    {
      heading: "Working with a local partner",
      paragraphs: [
        "A competent broker and forwarder combination reduces email chains between you, the carrier, and customs. Look for named contacts, written quotations, and milestone-based updates rather than ad-hoc WhatsApp threads alone.",
        "Premium 1 sets up each shipment with a reference number, document checklist, and escalation path—so finance, procurement, and operations stay aligned.",
      ],
    },
  ],
  "customs-clearance-best-practices": [
    {
      heading: "Pre-arrival discipline",
      paragraphs: [
        "Submit complete document packs as early as regulations allow. Early visibility lets brokers flag classification or permit gaps while you still have time to amend supplier documents.",
        "Validate HS codes against historical entries for similar commodities—surprises at assessment stage add days, not hours.",
      ],
    },
    {
      heading: "Examination risk",
      paragraphs: [
        "Random and risk-based examinations are normal. Minimise delay by ensuring seal integrity, accurate piece counts, and clear marking that matches the packing list.",
        "For sensitive commodities, pre-clear permits and third-party certificates before vessel arrival.",
      ],
    },
  ],
  "west-africa-freight-routes": [
    {
      heading: "Coastal hubs vs landlocked destinations",
      paragraphs: [
        "Abidjan, Lomé, Tema, and Dakar each offer different feeder reliability and transit norms into Burkina Faso, Mali, and Niger. Mode choice should include total transit time, not just ocean freight.",
        "Road transits require bond management and sometimes escorts. Budget for fuel volatility and border dwell in peak periods.",
      ],
    },
    {
      heading: "Air vs sea for Sahel corridors",
      paragraphs: [
        "High-value or time-critical cargo into landlocked markets may justify air into Accra or Lomé plus road leg, versus a full sea–road combination. Model total landed cost including inventory carrying cost.",
      ],
    },
  ],
  "lcl-fcl-sme": [
    {
      heading: "When LCL wins",
      paragraphs: [
        "Lower volume and cash-flow sensitivity favour LCL: you pay for space used and can ship more frequently without tying up a full container deposit.",
        "Watch consolidation cut-offs and destination deconsolidation charges—they can erode savings if your supplier ships late repeatedly.",
      ],
    },
    {
      heading: "When to step up to FCL",
      paragraphs: [
        "Volume thresholds, commodity sensitivity (odour, contamination risk), and schedule reliability often push growing SMEs toward FCL. You gain control of sealing and sometimes faster release at destination.",
      ],
    },
  ],
  "incoterms-logistics": [
    {
      heading: "Risk vs cost",
      paragraphs: [
        "Incoterms define where risk transfers—not always who pays freight. EXW vs FOB vs CIF each implies different insurance and documentation burdens on the buyer.",
        "For Ghana imports, clarify who appoints the clearing agent and who pays local charges before you sign purchase terms.",
      ],
    },
  ],
  "warehousing-tema": [
    {
      heading: "Drayage vs rent",
      paragraphs: [
        "Warehousing close to Tema reduces per-move drayage but may carry higher rent per square metre. Model monthly moves and average dwell to find the break-even radius.",
      ],
    },
    {
      heading: "Buffer stock placement",
      paragraphs: [
        "Place safety stock where replenishment lead times are shortest relative to demand volatility—often Accra metro for nationwide distribution, with satellite hubs for high-volume regions.",
      ],
    },
  ],
  "sanctions-screening-checklist": [
    {
      heading: "Counterparty and commodity",
      paragraphs: [
        "Screen shipper, consignee, notify party, and banks on every shipment. For sensitive commodities, confirm HS chapters against restricted lists before accepting bookings.",
      ],
    },
    {
      heading: "Documentation trail",
      paragraphs: [
        "Retain screening timestamps and tool outputs in the shipment file. Auditors and insurers increasingly ask for evidence of reasonable care.",
      ],
    },
  ],
  "carbon-ocean-freight-west-africa": [
    {
      heading: "Carrier efficiency",
      paragraphs: [
        "IMO CII and EU ETS are reshaping carrier deployment. Ask carriers for vessel-class efficiency on your lanes—not just headline freight rates.",
      ],
    },
    {
      heading: "What to put in RFPs",
      paragraphs: [
        "Request emissions reporting per TEU, optional book-and-claim biofuel programmes, and modal shift scenarios (e.g. partial air for critical SKUs only).",
      ],
    },
  ],
};

export function getInsightSections(slug: string): InsightSection[] {
  return (
    INSIGHT_SECTIONS[slug] ?? [
      {
        heading: "Overview",
        paragraphs: [
          "This article is part of our insights series on logistics in Ghana and West Africa. Contact our team for lane-specific guidance tailored to your commodity and compliance profile.",
        ],
      },
    ]
  );
}
