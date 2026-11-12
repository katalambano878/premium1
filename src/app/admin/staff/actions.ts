"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { query } from "@/lib/db/pool";
import { logActivity } from "@/lib/activity";
import { STAFF_ROLES, id, oneOf, text } from "@/lib/admin-form";
import { isEmail } from "@/lib/forms";
import { createResetToken } from "@/lib/auth/passwords";
import { sendEmail } from "@/lib/notify/emailProvider";
import { siteUrl } from "@/lib/site-url";

/** Emails a one-hour link the staff member uses to choose their own password. Returns whether the email went out. */
async function emailPasswordLink(email: string, kind: "invite" | "reset"): Promise<boolean> {
  const result = await createResetToken(email);
  if (!result) return false;
  const link = `${siteUrl()}/auth/admin/reset?token=${encodeURIComponent(result.token)}`;
  const intro =
    kind === "invite"
      ? "You have been given access to the Premium 1 Logistics operations dashboard. Use this link to choose your password:"
      : "Use this link to choose a new password for the Premium 1 Logistics dashboard:";
  const sent = await sendEmail(
    result.email,
    kind === "invite" ? "Your Premium 1 dashboard account" : "Set your Premium 1 dashboard password",
    `Hello ${result.fullName},\n\n${intro}\n\n${link}\n\nThe link works once and expires in one hour. After that, sign in at ${siteUrl()}/auth/admin with this email address. If the link has expired, choose "Set or reset password" on the sign-in page.\n\nPremium 1 Logistics`,
  );
  return sent.success;
}

/** True when changing `targetId` would leave no active admin. */
async function wouldRemoveLastAdmin(targetId: string): Promise<boolean> {
  const { rows } = await query<{ n: number }>(
    "SELECT count(*)::int AS n FROM staff_users WHERE role = 'admin' AND is_active = true AND id <> $1",
    [targetId],
  );
  return rows[0].n === 0;
}

export async function createStaff(formData: FormData) {
  await requireRole("staff");
  const full_name = text(formData, "full_name", 160);
  const email = text(formData, "email", 200)?.toLowerCase();
  const role = oneOf(formData, "role", STAFF_ROLES);
  if (!full_name) throw new Error("Add the staff member's name.");
  if (!email || !isEmail(email)) throw new Error("Enter a valid email address.");

  const { rows } = await query(
    `INSERT INTO staff_users (full_name, email, role, is_active) VALUES ($1, $2, $3, true)
     ON CONFLICT (email) DO NOTHING RETURNING id`,
    [full_name, email, role],
  );
  if (!rows[0]) throw new Error(`${email} already has a staff account.`);

  await logActivity({ entityType: "staff", entityId: rows[0].id, action: `added staff member as ${role}`, metadata: { email } });
  revalidatePath("/admin/staff");
  // The account exists either way; a failed email is reported so the admin can resend.
  const invited = await emailPasswordLink(email, "invite").catch(() => false);
  if (!invited) throw new Error(`${full_name} was added, but the invite email could not be sent. Use "Send password link" to try again.`);
}

/** Sends (or re-sends) the link a staff member uses to set their password. */
export async function sendPasswordLink(formData: FormData) {
  await requireRole("staff");
  const staffId = id(formData);
  const { rows } = await query<{ email: string; is_active: boolean }>("SELECT email, is_active FROM staff_users WHERE id = $1", [staffId]);
  if (!rows[0]) throw new Error("That staff member no longer exists.");
  if (!rows[0].is_active) throw new Error("Reactivate this account before sending a password link.");
  const sent = await emailPasswordLink(rows[0].email, "reset");
  if (!sent) throw new Error("The email could not be sent. Check the address and try again.");
  await logActivity({ entityType: "staff", entityId: staffId, action: "sent a password link" });
}

export async function updateStaffRole(formData: FormData) {
  await requireRole("staff");
  const staffId = id(formData);
  const role = oneOf(formData, "role", STAFF_ROLES);
  if (role !== "admin" && (await wouldRemoveLastAdmin(staffId))) {
    throw new Error("There must always be at least one active admin.");
  }

  await query("UPDATE staff_users SET role = $1, updated_at = NOW() WHERE id = $2", [role, staffId]);
  await logActivity({ entityType: "staff", entityId: staffId, action: `changed role to ${role}` });
  revalidatePath("/admin/staff");
}

export async function toggleStaffActive(formData: FormData) {
  await requireRole("staff");
  const staffId = id(formData);
  const { rows } = await query<{ is_active: boolean }>("SELECT is_active FROM staff_users WHERE id = $1", [staffId]);
  if (!rows[0]) throw new Error("That staff member no longer exists.");
  const activate = !rows[0].is_active;
  if (!activate && (await wouldRemoveLastAdmin(staffId))) {
    throw new Error("There must always be at least one active admin.");
  }

  await query("UPDATE staff_users SET is_active = $1, updated_at = NOW() WHERE id = $2", [activate, staffId]);
  // Signing someone out also cancels any password links they still hold.
  if (!activate) {
    await query(
      "UPDATE staff_password_tokens SET used_at = NOW() WHERE used_at IS NULL AND email = (SELECT email FROM staff_users WHERE id = $1)",
      [staffId],
    );
  }
  await logActivity({ entityType: "staff", entityId: staffId, action: activate ? "reactivated staff member" : "deactivated staff member" });
  revalidatePath("/admin/staff");
}
