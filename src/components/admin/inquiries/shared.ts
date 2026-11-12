// Small helpers shared by the enquiry list and detail pages.

export const PRIORITIES = ["urgent", "high", "medium", "low"] as const;

const METHOD_LABEL: Record<string, string> = {
  sea: "Sea freight",
  air: "Air freight",
  road: "Road freight",
};

export const methodLabel = (method: string | null | undefined) =>
  method ? METHOD_LABEL[method] || method.replace(/^./, (c) => c.toUpperCase()) : "";

/** A follow-up is overdue once its time has passed and the enquiry is still open. */
export function isOverdue(followUpAt: string | null | undefined, status: string | null | undefined) {
  if (!followUpAt || status === "won" || status === "lost") return false;
  const t = new Date(followUpAt).getTime();
  return !Number.isNaN(t) && t < Date.now();
}

/** Builds /admin/inquiries with whichever filters are set. */
export function inquiriesHref(filters: { status?: string; priority?: string; q?: string }) {
  const p = new URLSearchParams();
  if (filters.status) p.set("status", filters.status);
  if (filters.priority) p.set("priority", filters.priority);
  if (filters.q) p.set("q", filters.q);
  const qs = p.toString();
  return qs ? `/admin/inquiries?${qs}` : "/admin/inquiries";
}
