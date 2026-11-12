import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/token";
import { canAccess } from "@/lib/auth/roles";

// Which dashboard section a path belongs to; access comes from ROLE_PERMISSIONS
// in roles.ts, the same table the server actions check.
const SECTIONS = ["inquiries", "shipments", "customs", "documents", "clients", "finance", "staff", "settings"];
const sectionOf = (path: string) => SECTIONS.find((s) => path === `/admin/${s}` || path.startsWith(`/admin/${s}/`));

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

  const section = sectionOf(path);
  if (section && !canAccess(session.role, section)) {
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
