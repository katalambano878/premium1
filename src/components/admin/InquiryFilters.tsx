"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useRef, useTransition } from "react";

export function InquiryFilters({
  currentStatus,
  currentPriority,
  currentSearch,
}: {
  currentStatus?: string;
  currentPriority?: string;
  currentSearch?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const update = (key: string, value: string) => {
    const p = new URLSearchParams();
    if (currentStatus && key !== "status") p.set("status", currentStatus);
    if (currentPriority && key !== "priority") p.set("priority", currentPriority);
    if (currentSearch && key !== "q") p.set("q", currentSearch);
    if (value) p.set(key, value);
    startTransition(() => router.push(`/admin/inquiries?${p.toString()}`));
  };

  return (
    <div className="flex flex-wrap gap-3" aria-busy={pending}>
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search inquiries..."
          defaultValue={currentSearch}
          onChange={(e) => {
            const v = e.target.value;
            clearTimeout(timer.current);
            timer.current = setTimeout(() => update("q", v), 300);
          }}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
        />
      </div>
      <select
        value={currentPriority || ""}
        onChange={(e) => update("priority", e.target.value)}
        className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
      >
        <option value="">All Priorities</option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
}
