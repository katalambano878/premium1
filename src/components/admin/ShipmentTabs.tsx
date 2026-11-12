"use client";

import { useId, useRef, useState } from "react";
import { cx } from "./ui";

export type ShipmentTab = { id: string; label: string; count?: number; content: React.ReactNode };

/** Tabbed card for the shipment page. Every panel stays mounted, so half-typed forms survive a tab switch. */
export function ShipmentTabs({ tabs }: { tabs: ShipmentTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const base = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const move = (from: number, step: number) => {
    const next = tabs[(from + step + tabs.length) % tabs.length];
    setActive(next.id);
    refs.current[next.id]?.focus();
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div role="tablist" aria-label="Shipment sections" className="flex overflow-x-auto border-b border-slate-200 px-2 sm:px-3">
        {tabs.map((tab, i) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") move(i, 1);
                if (e.key === "ArrowLeft") move(i, -1);
              }}
              className={cx(
                "-mb-px inline-flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent-ink)]",
                selected ? "border-[var(--navy)] text-[var(--navy)]" : "border-transparent text-slate-500 hover:text-[var(--navy)]",
              )}
            >
              {tab.label}
              {typeof tab.count === "number" ? (
                <span className={cx("rounded-full px-1.5 text-xs tabular-nums", selected ? "bg-slate-100 text-slate-700" : "text-slate-400")}>
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${base}-panel-${tab.id}`}
          aria-labelledby={`${base}-tab-${tab.id}`}
          hidden={tab.id !== active}
          className="p-5 sm:p-6"
        >
          {tab.content}
        </div>
      ))}
    </section>
  );
}
