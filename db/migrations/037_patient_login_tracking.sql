-- Migration 037: Patient Login Tracking
-- Records one row per *completed* patient login through the Epic SMART on FHIR
-- EHR launch flow (i.e. the auth code was successfully exchanged for a token in
-- epic-ehr-callback.js).
--
-- This is distinct from access_log (migration 029):
--   * access_log records every license-check decision (granted/denied), and the
--     check runs at BOTH the launch and callback steps.
--   * patient_login_tracking records the single moment a patient actually
--     finished logging in, so per-center login volume can be measured cleanly.
--
-- PRIVACY: No PHI is stored here. We deliberately do NOT persist the Epic patient
-- FHIR id or any token. We only record the organization, the iss base URL, the
-- launch type, the granted scope string, and whether patient context was present.

CREATE TABLE IF NOT EXISTS patient_login_tracking (
    id                  SERIAL PRIMARY KEY,
    epic_org_id         TEXT,                              -- matches licensed_organizations.epic_org_id (nullable if unknown)
    org_name            TEXT NOT NULL DEFAULT '',
    iss_url             TEXT NOT NULL,                     -- normalized FHIR base URL the patient launched from
    launch_type         TEXT NOT NULL DEFAULT 'ehr',       -- 'ehr' | 'standalone'
    granted_scope       TEXT,                              -- scope string returned in the token response
    has_patient_context BOOLEAN NOT NULL DEFAULT FALSE,    -- true if the token carried a patient context
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-organization login volume over time
CREATE INDEX IF NOT EXISTS idx_patient_login_org_ts
    ON patient_login_tracking (epic_org_id, created_at DESC);

-- Recent logins across all organizations (dashboard / trend queries)
CREATE INDEX IF NOT EXISTS idx_patient_login_created
    ON patient_login_tracking (created_at DESC);
