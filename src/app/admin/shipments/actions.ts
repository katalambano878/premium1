"use server";

import { requireRole } from "@/lib/auth/session";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";
import { SHIPMENT_STATUSES, ensure, id as idField, oneOf, text } from "@/lib/admin-form";

const METHODS = ["sea", "air", "road"] as const;

export async function updateShipmentStatus(formData: FormData) {
  const me = await requireRole("shipments");
  const id = idField(formData);
  const status = oneOf(formData, "status", SHIPMENT_STATUSES);

  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const { data: before } = await supabase.from("shipments").select("status").eq("id", id).maybeSingle();
  if (before?.status === status) return; // no change, no duplicate client message
  ensure(await supabase.from("shipments").update({ status, updated_at: new Date().toISOString() }).eq("id", id), "update the status");
  ensure(
    await supabase.from("shipment_events").insert({
      shipment_id: id,
      event_type: "status_change",
      message: `Status changed to ${status.replace(/_/g, " ")}`,
      created_by: me.id,
    }),
    "record the status change",
  );

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
  } catch (e) {
    console.error("[shipment] client notification failed", e);
  }

  await logActivity({ entityType: "shipment", entityId: id, action: `changed status to ${status}` });
  revalidatePath(`/admin/shipments/${id}`);
  revalidatePath("/admin/shipments");
}

export async function assignShipment(formData: FormData) {
  await requireRole("shipments");
  const id = idField(formData);
  const assigned_to = text(formData, "assigned_to", 36);
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  ensure(
    await supabase.from("shipments").update({ assigned_to, updated_at: new Date().toISOString() }).eq("id", id),
    "assign the shipment",
  );
  await logActivity({ entityType: "shipment", entityId: id, action: "assigned shipment" });
  revalidatePath(`/admin/shipments/${id}`);
}

export async function addShipmentEvent(formData: FormData) {
  const me = await requireRole("shipments");
  const shipment_id = idField(formData, "shipment_id");
  const body = text(formData, "body");
  const supabase = createServiceRoleClient();
  if (!supabase || !body) return;

  ensure(
    await supabase.from("shipment_events").insert({ shipment_id, event_type: "update", message: body, created_by: me.id }),
    "add the update",
  );
  revalidatePath(`/admin/shipments/${shipment_id}`);
}

export async function updateKeyDates(formData: FormData) {
  await requireRole("shipments");
  const id = idField(formData);
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const key_dates: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (k.startsWith("date_") && typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) {
      key_dates[k.replace("date_", "").slice(0, 40)] = v.slice(0, 25);
    }
  }

  ensure(await supabase.from("shipments").update({ key_dates, updated_at: new Date().toISOString() }).eq("id", id), "save the dates");
  revalidatePath(`/admin/shipments/${id}`);
}

export async function updateShipmentNotes(formData: FormData) {
  await requireRole("shipments");
  const id = idField(formData);
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  ensure(
    await supabase
      .from("shipments")
      .update({ cost_notes: text(formData, "cost_notes"), service_notes: text(formData, "service_notes"), updated_at: new Date().toISOString() })
      .eq("id", id),
    "save the notes",
  );
  revalidatePath(`/admin/shipments/${id}`);
}

export async function createShipment(formData: FormData) {
  const me = await requireRole("shipments");
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const client_id = idField(formData, "client_id");
  const origin = text(formData, "origin", 200);
  const destination = text(formData, "destination", 200);
  if (!origin || !destination) throw new Error("Add the origin and destination.");

  const { data: noRes } = await supabase.rpc("gen_shipment_no");
  const shipNo = (Array.isArray(noRes) ? noRes[0] : noRes) || `SHP-${Date.now()}`;

  const { data: shipment } = ensure(
    await supabase
      .from("shipments")
      .insert({
        shipment_no: shipNo,
        client_id,
        method: formData.get("method") ? oneOf(formData, "method", METHODS) : "sea",
        origin,
        destination,
        cargo: {},
        status: "draft",
      })
      .select("id")
      .single(),
    "create the shipment",
  );

  if (shipment) {
    await supabase.from("shipment_events").insert({
      shipment_id: shipment.id,
      event_type: "created",
      message: "Shipment created manually",
      created_by: me.id,
    });
    await logActivity({ entityType: "shipment", entityId: shipment.id, action: "created shipment" });
  }

  revalidatePath("/admin/shipments");
  return shipment?.id as string | undefined;
}
