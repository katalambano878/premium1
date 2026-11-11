import Link from "next/link";
import { ArrowUpRight, Check, Layers } from "lucide-react";
import { CTAButton, ServiceCard, StepTimeline } from "@/components/design-system";
import { serviceImage } from "@/components/design-system/ServiceCard";
import { PageHero } from "@/components/page/PageHero";
import { SiteCTA } from "@/components/layout/SiteCTA";
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
        <div className="mx-auto grid max-w-[1480px] gap-10 rounded-[1.75rem] bg-[var(--navy)] px-5 py-10 text-white sm:rounded-[2rem] sm:px-10 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-14">
          <div>
            <span className="inline-flex rounded-full border border-white/30 px-4 py-1.5 text-[13px] text-white/85">Why teams choose us</span>
            <h2 className="mt-6 max-w-lg text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
              Execution you can explain to your CFO
            </h2>
            <StepTimeline steps={reasons} variant="dark" className="mt-8" />
          </div>

          <div className="self-start rounded-3xl border border-white/15 bg-white/5 p-6 sm:p-8 lg:sticky lg:top-28">
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

      {/* Comparison: one white card laid out as a table */}
      <section className="mx-auto max-w-[1320px] px-6 py-12 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
          <h2 className={H2}>Premium 1 vs the status quo</h2>
          <p className="text-base leading-7 text-slate-600 sm:text-lg">
            Not every shipment needs a premium forwarder—but when documentation, corridors, or OTIF stakes are high, the gaps show up fast. Here is how we are built differently.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8" role="table" aria-label="Premium 1 compared with a typical forwarder">
          <div className="hidden grid-cols-[10rem_1fr_1fr] gap-8 pb-4 text-sm text-slate-500 md:grid" role="row">
            <span role="columnheader" className="sr-only">
              Area
            </span>
            <span role="columnheader" className="col-start-2">
              Typical forwarder
            </span>
            <span role="columnheader" className="font-medium text-[var(--navy)]">
              Premium 1
            </span>
          </div>
          {comparison.map((row, i) => (
            <div
              key={row.aspect}
              role="row"
              className={`grid gap-3 border-slate-200 py-5 last:pb-0 md:grid-cols-[10rem_1fr_1fr] md:gap-8 md:border-t ${i === 0 ? "max-md:pt-0" : "border-t"}`}
            >
              <p role="rowheader" className="text-lg font-medium text-[var(--navy)]">
                {row.aspect}
              </p>
              <p role="cell" className="text-sm leading-6 text-slate-500 md:text-base">
                <span className="block text-[13px] text-slate-400 md:hidden">Typical forwarder</span>
                {row.typical}
              </p>
              <div role="cell" className="text-sm leading-6 text-[var(--navy)] md:text-base">
                <span className="block text-[13px] font-normal text-[var(--accent-ink)] md:hidden">Premium 1</span>
                <span className="flex gap-2.5 font-medium">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--accent-ink)]" strokeWidth={2} aria-hidden />
                  {row.premium}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How we price: heading and tags on the left, three cards on the right */}
      <section className="mx-auto grid max-w-[1320px] gap-10 px-6 py-12 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h3 className="text-xl font-medium tracking-[-0.01em] text-[var(--navy)]">What you pay for</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Service fee plus pass-through charges (THC, duties, storage, line surcharges), itemized line by line.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h3 className="text-xl font-medium tracking-[-0.01em] text-[var(--navy)]">How quotes are built</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Quotations are lane-specific and time-bound with assumptions called out, so there is no stale pricing ambiguity.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:col-span-2 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-medium tracking-[-0.01em] text-[var(--navy)]">For repeat customers</h3>
              <span className="rounded-full border border-slate-300 px-3.5 py-1.5 text-[13px] text-slate-600">Volume-friendly</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Recurring volumes can move to predictable retainer-style pricing. Share a previous invoice and we will benchmark,
              flag savings opportunities, and show where service-level improvements drive value.
            </p>
          </div>
        </div>
      </section>

      <SiteCTA />
    </>
  );
}
