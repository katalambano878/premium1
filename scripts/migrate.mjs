// Applies db/migrations/*.sql in order, once each, at container start.
// Uses DIRECT_URL (straight to Postgres) when set: PgBouncer's transaction
// pooling breaks the advisory lock below.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.log("[migrate] DATABASE_URL not set; skipping migrations");
  process.exit(0);
}

const dir = path.join(process.cwd(), "db", "migrations");
if (!existsSync(dir)) {
  console.log("[migrate] no db/migrations folder; skipping");
  process.exit(0);
}

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query("SELECT pg_advisory_lock(764120931)");
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  const done = new Set((await client.query("SELECT name FROM schema_migrations")).rows.map((r) => r.name));
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    if (done.has(file)) continue;
    const sql = readFileSync(path.join(dir, file), "utf8");
    console.log(`[migrate] applying ${file}`);
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw new Error(`${file}: ${e.message}`);
    }
  }
  console.log("[migrate] up to date");
} finally {
  await client.query("SELECT pg_advisory_unlock(764120931)").catch(() => {});
  await client.end();
}
