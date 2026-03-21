-- Compliance Tracking Migration
-- Adds tables for medication compliance monitoring and dashboard reporting
-- Tracks patient adherence events, compliance scores, and audit logs

-- ============================================
-- COMPLIANCE EVENTS TABLE
-- ============================================
-- Records individual compliance events (doses taken, missed, late)
CREATE TABLE IF NOT EXISTS compliance_events (
    id SERIAL PRIMARY KEY,
    org_id INTEGER REFERENCES organizations(id),
    patient_id TEXT NOT NULL,
    medication_id TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('taken', 'missed', 'late', 'skipped', 'refill')),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ehr', 'app', 'import')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_events_org ON compliance_events(org_id);
CREATE INDEX IF NOT EXISTS idx_compliance_events_patient ON compliance_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_compliance_events_medication ON compliance_events(medication_id);
CREATE INDEX IF NOT EXISTS idx_compliance_events_type ON compliance_events(event_type);
CREATE INDEX IF NOT EXISTS idx_compliance_events_scheduled ON compliance_events(scheduled_at);

-- ============================================
-- COMPLIANCE SCORES TABLE
-- ============================================
-- Aggregated daily compliance scores per patient per medication
CREATE TABLE IF NOT EXISTS compliance_scores (
    id SERIAL PRIMARY KEY,
    org_id INTEGER REFERENCES organizations(id),
    patient_id TEXT NOT NULL,
    medication_id TEXT NOT NULL,
    score_date DATE NOT NULL,
    adherence_rate DECIMAL(5,2) NOT NULL CHECK (adherence_rate >= 0 AND adherence_rate <= 100),
    doses_scheduled INTEGER NOT NULL DEFAULT 0,
    doses_taken INTEGER NOT NULL DEFAULT 0,
    doses_missed INTEGER NOT NULL DEFAULT 0,
    doses_late INTEGER NOT NULL DEFAULT 0,
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, patient_id, medication_id, score_date)
);

CREATE INDEX IF NOT EXISTS idx_compliance_scores_org ON compliance_scores(org_id);
CREATE INDEX IF NOT EXISTS idx_compliance_scores_patient ON compliance_scores(patient_id);
CREATE INDEX IF NOT EXISTS idx_compliance_scores_date ON compliance_scores(score_date);
CREATE INDEX IF NOT EXISTS idx_compliance_scores_risk ON compliance_scores(risk_level);

-- ============================================
-- COMPLIANCE AUDIT LOG TABLE
-- ============================================
-- Tracks admin actions related to compliance reviews
CREATE TABLE IF NOT EXISTS compliance_audit_log (
    id SERIAL PRIMARY KEY,
    org_id INTEGER REFERENCES organizations(id),
    admin_user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL CHECK (action IN ('review', 'flag', 'dismiss', 'escalate', 'note', 'export')),
    target_patient_id TEXT,
    target_medication_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_audit_org ON compliance_audit_log(org_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_admin ON compliance_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_created ON compliance_audit_log(created_at);

-- ============================================
-- COMPLIANCE SUMMARY VIEW
-- ============================================
CREATE OR REPLACE VIEW compliance_summary AS
SELECT
    org_id,
    COUNT(DISTINCT patient_id) AS total_patients,
    ROUND(AVG(adherence_rate)::numeric, 1) AS avg_adherence_rate,
    COUNT(*) FILTER (WHERE risk_level = 'critical') AS critical_count,
    COUNT(*) FILTER (WHERE risk_level = 'high') AS high_risk_count,
    COUNT(*) FILTER (WHERE risk_level = 'medium') AS medium_risk_count,
    COUNT(*) FILTER (WHERE risk_level = 'low') AS low_risk_count,
    SUM(doses_taken) AS total_doses_taken,
    SUM(doses_missed) AS total_doses_missed,
    SUM(doses_scheduled) AS total_doses_scheduled
FROM compliance_scores
WHERE score_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY org_id;
