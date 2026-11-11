"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

const needs = [
  { title: "What you are shipping", body: "The goods and roughly how much." },
  { title: "Where from and where to", body: "Supplier's port and delivery address." },
  { title: "When you need it", body: "Your required delivery date." },
];

export function Closing() {
  return (
    <section className="px-3 pb-6 pt-6 sm:px-5">
      <div className="relative isolate mx-auto grid max-w-[1480px] gap-10 overflow-hidden rounded-[1.75rem] bg-[var(--navy)] px-5 py-12 text-white sm:rounded-[2rem] sm:px-10 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16 lg:px-14 lg:py-20">
        <Image src="/hero/freight-dawn.webp" alt="" fill sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,20,40,0.88)_0%,rgba(8,20,40,0.6)_60%,rgba(8,20,40,0.45)_100%)]" />

        <div>
          <h2 className="max-w-2xl text-balance text-[2.4rem] font-medium leading-[1.05] tracking-[-0.03em] sm:text-6xl">
            Tell us what you are shipping
          </h2>
          <p className="mt-5 max-w-md text-lg leading-7 text-white/85">
            We reply within {siteConfig.responseSlaHours} hours with a written quote and a named contact.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="group inline-flex items-center gap-3 rounded-full bg-white py-3.5 pl-7 pr-5 text-base font-medium text-[var(--navy)] transition-[background-color,transform] duration-200 hover:bg-[var(--accent)] active:scale-[0.97]"
            >
              Get a quote
              <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <a
              href={`https://wa.me/${siteConfig.whatsappE164}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-base font-medium backdrop-blur-md transition-colors duration-200 hover:bg-white hover:text-[var(--navy)]"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-white/25 bg-white/15 p-6 backdrop-blur-xl sm:p-8">
          <p className="text-lg font-medium">Have these ready</p>
          <ol className="mt-5 space-y-5">
            {needs.map((item, idx) => (
              <li key={item.title} className="flex gap-4">
                <span className="text-base tabular-nums text-white/60">0{idx + 1}</span>
                <span>
                  <span className="block text-base font-medium">{item.title}</span>
                  <span className="block text-sm leading-6 text-white/75">{item.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
