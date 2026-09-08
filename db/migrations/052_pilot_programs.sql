-- Migration 052: Pilot Programs
--
-- One row per transplant-center pilot. Backs the admin "Center Analytics"
-- page (/admin/center-analytics), which reports a single center's patient
-- engagement against the goals agreed for its pilot.
--
-- Attribution model: a center's patients are tagged with a partner slug
-- (events.partner) when they arrive through /pilot/<slug> or a ?partner=<slug>
-- link, and the tag follows them for the rest of the browser session. This
-- table maps that slug to a display name, a pilot window, and targets. When
-- epic_org_id is set, EHR-launch logins (patient_login_tracking joined to
-- fhir_endpoint_directory) are reported for the center as well.
--
-- No PHI: only the center identity, dates, and aggregate targets live here.
-- Every statement is idempotent so the nightly runner can safely re-run it.

CREATE TABLE IF NOT EXISTS pilot_programs (
    id                    SERIAL PRIMARY KEY,
    partner_slug          TEXT UNIQUE NOT NULL,      -- matches events.partner (e.g. 'methodist')
    center_name           TEXT NOT NULL,             -- 'Methodist Health System'
    epic_org_id           TEXT,                      -- optional: links EHR-launch logins
    status                TEXT NOT NULL DEFAULT 'active',  -- planned | active | completed | paused
    start_date            DATE,
    end_date              DATE,
    -- Goals agreed with the center for the pilot window
    target_patients       INTEGER,                   -- unique patient sessions
    target_connections    INTEGER,                   -- program connections (copay/PAP/foundation clicks)
    target_quiz_completes INTEGER,                   -- completed savings quizzes
    coordinator_name      TEXT,                      -- center-side pilot lead (staff, not a patient)
    notes                 TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pilot_programs_status ON pilot_programs (status);

-- Speeds up the per-partner window queries the analytics page runs.
CREATE INDEX IF NOT EXISTS idx_events_partner_ts_name ON events (partner, ts, event_name);
