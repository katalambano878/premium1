import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Package, Ship, FileCheck, Warehouse, Truck, Home, Network, Anchor, ArrowUpRight, type LucideIcon } from "lucide-react";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  Package,
  Ship,
  FileCheck,
  Warehouse,
  Truck,
  Home,
  Network,
  Anchor,
};

/** Photos cleared for use on service pages. */
const ALLOWED_SERVICE_IMAGES = new Set([
  "/service-freight.webp",
  "/hero/customs-gate.webp",
  "/hero-slide-1.webp",
  "/hero-slide-2.webp",
  "/services-hero.webp",
  "/hero/freight-dawn.webp",
  "/hero/ship-agency.webp",
  "/hero/operations-desk.webp",
]);

const SERVICE_IMAGE_FALLBACK: Record<string, string> = {
  "ship-agency": "/hero/ship-agency.webp",
  "import-export-handling": "/hero-slide-2.webp",
};

/** The service's own image when it is a cleared photo, otherwise a cleared substitute. */
export function serviceImage(slug: string, image?: string): string {
  if (image && ALLOWED_SERVICE_IMAGES.has(image)) return image;
  return SERVICE_IMAGE_FALLBACK[slug] ?? "/services-hero.webp";
}

interface ServiceCardProps {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  className?: string;
  /** light: white card on the grey page; dark: card inside a navy panel */
  variant?: "light" | "dark";
  /** When set, the card renders as a photo card with glass pills */
  image?: string;
  /** Glass tag pills shown on the photo variant */
  tags?: string[];
}

export function ServiceCard({ name, slug, description, icon, className, variant = "light", image, tags }: ServiceCardProps) {
  const Icon = (icon && SERVICE_ICONS[icon]) || Package;
  const href = `/services/${slug}`;

  if (image) {
    return (
      <Link
        href={href}
        className={cn(
          "group relative isolate flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-3xl bg-[var(--navy)] p-4 text-white sm:min-h-[26rem] sm:p-5",
          className,
        )}
      >
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="-z-10 object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,20,40,0.25)_0%,rgba(8,20,40,0.1)_35%,rgba(8,20,40,0.9)_100%)]" aria-hidden />

        <div className="flex flex-wrap items-start justify-between gap-2">
          {tags && tags.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <li key={t} className="rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 text-[13px] font-medium backdrop-blur-md">
                  {t}
                </li>
              ))}
            </ul>
          ) : (
            <span />
          )}
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 backdrop-blur-md">
            <Icon className="h-5 w-5" strokeWidth={1.6} />
          </span>
        </div>

        <div>
          <h3 className="text-2xl font-medium tracking-[-0.01em]">{name}</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/85">{description}</p>
          <span className="mt-5 flex items-center justify-between rounded-full border border-white/35 bg-white/10 px-5 py-3 text-sm font-medium backdrop-blur-md transition-colors duration-200 group-hover:bg-white group-hover:text-[var(--navy)]">
            Explore service
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    );
  }

  const isDark = variant === "dark";

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col rounded-3xl border p-6 transition-[box-shadow,background-color,border-color] duration-300 sm:p-8",
        isDark
          ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
          : "border-slate-200 bg-white text-[var(--navy)] hover:shadow-[0_24px_48px_-32px_rgba(11,31,58,0.35)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
            isDark ? "border-white/20 bg-white/10 text-white" : "border-slate-200 bg-white text-[var(--navy)]",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </span>
        <span
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-200 group-hover:bg-[var(--accent)] group-hover:text-[var(--navy)]",
            isDark ? "bg-white/10 text-white" : "bg-[var(--navy)] text-white",
          )}
          aria-hidden
        >
          <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>

      <h3 className="mt-8 text-xl font-medium tracking-[-0.01em] sm:text-2xl">{name}</h3>
      <p className={cn("mt-3 text-sm leading-6", isDark ? "text-white/75" : "text-slate-500")}>{description}</p>
    </Link>
  );
}
