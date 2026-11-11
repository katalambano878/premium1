"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const nav = [
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "How we work", href: "/how-we-operate" },
  { label: "Coverage", href: "/coverage" },
  { label: "Guides", href: "/insights" },
  { label: "Track", href: "/track" },
  { label: "Contact", href: "/contact" },
];

const modes = [
  { label: "Sea", href: "/services/freight-forwarding" },
  { label: "Air", href: "/services/freight-forwarding" },
  { label: "Road", href: "/services/inland-transportation-hauls" },
  { label: "Customs", href: "/services/customs-clearance" },
];

const cards = [
  { title: "Sea freight", sub: "Full and part containers", meta: "Tema · Takoradi", image: "/service-freight.webp", href: "/services/freight-forwarding" },
  { title: "Customs clearance", sub: "Permits and duty estimates", meta: "Ready before arrival", image: "/hero/customs-gate.webp", href: "/services/customs-clearance" },
  { title: "Inland delivery", sub: "Port to your warehouse", meta: "Across Ghana", image: "/hero-slide-1.webp", href: "/services/inland-transportation-hauls" },
  { title: "Air freight", sub: "Time-critical cargo", meta: "Through Accra", image: "/hero-slide-2.webp", href: "/services/freight-forwarding" },
  { title: "Door to door", sub: "Supplier to your door", meta: "One quote", image: "/hero/ship-agency.webp", href: "/services/door-to-door-delivery" },
  { title: "Warehousing", sub: "Storage and distribution", meta: "Short or long term", image: "/hero/freight-dawn.webp", href: "/services/warehousing-distribution" },
];

const slides = [
  {
    src: "/services-hero.webp",
    alt: "Trucks carrying containers through a port terminal at sunrise",
    position: "object-[60%_center]",
    headline: ["Freight into Ghana,", "handled end to end"],
    sub: "Reliable freight, customs clearance and delivery for importing companies.",
    cta: { label: "Get a quote", href: "/quote" },
  },
  {
    src: "/hero-slide-2.webp",
    alt: "Container ship alongside the quay at sunset",
    position: "object-[65%_center]",
    headline: ["Sea and air freight,", "booked and tracked"],
    sub: "We book the carrier, manage the documents and track your cargo.",
    cta: { label: "Plan a shipment", href: "/services/freight-forwarding" },
  },
  {
    src: "/hero-slide-1.webp",
    alt: "Container yard with a truck leaving the terminal",
    position: "object-center",
    headline: ["Customs cleared,", "delivered to your door"],
    sub: "Duty estimates ready before arrival, then trucked to your warehouse.",
    cta: { label: "Start a clearance", href: "/services/customs-clearance" },
  },
];

const SLIDE_MS = 7000;

export function Hero() {
  const reduceMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const scroller = useRef<HTMLUListElement>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setTimeout(() => setSlideIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [slideIndex, reduceMotion]);

  const active = slides[slideIndex];

  const slide = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 316, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const fade = (delay: number) => ({
    initial: reduceMotion ? false : ({ opacity: 0 } as const),
    animate: { opacity: 1 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  const rise = (delay: number) => ({
    initial: reduceMotion ? false : ({ opacity: 0, y: 24 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section className="px-3 pt-3 sm:px-5 sm:pt-5">
      <div className="relative isolate mx-auto flex min-h-[max(calc(100svh-1.5rem),36rem)] max-w-[1480px] flex-col overflow-hidden rounded-[1.75rem] bg-[var(--navy)] text-white sm:min-h-[46rem] sm:rounded-[2rem] lg:min-h-[clamp(44rem,calc(100svh-2.5rem),62rem)]">
        {slides.map((img, i) => (
          <div
            key={img.src}
            aria-hidden={i !== slideIndex}
            className={`absolute inset-0 -z-10 transition-opacity duration-[1400ms] ease-out ${i === slideIndex ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={img.src}
              alt={i === slideIndex ? img.alt : ""}
              fill
              priority={i === 0}
              sizes="100vw"
              quality={85}
              className={`object-cover ${img.position} transition-transform duration-[7000ms] ease-linear ${
                i === slideIndex && !reduceMotion ? "scale-105" : "scale-100"
              }`}
            />
          </div>
        ))}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,20,40,0.72)_0%,rgba(8,20,40,0.3)_50%,rgba(8,20,40,0.08)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,20,40,0.45)_0%,transparent_26%,transparent_60%,rgba(8,20,40,0.5)_100%)]" />

        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,20,40,0.35)_0%,rgba(8,20,40,0.05)_30%,rgba(8,20,40,0.55)_55%,rgba(8,20,40,0.92)_100%)] sm:hidden" />

        <header className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-7">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative inline-flex h-11 w-11 overflow-hidden rounded-full bg-[var(--navy)]">
              <Image src="/premium1-logo-tight.webp" alt="" width={88} height={88} className="h-11 w-11 object-cover" priority />
            </span>
            <span className="whitespace-nowrap leading-tight">
              <span className="block text-lg font-semibold tracking-[-0.01em]">Premium 1</span>
              <span className="block text-[11px] tracking-[0.16em] text-white/80">LOGISTICS</span>
            </span>
          </Link>

          <nav className="hidden items-center rounded-full border border-white/20 bg-white/15 px-2 py-1.5 backdrop-blur-md xl:flex">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-white/95 transition-colors duration-200 hover:bg-white/20"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/quote"
              className="group hidden items-center gap-2 whitespace-nowrap rounded-full bg-white py-2.5 pl-5 pr-4 text-sm font-medium text-[var(--navy)] transition-[background-color,transform] duration-200 hover:bg-[var(--accent)] active:scale-[0.97] sm:inline-flex"
            >
              Get a quote
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/15 backdrop-blur-md xl:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-end gap-10 px-5 pb-7 pt-12 sm:justify-between sm:px-8 sm:pb-8 sm:pt-16 lg:pt-20 [@media(min-height:860px)]:lg:pt-28">
          <motion.div {...rise(0)}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`copy-${slideIndex}`}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <h1 className="max-w-[22ch] text-balance text-[clamp(1.85rem,7.4vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.025em] sm:text-[clamp(2.5rem,4.6vw,3.5rem)]">
                  {active.headline[0]}
                  <br className="hidden sm:block" /> {active.headline[1]}
                </h1>
                <p className="mt-4 max-w-[36ch] text-pretty text-base leading-[1.55] text-white/90 sm:mt-5 sm:text-lg sm:leading-7">{active.sub}</p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4 sm:mt-8">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`cta-${slideIndex}`}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="w-full sm:w-auto"
                >
                  <Link
                    href={active.cta.href}
                    className="group inline-flex w-full items-center justify-between gap-3 rounded-full bg-white py-4 pl-7 pr-6 text-base font-medium text-[var(--navy)] transition-[background-color,transform] duration-200 hover:bg-[var(--accent)] active:scale-[0.97] sm:w-auto sm:justify-start sm:py-3.5 sm:pr-5"
                  >
                    {active.cta.label}
                    <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </motion.div>
              </AnimatePresence>
              <div className="flex w-full items-center justify-center gap-2 sm:w-auto sm:justify-start" role="group" aria-label="Hero slides">
                {slides.map((img, i) => (
                  <button
                    key={img.src}
                    type="button"
                    aria-label={`Show slide ${i + 1} of ${slides.length}: ${img.headline.join(" ")}`}
                    aria-current={i === slideIndex ? "true" : undefined}
                    onClick={() => setSlideIndex(i)}
                    className="group/dot flex h-8 items-center"
                  >
                    <span
                      className={`block h-1 rounded-full transition-[width,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        i === slideIndex ? "w-10 bg-white" : "w-5 bg-white/45 group-hover/dot:bg-white/80"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div {...fade(0.3)} className="hidden flex-col gap-5 sm:flex">
            <ul className="flex flex-wrap gap-2">
              {modes.map((m) => (
                <li key={m.label}>
                  <Link
                    href={m.href}
                    className="inline-flex rounded-full border border-white/40 bg-white/10 px-5 py-2 text-sm font-medium backdrop-blur-md transition-colors duration-200 hover:bg-white hover:text-[var(--navy)]"
                  >
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="-mx-5 sm:-mx-8 lg:absolute lg:bottom-8 lg:right-8 lg:mx-0 lg:w-[19.5rem] xl:w-[39.5rem]">
              <ul
                ref={scroller}
                className="grid snap-x snap-mandatory auto-cols-[18.75rem] grid-flow-col grid-rows-1 gap-3 overflow-x-auto px-5 [scrollbar-width:none] sm:px-8 lg:grid-rows-2 lg:px-0 [&::-webkit-scrollbar]:hidden"
              >
                {cards.map((c) => (
                  <li key={c.title} className="snap-start">
                    <Link
                      href={c.href}
                      className="flex items-center gap-4 rounded-2xl border border-white/25 bg-white/15 p-2.5 backdrop-blur-xl transition-colors duration-200 hover:bg-white/25"
                    >
                      <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                        <Image src={c.image} alt="" fill sizes="96px" className="object-cover" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-base font-medium leading-tight">{c.title}</span>
                        <span className="mt-0.5 block text-[13px] text-white/75">{c.sub}</span>
                        <span className="mt-3 block text-sm font-medium">{c.meta}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 hidden justify-end gap-2 lg:flex">
                <button
                  type="button"
                  aria-label="Previous services"
                  onClick={() => slide(-1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--navy)] transition-[background-color,transform] duration-200 hover:bg-[var(--accent)] active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="More services"
                  onClick={() => slide(1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--navy)] transition-[background-color,transform] duration-200 hover:bg-[var(--accent)] active:scale-95"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-[70] flex flex-col bg-[var(--navy)] px-6 pb-8 pt-6 text-white xl:hidden">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Premium 1 Logistics</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-8 flex flex-col">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-white/15 py-4 text-2xl font-medium tracking-[-0.02em]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/quote"
            onClick={() => setMenuOpen(false)}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-white py-4 text-base font-medium text-[var(--navy)]"
          >
            Get a quote
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}
