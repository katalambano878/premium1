// Shared validation for the public forms.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isEmail = (v: unknown): v is string => typeof v === "string" && v.length <= 200 && EMAIL_RE.test(v.trim());

/** Trimmed string, capped in length; empty becomes "". */
export const clean = (v: unknown, max = 500): string => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Staff inboxes that receive form alerts (NOTIFY_STAFF_EMAIL, comma-separated). */
export function staffRecipients(): string[] {
  return (process.env.NOTIFY_STAFF_EMAIL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(isEmail);
}
