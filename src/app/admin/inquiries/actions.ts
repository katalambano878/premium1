"use server";

import { requireStaff } from "@/lib/auth/session";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";

export async function updateInquiryStatus(formData: FormData) {
  await requireStaff();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  await supabase.from("inquiries").update({ status, updated_at: new Date().toISOString() }).eq("id", id);

  await logActivity({ entityType: "inquiry", entityId: id, action: `changed status to ${status}` });

  // Trigger notifications on key status changes
  if (status === "quoted") {
    try {
      const { data: inq } = await supabase.from("inquiries").select("inquiry_no, email, full_name").eq("id", id).single();
      if (inq?.email) {
        const { sendTemplateNotification } = await import("@/lib/notify");
        await sendTemplateNotification({
          templateKey: "quote_ready",
          channel: "email",
          recipient: inq.email,
          payload: { inquiry_no: inq.inquiry_no, client_name: inq.full_name },
          supabase,
        });
      }
    } catch {
      // Notifications are optional
    }
  }

  revalidatePath(`/admin/inquiries/${id}`);
  revalidatePath("/admin/inquiries");
}

export async function assignInquiry(formData: FormData) {
  await requireStaff();
  const id = formData.get("id") as string;
  const assigned_to = formData.get("assigned_to") as string;
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  await supabase
    .from("inquiries")
    .update({ assigned_to: assigned_to || null, updated_at: new Date().toISOString() })
    .eq("id", id);
  await logActivity({ entityType: "inquiry", entityId: id, action: "assigned inquiry" });
  revalidatePath(`/admin/inquiries/${id}`);
}

export async function addInquiryNote(formData: FormData) {
  await requireStaff();
  const inquiry_id = formData.get("inquiry_id") as string;
  const body = formData.get("body") as string;
  const supabase = createServiceRoleClient();
  if (!supabase || !body?.trim()) return;

  await supabase.from("inquiry_notes").insert({ inquiry_id, body: body.trim() });
  await logActivity({ entityType: "inquiry", entityId: inquiry_id, action: "added note" });
  revalidatePath(`/admin/inquiries/${inquiry_id}`);
}

export async function setFollowUp(formData: FormData) {
  await requireStaff();
  const id = formData.get("id") as string;
  const follow_up_at = formData.get("follow_up_at") as string;
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  await supabase
    .from("inquiries")
    .update({ follow_up_at: follow_up_at || null, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath(`/admin/inquiries/${id}`);
}

export async function convertToShipment(formData: FormData) {
  await requireStaff();
  const id = formData.get("id") as string;
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const { data: inq } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .single();
  if (!inq) return;

  let clientId: string | null = null;
  if (inq.email) {
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("email", inq.email)
      .single();

    if (existing) {
      clientId = existing.id;
    } else {
      const { data: newClient } = await supabase
        .from("clients")
        .insert({
          company_name: inq.company_name || inq.full_name,
          contact_name: inq.full_name,
          email: inq.email,
          phone: inq.phone,
        })
        .select("id")
        .single();
      clientId = newClient?.id ?? null;
    }
  }

  if (!clientId) return;

  const { data: noRes } = await supabase.rpc("gen_shipment_no");
  const shipNo = (Array.isArray(noRes) ? noRes[0] : noRes) || `SHP-${Date.now()}`;

  const { data: shipment } = await supabase
    .from("shipments")
    .insert({
      shipment_no: shipNo,
      inquiry_id: inq.id,
      client_id: clientId,
      method: inq.method,
      origin: inq.origin,
      destination: inq.destination,
      cargo: inq.cargo || {},
      status: "draft",
      assigned_to: inq.assigned_to,
    })
    .select("id")
    .single();

  if (shipment) {
    await supabase.from("inquiries").update({ status: "won", updated_at: new Date().toISOString() }).eq("id", id);
    await supabase.from("shipment_events").insert({
      shipment_id: shipment.id,
      event_type: "created",
      message: `Shipment created from inquiry ${inq.inquiry_no}`,
    });
    await logActivity({ entityType: "inquiry", entityId: id, action: "converted to shipment", metadata: { shipment_id: shipment.id } });
    await logActivity({ entityType: "shipment", entityId: shipment.id, action: "created from inquiry", metadata: { inquiry_id: id } });
  }

  revalidatePath(`/admin/inquiries/${id}`);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/shipments");
}
