"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ClipboardCheck, FileText, PackageCheck, ShieldCheck, type LucideIcon } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

const EASE = [0.22, 1, 0.36, 1] as const;
const STEP_MS = 5500;

type Step = {
  title: string;
  body: string;
  outcome: string;
  icon: LucideIcon;
  image: string;
  alt: string;
  link: { label: string; href: string };
};

const steps: Step[] = [
  {
    title: "Request and quote",
    body: "You send the shipment details. We plan the route and price every cost, line by line.",
    outcome: `A written quote within ${siteConfig.responseSlaHours} hours`,
    icon: FileText,
    image: "/hero/operations-desk.webp",
    alt: "A coordinator preparing a quote on screen",
    link: { label: "Request a quote", href: "/quote" },
  },
  {
    title: "Booking and documents",
    body: "We book the carrier and check your supplier's paperwork before the cargo ships.",
    outcome: "A document checklist for your goods",
    icon: ClipboardCheck,
    image: "/hero/customs-gate.webp",
    alt: "A coordinator checking shipment documents at the port",
    link: { label: "Freight forwarding", href: "/services/freight-forwarding" },
  },
  {
    title: "Shipping and customs",
    body: "We track the cargo and prepare the customs entry before it lands at Tema or Takoradi.",
    outcome: "A duty estimate before arrival",
    icon: ShieldCheck,
    image: "/hero-slide-2.webp",
    alt: "A container ship alongside the quay",
    link: { label: "Customs clearance", href: "/services/customs-clearance" },
  },
  {
    title: "Delivery to your door",
    body: "We truck the goods to your warehouse or site, in Ghana or across the border.",
    outcome: "Proof of delivery and duty receipts",
    icon: PackageCheck,
    image: "/services-hero.webp",
    alt: "Trucks carrying containers out of the port",
    link: { label: "Inland delivery", href: "/services/inland-transportation-hauls" },
  },
];

export function Process() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduceMotion || paused) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % steps.length), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [active, paused, reduceMotion]);

  const current = steps[active];
  const Icon = current.icon;

  return (
    <section
      className="mx-auto grid max-w-[1320px] gap-10 px-6 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="flex flex-col">
        <span className="inline-flex self-start rounded-full border border-slate-300 px-4 py-1.5 text-[13px] text-slate-600">Our process</span>
        <h2 className="mt-6 max-w-md text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] text-[var(--navy)] sm:text-[2.5rem]">
          A simple, transparent import process
        </h2>
        <p className="mt-4 max-w-sm text-base leading-7 text-slate-500">
          We take on every stage of the shipment, so your goods arrive without the chasing.
        </p>

        <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-[var(--navy)] text-white sm:aspect-[16/11] lg:mt-10 lg:aspect-auto lg:min-h-[24rem] lg:flex-1">
          {steps.map((step, i) => (
            <Image
              key={step.image}
              src={step.image}
              alt={i === active ? step.alt : ""}
              fill
              sizes="(min-width: 1024px) 46vw, 100vw"
              className={`object-cover transition-[opacity,transform] duration-[900ms] ease-out ${
                i === active ? "scale-100 opacity-100" : "scale-105 opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,40,0.35)_0%,rgba(8,20,40,0.05)_35%,rgba(8,20,40,0.7)_100%)]" />

          <div className="absolute left-4 top-4 flex items-center gap-3 rounded-full border border-white/25 bg-white/15 py-2 pl-4 pr-3 text-sm font-medium backdrop-blur-md sm:left-5 sm:top-5">
            <span className="tabular-nums">
              Step 0{active + 1} <span className="text-white/60">/ 0{steps.length}</span>
            </span>
            <span className="flex gap-1" aria-hidden>
              {steps.map((s, i) => (
                <span key={s.title} className={`h-1.5 rounded-full transition-[width,background-color] duration-500 ${i === active ? "w-5 bg-white" : "w-1.5 bg-white/45"}`} />
              ))}
            </span>
          </div>

          <div className="absolute inset-x-4 bottom-4 sm:inset-x-5 sm:bottom-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.title}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="flex items-center gap-4 rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-xl sm:max-w-md sm:p-5"
              >
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--navy)]">
                  <Icon className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <span>
                  <span className="block text-[13px] text-white/75">What you receive</span>
                  <span className="block text-base font-medium leading-snug sm:text-lg">{current.outcome}</span>
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ol className="flex flex-col justify-center gap-3">
        {steps.map((step, idx) => {
          const on = idx === active;
          return (
            <li
              key={step.title}
              className={`relative overflow-hidden rounded-3xl border transition-[background-color,border-color,box-shadow] duration-300 ${
                on ? "border-slate-200 bg-white shadow-[0_24px_48px_-32px_rgba(11,31,58,0.35)]" : "border-slate-200/70 bg-transparent hover:bg-white/60"
              }`}
            >
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setActive(idx)}
                className="grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-4 px-5 py-5 text-left sm:grid-cols-[3.5rem_1fr_auto] sm:px-7 sm:py-6"
              >
                <span className={`text-lg tabular-nums transition-colors duration-300 ${on ? "text-[var(--accent-ink)]" : "text-slate-400"}`}>0{idx + 1}</span>
                <span className={`text-lg font-medium transition-colors duration-300 sm:text-xl ${on ? "text-[var(--navy)]" : "text-slate-600"}`}>{step.title}</span>
                <span
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    on ? "rotate-45 bg-[var(--accent)] text-[var(--navy)]" : "bg-[var(--navy)] text-white"
                  }`}
                >
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </button>

              <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <div className="grid grid-cols-[2.5rem_1fr] gap-4 px-5 pb-6 sm:grid-cols-[3.5rem_1fr] sm:px-7 sm:pb-7">
                    <span />
                    <div>
                      <p className="max-w-md text-base leading-7 text-slate-600">{step.body}</p>
                      <Link
                        href={step.link.href}
                        tabIndex={on ? 0 : -1}
                        className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--navy)]"
                      >
                        <span className="border-b border-[var(--navy)]/40 pb-0.5 transition-colors group-hover:border-[var(--navy)]">{step.link.label}</span>
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {on && !reduceMotion ? (
                <motion.span
                  key={`bar-${idx}-${paused ? "p" : "r"}`}
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: paused ? 0 : 1 }}
                  transition={{ duration: paused ? 0 : STEP_MS / 1000, ease: "linear" }}
                  className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-[var(--accent)]"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
