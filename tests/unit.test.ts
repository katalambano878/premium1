import { describe, expect, it } from "vitest";
import { clean, isEmail, staffRecipients } from "@/lib/forms";
import { signSession, verifySession } from "@/lib/auth/token";
import { clientIp } from "@/lib/rate-limit";

describe("form helpers", () => {
  it("accepts real emails and rejects junk", () => {
    expect(isEmail("ama@example.com")).toBe(true);
    expect(isEmail(" ama@mensah.com.gh ")).toBe(true);
    for (const bad of ["", "ama", "ama@", "@x.com", "a b@x.com", "ama@x.c", 42, null, `${"a".repeat(200)}@x.com`]) {
      expect(isEmail(bad)).toBe(false);
    }
  });

  it("trims and caps strings, and turns non-strings into empty", () => {
    expect(clean("  hello  ")).toBe("hello");
    expect(clean("abcdef", 3)).toBe("abc");
    expect(clean({ evil: true })).toBe("");
    expect(clean(undefined)).toBe("");
  });

  it("reads staff alert recipients and drops invalid ones", () => {
    process.env.NOTIFY_STAFF_EMAIL = "a@premium1logistics.com, nope ,b@premium1logistics.com";
    expect(staffRecipients()).toEqual(["a@premium1logistics.com", "b@premium1logistics.com"]);
    process.env.NOTIFY_STAFF_EMAIL = "staff@premium1logistics.com";
  });
});

describe("visitor IP", () => {
  const req = (h: Record<string, string>) => new Request("https://x.test", { headers: h });
  it("prefers X-Real-IP, which the proxy sets and visitors cannot forge", () => {
    expect(clientIp(req({ "x-real-ip": "1.2.3.4", "x-forwarded-for": "9.9.9.9, 1.2.3.4" }))).toBe("1.2.3.4");
  });
  it("falls back to the proxy-appended (last) X-Forwarded-For entry", () => {
    expect(clientIp(req({ "x-forwarded-for": "6.6.6.6, 5.5.5.5" }))).toBe("5.5.5.5");
  });
});

describe("staff session token", () => {
  it("round-trips the email and role", async () => {
    const token = await signSession({ email: "ops@premium1logistics.com", role: "operations" });
    expect(await verifySession(token)).toEqual({ email: "ops@premium1logistics.com", role: "operations" });
  });

  it("rejects tampered, foreign and empty tokens", async () => {
    const token = await signSession({ email: "ops@premium1logistics.com", role: "operations" });
    const [h, p, s] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ sub: "ops@premium1logistics.com", role: "admin", typ: "staff" })).toString("base64url");
    expect(await verifySession(`${h}.${forged}.${s}`)).toBeNull();
    expect(await verifySession(`${h}.${p}.${s.slice(0, -2)}xx`)).toBeNull();
    expect(await verifySession("not-a-jwt")).toBeNull();
    expect(await verifySession(undefined)).toBeNull();
  });
});
