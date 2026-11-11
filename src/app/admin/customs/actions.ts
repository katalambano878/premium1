"use server";

import { requireStaff } from "@/lib/auth/session";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";

export async function createDeclaration(formData: FormData) {
  await requireStaff();
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const shipment_id = formData.get("shipment_id") as string;
  const { data } = await supabase
    .from("customs_declarations")
    .insert({
      shipment_id,
      declaration_no: (formData.get("declaration_no") as string) || null,
      status: "draft",
      notes: (formData.get("notes") as string) || null,
      duty_amount: Number(formData.get("duty_amount")) || null,
      tax_amount: Number(formData.get("tax_amount")) || null,
    })
    .select("id")
    .single();

  await logActivity({
    entityType: "customs",
    entityId: data?.id,
    action: "created customs declaration",
    metadata: { shipment_id },
  });

  revalidatePath("/admin/customs");
  return data?.id;
}

export async function updateDeclarationStatus(formData: FormData) {
  await requireStaff();
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "submitted") updates.submitted_at = new Date().toISOString();
  if (status === "released") updates.released_at = new Date().toISOString();

  await supabase.from("customs_declarations").update(updates).eq("id", id);

  await logActivity({
    entityType: "customs",
    entityId: id,
    action: `updated declaration status to ${status}`,
  });

  revalidatePath("/admin/customs");
  revalidatePath(`/admin/customs/${id}`);
}

export async function updateDeclarationDetails(formData: FormData) {
  await requireStaff();
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const id = formData.get("id") as string;

  let hsCodes: string[] = [];
  const raw = formData.get("hs_codes") as string;
  if (raw) {
    hsCodes = raw.split(",").map((s) => s.trim()).filter(Boolean);
  }

  await supabase
    .from("customs_declarations")
    .update({
      declaration_no: (formData.get("declaration_no") as string) || null,
      hs_codes: hsCodes,
      duty_amount: Number(formData.get("duty_amount")) || null,
      tax_amount: Number(formData.get("tax_amount")) || null,
      notes: (formData.get("notes") as string) || null,
      query_details: (formData.get("query_details") as string) || null,
      query_deadline: (formData.get("query_deadline") as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  await logActivity({
    entityType: "customs",
    entityId: id,
    action: "updated declaration details",
  });

  revalidatePath(`/admin/customs/${id}`);
  revalidatePath("/admin/customs");
}
