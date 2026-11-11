"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { InsightPost } from "@/lib/pageContent";
import { ArrowUpRight } from "lucide-react";

const ALL = "All topics";

/** Every post currently shares one placeholder image; rotate site photos so the grid is not seven copies of it. */
const DEFAULT_IMAGE = "/insights-featured.webp";
const CARD_IMAGES = [
  "/hero/customs-gate.jpg",
  "/hero-slide-2.webp",
  "/hero/operations-desk.jpg",
  "/services-hero.webp",
  "/hero/ship-agency.jpg",
  "/hero-slide-1.webp",
  "/hero/freight-dawn.jpg",
];

function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function InsightsPageClient({ posts, featured }: { posts: InsightPost[]; featured: InsightPost }) {
  const categories = useMemo(() => {
    const s = new Set(posts.map((p) => p.category));
    return [ALL, ...Array.from(s)];
  }, [posts]);
  const [cat, setCat] = useState(ALL);

  const filtered = useMemo(() => {
    if (cat === ALL) return posts.filter((p) => p.id !== featured.id);
    return posts.filter((p) => p.id !== featured.id && p.category === cat);
  }, [cat, posts, featured.id]);

  const imageFor = (post: InsightPost) => {
    if (post.featured && post.featuredImage) return post.featuredImage;
    if (post.featuredImage && post.featuredImage !== DEFAULT_IMAGE) return post.featuredImage;
    const idx = Math.max(0, posts.findIndex((p) => p.id === post.id));
    return CARD_IMAGES[idx % CARD_IMAGES.length];
  };

  return (
    <>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] text-[var(--navy)] sm:text-[2.5rem]">
          {cat === ALL ? "Latest guides" : cat}
        </h2>

        <div role="group" aria-label="Filter guides by topic" className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const on = c === cat;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => setCat(c)}
                className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-[background-color,color,border-color,transform] duration-200 active:scale-[0.97] ${
                  on
                    ? "border-[var(--navy)] bg-[var(--navy)] text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:border-[var(--navy)] hover:text-[var(--navy)]"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <article
            key={p.id}
            className="group relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-3 transition-shadow duration-300 hover:shadow-[0_24px_48px_-32px_rgba(11,31,58,0.35)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.125rem] bg-slate-200">
              <Image
                src={imageFor(p)}
                alt=""
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
            </div>

            <div className="flex flex-1 flex-col px-3 pb-4 pt-5 sm:px-4">
              <p className="text-sm text-slate-500">
                {p.category} · {formatDate(p.published_at)} · {p.readTime}
              </p>
              <h3 className="mt-3 text-xl font-medium leading-snug tracking-[-0.01em] text-[var(--navy)] sm:text-2xl">
                <Link href={`/insights/${p.slug}`} className="after:absolute after:inset-0">
                  {p.title}
                </Link>
              </h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">{p.excerpt}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--navy)]">
                <span className="border-b border-[var(--navy)]/40 pb-0.5 transition-colors group-hover:border-[var(--navy)]">Read guide</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
          <p className="text-base text-slate-500">No guides in this topic yet.</p>
        </div>
      )}
    </>
  );
}
