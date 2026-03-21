CREATE TABLE IF NOT EXISTS compliance_controls (
  id            TEXT PRIMARY KEY,
  framework     TEXT NOT NULL,
  category      TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'not-started',
  evidence      TEXT DEFAULT '',
  owner         TEXT DEFAULT 'Lorrinda',
  due_date      DATE,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_by    TEXT
);
CREATE TABLE IF NOT EXISTS compliance_vendors (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  type          TEXT,
  baa_status    TEXT NOT NULL DEFAULT 'pending',
  baa_date      DATE,
  notes         TEXT DEFAULT '',
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS compliance_policies (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  framework     TEXT,
  status        TEXT NOT NULL DEFAULT 'not-started',
  last_reviewed DATE,
  next_review   DATE,
  file_link     TEXT DEFAULT '',
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS compliance_risks (
  id            TEXT PRIMARY KEY,
  description   TEXT NOT NULL,
  likelihood    TEXT NOT NULL DEFAULT 'medium',
  impact        TEXT NOT NULL DEFAULT 'medium',
  mitigation    TEXT DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'open',
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS compliance_incidents (
  id            TEXT PRIMARY KEY,
  incident_date DATE NOT NULL,
  description   TEXT NOT NULL,
  severity      TEXT NOT NULL DEFAULT 'medium',
  status        TEXT NOT NULL DEFAULT 'open',
  resolution    TEXT DEFAULT '',
  hhs_notified  BOOLEAN DEFAULT FALSE,
  notified_date DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS compliance_auto_checks (
  id            SERIAL PRIMARY KEY,
  check_type    TEXT NOT NULL,
  check_name    TEXT NOT NULL,
  status        TEXT NOT NULL,
  detail        TEXT,
  checked_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_controls_framework ON compliance_controls(framework);
CREATE INDEX IF NOT EXISTS idx_auto_checks_type ON compliance_auto_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_auto_checks_time ON compliance_auto_checks(checked_at DESC);
INSERT INTO compliance_controls (id, framework, category, name, description) VALUES
('h1','hipaa','Technical','Encryption at Rest','Supabase & Neon PostgreSQL data encrypted at rest (AES-256)'),
('h2','hipaa','Technical','Encryption in Transit','All traffic over HTTPS/TLS — Netlify enforces by default'),
('h3','hipaa','Technical','Audit Logging','Every PHI access, modification, or deletion logged with user/timestamp'),
('h4','hipaa','Technical','Session Timeout','Automatic logoff after 15-30 min of inactivity'),
('h5','hipaa','Technical','Unique User Identification','Each user has a unique credential — no shared logins'),
('h6','hipaa','Technical','Multi-Factor Authentication','MFA enabled for all admin/staff accounts'),
('h7','hipaa','Technical','Emergency Access Procedure','Documented break-glass process to access data if primary systems fail'),
('h8','hipaa','Technical','Minimum Necessary Access','Role-based access — users see only what they need'),
('h9','hipaa','Administrative','HIPAA Security Officer Designated','Named individual responsible for HIPAA compliance'),
('h10','hipaa','Administrative','Written Security Policy','Documented HIPAA Security Policy covering all safeguards'),
('h11','hipaa','Administrative','Risk Assessment Completed','Formal risk analysis of where PHI lives and potential threats'),
('h12','hipaa','Administrative','Workforce Training Documented','All staff/contractors with PHI access trained and documented'),
('h13','hipaa','Administrative','Incident Response Plan','Written breach response: detect → contain → notify HHS within 60 days'),
('h14','hipaa','Administrative','Data Retention Policy','Defined schedule for how long PHI is kept and secure deletion process'),
('h15','hipaa','Administrative','Contractor Confidentiality Agreements','All contractors with system access have signed confidentiality agreements'),
('h16','hipaa','Administrative','Patient Right to Access Workflow','Patients can request/export their own data within 30 days'),
('h17','hipaa','Physical','Workstation Screen Lock Policy','Auto-lock after inactivity on all devices used to access PHI'),
('h18','hipaa','Physical','Device Inventory','List of all devices that access PHI — with encryption status'),
('h19','hipaa','Physical','Secure Disposal Procedure','Process for wiping devices before disposal'),
('g1','gdpr','Rights','Privacy Policy Published','Lawful basis for processing, data categories, retention periods, and user rights'),
('g2','gdpr','Rights','Cookie Consent Banner','Granular opt-in/opt-out with no pre-ticked boxes'),
('g3','gdpr','Rights','Right to Erasure Workflow','Users can request deletion of all their data within 30 days'),
('g4','gdpr','Rights','Data Portability Export','Users can download their data in machine-readable format'),
('g5','gdpr','Rights','Right to Rectification','Users can correct inaccurate personal data'),
('g6','gdpr','Governance','Data Processing Agreements (DPAs)','DPAs signed with Supabase, Neon, Netlify, and all EU-accessible vendors'),
('g7','gdpr','Governance','Lawful Basis Documented','Consent or legitimate interest documented for each processing activity'),
('g8','gdpr','Governance','Data Mapping / ROPA','Record of Processing Activities — every data flow documented'),
('g9','gdpr','Governance','72-Hour Breach Notification Procedure','Process to notify supervisory authority within 72 hours'),
('g10','gdpr','Governance','DPO Determination Documented','Assessment of whether a Data Protection Officer is required'),
('s1','soc2','CC1 – Control Environment','Security Policy Established','Formal information security policy reviewed and approved'),
('s2','soc2','CC2 – Communication','Security Responsibilities Communicated','All staff understand their security obligations'),
('s3','soc2','CC6 – Logical Access','Access Control Policy','Least-privilege access, unique accounts, and access reviews documented'),
('s4','soc2','CC6 – Logical Access','MFA on All Systems','Multi-factor authentication enforced on production systems'),
('s5','soc2','CC6 – Logical Access','Offboarding Procedure','Access revoked within 24 hours of contractor/employee termination'),
('s6','soc2','CC7 – System Operations','Monitoring & Alerting','Automated alerts for anomalous activity (failed logins, errors)'),
('s7','soc2','CC7 – System Operations','Vulnerability Management','Regular dependency scans and patching process documented'),
('s8','soc2','CC8 – Change Management','Change Management Process','Code changes reviewed and tested before production deployment'),
('s9','soc2','CC9 – Risk Mitigation','Vendor Risk Management','All third-party vendors assessed for security posture'),
('s10','soc2','A1 – Availability','Business Continuity Plan','Recovery time objectives and backup/restore procedures documented'),
('s11','soc2','A1 – Availability','Uptime Monitoring','Automated uptime monitoring with alerts'),
('s12','soc2','C1 – Confidentiality','Data Classification Policy','PHI, PII, and confidential data labeled and handled per defined rules')
ON CONFLICT (id) DO NOTHING;
INSERT INTO compliance_vendors (id, name, type, baa_status, notes) VALUES
('v1','Supabase','Authentication / Database','pending','Primary auth provider — BAA required for HIPAA'),
('v2','Neon PostgreSQL','Database','pending','Medication & program data — BAA required for HIPAA'),
('v3','Netlify','Hosting / CDN','pending','Front-end deployment — confirm HIPAA addendum availability'),
('v4','Stripe','Payment Processing','n/a','Payment only — no PHI stored; confirm no PHI in metadata'),
('v5','Epic (App Orchard)','EHR / FHIR Integration','pending','Covered Entity relationship — requires separate Epic agreements'),
('v6','Email Provider','Email / Notifications','pending','If any PHI in emails, BAA required')
ON CONFLICT (id) DO NOTHING;
INSERT INTO compliance_policies (id, name, framework, status) VALUES
('p1','HIPAA Security Policy','HIPAA','draft'),
('p2','Privacy Policy (Public)','HIPAA / GDPR','not-started'),
('p3','Incident Response Plan','HIPAA / SOC 2','not-started'),
('p4','Data Retention & Deletion Policy','HIPAA / GDPR','not-started'),
('p5','Access Control Policy','HIPAA / SOC 2','not-started'),
('p6','Business Continuity Plan','SOC 2','not-started'),
('p7','Acceptable Use Policy','SOC 2 / ISO 27001','not-started'),
('p8','Risk Assessment Document','HIPAA / ISO 27001','not-started'),
('p9','Workforce Training Log','HIPAA','not-started'),
('p10','GDPR Record of Processing Activities (ROPA)','GDPR','not-started')
ON CONFLICT (id) DO NOTHING;
INSERT INTO compliance_risks (id, description, likelihood, impact, mitigation, status) VALUES
('r1','PHI exposed via improperly secured Supabase Row-Level Security policy','medium','high','Audit all RLS policies; test with non-admin credentials','open'),
('r2','No audit log — breach goes undetected','high','high','Implement database audit logging before go-live','open'),
('r3','Session does not expire — shared computer access risk','medium','medium','Add 20-minute idle timeout to Supabase auth config','open'),
('r4','Epic FHIR token mishandled — exposed in logs or client-side storage','low','high','Store tokens server-side only; never in localStorage','open'),
('r5','Contractor with codebase access not under NDA','medium','high','Require signed confidentiality agreement before repo access','open')
ON CONFLICT (id) DO NOTHING;
