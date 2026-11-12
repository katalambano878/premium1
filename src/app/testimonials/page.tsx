import Image from "next/image";
import { CTAButton } from "@/components/design-system";
import { PageHero } from "@/components/page/PageHero";
import { SiteCTA } from "@/components/layout/SiteCTA";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";
import { MOCK_TESTIMONIALS } from "@/lib/mock";
import { CASE_STUDIES, EXTENDED_TESTIMONIALS } from "@/lib/richContent";
import { ArrowUpRight, Check, Lock, Star } from "lucide-react";
import { ParallaxBackdrop } from "@/components/home-v3/ParallaxBackdrop";

export const metadata = {
  title: "Client Success & Testimonials | Premium 1 Logistics LTD",
  description: "What clients say about Premium 1 Logistics — corporate freight across Ghana and West Africa.",
};

const ALL_T = [...MOCK_TESTIMONIALS, ...EXTENDED_TESTIMONIALS];

const LABEL = "inline-flex rounded-full border border-slate-300 px-4 py-1.5 text-[13px] text-slate-600";
const LABEL_DARK = "inline-flex rounded-full border border-white/30 px-4 py-1.5 text-[13px] text-white/85";
const H2 = "text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]";
const REVEAL = "motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none";

function Reveal({ children, delay, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <AnimateOnScroll animation="fade-up" delay={delay} className={`${REVEAL} ${className ?? ""}`}>
      {children}
    </AnimateOnScroll>
  );
}

function Rating({ value, dark }: { value: number; dark?: boolean }) {
  return (
    <p className="flex items-center gap-1">
      <span className="sr-only">Rated {value} out of 5</span>
      {Array.from({ length: value }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className={`h-4 w-4 ${dark ? "fill-[var(--accent)] text-[var(--accent)]" : "fill-[var(--navy)] text-[var(--navy)]"}`}
        />
      ))}
    </p>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export default function TestimonialsPage() {
  const featured = ALL_T[0];
  const rest = ALL_T.slice(1);

  return (
    <>
      <PageHero
        eyebrow="Client feedback"
        title="Trusted by teams who cannot afford delays"
        description="Manufacturers, traders, and project owners rely on us when documentation, corridors, and timelines all have to line up."
        crumbs={[{ label: "Home", href: "/" }, { label: "Client Success" }]}
        backgroundImage="/hero/ship-agency.webp"
      />

      {/* Featured testimonial: navy panel */}
      <section className="px-3 pb-6 pt-3 sm:px-5 sm:pt-5">
        <div className="relative isolate overflow-hidden mx-auto max-w-[1480px] rounded-[1.75rem] bg-[var(--navy)] px-5 py-10 text-white sm:rounded-[2rem] sm:px-10 sm:py-14 lg:px-14">
          <ParallaxBackdrop src="/hero-slide-2.webp" />
          <Reveal>
            <figure className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-end lg:gap-16">
              <div>
                <span className={LABEL_DARK}>Featured review</span>
                <div className="mt-8">
                  <Rating value={featured.rating} dark />
                </div>
                <blockquote className="mt-5 max-w-3xl text-balance text-2xl font-medium leading-[1.25] tracking-[-0.02em] sm:text-[2.5rem] sm:leading-[1.2]">
                  &ldquo;{featured.quote}&rdquo;
                </blockquote>
              </div>

              <figcaption className="flex items-center gap-4 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-6">
                {featured.avatar && (
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                    <Image src={featured.avatar} alt={featured.client_name} fill className="object-cover" sizes="64px" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block break-words text-lg font-medium sm:text-xl">{featured.client_name}</span>
                  <span className="block text-sm leading-6 text-white/85">{featured.company}</span>
                  {featured.role && <span className="block text-sm leading-6 text-white/75">{featured.role}</span>}
                </span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* More testimonials: white card grid */}
      <section className="mx-auto max-w-[1320px] px-6 py-12 sm:py-16">
        <Reveal>
          <span className={LABEL}>Client feedback</span>
          <h2 className={`${H2} mt-6 text-[var(--navy)]`}>More client voices</h2>
        </Reveal>

        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {rest.map((t, i) => (
            <li key={t.id}>
              <Reveal delay={(i % 2) * 80} className="h-full">
                <figure className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
                  <Rating value={t.rating} />
                  <blockquote className="mt-5 text-lg leading-8 text-[var(--navy)] sm:text-xl sm:leading-8">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  <div className="mt-auto pt-8">
                    <figcaption className="flex items-center gap-4 border-t border-slate-200 pt-6">
                      {t.avatar ? (
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-slate-200">
                          <Image src={t.avatar} alt={t.client_name} fill className="object-cover" sizes="48px" />
                        </span>
                      ) : (
                        <span
                          aria-hidden
                          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-base font-medium text-[var(--navy)]"
                        >
                          {initials(t.client_name)}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block break-words text-base font-medium text-[var(--navy)]">{t.client_name}</span>
                        <span className="block text-sm leading-6 text-slate-500">
                          {t.role ? `${t.role}, ` : ""}
                          {t.company}
                        </span>
                      </span>
                    </figcaption>
                  </div>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Case studies: wide three-part rows */}
      <section className="mx-auto max-w-[1320px] px-6 py-12 sm:py-16">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-16 gap-y-4">
          <div>
            <span className={LABEL}>Case studies</span>
            <h2 className={`${H2} mt-6 max-w-lg text-[var(--navy)]`}>Redacted case studies</h2>
          </div>
          <p className="max-w-md text-base leading-7 text-slate-600 sm:text-lg">
            Illustrative outcomes — full decks, customer references, and metrics packs available under NDA for qualified
            RFPs.
          </p>
        </Reveal>

        <ol className="mt-10 flex flex-col gap-3">
          {CASE_STUDIES.map((c, i) => (
            <li key={c.id}>
              <Reveal delay={i * 80}>
                <article className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:grid-cols-[1fr_1.3fr_1fr] lg:gap-12">
                  <div className="flex gap-4">
                    <span className="pt-0.5 text-lg tabular-nums text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0">
                      <p className="inline-flex rounded-full border border-slate-200 px-3.5 py-1 text-[13px] text-slate-600">{c.industry}</p>
                      <h3 className="mt-4 break-words text-xl font-medium tracking-[-0.01em] text-[var(--navy)] sm:text-2xl">{c.route}</h3>
                    </div>
                  </div>

                  <dl className="space-y-5 border-t border-slate-200 pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
                    <div>
                      <dt className="text-sm text-slate-500">Challenge</dt>
                      <dd className="mt-1 text-base leading-7 text-slate-600">{c.challenge}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-slate-500">Outcome</dt>
                      <dd className="mt-1 text-base font-medium leading-7 text-[var(--navy)]">{c.outcome}</dd>
                    </div>
                  </dl>

                  <div className="border-t border-slate-200 pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
                    <p className="text-sm text-slate-500">Key metrics</p>
                    <ul className="mt-3 space-y-2.5">
                      {c.metrics.map((m) => (
                        <li key={m} className="flex items-start gap-3 text-sm leading-6 text-[var(--navy)]">
                          <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--accent-ink)]" strokeWidth={2} aria-hidden />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* References on request */}
      <section className="mx-auto max-w-[1320px] px-6 pb-12 sm:pb-16">
        <Reveal>
          <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--navy)]">
                <Lock className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <div>
                <h2 className="text-xl font-medium tracking-[-0.01em] text-[var(--navy)] sm:text-2xl">Need deeper diligence?</h2>
                <p className="mt-2 max-w-xl text-base leading-7 text-slate-600">
                  We provide banker references, insurance certificates, and site visits for enterprise tenders.
                </p>
              </div>
            </div>
            <CTAButton href="/contact" variant="secondary" size="md" className="self-start whitespace-nowrap lg:self-center">
              Ask for references <ArrowUpRight className="h-4 w-4" />
            </CTAButton>
          </div>
        </Reveal>
      </section>

      <SiteCTA />
    </>
  );
}
