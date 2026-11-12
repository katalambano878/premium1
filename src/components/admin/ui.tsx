// Admin UI kit. Every dashboard screen is built from these pieces so buttons,
// fields, tables, badges and empty states look and behave the same everywhere.
// Server-safe (no hooks); interactive pieces live in ui-client.tsx.
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, type LucideIcon } from "lucide-react";

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ink)]";
const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-[var(--navy)] text-white hover:bg-[#16335c]",
  secondary: "border border-slate-300 bg-white text-[var(--navy)] hover:border-slate-400 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-[var(--navy)]",
  danger: "border border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50",
};
const BUTTON_SIZE: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-[13px]",
  md: "min-h-11 px-4 text-sm",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra?: string) {
  return cx(BUTTON_BASE, BUTTON_VARIANT[variant], BUTTON_SIZE[size], extra);
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Page header                                                         */
/* ------------------------------------------------------------------ */

export function PageHeader({
  title,
  description,
  back,
  actions,
  badge,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <header className="mb-6">
      {back ? (
        <Link
          href={back.href}
          className="mb-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg pr-2 text-sm text-slate-500 transition-colors hover:text-[var(--navy)]"
        >
          <ArrowLeft size={16} /> {back.label}
        </Link>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-medium tracking-[-0.02em] text-[var(--navy)] sm:text-[1.75rem]">{title}</h1>
            {badge}
          </div>
          {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  className,
  padded = true,
  as: Tag = "section",
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  as?: "section" | "div" | "aside";
}) {
  return <Tag className={cx("rounded-2xl border border-slate-200 bg-white", padded && "p-5 sm:p-6", className)}>{children}</Tag>;
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mb-4 flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-base font-medium text-[var(--navy)]">{title}</h2>
        {description ? <p className="mt-0.5 text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Small "View all" style link for card headers. */
export function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-9 items-center gap-1 text-sm font-medium text-[var(--accent-ink)] hover:text-[var(--navy)]"
    >
      {children}
      <ArrowUpRight size={14} className="transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */

export const inputClass =
  "block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-[var(--navy)] placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 focus:border-[var(--navy)] focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/10 disabled:bg-slate-50 disabled:text-slate-500";

export function Field({
  label,
  htmlFor,
  hint,
  required,
  optional,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-medium text-[var(--navy)]">
        <span>
          {label}
          {required ? (
            <span className="text-red-600" aria-hidden>
              {" "}
              *
            </span>
          ) : null}
        </span>
        {optional ? <span className="text-xs font-normal text-slate-400">Optional</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1.5 text-[13px] leading-5 text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cx(inputClass, className)} {...props} />;
}

export function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select className={cx(inputClass, "appearance-none bg-[length:1rem] bg-[right_0.85rem_center] bg-no-repeat pr-10", className)} style={SELECT_CHEVRON} {...props}>
      {children}
    </select>
  );
}
const SELECT_CHEVRON = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
};

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cx(inputClass, "min-h-[96px] resize-y leading-6", className)} {...props} />;
}

/** Bottom row of a form: secondary action on the left, submit on the right. */
export function FormActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Status badges                                                       */
/* ------------------------------------------------------------------ */

type Tone = "slate" | "blue" | "amber" | "violet" | "cyan" | "orange" | "green" | "red";

const TONE: Record<Tone, { pill: string; dot: string }> = {
  slate: { pill: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  blue: { pill: "bg-blue-50 text-blue-800", dot: "bg-blue-500" },
  amber: { pill: "bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  violet: { pill: "bg-violet-50 text-violet-800", dot: "bg-violet-500" },
  cyan: { pill: "bg-cyan-50 text-cyan-800", dot: "bg-cyan-500" },
  orange: { pill: "bg-orange-50 text-orange-800", dot: "bg-orange-500" },
  green: { pill: "bg-emerald-50 text-emerald-800", dot: "bg-emerald-500" },
  red: { pill: "bg-red-50 text-red-800", dot: "bg-red-500" },
};

/** Every status the dashboard shows: its plain label and colour. */
export const STATUS: Record<string, { label: string; tone: Tone }> = {
  // enquiries
  new: { label: "New", tone: "blue" },
  contacted: { label: "Contacted", tone: "amber" },
  quoted: { label: "Quoted", tone: "violet" },
  won: { label: "Won", tone: "green" },
  lost: { label: "Lost", tone: "slate" },
  // shipments
  draft: { label: "Draft", tone: "slate" },
  booked: { label: "Booked", tone: "blue" },
  in_transit: { label: "In transit", tone: "amber" },
  arrived: { label: "Arrived", tone: "cyan" },
  clearing: { label: "Clearing customs", tone: "violet" },
  out_for_delivery: { label: "Out for delivery", tone: "orange" },
  delivered: { label: "Delivered", tone: "green" },
  // invoices
  sent: { label: "Sent", tone: "blue" },
  paid: { label: "Paid", tone: "green" },
  overdue: { label: "Overdue", tone: "red" },
  void: { label: "Void", tone: "slate" },
  // customs
  submitted: { label: "Submitted", tone: "blue" },
  query: { label: "Under query", tone: "red" },
  amended: { label: "Amended", tone: "amber" },
  released: { label: "Released", tone: "green" },
  // priority
  low: { label: "Low", tone: "slate" },
  medium: { label: "Medium", tone: "slate" },
  high: { label: "High", tone: "orange" },
  urgent: { label: "Urgent", tone: "red" },
  // client tiers
  vip: { label: "VIP", tone: "amber" },
  standard: { label: "Standard", tone: "slate" },
  // staff
  active: { label: "Active", tone: "green" },
  inactive: { label: "Inactive", tone: "slate" },
  invited: { label: "Invite sent", tone: "amber" },
};

export const statusLabel = (status: string | null | undefined) =>
  (status && STATUS[status]?.label) || (status ? status.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()) : "—");

export function StatusBadge({ status, label, tone, className }: { status?: string | null; label?: string; tone?: Tone; className?: string }) {
  const def = (status && STATUS[status]) || undefined;
  const t = TONE[tone || def?.tone || "slate"];
  return (
    <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium", t.pill, className)}>
      <span className={cx("h-1.5 w-1.5 rounded-full", t.dot)} aria-hidden />
      {label || statusLabel(status)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state, callout, stats                                         */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact,
}: {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={cx("flex flex-col items-center text-center", compact ? "px-4 py-8" : "px-6 py-14")}>
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
        <Icon size={20} strokeWidth={1.6} />
      </span>
      <h3 className="mt-4 text-base font-medium text-[var(--navy)]">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

const CALLOUT: Record<"info" | "warning" | "danger" | "success", string> = {
  info: "border-slate-200 bg-slate-50 text-slate-700",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

export function Callout({
  tone = "info",
  icon: Icon,
  title,
  children,
  action,
  className,
}: {
  tone?: keyof typeof CALLOUT;
  icon?: LucideIcon;
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-3 rounded-xl border px-4 py-3 text-sm leading-6 sm:flex-row sm:items-center sm:justify-between", CALLOUT[tone], className)}>
      <div className="flex items-start gap-3">
        {Icon ? <Icon size={18} className="mt-0.5 shrink-0" strokeWidth={1.8} /> : null}
        <div>
          {title ? <p className="font-medium">{title}</p> : null}
          {children ? <div className={title ? "opacity-90" : undefined}>{children}</div> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  href?: string;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const valueColor = { default: "text-[var(--navy)]", good: "text-emerald-700", warn: "text-amber-700", bad: "text-red-700" }[tone];
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        {Icon ? <Icon size={18} strokeWidth={1.6} className="shrink-0 text-slate-400" /> : null}
      </div>
      <p className={cx("mt-2 text-xl font-medium leading-tight tracking-[-0.02em] tabular-nums sm:text-2xl", valueColor)}>{value}</p>
      {hint ? <p className="mt-1 text-[13px] leading-5 text-slate-500">{hint}</p> : null}
    </>
  );
  const cls = "block rounded-2xl border border-slate-200 bg-white p-5";
  return href ? (
    <Link href={href} className={cx(cls, "transition-[border-color,box-shadow] duration-150 hover:border-slate-300 hover:shadow-[0_12px_24px_-18px_rgba(11,31,58,0.35)]")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/* ------------------------------------------------------------------ */
/* Tables                                                              */
/* ------------------------------------------------------------------ */

/** White card that holds a table and scrolls sideways on small screens. */
export function TableCard({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">{children}</div>
      {footer ? <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">{footer}</div> : null}
    </div>
  );
}

export const tableClass = "w-full min-w-[640px] text-left text-sm";
export const thClass = "whitespace-nowrap border-b border-slate-200 bg-slate-50/70 px-4 py-3 text-[13px] first:pl-5 last:pr-5 font-medium text-slate-500";
export const tdClass = "border-b border-slate-100 px-4 py-3.5 align-middle text-slate-600 first:pl-5 last:pr-5";
export const trClass = "group transition-colors hover:bg-slate-50/70 [&:last-child>td]:border-b-0";
/** First-column link inside a row: the record's name or number. */
export const rowLinkClass = "font-medium text-[var(--navy)] underline-offset-4 hover:underline";

/* ------------------------------------------------------------------ */
/* Filter tabs                                                         */
/* ------------------------------------------------------------------ */

export function FilterTabs({ items }: { items: { label: string; href: string; count?: number; active?: boolean }[] }) {
  return (
    <nav aria-label="Filter" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cx(
            "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-colors duration-150",
            item.active
              ? "border-[var(--navy)] bg-[var(--navy)] text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-[var(--navy)]",
          )}
        >
          {item.label}
          {typeof item.count === "number" ? (
            <span className={cx("tabular-nums", item.active ? "text-white/70" : "text-slate-400")}>{item.count}</span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Details                                                             */
/* ------------------------------------------------------------------ */

/** Label/value pairs for record detail pages. */
export function DetailList({ items, columns = 2 }: { items: { label: string; value: React.ReactNode }[]; columns?: 1 | 2 | 3 }) {
  const grid = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3" }[columns];
  return (
    <dl className={cx("grid gap-x-6 gap-y-4", grid)}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[13px] text-slate-500">{item.label}</dt>
          <dd className="mt-0.5 break-words text-[15px] font-medium text-[var(--navy)]">{item.value || <span className="font-normal text-slate-400">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

const toDate = (v: string | Date | null | undefined) => (v ? new Date(v) : null);

/** 12 Nov 2026 */
export function formatDate(v: string | Date | null | undefined): string {
  const d = toDate(v);
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—";
}

/** 12 Nov 2026, 14:05 */
export function formatDateTime(v: string | Date | null | undefined): string {
  const d = toDate(v);
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
    : "—";
}

/** "5 min ago", "yesterday", "3 days ago", then a date. */
export function timeAgo(v: string | Date | null | undefined): string {
  const d = toDate(v);
  if (!d || Number.isNaN(d.getTime())) return "—";
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  if (s < 172800) return "yesterday";
  if (s < 604800) return `${Math.floor(s / 86400)} days ago`;
  return formatDate(d);
}

/** Two-letter initials for avatars. */
export const initials = (name: string | null | undefined) =>
  (name || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";
