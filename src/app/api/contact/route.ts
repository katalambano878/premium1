import { NextResponse } from "next/server";
import { sendNotification } from "@/lib/notify";
import { clean, isEmail, staffRecipients } from "@/lib/forms";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || body.website) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    if (isRateLimited(`contact:${clientIp(request)}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many messages. Please try again later or email us directly." }, { status: 429 });
    }

    const name = clean(body.name, 120);
    const email = clean(body.email, 200);
    const phone = clean(body.phone, 40);
    const company = clean(body.company, 160);
    const message = clean(body.message, 5000);
    if (!name || !isEmail(email) || message.length < 10) {
      return NextResponse.json({ error: "Name, a valid email, and a message of at least 10 characters are required" }, { status: 400 });
    }

    const recipients = staffRecipients();
    if (!recipients.length) {
      console.error("[contact] NOTIFY_STAFF_EMAIL is not set; message not delivered");
      return NextResponse.json({ error: "We could not send your message. Please email us directly." }, { status: 503 });
    }

    const text = `New message from the website contact form.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "-"}\nCompany: ${company || "-"}\n\n${message}`;
    const results = await Promise.all(
      recipients.map((to) => sendNotification({ channel: "email", recipient: to, subject: `Website message from ${name}`, body: text, replyTo: email })),
    );
    if (!results.some((r) => r.success)) {
      return NextResponse.json({ error: "We could not send your message. Please email us directly." }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[contact]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
