import "server-only";
import { query } from "@/lib/db/pool";

// Fixed-window rate limits stored in Postgres (table rate_limits), so they
// survive deploys. If the database is unreachable we fall back to an
// in-memory counter rather than blocking real visitors.
const memory = new Map<string, { count: number; resetAt: number }>();

/**
 * The visitor's IP. Traefik (Coolify's proxy) sets X-Real-IP to the address it
 * received the connection from, which a visitor cannot forge; the left-most
 * X-Forwarded-For entry can be, so it is only a fallback.
 */
export function clientIp(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",").pop()?.trim() : "") || "unknown";
}

function memoryLimited(key: string, limit: number, windowMs: number, now: number): boolean {
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    if (memory.size > 5000) memory.clear();
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

/** Counts one attempt for `key`; true when the caller is over `limit` attempts per `windowMs`. */
export async function isRateLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs);
  const expiresAt = new Date(windowStart.getTime() + windowMs);
  try {
    const { rows } = await query<{ count: number }>(
      `INSERT INTO rate_limits (key, window_start, count, expires_at)
       VALUES ($1, $2, 1, $3)
       ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1
       RETURNING count`,
      [key, windowStart, expiresAt],
    );
    // Roughly one request in fifty clears out expired windows.
    if (Math.random() < 0.02) {
      query("DELETE FROM rate_limits WHERE expires_at < NOW()").catch(() => {});
    }
    return Number(rows[0]?.count ?? 0) > limit;
  } catch (e) {
    console.error("[rate-limit] database unavailable, using memory", e);
    return memoryLimited(key, limit, windowMs, now);
  }
}
