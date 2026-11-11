"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Factory, HeartHandshake, Package, Pickaxe, Pill, ShoppingCart } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const industries = [
  { icon: Pickaxe, title: "Mining and heavy industry", body: "Oversize equipment, project cargo and long hauls to site." },
  { icon: ShoppingCart, title: "FMCG and retail", body: "Fast clearance and steady deliveries to distribution centres." },
  { icon: Factory, title: "Manufacturing", body: "Raw materials in and finished goods out, on schedule." },
  { icon: HeartHandshake, title: "NGOs and aid", body: "Donor-compliant paperwork and duty exemptions." },
  { icon: Pill, title: "Healthcare and pharma", body: "Time-critical shipments with strict documentation." },
  { icon: Package, title: "E-commerce", body: "Consolidated shipments and last-mile delivery." },
];

export function Industries() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-[var(--navy)] py-20 text-white sm:py-28">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <h2 className="text-balance text-4xl font-bold leading-[1.02] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            Built for companies that <span className="text-[var(--accent)]">import regularly.</span>
          </h2>
          <p className="max-w-lg text-lg leading-8 text-white/75">
            Different cargo brings different rules and permits. We plan each shipment around your industry.
          </p>
        </div>

        <ul className="mt-12 grid overflow-hidden rounded-2xl border border-white/15 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: (idx % 3) * 0.07, ease: EASE }}
                className="group -mb-px -mr-px border-b border-r border-white/15 p-7 transition-colors duration-300 hover:bg-[var(--accent)] hover:text-[var(--navy)] sm:p-9"
              >
                <Icon className="h-8 w-8 text-[var(--accent)] transition-colors duration-300 group-hover:text-[var(--navy)]" strokeWidth={1.75} />
                <h3 className="mt-6 text-xl font-bold tracking-[-0.01em] sm:text-2xl">{item.title}</h3>
                <p className="mt-2 text-base leading-7 text-white/75 transition-colors duration-300 group-hover:text-[var(--navy)]">{item.body}</p>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
