"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Calendar, MapPin } from "lucide-react";

const entries = [
  {
    day: "18",
    month: "MAY",
    weekday: "Mon",
    title: "Tema vessel window · inbound FCL",
    location: "Tema Port",
    partner: "with the clearance desk",
    pill: "Pre-alerts open",
  },
  {
    day: "25",
    month: "MAY",
    weekday: "Mon",
    title: "Burkina convoy · project cargo",
    location: "Paga border window",
    partner: "with the inland desk",
    pill: "Escort confirmed",
  },
  {
    day: "07",
    month: "JUN",
    weekday: "Sat",
    title: "Air uplift briefing · time-critical",
    location: "Kotoka cargo",
    partner: "with the freight desk",
    pill: "Cut-off published",
  },
  {
    day: "21",
    month: "JUN",
    weekday: "Sun",
    title: "Client file review · Accra",
    location: "Airport Residential",
    partner: "with key-account leads",
    pill: "Seats by request",
  },
];

export function OperationsDiary() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative bg-paper-mist py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 paper-grain opacity-70" />
      <div className="relative mx-auto max-w-[1440px] px-6">
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_1fr]">
          <h2 className="font-editorial text-balance text-4xl leading-[1.02] text-ink sm:text-5xl lg:text-[3.6rem]">
            Where the files are{" "}
            <span className="italic text-[var(--accent-ink)]">this season.</span>
          </h2>
          <p className="max-w-xl text-base leading-7 text-ink-muted sm:text-lg">
            A working calendar of vessel windows, convoy slots, and desk reviews. Active shippers can ask for a seat on any of the briefings below.
          </p>
        </div>

        <ol className="mt-14 border-t border-line">
          {entries.map((entry, idx) => (
            <motion.li
              key={entry.title}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="group grid grid-cols-1 items-center gap-4 border-b border-line py-6 transition-colors duration-200 hover:bg-white/60 sm:grid-cols-[auto_1fr_auto] sm:gap-8 sm:px-4 sm:py-7"
            >
              <div className="flex h-20 w-20 flex-col items-center justify-center rounded-xl bg-white text-ink ring-line sm:h-24 sm:w-24">
                <span className="font-editorial text-3xl leading-none sm:text-4xl">{entry.day}</span>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-ink)]">{entry.month}</span>
                <span className="mt-0.5 text-[10px] font-medium text-ink-muted">{entry.weekday}</span>
              </div>

              <div>
                <h3 className="font-editorial text-xl leading-snug text-ink sm:text-2xl">{entry.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-ink-muted sm:text-[13px]">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[var(--accent-ink)]" />
                    {entry.location}
                  </span>
                  <span className="font-editorial italic">{entry.partner}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 ring-line text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--navy)]">
                  {entry.pill}
                </span>
                <Link href="/contact" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-[var(--accent-ink)]">
                  Ask for a seat
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="inline-flex items-center gap-2 text-sm text-ink-muted">
            <Calendar className="h-4 w-4 text-[var(--accent-ink)]" />
            Diary refreshed every Monday morning.
          </p>
          <Link href="/how-we-operate" className="group inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-[var(--accent-ink)]">
            <span className="border-b border-[var(--navy)] pb-0.5 transition-colors group-hover:border-[var(--accent)]">See how a file moves</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
