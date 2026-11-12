import "server-only";
import { query } from "@/lib/db/pool";

/** Sent invoices whose due date has passed become overdue. Cheap; run before reading invoices. */
export async function refreshOverdueInvoices() {
  await query(
    "UPDATE invoices SET status = 'overdue', updated_at = NOW() WHERE status = 'sent' AND due_date IS NOT NULL AND due_date < CURRENT_DATE",
  ).catch((e) => console.error("[finance] overdue refresh failed", e));
}

/** Formats an amount in its own currency, e.g. GHS 1,250.00 or $1,250.00. */
export function money(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-GH", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount || 0);
  } catch {
    return `${currency} ${(amount || 0).toFixed(2)}`;
  }
}

/** Sums rows per currency: [{ currency: "USD", total: 1200 }, ...], largest first. */
export function totalsByCurrency<T>(rows: T[], amount: (r: T) => number, currency: (r: T) => string | null | undefined) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const c = currency(r) || "USD";
    map.set(c, (map.get(c) || 0) + (Number(amount(r)) || 0));
  }
  return [...map.entries()].map(([c, total]) => ({ currency: c, total })).sort((a, b) => b.total - a.total);
}

/** "$1,200.00 · GHS 3,000.00", or a zero in the default currency. */
export function formatTotals(totals: { currency: string; total: number }[]): string {
  if (!totals.length) return money(0, "USD");
  return totals.map((t) => money(t.total, t.currency)).join(" · ");
}
