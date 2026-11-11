// Small in-memory rate limiter for public form endpoints (one app container).
const buckets = new Map<string, { count: number; resetAt: number }>();

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : request.headers.get("x-real-ip")) || "unknown";
}

/** Returns true when the caller is over `limit` requests per `windowMs` for this key. */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    if (buckets.size > 5000) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}
