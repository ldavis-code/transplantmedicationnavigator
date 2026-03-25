-- Compliance Enhancements Migration
-- Adds configurable alert thresholds per org and intervention tracking

-- ============================================
-- ORG COMPLIANCE SETTINGS TABLE
-- ============================================
-- Per-organization configurable alert thresholds for adherence monitoring
CREATE TABLE IF NOT EXISTS org_compliance_settings (
    id SERIAL PRIMARY KEY,
    org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    critical_threshold DECIMAL(5,2) NOT NULL DEFAULT 50.0,
    high_threshold DECIMAL(5,2) NOT NULL DEFAULT 70.0,
    medium_threshold DECIMAL(5,2) NOT NULL DEFAULT 85.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id)
);

-- ============================================
-- COMPLIANCE INTERVENTIONS TABLE
-- ============================================
-- Tracks coordinator interventions for non-adherent patients
CREATE TABLE IF NOT EXISTS compliance_interventions (
    id SERIAL PRIMARY KEY,
    org_id INTEGER REFERENCES organizations(id),
    patient_id TEXT NOT NULL,
    medication_id TEXT,
    intervention_type TEXT NOT NULL CHECK (intervention_type IN ('phone_call', 'message', 'in_person', 'care_plan_update', 'referral', 'other')),
    notes TEXT NOT NULL,
    outcome TEXT CHECK (outcome IN ('resolved', 'pending', 'escalated', 'no_response', NULL)),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interventions_org ON compliance_interventions(org_id);
CREATE INDEX IF NOT EXISTS idx_interventions_patient ON compliance_interventions(patient_id);
CREATE INDEX IF NOT EXISTS idx_interventions_created ON compliance_interventions(created_at DESC);
