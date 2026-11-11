import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/token";

// Admin routes each role may not open (mirrors src/lib/auth/roles.ts).
const ROLE_BLOCKED: Record<string, string[]> = {
  admin: [],
  operations: ["/admin/staff", "/admin/settings"],
  documentation: ["/admin/staff", "/admin/settings", "/admin/inquiries", "/admin/finance"],
  customer_service: ["/admin/staff", "/admin/settings", "/admin/shipments", "/admin/customs", "/admin/finance"],
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  // Sign-in pages: send signed-in staff straight to the dashboard.
  if (path.startsWith("/auth/admin")) {
    if (session && path === "/auth/admin") return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!session) {
    const login = new URL("/auth/admin", request.url);
    if (path !== "/admin") login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  const blocked = ROLE_BLOCKED[session.role] ?? ["/admin/"];
  if (blocked.some((r) => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/auth/admin", "/auth/admin/:path*"],
};
