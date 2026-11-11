"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, FileCheck, Ship, Truck } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const quick = [
  { icon: Ship, title: "Freight forwarding", body: "Sea, air and road into Ghana", href: "/services/freight-forwarding" },
  { icon: FileCheck, title: "Customs clearance", body: "Tema and Takoradi", href: "/services/customs-clearance" },
  { icon: Truck, title: "Inland delivery", body: "Port to your warehouse", href: "/services/inland-transportation-hauls" },
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduceMotion ? false : ({ opacity: 0, y: 28 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section className="relative isolate flex min-h-[calc(100svh-5rem)] flex-col overflow-hidden bg-[var(--navy)] text-white lg:min-h-[820px]">
      <Image
        src="/hero/freight-dawn.webp"
        alt="Container ship berthed at a port terminal at dawn"
        fill
        priority
        sizes="100vw"
        quality={82}
        className="-z-10 object-cover object-[70%_center]"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(11,31,58,0.94)_0%,rgba(11,31,58,0.8)_42%,rgba(11,31,58,0.25)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent_55%,rgba(11,31,58,0.85)_100%)]" />

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center px-6 pb-14 pt-16 sm:pb-20 sm:pt-24">
        <motion.h1
          {...rise(0)}
          className="max-w-5xl text-balance text-[2.6rem] font-bold leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-[5.25rem]"
        >
          Your cargo into Ghana. <span className="text-[var(--accent)]">Cleared and delivered.</span>
        </motion.h1>
        <motion.p {...rise(0.1)} className="mt-6 max-w-xl text-lg leading-8 text-white/85 sm:text-xl">
          Freight forwarding, customs clearance and inland delivery for importing companies, handled by one team.
        </motion.p>
        <motion.div {...rise(0.2)} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href="/quote"
            className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-8 py-4 text-base font-bold text-[var(--navy)] transition-[background-color,transform] duration-200 hover:bg-white active:scale-[0.98]"
          >
            Get a quote
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/70 px-8 py-4 text-base font-bold text-white transition-[background-color,color,transform] duration-200 hover:bg-white hover:text-[var(--navy)] active:scale-[0.98]"
          >
            Our services
          </Link>
        </motion.div>
      </div>

      <motion.div {...rise(0.35)} className="mx-auto w-full max-w-[1440px] px-6">
        <ul className="grid overflow-hidden rounded-t-2xl bg-white text-[var(--navy)] sm:grid-cols-3">
          {quick.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href} className="border-b border-slate-200 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                <Link href={item.href} className="group flex items-center gap-4 px-6 py-5 transition-colors duration-200 hover:bg-[var(--accent)] sm:py-7">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--navy)] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-bold leading-tight tracking-[-0.01em]">{item.title}</span>
                    <span className="block text-sm text-slate-600 group-hover:text-[var(--navy)]">{item.body}</span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </section>
  );
}
