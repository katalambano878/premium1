"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity";
import { CLIENT_TIERS, ensure, id, num, oneOf, text } from "@/lib/admin-form";
import { isEmail } from "@/lib/forms";
import { createServiceRoleClient } from "@/lib/supabase/server";

const PAYMENT_TERMS = ["prepaid", "net_15", "net_30", "net_60"] as const;

function clientFields(formData: FormData, defaultTier: (typeof CLIENT_TIERS)[number]) {
  const company_name = text(formData, "company_name", 200);
  const contact_name = text(formData, "contact_name", 200);
  const email = text(formData, "email", 200);
  const phone = text(formData, "phone", 40);
  if (!company_name || !contact_name || !phone) throw new Error("Company, contact name and phone are required.");
  if (!email || !isEmail(email)) throw new Error("Enter a valid email address.");
  const creditLimit = num(formData, "credit_limit");
  if (creditLimit !== null && creditLimit < 0) throw new Error("The credit limit cannot be negative.");
  return {
    company_name,
    contact_name,
    email: email.toLowerCase(),
    phone,
    address: text(formData, "address", 500),
    tier: formData.get("tier") ? oneOf(formData, "tier", CLIENT_TIERS) : defaultTier,
    industry: text(formData, "industry", 120),
    credit_limit: creditLimit,
    payment_terms: formData.get("payment_terms") ? oneOf(formData, "payment_terms", PAYMENT_TERMS) : "net_30",
  };
}

export async function updateClient(formData: FormData) {
  await requireRole("clients");
  const clientId = id(formData);
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const fields = clientFields(formData, "standard");
  ensure(
    await supabase
      .from("clients")
      .update({ ...fields, notes: text(formData, "notes"), updated_at: new Date().toISOString() })
      .eq("id", clientId),
    "save the client",
  );

  await logActivity({ entityType: "client", entityId: clientId, action: "updated client", metadata: { company: fields.company_name } });
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/clients");
}

export async function addClientNote(formData: FormData) {
  const me = await requireRole("clients");
  const client_id = id(formData, "client_id");
  const body = text(formData, "body");
  const supabase = createServiceRoleClient();
  if (!supabase || !body) return;

  ensure(await supabase.from("client_notes").insert({ client_id, body, author_id: me.id }), "add the note");
  await logActivity({ entityType: "client", entityId: client_id, action: "added note" });
  revalidatePath(`/admin/clients/${client_id}`);
}

export async function createClient(formData: FormData) {
  await requireRole("clients");
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const fields = clientFields(formData, "new");
  const { data } = ensure(await supabase.from("clients").insert(fields).select("id").single(), "create the client");

  await logActivity({ entityType: "client", entityId: data?.id, action: "created client", metadata: { company: fields.company_name } });
  revalidatePath("/admin/clients");
  return data?.id as string | undefined;
}
