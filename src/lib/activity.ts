import { createServiceRoleClient } from "@/lib/supabase/server";

export async function logActivity(opts: {
  entityType: string;
  entityId?: string;
  action: string;
  actorEmail?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = createServiceRoleClient();
    if (!supabase) return;
    let actor = opts.actorEmail;
    if (!actor) {
      const { getSessionUser } = await import("@/lib/auth/session");
      actor = (await getSessionUser().catch(() => null))?.email;
    }
    await supabase.from("activity_log").insert({
      entity_type: opts.entityType,
      entity_id: opts.entityId || null,
      action: opts.action,
      actor_email: actor || "system",
      metadata: opts.metadata || {},
    });
  } catch {
    // Non-critical — don't break the calling action
  }
}
