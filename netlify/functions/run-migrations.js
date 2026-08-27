// netlify/functions/run-migrations.js
// Scheduled nightly at a low-traffic hour (see netlify.toml). Applies any
// registered schema migrations that have not run yet, recording each in a
// schema_migrations table so every migration is applied exactly once — the
// schedule only controls WHEN a newly shipped migration takes effect.
//
// To ship a new migration: add the .sql file to db/migrations/ as usual, then
// register its statements in MIGRATIONS below. Statements must be idempotent
// (IF NOT EXISTS / IF EXISTS) so a partial failure can safely re-run the next
// night. Migrations older than 043 predate this runner and were applied
// manually via the Neon SQL editor.
//
// Runs only as a Netlify scheduled function or with a valid admin token, so
// it cannot be triggered anonymously.

const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

// Ordered registry of migrations this runner manages. Each id matches the
// corresponding file in db/migrations/ (the file remains the source of truth
// for anyone applying migrations manually).
const MIGRATIONS = [
  {
    id: '043_events_language',
    statements: [
      (sql) => sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS lang TEXT`,
      (sql) => sql`CREATE INDEX IF NOT EXISTS idx_events_lang ON events(lang)`,
    ],
  },
  {
    // Client-tracked program clicks landed with program_type NULL, so the
    // reporting dashboard grouped them under a blank type and dropped them
    // whenever someone filtered by type. event.js now derives the type from
    // the event name; this repairs the rows written before that. The NULL
    // guard makes each statement a no-op once applied.
    id: '044_backfill_event_program_type',
    statements: [
      (sql) => sql`UPDATE events SET program_type = 'copay' WHERE program_type IS NULL AND event_name = 'copay_card_click'`,
      (sql) => sql`UPDATE events SET program_type = 'pap' WHERE program_type IS NULL AND event_name = 'pap_click'`,
      (sql) => sql`UPDATE events SET program_type = 'foundation' WHERE program_type IS NULL AND event_name = 'foundation_click'`,
    ],
  },
  {
    // Program clicks on a raw manufacturer URL carried no programId, and
    // getEventsByProgram filters on program_id IS NOT NULL — so they vanished
    // from the Programs dashboard rather than merely losing attribution.
    // event.js now buckets them as 'unlisted'; this applies it to existing
    // rows. Runs after 044, which sets the program_type this guard keys off.
    id: '045_backfill_unlisted_program_id',
    statements: [
      (sql) => sql`UPDATE events SET program_id = 'unlisted' WHERE program_id IS NULL AND program_type IS NOT NULL`,
    ],
  },
  {
    // Veloxis runs no PAP for Envarsus XR (verified by phone). Its pap_url
    // pointed at the copay savings page, so the wizard and card offered a
    // "free if eligible" program to exactly the patients a copay card can't
    // serve. Pairs with the src/data/medications.json change — the runtime
    // merges DB over JSON with `dbMed.papUrl || fallbackMed.papUrl`, so
    // clearing one side alone leaves the bad link in place.
    id: '046_envarsus_no_pap',
    statements: [
      (sql) => sql`UPDATE medications SET pap_url = NULL, pap_program_id = NULL WHERE id = 'envarsus-xr' AND (pap_url IS NOT NULL OR pap_program_id IS NOT NULL)`,
    ],
  },
  {
    // The 'mycophenolate' row WAS CellCept (brand, Genentech, brand PAP)
    // while the homepage chip, Epic import, and its own price estimates all
    // treated the id as the generic — so the "Mycophenolate generic" chip
    // delivered CellCept and routed to a brand PAP, in both languages. Make
    // the id the generic and add 'cellcept' for the brand, mirroring the
    // tacrolimus/Prograf pair. Pairs with the medications.json change (the
    // runtime merges DB over JSON). The UPDATE keys on the stale brand_name,
    // so a re-run is a no-op; the INSERT is ON CONFLICT DO NOTHING.
    id: '047_split_mycophenolate_generic',
    statements: [
      (sql) => sql`UPDATE medications SET brand_name = 'Mycophenolate Mofetil (generic)', manufacturer = 'Generic', pap_url = NULL, pap_program_id = NULL, copay_url = NULL, copay_program_id = NULL, cost_tier = 'low', typical_copay_tier = '1' WHERE id = 'mycophenolate' AND brand_name = 'CellCept'`,
      (sql) => sql`INSERT INTO medications (id, brand_name, generic_name, rxcui, category, manufacturer, stage, common_organs, pap_url, pap_program_id, copay_url, copay_program_id, cost_tier, generic_available, typical_copay_tier) VALUES ('cellcept', 'CellCept', 'Mycophenolate Mofetil', NULL, 'Immunosuppressant', 'Genentech', 'Post-transplant', ARRAY['Kidney','Liver','Heart','Lung','Pancreas'], 'https://www.genentech-access.com/patient.html', 'genentech-pap', 'https://www.genentech-access.com/patient.html', 'genentech-copay', 'medium', TRUE, '2') ON CONFLICT (id) DO NOTHING`,
    ],
  },
  {
    // `category` mixed drug classes ('NSAID') with conditions ('Diabetes')
    // and carried synonyms side by side — 'Pain Relief' and 'Pain Management'
    // were two groups holding three opioids between them — so nothing in the
    // table said what a medication is FOR. Adds `condition`, backfilled from
    // src/data/conditions.json (the single source for the taxonomy), and
    // collapses the duplicate category names plus the database's plural
    // spellings onto the site's vocabulary. Pairs with the
    // src/data/medications.json change (the runtime merges DB over JSON, so
    // rows left without a condition would override it with nulls). The
    // column is quoted because CONDITION is a reserved word in the SQL
    // standard. Category UPDATEs stop matching once applied and every
    // condition UPDATE is guarded by IS DISTINCT FROM, so a re-run is a no-op.
    id: '048_add_medication_condition',
    statements: [
      (sql) => sql`ALTER TABLE medications ADD COLUMN IF NOT EXISTS "condition" TEXT`,
      (sql) => sql`CREATE INDEX IF NOT EXISTS idx_medications_condition ON medications("condition")`,
      (sql) => sql`UPDATE medications SET category = 'Pain Management' WHERE category = 'Pain Relief'`,
      (sql) => sql`UPDATE medications SET category = 'Anemia' WHERE category = 'Anemia (ESRD)'`,
      (sql) => sql`UPDATE medications SET category = 'Kidney Support' WHERE category = 'Phosphate Binder (ESRD)'`,
      (sql) => sql`UPDATE medications SET category = 'Asthma Biologic' WHERE category = 'Asthma Biologic / Allergy'`,
      (sql) => sql`UPDATE medications SET category = 'Immunosuppressant' WHERE category = 'Immunosuppressants'`,
      (sql) => sql`UPDATE medications SET category = 'Anti-viral' WHERE category = 'Antivirals'`,
      (sql) => sql`UPDATE medications SET category = 'Anti-fungal' WHERE category = 'Antifungals'`,
      (sql) => sql`UPDATE medications SET category = 'Steroid' WHERE category = 'Steroids'`,
      (sql) => sql`UPDATE medications SET category = 'Diuretic' WHERE category = 'Diuretics'`,
      (sql) => sql`UPDATE medications SET category = 'Induction' WHERE category = 'Induction Agents'`,
      (sql) => sql`UPDATE medications SET category = 'Anticoagulant' WHERE category = 'Anticoagulation'`,
      (sql) => sql`UPDATE medications m SET "condition" = c.condition FROM (VALUES ('Immunosuppressant', 'rejection-prevention'), ('Induction', 'rejection-prevention'), ('Steroid', 'rejection-prevention'), ('Acute Rejection', 'rejection-treatment'), ('Antibody-Mediated Rejection', 'rejection-treatment'), ('Anti-viral', 'infection'), ('Anti-fungal', 'infection'), ('Antibiotic', 'infection'), ('Inhaled Antibiotic', 'infection'), ('Infection Prevention', 'infection'), ('Hepatitis B/C', 'hepatitis'), ('Liver Support', 'liver-disease'), ('Beta Blocker', 'liver-disease'), ('Kidney Support', 'kidney-disease'), ('Anemia', 'anemia'), ('Blood Support', 'low-white-cells'), ('Anticoagulant', 'blood-clots'), ('Antiplatelet', 'blood-clots'), ('Blood Pressure', 'high-blood-pressure'), ('Heart Failure', 'heart-failure'), ('Antiarrhythmic', 'heart-rhythm'), ('Cholesterol', 'high-cholesterol'), ('Diuretic', 'fluid-retention'), ('Pulmonary Hypertension', 'pulmonary-hypertension'), ('Respiratory', 'asthma-copd'), ('Bronchodilator', 'asthma-copd'), ('Inhaled Corticosteroid', 'asthma-copd'), ('Leukotriene Modifier', 'asthma-copd'), ('Asthma Biologic', 'asthma-copd'), ('Mast Cell Stabilizer', 'asthma-copd'), ('Cystic Fibrosis', 'cystic-fibrosis'), ('Mucolytic', 'cystic-fibrosis'), ('Pulmonary Fibrosis', 'pulmonary-fibrosis'), ('Antihistamine', 'allergies'), ('Nasal Corticosteroid', 'allergies'), ('Nasal Antihistamine', 'allergies'), ('Diabetes', 'diabetes'), ('Thyroid', 'thyroid'), ('Gout', 'gout'), ('GI / Acid Suppression', 'acid-reflux'), ('GI Support', 'digestive'), ('Antiemetic', 'digestive'), ('Enzymes', 'pancreatic-insufficiency'), ('Pain Management', 'pain'), ('NSAID', 'pain'), ('Mental Health', 'mental-health'), ('Antipsychotic', 'mental-health'), ('Vitamin', 'nutrition'), ('Supplement', 'nutrition'), ('Electrolyte', 'electrolytes') ) AS c(category, condition) WHERE m.category = c.category AND m.id NOT IN ('ferrous-sulfate', 'hydrochlorothiazide', 'chlorthalidone') AND m."condition" IS DISTINCT FROM c.condition`,
      (sql) => sql`UPDATE medications SET "condition" = 'anemia' WHERE id = 'ferrous-sulfate' AND "condition" IS DISTINCT FROM 'anemia'`,
      (sql) => sql`UPDATE medications SET "condition" = 'high-blood-pressure' WHERE id = 'hydrochlorothiazide' AND "condition" IS DISTINCT FROM 'high-blood-pressure'`,
      (sql) => sql`UPDATE medications SET "condition" = 'high-blood-pressure' WHERE id = 'chlorthalidone' AND "condition" IS DISTINCT FROM 'high-blood-pressure'`,
    ],
  },
  {
    // Same-day escalation contact for enterprise centers: the emergency
    // guidance page leads with a center-branded "call your center now"
    // step when an organization has configured one (PR #832). Both columns
    // optional; NULL hides the step, so the public site and unconfigured
    // tenants are unchanged. Editable in the admin Organization Settings.
    id: '049_org_escalation_contact',
    statements: [
      (sql) => sql`ALTER TABLE organizations ADD COLUMN IF NOT EXISTS escalation_phone TEXT`,
      (sql) => sql`ALTER TABLE organizations ADD COLUMN IF NOT EXISTS escalation_contact TEXT`,
    ],
  },
];

const JWT_SECRET = process.env.JWT_SECRET;
const LEGACY_TOKEN_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD;

function verifyToken(token, secret, check) {
  try {
    const [data, signature] = token.split('.');
    const expected = crypto.createHmac('sha256', secret).update(data).digest('hex');
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    return check(payload) ? payload : null;
  } catch {
    return null;
  }
}

function isAuthorized(event) {
  const authHeader = event.headers?.['authorization'] || event.headers?.['Authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.substring(7);
  return !!(
    verifyToken(token, JWT_SECRET, p => p.role === 'super_admin' || p.role === 'org_admin') ||
    verifyToken(token, LEGACY_TOKEN_SECRET, p => p.type === 'admin')
  );
}

function isScheduledInvocation(event) {
  try {
    return !!JSON.parse(event.body || '{}').next_run;
  } catch {
    return false;
  }
}

exports.handler = async (event) => {
  const scheduled = isScheduledInvocation(event);
  if (!scheduled && !isAuthorized(event)) {
    return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const sql = neon(process.env.DATABASE_URL);
  const results = {};

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    const appliedRows = await sql`SELECT id FROM schema_migrations`;
    const applied = new Set(appliedRows.map(r => r.id));

    for (const migration of MIGRATIONS) {
      if (applied.has(migration.id)) {
        results[migration.id] = 'already applied';
        continue;
      }
      // Stop at the first failure so migrations always apply in order; the
      // failed migration re-runs on the next scheduled invocation.
      try {
        for (const statement of migration.statements) {
          await statement(sql);
        }
        await sql`INSERT INTO schema_migrations (id) VALUES (${migration.id})`;
        results[migration.id] = 'applied';
      } catch (e) {
        results[migration.id] = `failed: ${e.message}`;
        break;
      }
    }
  } catch (e) {
    console.error('[run-migrations] error:', e.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message, results }),
    };
  }

  console.log('[run-migrations]', JSON.stringify(results));
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ results }),
  };
};
