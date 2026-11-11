"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const services = [
  {
    tags: ["Sea", "Air", "Road"],
    title: "Freight forwarding",
    body: "Carrier booking, documents and tracking for full containers, part loads and air cargo.",
    image: "/service-freight.png",
    href: "/services/freight-forwarding",
  },
  {
    tags: ["Tema", "Takoradi"],
    title: "Customs clearance",
    body: "Classification, permits and duty estimates prepared before your cargo lands.",
    image: "/hero/customs-gate.jpg",
    href: "/services/customs-clearance",
  },
  {
    tags: ["Containers", "Oversize loads"],
    title: "Inland delivery",
    body: "Trucking from the port to your warehouse or site, in Ghana and across the border.",
    image: "/hero-slide-1.webp",
    href: "/services/inland-transportation-hauls",
  },
];

export function ServicesDark() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-3 py-6 sm:px-5">
      <div className="mx-auto max-w-[1480px] rounded-[1.75rem] bg-[var(--navy)] px-5 py-10 text-white sm:rounded-[2rem] sm:px-10 sm:py-14 lg:px-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="inline-flex rounded-full border border-white/30 px-4 py-1.5 text-[13px] text-white/85">Services</span>
            <h2 className="mt-6 max-w-lg text-balance text-3xl font-medium leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
              What we handle for importers
            </h2>
            <p className="mt-3 text-base text-white/70">One company for every part of your shipment.</p>
          </div>
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 rounded-full border border-white/40 py-2.5 pl-5 pr-4 text-sm font-medium transition-colors duration-200 hover:bg-white hover:text-[var(--navy)]"
          >
            View all services
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {services.map((s, idx) => (
            <motion.article
              key={s.href}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, delay: idx * 0.08, ease: EASE }}
            >
              <Link href={s.href} className="group relative isolate flex h-[26rem] flex-col justify-between overflow-hidden rounded-3xl p-4 sm:p-5">
                <Image
                  src={s.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 32vw, 100vw"
                  className="-z-10 object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,20,40,0.25)_0%,rgba(8,20,40,0.1)_35%,rgba(8,20,40,0.9)_100%)]" />

                <ul className="flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <li key={t} className="rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 text-[13px] font-medium backdrop-blur-md">
                      {t}
                    </li>
                  ))}
                </ul>

                <div>
                  <h3 className="text-2xl font-medium tracking-[-0.01em]">{s.title}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-white/80">{s.body}</p>
                  <span className="mt-5 flex items-center justify-between rounded-full border border-white/35 bg-white/10 px-5 py-3 text-sm font-medium backdrop-blur-md transition-colors duration-200 group-hover:bg-white group-hover:text-[var(--navy)]">
                    Learn more
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
