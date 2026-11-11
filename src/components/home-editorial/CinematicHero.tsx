"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";

type Slide = {
  id: string;
  headlineLead: string;
  headlineAccent: string;
  headlineTail?: string;
  description: string;
  shortDescription: string;
  image: string;
  alt: string;
  cta: { primary: { label: string; href: string }; secondary: { label: string; href: string } };
};

const slides: Slide[] = [
  {
    id: "imports",
    headlineLead: "Your cargo into Ghana,",
    headlineAccent: "cleared and delivered",
    headlineTail: " by one team.",
    description:
      "Freight forwarding, customs clearance and inland delivery for importing companies, from your supplier's door to your warehouse.",
    shortDescription: "Freight, customs clearance and delivery for importers, under one team.",
    image: "/hero/freight-dawn.jpg",
    alt: "Container ship berthed at dawn with tugboats alongside",
    cta: {
      primary: { label: "Get a quote", href: "/quote" },
      secondary: { label: "See our services", href: "/services" },
    },
  },
  {
    id: "customs",
    headlineLead: "Customs clearance that starts",
    headlineAccent: "before the ship",
    headlineTail: " arrives.",
    description:
      "Classification, permits and duty estimates are prepared early, so your containers at Tema or Takoradi are not left waiting on paperwork.",
    shortDescription: "Permits and duty estimates prepared before your cargo lands.",
    image: "/hero/customs-gate.jpg",
    alt: "Clearance coordinator checking documents beside a container truck",
    cta: {
      primary: { label: "Get a clearance quote", href: "/quote" },
      secondary: { label: "How clearance works", href: "/services/customs-clearance" },
    },
  },
  {
    id: "freight",
    headlineLead: "Sea, air and road freight,",
    headlineAccent: "planned",
    headlineTail: " as one shipment.",
    description:
      "We book the carrier, manage the documents and arrange the truck, so you deal with one company instead of four.",
    shortDescription: "Carrier, documents and trucking arranged by one company.",
    image: "/hero/ship-agency.jpg",
    alt: "Cargo vessel alongside the quay",
    cta: {
      primary: { label: "Get a freight quote", href: "/quote" },
      secondary: { label: "Freight forwarding", href: "/services/freight-forwarding" },
    },
  },
  {
    id: "support",
    headlineLead: "One contact who knows",
    headlineAccent: "your shipment,",
    headlineTail: " from quote to delivery.",
    description:
      "You get a named person, a written quote with every cost listed, and an update at each stage until the goods are delivered.",
    shortDescription: "A named contact, a written quote and updates at every stage.",
    image: "/hero/operations-desk.jpg",
    alt: "Operations coordinator reviewing a shipment on screen",
    cta: {
      primary: { label: "Get a quote", href: "/quote" },
      secondary: { label: "How we work", href: "/how-we-operate" },
    },
  },
];

const SLIDE_MS = 7000;

export function CinematicHero() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const goTo = useCallback((next: number) => {
    setIndex((next + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    timerRef.current = window.setTimeout(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, paused, reduceMotion]);

  const slide = slides[index];

  return (
    <section className="relative isolate overflow-hidden bg-paper">
      <div className="relative h-[100svh] min-h-[660px] w-full sm:h-[92svh] lg:h-[88svh] lg:min-h-[720px] xl:min-h-[780px]">
        <AnimatePresence mode="sync">
          <motion.div
            key={slide.id}
            initial={reduceMotion || index === 0 ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 ken-burns">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                quality={80}
                className="object-cover object-center"
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,31,58,0.1)_0%,rgba(11,31,58,0.3)_28%,rgba(11,31,58,0.9)_58%,rgba(11,31,58,0.97)_100%)] sm:bg-[linear-gradient(180deg,rgba(11,31,58,0.08)_0%,rgba(11,31,58,0.18)_45%,rgba(11,31,58,0.82)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(11,31,58,0.5)_0%,rgba(11,31,58,0.12)_45%,transparent_70%)]" />
          </motion.div>
        </AnimatePresence>

        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col px-6">
          <div className="mt-auto pb-8 pt-16 sm:pb-12 lg:pb-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={`copy-${slide.id}`}
                initial={reduceMotion ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -20 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-4xl"
              >
                <h1 className="max-w-4xl font-editorial text-balance text-[2.25rem] leading-[1.03] tracking-tight text-white sm:text-[2.9rem] md:text-[3.4rem] lg:text-[4rem] xl:text-[4.5rem]">
                  {slide.headlineLead}{" "}
                  <span className="relative inline-block">
                    <span className="italic text-[#b8f3ec]">{slide.headlineAccent}</span>
                    <svg
                      aria-hidden
                      viewBox="0 0 200 8"
                      preserveAspectRatio="none"
                      className="absolute left-0 right-0 top-full block h-[10px] w-full -translate-y-1 text-[var(--accent)]/90"
                    >
                      <path d="M2 5 C 40 1, 90 7, 198 3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
                    </svg>
                  </span>
                  {slide.headlineTail}
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-white/90 sm:mt-6 sm:text-lg">
                  <span className="line-clamp-2 sm:hidden">{slide.shortDescription}</span>
                  <span className="hidden sm:inline">{slide.description}</span>
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                  <Link
                    href={slide.cta.primary.href}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-7 py-3.5 text-base font-semibold text-[var(--navy)] shadow-[0_16px_32px_-14px_rgba(4,14,28,0.7)] transition-[background-color,color,transform] duration-200 active:scale-[0.98] hover:bg-white hover:text-ink sm:w-auto"
                  >
                    {slide.cta.primary.label}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                  <Link
                    href={slide.cta.secondary.href}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:text-[#b8f3ec] active:bg-white/10 sm:w-auto sm:justify-start sm:rounded-none sm:border-0 sm:p-0 sm:text-sm"
                  >
                    <span className="transition-colors sm:border-b sm:border-white/50 sm:pb-0.5 sm:group-hover:border-[#b8f3ec]">
                      {slide.cta.secondary.label}
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="relative border-t border-line bg-paper">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="flex flex-col gap-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-5">
              {slides.map((s, i) => {
                const active = i === index;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Show slide ${i + 1}: ${s.headlineLead}`}
                    aria-current={active ? "true" : undefined}
                    className={`group flex items-center gap-3 text-left transition-colors ${
                      active ? "text-ink" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    <span className={`font-editorial text-base italic ${active ? "text-[var(--accent-ink)]" : ""}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="relative h-[2px] w-12 overflow-hidden rounded-full bg-[var(--navy)]/15 sm:w-16">
                      {active ? (
                        <motion.span
                          key={`bar-${index}-${paused ? "p" : "r"}`}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: paused || reduceMotion ? 0 : SLIDE_MS / 1000, ease: "linear" }}
                          className="absolute inset-y-0 left-0 bg-[var(--accent)]"
                        />
                      ) : null}
                    </span>
                    <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] sm:inline">{s.id}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Resume slideshow" : "Pause slideshow"}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-ink)]"
              >
                {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
              <span>{paused ? "Paused" : "Auto-advancing"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
