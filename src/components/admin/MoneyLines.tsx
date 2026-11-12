import { formatTotals, money } from "@/lib/finance";

/** Totals for stat cards: one amount per line, so different currencies never run together. */
export function MoneyLines({ totals }: { totals: { currency: string; total: number }[] }) {
  if (totals.length <= 1) return <>{formatTotals(totals)}</>;
  return (
    <span className="block space-y-0.5 text-lg sm:text-xl">
      {totals.map((t) => (
        <span key={t.currency} className="block">
          {money(t.total, t.currency)}
        </span>
      ))}
    </span>
  );
}
