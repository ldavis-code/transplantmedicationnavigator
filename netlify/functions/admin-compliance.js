/**
 * Admin Compliance Dashboard API
 * Provides medication adherence metrics, risk stratification, and audit logging
 *
 * GET /api/admin-compliance/summary - Overall compliance summary
 * GET /api/admin-compliance/patients - Patient-level compliance list
 * GET /api/admin-compliance/trends - Compliance trend data over time
 * GET /api/admin-compliance/audit-log - Audit log entries
 * GET /api/admin-compliance/settings - Org compliance threshold settings
 * GET /api/admin-compliance/interventions?patient_id=X - Patient interventions
 * POST /api/admin-compliance/audit-log - Record an audit action
 * POST /api/admin-compliance/settings - Update org threshold settings
 * POST /api/admin-compliance/interventions - Record a patient intervention
 */

const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

let _sql;
function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not configured. Set it in Netlify Dashboard > Site Settings > Environment Variables.'
    );
  }
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

function checkAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const parts = authHeader.substring(7).split('.');
    const data = parts[0];
    const signature = parts[1];
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    if (payload.role !== 'super_admin' && payload.role !== 'org_admin') return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// High-priority medication categories where missed doses are more critical
var HIGH_PRIORITY_CATEGORIES = ['Immunosuppressant', 'Induction', 'Acute Rejection', 'Antibody-Mediated Rejection'];

async function getSummary(db, orgId, days) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const [summary, riskDistribution, recentEvents, immunosuppressantStats] = await Promise.all([
    db`
      SELECT
        COUNT(DISTINCT patient_id) AS total_patients,
        ROUND(AVG(adherence_rate)::numeric, 1) AS avg_adherence_rate,
        SUM(doses_scheduled) AS total_scheduled,
        SUM(doses_taken) AS total_taken,
        SUM(doses_missed) AS total_missed,
        SUM(doses_late) AS total_late,
        COUNT(*) FILTER (WHERE risk_level = 'critical') AS critical_count,
        COUNT(*) FILTER (WHERE risk_level = 'high') AS high_risk_count,
        COUNT(*) FILTER (WHERE risk_level = 'medium') AS medium_risk_count,
        COUNT(*) FILTER (WHERE risk_level = 'low') AS low_risk_count
      FROM compliance_scores
      WHERE score_date >= ${cutoff}::date
        AND (${orgId ? orgId : null}::int IS NULL OR org_id = ${orgId})
    `,
    db`
      SELECT risk_level, COUNT(DISTINCT patient_id) AS patient_count
      FROM compliance_scores
      WHERE score_date >= ${cutoff}::date
        AND (${orgId ? orgId : null}::int IS NULL OR org_id = ${orgId})
      GROUP BY risk_level
      ORDER BY CASE risk_level
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END
    `,
    db`
      SELECT event_type, COUNT(*) AS count
      FROM compliance_events
      WHERE recorded_at >= ${cutoff}
        AND (${orgId ? orgId : null}::int IS NULL OR org_id = ${orgId})
      GROUP BY event_type
      ORDER BY count DESC
    `,
    db`
      SELECT
        COUNT(DISTINCT cs.patient_id) AS patients_tracked,
        ROUND(AVG(cs.adherence_rate)::numeric, 1) AS avg_adherence,
        SUM(cs.doses_missed) AS doses_missed,
        COUNT(DISTINCT cs.patient_id) FILTER (WHERE cs.risk_level IN ('high', 'critical')) AS high_risk_count
      FROM compliance_scores cs
      INNER JOIN medications m ON cs.medication_id = m.id
      WHERE cs.score_date >= ${cutoff}::date
        AND m.category = ANY(${HIGH_PRIORITY_CATEGORIES})
        AND (${orgId ? orgId : null}::int IS NULL OR cs.org_id = ${orgId})
    `,
  ]);

  const s = summary[0] || {};
  const imm = immunosuppressantStats[0] || {};
  return {
    totalPatients: parseInt(s.total_patients || 0),
    avgAdherenceRate: parseFloat(s.avg_adherence_rate || 0),
    totalScheduled: parseInt(s.total_scheduled || 0),
    totalTaken: parseInt(s.total_taken || 0),
    totalMissed: parseInt(s.total_missed || 0),
    totalLate: parseInt(s.total_late || 0),
    riskDistribution: riskDistribution.map(function(r) {
      return { level: r.risk_level, count: parseInt(r.patient_count) };
    }),
    criticalCount: parseInt(s.critical_count || 0),
    highRiskCount: parseInt(s.high_risk_count || 0),
    mediumRiskCount: parseInt(s.medium_risk_count || 0),
    lowRiskCount: parseInt(s.low_risk_count || 0),
    eventBreakdown: recentEvents.map(function(e) {
      return { type: e.event_type, count: parseInt(e.count) };
    }),
    immunosuppressants: {
      patientsTracked: parseInt(imm.patients_tracked || 0),
      avgAdherence: parseFloat(imm.avg_adherence || 0),
      dosesMissed: parseInt(imm.doses_missed || 0),
      highRiskCount: parseInt(imm.high_risk_count || 0),
    },
  };
}

async function getPatients(db, orgId, days, riskFilter, page, limit) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const offset = (page - 1) * limit;

  const [patients, countResult] = await Promise.all([
    db`
      SELECT
        cs.patient_id,
        ROUND(AVG(cs.adherence_rate)::numeric, 1) AS avg_adherence,
        SUM(cs.doses_scheduled) AS total_scheduled,
        SUM(cs.doses_taken) AS total_taken,
        SUM(cs.doses_missed) AS total_missed,
        COUNT(DISTINCT cs.medication_id) AS medication_count,
        MAX(cs.score_date) AS last_score_date,
        MODE() WITHIN GROUP (ORDER BY cs.risk_level) AS primary_risk_level,
        BOOL_OR(m.category = ANY(${HIGH_PRIORITY_CATEGORIES})) AS has_high_priority_meds,
        ARRAY_AGG(DISTINCT cs.medication_id) FILTER (WHERE m.category = ANY(${HIGH_PRIORITY_CATEGORIES})) AS high_priority_med_ids
      FROM compliance_scores cs
      LEFT JOIN medications m ON cs.medication_id = m.id
      WHERE cs.score_date >= ${cutoff}::date
        AND (${orgId ? orgId : null}::int IS NULL OR cs.org_id = ${orgId})
        AND (${riskFilter || null}::text IS NULL OR cs.risk_level = ${riskFilter})
      GROUP BY cs.patient_id
      ORDER BY avg_adherence ASC
      LIMIT ${limit} OFFSET ${offset}
    `,
    db`
      SELECT COUNT(DISTINCT patient_id) AS total
      FROM compliance_scores
      WHERE score_date >= ${cutoff}::date
        AND (${orgId ? orgId : null}::int IS NULL OR org_id = ${orgId})
        AND (${riskFilter || null}::text IS NULL OR risk_level = ${riskFilter})
    `,
  ]);

  return {
    patients: patients.map(function(p) {
      return {
        patientId: p.patient_id,
        avgAdherence: parseFloat(p.avg_adherence),
        totalScheduled: parseInt(p.total_scheduled),
        totalTaken: parseInt(p.total_taken),
        totalMissed: parseInt(p.total_missed),
        medicationCount: parseInt(p.medication_count),
        lastScoreDate: p.last_score_date,
        riskLevel: p.primary_risk_level,
        hasHighPriorityMeds: p.has_high_priority_meds || false,
        highPriorityMedIds: p.high_priority_med_ids || [],
      };
    }),
    total: parseInt((countResult[0] && countResult[0].total) || 0),
    page: page,
    limit: limit,
  };
}

async function getTrends(db, orgId, days) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const trends = await db`
    SELECT
      DATE_TRUNC('week', score_date) AS week,
      ROUND(AVG(adherence_rate)::numeric, 1) AS avg_adherence,
      COUNT(DISTINCT patient_id) AS patient_count,
      SUM(doses_taken) AS doses_taken,
      SUM(doses_missed) AS doses_missed,
      COUNT(*) FILTER (WHERE risk_level IN ('high', 'critical')) AS high_risk_count
    FROM compliance_scores
    WHERE score_date >= ${cutoff}::date
      AND (${orgId ? orgId : null}::int IS NULL OR org_id = ${orgId})
    GROUP BY DATE_TRUNC('week', score_date)
    ORDER BY week ASC
  `;

  return trends.map(function(t) {
    return {
      week: t.week,
      avgAdherence: parseFloat(t.avg_adherence),
      patientCount: parseInt(t.patient_count),
      dosesTaken: parseInt(t.doses_taken),
      dosesMissed: parseInt(t.doses_missed),
      highRiskCount: parseInt(t.high_risk_count),
    };
  });
}

async function getAuditLog(db, orgId, page, limit) {
  const offset = (page - 1) * limit;

  const logs = await db`
    SELECT
      cal.id, cal.action, cal.target_patient_id, cal.target_medication_id,
      cal.details, cal.created_at, u.name AS admin_name, u.email AS admin_email
    FROM compliance_audit_log cal
    LEFT JOIN users u ON cal.admin_user_id = u.id
    WHERE (${orgId ? orgId : null}::int IS NULL OR cal.org_id = ${orgId})
    ORDER BY cal.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return logs.map(function(l) {
    return {
      id: l.id,
      action: l.action,
      targetPatientId: l.target_patient_id,
      targetMedicationId: l.target_medication_id,
      details: l.details,
      createdAt: l.created_at,
      adminName: l.admin_name,
      adminEmail: l.admin_email,
    };
  });
}

async function getSettings(db, orgId) {
  const rows = await db`
    SELECT critical_threshold, high_threshold, medium_threshold
    FROM org_compliance_settings
    WHERE org_id = ${orgId}
  `;
  return rows[0] || { critical_threshold: 50, high_threshold: 70, medium_threshold: 85 };
}

async function updateSettings(db, orgId, body) {
  var critical = parseFloat(body.criticalThreshold);
  var high = parseFloat(body.highThreshold);
  var medium = parseFloat(body.mediumThreshold);

  if (isNaN(critical) || isNaN(high) || isNaN(medium)) {
    throw new Error('All thresholds must be numbers');
  }
  if (critical >= high || high >= medium || medium > 100 || critical < 0) {
    throw new Error('Thresholds must be: 0 <= critical < high < medium <= 100');
  }

  const result = await db`
    INSERT INTO org_compliance_settings (org_id, critical_threshold, high_threshold, medium_threshold)
    VALUES (${orgId}, ${critical}, ${high}, ${medium})
    ON CONFLICT (org_id)
    DO UPDATE SET critical_threshold = ${critical}, high_threshold = ${high}, medium_threshold = ${medium}, updated_at = NOW()
    RETURNING critical_threshold, high_threshold, medium_threshold
  `;
  return result[0];
}

async function getInterventions(db, orgId, patientId) {
  const interventions = await db`
    SELECT ci.id, ci.patient_id, ci.medication_id, ci.intervention_type, ci.notes,
           ci.outcome, ci.created_at, u.name AS created_by_name, u.email AS created_by_email
    FROM compliance_interventions ci
    LEFT JOIN users u ON ci.created_by = u.id
    WHERE ci.patient_id = ${patientId}
      AND (${orgId ? orgId : null}::int IS NULL OR ci.org_id = ${orgId})
    ORDER BY ci.created_at DESC
    LIMIT 50
  `;
  return interventions.map(function(i) {
    return {
      id: i.id,
      patientId: i.patient_id,
      medicationId: i.medication_id,
      interventionType: i.intervention_type,
      notes: i.notes,
      outcome: i.outcome,
      createdAt: i.created_at,
      createdByName: i.created_by_name,
      createdByEmail: i.created_by_email,
    };
  });
}

async function createIntervention(db, orgId, userId, body) {
  var { patientId, medicationId, interventionType, notes, outcome } = body;
  var validTypes = ['phone_call', 'message', 'in_person', 'care_plan_update', 'referral', 'other'];
  if (!patientId || !interventionType || !notes) {
    throw new Error('patientId, interventionType, and notes are required');
  }
  if (!validTypes.includes(interventionType)) {
    throw new Error('Invalid interventionType. Must be one of: ' + validTypes.join(', '));
  }

  const result = await db`
    INSERT INTO compliance_interventions (org_id, patient_id, medication_id, intervention_type, notes, outcome, created_by)
    VALUES (${orgId || null}, ${patientId}, ${medicationId || null}, ${interventionType}, ${notes}, ${outcome || null}, ${userId || null})
    RETURNING id, created_at
  `;
  return { id: result[0].id, createdAt: result[0].created_at };
}

async function createAuditEntry(db, orgId, userId, body) {
  const { action, targetPatientId, targetMedicationId, details } = body;

  const validActions = ['review', 'flag', 'dismiss', 'escalate', 'note', 'export'];
  if (!action || !validActions.includes(action)) {
    throw new Error('Invalid action. Must be one of: ' + validActions.join(', '));
  }

  const result = await db`
    INSERT INTO compliance_audit_log (org_id, admin_user_id, action, target_patient_id, target_medication_id, details)
    VALUES (${orgId || null}, ${userId || null}, ${action}, ${targetPatientId || null}, ${targetMedicationId || null}, ${JSON.stringify(details || {})})
    RETURNING id, created_at
  `;

  return { id: result[0].id, createdAt: result[0].created_at };
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: headers, body: '' };
  }

  const auth = checkAuth(event);
  if (!auth) {
    return { statusCode: 401, headers: headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const path = (event.path || '').replace(/^\/\.netlify\/functions\/admin-compliance\/?/, '').replace(/^api\/admin-compliance\/?/, '');
  const params = event.queryStringParameters || {};
  const orgId = auth.org_id || null;

  try {
    const db = getDb();

    // POST endpoints
    if (event.httpMethod === 'POST') {
      if (path === 'audit-log') {
        const body = JSON.parse(event.body || '{}');
        const result = await createAuditEntry(db, orgId, auth.user_id, body);
        return { statusCode: 201, headers: headers, body: JSON.stringify(result) };
      }
      if (path === 'settings') {
        if (!orgId) return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'Org context required' }) };
        const body = JSON.parse(event.body || '{}');
        const result = await updateSettings(db, orgId, body);
        return { statusCode: 200, headers: headers, body: JSON.stringify(result) };
      }
      if (path === 'interventions') {
        const body = JSON.parse(event.body || '{}');
        const result = await createIntervention(db, orgId, auth.user_id, body);
        return { statusCode: 201, headers: headers, body: JSON.stringify(result) };
      }
      return { statusCode: 404, headers: headers, body: JSON.stringify({ error: 'Not found' }) };
    }

    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, headers: headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    // GET endpoints
    const days = parseInt(params.days) || 30;

    if (path === '' || path === 'summary') {
      const summary = await getSummary(db, orgId, days);
      return { statusCode: 200, headers: headers, body: JSON.stringify(summary) };
    }

    if (path === 'patients') {
      const page = parseInt(params.page) || 1;
      const limit = Math.min(parseInt(params.limit) || 25, 100);
      const risk = params.risk || null;
      const result = await getPatients(db, orgId, days, risk, page, limit);
      return { statusCode: 200, headers: headers, body: JSON.stringify(result) };
    }

    if (path === 'trends') {
      const trends = await getTrends(db, orgId, days);
      return { statusCode: 200, headers: headers, body: JSON.stringify({ trends: trends }) };
    }

    if (path === 'audit-log') {
      const page = parseInt(params.page) || 1;
      const limit = Math.min(parseInt(params.limit) || 25, 100);
      const logs = await getAuditLog(db, orgId, page, limit);
      return { statusCode: 200, headers: headers, body: JSON.stringify({ logs: logs }) };
    }

    if (path === 'settings') {
      const settings = await getSettings(db, orgId);
      return { statusCode: 200, headers: headers, body: JSON.stringify(settings) };
    }

    if (path === 'interventions') {
      const patientId = params.patient_id;
      if (!patientId) return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'patient_id required' }) };
      const interventions = await getInterventions(db, orgId, patientId);
      return { statusCode: 200, headers: headers, body: JSON.stringify({ interventions: interventions }) };
    }

    return { statusCode: 404, headers: headers, body: JSON.stringify({ error: 'Not found' }) };
  } catch (error) {
    console.error('Compliance API error:', error);

    // If the compliance tables don't exist yet, return empty data instead of an error
    const isTableMissing = error.message?.includes('does not exist') && error.message?.includes('relation');
    if (isTableMissing) {
      const emptyData = {
        totalPatients: 0, avgAdherenceRate: 0, totalScheduled: 0, totalTaken: 0,
        totalMissed: 0, totalLate: 0, riskDistribution: [], criticalCount: 0,
        highRiskCount: 0, mediumRiskCount: 0, lowRiskCount: 0, eventBreakdown: [],
      };
      return { statusCode: 200, headers: headers, body: JSON.stringify(emptyData) };
    }

    const isEnvError = error.message?.includes('is not configured') || error.message?.includes('DATABASE_URL');
    return {
      statusCode: isEnvError ? 503 : 500,
      headers: headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
