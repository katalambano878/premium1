"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { MOCK_INSIGHTS } from "@/lib/pageContent";

const EASE = [0.22, 1, 0.36, 1] as const;

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const covers = ["/insights-featured.webp", "/hero-slide-1.webp", "/services-hero.webp"];

function meta(post: { category: string; published_at: string; readTime?: string }) {
  return [post.category, dateFmt.format(new Date(post.published_at)), post.readTime].filter(Boolean).join(" · ");
}

export function FieldStories() {
  const reduceMotion = useReducedMotion();
  const posts = MOCK_INSIGHTS.slice(0, 3);
  const [lead, ...rest] = posts;

  return (
    <section className="relative bg-paper py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 paper-grain opacity-40" />
      <div className="relative mx-auto max-w-[1440px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-editorial text-balance text-4xl leading-[1.02] text-ink sm:text-5xl lg:text-[3.6rem]">
            Guides for{" "}
            <span className="italic text-[var(--accent-ink)]">importers.</span>
          </h2>
          <Link href="/insights" className="group inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-[var(--accent-ink)]">
            <span className="border-b border-[var(--navy)] pb-0.5 transition-colors group-hover:border-[var(--accent-ink)]">All guides</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {lead ? (
          <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="group mt-12 border-t border-line pt-10"
          >
            <Link href={`/insights/${lead.slug}`} className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-14">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] lg:col-span-7 lg:aspect-[16/11]">
                <Image
                  src={lead.featuredImage || covers[0]}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
              </div>
              <div className="lg:col-span-5 lg:pb-2">
                <p className="text-sm text-ink-muted">{meta(lead)}</p>
                <h3 className="mt-4 font-editorial text-balance text-3xl leading-[1.06] text-ink transition-colors duration-200 group-hover:text-[var(--accent-ink)] sm:text-4xl lg:text-[3.1rem]">
                  {lead.title}
                </h3>
                <p className="mt-5 max-w-md text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">{lead.excerpt}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ink">
                  <span className="border-b border-[var(--navy)] pb-0.5 transition-colors group-hover:border-[var(--accent-ink)] group-hover:text-[var(--accent-ink)]">Read the guide</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </motion.article>
        ) : null}

        <div className="mt-14 grid gap-10 border-t border-line pt-10 lg:grid-cols-2 lg:gap-0">
          {rest.map((story, idx) => (
            <motion.article
              key={story.slug}
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: EASE }}
              className={`group ${idx > 0 ? "border-t border-line pt-10 lg:border-l lg:border-t-0 lg:pl-14 lg:pt-0" : "lg:pr-14"}`}
            >
              <Link href={`/insights/${story.slug}`} className="grid grid-cols-[7rem_1fr] items-start gap-5 sm:grid-cols-[13rem_1fr] sm:gap-7">
                <div className="relative aspect-square overflow-hidden rounded-xl sm:aspect-[4/3]">
                  <Image
                    src={covers[idx + 1] || story.featuredImage || covers[0]}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 13rem, 7rem"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  />
                </div>
                <div>
                  <p className="text-sm text-ink-muted">{meta(story)}</p>
                  <h3 className="mt-2 font-editorial text-balance text-2xl leading-[1.15] text-ink transition-colors duration-200 group-hover:text-[var(--accent-ink)] sm:text-[1.75rem]">
                    {story.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-muted">{story.excerpt}</p>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
