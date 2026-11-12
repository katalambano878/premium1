import Image from "next/image";
import { CTAButton } from "@/components/design-system";
import { PageHero } from "@/components/page/PageHero";
import { SiteCTA } from "@/components/layout/SiteCTA";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";
import { MOCK_STATS } from "@/lib/mock";
import { Anchor, ArrowUpRight, BadgeCheck, Check, Globe2, Shield, Target, Users } from "lucide-react";
import { TEAM_LEADERS } from "@/lib/richContent";
import { siteConfig } from "@/lib/siteConfig";
import { ParallaxBackdrop } from "@/components/home-v3/ParallaxBackdrop";

export const metadata = {
  title: "About Us | Premium 1 Logistics LTD",
  description:
    "Premium 1 Logistics — corporate freight partner in Ghana and West Africa. Mission, values, capabilities, and coverage.",
};

const pillars = [
  {
    icon: Target,
    title: "Outcome-driven",
    body: "Every lane and mode choice is weighed against your delivery date, landed cost, and compliance exposure — not generic templates.",
  },
  {
    icon: Shield,
    title: "Compliance first",
    body: "Classification, permits, and documentation are treated as operational risks we manage proactively, not afterthoughts at the gate.",
  },
  {
    icon: Globe2,
    title: "Corridor-native",
    body: "Deep familiarity with Tema, Takoradi, regional ports, and landlocked ECOWAS destinations means fewer surprises at borders.",
  },
  {
    icon: Users,
    title: "One point of contact",
    body: "You work with a dedicated operations contact who handles your shipment from quote through proof of delivery.",
  },
];

const milestones = [
  { year: "2010", text: "Founded with focus on corporate import consolidation and customs brokerage." },
  { year: "2014", text: "Expanded inland haulage and project cargo for mining and construction sectors." },
  { year: "2018", text: "Launched integrated warehousing and distribution for FMCG clients." },
  { year: "2022", text: "Formalised supply-chain advisory for clients scaling across West Africa." },
];

const capabilities = [
  "Freight forwarding — air, sea, FCL, LCL, and multimodal",
  "Customs clearance and transit bonds for ECOWAS corridors",
  "Warehousing, inventory control, pick-pack-ship",
  "Inland haulage, project cargo, and last-mile delivery",
  "Door-to-door programmes with single accountability",
  "Supply-chain diagnostics and network design",
];

const LABEL = "inline-flex rounded-full border border-slate-300 px-4 py-1.5 text-[13px] text-slate-600";
const LABEL_DARK = "inline-flex rounded-full border border-white/30 px-4 py-1.5 text-[13px] text-white/85";
const H2 = "text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]";
const CARD = "rounded-3xl border border-slate-200 bg-white p-6 sm:p-8";
const ICON_TILE = "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--navy)]";
const REVEAL = "motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none";

function Reveal({ children, delay, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <AnimateOnScroll animation="fade-up" delay={delay} className={`${REVEAL} ${className ?? ""}`}>
      {children}
    </AnimateOnScroll>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((x) => x[0])
    .join("");
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Built for serious shippers in Ghana and beyond"
        description="We combine hands-on port and corridor experience with the discipline corporate teams expect: clear quotes, accountable execution, and documentation you can audit."
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        backgroundImage="/hero-slide-1.webp"
      />

      {/* Story and mission: text beside a photo card */}
      <section className="mx-auto grid max-w-[1320px] gap-10 px-6 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <Reveal className="flex flex-col justify-center">
          <span className={`${LABEL} self-start`}>Our story</span>
          <h2 className={`${H2} mt-6 max-w-lg text-[var(--navy)]`}>From brokerage to end-to-end logistics</h2>
          <div className="mt-6 max-w-xl space-y-5 text-base leading-7 text-slate-600 sm:text-lg">
            <p>
              Premium 1 Logistics started where many international shipments touch Ghana: customs clearance and port
              coordination. Clients asked us to stay involved after release — to book trucks, store stock, and manage
              the next leg. We built the capabilities to match.
            </p>
            <p>
              Today we serve manufacturers, traders, NGOs, and project owners who need one accountable partner across
              freight forwarding, clearance, warehousing, and inland distribution. Our team blends senior brokers with
              young coordinators trained on modern tracking and reporting tools.
            </p>
            <p>
              Whether you are landing your first container in Tema or routing project cargo to Ouagadougou, we structure
              the work so you always know who to call and what happens next.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="relative isolate flex min-h-[30rem] flex-col justify-between overflow-hidden rounded-3xl bg-[var(--navy)] p-4 text-white sm:min-h-[34rem] sm:p-5 lg:h-full">
            <Image
              src="/about-story.webp"
              alt="Port and logistics operations"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="-z-10 object-cover"
            />
            <div
              className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,20,40,0.25)_0%,rgba(8,20,40,0.1)_35%,rgba(8,20,40,0.9)_100%)]"
              aria-hidden
            />

            <p className="self-start rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 text-[13px] font-medium backdrop-blur-md">
              15+ years active
            </p>

            <div className="rounded-2xl border border-white/25 bg-white/15 p-5 backdrop-blur-xl sm:p-6">
              <h3 className="text-xl font-medium tracking-[-0.01em] sm:text-2xl">Our mission</h3>
              <p className="mt-2 text-base leading-7 text-white/85">
                Maximise reliability and minimise total landed cost for our clients through expert documentation, honest
                communication, and execution that stands up to audit.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Principles: four white cards */}
      <section className="mx-auto max-w-[1320px] px-6 py-12 sm:py-16">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-16 gap-y-4">
          <div>
            <span className={LABEL}>How we work</span>
            <h2 className={`${H2} mt-6 max-w-lg text-[var(--navy)]`}>Principles, not platitudes</h2>
          </div>
          <p className="max-w-md text-base leading-7 text-slate-600 sm:text-lg">
            Four commitments every team member is measured against — from the first quote to final POD.
          </p>
        </Reveal>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, i) => (
            <li key={pillar.title}>
              <Reveal delay={i * 80} className="h-full">
                <div className={`${CARD} h-full`}>
                  <span className={ICON_TILE}>
                    <pillar.icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-6 text-xl font-medium tracking-[-0.01em] text-[var(--navy)]">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{pillar.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Capabilities and figures: navy panel */}
      <section className="px-3 py-6 sm:px-5">
        <div className="relative isolate overflow-hidden mx-auto grid max-w-[1480px] gap-10 rounded-[1.75rem] bg-[var(--navy)] px-5 py-10 text-white sm:rounded-[2rem] sm:px-10 sm:py-14 lg:grid-cols-2 lg:gap-16 lg:px-14">
          <ParallaxBackdrop src="/hero/operations-desk.webp" />
          <Reveal>
            <span className={LABEL_DARK}>Capabilities</span>
            <h2 className={`${H2} mt-6 max-w-md`}>What we handle in-house</h2>
            <ul className="mt-8 border-b border-white/15">
              {capabilities.map((item) => (
                <li key={item} className="flex items-start gap-4 border-t border-white/15 py-4">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[var(--accent)]">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </span>
                  <span className="text-base leading-7 text-white/85">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <CTAButton href="/services" variant="primary" size="lg">
                Explore services
                <ArrowUpRight className="h-5 w-5" />
              </CTAButton>
            </div>
          </Reveal>

          <Reveal delay={100} className="flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
                <BadgeCheck className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <h3 className="text-xl font-medium tracking-[-0.01em] sm:text-2xl">At a glance</h3>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4">
              {MOCK_STATS.map((s) => (
                <div key={s.label} className="flex flex-col-reverse justify-end rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-5 sm:p-6">
                  <dt className="mt-2 text-sm leading-6 text-white/75">{s.label}</dt>
                  <dd className="text-4xl font-medium tabular-nums tracking-[-0.02em] sm:text-5xl">
                    {s.prefix}
                    {s.end}
                    {s.suffix}
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="mt-6 flex flex-wrap gap-2">
              {["SLA-focused execution", "Named contact per shipment", "Audit-ready documentation"].map((tag) => (
                <li key={tag} className="rounded-full border border-white/30 px-3.5 py-1.5 text-[13px] text-white/85">
                  {tag}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Leadership: three white cards */}
      <section className="mx-auto max-w-[1320px] px-6 py-12 sm:py-16">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-16 gap-y-4">
          <div>
            <span className={LABEL}>People</span>
            <h2 className={`${H2} mt-6 max-w-lg text-[var(--navy)]`}>The people handling your shipments</h2>
          </div>
          <p className="max-w-md text-base leading-7 text-slate-600 sm:text-lg">
            Our leadership still touches live shipments — so standards stay grounded in port and border reality.
          </p>
        </Reveal>

        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {TEAM_LEADERS.map((m, i) => (
            <li key={m.name}>
              <Reveal delay={i * 80} className="h-full">
                <article className={`${CARD} flex h-full flex-col`}>
                  <span
                    aria-hidden
                    className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--navy)] text-lg font-medium text-white"
                  >
                    {initials(m.name)}
                  </span>
                  <h3 className="mt-6 text-xl font-medium tracking-[-0.01em] text-[var(--navy)] sm:text-2xl">{m.name}</h3>
                  <p className="mt-1 text-sm font-medium text-[var(--accent-ink)]">{m.role}</p>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{m.bio}</p>
                  <div className="mt-auto pt-6">
                    <p className="flex items-start gap-2.5 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-500">
                      <Anchor className="mt-1 h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.6} aria-hidden />
                      <span>{m.cred}</span>
                    </p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Milestones: heading beside numbered rows */}
      <section className="mx-auto grid max-w-[1320px] gap-10 px-6 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <span className={LABEL}>Our journey</span>
          <h2 className={`${H2} mt-6 max-w-md text-[var(--navy)]`}>Company milestones</h2>
          <p className="mt-4 text-base leading-7 text-slate-500">2010 — Present</p>
        </Reveal>

        <ol className="border-b border-slate-200">
          {milestones.map((m, i) => (
            <li key={m.year} className="border-t border-slate-200">
              <Reveal delay={i * 60}>
                <div className="grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-1 py-6 sm:grid-cols-[3.5rem_7rem_1fr] sm:items-baseline">
                  <span className="text-lg tabular-nums text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-lg font-medium tabular-nums text-[var(--navy)] sm:text-xl">{m.year}</span>
                  <p className="col-start-2 text-sm leading-6 text-slate-500 sm:col-start-3 sm:text-base sm:leading-7">{m.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Licences and compliance: white card beside a navy card */}
      <section className="mx-auto grid max-w-[1320px] gap-4 px-6 py-12 sm:py-16 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal className="h-full">
          <div className={`${CARD} h-full`}>
            <span className={ICON_TILE}>
              <BadgeCheck className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <h2 className={`${H2} mt-6 text-[var(--navy)]`}>Licences &amp; memberships</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              We maintain active registrations with Ghana Customs and international freight bodies. Reference numbers are
              available on request for tenders and partner verification.
            </p>

            <dl className="mt-8 grid gap-x-8 gap-y-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-slate-500">Status</dt>
                <dd className="mt-1 text-base font-medium text-[var(--navy)]">Active</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Registrations</dt>
                <dd className="mt-1 text-base font-medium text-[var(--navy)]">{siteConfig.licenses.length} listed</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Review cycle</dt>
                <dd className="mt-1 text-base font-medium text-[var(--navy)]">Annual</dd>
              </div>
            </dl>

            <ol className="mt-6">
              {siteConfig.licenses.map((l, i) => (
                <li key={l.name} className="grid grid-cols-[2.5rem_1fr] items-start gap-x-4 gap-y-2 border-t border-slate-200 py-5 sm:grid-cols-[3rem_1fr_auto] sm:items-center">
                  <span className="text-lg tabular-nums text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <p className="break-words text-lg font-medium text-[var(--navy)]">{l.name}</p>
                    <p className="mt-0.5 text-sm leading-6 text-slate-500">{l.issuer}</p>
                  </div>
                  <span className="col-start-2 justify-self-start rounded-full border border-slate-300 px-3.5 py-1 text-[13px] text-[var(--accent-ink)] sm:col-start-3">
                    Active
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <Reveal delay={100} className="h-full">
          <div className="h-full rounded-3xl bg-[var(--navy)] p-6 text-white sm:p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
              <Shield className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <h3 className="mt-6 text-xl font-medium tracking-[-0.01em] sm:text-2xl">Data, audit &amp; insurance</h3>
            <ul className="mt-6 border-b border-white/15">
              {[
                "Cargo liability and E&O coverages reviewed annually; certificates available under NDA for tenders.",
                "Shipment files retained per statutory minimums with encrypted backups.",
                "Client-specific NDAs and MSAs supported for enterprise programmes.",
                "Working toward ISO 9001 alignment on key process maps.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-4 border-t border-white/15 py-4">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[var(--accent)]">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </span>
                  <span className="text-sm leading-6 text-white/85 sm:text-base sm:leading-7">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <SiteCTA />
    </>
  );
}
