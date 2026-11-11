// Transactional email through the Postal server on big-vps
// (https://postal.zoepayhub.com), Premium 1's own mail server and domain.
// Bodies are plain text; an escaped HTML copy is generated for mail clients.

const POSTAL_API_URL = (process.env.POSTAL_API_URL || "https://postal.zoepayhub.com").replace(/\/+$/, "");

export interface EmailOptions {
  replyTo?: string;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function htmlFromText(text: string): string {
  const linked = escapeHtml(text).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
  const paragraphs = linked
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#0b1f3a;font-size:15px;line-height:1.55"><div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:28px">${paragraphs}</div></body></html>`;
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  opts: EmailOptions = {},
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.POSTAL_API_KEY;
  if (!apiKey) {
    console.warn("[email] POSTAL_API_KEY not configured; email not sent:", { to, subject });
    return { success: false, error: "Email not configured" };
  }
  const from = process.env.EMAIL_FROM || "Premium 1 Logistics <noreply@premium1logistics.com>";
  const text = body.replace(/\\n/g, "\n");
  try {
    const res = await fetch(`${POSTAL_API_URL}/api/v1/send/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Server-API-Key": apiKey },
      body: JSON.stringify({
        to: [to],
        from,
        subject,
        plain_body: text,
        html_body: htmlFromText(text),
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.status !== "success") {
      const error = data?.data?.message || `Postal HTTP ${res.status}`;
      console.error("[email] send failed:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Unknown error";
    console.error("[email] send error:", error);
    return { success: false, error };
  }
}
