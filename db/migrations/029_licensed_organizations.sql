-- Migration 029: Licensed Organizations + Access Log
-- Supports the EHR launch license gating flow.
--
-- licensed_organizations: one row per contracted transplant center.
-- access_log: append-only audit trail of every EHR launch attempt.

CREATE TABLE IF NOT EXISTS licensed_organizations (
    epic_org_id   TEXT PRIMARY KEY,          -- e.g. "urn:oid:1.2.840..." or hostname
    org_name      TEXT NOT NULL,
    tier          TEXT NOT NULL DEFAULT 'standard',  -- standard | premium
    contract_start DATE,
    contract_end   DATE,                     -- NULL = no expiry
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for the license check query (already primary key, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_licensed_orgs_active
    ON licensed_organizations (active) WHERE active = TRUE;

CREATE TABLE IF NOT EXISTS access_log (
    id            SERIAL PRIMARY KEY,
    epic_org_id   TEXT NOT NULL,
    org_name      TEXT NOT NULL DEFAULT '',
    granted       BOOLEAN NOT NULL,
    reason        TEXT NOT NULL,              -- licensed | not_licensed | deactivated | expired
    ts            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying access log by org and time
CREATE INDEX IF NOT EXISTS idx_access_log_org_ts
    ON access_log (epic_org_id, ts DESC);

-- Index for dashboard queries (recent denials, etc.)
CREATE INDEX IF NOT EXISTS idx_access_log_granted_ts
    ON access_log (granted, ts DESC);
