"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string; description?: string }[];
};

const navItems: NavItem[] = [
  {
    href: "/services",
    label: "Services",
    children: [
      { href: "/services", label: "All services", description: "Everything we handle for importers." },
      { href: "/services/freight-forwarding", label: "Freight forwarding", description: "Sea, air and road freight into Ghana." },
      { href: "/services/customs-clearance", label: "Customs clearance", description: "Clearance at Tema and Takoradi." },
      { href: "/services/inland-transportation-hauls", label: "Inland delivery", description: "Port to your warehouse or site." },
      { href: "/services/ship-agency", label: "Ship agency", description: "Port agency for vessels calling Ghana." },
    ],
  },
  { href: "/about", label: "About" },
  { href: "/how-we-operate", label: "How we work" },
  { href: "/coverage", label: "Coverage" },
  { href: "/insights", label: "Guides" },
  { href: "/track", label: "Track" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeMenus = () => {
    setOpen(false);
    setOpenMenu(null);
  };

  // The homepage hero carries its own overlaid navigation.
  if (pathname === "/") return null;

  return (
    <header className={cn("sticky top-0 z-50 transition-[background-color,box-shadow] duration-300", scrolled ? "bg-[#f4f4f5]/90 shadow-[0_10px_30px_-24px_rgba(11,31,58,0.5)] backdrop-blur-xl" : "bg-[#f4f4f5]")}>
      <div className="mx-auto flex h-20 max-w-[1480px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={closeMenus}>
          <span className="relative inline-flex h-11 w-11 overflow-hidden rounded-full bg-[var(--navy)]">
            <Image src="/premium1-logo-176.webp" alt="" width={88} height={88} className="h-11 w-11 object-cover" priority />
          </span>
          <span className="whitespace-nowrap leading-tight">
            <span className="block text-lg font-semibold tracking-[-0.01em] text-[var(--navy)]">Premium 1</span>
            <span className="block text-[11px] tracking-[0.16em] text-slate-500">LOGISTICS</span>
          </span>
        </Link>

        <nav className="hidden items-center rounded-full border border-slate-200 bg-white px-2 py-1.5 xl:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const linkClass = cn(
              "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
              active ? "bg-[var(--navy)] text-white" : "text-[var(--navy)] hover:bg-slate-100",
            );
            if (!item.children?.length) {
              return (
                <Link key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              );
            }
            const isOpen = openMenu === item.label;
            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu((current) => (current === item.label ? null : current))}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenMenu((current) => (current === item.label ? null : item.label))}
                  className={linkClass}
                >
                  {item.label}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen ? (
                  <div className="absolute left-0 top-full z-50 pt-3">
                    <div className="w-[22rem] rounded-3xl border border-slate-200 bg-white p-2.5 shadow-[0_24px_48px_-24px_rgba(11,31,58,0.35)]">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href} onClick={closeMenus} className="block rounded-2xl px-4 py-3 transition-colors hover:bg-slate-100">
                          <p className="text-sm font-medium text-[var(--navy)]">{child.label}</p>
                          {child.description ? <p className="mt-0.5 text-[13px] text-slate-500">{child.description}</p> : null}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/quote"
            className="group hidden items-center gap-2 whitespace-nowrap rounded-full bg-[var(--navy)] py-2.5 pl-5 pr-4 text-sm font-medium text-white transition-[background-color,color,transform] duration-200 hover:bg-[var(--accent)] hover:text-[var(--navy)] active:scale-[0.97] sm:inline-flex"
          >
            Get a quote
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[var(--navy)] xl:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-x-0 bottom-0 top-20 z-50 flex flex-col overflow-y-auto bg-[var(--navy)] px-6 pb-8 pt-4 text-white xl:hidden">
          <nav className="flex flex-col">
            {navItems.map((item) => (
              <div key={item.href} className="border-b border-white/15">
                <Link href={item.href} onClick={closeMenus} className="block py-4 text-2xl font-medium tracking-[-0.02em]">
                  {item.label}
                </Link>
                {item.children?.length ? (
                  <ul className="-mt-1 mb-4 grid gap-2">
                    {item.children.slice(1).map((child) => (
                      <li key={child.href}>
                        <Link href={child.href} onClick={closeMenus} className="block text-base text-white/75">
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </nav>
          <Link
            href="/quote"
            onClick={closeMenus}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white py-4 text-base font-medium text-[var(--navy)]"
          >
            Get a quote
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      ) : null}
    </header>
  );
}
