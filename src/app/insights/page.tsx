import Image from "next/image";
import Link from "next/link";
import { CTAButton } from "@/components/design-system/CTAButton";
import { PageHero } from "@/components/page/PageHero";
import { SiteCTA } from "@/components/layout/SiteCTA";
import { MOCK_INSIGHTS } from "@/lib/pageContent";
import { InsightsPageClient } from "@/components/insights/InsightsPageClient";
import { ArrowUpRight, Mail } from "lucide-react";

export const metadata = {
  title: "Insights & Blog | Premium 1 Logistics LTD",
  description: "Guides and perspectives on logistics in Ghana, customs, and West Africa corridors.",
};

function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export default function InsightsPage() {
  const featured = MOCK_INSIGHTS.find((p) => p.featured) ?? MOCK_INSIGHTS[0];

  return (
    <>
      <PageHero
        eyebrow="Guides"
        title="Practical logistics guides"
        description="Short pieces written by our team on clearing cargo in Ghana, choosing modes, and running reliable corridors — not generic marketing fluff."
        crumbs={[{ label: "Home", href: "/" }, { label: "Guides" }]}
        backgroundImage="/hero-slide-1.webp"
      />

      {/* Featured guide: image + text split */}
      <section className="mx-auto max-w-[1320px] px-6 pb-4 pt-12 sm:pt-16">
        <article className="group relative grid gap-6 rounded-3xl border border-slate-200 bg-white p-4 transition-shadow duration-300 hover:shadow-[0_24px_48px_-32px_rgba(11,31,58,0.35)] sm:p-5 lg:grid-cols-2 lg:gap-12">
          <div className="relative isolate aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-[var(--navy)] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[26rem]">
            <Image
              src={featured.featuredImage ?? "/insights-featured.webp"}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,40,0.35)_0%,rgba(8,20,40,0)_45%)]" aria-hidden />
            <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 text-[13px] font-medium text-white backdrop-blur-md">
              Featured
            </span>
          </div>

          <div className="flex flex-col justify-center px-2 pb-4 sm:px-4 lg:px-0 lg:py-8 lg:pr-10">
            <p className="text-sm text-slate-500">
              {featured.category} · {formatDate(featured.published_at)} · {featured.readTime}
            </p>
            <h2 className="mt-4 text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] text-[var(--navy)] sm:text-[2.5rem]">
              <Link href={`/insights/${featured.slug}`} className="after:absolute after:inset-0">
                {featured.title}
              </Link>
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">{featured.excerpt}</p>
            <span className="mt-8 inline-flex items-center gap-2 self-start rounded-full bg-[var(--navy)] py-3 pl-6 pr-5 text-sm font-medium text-white transition-colors duration-200 group-hover:bg-[var(--accent)] group-hover:text-[var(--navy)]">
              Read guide
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </span>
          </div>
        </article>
      </section>

      {/* All guides with topic filter */}
      <section className="mx-auto max-w-[1320px] px-6 py-12 sm:py-16">
        <InsightsPageClient posts={MOCK_INSIGHTS} featured={featured} />
      </section>

      {/* Newsletter notice */}
      <section className="mx-auto max-w-[1320px] px-6 pb-12 sm:pb-16">
        <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--navy)]">
              <Mail className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <div>
              <h2 className="text-xl font-medium tracking-[-0.01em] text-[var(--navy)] sm:text-2xl">Want this in your inbox?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
                We are building a low-frequency newsletter for procurement and ops leads. For now, follow us on LinkedIn or
                reach out to be notified at launch.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <CTAButton href="/contact" variant="secondary">
              Notify me
            </CTAButton>
            <CTAButton href="https://linkedin.com/company/premium1logistics" variant="outline" external>
              Follow on LinkedIn
            </CTAButton>
          </div>
        </div>
      </section>

      <SiteCTA />
    </>
  );
}
