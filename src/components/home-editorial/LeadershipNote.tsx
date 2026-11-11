"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { TEAM_LEADERS } from "@/lib/richContent";

const EASE = [0.22, 1, 0.36, 1] as const;

export function LeadershipNote() {
  const reduceMotion = useReducedMotion();
  const lead = TEAM_LEADERS[0];

  return (
    <section id="from-the-desk" className="relative isolate overflow-hidden bg-[var(--navy)] py-24 text-white sm:py-32">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div className="flex flex-col">
            <motion.figure
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <blockquote className="font-editorial text-balance text-[2.1rem] italic leading-[1.08] text-white sm:text-[2.9rem] lg:text-[3.5rem] xl:text-[4rem]">
                “A shipment is finished when the{" "}
                <span className="text-[#b8f3ec]">proof of delivery is in the file,</span> not when the vessel sails.”
              </blockquote>
              <figcaption className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-editorial text-xl text-white sm:text-2xl">{lead.name}</span>
                <span className="text-sm text-white/70">{lead.role}, Accra</span>
              </figcaption>
            </motion.figure>

            <div className="mt-16 lg:mt-auto lg:pt-20">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="font-editorial text-2xl text-white sm:text-3xl">The leadership desk</h2>
                <Link href="/about" className="group inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#b8f3ec]">
                  <span className="border-b border-white/40 pb-0.5 transition-colors group-hover:border-[#b8f3ec]">Read the full profiles</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>

              <ul className="mt-6 border-t border-white/15">
                {TEAM_LEADERS.map((person, idx) => (
                  <motion.li
                    key={person.name}
                    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.55, delay: idx * 0.08, ease: EASE }}
                    className="grid gap-x-8 gap-y-2 border-b border-white/15 py-5 sm:grid-cols-[minmax(0,15rem)_1fr]"
                  >
                    <div>
                      <p className="font-editorial text-xl leading-snug text-white">{person.name}</p>
                      <p className="mt-1 text-[13px] text-[#b8f3ec]">{person.role}</p>
                    </div>
                    <p className="max-w-xl text-sm leading-6 text-white/75">{person.bio}</p>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          <motion.div
            initial={reduceMotion ? false : { clipPath: "inset(12% 0% 0% 0% round 1.75rem)", opacity: 0.4 }}
            whileInView={{ clipPath: "inset(0% 0% 0% 0% round 1.75rem)", opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.1, ease: EASE }}
            className="relative order-first aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] lg:order-none lg:aspect-auto lg:min-h-[640px]"
          >
            <Image
              src="/hero/leadership-team.jpg"
              alt="The Premium 1 leadership team at the Accra office"
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover object-[center_18%]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
