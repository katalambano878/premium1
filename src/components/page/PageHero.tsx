import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  crumbs?: Crumb[];
  variant?: "dark" | "light";
  className?: string;
  backgroundImage?: string;
}

/** Inner-page hero: a rounded panel on the grey page, matching the homepage hero. */
export function PageHero({ eyebrow, title, description, crumbs, variant = "dark", className, backgroundImage }: PageHeroProps) {
  const isDark = variant === "dark" || !!backgroundImage;

  return (
    <div className={cn("px-3 sm:px-5", className)}>
      <div
        className={cn(
          "relative isolate mx-auto flex max-w-[1480px] flex-col justify-end overflow-hidden rounded-[1.75rem] px-5 pb-8 pt-8 sm:rounded-[2rem] sm:px-8 sm:pb-12 sm:pt-10 lg:px-12 lg:pb-14",
          backgroundImage ? "min-h-[22rem] sm:min-h-[26rem] lg:min-h-[30rem]" : "min-h-[18rem] sm:min-h-[20rem]",
          isDark ? "bg-[var(--navy)] text-white" : "border border-slate-200 bg-white text-[var(--navy)]",
        )}
      >
        {backgroundImage ? (
          <>
            <Image src={backgroundImage} alt="" fill priority sizes="100vw" quality={82} className="-z-10 object-cover" />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,20,40,0.82)_0%,rgba(8,20,40,0.5)_55%,rgba(8,20,40,0.2)_100%)]" aria-hidden />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,20,40,0.25)_0%,transparent_40%,rgba(8,20,40,0.55)_100%)]" aria-hidden />
          </>
        ) : null}

        {crumbs && crumbs.length > 0 ? (
          <nav
            aria-label="Breadcrumb"
            className={cn(
              "mb-auto flex flex-wrap items-center gap-1.5 self-start rounded-full border px-4 py-2 text-[13px]",
              isDark ? "border-white/25 bg-white/15 backdrop-blur-md" : "border-slate-200 bg-slate-50",
            )}
          >
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 ? <ChevronRight size={13} className="shrink-0 opacity-60" /> : null}
                {c.href ? (
                  <Link href={c.href} className={cn("transition-colors", isDark ? "text-white/80 hover:text-white" : "text-slate-500 hover:text-[var(--navy)]")}>
                    {c.label}
                  </Link>
                ) : (
                  <span className="font-medium">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}

        <div className="mt-12">
          {eyebrow ? (
            <span
              className={cn(
                "mb-5 inline-flex rounded-full border px-4 py-1.5 text-[13px]",
                isDark ? "border-white/30 text-white/85" : "border-slate-300 text-slate-600",
              )}
            >
              {eyebrow}
            </span>
          ) : null}
          <h1 className="max-w-3xl text-balance text-[clamp(1.9rem,6.4vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.025em] sm:text-[clamp(2.5rem,4.4vw,3.5rem)]">
            {title}
          </h1>
          <p className={cn("mt-4 max-w-2xl text-pretty text-base leading-7 sm:mt-5 sm:text-lg", isDark ? "text-white/85" : "text-slate-600")}>{description}</p>
        </div>
      </div>
    </div>
  );
}
