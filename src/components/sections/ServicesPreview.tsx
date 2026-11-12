"use client";

import { Container } from "@/components/design-system/Container";
import { CTAButton } from "@/components/design-system/CTAButton";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";
import { MOCK_SERVICES } from "@/lib/mock";
import { Package, Ship, FileCheck, Warehouse, Truck, Home, Anchor, ArrowRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Package, Ship, FileCheck, Warehouse, Truck, Home, Anchor
};

/* ────────── Featured Service Card (large, cinematic) ────────── */
function FeaturedServiceCard({ service, index }: { service: typeof MOCK_SERVICES[0]; index: number }) {
  const Icon = ICON_MAP[service.icon] || Package;

  return (
    <AnimateOnScroll animation="fade-up" delay={index * 120}>
      <Link href={`/services/${service.slug}`} className="group block">
        <div className={cn(
          "relative grid min-h-[240px] min-w-0 grid-cols-1 overflow-hidden rounded-2xl bg-[var(--navy)] lg:min-h-0 lg:max-h-[min(360px,52vh)] lg:grid-cols-2",
          "shadow-md shadow-[var(--navy)]/10 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-[var(--navy)]/18",
        )}>
          {/* Image Side */}
          <div className={cn(
            "relative min-h-[200px] min-w-0 overflow-hidden lg:min-h-full",
            index % 2 === 1 ? "lg:order-2" : "lg:order-1"
          )}>
            <Image
              src={service.image || "/services-hero.webp"}
              alt={service.name}
              fill
              className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[var(--navy)] via-[var(--navy)]/40 to-transparent opacity-60 lg:opacity-80" />
            
            {/* Service number watermark */}
            <div className="absolute left-5 top-4 lg:left-8 lg:top-6">
              <span className="font-display text-[2.75rem] font-bold leading-none text-white/[0.08] select-none sm:text-[3.25rem] lg:text-[3.5rem]">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Content Side */}
          <div className={cn(
            "relative flex flex-col justify-center p-6 md:p-8 lg:py-8 lg:pl-10 lg:pr-9",
            index % 2 === 1 ? "lg:order-1" : "lg:order-2"
          )}>
            {/* Background accent glow */}
            <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-[var(--accent)]/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10">
              {/* Icon badge */}
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/15 text-[var(--accent)] backdrop-blur-md transition-all duration-500 group-hover:rotate-[-3deg] group-hover:scale-105 group-hover:bg-[var(--accent)] group-hover:text-white">
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
              </div>

              {/* Service number */}
              <span className="text-[var(--accent)] text-[11px] font-bold tracking-[0.22em] uppercase mb-2 block">
                Service {String(index + 1).padStart(2, "0")}
              </span>

              {/* Title */}
              <h3 className="mb-2 font-display text-xl font-bold tracking-tight text-white md:text-2xl lg:text-[1.35rem] lg:leading-snug">
                {service.name}
              </h3>

              {/* Description */}
              <p className="mb-4 max-w-md text-sm leading-relaxed text-white/60 line-clamp-2 md:line-clamp-3 md:text-[15px]">
                {service.description}
              </p>

              {/* CTA */}
              <div className="group/cta inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                <span className="relative">
                  Learn more
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[var(--accent)] transition-all duration-500 group-hover:w-full" />
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--accent)]/30 transition-all duration-500 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)]">
                  <ArrowUpRight size={14} className="-translate-x-px translate-y-px transition-colors duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </AnimateOnScroll>
  );
}

/* ────────── Compact Service Card (smaller grid items) ────────── */
function CompactServiceCard({ service, index }: { service: typeof MOCK_SERVICES[0]; index: number }) {
  const Icon = ICON_MAP[service.icon] || Package;

  return (
    <AnimateOnScroll animation="fade-up" delay={index * 100}>
      <Link href={`/services/${service.slug}`} className="group block h-full">
        <div className="relative h-full rounded-[1.75rem] overflow-hidden bg-white border border-slate-200/80 hover:border-[var(--accent)]/30 hover:shadow-2xl hover:shadow-slate-900/8 transition-all duration-600">
          {/* Image area */}
          <div className="relative h-52 overflow-hidden">
            <Image
              src={service.image || "/services-hero.webp"}
              alt={service.name}
              fill
              className="object-cover transition-transform duration-[1s] ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90" />
            
            {/* Floating icon */}
            <div className="absolute bottom-4 left-6 w-12 h-12 rounded-xl bg-white shadow-lg shadow-slate-900/10 flex items-center justify-center text-[var(--accent)] border border-slate-100 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500">
              <Icon size={22} strokeWidth={1.5} />
            </div>

            {/* Number */}
            <div className="absolute top-4 right-5">
              <span className="text-sm font-display font-bold text-white/80 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 pt-5">
            <h3 className="font-display font-bold text-xl text-[var(--ink)] mb-2.5 group-hover:text-[var(--accent)] transition-colors duration-300 leading-tight">
              {service.name}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
              {service.description}
            </p>
            
            <div className="flex items-center gap-2 text-[var(--accent)] text-xs font-bold uppercase tracking-[0.15em] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
              Explore
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </Link>
    </AnimateOnScroll>
  );
}

/* ────────── Main Section ────────── */
export function ServicesPreview() {
  const featuredServices = MOCK_SERVICES.slice(0, 3);
  const moreServices = MOCK_SERVICES.slice(3, 6);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-[var(--surface-warm)]">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-gradient-to-tr from-[var(--accent)]/8 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-gradient-to-tr from-[var(--navy)]/6 to-transparent rounded-full blur-[120px] pointer-events-none" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 hero-grid opacity-[0.015]" aria-hidden />

      <Container size="wide" className="relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 md:mb-16">
          <AnimateOnScroll animation="fade-up" className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span className="w-10 h-0.5 bg-[var(--accent)] rounded-full" />
              <span className="text-xs font-bold tracking-[0.18em] text-[var(--navy-light)] uppercase">
                Core Capabilities
              </span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-[2.65rem] text-[var(--ink)] tracking-tight leading-[1.08]">
              End-to-end logistics <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--navy-light)] to-[var(--accent)]">
                solutions for serious shippers.
              </span>
            </h2>
          </AnimateOnScroll>
          
          <AnimateOnScroll animation="fade-up" delay={100} className="w-full shrink-0 pb-2 sm:w-auto">
            <CTAButton 
              href="/services" 
              variant="outline" 
              className="group w-full justify-center !rounded-full border-2 border-[var(--ink)] px-8 py-3.5 text-[var(--ink)] transition-all duration-300 hover:bg-[var(--ink)] hover:text-white sm:w-auto"
            >
              View All Services
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </CTAButton>
          </AnimateOnScroll>
        </div>

        {/* Featured Services (large cinematic cards) */}
        <div className="space-y-6 md:space-y-8 mb-12 md:mb-16">
          {featuredServices.map((service, i) => (
            <FeaturedServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>

        {/* More Services (compact grid) */}
        <AnimateOnScroll animation="fade-up">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
            <span className="text-xs font-bold tracking-[0.25em] text-slate-400 uppercase">More Services</span>
            <div className="h-px flex-1 bg-gradient-to-l from-slate-200 to-transparent" />
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {moreServices.map((service, i) => (
            <CompactServiceCard key={service.id} service={service} index={i + 3} />
          ))}
        </div>
      </Container>
    </section>
  );
}