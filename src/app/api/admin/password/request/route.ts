import { NextResponse } from "next/server";
import { createResetToken } from "@/lib/auth/passwords";
import { sendEmail } from "@/lib/notify/emailProvider";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/site-url";

// Always answers the same way, so it cannot be used to discover staff emails.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim();
  const ok = NextResponse.json({ success: true });
  if (!email || isRateLimited(`pwreset:${clientIp(request)}`, 5, 15 * 60 * 1000)) return ok;
  try {
    const result = await createResetToken(email);
    if (!result) return ok;
    const link = `${siteUrl()}/auth/admin/reset?token=${encodeURIComponent(result.token)}`;
    await sendEmail(
      result.email,
      "Set your Premium 1 dashboard password",
      `Hello ${result.fullName},\n\nUse this link to set your password for the Premium 1 Logistics dashboard. It works once and expires in one hour:\n\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
    );
  } catch (e) {
    console.error("[password request]", e);
  }
  return ok;
}
