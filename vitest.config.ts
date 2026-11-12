import path from "node:path";
import { defineConfig } from "vitest/config";

// Integration tests run the real route handlers against a real Postgres.
// Locally that is a throwaway `premium1_test` database on the Homebrew server;
// in GitHub Actions it is a Postgres service container (TEST_DATABASE_URL).
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "tests/stubs/empty.ts"),
      "next/headers": path.resolve(__dirname, "tests/stubs/next-headers.ts"),
      "next/cache": path.resolve(__dirname, "tests/stubs/next-cache.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/global-setup.ts"],
    setupFiles: ["tests/setup.ts"],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 60000,
  },
});
