"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { ClipboardCheck, DollarSign, FileText, Inbox, LayoutDashboard, Loader2, Plus, Search, Settings, Shield, Truck, Users, type LucideIcon } from "lucide-react";

const NAV_ICONS: Record<string, LucideIcon> = { LayoutDashboard, Inbox, Truck, ClipboardCheck, FileText, Users, DollarSign, Shield, Settings };
const HIT_ICONS: Record<string, LucideIcon> = { Enquiry: Inbox, Shipment: Truck, Client: Users, Invoice: DollarSign, Declaration: ClipboardCheck };

type NavItem = { href: string; label: string; icon: string };
type CreateItem = { href: string; label: string };
type Hit = { type: string; title: string; subtitle: string; href: string };

const itemClass =
  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 data-[selected=true]:bg-slate-100 data-[selected=true]:text-[var(--navy)]";
const groupClass =
  "mb-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-slate-400";

/** Opens the palette from anywhere (top bar button, mobile search icon). */
export const openCommandPalette = () => document.dispatchEvent(new CustomEvent("admin:open-search"));

/**
 * ⌘K palette: jump to a section, start a new record, or find an enquiry,
 * shipment, client, invoice or declaration by number or name. Only shows the
 * sections and shortcuts this staff member's role allows.
 */
export function CommandPalette({ navItems, createItems }: { navItems: NavItem[]; createItems: CreateItem[] }) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const requestId = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    document.addEventListener("admin:open-search", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("admin:open-search", onOpen);
    };
  }, []);

  const onTermChange = (value: string) => {
    setTerm(value);
    const id = ++requestId.current;
    const q = value.trim();
    if (q.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Small pause so we search once the person stops typing.
    window.setTimeout(async () => {
      if (id !== requestId.current) return;
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
        const data = res.ok ? await res.json() : { results: [] };
        if (id === requestId.current) setHits(data.results || []);
      } catch {
        if (id === requestId.current) setHits([]);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 220);
  };

  const close = useCallback(() => {
    setOpen(false);
    setTerm("");
    setHits([]);
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Search the dashboard">
      <div className="fixed inset-0 bg-[rgba(8,20,40,0.5)]" onClick={close} />
      <div className="fixed left-1/2 top-[12%] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 animate-[dialog-in_160ms_cubic-bezier(0.22,1,0.36,1)]">
        <Command shouldFilter={hits.length === 0} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_64px_-24px_rgba(11,31,58,0.45)]">
          <div className="flex items-center gap-3 border-b border-slate-200 px-4">
            {loading ? <Loader2 size={18} className="animate-spin text-slate-400" /> : <Search size={18} className="text-slate-400" />}
            <Command.Input
              value={term}
              onValueChange={onTermChange}
              placeholder="Find an enquiry, shipment, client or invoice…"
              className="flex-1 bg-transparent py-4 text-[15px] text-[var(--navy)] placeholder:text-slate-400 focus:outline-none"
              autoFocus
            />
            <kbd className="hidden rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs text-slate-500 sm:block">Esc</kbd>
          </div>
          <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
            <Command.Empty className="px-4 py-10 text-center text-sm text-slate-500">
              {loading ? "Searching…" : term.trim().length >= 2 ? `Nothing found for “${term.trim()}”.` : "Type to search."}
            </Command.Empty>

            {hits.length > 0 ? (
              <Command.Group heading="Records" className={groupClass}>
                {hits.map((hit) => {
                  const Icon = HIT_ICONS[hit.type] || FileText;
                  return (
                    <Command.Item key={hit.href} value={`${hit.type} ${hit.title} ${hit.subtitle} ${hit.href}`} onSelect={() => go(hit.href)} className={itemClass}>
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                        <Icon size={15} strokeWidth={1.7} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-[var(--navy)]">{hit.title}</span>
                        {hit.subtitle ? <span className="block truncate text-[13px] text-slate-500">{hit.subtitle}</span> : null}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">{hit.type}</span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            ) : (
              <>
                {createItems.length > 0 ? (
                  <Command.Group heading="Create" className={groupClass}>
                    {createItems.map((item) => (
                      <Command.Item key={item.href} value={`${item.label} create add`} onSelect={() => go(item.href)} className={itemClass}>
                        <Plus size={16} className="shrink-0 text-slate-400" />
                        <span className="font-medium">{item.label}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : null}
                <Command.Group heading="Go to" className={groupClass}>
                  {navItems.map((item) => {
                    const Icon = NAV_ICONS[item.icon] || LayoutDashboard;
                    return (
                      <Command.Item key={item.href} value={`${item.label} go open`} onSelect={() => go(item.href)} className={itemClass}>
                        <Icon size={16} className="shrink-0 text-slate-400" strokeWidth={1.7} />
                        <span className="font-medium">{item.label}</span>
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              </>
            )}
          </Command.List>
          <div className="flex items-center gap-4 border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500">
            <span>↑↓ to move</span>
            <span>Enter to open</span>
            <span className="ml-auto hidden sm:inline">Search by number, name, company or email</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
