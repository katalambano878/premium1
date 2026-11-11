"use server";

import { requireStaff } from "@/lib/auth/session";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";

const SHIP_STATUSES = ["draft", "booked", "in_transit", "arrived", "clearing", "out_for_delivery", "delivered"];

export async function updateShipmentStatus(formData: FormData) {
  await requireStaff();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  if (!SHIP_STATUSES.includes(status)) return;

  const supabase = createServiceRoleClient();
  if (!supabase) return;

  await supabase.from("shipments").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  await supabase.from("shipment_events").insert({
    shipment_id: id,
    event_type: "status_change",
    message: `Status changed to ${status.replace(/_/g, " ")}`,
  });

  // Trigger automated notifications on key status changes
  try {
    const { data: ship } = await supabase
      .from("shipments")
      .select("shipment_no, clients(email, contact_name, phone)")
      .eq("id", id)
      .single();

    if (ship?.clients) {
      const raw = ship.clients as unknown;
      const client = (Array.isArray(raw) ? raw[0] : raw) as Record<string, string> | null;
      if (client) {
        const { sendTemplateNotification } = await import("@/lib/notify");
        const payload = {
          shipment_no: ship.shipment_no,
          client_name: client.contact_name || "",
          status: status.replace(/_/g, " "),
        };

        const NOTIFY_MAP: Record<string, { key: string; sms?: boolean }> = {
          in_transit: { key: "shipment_dispatched", sms: true },
          arrived: { key: "shipment_arrived" },
          delivered: { key: "shipment_delivered", sms: true },
        };

        const trigger = NOTIFY_MAP[status];
        if (trigger && client.email) {
          await sendTemplateNotification({
            templateKey: trigger.key,
            channel: "email",
            recipient: client.email,
            payload,
            supabase,
          });
          if (trigger.sms && client.phone) {
            await sendTemplateNotification({
              templateKey: trigger.key,
              channel: "sms",
              recipient: client.phone,
              payload,
              supabase,
            });
          }
        }
      }
    }
  } catch {
    // Notifications are optional
  }

  await logActivity({ entityType: "shipment", entityId: id, action: `changed status to ${status}` });
  revalidatePath(`/admin/shipments/${id}`);
  revalidatePath("/admin/shipments");
}

export async function assignShipment(formData: FormData) {
  await requireStaff();
  const id = formData.get("id") as string;
  const assigned_to = formData.get("assigned_to") as string;
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  await supabase
    .from("shipments")
    .update({ assigned_to: assigned_to || null, updated_at: new Date().toISOString() })
    .eq("id", id);
  await logActivity({ entityType: "shipment", entityId: id, action: "assigned shipment" });
  revalidatePath(`/admin/shipments/${id}`);
}

export async function addShipmentEvent(formData: FormData) {
  await requireStaff();
  const shipment_id = formData.get("shipment_id") as string;
  const body = formData.get("body") as string;
  const supabase = createServiceRoleClient();
  if (!supabase || !body?.trim()) return;

  await supabase.from("shipment_events").insert({
    shipment_id,
    event_type: "note",
    message: body.trim(),
  });
  revalidatePath(`/admin/shipments/${shipment_id}`);
}

export async function updateKeyDates(formData: FormData) {
  await requireStaff();
  const id = formData.get("id") as string;
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const key_dates: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (k.startsWith("date_") && v) {
      key_dates[k.replace("date_", "")] = v as string;
    }
  }

  await supabase.from("shipments").update({ key_dates, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath(`/admin/shipments/${id}`);
}

export async function updateShipmentNotes(formData: FormData) {
  await requireStaff();
  const id = formData.get("id") as string;
  const cost_notes = formData.get("cost_notes") as string;
  const service_notes = formData.get("service_notes") as string;
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  await supabase
    .from("shipments")
    .update({ cost_notes, service_notes, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath(`/admin/shipments/${id}`);
}

export async function createShipment(formData: FormData) {
  await requireStaff();
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const client_id = formData.get("client_id") as string;
  if (!client_id) return;

  const { data: noRes } = await supabase.rpc("gen_shipment_no");
  const shipNo = (Array.isArray(noRes) ? noRes[0] : noRes) || `SHP-${Date.now()}`;

  const { data: shipment } = await supabase
    .from("shipments")
    .insert({
      shipment_no: shipNo,
      client_id,
      method: (formData.get("method") as string) || "sea",
      origin: (formData.get("origin") as string) || "",
      destination: (formData.get("destination") as string) || "",
      cargo: {},
      status: "draft",
    })
    .select("id")
    .single();

  if (shipment) {
    await supabase.from("shipment_events").insert({
      shipment_id: shipment.id,
      event_type: "created",
      message: "Shipment created manually",
    });
    await logActivity({ entityType: "shipment", entityId: shipment.id, action: "created shipment" });
  }

  revalidatePath("/admin/shipments");
}
