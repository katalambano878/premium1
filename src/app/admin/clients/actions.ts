"use server";

import { requireStaff } from "@/lib/auth/session";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";

export async function updateClient(formData: FormData) {
  await requireStaff();
  const id = formData.get("id") as string;
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  await supabase
    .from("clients")
    .update({
      company_name: formData.get("company_name") as string,
      contact_name: formData.get("contact_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: (formData.get("address") as string) || null,
      notes: (formData.get("notes") as string) || null,
      tier: (formData.get("tier") as string) || "standard",
      industry: (formData.get("industry") as string) || null,
      credit_limit: Number(formData.get("credit_limit")) || null,
      payment_terms: (formData.get("payment_terms") as string) || "net_30",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  await logActivity({
    entityType: "client",
    entityId: id,
    action: "updated client",
    metadata: { company: formData.get("company_name") as string },
  });

  revalidatePath(`/admin/clients/${id}`);
  revalidatePath("/admin/clients");
}

export async function addClientNote(formData: FormData) {
  await requireStaff();
  const client_id = formData.get("client_id") as string;
  const body = formData.get("body") as string;
  const supabase = createServiceRoleClient();
  if (!supabase || !body?.trim()) return;

  await supabase.from("client_notes").insert({ client_id, body: body.trim() });

  await logActivity({
    entityType: "client",
    entityId: client_id,
    action: "added note",
  });

  revalidatePath(`/admin/clients/${client_id}`);
}

export async function createClient(formData: FormData) {
  await requireStaff();
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const { data } = await supabase
    .from("clients")
    .insert({
      company_name: formData.get("company_name") as string,
      contact_name: formData.get("contact_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: (formData.get("address") as string) || null,
      tier: (formData.get("tier") as string) || "new",
      industry: (formData.get("industry") as string) || null,
      credit_limit: Number(formData.get("credit_limit")) || null,
      payment_terms: (formData.get("payment_terms") as string) || "net_30",
    })
    .select("id")
    .single();

  await logActivity({
    entityType: "client",
    entityId: data?.id,
    action: "created client",
    metadata: { company: formData.get("company_name") as string },
  });

  revalidatePath("/admin/clients");
}
