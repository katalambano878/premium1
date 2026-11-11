// Database access on plain Postgres (fleet-postgres on big-vps) through the
// supabase-js compatible layer in src/lib/db. The names are kept so existing
// call sites work unchanged.
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/db/supabase-compat";
import { isPlainPostgres } from "@/lib/db/mode";

/**
 * Server client for admin pages. Runs as the database owner; access control is
 * the staff session checked in middleware, the admin layout and each action.
 * `auth.getUser()` reports the signed-in staff member.
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient | null> {
  if (!isPlainPostgres()) return null;
  return createClient() as unknown as SupabaseClient;
}

/** Service client for API routes and server actions (database owner). */
export function createServiceRoleClient(): SupabaseClient | null {
  if (!isPlainPostgres()) return null;
  return createClient() as unknown as SupabaseClient;
}
