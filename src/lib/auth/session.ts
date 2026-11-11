import "server-only";
import { cookies } from "next/headers";
import { query } from "@/lib/db/pool";
import type { StaffRole } from "./roles";
import { SESSION_COOKIE, SESSION_TTL_SEC, signSession, verifySession } from "./token";

export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
}

/** The signed-in, still-active staff member for this request, or null. */
export async function getSessionUser(): Promise<StaffUser | null> {
  const store = await cookies();
  const claims = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!claims) return null;
  const { rows } = await query<{ id: string; email: string; full_name: string; role: StaffRole }>(
    "SELECT id, email, full_name, role FROM staff_users WHERE lower(email) = lower($1) AND is_active = true",
    [claims.email],
  );
  const row = rows[0];
  return row ? { id: row.id, email: row.email, fullName: row.full_name, role: row.role } : null;
}

/** Throws unless a signed-in, active staff member made this request. */
export async function requireStaff(): Promise<StaffUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Not signed in");
  return user;
}

export async function setSessionCookie(email: string, role: StaffRole) {
  const token = await signSession({ email, role });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SEC,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
