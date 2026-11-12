import { describe, expect, it } from "vitest";
import { isRateLimited } from "@/lib/rate-limit";
import { query } from "@/lib/db/pool";

describe("database rate limiter", () => {
  it("allows up to the limit, then blocks", async () => {
    const key = `t:${Date.now()}:a`;
    const results: boolean[] = [];
    for (let i = 0; i < 5; i++) results.push(await isRateLimited(key, 3, 60_000));
    expect(results).toEqual([false, false, false, true, true]);
  });

  it("counts each key separately", async () => {
    const a = `t:${Date.now()}:b`;
    const b = `t:${Date.now()}:c`;
    await isRateLimited(a, 1, 60_000);
    expect(await isRateLimited(a, 1, 60_000)).toBe(true);
    expect(await isRateLimited(b, 1, 60_000)).toBe(false);
  });

  it("stores counters in Postgres, so they survive a restart", async () => {
    const key = `t:${Date.now()}:d`;
    await isRateLimited(key, 10, 60_000);
    await isRateLimited(key, 10, 60_000);
    const { rows } = await query<{ count: number }>("SELECT count FROM rate_limits WHERE key = $1", [key]);
    expect(rows[0].count).toBe(2);
  });

  it("counts correctly under concurrent requests", async () => {
    const key = `t:${Date.now()}:e`;
    const results = await Promise.all(Array.from({ length: 20 }, () => isRateLimited(key, 10, 60_000)));
    expect(results.filter((blocked) => !blocked)).toHaveLength(10);
  });
});
