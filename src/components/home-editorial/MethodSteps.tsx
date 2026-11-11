"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ClipboardCheck, FileSearch, Ship, Truck } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Send us the details",
    description: "Tell us what you are shipping, where it is coming from, and when you need it. The quote form takes a few minutes.",
    icon: FileSearch,
    tone: "bg-paper-soft",
  },
  {
    step: "02",
    title: "Get a written quote",
    description: "Freight, clearance and delivery are priced line by line, with the assumptions behind each figure stated.",
    icon: ClipboardCheck,
    tone: "bg-paper-butter",
  },
  {
    step: "03",
    title: "We ship and clear",
    description: "We book the carrier, prepare the customs entry before arrival, and update you at every stage.",
    icon: Ship,
    tone: "bg-paper-sage",
  },
  {
    step: "04",
    title: "Delivered, with paperwork",
    description: "Your goods arrive at your warehouse or site, with proof of delivery and duty receipts for your records.",
    icon: Truck,
    tone: "bg-paper-mist",
  },
];

export function MethodSteps() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_1fr]">
          <h2 className="font-editorial text-balance text-4xl leading-[1.02] text-ink sm:text-5xl lg:text-[3.6rem]">
            From your request to delivery,{" "}
            <span className="italic text-[var(--accent-ink)]">in four steps.</span>
          </h2>
          <p className="max-w-xl text-base leading-7 text-ink-muted sm:text-lg">
            You deal with the same contact at every step, and you always know what happens next.
          </p>
        </div>

        <ol className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={step.step}
                initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative flex flex-col rounded-2xl ${step.tone} p-7 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(11,31,58,0.28)]`}
              >
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink ring-line transition-colors group-hover:bg-[var(--navy)] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-editorial text-[5rem] leading-none text-[var(--navy)]/15 transition-colors group-hover:text-[var(--accent-ink)]/60">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-6 font-editorial text-2xl text-ink sm:text-3xl">{step.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-ink-muted">{step.description}</p>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
