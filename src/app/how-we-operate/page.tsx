import { PageHero } from "@/components/page/PageHero";
import { SiteCTA } from "@/components/layout/SiteCTA";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";
import { ParallaxBackdrop } from "@/components/home-v3/ParallaxBackdrop";
import {
  ClipboardCheck,
  Clock,
  FileCheck2,
  FileText,
  Headphones,
  Lock,
  MessageSquare,
  Package,
  Radar,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    icon: Package,
    title: "Submit inquiry",
    description:
      "Use our quote form or WhatsApp with origin, destination, commodity class, dimensions, weight, and target ETA. Attach commercial invoice drafts or packing lists if available — we use them to flag clearance risks early.",
    highlight: "Typical response: within 24 hrs",
  },
  {
    icon: FileCheck2,
    title: "Receive quote",
    description:
      "Within 24 hours you get a written quotation with line items (freight, local charges, documentation, optional insurance). We note assumptions so there are no surprises when cargo is ready.",
    highlight: "Transparent, itemised pricing",
  },
  {
    icon: ClipboardCheck,
    title: "Book & document",
    description:
      "Confirm booking, submit final documents, and receive a shipment reference. We coordinate IDF, declarations, carrier releases, and any inspection appointments in parallel.",
    highlight: "One reference for everything",
  },
  {
    icon: Radar,
    title: "Track & deliver",
    description:
      "Milestone updates by email or WhatsApp — departure, arrival, cleared, out for delivery, POD. Exceptions are escalated with options, not just alerts.",
    highlight: "Real-time milestone visibility",
  },
];

const commitments = [
  {
    icon: ShieldCheck,
    title: "Regulatory alignment",
    body: "Licensed operations with broker-led review on every declaration. We decline work we cannot execute compliantly.",
  },
  {
    icon: FileText,
    title: "Document control",
    body: "Versioned paperwork per shipment: invoices, B/Ls, permits, and correspondence stored against your shipment reference.",
  },
  {
    icon: MessageSquare,
    title: "Transparent pricing",
    body: "Quotes spell out what is included, what is pass-through, and what triggers re-rating (e.g. weight variances).",
  },
  {
    icon: Headphones,
    title: "Responsive team",
    body: "Business hours coverage for planning; active shipments get escalation paths including after-hours for critical milestones.",
  },
];

const slas = [
  {
    metric: "First quote response",
    target: "24 hrs",
    note: "Business days, complete cargo data",
    icon: Clock,
  },
  {
    metric: "Document gap review",
    target: "Same day",
    note: "If inquiry received before 14:00 GMT",
    icon: FileText,
  },
  {
    metric: "Milestone updates",
    target: "Per leg",
    note: "Export, main carriage, arrival, cleared, delivered",
    icon: Radar,
  },
];

const systems = [
  {
    title: "Operations stack",
    description:
      "Shipment records live in a central TMS with milestone codes (M1–M5) from booking to POD. Client comms are logged against shipment references so nothing lives only in a personal inbox.",
    stat: "M1–M5",
    statLabel: "Milestone tracking",
  },
  {
    title: "Warehouse integration",
    description:
      "Warehousing sites sync inventory events through a WMS integration — your stock view matches ours in real time.",
    stat: "Live",
    statLabel: "Inventory sync",
  },
  {
    title: "Enterprise governance",
    description:
      "Accounts above agreed annual volume receive quarterly steering with OTIF, dwell, and cost-per-TEU trends. Missed SLAs trigger service credits per contract schedule.",
    stat: "QBR",
    statLabel: "Quarterly reviews",
  },
];

export const metadata = {
  title: "How We Operate | Premium 1 Logistics LTD",
  description:
    "Our logistics workflow: inquiry, quote, booking, delivery — and the standards we hold ourselves to.",
};

const LABEL = "inline-flex rounded-full border border-slate-300 px-4 py-1.5 text-[13px] text-slate-600";
const LABEL_DARK = "inline-flex rounded-full border border-white/30 px-4 py-1.5 text-[13px] text-white/85";
const H2 = "text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]";
const ICON_TILE = "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--navy)]";
const REVEAL = "motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none";

function Reveal({ children, delay, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <AnimateOnScroll animation="fade-up" delay={delay} className={`${REVEAL} ${className ?? ""}`}>
      {children}
    </AnimateOnScroll>
  );
}

export default function HowWeOperatePage() {
  return (
    <>
      <PageHero
        eyebrow="Process"
        title="How we operate — clear steps, accountable people"
        description="No black boxes. You always know where your shipment is, who is handling it, and what happens next — from first quote to signed POD."
        crumbs={[{ label: "Home", href: "/" }, { label: "How We Operate" }]}
        backgroundImage="/hero/customs-gate.webp"
      />

      {/* Process: sticky heading beside four numbered step cards */}
      <section className="mx-auto grid max-w-[1320px] gap-10 px-6 py-12 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <span className={LABEL}>End-to-end process</span>
          <h2 className={`${H2} mt-6 max-w-md text-[var(--navy)]`}>Four phases every shipment passes through</h2>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600 sm:text-lg">
            Larger programmes may add design workshops or pilot lanes — these four phases cover the majority of
            freight, clearance, and distribution work we execute.
          </p>
        </Reveal>

        <ol className="flex flex-col gap-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title}>
                <Reveal delay={i * 80}>
                  <div className="grid grid-cols-[2.5rem_1fr] gap-x-4 rounded-3xl border border-slate-200 bg-white p-6 sm:grid-cols-[3.5rem_1fr_auto] sm:p-8">
                    <span className="pt-0.5 text-lg tabular-nums text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0">
                      <h3 className="text-xl font-medium tracking-[-0.01em] text-[var(--navy)] sm:text-2xl">{step.title}</h3>
                      <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">{step.description}</p>
                      <p className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-[13px] font-medium text-[var(--accent-ink)]">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                        {step.highlight}
                      </p>
                    </div>
                    <span
                      className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--navy)] sm:inline-flex"
                      aria-hidden
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Systems: navy panel with three cards */}
      <section className="px-3 py-6 sm:px-5">
        <div className="relative isolate overflow-hidden mx-auto max-w-[1480px] rounded-[1.75rem] bg-[var(--navy)] px-5 py-10 text-white sm:rounded-[2rem] sm:px-10 sm:py-14 lg:px-14">
          <ParallaxBackdrop src="/hero/customs-gate.webp" />
          <Reveal>
            <span className={LABEL_DARK}>Systems</span>
            <h2 className={`${H2} mt-6 max-w-lg`}>What runs behind the scenes</h2>
          </Reveal>

          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {systems.map((sys, i) => (
              <li key={sys.title}>
                <Reveal delay={i * 80} className="h-full">
                  <div className="flex h-full flex-col rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 sm:p-8">
                    <p className="text-4xl font-medium tracking-[-0.02em] sm:text-5xl">{sys.stat}</p>
                    <p className="mt-2 text-sm text-white/75">{sys.statLabel}</p>
                    <h3 className="mt-8 border-t border-white/15 pt-6 text-xl font-medium tracking-[-0.01em]">{sys.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/75">{sys.description}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Commitments: heading beside an icon list */}
      <section className="mx-auto grid max-w-[1320px] gap-10 px-6 py-12 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-20">
        <Reveal>
          <span className={LABEL}>Our commitments</span>
          <h2 className={`${H2} mt-6 max-w-md text-[var(--navy)]`}>
            What &ldquo;process you can trust&rdquo; means in practice
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600 sm:text-lg">
            These are operating standards - not marketing lines. Each commitment ties to a control point in our
            day-to-day shipment handling.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {["Compliance-first", "Documented handoffs", "Escalation ready"].map((tag) => (
              <li key={tag} className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] text-slate-600">
                {tag}
              </li>
            ))}
          </ul>
        </Reveal>

        <ul className="grid gap-x-10 sm:grid-cols-2">
          {commitments.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="border-t border-slate-200 py-7">
              <Reveal delay={i * 80}>
                <div className="flex items-start gap-4">
                  <span className={ICON_TILE}>
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-medium text-[var(--navy)] sm:text-xl">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Service levels: table card beside a navy card */}
      <section className="mx-auto max-w-[1320px] px-6 py-12 sm:py-16">
        <Reveal>
          <span className={LABEL}>Service levels</span>
          <h2 className={`${H2} mt-6 text-[var(--navy)]`}>Service expectations</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            SLAs are guidelines — complex commodities or peak port periods may shift timelines. Your quote will call out
            any lane-specific constraints.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal className="h-full">
            <div className="h-full rounded-3xl border border-slate-200 bg-white px-6 py-2 sm:px-8 sm:py-4">
              <ul>
                {slas.map((row, i) => {
                  const SlaIcon = row.icon;
                  return (
                    <li
                      key={row.metric}
                      className={`grid grid-cols-[3rem_1fr] items-center gap-x-4 gap-y-1 py-6 sm:grid-cols-[3rem_1fr_auto] sm:gap-x-5 ${
                        i > 0 ? "border-t border-slate-200" : ""
                      }`}
                    >
                      <span className={ICON_TILE} aria-hidden>
                        <SlaIcon className="h-5 w-5" strokeWidth={1.6} />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-lg font-medium text-[var(--navy)]">{row.metric}</h3>
                        <p className="mt-0.5 text-sm leading-6 text-slate-500">{row.note}</p>
                      </div>
                      <p className="col-start-2 text-xl font-medium tabular-nums tracking-[-0.01em] text-[var(--accent-ink)] sm:col-start-3 sm:text-2xl">
                        {row.target}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={100} className="h-full">
            <div className="flex h-full flex-col rounded-3xl bg-[var(--navy)] p-6 text-white sm:p-8">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
                <Lock className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <h3 className="mt-6 text-xl font-medium tracking-[-0.01em] sm:text-2xl">Data &amp; confidentiality</h3>
              <p className="mt-3 text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
                Commercial terms, supplier names, and contract pricing shared for quoting are used only for execution and
                held on a need-to-know basis within operations.
              </p>
              <p className="mt-3 text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
                Ask for our mutual NDA template for tender work.
              </p>
              <div className="mt-auto pt-6">
                <p className="flex items-start gap-3 border-t border-white/15 pt-5 text-sm leading-6 text-white/75">
                  <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" strokeWidth={1.6} aria-hidden />
                  <span>
                    Audit trails: request a shipment close-out pack with key documents and milestone timestamps.
                  </span>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteCTA />
    </>
  );
}
