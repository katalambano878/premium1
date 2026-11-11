import "server-only";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { query } from "@/lib/db/pool";

export const MIN_PASSWORD_LENGTH = 10;
const RESET_TTL_MINUTES = 60;

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

/** Checks email + password; returns the active staff member or null. Constant-ish time on unknown emails. */
export async function verifyStaffPassword(email: string, password: string) {
  const { rows } = await query<{ email: string; role: string; password_hash: string }>(
    `SELECT s.email, s.role, c.password_hash
       FROM staff_users s JOIN staff_credentials c ON c.email = s.email
      WHERE lower(s.email) = lower($1) AND s.is_active = true`,
    [email],
  );
  const row = rows[0];
  // Compare against a dummy hash when the account does not exist, so timing does not reveal it.
  const hash = row?.password_hash || "$2a$12$JT3h08gqzXzVQb8Yad.2Q.cdiLZ1tUaIhzYjn4Fif828ntfJYhv0K";
  const ok = await bcrypt.compare(password, hash);
  if (!row || !ok) return null;
  await query("UPDATE staff_users SET last_sign_in_at = NOW() WHERE email = $1", [row.email]);
  return { email: row.email, role: row.role };
}

/** Creates a one-hour reset token for an active staff member. Returns the raw token, or null if no such staff. */
export async function createResetToken(email: string): Promise<{ token: string; email: string; fullName: string } | null> {
  const { rows } = await query<{ email: string; full_name: string }>(
    "SELECT email, full_name FROM staff_users WHERE lower(email) = lower($1) AND is_active = true",
    [email],
  );
  const staff = rows[0];
  if (!staff) return null;
  const token = randomBytes(32).toString("base64url");
  await query(
    `INSERT INTO staff_password_tokens (token_hash, email, expires_at)
     VALUES ($1, $2, NOW() + ($3 || ' minutes')::interval)`,
    [sha256(token), staff.email, String(RESET_TTL_MINUTES)],
  );
  return { token, email: staff.email, fullName: staff.full_name };
}

/** Uses a reset token once to set a new password. Returns the staff email on success. */
export async function resetPasswordWithToken(token: string, password: string): Promise<string | null> {
  const { rows } = await query<{ email: string }>(
    `UPDATE staff_password_tokens SET used_at = NOW()
      WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
      RETURNING email`,
    [sha256(token)],
  );
  const email = rows[0]?.email;
  if (!email) return null;
  const hash = await bcrypt.hash(password, 12);
  await query(
    `INSERT INTO staff_credentials (email, password_hash, updated_at) VALUES ($1, $2, NOW())
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()`,
    [email, hash],
  );
  // Any other outstanding links for this account stop working.
  await query("UPDATE staff_password_tokens SET used_at = NOW() WHERE email = $1 AND used_at IS NULL", [email]);
  return email;
}
