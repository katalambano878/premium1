"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

const EASE = [0.22, 1, 0.36, 1] as const;

const needs = [
  { title: "What you are shipping", body: "The goods, and roughly how much: weight, volume or number of containers." },
  { title: "Where from and where to", body: "The supplier's city or port, and the delivery address in Ghana or beyond." },
  { title: "When you need it", body: "The date the goods must arrive, or when they will be ready to collect." },
];

export function ClosingQuote() {
  const reduceMotion = useReducedMotion();
  const tel = `tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`;

  return (
    <section className="relative bg-paper px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-[1392px] gap-14 rounded-[2rem] bg-[var(--navy)] px-6 py-14 text-white sm:px-12 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:px-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <h2 className="font-editorial text-balance text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.5rem]">
            Tell us what you are shipping.{" "}
            <span className="italic text-[#b8f3ec]">Get a written quote.</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
            Send the details through the quote form and we reply within {siteConfig.responseSlaHours} hours, with every cost listed and a named contact for your shipment.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Link
              href="/quote"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 py-4 text-base font-semibold text-[var(--navy)] transition-[background-color,transform] duration-200 hover:bg-white active:scale-[0.98] sm:w-auto"
            >
              Get a quote
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <a
              href={`https://wa.me/${siteConfig.whatsappE164}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-8 py-4 text-base font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-white/10 active:scale-[0.98] sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp us
            </a>
          </div>

          <a href={tel} className="group mt-8 inline-flex items-center gap-3 text-white/80 transition-colors hover:text-[#b8f3ec]">
            <Phone className="h-4 w-4" />
            <span className="text-base">
              Or call <span className="font-semibold tabular-nums text-white group-hover:text-[#b8f3ec]">{siteConfig.phone}</span>
            </span>
          </a>
        </motion.div>

        <div className="lg:pt-3">
          <h3 className="font-editorial text-2xl text-white sm:text-3xl">Three things to have ready</h3>
          <ol className="mt-6 border-t border-white/20">
            {needs.map((item, idx) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: EASE }}
                className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-white/20 py-6"
              >
                <span className="font-editorial text-2xl italic text-[#b8f3ec]">{idx + 1}</span>
                <span>
                  <span className="block font-editorial text-xl leading-snug text-white sm:text-2xl">{item.title}</span>
                  <span className="mt-1 block text-base leading-7 text-white/75">{item.body}</span>
                </span>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
