"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const services = [
  {
    title: "Freight forwarding",
    pitch: "We book the carrier, manage the documents and track your cargo by sea, air or road.",
    points: ["Full containers, part loads, air cargo", "A backup carrier for each route"],
    href: "/services/freight-forwarding",
    image: "/service-freight.png",
  },
  {
    title: "Customs clearance",
    pitch: "Classification, permits and duty estimates prepared before your cargo lands.",
    points: ["Tema and Takoradi ports", "Customs queries handled for you"],
    href: "/services/customs-clearance",
    image: "/hero/customs-gate.jpg",
  },
  {
    title: "Inland delivery",
    pitch: "Trucking from the port gate to your warehouse or site, in Ghana and across the border.",
    points: ["Containers and breakbulk", "Oversize and heavy loads"],
    href: "/services/inland-transportation-hauls",
    image: "/hero-slide-1.webp",
  },
];

const more = [
  { title: "Door-to-door delivery", href: "/services/door-to-door-delivery" },
  { title: "Warehousing and distribution", href: "/services/warehousing-distribution" },
  { title: "Import and export handling", href: "/services/import-export-handling" },
  { title: "Ship agency", href: "/services/ship-agency" },
];

export function Services() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <h2 className="text-balance text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-[var(--navy)] sm:text-5xl lg:text-6xl">
            One company for the whole import.
          </h2>
          <p className="max-w-lg text-lg leading-8 text-slate-600">
            No separate forwarder, clearing agent and transporter. One quote, one contact, no gaps between them.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {services.map((s, idx) => (
            <motion.article
              key={s.href}
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, delay: idx * 0.08, ease: EASE }}
              className="group"
            >
              <Link href={s.href} className="flex h-full flex-col overflow-hidden rounded-2xl bg-[var(--navy)] text-white">
                <div className="relative h-60 overflow-hidden sm:h-72">
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 32vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7 sm:p-8">
                  <h3 className="text-2xl font-bold tracking-[-0.02em] sm:text-[1.75rem]">{s.title}</h3>
                  <p className="mt-3 text-base leading-7 text-white/80">{s.pitch}</p>
                  <ul className="mt-5 space-y-2.5">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-3 text-[15px] text-white/90">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={3} />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-8 flex items-center justify-between border-t border-white/15 pt-6 text-base font-bold">
                    See the service
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--navy)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {more.map((m) => (
            <li key={m.href}>
              <Link
                href={m.href}
                className="group flex h-full items-center justify-between gap-4 rounded-xl border border-slate-200 px-5 py-4 text-base font-bold text-[var(--navy)] transition-colors duration-200 hover:border-[var(--navy)] hover:bg-[var(--navy)] hover:text-white"
              >
                {m.title}
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
