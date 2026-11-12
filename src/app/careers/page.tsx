import Image from "next/image";
import { CTAButton } from "@/components/design-system";
import { PageHero } from "@/components/page/PageHero";
import { SiteCTA } from "@/components/layout/SiteCTA";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";
import { CAREERS_ROLES } from "@/lib/richContent";
import { siteConfig } from "@/lib/siteConfig";
import { ArrowUpRight, Briefcase, Heart, Mail, TrendingUp, Users } from "lucide-react";
import { ParallaxBackdrop } from "@/components/home-v3/ParallaxBackdrop";

export const metadata = {
  title: "Careers | Premium 1 Logistics LTD",
  description: "Join Premium 1 Logistics — brokers, coordinators, and route specialists in Ghana.",
};

const perks = [
  { icon: TrendingUp, title: "Corridor exposure", body: "Work on live shipments across Tema, ECOWAS transit, and international main carriage." },
  { icon: Users, title: "Flat teams", body: "Senior brokers sit next to coordinators — no siloed call centres or distant management." },
  { icon: Heart, title: "Real benefits", body: "Comprehensive health cover, professional dues (where applicable), and training budget for certifications." },
  { icon: Briefcase, title: "Clear growth", body: "Structured paths from coordinator → team lead → function head based on performance, not tenure." },
];

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

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build logistics careers that mean something"
        description="We hire people who like fixing problems at borders, berths, and warehouses — not slide decks. If that is you, we want to talk."
        crumbs={[{ label: "Home", href: "/" }, { label: "Careers" }]}
        backgroundImage="/hero/operations-desk.webp"
      />

      {/* Culture: text beside a photo card */}
      <section className="mx-auto grid max-w-[1320px] gap-10 px-6 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <Reveal className="flex flex-col justify-center">
          <span className={`${LABEL} self-start`}>Our culture</span>
          <h2 className={`${H2} mt-6 max-w-lg text-[var(--navy)]`}>Hands-on work first, bureaucracy second</h2>
          <div className="mt-6 max-w-xl space-y-5 text-base leading-7 text-slate-600 sm:text-lg">
            <p>
              At Premium 1, you won&apos;t be a cog in a massive multinational machine. You will have real ownership of
              client shipments, direct access to leadership, and the autonomy to make decisions that keep supply chains
              moving.
            </p>
            <p>
              We value grit, attention to detail, and a deep understanding of the West African logistics landscape. If
              you thrive under pressure and take pride in delivering when others make excuses, you&apos;ll fit right in.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="relative isolate aspect-[4/3] overflow-hidden rounded-3xl bg-[var(--navy)] lg:aspect-auto lg:h-full lg:min-h-[26rem]">
            <Image
              src="/careers-culture.webp"
              alt="Premium 1 Logistics team and workplace"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="-z-10 object-cover"
            />
            <div
              className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,20,40,0)_55%,rgba(8,20,40,0.4)_100%)]"
              aria-hidden
            />
          </div>
        </Reveal>
      </section>

      {/* Perks: navy panel with four cards */}
      <section className="px-3 py-6 sm:px-5">
        <div className="relative isolate overflow-hidden mx-auto max-w-[1480px] rounded-[1.75rem] bg-[var(--navy)] px-5 py-10 text-white sm:rounded-[2rem] sm:px-10 sm:py-14 lg:px-14">
          <ParallaxBackdrop src="/hero/ship-agency.webp" />
          <Reveal>
            <span className={LABEL_DARK}>Working here</span>
            <h2 className={`${H2} mt-6 max-w-lg`}>What you can expect</h2>
          </Reveal>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map(({ icon: Icon, title, body }, i) => (
              <li key={title}>
                <Reveal delay={i * 80} className="h-full">
                  <div className="h-full rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-6">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                    <h3 className="mt-6 text-xl font-medium tracking-[-0.01em]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/75">{body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Open roles: heading beside a list of role cards */}
      <section className="mx-auto grid max-w-[1320px] gap-10 px-6 py-12 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <span className={LABEL}>Current openings</span>
          <h2 className={`${H2} mt-6 text-[var(--navy)]`}>Join the team</h2>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600 sm:text-lg">
            Roles update frequently. Send your CV and cover letter to{" "}
            <a
              href={`mailto:${siteConfig.careersEmail}`}
              className="break-words font-medium text-[var(--navy)] underline decoration-[var(--navy)]/40 underline-offset-4 transition-colors duration-200 hover:decoration-[var(--navy)]"
            >
              {siteConfig.careersEmail}
            </a>{" "}
            with the role title in the subject line. We respond within five business days.
          </p>
        </Reveal>

        <div className="flex min-w-0 flex-col gap-3">
          <ol className="flex flex-col gap-3">
            {CAREERS_ROLES.map((r, i) => (
              <li key={r.title}>
                <Reveal delay={i * 80}>
                  <article className="grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-5 rounded-3xl border border-slate-200 bg-white p-6 transition-shadow duration-300 hover:shadow-[0_24px_48px_-32px_rgba(11,31,58,0.35)] sm:grid-cols-[3.5rem_1fr_auto] sm:items-center sm:p-8">
                    <span className="self-start pt-0.5 text-lg tabular-nums text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0">
                      <h3 className="text-xl font-medium tracking-[-0.01em] text-[var(--navy)] sm:text-2xl">{r.title}</h3>
                      <p className="mt-3 inline-flex rounded-full border border-slate-200 px-3.5 py-1 text-[13px] text-slate-600">{r.type}</p>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{r.summary}</p>
                    </div>
                    <CTAButton
                      href={`mailto:${siteConfig.careersEmail}?subject=${encodeURIComponent("Application: " + r.title)}`}
                      external
                      variant="secondary"
                      size="sm"
                      className="col-start-2 justify-self-start whitespace-nowrap sm:col-start-3"
                    >
                      Apply now <ArrowUpRight className="h-4 w-4" />
                    </CTAButton>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>

          {/* Speculative applications */}
          <Reveal>
            <div className="flex flex-col gap-5 rounded-3xl border border-slate-200/70 p-6 sm:flex-row sm:items-start sm:p-8">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--navy)]">
                <Mail className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <div className="min-w-0">
                <h3 className="text-xl font-medium tracking-[-0.01em] text-[var(--navy)] sm:text-2xl">Don&apos;t see a perfect fit?</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                  Speculative applications are welcome. Tell us which corridor or function excites you — we create roles
                  for exceptional people who can drive the business forward.
                </p>
                <CTAButton href={`mailto:${siteConfig.careersEmail}`} external variant="outline" size="sm" className="mt-5">
                  Email your CV <ArrowUpRight className="h-4 w-4" />
                </CTAButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteCTA />
    </>
  );
}
