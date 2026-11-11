"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const industries = [
  { title: "Mining and heavy industry", body: "Oversize equipment, project cargo and long hauls to site." },
  { title: "FMCG and retail", body: "Fast clearance and steady deliveries to your distribution centres." },
  { title: "Manufacturing", body: "Raw materials in and finished goods out, on a schedule you can plan around." },
  { title: "NGOs and aid programmes", body: "Donor-compliant paperwork and duty exemptions handled correctly." },
  { title: "Healthcare and pharma", body: "Time-critical shipments with strict documentation and handling." },
  { title: "E-commerce", body: "Consolidated shipments, last-mile delivery and returns." },
];

export function Industries() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative bg-paper-mist py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-editorial text-balance text-4xl leading-[1.02] text-ink sm:text-5xl lg:text-[3.6rem]">
            Built for companies that{" "}
            <span className="italic text-[var(--accent-ink)]">import regularly.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-ink-muted sm:text-lg">
            Different cargo brings different rules, permits and risks. We plan each shipment around what your industry needs.
          </p>
          <Link href="/quote" className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-[var(--accent-ink)]">
            <span className="border-b border-[var(--navy)] pb-0.5 transition-colors group-hover:border-[var(--accent-ink)]">Tell us what you import</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <ul className="grid border-t border-[var(--navy)] sm:grid-cols-2 sm:gap-x-12">
          {industries.map((item, idx) => (
            <motion.li
              key={item.title}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: (idx % 2) * 0.08, ease: EASE }}
              className="border-b border-line py-7"
            >
              <h3 className="font-editorial text-2xl leading-tight text-ink sm:text-[1.75rem]">{item.title}</h3>
              <p className="mt-2 max-w-sm text-base leading-7 text-ink-muted">{item.body}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
