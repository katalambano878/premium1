"use server";

import { requireStaff } from "@/lib/auth/session";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createStaff(formData: FormData) {
  const me = await requireStaff();
  if (me.role !== "admin") throw new Error("Only admins can manage staff");
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  await supabase.from("staff_users").insert({
    full_name: formData.get("full_name") as string,
    email: formData.get("email") as string,
    role: formData.get("role") as string,
    is_active: true,
  });

  revalidatePath("/admin/staff");
}

export async function updateStaffRole(formData: FormData) {
  const me = await requireStaff();
  if (me.role !== "admin") throw new Error("Only admins can manage staff");
  const id = formData.get("id") as string;
  const role = formData.get("role") as string;
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  await supabase
    .from("staff_users")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/staff");
}

export async function toggleStaffActive(formData: FormData) {
  const me = await requireStaff();
  if (me.role !== "admin") throw new Error("Only admins can manage staff");
  const id = formData.get("id") as string;
  const is_active = formData.get("is_active") === "true";
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  await supabase
    .from("staff_users")
    .update({ is_active: !is_active, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/staff");
}
