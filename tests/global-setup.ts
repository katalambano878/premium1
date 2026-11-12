import { execFileSync } from "node:child_process";
import path from "node:path";
import pg from "pg";

// Creates an empty test database and runs the real migrations into it.
const DEFAULT_URL = "postgresql:///premium1_test?host=/tmp";

export default async function setup() {
  const url = process.env.TEST_DATABASE_URL || DEFAULT_URL;
  // Database name = the last path segment, before any ?query (works for
  // postgresql://user:pass@host:5432/db and postgresql:///db?host=/tmp alike).
  const dbName = url.split("?")[0].split("/").pop() || "";
  if (!/^[a-z0-9_]+$/.test(dbName) || !dbName.includes("test")) {
    throw new Error(`Refusing to reset "${dbName}": the test database name must contain "test".`);
  }

  const adminUrl = url.replace(`/${dbName}`, "/postgres");
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`);
  await admin.query(`CREATE DATABASE ${dbName}`);
  await admin.end();

  execFileSync("node", [path.resolve(__dirname, "../scripts/migrate.mjs")], {
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
  });

  process.env.DATABASE_URL = url;
}
