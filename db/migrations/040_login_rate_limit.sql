-- Migration 040: Login rate limiting
--
-- Backing table for brute-force protection on the admin login endpoints
-- (auth.js and admin-auth.js). Each FAILED login inserts one row keyed by an
-- HMAC of the caller's IP + login target — the raw IP is never stored, so
-- this table holds no personal data. Rows self-clean after one day (deleted
-- opportunistically by the login functions and by the data-retention job).

CREATE TABLE IF NOT EXISTS login_attempts (
    id            BIGSERIAL PRIMARY KEY,
    identifier    TEXT NOT NULL,                       -- HMAC(ip + target), never a raw IP
    attempted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ident_time
    ON login_attempts (identifier, attempted_at DESC);
