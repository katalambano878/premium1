"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardCheck,
  DollarSign,
  FileText,
  Globe,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  Truck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Toaster } from "sonner";
import { CommandPalette } from "@/components/admin/CommandPalette";

const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard,
  Inbox,
  Truck,
  ClipboardCheck,
  FileText,
  Users,
  DollarSign,
  Shield,
  Settings,
};

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export function AdminShell({
  children,
  navItems,
  userEmail,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  userEmail: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    router.push("/auth/admin");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const mainNav = navItems.filter(
    (n) => !["staff", "settings"].includes(n.label.toLowerCase())
  );
  const bottomNav = navItems.filter((n) =>
    ["staff", "settings"].includes(n.label.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors closeButton />
      <CommandPalette />

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 bg-[#0B1A2E] text-white flex items-center justify-between px-4 z-50 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white font-bold text-xs">P1</span>
          </div>
          <span className="font-semibold text-sm">Premium 1</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="p-2 rounded-lg hover:bg-white/10"
            title="Search (⌘K)"
          >
            <Search size={18} />
          </button>
          <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-white/10">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-[260px] bg-[#0B1A2E] text-white z-40 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 flex flex-col`}
      >
        {/* Brand */}
        <div className="p-5 pb-4">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/premium1-logo-176.webp" alt="P1" width={36} height={36} className="rounded-lg" />
            <div>
              <span className="font-bold text-base tracking-tight block leading-tight">Premium 1</span>
              <span className="text-[10px] text-white/35 uppercase tracking-[0.2em] font-semibold">
                Operations
              </span>
            </div>
          </Link>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          <div className="mb-2 px-3 pt-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
              Main
            </span>
          </div>
          {mainNav.map((n) => {
            const Icon = ICONS[n.icon] || LayoutDashboard;
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150 ${
                  active
                    ? "bg-[var(--accent)]/15 text-[var(--accent)] font-semibold shadow-sm"
                    : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  active ? "bg-[var(--accent)]/20" : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                }`}>
                  <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                </div>
                {n.label}
              </Link>
            );
          })}

          {bottomNav.length > 0 && (
            <>
              <div className="mb-2 px-3 pt-6">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                  Admin
                </span>
              </div>
              {bottomNav.map((n) => {
                const Icon = ICONS[n.icon] || Settings;
                const active = isActive(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150 ${
                      active
                        ? "bg-[var(--accent)]/15 text-[var(--accent)] font-semibold shadow-sm"
                        : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      active ? "bg-[var(--accent)]/20" : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                    }`}>
                      <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                    </div>
                    {n.label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          {userEmail && (
            <p className="text-[11px] text-white/30 truncate mb-3 px-1">{userEmail}</p>
          )}
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 flex-1 text-[11px] py-2 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors font-medium"
            >
              <Globe size={13} />
              Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 flex-1 text-[11px] py-2 rounded-lg bg-white/5 text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors font-medium"
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <main className="lg:ml-[260px] pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px]">{children}</div>
      </main>
    </div>
  );
}
