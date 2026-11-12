import { notFound } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import { Check, ClipboardCheck, Clock, HelpCircle, Layers, Plus, Route, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { CTAButton, ServiceCard, StepTimeline } from "@/components/design-system";
import { serviceImage } from "@/components/design-system/ServiceCard";
import { PageHero } from "@/components/page/PageHero";
import { SiteCTA } from "@/components/layout/SiteCTA";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";
import { MOCK_SERVICES } from "@/lib/mock";
import { SERVICE_DEEP, DEFAULT_SERVICE_DEEP } from "@/lib/pageContent";
import { SERVICE_CASE_SNIPPETS } from "@/lib/richContent";
import { ParallaxBackdrop } from "@/components/home-v3/ParallaxBackdrop";

/** Second photo per service for the overview card, so it does not repeat the hero image. */
const OVERVIEW_IMAGES: Record<string, string> = {
  "freight-forwarding": "/hero-slide-2.webp",
  "ship-agency": "/hero-slide-2.webp",
  "import-export-handling": "/hero/customs-gate.webp",
  "customs-clearance": "/hero/customs-gate.webp",
  "warehousing-distribution": "/hero/operations-desk.webp",
  "inland-transportation-hauls": "/hero-slide-1.webp",
  "door-to-door-delivery": "/hero-slide-1.webp",
  "supply-chain-support-solutions": "/hero/operations-desk.webp",
};

const LABEL = "inline-flex rounded-full border border-slate-300 px-4 py-1.5 text-[13px] text-slate-600";
const LABEL_DARK = "inline-flex rounded-full border border-white/30 px-4 py-1.5 text-[13px] text-white/85";
const H2 = "text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] text-[var(--navy)] sm:text-[2.5rem]";
const CARD = "rounded-3xl border border-slate-200 bg-white p-6 sm:p-8";
const ICON_TILE = "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--navy)]";
const SECTION = "mx-auto max-w-[1320px] px-6 py-12 sm:py-16";

const two = (n: number) => String(n).padStart(2, "0");

const SCOPE_ICONS = [Route, ClipboardCheck, ShieldCheck, Clock, Layers, Users];

/** Photos for the scope card, picked so it differs from the hero and overview photos. */
const SCOPE_POOL = ["/hero/freight-dawn.webp", "/hero/ship-agency.webp", "/hero/operations-desk.webp", "/hero/customs-gate.webp", "/hero-slide-1.webp", "/hero-slide-2.webp"];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = MOCK_SERVICES.find((s) => s.slug === slug);
  if (!service) return { title: "Service Not Found" };
  return {
    title: `${service.name} | Premium 1 Logistics LTD`,
    description: service.description,
  };
}

export async function generateStaticParams() {
  return MOCK_SERVICES.map((s) => ({ slug: s.slug }));
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = MOCK_SERVICES.find((s) => s.slug === slug);
  if (!service) notFound();

  const deep = SERVICE_DEEP[slug] ?? DEFAULT_SERVICE_DEEP;
  const related = deep.relatedSlugs
    .map((s) => MOCK_SERVICES.find((x) => x.slug === s))
    .filter(Boolean) as typeof MOCK_SERVICES;

  const heroImage = serviceImage(service.slug, service.image);
  const overviewImage = OVERVIEW_IMAGES[service.slug] ?? heroImage;
  const scopeImage = SCOPE_POOL.find((src) => src !== heroImage && src !== overviewImage) ?? overviewImage;
  const workflowImage =
    SCOPE_POOL.find((src) => src !== heroImage && src !== overviewImage && src !== scopeImage) ?? scopeImage;

  const caseSnip = SERVICE_CASE_SNIPPETS[slug];
  const faqJsonLd =
    deep.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: deep.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <>
      {faqJsonLd && (
        <Script
          id={`faq-${slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <PageHero
        eyebrow="Service"
        title={service.name}
        description={service.description}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.name },
        ]}
        backgroundImage={heroImage}
      />

      {/* ── Overview: lead text beside a photo card, then case + audience cards ── */}
      <section className={SECTION}>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <AnimateOnScroll animation="fade-up">
              <span className={LABEL}>Overview</span>
              <h2 className="sr-only">About {service.name}</h2>
              <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">{deep.longLead}</p>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={120}>
              <div className="mt-8 flex flex-wrap gap-3">
                <CTAButton href="/quote" variant="secondary" size="lg">
                  Request a quote
                </CTAButton>
                <CTAButton href="/contact" variant="outline" size="lg">
                  Talk to our team
                </CTAButton>
              </div>
            </AnimateOnScroll>
          </div>

          <AnimateOnScroll animation="fade-up" delay={100}>
            <div className="relative isolate flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-3xl bg-[var(--navy)] p-4 text-white sm:p-5">
              <Image
                src={overviewImage}
                alt={`${service.name} operations`}
                fill
                className="-z-10 object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,20,40,0.25)_0%,rgba(8,20,40,0.1)_35%,rgba(8,20,40,0.9)_100%)]"
                aria-hidden
              />
              <div className="rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-xl sm:max-w-md sm:p-5">
                <p className="text-[13px] text-white/85">Service focus</p>
                <p className="mt-1 text-base font-medium leading-snug sm:text-lg">
                  On-the-ground execution with clear ownership from first instruction to close-out.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>

        <div className={caseSnip ? "mt-10 grid gap-4 md:grid-cols-2 sm:mt-12" : "mt-10 sm:mt-12"}>
          {caseSnip && (
            <AnimateOnScroll animation="fade-up" delay={80}>
              <div className="flex h-full flex-col rounded-3xl bg-[var(--navy)] p-6 text-white sm:p-8">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                    <TrendingUp className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <span className={LABEL_DARK}>Case snapshot</span>
                </div>
                <h3 className="mt-6 text-xl font-medium tracking-[-0.01em] sm:text-2xl">{caseSnip.title}</h3>
                <p className="mt-3 text-base leading-7 text-white/75">{caseSnip.body}</p>
                <div className="mt-auto pt-8">
                  <div className="border-t border-white/15 pt-5">
                    <p className="text-[13px] text-white/75">Business impact</p>
                    <p className="mt-1 text-lg font-medium leading-snug text-[var(--accent)] sm:text-xl">{caseSnip.metric}</p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          )}

          <AnimateOnScroll animation="fade-up" delay={caseSnip ? 160 : 80}>
            <div className={`h-full ${CARD}`}>
              <div className="flex items-center gap-4">
                <span className={ICON_TILE}>
                  <Users className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <span className={LABEL}>Who it serves</span>
              </div>
              <h3 className="mt-6 text-xl font-medium tracking-[-0.01em] text-[var(--navy)] sm:text-2xl">Built for your operating model</h3>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{deep.whoItServes}</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Offerings (optional): sticky photo card beside numbered icon cards ── */}
      {deep.offerings && deep.offerings.length > 0 && (
        <section className={`${SECTION} grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14`}>
          <AnimateOnScroll animation="fade-up" className="lg:sticky lg:top-28 lg:self-start">
            <span className={LABEL}>Service scope</span>
            <h2 className={`mt-6 ${H2}`}>What this service covers</h2>
            <div className="relative isolate mt-8 flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-3xl bg-[var(--navy)] p-4 text-white sm:p-5 lg:aspect-[4/5]">
              <Image src={scopeImage} alt="" fill sizes="(max-width: 1024px) 100vw, 36vw" className="-z-10 object-cover" />
              <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,20,40,0.15)_0%,rgba(8,20,40,0.05)_40%,rgba(8,20,40,0.85)_100%)]" aria-hidden />
              <div className="flex items-center gap-4 rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-xl sm:p-5">
                <span className="text-4xl font-medium tabular-nums tracking-[-0.03em] text-[var(--accent)]">{two(deep.offerings.length)}</span>
                <span className="text-base font-medium leading-snug">parts to this service, handled by one team</span>
              </div>
            </div>
          </AnimateOnScroll>
          <div className="grid content-start gap-4 sm:grid-cols-2">
            {deep.offerings.map((o, i) => {
              const Icon = SCOPE_ICONS[i % SCOPE_ICONS.length];
              return (
                <AnimateOnScroll key={o.title} animation="fade-up" delay={i * 50}>
                  <div className="group h-full rounded-3xl border border-slate-200 bg-white p-6 transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_48px_-32px_rgba(11,31,58,0.35)] sm:p-8">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--navy)] text-white transition-colors duration-300 group-hover:bg-[var(--accent)] group-hover:text-[var(--navy)]">
                        <Icon className="h-5 w-5" strokeWidth={1.6} />
                      </span>
                      <span className="text-lg tabular-nums text-slate-300" aria-hidden>
                        {two(i + 1)}
                      </span>
                    </div>
                    <h3 className="mt-8 text-xl font-medium tracking-[-0.01em] text-[var(--navy)]">{o.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{o.description}</p>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Highlights: light teal panel with a tick card per deliverable ── */}
      <section className="px-3 py-6 sm:px-5">
        <div className="mx-auto grid max-w-[1480px] gap-10 rounded-[1.75rem] border border-[#c4ebe6] bg-[#e4f6f3] px-5 py-10 sm:rounded-[2rem] sm:px-10 sm:py-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16 lg:px-14">
          <AnimateOnScroll animation="fade-up">
            <span className="inline-flex rounded-full border border-[var(--accent-ink)]/30 bg-white/60 px-4 py-1.5 text-[13px] text-[var(--accent-ink)]">Capabilities</span>
            <h2 className={`mt-6 ${H2}`}>What you can expect</h2>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-600 sm:text-lg">
              Concrete deliverables on every shipment, not generic promises.
            </p>
            <CTAButton href="/quote" variant="secondary" size="md" className="mt-8">
              Get a quote
            </CTAButton>
          </AnimateOnScroll>

          <ol className="grid gap-3 sm:grid-cols-2">
            {deep.highlights.map((h, i) => (
              <AnimateOnScroll key={h} animation="fade-up" delay={i * 60}>
                <li className="flex h-full items-start gap-4 rounded-2xl bg-white p-5 shadow-[0_16px_32px_-28px_rgba(11,31,58,0.45)] sm:p-6">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--navy)]">
                    <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[13px] tabular-nums text-slate-400">{two(i + 1)}</span>
                    <span className="mt-0.5 block text-base font-medium leading-6 text-[var(--navy)]">{h}</span>
                  </span>
                </li>
              </AnimateOnScroll>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Commercial impact: three cards ── */}
      {deep.salesPoints && deep.salesPoints.length > 0 && (
        <section className={SECTION}>
          <AnimateOnScroll animation="fade-up" className="max-w-2xl">
            <span className={LABEL}>Commercial impact</span>
            <h2 className={`mt-6 ${H2}`}>Why this service pays for itself</h2>
          </AnimateOnScroll>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {deep.salesPoints.map((p, i) => (
              <AnimateOnScroll key={p.title} animation="fade-up" delay={i * 70}>
                <div className={`flex h-full flex-col ${CARD}`}>
                  <span className="text-lg tabular-nums text-slate-400" aria-hidden>
                    {two(i + 1)}
                  </span>
                  <h3 className="mt-8 text-xl font-medium tracking-[-0.01em] text-[var(--navy)] sm:mt-12">{p.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{p.body}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </section>
      )}

      {/* ── Workflow + differentiators: navy panel ── */}
      <section className="px-3 py-6 sm:px-5">
        <div className="relative isolate overflow-hidden mx-auto grid max-w-[1480px] gap-10 rounded-[1.75rem] bg-[var(--navy)] px-5 py-10 text-white sm:rounded-[2rem] sm:px-10 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-16 lg:px-14">
          <ParallaxBackdrop src={workflowImage} />
          <div>
            <AnimateOnScroll animation="fade-up">
              <span className={LABEL_DARK}>The process</span>
              <h2 className="mt-6 text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
                {service.name} workflow
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
                We run {service.name.toLowerCase()} with defined control points, ownership, and escalation from kickoff to close-out.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={100}>
              <StepTimeline steps={deep.workflow} variant="dark" className="mt-8" />
            </AnimateOnScroll>
          </div>

          <div className="lg:sticky lg:top-28">
            <AnimateOnScroll animation="fade-up" delay={150}>
              <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                    <Layers className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <span className={LABEL_DARK}>Why us</span>
                </div>
                <h3 className="mt-6 text-xl font-medium tracking-[-0.01em] sm:text-2xl">Why clients pick us here</h3>
                <ul className="mt-6 space-y-4">
                  {deep.differentiators.map((d) => (
                    <li key={d} className="flex gap-3 text-base leading-7 text-white/85">
                      <Check className="mt-1.5 h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={2} aria-hidden />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 border-t border-white/15 pt-6">
                  <CTAButton href="/quote" className="w-full" variant="primary" size="lg">
                    Start your quote
                  </CTAButton>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ── FAQs: accordion in a white card beside a contact card ── */}
      {deep.faqs.length > 0 && (
        <section className={`${SECTION} grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-16`}>
          <div>
            <AnimateOnScroll animation="fade-up">
              <div className="flex items-center gap-4">
                <span className={ICON_TILE}>
                  <HelpCircle className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <span className={LABEL}>FAQ</span>
              </div>
              <h2 className={`mt-6 ${H2}`}>Common questions</h2>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                Fast answers to the questions we hear most before kickoff.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={80} className="mt-8">
              <div className="rounded-3xl border border-slate-200 bg-white px-6 sm:px-8">
                {deep.faqs.map((faq, i) => (
                  <details key={faq.q} className="group border-t border-slate-200 first:border-t-0">
                    <summary className="grid cursor-pointer list-none grid-cols-[2rem_1fr_auto] items-center gap-3 py-5 sm:grid-cols-[3rem_1fr_auto] sm:gap-4 sm:py-6 [&::-webkit-details-marker]:hidden">
                      <span className="text-lg tabular-nums text-slate-400" aria-hidden>
                        {two(i + 1)}
                      </span>
                      <span className="text-lg font-medium text-[var(--navy)] sm:text-xl">{faq.q}</span>
                      <span
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--navy)] text-white transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-45 group-open:bg-[var(--accent)] group-open:text-[var(--navy)]"
                        aria-hidden
                      >
                        <Plus className="h-5 w-5" />
                      </span>
                    </summary>
                    <p className="pb-6 pl-[2.75rem] pr-2 text-base leading-7 text-slate-600 sm:pl-16 sm:pr-14">{faq.a}</p>
                  </details>
                ))}
              </div>
            </AnimateOnScroll>
          </div>

          <div className="lg:sticky lg:top-28">
            <AnimateOnScroll animation="fade-up" delay={120}>
              <div className="rounded-3xl bg-[var(--navy)] p-6 text-white sm:p-8">
                <span className={LABEL_DARK}>Need clarity now?</span>
                <h3 className="mt-6 text-xl font-medium tracking-[-0.01em] sm:text-2xl">Talk to an operations specialist</h3>
                <p className="mt-3 text-base leading-7 text-white/75">
                  Share your route, cargo type, and delivery window. We will advise on the right service scope before you commit.
                </p>
                <div className="mt-8 flex flex-col gap-3">
                  <CTAButton href="/contact" variant="primary" size="lg" className="w-full">
                    Contact operations
                  </CTAButton>
                  <CTAButton href="/quote" variant="light" size="lg" className="w-full">
                    Request a structured quote
                  </CTAButton>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      )}

      {/* ── Related services: row of cards ── */}
      {related.length > 0 && (
        <section className={SECTION}>
          <AnimateOnScroll animation="fade-up" className="max-w-3xl">
            <span className={LABEL}>Bundle</span>
            <h2 className={`mt-6 ${H2}`}>Related services</h2>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Services frequently combined with {service.name.toLowerCase()} for smoother execution and tighter accountability.
            </p>
          </AnimateOnScroll>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => (
              <AnimateOnScroll key={r.slug} animation="fade-up" delay={i * 80}>
                <ServiceCard name={r.name} slug={r.slug} description={r.description} icon={r.icon} />
              </AnimateOnScroll>
            ))}
          </div>
        </section>
      )}

      <SiteCTA />
    </>
  );
}
