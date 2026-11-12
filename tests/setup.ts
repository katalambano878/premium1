import { afterEach, beforeEach, vi } from "vitest";
import { testCookies } from "./stubs/next-headers";

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || "postgresql:///premium1_test?host=/tmp";
process.env.AUTH_JWT_SECRET = "test-secret-at-least-32-characters-long!!";
process.env.POSTAL_API_KEY = "test-postal-key";
process.env.POSTAL_API_URL = "https://postal.test";
process.env.NOTIFY_STAFF_EMAIL = "staff@premium1logistics.com";
process.env.NEXT_PUBLIC_APP_URL = "https://premium1logistics.com";

/** Every email the app tried to send through Postal during the current test. */
export const sentEmails: Array<{ to: string[]; subject: string; plain_body: string; reply_to?: string }> = [];

beforeEach(() => {
  sentEmails.length = 0;
  testCookies.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (String(url).startsWith("https://postal.test/")) {
        sentEmails.push(JSON.parse(String(init?.body)));
        return new Response(JSON.stringify({ status: "success", data: { message_id: "test" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`Unexpected network call in a test: ${url}`);
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});
