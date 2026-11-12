"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { Input, Select, buttonClass, statusLabel } from "./ui";
import { PRIORITIES, inquiriesHref } from "./inquiries/shared";

/** Search box and priority filter for the enquiry list. Both keep the other filters in the URL. */
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

  const urlSearch = currentSearch || "";
  const [value, setValue] = useState(urlSearch);
  // Remember what the URL last said and what this box last asked for, so the
  // box empties when the filters are cleared from somewhere else on the page.
  const [seen, setSeen] = useState(urlSearch);
  const [asked, setAsked] = useState(urlSearch);
  if (urlSearch !== seen) {
    setSeen(urlSearch);
    if (urlSearch === "" && asked !== "") {
      setAsked("");
      setValue("");
    }
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (next: { priority?: string; q?: string }) =>
    startTransition(() => router.replace(inquiriesHref({ status: currentStatus, ...next }), { scroll: false }));

  const search = (q: string, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const trimmed = q.trim();
      setAsked(trimmed);
      go({ priority: currentPriority, q: trimmed });
    }, delay);
  };

  return (
    <form
      role="search"
      aria-busy={pending}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
      onSubmit={(e) => {
        e.preventDefault();
        search(value, 0);
      }}
    >
      <div className="relative sm:max-w-sm sm:flex-1">
        <label htmlFor="inquiry-search" className="sr-only">
          Search enquiries
        </label>
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {pending ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Search size={16} aria-hidden />}
        </span>
        <Input
          id="inquiry-search"
          type="search"
          name="q"
          autoComplete="off"
          enterKeyHint="search"
          maxLength={100}
          placeholder="Name, company, email, number or route"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            search(e.target.value, 300);
          }}
          className="pl-10 pr-11 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setValue("");
              search("", 0);
            }}
            className="absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[var(--navy)]"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      <div className="sm:w-48">
        <label htmlFor="inquiry-priority" className="sr-only">
          Priority
        </label>
        <Select
          id="inquiry-priority"
          value={currentPriority || ""}
          onChange={(e) => {
            clearTimeout(timer.current);
            setAsked(value.trim());
            go({ priority: e.target.value, q: value.trim() });
          }}
        >
          <option value="">Any priority</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {statusLabel(p)} priority
            </option>
          ))}
        </Select>
      </div>

      {currentPriority || urlSearch ? (
        <button
          type="button"
          onClick={() => {
            clearTimeout(timer.current);
            setValue("");
            setAsked("");
            go({});
          }}
          className={buttonClass("ghost", "sm", "self-start sm:self-auto")}
        >
          Clear search and priority
        </button>
      ) : null}
    </form>
  );
}
