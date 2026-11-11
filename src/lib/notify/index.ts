import { sendEmail } from "./emailProvider";
import { sendSMS } from "./smsProvider";

export type NotificationChannel = "email" | "sms";

export interface SendNotificationParams {
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  body: string;
  replyTo?: string;
  templateKey?: string;
  payload?: Record<string, unknown>;
}

export async function sendNotification(params: SendNotificationParams): Promise<{ success: boolean; error?: string }> {
  const { channel, recipient, subject, body, replyTo } = params;

  if (channel === "email") {
    return sendEmail(recipient, subject || "Premium 1 Logistics", body, { replyTo });
  }

  if (channel === "sms") {
    return sendSMS(recipient, body);
  }

  return { success: false, error: "Unknown channel" };
}

/**
 * Template-based notification that logs to the notifications table.
 * Interpolates {{key}} placeholders in subject/body with payload values.
 */
export async function sendTemplateNotification(opts: {
  templateKey: string;
  channel: NotificationChannel;
  recipient: string;
  payload: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase?: any;
}): Promise<{ success: boolean; error?: string }> {
  const { templateKey, channel, recipient, payload, supabase } = opts;

  let subject = "";
  let body = "";

  if (supabase) {
    const { data: tpl } = await supabase
      .from("notification_templates")
      .select("subject, body")
      .eq("key", templateKey)
      .eq("channel", channel)
      .eq("is_active", true)
      .single();

    if (tpl) {
      subject = tpl.subject || "";
      body = tpl.body || "";
    }
  }

  if (!body) {
    subject = payload.subject || `Premium 1 Logistics - ${templateKey.replace(/_/g, " ")}`;
    body = payload.body || `Notification: ${templateKey}`;
  }

  const interpolate = (str: string) =>
    str.replace(/\\n/g, "\n").replace(/\{\{(\w+)\}\}/g, (_, k) => payload[k] || "");

  subject = interpolate(subject);
  body = interpolate(body);

  const result = await sendNotification({ channel, recipient, subject, body });

  if (supabase) {
    try {
      await supabase.from("notifications").insert({
        channel,
        recipient,
        template_key: templateKey,
        payload,
        status: result.success ? "sent" : "failed",
      });
    } catch {
      // logging is best-effort
    }
  }

  return result;
}

export { sendEmail } from "./emailProvider";
export { sendSMS } from "./smsProvider";
