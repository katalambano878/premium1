"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Ship } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const proofs = [
  { k: "On the file", v: "A named operator" },
  { k: "In the quote", v: "Written assumptions" },
  { k: "Reach us on", v: "WhatsApp, email, phone" },
];

export function Invitation() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate bg-paper-soft py-20 sm:py-28">
      <div className="mx-auto max-w-[1440px] px-6">
        <motion.figure
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative h-[30rem] overflow-hidden rounded-[2rem] sm:h-[34rem] lg:h-[38rem]"
        >
          <Image
            src="/contact-office.webp"
            alt="The Premium 1 office in Airport Residential, Accra"
            fill
            sizes="(min-width: 1440px) 1392px, 100vw"
            className="object-cover object-[center_35%]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,31,58,0.05)_0%,rgba(11,31,58,0.1)_45%,rgba(11,31,58,0.88)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(11,31,58,0.4)_0%,rgba(11,31,58,0.06)_55%,transparent_75%)]" />

          <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
            <h2 className="max-w-4xl font-editorial text-balance text-[2.4rem] leading-[1.02] text-white sm:text-[3.4rem] lg:text-[4.4rem]">
              One file. One operator.{" "}
              <span className="italic text-[#b8f3ec]">A quote you can defend.</span>
            </h2>
            <p className="mt-5 font-editorial text-base italic text-white/85 sm:text-lg">The Accra desk · still answering the file</p>
          </figcaption>
        </motion.figure>

        <div className="mt-10 grid items-end gap-8 lg:mt-12 lg:grid-cols-[1fr_auto] lg:gap-16">
          <p className="max-w-2xl text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">
            Tell us the lane, the cargo, and the date that cannot slip. We answer with assumptions, a named owner, and the next milestone — not a rate sheet with the risk left out.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-4">
            <Link
              href="/quote"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-7 py-3.5 text-base font-semibold text-white shadow-[0_14px_30px_-14px_rgba(11,31,58,0.55)] transition-[background-color,color,transform] duration-200 hover:bg-[var(--accent)] hover:text-[var(--navy)] active:scale-[0.98]"
            >
              <Ship className="h-4 w-4" />
              Get a quote
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-ink ring-line transition-[background-color,transform] duration-200 hover:bg-paper-mist active:scale-[0.98]"
            >
              Track a shipment
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-x-10 gap-y-6 border-t border-line pt-7 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          {proofs.map((item) => (
            <div key={item.k}>
              <p className="text-sm text-ink-muted">{item.k}</p>
              <p className="mt-1 font-editorial text-xl text-ink sm:text-2xl">{item.v}</p>
            </div>
          ))}
          <Link href="/contact" className="group inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-[var(--accent-ink)] sm:col-span-3 lg:col-span-1">
            <span className="border-b border-[var(--navy)] pb-0.5 transition-colors group-hover:border-[var(--accent-ink)]">Or ask the desk a real question</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <p className="mt-14 text-center font-editorial text-xs italic text-ink-muted">
          End of the field edition · Premium 1 Logistics · Accra
        </p>
      </div>
    </section>
  );
}
