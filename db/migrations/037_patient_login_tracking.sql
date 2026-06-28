-- Migration 037: FHIR Endpoint Directory + Patient Login Tracking
--
-- These two tables already exist in the production Neon database (they were
-- created ahead of this repo's migration history). This migration documents
-- them so a fresh database (local dev, a new Neon branch) matches production.
-- Every statement is idempotent (IF NOT EXISTS): running it against a database
-- that already has the tables is a no-op and will not alter or drop any data.
--
-- Flow: epic-ehr-callback.js, after a successful token exchange, looks up the
-- launching center in fhir_endpoint_directory by iss_url and writes one row to
-- patient_login_tracking per completed login. No PHI is stored — no patient
-- FHIR id and no tokens, only the endpoint, the iss URL, and the launch type.
--
-- This is distinct from access_log (migration 029), which records every
-- license-check decision at BOTH the launch and callback steps.

-- Directory of known FHIR (Epic) endpoints, keyed by their iss base URL.
CREATE TABLE IF NOT EXISTS fhir_endpoint_directory (
    id                BIGSERIAL PRIMARY KEY,
    iss_url           TEXT NOT NULL,                     -- FHIR base URL (the SMART `iss`)
    brand_name        TEXT NOT NULL,                     -- human-readable center/system name
    epic_org_id       TEXT,                              -- matches licensed_organizations.epic_org_id
    facility_city     TEXT,
    facility_state    TEXT,
    is_transplant_ctr BOOLEAN DEFAULT FALSE,
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Supports the case-insensitive iss lookup done in the callback.
CREATE INDEX IF NOT EXISTS idx_fhir_endpoint_iss
    ON fhir_endpoint_directory (lower(rtrim(iss_url, '/')));

-- One row per completed patient login through the EHR launch flow.
CREATE TABLE IF NOT EXISTS patient_login_tracking (
    id           BIGSERIAL PRIMARY KEY,
    endpoint_id  BIGINT REFERENCES fhir_endpoint_directory (id),  -- nullable: iss may not be in the directory yet
    iss_url      TEXT NOT NULL,
    launch_type  TEXT,                                            -- 'ehr' | 'standalone'
    logged_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per-endpoint login volume over time.
CREATE INDEX IF NOT EXISTS idx_patient_login_endpoint
    ON patient_login_tracking (endpoint_id, logged_in_at DESC);

-- Recent logins across all endpoints (dashboard / trend queries).
CREATE INDEX IF NOT EXISTS idx_patient_login_logged_at
    ON patient_login_tracking (logged_in_at DESC);
