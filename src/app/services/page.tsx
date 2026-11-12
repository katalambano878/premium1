import Link from "next/link";
import { ArrowUpRight, CalendarClock, Check, Layers, Receipt, Repeat, X } from "lucide-react";
import { CTAButton, ServiceCard, StepTimeline } from "@/components/design-system";
import { serviceImage } from "@/components/design-system/ServiceCard";
import { PageHero } from "@/components/page/PageHero";
import { SiteCTA } from "@/components/layout/SiteCTA";
import { ParallaxBackdrop } from "@/components/home-v3/ParallaxBackdrop";
import { MOCK_SERVICES } from "@/lib/mock";

export const metadata = {
  title: "Logistics Services | Premium 1 Logistics LTD",
  description:
    "Freight forwarding, ship agency, customs clearance, warehousing, door-to-door delivery, and supply chain support across Ghana and West Africa.",
};

const reasons = [
  {
    title: "Named operations contact per account",
    description:
      "No bouncing between departments. Your assigned expert knows your cargo, your compliance history, and your deadlines.",
  },
  {
    title: "Quotations with clear assumptions and exclusions",
    description:
      "We separate our margin from pass-through charges. You see exactly what we earn versus what the market bills.",
  },
  {
    title: "Corridor experience from Tema to landlocked ECOWAS",
    description:
      "Deep familiarity with Tema, Takoradi, and the complex transit bonds required for landlocked neighbors.",
  },
  {
    title: "Documentation archived per shipment for audit",
    description: "Every milestone and document is captured in a clean audit trail, ready for your compliance team.",
  },
];

const advantages = ["Single SLA across all bundled services", "One dedicated operations owner"];

const comparison: { aspect: string; typical: string; premium: string }[] = [
  {
    aspect: "Accountability",
    typical: "Rotating staff; context lost between shifts",
    premium: "One named contact per shipment, from start to finish",
  },
  {
    aspect: "Quotation",
    typical: "Lump-sum quotes; surprises at destination",
    premium: "Line items + assumptions; re-rate triggers spelled out",
  },
  { aspect: "Corridor", typical: "Often re-brokered at border", premium: "ECOWAS transit bonds & escorts in-house" },
  { aspect: "Data", typical: "Ad-hoc WhatsApp only", premium: "Milestone codes + close-out packs" },
  { aspect: "Commercial", typical: "Transactional only", premium: "Quarterly steering on volume accounts" },
];

const pricingTags = ["Transparent structure", "No hidden add-ons", "Lane-specific validity"];

const pricingPoints = [
  {
    icon: Receipt,
    title: "What you pay for",
    body: "Service fee plus pass-through charges (THC, duties, storage, line surcharges), itemized line by line.",
  },
  {
    icon: CalendarClock,
    title: "How quotes are built",
    body: "Quotations are lane-specific and time-bound with assumptions called out, so there is no stale pricing ambiguity.",
  },
  {
    icon: Repeat,
    title: "For repeat customers",
    tag: "Volume-friendly",
    body: "Recurring volumes can move to predictable retainer-style pricing. Share a previous invoice and we will benchmark, flag savings opportunities, and show where service-level improvements drive value.",
  },
];

/** Illustrative quote lines (no prices): the pass-through charges listed in the copy above. */
const quoteLines = [
  { label: "Ocean freight", note: "Carrier rate for the lane" },
  { label: "Terminal handling (THC)", note: "Origin and destination port charges" },
  { label: "Duties and taxes", note: "Paid to GRA Customs" },
  { label: "Storage", note: "Only if the cargo is held" },
  { label: "Line surcharges", note: "Fuel and seasonal charges" },
];

/** Glass tags on the two featured photo cards; taken from each service's own description. */
const FEATURED_TAGS: Record<string, string[]> = {
  "freight-forwarding": ["Air", "Sea", "Road"],
  "ship-agency": ["Full", "Husbandry", "Protective"],
};

const LABEL = "inline-flex rounded-full border border-slate-300 px-4 py-1.5 text-[13px] text-slate-600";
const H2 = "text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] text-[var(--navy)] sm:text-[2.5rem]";

export default function ServicesPage() {
  const featured = MOCK_SERVICES.slice(0, 2);
  const rest = MOCK_SERVICES.slice(2);

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Every mode, every milestone—one accountable team"
        description="From the first booking to proof of delivery, we stitch together forwarding, clearance, storage, and haulage so you are not juggling disconnected vendors."
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        backgroundImage="/services-hero.webp"
      />

      {/* All services: two photo cards, then six white cards */}
      <section className="mx-auto max-w-[1320px] px-6 py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className={LABEL}>All services</span>
            <h2 className={`mt-6 ${H2}`}>Eight service lines, infinite combinations</h2>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Select a card for workflows, FAQs, and how we differentiate on that product.
            </p>
          </div>
          <Link
            href="/quote"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white py-2.5 pl-5 pr-4 text-left text-sm font-medium text-[var(--navy)] transition-colors duration-200 hover:border-[var(--navy)] hover:bg-[var(--navy)] hover:text-white"
          >
            Not sure where to start? Request a scoped quote
            <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {featured.map((s) => (
            <ServiceCard
              key={s.id}
              name={s.name}
              slug={s.slug}
              description={s.description}
              icon={s.icon}
              image={serviceImage(s.slug, s.image)}
              tags={FEATURED_TAGS[s.slug]}
            />
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((s) => (
            <ServiceCard key={s.id} name={s.name} slug={s.slug} description={s.description} icon={s.icon} />
          ))}
        </div>
      </section>

      {/* Why teams choose us: navy panel, numbered rows beside one card */}
      <section className="px-3 py-6 sm:px-5">
        <div className="relative isolate mx-auto grid max-w-[1480px] gap-10 overflow-hidden rounded-[1.75rem] bg-[var(--navy)] px-5 py-10 text-white sm:rounded-[2rem] sm:px-10 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-14 lg:py-20">
          <ParallaxBackdrop src="/hero/freight-dawn.webp" position="center 60%" />
          <div>
            <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-[13px] text-white/90 backdrop-blur-md">Why teams choose us</span>
            <h2 className="mt-6 max-w-lg text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
              Execution you can explain to your CFO
            </h2>
            <StepTimeline steps={reasons} variant="dark" className="mt-8" />
          </div>

          <div className="self-start rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl sm:p-8 lg:sticky lg:top-28">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
              <Layers className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <h3 className="mt-6 text-xl font-medium tracking-[-0.01em] sm:text-2xl">The Premium 1 Advantage</h3>
            <p className="mt-3 text-base leading-7 text-white/75">
              Most clients combine clearance + haulage, or forwarding + warehousing. Tell us your pain point—we map the smallest, most efficient set of services to fix it.
            </p>
            <ol className="mt-6 border-t border-white/15">
              {advantages.map((a, i) => (
                <li key={a} className="flex gap-4 border-b border-white/15 py-4">
                  <span className="text-base tabular-nums text-white/70" aria-hidden>
                    0{i + 1}
                  </span>
                  <span className="text-base font-medium">{a}</span>
                </li>
              ))}
            </ol>
            <CTAButton href="/how-we-operate" variant="primary" className="mt-8 w-full sm:w-auto">
              Explore our process
            </CTAButton>
          </div>
        </div>
      </section>

      {/* Comparison: a muted "typical" card against a raised navy Premium 1 card */}
      <section className="mx-auto max-w-[1320px] px-6 py-12 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <span className={LABEL}>Why it matters</span>
            <h2 className={`mt-6 ${H2}`}>Premium 1 vs the status quo</h2>
          </div>
          <p className="text-base leading-7 text-slate-600 sm:text-lg">
            Not every shipment needs a premium forwarder—but when documentation, corridors, or OTIF stakes are high, the gaps show up fast. Here is how we are built differently.
          </p>
        </div>

        <div className="relative mt-10 grid gap-4 lg:mt-14 lg:grid-cols-2 lg:items-center lg:gap-6">
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-100/70 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-medium tracking-[-0.01em] text-slate-500">Typical forwarder</h3>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-[13px] text-slate-500">What importers often get</span>
            </div>
            <ul className="mt-6 divide-y divide-slate-200 border-t border-slate-200">
              {comparison.map((row) => (
                <li key={row.aspect} className="flex gap-4 py-4 lg:min-h-[5.5rem] lg:items-center">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 lg:mt-0">
                    <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[13px] text-slate-400">{row.aspect}</span>
                    <span className="block text-base leading-6 text-slate-500">{row.typical}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 z-10 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#f4f4f5] bg-[var(--accent)] text-sm font-medium text-[var(--navy)] lg:inline-flex"
          >
            vs
          </span>

          <div className="relative overflow-hidden rounded-3xl bg-[var(--navy)] p-6 text-white shadow-[0_32px_64px_-36px_rgba(11,31,58,0.6)] sm:p-8 lg:py-10">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-medium tracking-[-0.01em]">Premium 1</h3>
              <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-[13px] font-medium text-[var(--navy)]">What you get with us</span>
            </div>
            <ul className="mt-6 divide-y divide-white/15 border-t border-white/15">
              {comparison.map((row) => (
                <li key={row.aspect} className="flex gap-4 py-4 lg:min-h-[5.5rem] lg:items-center">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--navy)] lg:mt-0">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[13px] text-[#b8f3ec]">{row.aspect}</span>
                    <span className="block text-base font-medium leading-6 text-white">{row.premium}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-white/15 pt-6">
              <CTAButton href="/quote" variant="primary" size="md">
                Get a quote <ArrowUpRight className="h-4 w-4" />
              </CTAButton>
            </div>
          </div>
        </div>
      </section>

      {/* How we price: explanations beside an illustrated quote showing how costs are itemised */}
      <section className="mx-auto grid max-w-[1320px] gap-12 px-6 py-12 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-20">
        <div>
          <span className={LABEL}>Pricing clarity</span>
          <h2 className={`mt-6 ${H2}`}>How we price</h2>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600 sm:text-lg">
            We separate market costs from our operating fee so commercial decisions stay clear before booking.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {pricingTags.map((tag) => (
              <li key={tag} className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-[var(--navy)]">
                {tag}
              </li>
            ))}
          </ul>

          <ul className="mt-10 space-y-6 border-t border-slate-200 pt-8">
            {pricingPoints.map((point) => {
              const Icon = point.icon;
              return (
                <li key={point.title} className="flex gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--navy)] text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <span>
                    <span className="flex flex-wrap items-center gap-2 text-lg font-medium text-[var(--navy)]">
                      {point.title}
                      {point.tag ? (
                        <span className="rounded-full bg-[#e4f6f3] px-2.5 py-0.5 text-[12px] font-medium text-[var(--accent-ink)]">{point.tag}</span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-slate-500">{point.body}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:mx-0">
          <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 rotate-[2.5deg] rounded-3xl bg-[var(--navy)] sm:translate-x-5 sm:translate-y-5" />
          <figure className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_32px_64px_-40px_rgba(11,31,58,0.45)] sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-300 pb-5">
              <div>
                <p className="text-[13px] text-slate-500">Example quote structure</p>
                <p className="mt-1 text-xl font-medium tracking-[-0.01em] text-[var(--navy)]">Shanghai to Tema, 1 × 40ft</p>
              </div>
              <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-[12px] font-medium text-[var(--navy)]">Itemised</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {quoteLines.map((line) => (
                <li key={line.label} className="flex items-center justify-between gap-4 py-3.5">
                  <span>
                    <span className="block text-[15px] font-medium text-[var(--navy)]">{line.label}</span>
                    <span className="block text-[13px] text-slate-500">{line.note}</span>
                  </span>
                  <span className="shrink-0 rounded-full border border-slate-200 px-2.5 py-1 text-[12px] text-slate-500">At cost</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between gap-4 rounded-2xl bg-[var(--navy)] px-4 py-4 text-white sm:px-5">
              <span>
                <span className="block text-[15px] font-medium">Premium 1 service fee</span>
                <span className="block text-[13px] text-white/70">Our only margin, shown on its own line</span>
              </span>
              <span className="shrink-0 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[12px] font-medium text-[var(--navy)]">Our fee</span>
            </div>
            <figcaption className="mt-5 grid gap-2 border-t border-dashed border-slate-300 pt-5 text-[13px] text-slate-500 sm:grid-cols-2">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--accent-ink)]" strokeWidth={2.5} aria-hidden /> Assumptions written on the quote
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--accent-ink)]" strokeWidth={2.5} aria-hidden /> Validity dates for each lane
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <SiteCTA />
    </>
  );
}
