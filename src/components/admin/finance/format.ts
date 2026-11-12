// Invoice helpers that are safe to use in the browser as well as on the server.
// (`money` in "@/lib/finance" is server-only; `formatMoney` matches its output.)

export const CURRENCIES: { value: string; label: string }[] = [
  { value: "USD", label: "USD · US dollar" },
  { value: "GHS", label: "GHS · Ghana cedi" },
  { value: "EUR", label: "EUR · Euro" },
  { value: "GBP", label: "GBP · British pound" },
];

export const CHARGE_TYPES: { value: string; label: string }[] = [
  { value: "freight", label: "Freight" },
  { value: "customs", label: "Customs" },
  { value: "handling", label: "Handling" },
  { value: "insurance", label: "Insurance" },
  { value: "storage", label: "Storage" },
  { value: "other", label: "Other" },
];

export const PAYMENT_METHODS: { value: string; label: string }[] = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "mobile_money", label: "Mobile money" },
  { value: "cash", label: "Cash" },
  { value: "check", label: "Cheque" },
  { value: "card", label: "Card" },
];

const pretty = (value: string) => value.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

export const chargeTypeLabel = (value: string | null | undefined) =>
  value ? CHARGE_TYPES.find((t) => t.value === value)?.label || pretty(value) : "Other";

export const paymentMethodLabel = (value: string | null | undefined) =>
  value ? PAYMENT_METHODS.find((m) => m.value === value || (value === "cheque" && m.value === "check"))?.label || pretty(value) : "—";

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Same output as `money` from "@/lib/finance", for client components. */
export function formatMoney(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-GH", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount || 0);
  } catch {
    return `${currency} ${(amount || 0).toFixed(2)}`;
  }
}

export const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
