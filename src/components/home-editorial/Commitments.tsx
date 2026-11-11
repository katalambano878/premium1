"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { siteConfig } from "@/lib/siteConfig";

const EASE = [0.22, 1, 0.36, 1] as const;

const commitments = [
  {
    title: "Every cost listed",
    body: "Freight, duties, port charges and our fee are shown line by line, so nothing appears on the invoice that was not in the quote.",
  },
  {
    title: "Assumptions in writing",
    body: "Each figure states what it depends on. If something changes, you see why before the price does.",
  },
  {
    title: "One named contact",
    body: "The person who prepares your quote stays with your shipment until it is delivered.",
  },
  {
    title: "Updates at every stage",
    body: "You hear from us at booking, departure, arrival, clearance and delivery, without having to chase.",
  },
];

export function Commitments() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative bg-paper py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 lg:grid-cols-2 lg:gap-20">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] lg:aspect-auto lg:min-h-[620px]"
        >
          <Image
            src="/hero/operations-desk.jpg"
            alt="A coordinator reviewing a shipment on screen"
            fill
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="object-cover"
          />
        </motion.div>

        <div className="flex flex-col justify-center">
          <h2 className="font-editorial text-balance text-4xl leading-[1.02] text-ink sm:text-5xl lg:text-[3.6rem]">
            What you get with{" "}
            <span className="italic text-[var(--accent-ink)]">every quote.</span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-ink-muted sm:text-lg">
            We reply to quote requests within {siteConfig.responseSlaHours} hours. Whatever the size of the shipment, the quote comes with these four things.
          </p>

          <dl className="mt-10 border-t border-[var(--navy)]">
            {commitments.map((item) => (
              <div key={item.title} className="grid gap-x-10 gap-y-1 border-b border-line py-6 sm:grid-cols-[14rem_1fr]">
                <dt className="font-editorial text-2xl leading-tight text-ink">{item.title}</dt>
                <dd className="text-base leading-7 text-ink-muted">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
