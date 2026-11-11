import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { clean, isEmail, staffRecipients } from "@/lib/forms";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/site-url";

const METHODS = new Set(["sea", "air", "road"]);

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || body.website || body._hp) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    if (isRateLimited(`quote:${clientIp(request)}`, 8, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later or email us directly." }, { status: 429 });
    }

    const origin = clean(body.origin, 200);
    const destination = clean(body.destination, 200);
    const method = clean(body.method, 10).toLowerCase();
    const full_name = clean(body.full_name, 120);
    const company_name = clean(body.company_name, 160);
    const email = clean(body.email, 200);
    const phone = clean(body.phone, 40);
    const requirements = clean(body.requirements, 5000);
    const rawCargo = body.cargo && typeof body.cargo === "object" ? body.cargo : {};
    const cargo = {
      type: clean(rawCargo.type, 200),
      dimensions: clean(rawCargo.dimensions, 200),
      weight: clean(rawCargo.weight, 100),
      quantity: clean(rawCargo.quantity, 100),
    };

    if (!origin || !destination || !full_name || !isEmail(email) || !phone || !METHODS.has(method)) {
      return NextResponse.json(
        { error: "Please fill in origin, destination, shipping method, your name, a valid email and a phone number." },
        { status: 400 },
      );
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { data: inquiryNoRes } = await supabase.rpc("gen_inquiry_no");
    const inquiryNo = (Array.isArray(inquiryNoRes) ? inquiryNoRes[0] : inquiryNoRes) || `INQ-${Date.now()}`;

    const { data, error } = await supabase
      .from("inquiries")
      .insert({
        inquiry_no: inquiryNo,
        company_name: company_name || null,
        full_name,
        email,
        phone,
        origin,
        destination,
        cargo,
        method,
        requirements: requirements || null,
        status: "new",
        source: "website",
      })
      .select("id, inquiry_no")
      .single();

    if (error || !data) {
      console.error("Inquiry insert error:", error);
      return NextResponse.json({ error: "We could not save your request. Please try again or email us." }, { status: 500 });
    }

    // Notifications must never fail the request: the enquiry is already saved.
    try {
      const { sendNotification, sendTemplateNotification } = await import("@/lib/notify");
      const staffText = [
        `New quote request ${data.inquiry_no}`,
        "",
        `Name: ${full_name}`,
        `Company: ${company_name || "-"}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        "",
        `Route: ${origin} to ${destination} (${method})`,
        `Cargo: ${cargo.type || "-"}`,
        `Dimensions: ${cargo.dimensions || "-"}`,
        `Weight: ${cargo.weight || "-"}`,
        `Quantity: ${cargo.quantity || "-"}`,
        "",
        `Requirements: ${requirements || "-"}`,
        "",
        `Open it in the dashboard: ${siteUrl()}/admin/inquiries/${data.id}`,
      ].join("\n");
      await Promise.all(
        staffRecipients().map((to) =>
          sendNotification({
            channel: "email",
            recipient: to,
            subject: `New quote request ${data.inquiry_no}: ${origin} to ${destination}`,
            body: staffText,
            replyTo: email,
          }),
        ),
      );
      const staffPhone = process.env.NOTIFY_STAFF_PHONE;
      if (staffPhone) {
        await sendTemplateNotification({
          templateKey: "new_inquiry_alert",
          channel: "sms",
          recipient: staffPhone,
          payload: { inquiry_no: data.inquiry_no, client_name: full_name },
          supabase,
        });
      }
      await sendTemplateNotification({
        templateKey: "inquiry_confirmation",
        channel: "email",
        recipient: email,
        payload: { inquiry_no: data.inquiry_no, client_name: full_name },
        supabase,
      });
    } catch (e) {
      console.error("[inquiry notifications]", e);
    }

    return NextResponse.json({ success: true, id: data.id, inquiry_no: data.inquiry_no });
  } catch (e) {
    console.error("Inquiry API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
