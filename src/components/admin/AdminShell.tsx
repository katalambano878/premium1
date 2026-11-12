"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ClipboardCheck,
  DollarSign,
  ExternalLink,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Shield,
  Truck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";
import { CommandPalette, openCommandPalette } from "@/components/admin/CommandPalette";
import { buttonClass, cx, initials } from "@/components/admin/ui";

const ICONS: Record<string, LucideIcon> = { LayoutDashboard, Inbox, Truck, ClipboardCheck, FileText, Users, DollarSign, Shield, Settings };

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export interface ShellUser {
  name: string;
  email: string;
  roleLabel: string;
}

export function AdminShell({
  children,
  navItems,
  createItems,
  badges,
  user,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  createItems: { href: string; label: string }[];
  /** Counts shown beside a section, keyed by href (e.g. new enquiries). */
  badges: Record<string, { count: number; label: string; urgent?: boolean }>;
  user: ShellUser;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const createRef = useRef<HTMLDivElement>(null);

  // Close the "New" menu on outside click or Escape.
  useEffect(() => {
    if (!createOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!createRef.current?.contains(e.target as Node)) setCreateOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCreateOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [createOpen]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    router.push("/auth/admin");
    router.refresh();
  };

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`));
  const isAdminItem = (n: NavItem) => n.href === "/admin/staff" || n.href === "/admin/settings";
  const mainNav = navItems.filter((n) => !isAdminItem(n));
  const adminNav = navItems.filter(isAdminItem);
  const current = navItems.find((n) => isActive(n.href));

  const navLink = (n: NavItem) => {
    const Icon = ICONS[n.icon] || LayoutDashboard;
    const active = isActive(n.href);
    const badge = badges[n.href];
    return (
      <Link
        key={n.href}
        href={n.href}
        onClick={() => setDrawer(false)}
        aria-current={active ? "page" : undefined}
        className={cx(
          "flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors duration-150",
          active ? "bg-white/10 font-medium text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon size={18} strokeWidth={1.7} className={active ? "text-[var(--accent)]" : undefined} />
        <span className="flex-1">{n.label}</span>
        {badge && badge.count > 0 ? (
          <span
            title={`${badge.count} ${badge.label}`}
            className={cx(
              "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums",
              badge.urgent ? "bg-red-500 text-white" : "bg-white/15 text-white",
            )}
          >
            {badge.count > 99 ? "99+" : badge.count}
            <span className="sr-only"> {badge.label}</span>
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] print:bg-white">
      <Toaster position="top-right" richColors closeButton />
      <CommandPalette navItems={navItems} createItems={createItems} />

      {/* Sidebar */}
      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-[var(--navy)] text-white transition-transform duration-200 ease-out print:hidden lg:translate-x-0",
          drawer ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <Link href="/admin" onClick={() => setDrawer(false)} className="flex items-center gap-3">
            <Image src="/premium1-logo-176.webp" alt="" width={36} height={36} className="rounded-lg" />
            <span className="leading-tight">
              <span className="block text-[15px] font-medium">Premium 1 Logistics</span>
              <span className="block text-xs text-white/60">Operations dashboard</span>
            </span>
          </Link>
          <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav aria-label="Dashboard sections" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          {mainNav.map(navLink)}
          {adminNav.length > 0 ? (
            <>
              <p className="px-3 pb-1 pt-5 text-xs text-white/50">Administration</p>
              {adminNav.map(navLink)}
            </>
          ) : null}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[13px] font-medium">{initials(user.name)}</span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-medium">{user.name}</span>
              <span className="block truncate text-xs text-white/60">{user.roleLabel}</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut size={17} />
            </button>
          </div>
          <Link href="/" target="_blank" className="mt-1 flex min-h-9 items-center gap-2 rounded-xl px-3 text-[13px] text-white/60 transition-colors hover:bg-white/5 hover:text-white">
            <ExternalLink size={14} /> View the website
          </Link>
        </div>
      </aside>

      {drawer ? <div className="fixed inset-0 z-40 bg-[rgba(8,20,40,0.55)] lg:hidden" onClick={() => setDrawer(false)} aria-hidden /> : null}

      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-[#f4f4f5]/90 backdrop-blur print:hidden lg:ml-[264px]">
        <div className="flex h-16 items-center gap-3 px-4 md:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-[var(--navy)] lg:hidden"
          >
            <Menu size={18} />
          </button>
          <p className="truncate text-sm font-medium text-[var(--navy)] lg:hidden">{current?.label || "Dashboard"}</p>

          <button
            type="button"
            onClick={openCommandPalette}
            className="ml-auto inline-flex h-10 items-center gap-2.5 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-500 transition-colors hover:border-slate-400 lg:ml-0 lg:w-full lg:max-w-md"
          >
            <Search size={16} />
            <span className="hidden flex-1 text-left lg:block">Find an enquiry, shipment, client or invoice…</span>
            <kbd className="hidden rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs text-slate-500 lg:block">⌘K</kbd>
            <span className="sr-only lg:hidden">Search</span>
          </button>

          {createItems.length > 0 ? (
            <div ref={createRef} className="relative lg:ml-auto">
              <button
                type="button"
                onClick={() => setCreateOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={createOpen}
                className={buttonClass("primary", "md", "h-10 min-h-0")}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">New</span>
                <ChevronDown size={14} className={cx("hidden transition-transform duration-150 sm:block", createOpen && "rotate-180")} />
              </button>
              {createOpen ? (
                <div role="menu" className="absolute right-0 top-12 w-52 origin-top-right animate-[dialog-in_140ms_cubic-bezier(0.22,1,0.36,1)] rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_24px_48px_-24px_rgba(11,31,58,0.4)]">
                  {createItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setCreateOpen(false)}
                      className="flex min-h-10 items-center rounded-lg px-3 text-sm text-[var(--navy)] hover:bg-slate-100"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <main className="lg:ml-[264px] print:ml-0">
        <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6 lg:px-8 lg:py-8 print:p-0">{children}</div>
      </main>
    </div>
  );
}
