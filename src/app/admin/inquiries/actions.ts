"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getPool } from "@/lib/db/pool";
import { logActivity } from "@/lib/activity";
import { INQUIRY_STATUSES, ensure, id, oneOf, text } from "@/lib/admin-form";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function updateInquiryStatus(formData: FormData) {
  await requireRole("inquiries");
  const inquiryId = id(formData);
  const status = oneOf(formData, "status", INQUIRY_STATUSES);
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const { data: before } = await supabase.from("inquiries").select("status").eq("id", inquiryId).maybeSingle();
  ensure(await supabase.from("inquiries").update({ status, updated_at: new Date().toISOString() }).eq("id", inquiryId), "update the status");
  await logActivity({ entityType: "inquiry", entityId: inquiryId, action: `changed status to ${status}` });

  // Tell the client once, when the enquiry first becomes quoted.
  if (status === "quoted" && before?.status !== "quoted") {
    try {
      const { data: inq } = await supabase.from("inquiries").select("inquiry_no, email, full_name").eq("id", inquiryId).single();
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
    } catch (e) {
      console.error("[inquiry] quote_ready notification failed", e);
    }
  }

  revalidatePath(`/admin/inquiries/${inquiryId}`);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

export async function assignInquiry(formData: FormData) {
  await requireRole("inquiries");
  const inquiryId = id(formData);
  const assigned = text(formData, "assigned_to", 36);
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  ensure(
    await supabase.from("inquiries").update({ assigned_to: assigned, updated_at: new Date().toISOString() }).eq("id", inquiryId),
    "assign the enquiry",
  );
  await logActivity({ entityType: "inquiry", entityId: inquiryId, action: "assigned inquiry" });
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  revalidatePath("/admin/inquiries");
}

export async function addInquiryNote(formData: FormData) {
  const me = await requireRole("inquiries");
  const inquiry_id = id(formData, "inquiry_id");
  const body = text(formData, "body");
  const supabase = createServiceRoleClient();
  if (!supabase || !body) return;

  ensure(await supabase.from("inquiry_notes").insert({ inquiry_id, body, author_id: me.id }), "add the note");
  await logActivity({ entityType: "inquiry", entityId: inquiry_id, action: "added note" });
  revalidatePath(`/admin/inquiries/${inquiry_id}`);
}

export async function setFollowUp(formData: FormData) {
  await requireRole("inquiries");
  const inquiryId = id(formData);
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  ensure(
    await supabase
      .from("inquiries")
      .update({ follow_up_at: text(formData, "follow_up_at", 40), updated_at: new Date().toISOString() })
      .eq("id", inquiryId),
    "set the follow-up",
  );
  await logActivity({ entityType: "inquiry", entityId: inquiryId, action: text(formData, "follow_up_at", 40) ? "set a follow-up" : "cleared the follow-up" });
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

/**
 * Turns a won enquiry into a shipment. Reuses the client with the same email
 * (case-insensitive) or creates one, all in one transaction so a failure
 * never leaves half a conversion behind.
 */
export async function convertToShipment(formData: FormData) {
  const me = await requireRole("shipments");
  const inquiryId = id(formData);

  const db = await getPool().connect();
  let shipmentId: string | null = null;
  try {
    await db.query("BEGIN");
    const inq = (await db.query("SELECT * FROM inquiries WHERE id = $1 FOR UPDATE", [inquiryId])).rows[0];
    if (!inq) throw new Error("This enquiry no longer exists.");
    if (inq.status === "lost") throw new Error("This enquiry is marked lost. Change its status before creating a shipment.");

    const already = await db.query<{ id: string }>("SELECT id FROM shipments WHERE inquiry_id = $1 LIMIT 1", [inquiryId]);
    if (already.rows[0]) {
      shipmentId = already.rows[0].id;
    } else {
      let clientId = (
        await db.query<{ id: string }>("SELECT id FROM clients WHERE lower(email) = lower($1) ORDER BY created_at LIMIT 1", [inq.email])
      ).rows[0]?.id;
      if (!clientId) {
        clientId = (
          await db.query<{ id: string }>(
            "INSERT INTO clients (company_name, contact_name, email, phone) VALUES ($1, $2, lower($3), $4) RETURNING id",
            [inq.company_name || inq.full_name, inq.full_name, inq.email, inq.phone || ""],
          )
        ).rows[0].id;
      }
      shipmentId = (
        await db.query<{ id: string }>(
          `INSERT INTO shipments (shipment_no, inquiry_id, client_id, method, origin, destination, cargo, status, assigned_to)
           VALUES (gen_shipment_no(), $1, $2, $3, $4, $5, $6, 'draft', $7) RETURNING id`,
          [inq.id, clientId, inq.method, inq.origin, inq.destination, inq.cargo || {}, inq.assigned_to],
        )
      ).rows[0].id;
      await db.query(
        "INSERT INTO shipment_events (shipment_id, event_type, message, created_by) VALUES ($1, 'created', $2, $3)",
        [shipmentId, `Shipment created from inquiry ${inq.inquiry_no}`, me.id],
      );
      await db.query("UPDATE inquiries SET status = 'won', updated_at = NOW() WHERE id = $1", [inquiryId]);
    }
    await db.query("COMMIT");
  } catch (e) {
    await db.query("ROLLBACK").catch(() => {});
    console.error("[inquiry] convert to shipment failed", e);
    throw e instanceof Error && e.message.startsWith("This enquiry") ? e : new Error("Could not create the shipment. Please try again.");
  } finally {
    db.release();
  }

  await logActivity({ entityType: "inquiry", entityId: inquiryId, action: "converted to shipment", metadata: { shipment_id: shipmentId } });
  await logActivity({ entityType: "shipment", entityId: shipmentId ?? undefined, action: "created from inquiry", metadata: { inquiry_id: inquiryId } });
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/shipments");
  if (shipmentId) redirect(`/admin/shipments/${shipmentId}`);
}
