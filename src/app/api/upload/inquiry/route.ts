import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { checkUpload, fileUrl, safeFileName } from "@/lib/uploads";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Clients attach documents to their own quote request right after submitting it.
export async function POST(request: Request) {
  try {
    if (await isRateLimited(`upload:${clientIp(request)}`, 20, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many uploads. Email the documents instead." }, { status: 429 });
    }
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const inquiryId = String(formData.get("inquiry_id") || "");
    if (!file || !UUID_RE.test(inquiryId)) {
      return NextResponse.json({ error: "Missing file or enquiry reference" }, { status: 400 });
    }
    const check = checkUpload(file);
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });

    const supabase = createServiceRoleClient();
    if (!supabase) return NextResponse.json({ error: "Storage not configured" }, { status: 503 });

    // Only recent enquiries accept uploads from the public form.
    const { data: inquiry } = await supabase
      .from("inquiries")
      .select("id, created_at")
      .eq("id", inquiryId)
      .maybeSingle();
    if (!inquiry || Date.now() - new Date(inquiry.created_at).getTime() > 7 * 24 * 60 * 60 * 1000) {
      return NextResponse.json({ error: "This enquiry no longer accepts uploads. Email the documents instead." }, { status: 400 });
    }

    const objectPath = `${inquiryId}/${Date.now()}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("inquiry-uploads")
      .upload(objectPath, file, { contentType: check.contentType, upsert: false });
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { error: dbError } = await supabase.from("inquiry_files").insert({
      inquiry_id: inquiryId,
      file_url: fileUrl("inquiry-uploads", objectPath),
      file_type: check.ext,
    });
    if (dbError) return NextResponse.json({ error: "Upload failed" }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Upload API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
