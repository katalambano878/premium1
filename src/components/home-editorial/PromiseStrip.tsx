"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

const EASE = [0.22, 1, 0.36, 1] as const;

export function PromiseStrip() {
  const reduceMotion = useReducedMotion();
  const tel = `tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`;

  const channels = [
    { label: "WhatsApp", value: "Message the desk", href: `https://wa.me/${siteConfig.whatsappE164}` },
    { label: "Email", value: siteConfig.operationsEmail, href: `mailto:${siteConfig.operationsEmail}` },
    { label: "Office", value: siteConfig.addressLine, href: "/contact" },
  ];

  return (
    <section className="relative bg-[var(--accent)] py-20 text-[var(--navy)] sm:py-28">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <motion.blockquote
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="max-w-3xl font-editorial text-balance text-[1.7rem] leading-[1.18] sm:text-4xl lg:text-[2.6rem]"
          >
            We don&apos;t want to be the loudest forwarder in the room. We want to be the one that{" "}
            <span className="italic">picks up the phone</span> — and tells you where the cargo is, by file.
          </motion.blockquote>
          <p className="text-sm font-medium text-[var(--navy)]/80 lg:pb-2 lg:text-right">
            Operating charter, Accra
            <br />
            Replies within {siteConfig.responseSlaHours} hours
          </p>
        </div>

        <motion.a
          href={tel}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          aria-label={`Call the desk on ${siteConfig.phone}`}
          className="group mt-12 flex items-end justify-between gap-6 border-t border-[var(--navy)]/30 pt-8 sm:mt-16 sm:pt-10"
        >
          <span className="whitespace-nowrap font-editorial text-[clamp(2.3rem,10.4vw,10rem)] leading-[0.9] tracking-tight tabular-nums">
            {siteConfig.phone}
          </span>
          <span className="mb-2 hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:translate-x-1 group-active:scale-95 xl:inline-flex">
            <ArrowUpRight className="h-7 w-7" />
          </span>
        </motion.a>

        <ul className="mt-10 grid gap-x-12 border-t border-[var(--navy)]/30 sm:mt-14 sm:grid-cols-3">
          {channels.map((c) => (
            <li key={c.label} className="border-b border-[var(--navy)]/30 sm:border-b-0">
              <a
                href={c.href}
                target={c.href.startsWith("https") ? "_blank" : undefined}
                rel={c.href.startsWith("https") ? "noopener noreferrer" : undefined}
                className="group flex items-start justify-between gap-4 py-5 sm:pt-6"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[var(--navy)]/80">{c.label}</span>
                  <span className="mt-1 block break-words font-editorial text-xl leading-snug sm:text-2xl">{c.value}</span>
                </span>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
