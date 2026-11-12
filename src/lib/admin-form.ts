import "server-only";

// Small helpers shared by the admin server actions.

/** Trimmed text from a form field, or null when empty. */
export function text(form: FormData, key: string, max = 5000): string | null {
  const v = form.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t || null;
}

/** A number from a form field. Empty means null; 0 stays 0; junk means null. */
export function num(form: FormData, key: string): number | null {
  const v = form.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** The field's value if it is one of `allowed`, otherwise throws. */
export function oneOf<T extends string>(form: FormData, key: string, allowed: readonly T[]): T {
  const v = form.get(key);
  if (typeof v === "string" && (allowed as readonly string[]).includes(v)) return v as T;
  throw new Error(`Invalid ${key.replace(/_/g, " ")}.`);
}

/** A required id field. */
export function id(form: FormData, key = "id"): string {
  const v = form.get(key);
  if (typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v)) return v;
  throw new Error("Missing or invalid record id.");
}

/** Throws a readable error when a database call failed, instead of carrying on silently. */
export function ensure<T extends { error: unknown }>(result: T, what: string): T {
  if (result.error) {
    console.error(`[admin] could not ${what}:`, result.error);
    throw new Error(`Could not ${what}. Please try again.`);
  }
  return result;
}

export const INQUIRY_STATUSES = ["new", "contacted", "quoted", "won", "lost"] as const;
export const SHIPMENT_STATUSES = ["draft", "booked", "in_transit", "arrived", "clearing", "out_for_delivery", "delivered"] as const;
export const INVOICE_STATUSES = ["draft", "sent", "paid", "overdue", "void"] as const;
export const DECLARATION_STATUSES = ["draft", "submitted", "query", "amended", "released"] as const;
export const STAFF_ROLES = ["admin", "operations", "documentation", "customer_service"] as const;
export const CLIENT_TIERS = ["vip", "standard", "new"] as const;
export const CURRENCIES = ["USD", "GHS", "EUR", "GBP"] as const;
