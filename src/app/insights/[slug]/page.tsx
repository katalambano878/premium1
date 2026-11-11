import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CTAButton } from "@/components/design-system/CTAButton";
import { PageHero } from "@/components/page/PageHero";
import { SiteCTA } from "@/components/layout/SiteCTA";
import { MOCK_INSIGHTS, getInsightSections, type InsightPost } from "@/lib/pageContent";
import { INSIGHT_AUTHORS } from "@/lib/richContent";
import { siteConfig } from "@/lib/siteConfig";
import { ArrowLeft, ArrowUpRight, User } from "lucide-react";

/** Mirrors the guides index: posts that only carry the shared placeholder image get a rotating site photo. */
const DEFAULT_IMAGE = "/insights-featured.webp";
const CARD_IMAGES = [
  "/hero/customs-gate.webp",
  "/hero-slide-2.webp",
  "/hero/operations-desk.webp",
  "/services-hero.webp",
  "/hero/ship-agency.webp",
  "/hero-slide-1.webp",
  "/hero/freight-dawn.webp",
];

function imageFor(post: InsightPost) {
  if (post.featured && post.featuredImage) return post.featuredImage;
  if (post.featuredImage && post.featuredImage !== DEFAULT_IMAGE) return post.featuredImage;
  const idx = Math.max(0, MOCK_INSIGHTS.findIndex((p) => p.id === post.id));
  return CARD_IMAGES[idx % CARD_IMAGES.length];
}

function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export async function generateStaticParams() {
  return MOCK_INSIGHTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = MOCK_INSIGHTS.find((p) => p.slug === slug);
  if (!post) return { title: "Article" };
  const title = `${post.title} | Premium 1 Logistics`;
  const description = post.excerpt;
  const image = post.featuredImage ? `${siteConfig.url}${post.featuredImage}` : undefined;
  return {
    title,
    description,
    openGraph: image
      ? { title, description, images: [{ url: image, width: 1200, height: 630, alt: post.title }] }
      : undefined,
    twitter: image ? { card: "summary_large_image", title, description, images: [image] } : undefined,
  };
}

export default async function InsightArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = MOCK_INSIGHTS.find((p) => p.slug === slug);
  if (!post) notFound();
  const sections = getInsightSections(slug);
  const author = INSIGHT_AUTHORS[post.authorKey] ?? INSIGHT_AUTHORS.default;
  const related = MOCK_INSIGHTS.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={post.category}
        title={post.title}
        description={post.excerpt}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/insights" },
          { label: post.title },
        ]}
        backgroundImage={imageFor(post)}
      />

      {/* Reading column */}
      <div className="mx-auto max-w-3xl px-6 pb-12 pt-10 sm:pb-16 sm:pt-12">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--navy)]">
              <User className="h-5 w-5" strokeWidth={1.6} aria-hidden />
            </span>
            <div>
              <p className="text-base font-medium text-[var(--navy)]">{author.name}</p>
              <p className="text-sm text-slate-500">{author.title}</p>
              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{author.bio}</p>
            </div>
          </div>
          <p className="shrink-0 text-sm text-slate-500 sm:pt-0.5 sm:text-right">
            {formatDate(post.published_at)} · {post.readTime}
          </p>
        </div>

        <article className="pt-10">
          {sections.map((sec) => (
            <section key={sec.heading} className="mb-12 last:mb-0">
              <h2 className="text-balance text-2xl font-medium leading-[1.2] tracking-[-0.02em] text-[var(--navy)] sm:text-3xl">{sec.heading}</h2>
              {sec.paragraphs.map((p) => (
                <p key={p.slice(0, 40)} className="mt-5 text-pretty text-lg leading-8 text-slate-700">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </article>

        <div className="mt-12 flex flex-col gap-5 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/insights" className="group inline-flex items-center gap-2 self-start text-sm font-medium text-[var(--navy)]">
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden />
            <span className="border-b border-[var(--navy)]/40 pb-0.5 transition-colors group-hover:border-[var(--navy)]">Back to guides</span>
          </Link>
          <CTAButton href="/quote" variant="secondary" className="self-start sm:self-auto">
            Discuss your lane
            <ArrowUpRight className="h-4 w-4" />
          </CTAButton>
        </div>
      </div>

      {/* Related guides */}
      <section className="mx-auto max-w-[1320px] px-6 pb-12 sm:pb-16">
        <h2 className="text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] text-[var(--navy)] sm:text-[2.5rem]">Related guides</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => (
            <Link
              key={r.slug}
              href={`/insights/${r.slug}`}
              className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-3 transition-shadow duration-300 hover:shadow-[0_24px_48px_-32px_rgba(11,31,58,0.35)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.125rem] bg-slate-200">
                <Image
                  src={imageFor(r)}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              </div>
              <div className="px-3 pb-4 pt-5 sm:px-4">
                <p className="text-sm text-slate-500">
                  {r.category} · {formatDate(r.published_at)} · {r.readTime}
                </p>
                <p className="mt-3 text-xl font-medium leading-snug tracking-[-0.01em] text-[var(--navy)]">{r.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SiteCTA />
    </>
  );
}
