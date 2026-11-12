import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST as login } from "@/app/api/admin/login/route";
import { POST as logout } from "@/app/api/admin/logout/route";
import { POST as requestReset } from "@/app/api/admin/password/request/route";
import { POST as resetPassword } from "@/app/api/admin/password/reset/route";
import { getSessionUser, requireStaff } from "@/lib/auth/session";
import { SESSION_COOKIE, signSession } from "@/lib/auth/token";
import { query } from "@/lib/db/pool";
import { middleware } from "../middleware";
import { testCookies } from "./stubs/next-headers";
import { createStaff, freshIp, jsonRequest } from "./helpers";
import { sentEmails } from "./setup";

const PASSWORD = "harbour-crane-42";

async function setPasswordFor(email: string, password = PASSWORD) {
  await requestReset(jsonRequest("/api/admin/password/request", { email }));
  const mail = sentEmails.find((m) => m.to[0] === email);
  const token = mail?.plain_body.match(/token=([^\s&]+)/)?.[1];
  expect(token, "reset email should contain a link").toBeTruthy();
  const res = await resetPassword(jsonRequest("/api/admin/password/reset", { token: decodeURIComponent(token!), password }));
  return { res, token: decodeURIComponent(token!) };
}

describe("staff password and sign-in", () => {
  it("sets a password from the emailed link, then signs in", async () => {
    const email = `admin-${Date.now()}@premium1logistics.com`;
    await createStaff(email, "admin");
    const { res } = await setPasswordFor(email);
    expect(res.status).toBe(200);

    const { rows } = await query("SELECT password_hash FROM staff_credentials WHERE email = $1", [email]);
    expect(rows[0].password_hash).toMatch(/^\$2[aby]\$12\$/);
    expect(rows[0].password_hash).not.toContain(PASSWORD);

    const signIn = await login(jsonRequest("/api/admin/login", { email: email.toUpperCase(), password: PASSWORD }));
    expect(signIn.status).toBe(200);
    expect(testCookies.get(SESSION_COOKIE)).toBeTruthy();
    expect(await getSessionUser()).toMatchObject({ email, role: "admin" });

    await logout();
    expect(testCookies.get(SESSION_COOKIE)).toBeUndefined();
    await expect(requireStaff()).rejects.toThrow();
  });

  it("refuses a wrong password, and an unknown email the same way", async () => {
    const email = `ops-${Date.now()}@premium1logistics.com`;
    await createStaff(email, "operations");
    await setPasswordFor(email);
    const wrong = await login(jsonRequest("/api/admin/login", { email, password: "not-the-password" }));
    const unknown = await login(jsonRequest("/api/admin/login", { email: "nobody@premium1logistics.com", password: PASSWORD }));
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(await wrong.json()).toEqual(await unknown.json());
    expect(testCookies.get(SESSION_COOKIE)).toBeUndefined();
  });

  it("makes reset links single-use and rejects short passwords", async () => {
    const email = `docs-${Date.now()}@premium1logistics.com`;
    await createStaff(email, "documentation");
    const { token } = await setPasswordFor(email);
    const reuse = await resetPassword(jsonRequest("/api/admin/password/reset", { token, password: "another-password-1" }));
    expect(reuse.status).toBe(400);

    await requestReset(jsonRequest("/api/admin/password/request", { email }));
    const fresh = sentEmails.filter((m) => m.to[0] === email).pop()!.plain_body.match(/token=([^\s&]+)/)![1];
    const short = await resetPassword(jsonRequest("/api/admin/password/reset", { token: decodeURIComponent(fresh), password: "short" }));
    expect(short.status).toBe(400);
  });

  it("rejects expired reset links", async () => {
    const email = `exp-${Date.now()}@premium1logistics.com`;
    await createStaff(email);
    await requestReset(jsonRequest("/api/admin/password/request", { email }));
    await query("UPDATE staff_password_tokens SET expires_at = NOW() - interval '1 minute' WHERE email = $1", [email]);
    const token = decodeURIComponent(sentEmails[0].plain_body.match(/token=([^\s&]+)/)![1]);
    expect((await resetPassword(jsonRequest("/api/admin/password/reset", { token, password: PASSWORD }))).status).toBe(400);
  });

  it("answers reset requests identically for unknown emails and sends nothing", async () => {
    const res = await requestReset(jsonRequest("/api/admin/password/request", { email: "stranger@example.com" }));
    expect(await res.json()).toEqual({ success: true });
    expect(sentEmails).toHaveLength(0);
  });

  it("sends at most three reset emails per account per hour", async () => {
    const email = `flood-${Date.now()}@premium1logistics.com`;
    await createStaff(email);
    for (let i = 0; i < 5; i++) await requestReset(jsonRequest("/api/admin/password/request", { email }));
    expect(sentEmails.filter((m) => m.to[0] === email)).toHaveLength(3);
  });

  it("locks out deactivated staff, even with a valid session cookie", async () => {
    const email = `gone-${Date.now()}@premium1logistics.com`;
    await createStaff(email, "operations");
    await setPasswordFor(email);
    expect((await login(jsonRequest("/api/admin/login", { email, password: PASSWORD }))).status).toBe(200);
    await query("UPDATE staff_users SET is_active = false WHERE email = $1", [email]);
    expect(await getSessionUser()).toBeNull();
    expect((await login(jsonRequest("/api/admin/login", { email, password: PASSWORD }))).status).toBe(401);
  });

  it("limits sign-in attempts per account across many addresses", async () => {
    const email = `target-${Date.now()}@premium1logistics.com`;
    await createStaff(email);
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) statuses.push((await login(jsonRequest("/api/admin/login", { email, password: "guess" }, freshIp()))).status);
    expect(statuses.slice(0, 10).every((s) => s === 401)).toBe(true);
    expect(statuses[10]).toBe(429);
  });
});

describe("admin route protection (middleware)", () => {
  const visit = async (path: string, role?: string) => {
    const req = new NextRequest(`https://premium1logistics.com${path}`);
    if (role) req.cookies.set(SESSION_COOKIE, await signSession({ email: "x@premium1logistics.com", role: role as never }));
    return middleware(req);
  };
  const location = (res: Response) => (res.headers.get("location") ? new URL(res.headers.get("location")!).pathname : null);

  it("sends visitors without a session to sign-in", async () => {
    const res = await visit("/admin/finance");
    expect(location(res)).toBe("/auth/admin");
    expect(new URL(res.headers.get("location")!).searchParams.get("next")).toBe("/admin/finance");
  });

  it("rejects a forged cookie", async () => {
    const req = new NextRequest("https://premium1logistics.com/admin");
    req.cookies.set(SESSION_COOKIE, "eyJhbGciOiJub25lIn0.eyJzdWIiOiJ4Iiwicm9sZSI6ImFkbWluIiwidHlwIjoic3RhZmYifQ.");
    expect(location(await middleware(req))).toBe("/auth/admin");
  });

  it.each([
    ["customer_service", "/admin/finance", "/admin"],
    ["customer_service", "/admin/shipments", "/admin"],
    ["documentation", "/admin/inquiries", "/admin"],
    ["operations", "/admin/staff", "/admin"],
  ])("keeps %s out of %s", async (role, path, to) => {
    expect(location(await visit(path, role))).toBe(to);
  });

  it("lets each role open the areas it needs, marked no-store and noindex", async () => {
    for (const [role, path] of [
      ["admin", "/admin/staff"],
      ["operations", "/admin/shipments"],
      ["documentation", "/admin/customs"],
      ["customer_service", "/admin/inquiries"],
    ]) {
      const res = await visit(path, role);
      expect(location(res), `${role} -> ${path}`).toBeNull();
      expect(res.headers.get("cache-control")).toBe("no-store");
      expect(res.headers.get("x-robots-tag")).toContain("noindex");
    }
  });
});

it("keeps freshIp unique", () => {
  expect(freshIp()).not.toBe(freshIp());
});
