"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, FileCheck, Ship, Truck } from "lucide-react";

const pillars = [
  {
    id: "freight",
    title: "Freight forwarding",
    pitch: "Sea, air and road freight into Ghana. We book the carrier, manage the documents and track the cargo for you.",
    href: "/services/freight-forwarding",
    image: "/service-freight.png",
    icon: Ship,
    outcomes: ["Full containers, part loads and air cargo", "A backup carrier planned for each route", "Arrival dates your finance team can plan on"],
  },
  {
    id: "customs",
    title: "Customs clearance",
    pitch: "Clearance at Tema and Takoradi, with classification, permits and duty estimates prepared before arrival.",
    href: "/services/customs-clearance",
    image: "/hero/customs-gate.jpg",
    icon: FileCheck,
    outcomes: ["A document checklist for your goods", "Duty and tax estimates before the ship lands", "Customs queries handled for you"],
  },
  {
    id: "delivery",
    title: "Inland delivery",
    pitch: "Trucking from the port to your warehouse or site, anywhere in Ghana and across the border.",
    href: "/services/inland-transportation-hauls",
    image: "/hero-slide-1.webp",
    icon: Truck,
    outcomes: ["Container and breakbulk haulage", "Oversize and heavy loads", "Deliveries to neighbouring countries"],
  },
];

const more = [
  { title: "Door-to-door delivery", body: "One price from your supplier to your door.", href: "/services/door-to-door-delivery" },
  { title: "Warehousing and distribution", body: "Storage and onward distribution.", href: "/services/warehousing-distribution" },
  { title: "Import and export handling", body: "Trade documents prepared and checked.", href: "/services/import-export-handling" },
  { title: "Ship agency", body: "Port agency for vessels calling Ghana.", href: "/services/ship-agency" },
];

export function ServicePillars() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_1fr]">
          <h2 className="font-editorial text-balance text-4xl leading-[1.02] text-ink sm:text-5xl lg:text-[3.6rem]">
            Everything between your supplier{" "}
            <span className="italic text-[var(--accent-ink)]">and your warehouse.</span>
          </h2>
          <p className="max-w-xl text-base leading-7 text-ink-muted sm:text-lg">
            Most importers juggle a forwarder, a clearing agent and a transporter. Premium 1 does all three, so there is one quote, one contact and no gaps between them.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.article
                key={pillar.id}
                initial={reduceMotion ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group relative isolate flex h-[34rem] flex-col overflow-hidden rounded-[1.5rem] text-white shadow-[0_30px_60px_-34px_rgba(11,31,58,0.5)]"
              >
                <Image
                  src={pillar.image}
                  alt={pillar.title}
                  fill
                  sizes="(min-width: 1024px) 32vw, (min-width: 768px) 50vw, 100vw"
                  className="absolute inset-0 -z-10 object-cover object-[center_20%] transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(11,31,58,0.35)_0%,rgba(11,31,58,0.18)_45%,rgba(11,31,58,0.92)_100%)]" />

                <div className="p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-md">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>

                <div className="mt-auto p-6 sm:p-7">
                  <h3 className="font-editorial text-balance text-3xl leading-tight text-white sm:text-4xl">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/80">{pillar.pitch}</p>

                  <div className="mt-5 overflow-hidden transition-[max-height,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-44 lg:group-hover:opacity-100 lg:group-focus-within:max-h-44 lg:group-focus-within:opacity-100">
                    <div className="border-t border-white/20 pt-4">
                      <ul className="space-y-2 text-xs text-white/90">
                        {pillar.outcomes.map((outcome) => (
                          <li key={outcome} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Link href={pillar.href} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-[#b8f3ec]">
                    <span className="border-b border-white/40 pb-0.5 group-hover:border-[#b8f3ec]">See the service</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>

        <ul className="mt-12 grid border-t border-line sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-10">
          {more.map((item) => (
            <li key={item.href} className="border-b border-line lg:border-b-0">
              <Link href={item.href} className="group flex items-start justify-between gap-4 py-5">
                <span>
                  <span className="block font-editorial text-xl text-ink transition-colors group-hover:text-[var(--accent-ink)]">{item.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-ink-muted">{item.body}</span>
                </span>
                <ArrowUpRight className="mt-1.5 h-4 w-4 shrink-0 text-ink transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
