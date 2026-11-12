// Small helpers shared by the shipments, customs and documents screens.

export const SHIPMENT_STAGES = ["draft", "booked", "in_transit", "arrived", "clearing", "out_for_delivery", "delivered"] as const;
export const DECLARATION_STAGES = ["draft", "submitted", "query", "amended", "released"] as const;

export const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

/** A search box value from the URL: trimmed, capped, never an array. */
export const cleanQuery = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim().slice(0, 100) : "");

/** Turns what staff typed into a safe ILIKE pattern (wildcards in the text are matched literally). */
export const likePattern = (q: string) => `%${q.replace(/[\\%_]/g, "\\$&")}%`;

const METHODS: Record<string, string> = { sea: "Sea", air: "Air", road: "Road", multimodal: "Multimodal" };
export const methodLabel = (m: string | null | undefined) =>
  m ? METHODS[m] || m.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()) : "";

/** Builds a list URL from its filters, leaving out the empty ones. */
export function listHref(base: string, params: Record<string, string | null | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Whole days from today until a date (negative when it has passed). */
export function daysUntil(date: string | null | undefined): number | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  const a = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const b = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((a - b) / 86_400_000);
}
