-- Fixed-window counters for public form and sign-in limits.
-- Kept in Postgres so limits survive deploys and restarts.
CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT        NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count        INTEGER     NOT NULL DEFAULT 1,
  expires_at   TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (key, window_start)
);
CREATE INDEX IF NOT EXISTS rate_limits_expires_idx ON rate_limits (expires_at);
