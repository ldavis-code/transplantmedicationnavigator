-- Migration 039: Feedback table (moved from Supabase to Neon)
--
-- The FeedbackWidget (medication pages) and the /feedback survey page used to
-- write directly to a Supabase `feedback` table from the browser with a
-- hardcoded anon key. Both now POST to /.netlify/functions/feedback, which
-- validates answers against a whitelist and inserts here.
--
-- Anonymous by design: no email, no name, no identifier of any kind. The
-- widget records the medication name being viewed; the survey page records
-- multiple-choice answers plus an optional free-text comment (length-capped
-- and stripped server-side).

CREATE TABLE IF NOT EXISTS feedback (
    id                   BIGSERIAL PRIMARY KEY,
    source               TEXT NOT NULL DEFAULT 'widget',  -- 'widget' | 'feedback_page'
    got_medication       TEXT,                            -- widget Q1
    program_found        TEXT,                            -- survey Q1
    savings_range        TEXT,                            -- shared Q2
    without_tool         TEXT,                            -- shared Q3
    medication_searched  TEXT,                            -- widget: medication being viewed
    comment              TEXT,                            -- survey: optional free text
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback (created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_source ON feedback (source);
