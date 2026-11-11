"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const steps = [
  { title: "Send the details", body: "Tell us what you are shipping, from where, and when you need it." },
  { title: "Get a written quote", body: "Freight, clearance and delivery priced line by line." },
  { title: "We ship and clear", body: "We book, prepare customs before arrival, and keep you updated." },
  { title: "Delivered", body: "Goods at your door, with proof of delivery and duty receipts." },
];

export function Process() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-[#f2f5f8] py-20 sm:py-28">
      <div className="mx-auto max-w-[1440px] px-6">
        <h2 className="max-w-3xl text-balance text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-[var(--navy)] sm:text-5xl lg:text-6xl">
          Four steps from request to delivery.
        </h2>

        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {steps.map((step, idx) => (
            <motion.li
              key={step.title}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: EASE }}
              className="relative lg:pr-10"
            >
              <div className="flex items-center">
                <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-2xl font-bold tabular-nums text-[var(--accent)]">
                  {idx + 1}
                </span>
                {idx < steps.length - 1 ? <span aria-hidden className="ml-4 hidden h-0.5 flex-1 bg-[var(--navy)]/20 lg:block" /> : null}
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-[-0.02em] text-[var(--navy)]">{step.title}</h3>
              <p className="mt-2 max-w-xs text-base leading-7 text-slate-600">{step.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
