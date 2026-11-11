"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

const EASE = [0.22, 1, 0.36, 1] as const;

const commitments = [
  { title: "Every cost listed", body: "Freight, duties, port charges and our fee, line by line." },
  { title: "Assumptions in writing", body: "Each figure states what it depends on." },
  { title: "One named contact", body: "The same person from quote to delivery." },
  { title: "Updates at every stage", body: "Booking, departure, arrival, clearance, delivery." },
];

export function Commitments() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 lg:grid-cols-2 lg:items-center lg:gap-20">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-[5/6]">
            <Image
              src="/hero/operations-desk.jpg"
              alt="A coordinator reviewing a shipment on screen"
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 right-4 rounded-2xl bg-[var(--accent)] px-7 py-6 text-[var(--navy)] sm:right-8 sm:px-9 sm:py-7">
            <p className="text-5xl font-bold leading-none tracking-[-0.04em] sm:text-6xl">{siteConfig.responseSlaHours}h</p>
            <p className="mt-2 max-w-[11rem] text-sm font-bold leading-5">to reply to your quote request</p>
          </div>
        </motion.div>

        <div className="pt-6 lg:pt-0">
          <h2 className="text-balance text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-[var(--navy)] sm:text-5xl lg:text-6xl">
            What you get with every quote.
          </h2>
          <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {commitments.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-[var(--accent)]">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <span>
                  <span className="block text-xl font-bold tracking-[-0.01em] text-[var(--navy)]">{item.title}</span>
                  <span className="mt-1 block text-base leading-7 text-slate-600">{item.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
