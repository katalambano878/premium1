import { NextResponse } from "next/server";
import { verifyStaffPassword } from "@/lib/auth/passwords";
import { setSessionCookie } from "@/lib/auth/session";
import type { StaffRole } from "@/lib/auth/roles";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (isRateLimited(`login:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim();
  const password = String(body.password || "");
  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }
  try {
    const staff = await verifyStaffPassword(email, password);
    if (!staff) {
      return NextResponse.json({ error: "That email and password do not match an active staff account." }, { status: 401 });
    }
    await setSessionCookie(staff.email, staff.role as StaffRole);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin login]", e);
    return NextResponse.json({ error: "Sign-in is unavailable right now." }, { status: 500 });
  }
}
