import { NextResponse } from "next/server";
import { MIN_PASSWORD_LENGTH, resetPasswordWithToken } from "@/lib/auth/passwords";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (isRateLimited(`pwset:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }
  const body = await request.json().catch(() => ({}));
  const token = String(body.token || "");
  const password = String(body.password || "");
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json({ error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` }, { status: 400 });
  }
  const email = token ? await resetPasswordWithToken(token, password) : null;
  if (!email) {
    return NextResponse.json({ error: "This link has expired or was already used. Ask for a new one." }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
