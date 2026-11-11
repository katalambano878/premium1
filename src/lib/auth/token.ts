// Staff session token: a signed JWT in an httpOnly cookie. Shared by the
// middleware (edge runtime, signature only) and server code (which also
// re-checks the staff record on every request).
import { SignJWT, jwtVerify } from "jose";
import type { StaffRole } from "./roles";

export const SESSION_COOKIE = "p1_session";
export const SESSION_TTL_SEC = 60 * 60 * 12; // 12 hours

export interface SessionClaims {
  email: string;
  role: StaffRole;
}

function secret(): Uint8Array {
  const value = process.env.AUTH_JWT_SECRET;
  if (!value) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_JWT_SECRET must be set in production");
    return new TextEncoder().encode("dev-only-premium1-session-secret");
  }
  return new TextEncoder().encode(value);
}

export async function signSession(claims: SessionClaims): Promise<string> {
  return new SignJWT({ role: claims.role, typ: "staff" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.email)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SEC}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined | null): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (payload.typ !== "staff" || typeof payload.sub !== "string") return null;
    return { email: payload.sub, role: (payload.role as StaffRole) || "customer_service" };
  } catch {
    return null;
  }
}
