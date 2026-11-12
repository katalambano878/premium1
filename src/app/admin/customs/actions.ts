"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";
import { DECLARATION_STATUSES, ensure, id, num, oneOf, text } from "@/lib/admin-form";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function createDeclaration(formData: FormData) {
  await requireRole("customs");
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const shipment_id = id(formData, "shipment_id");
  const { data } = ensure(
    await supabase
      .from("customs_declarations")
      .insert({
        shipment_id,
        declaration_no: text(formData, "declaration_no", 100),
        status: "draft",
        notes: text(formData, "notes"),
        duty_amount: num(formData, "duty_amount"),
        tax_amount: num(formData, "tax_amount"),
      })
      .select("id")
      .single(),
    "create the declaration",
  );

  await logActivity({ entityType: "customs", entityId: data?.id, action: "created customs declaration", metadata: { shipment_id } });
  revalidatePath("/admin/customs");
  return data?.id;
}

export async function updateDeclarationStatus(formData: FormData) {
  await requireRole("customs");
  const declId = id(formData);
  const status = oneOf(formData, "status", DECLARATION_STATUSES);
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "submitted") updates.submitted_at = new Date().toISOString();
  if (status === "released") updates.released_at = new Date().toISOString();
  ensure(await supabase.from("customs_declarations").update(updates).eq("id", declId), "update the declaration status");

  await logActivity({ entityType: "customs", entityId: declId, action: `updated declaration status to ${status}` });
  revalidatePath("/admin/customs");
  revalidatePath(`/admin/customs/${declId}`);
  revalidatePath("/admin");
}

export async function updateDeclarationDetails(formData: FormData) {
  await requireRole("customs");
  const declId = id(formData);
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const raw = text(formData, "hs_codes", 2000);
  const updates: Record<string, unknown> = {
    declaration_no: text(formData, "declaration_no", 100),
    hs_codes: raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [],
    duty_amount: num(formData, "duty_amount"),
    tax_amount: num(formData, "tax_amount"),
    notes: text(formData, "notes"),
    updated_at: new Date().toISOString(),
  };
  // The query fields are only on the form while a declaration is under query.
  // Leave them alone otherwise, so the query history survives later saves.
  if (formData.has("query_details")) updates.query_details = text(formData, "query_details");
  if (formData.has("query_deadline")) updates.query_deadline = text(formData, "query_deadline", 10);

  ensure(await supabase.from("customs_declarations").update(updates).eq("id", declId), "save the declaration");

  await logActivity({ entityType: "customs", entityId: declId, action: "updated declaration details" });
  revalidatePath(`/admin/customs/${declId}`);
  revalidatePath("/admin/customs");
}
