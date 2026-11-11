"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

const EASE = [0.22, 1, 0.36, 1] as const;

const needs = [
  { title: "What you are shipping", body: "The goods and roughly how much." },
  { title: "Where from and where to", body: "Supplier's port and delivery address." },
  { title: "When you need it", body: "Your required delivery date." },
];

export function Closing() {
  const reduceMotion = useReducedMotion();
  const tel = `tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`;

  return (
    <section className="relative isolate overflow-hidden bg-[var(--navy)] py-20 text-white sm:py-28">
      <Image src="/hero/ship-agency.webp" alt="" fill sizes="100vw" className="-z-10 object-cover" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(11,31,58,0.96)_0%,rgba(11,31,58,0.88)_55%,rgba(11,31,58,0.7)_100%)]" />

      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-20">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <h2 className="text-balance text-[2.6rem] font-bold leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
            Ready to ship? <span className="text-[var(--accent)]">Get your quote.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/85">
            We reply within {siteConfig.responseSlaHours} hours with every cost listed and a named contact for your shipment.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/quote"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-8 py-4 text-base font-bold text-[var(--navy)] transition-[background-color,transform] duration-200 hover:bg-white active:scale-[0.98]"
            >
              Get a quote
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <a
              href={`https://wa.me/${siteConfig.whatsappE164}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/70 px-8 py-4 text-base font-bold text-white transition-[background-color,color,transform] duration-200 hover:bg-white hover:text-[var(--navy)] active:scale-[0.98]"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp us
            </a>
          </div>
          <a href={tel} className="mt-7 inline-flex items-center gap-3 text-base text-white/85 transition-colors hover:text-[var(--accent)]">
            <Phone className="h-4 w-4" />
            <span>
              Or call <span className="font-bold tabular-nums">{siteConfig.phone}</span>
            </span>
          </a>
        </motion.div>

        <div className="rounded-2xl bg-white p-7 text-[var(--navy)] sm:p-10">
          <h3 className="text-2xl font-bold tracking-[-0.02em]">Have these three things ready</h3>
          <ol className="mt-6 space-y-6">
            {needs.map((item, idx) => (
              <li key={item.title} className="flex gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-base font-bold tabular-nums text-[var(--accent)]">
                  {idx + 1}
                </span>
                <span>
                  <span className="block text-lg font-bold leading-snug">{item.title}</span>
                  <span className="block text-base leading-7 text-slate-600">{item.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
