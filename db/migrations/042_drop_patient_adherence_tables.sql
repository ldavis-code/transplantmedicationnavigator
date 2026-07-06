-- Migration 042: Drop the dormant patient-level adherence tables
--
-- Migrations 018 and 032 created a per-patient medication-adherence product
-- (compliance_events, compliance_scores, compliance_interventions, plus its
-- audit log and org settings). It was never launched: the tables are empty,
-- and the dashboard and API that served them have been removed from the
-- codebase.
--
-- Dropping them deliberately closes a compliance landmine — any future
-- feature touching these tables would put patient-identified health data
-- (PHI-grade) on our servers, contradicting the site's privacy posture and
-- reopening the BAA question. If a hospital-facing adherence product is ever
-- built, it should be designed fresh with a BAA and proper safeguards, not
-- by quietly reviving this schema.
--
-- The GRC tables (compliance_controls, compliance_vendors, compliance_
-- policies, compliance_risks, compliance_incidents, compliance_auto_checks)
-- are unrelated and are kept.

DROP TABLE IF EXISTS compliance_interventions;
DROP TABLE IF EXISTS compliance_audit_log;
DROP TABLE IF EXISTS compliance_scores;
DROP TABLE IF EXISTS compliance_events;
DROP TABLE IF EXISTS org_compliance_settings;
