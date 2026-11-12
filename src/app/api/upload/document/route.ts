import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { getSessionUser } from "@/lib/auth/session";
import { canWrite } from "@/lib/auth/roles";
import { checkUpload, fileUrl, safeFileName } from "@/lib/uploads";

// Staff upload shipment documents from the dashboard.
export async function POST(request: Request) {
  try {
    const staff = await getSessionUser();
    if (!staff) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    if (!canWrite(staff.role, "documents")) return NextResponse.json({ error: "Your role cannot upload documents" }, { status: 403 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const shipmentId = String(formData.get("shipment_id") || "");
    const docType = String(formData.get("doc_type") || "other").replace(/[^a-z_]/g, "").slice(0, 40) || "other";
    if (!file || !shipmentId) {
      return NextResponse.json({ error: "Missing file or shipment_id" }, { status: 400 });
    }
    const check = checkUpload(file);
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });

    const supabase = createServiceRoleClient();
    if (!supabase) return NextResponse.json({ error: "Storage not configured" }, { status: 503 });

    const objectPath = `${shipmentId}/${Date.now()}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("shipment-documents")
      .upload(objectPath, file, { contentType: check.contentType, upsert: false });
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { error: dbError } = await supabase.from("shipment_documents").insert({
      shipment_id: shipmentId,
      doc_type: docType,
      file_url: fileUrl("shipment-documents", objectPath),
    });
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

    await logActivity({
      entityType: "document",
      entityId: shipmentId,
      action: `uploaded ${docType.replace(/_/g, " ")}`,
      actorEmail: staff.email,
      metadata: { filename: file.name },
    });

    return NextResponse.json({ success: true, path: objectPath });
  } catch (e) {
    console.error("Document upload error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
