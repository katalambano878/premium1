// Server-safe pieces shared by the shipments, customs and documents lists.
import { Database, Search } from "lucide-react";
import { Callout, buttonClass, cx, inputClass } from "../ui";

/** Search box that reloads the list with `?q=`; `hidden` carries the other filters along. */
export function SearchForm({
  action,
  q,
  label,
  placeholder,
  hidden,
}: {
  action: string;
  q: string;
  label: string;
  placeholder: string;
  hidden?: Record<string, string | null | undefined>;
}) {
  return (
    <form action={action} method="get" role="search" className="flex w-full gap-2 sm:max-w-md">
      {hidden
        ? Object.entries(hidden).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))
        : null}
      <label htmlFor="list-search" className="sr-only">
        {label}
      </label>
      <div className="relative min-w-0 flex-1">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          id="list-search"
          type="search"
          name="q"
          defaultValue={q}
          placeholder={placeholder}
          maxLength={100}
          className={cx(inputClass, "pl-10")}
        />
      </div>
      <button type="submit" className={buttonClass("secondary", "md")}>
        Search
      </button>
    </form>
  );
}

export function DbOffline() {
  return (
    <Callout tone="warning" icon={Database} title="The database is not connected">
      Nothing can be shown or saved right now. Try again in a minute, and tell the administrator if this keeps happening.
    </Callout>
  );
}
