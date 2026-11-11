"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { CASE_STUDIES } from "@/lib/richContent";

export function FeatureSpread() {
  const reduceMotion = useReducedMotion();
  const study = CASE_STUDIES[0];

  return (
    <section className="relative bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[1440px] px-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="grid overflow-hidden rounded-[2rem] bg-paper-soft lg:grid-cols-[1.3fr_1fr]"
        >
          <div className="relative aspect-[4/3] min-h-[440px] w-full lg:aspect-auto lg:min-h-[640px]">
            <Image
              src="/hero-slide-2.webp"
              alt={study.route}
              fill
              sizes="(min-width: 1024px) 56vw, 100vw"
              className="object-cover object-[center_30%]"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(11,31,58,0.6)_100%)]" />
            <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              Closed · four days early
            </div>
            <figcaption className="absolute bottom-6 left-6 right-6 font-editorial text-base italic text-white sm:text-lg">
              “{study.outcome}”
              <span className="mt-1 block text-[11px] not-italic uppercase tracking-[0.18em] text-white/85">
                — {study.industry} · {study.route}
              </span>
            </figcaption>
          </div>

          <div className="flex flex-col gap-7 p-8 sm:p-10 lg:p-12">
            <div>
              <h2 className="font-editorial text-balance text-4xl leading-[1.02] text-ink sm:text-5xl lg:text-[3.2rem]">
                {study.industry}
                <span className="italic text-[var(--accent-ink)]">.</span>
              </h2>
              <p className="mt-4 text-sm leading-7 text-ink-muted sm:text-base">{study.challenge}</p>
            </div>

            <div className="border-y border-line py-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-muted">Contractual gates closed</span>
                <span className="font-semibold text-ink">5 / 5</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#d7f3ef]">
                <div className="h-full w-full rounded-full bg-[var(--accent)]" />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                <span>{study.metrics[0]}</span>
                <span>Zero demurrage</span>
              </div>
            </div>

            <figure>
              <p className="font-editorial text-lg italic leading-snug text-ink sm:text-xl">
                “Premium 1 delivered our mining equipment from Tema to Burkina Faso ahead of schedule. Professional, transparent, and reliable.”
              </p>
              <figcaption className="mt-3 text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                Kwame Asante · Operations Director, Asante Trading
              </figcaption>
            </figure>

            <div className="mt-auto flex flex-wrap items-center gap-4">
              <Link
                href="/quote"
                className="group inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--navy)] transition-[background-color,color,transform] duration-200 hover:bg-[var(--navy)] hover:text-white active:scale-[0.98]"
              >
                Open a file like this
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link href={`/services/${study.slug}`} className="text-sm font-semibold text-ink underline underline-offset-4 hover:text-[var(--accent-ink)]">
                Read the service brief
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
