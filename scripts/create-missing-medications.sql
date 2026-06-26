-- Tracking table for medications imported from MyChart that are NOT in our
-- transplant assistance database. Aggregate counts only — no patient data,
-- no dose/strength, just the drug name and how often it has been requested.
-- Use this to decide which medications to add next.
--
-- Run once in the Neon SQL editor.

CREATE TABLE IF NOT EXISTS missing_medications (
    name_normalized text PRIMARY KEY,
    display_name    text NOT NULL,
    request_count   integer NOT NULL DEFAULT 0,
    first_seen      timestamptz NOT NULL DEFAULT now(),
    last_seen       timestamptz NOT NULL DEFAULT now()
);

-- Review the most-requested missing medications:
--   SELECT display_name, request_count, last_seen
--   FROM missing_medications
--   ORDER BY request_count DESC, last_seen DESC;
