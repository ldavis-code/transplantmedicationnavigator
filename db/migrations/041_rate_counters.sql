-- Migration 041: Rate counters for public endpoints
--
-- Fixed-window request counters used by lib/rateLimit.js to protect the
-- unauthenticated endpoints (chat, event, feedback, price reports,
-- medication tracking) against scripted abuse — including running up the
-- Anthropic API bill via /api/chat and poisoning partner analytics with
-- junk events.
--
-- One row per caller per window, upsert-incremented. The identifier is an
-- HMAC of IP + endpoint — no raw IPs are stored. Rows are cleared after one
-- day by the scheduled data-retention function.

CREATE TABLE IF NOT EXISTS rate_counters (
    identifier    TEXT NOT NULL,          -- HMAC(ip + endpoint), never a raw IP
    window_start  TIMESTAMPTZ NOT NULL,
    count         INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (identifier, window_start)
);
