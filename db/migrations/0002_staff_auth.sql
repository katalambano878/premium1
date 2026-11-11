-- Staff sign-in for the admin dashboard (replaces Supabase Auth).
-- Passwords are bcrypt hashes; reset tokens are stored as SHA-256 hashes only.

CREATE TABLE IF NOT EXISTS staff_credentials (
  email TEXT PRIMARY KEY REFERENCES staff_users(email) ON UPDATE CASCADE ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_password_tokens (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL REFERENCES staff_users(email) ON UPDATE CASCADE ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_staff_password_tokens_email ON staff_password_tokens(email);

ALTER TABLE staff_users ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;
