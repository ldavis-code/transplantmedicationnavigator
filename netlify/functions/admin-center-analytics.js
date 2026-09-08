/**
 * Admin Center Analytics API
 * Per-transplant-center engagement reporting for pilot programs.
 *
 * A center's patients carry a partner slug (events.partner) once they arrive
 * through /pilot/<slug> or a ?partner=<slug> link. This endpoint rolls those
 * events up for one center and, when the pilot has an epic_org_id, adds the
 * center's EHR-launch logins (patient_login_tracking + fhir_endpoint_directory).
 * Pilot definitions (name, window, targets) live in pilot_programs (052).
 *
 * Aggregate counts only. No patient identifiers are stored or returned.
 *
 * Auth: same Bearer JWT scheme as the other admin endpoints (super_admin / org_admin).
 *
 * GET  ?                           -> { pilots, partners }   pilot registry + partner tags seen in events
 * GET  ?partner=slug&days=90       -> full analytics for one center over the window
 *      days = number | 'all' | 'pilot' ('pilot' = the pilot's own start/end dates)
 * GET  ?partner=slug&days=90&format=csv -> CSV download of the same numbers
 * POST { partnerSlug, centerName, ... } -> create or update a pilot definition
 * DELETE ?partner=slug              -> remove a pilot definition (events are untouched)
 */

// CommonJS on purpose: Netlify bundles functions to CJS, where import.meta is
// empty, so an ESM createRequire(import.meta.url) throws at load time (502).
// admin-impact.js uses this same shape and requires the same JSON.
const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
const programsJson = require('../../src/data/programs.json');

// programId -> { name, manufacturer } for labelling the top-programs table.
const PROGRAM_INFO = {};
for (const section of ['copayPrograms', 'papPrograms', 'foundationPrograms']) {
  for (const [id, prog] of Object.entries(programsJson[section] || {})) {
    PROGRAM_INFO[id] = { name: prog.name || id, manufacturer: prog.manufacturer || null };
  }
}

const JWT_SECRET = process.env.JWT_SECRET;

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
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

function checkAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const [data, signature] = authHeader.substring(7).split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    if (payload.role !== 'super_admin' && payload.role !== 'org_admin') return null;
    return payload;
  } catch {
    return null;
  }
}

const toInt = (v) => (v == null ? 0 : Number(v));
const json = (statusCode, data) => ({ statusCode, headers, body: JSON.stringify(data) });
const pct = (num, den) => (den > 0 ? Math.round((num / den) * 100) : 0);

const PROGRAM_CLICKS = ['copay_card_click', 'foundation_click', 'pap_click'];
const VALID_STATUS = ['planned', 'active', 'completed', 'paused'];

// Partner slugs are sanitized the same way event.js sanitizes them on write,
// so a slug that survives here can match stored rows exactly.
function cleanSlug(raw) {
  return String(raw || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50).toLowerCase();
}

function cleanDate(raw) {
  if (!raw) return null;
  const s = String(raw).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

function cleanInt(raw) {
  if (raw === '' || raw == null) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function cleanText(raw, max = 200) {
  if (raw == null) return null;
  const s = String(raw).trim().slice(0, max);
  return s.length ? s : null;
}

function rowToPilot(r) {
  if (!r) return null;
  return {
    id: toInt(r.id),
    partnerSlug: r.partner_slug,
    centerName: r.center_name,
    epicOrgId: r.epic_org_id,
    status: r.status,
    startDate: r.start_date ? String(r.start_date).slice(0, 10) : null,
    endDate: r.end_date ? String(r.end_date).slice(0, 10) : null,
    targetPatients: r.target_patients == null ? null : toInt(r.target_patients),
    targetConnections: r.target_connections == null ? null : toInt(r.target_connections),
    targetQuizCompletes: r.target_quiz_completes == null ? null : toInt(r.target_quiz_completes),
    coordinatorName: r.coordinator_name,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// Resolve the reporting window to explicit ISO bounds.
//   days = N      -> last N days
//   days = 'all'  -> everything
//   days = 'pilot'-> the pilot's start/end dates (end defaults to now)
function resolvePeriod(params, pilot) {
  const raw = (params.days ?? '90').toString().toLowerCase();
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setUTCHours(23, 59, 59, 999);

  if (raw === 'pilot' && pilot && pilot.startDate) {
    const start = new Date(`${pilot.startDate}T00:00:00.000Z`);
    const end = pilot.endDate ? new Date(`${pilot.endDate}T23:59:59.999Z`) : endOfToday;
    return {
      mode: 'pilot',
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      label: `Pilot window (${pilot.startDate} to ${pilot.endDate || 'today'})`,
      days: Math.max(1, Math.round((end - start) / 86400000)),
    };
  }
  if (raw === 'all') {
    return {
      mode: 'all',
      startIso: '1970-01-01T00:00:00.000Z',
      endIso: endOfToday.toISOString(),
      label: 'All time',
      days: null,
    };
  }
  let days = parseInt(raw, 10);
  if (!Number.isFinite(days) || days <= 0) days = 90;
  days = Math.min(days, 3650);
  const start = new Date(now.getTime() - days * 86400000);
  return {
    mode: 'days',
    startIso: start.toISOString(),
    endIso: endOfToday.toISOString(),
    label: `Last ${days} days`,
    days,
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

async function listPilots(db) {
  try {
    const rows = await db`SELECT * FROM pilot_programs ORDER BY status = 'active' DESC, center_name`;
    return rows.map(rowToPilot);
  } catch (err) {
    // Table not migrated yet; the page still works against raw partner tags.
    console.warn('[admin-center-analytics] pilot_programs unavailable:', err.message);
    return [];
  }
}

async function getPilot(db, slug) {
  try {
    const rows = await db`SELECT * FROM pilot_programs WHERE partner_slug = ${slug} LIMIT 1`;
    return rowToPilot(rows[0]);
  } catch {
    return null;
  }
}

// Every partner tag that has produced events, with a little context so the
// admin can spot a center that is sending traffic but has no pilot record.
async function listPartnerTags(db) {
  const rows = await db`
    SELECT
      partner,
      COUNT(*)                                        AS events,
      COUNT(*) FILTER (WHERE ts >= NOW() - INTERVAL '30 days') AS last_30,
      MIN(ts)                                         AS first_seen,
      MAX(ts)                                         AS last_seen
    FROM events
    WHERE partner IS NOT NULL AND partner <> ''
    GROUP BY partner
    ORDER BY last_seen DESC
  `;
  return rows.map((r) => ({
    partner: r.partner,
    events: toInt(r.events),
    last30: toInt(r.last_30),
    firstSeen: r.first_seen,
    lastSeen: r.last_seen,
  }));
}

async function getCenterAnalytics(db, slug, pilot, period) {
  const { startIso, endIso } = period;

  const [
    totals,
    weekly,
    programs,
    medications,
    coverage,
    costBurden,
    sources,
    previous,
  ] = await Promise.all([
    // Headline counts for the window
    db`
      SELECT
        COUNT(*)                                                                  AS total_events,
        COUNT(*) FILTER (WHERE event_name = 'page_view')                         AS page_views,
        COUNT(*) FILTER (WHERE event_name = 'page_view' AND (page_source LIKE '/pilot%' OR page_source LIKE '/es/pilot%')) AS pilot_arrivals,
        COUNT(*) FILTER (WHERE event_name = 'quiz_start')                        AS quiz_starts,
        COUNT(*) FILTER (WHERE event_name = 'quiz_complete')                     AS quiz_completes,
        COUNT(*) FILTER (WHERE event_name = 'med_search')                        AS med_searches,
        COUNT(*) FILTER (WHERE event_name = 'copay_card_click')                  AS copay_clicks,
        COUNT(*) FILTER (WHERE event_name = 'pap_click')                         AS pap_clicks,
        COUNT(*) FILTER (WHERE event_name = 'foundation_click')                  AS foundation_clicks,
        COUNT(*) FILTER (WHERE event_name = 'resource_view')                     AS resource_views,
        COUNT(*) FILTER (WHERE event_name = 'epic_import')                       AS epic_imports,
        COALESCE(SUM(CASE WHEN meta_json->>'matched' ~ '^[0-9]+$' THEN (meta_json->>'matched')::int ELSE 0 END) FILTER (WHERE event_name = 'epic_import'), 0) AS epic_matched_meds,
        COUNT(*) FILTER (WHERE event_name = 'helpful_vote_yes')                  AS helpful_yes,
        COUNT(*) FILTER (WHERE event_name = 'helpful_vote_no')                   AS helpful_no,
        COUNT(*) FILTER (WHERE lang = 'es')                                      AS es_events,
        COUNT(*) FILTER (WHERE lang = 'en')                                      AS en_events,
        COUNT(DISTINCT meta_json->>'sessionId') FILTER (WHERE meta_json->>'sessionId' IS NOT NULL) AS tracked_sessions,
        COUNT(DISTINCT COALESCE(meta_json->>'sessionId', CONCAT(page_source, '-', DATE(ts)))) AS est_sessions,
        COUNT(DISTINCT DATE(ts))                                                 AS active_days,
        MIN(ts)                                                                  AS first_event,
        MAX(ts)                                                                  AS last_event
      FROM events
      WHERE partner = ${slug} AND ts >= ${startIso} AND ts <= ${endIso}
    `,
    // Week-by-week activity
    db`
      SELECT
        DATE_TRUNC('week', ts)                                                    AS week,
        COUNT(*)                                                                  AS events,
        COUNT(*) FILTER (WHERE event_name = 'page_view')                         AS page_views,
        COUNT(*) FILTER (WHERE event_name = 'quiz_complete')                     AS quiz_completes,
        COUNT(*) FILTER (WHERE event_name IN ('copay_card_click', 'foundation_click', 'pap_click')) AS connections,
        COUNT(DISTINCT COALESCE(meta_json->>'sessionId', CONCAT(page_source, '-', DATE(ts)))) AS sessions
      FROM events
      WHERE partner = ${slug} AND ts >= ${startIso} AND ts <= ${endIso}
      GROUP BY DATE_TRUNC('week', ts)
      ORDER BY week ASC
    `,
    // Which programs this center's patients connected to
    db`
      SELECT program_id, program_type, COUNT(*) AS clicks, MAX(ts) AS last_click
      FROM events
      WHERE partner = ${slug} AND program_id IS NOT NULL
        AND event_name IN ('copay_card_click', 'foundation_click', 'pap_click')
        AND ts >= ${startIso} AND ts <= ${endIso}
      GROUP BY program_id, program_type
      ORDER BY clicks DESC
      LIMIT 15
    `,
    // Medications behind those clicks (card brand name, not patient data)
    db`
      SELECT meta_json->>'medication' AS medication,
             COUNT(*) AS clicks,
             COUNT(*) FILTER (WHERE event_name = 'copay_card_click') AS copay,
             COUNT(*) FILTER (WHERE event_name = 'pap_click')        AS pap
      FROM events
      WHERE partner = ${slug} AND meta_json->>'medication' IS NOT NULL
        AND event_name IN ('copay_card_click', 'pap_click')
        AND ts >= ${startIso} AND ts <= ${endIso}
      GROUP BY meta_json->>'medication'
      ORDER BY clicks DESC
      LIMIT 12
    `,
    // Coverage mix reported in the quiz
    db`
      SELECT meta_json->>'insuranceType' AS value, COUNT(*) AS count
      FROM events
      WHERE partner = ${slug} AND event_name = 'coverage_selected'
        AND meta_json->>'insuranceType' IS NOT NULL
        AND ts >= ${startIso} AND ts <= ${endIso}
      GROUP BY meta_json->>'insuranceType'
      ORDER BY count DESC
    `,
    // Self-reported cost burden in the quiz
    db`
      SELECT meta_json->>'financialStatus' AS value, COUNT(*) AS count
      FROM events
      WHERE partner = ${slug} AND event_name = 'cost_burden'
        AND meta_json->>'financialStatus' IS NOT NULL
        AND ts >= ${startIso} AND ts <= ${endIso}
      GROUP BY meta_json->>'financialStatus'
      ORDER BY count DESC
    `,
    // Where on the site the center's patients spend their time
    db`
      SELECT page_source, COUNT(*) AS views
      FROM events
      WHERE partner = ${slug} AND event_name = 'page_view'
        AND ts >= ${startIso} AND ts <= ${endIso}
      GROUP BY page_source
      ORDER BY views DESC
      LIMIT 10
    `,
    // Same-length window immediately before this one, for trend arrows
    period.days
      ? db`
          SELECT
            COUNT(*) FILTER (WHERE event_name = 'page_view')  AS page_views,
            COUNT(*) FILTER (WHERE event_name = 'quiz_complete') AS quiz_completes,
            COUNT(*) FILTER (WHERE event_name IN ('copay_card_click', 'foundation_click', 'pap_click')) AS connections,
            COUNT(DISTINCT COALESCE(meta_json->>'sessionId', CONCAT(page_source, '-', DATE(ts)))) AS sessions
          FROM events
          WHERE partner = ${slug}
            AND ts >= ${new Date(new Date(startIso).getTime() - period.days * 86400000).toISOString()}
            AND ts < ${startIso}
        `
      : Promise.resolve([]),
  ]);

  // EHR-launch logins for the center, when the pilot is linked to an Epic org.
  let ehrLogins = null;
  if (pilot && pilot.epicOrgId) {
    try {
      const rows = await db`
        SELECT
          COUNT(*) FILTER (WHERE plt.logged_in_at >= ${startIso} AND plt.logged_in_at <= ${endIso}) AS period_logins,
          COUNT(*)                                                                                  AS all_time,
          MAX(plt.logged_in_at)                                                                     AS last_login,
          COUNT(DISTINCT fed.id)                                                                    AS endpoints
        FROM patient_login_tracking plt
        JOIN fhir_endpoint_directory fed
          ON lower(rtrim(fed.iss_url, '/')) = lower(rtrim(plt.iss_url, '/'))
        WHERE fed.epic_org_id = ${pilot.epicOrgId}
      `;
      const r = rows[0] || {};
      ehrLogins = {
        periodLogins: toInt(r.period_logins),
        allTime: toInt(r.all_time),
        lastLogin: r.last_login,
        endpoints: toInt(r.endpoints),
      };
    } catch (err) {
      console.warn('[admin-center-analytics] EHR login query failed:', err.message);
    }
  }

  const t = totals[0] || {};
  const connections = toInt(t.copay_clicks) + toInt(t.pap_clicks) + toInt(t.foundation_clicks);
  const pageViews = toInt(t.page_views);
  const quizStarts = toInt(t.quiz_starts);
  const quizCompletes = toInt(t.quiz_completes);
  const medSearches = toInt(t.med_searches);
  const sessions = toInt(t.est_sessions);
  const p = previous[0] || {};

  return {
    summary: {
      totalEvents: toInt(t.total_events),
      sessions,
      trackedSessions: toInt(t.tracked_sessions),
      pilotArrivals: toInt(t.pilot_arrivals),
      pageViews,
      quizStarts,
      quizCompletes,
      medSearches,
      connections,
      resourceViews: toInt(t.resource_views),
      epicImports: toInt(t.epic_imports),
      epicMatchedMeds: toInt(t.epic_matched_meds),
      helpfulYes: toInt(t.helpful_yes),
      helpfulNo: toInt(t.helpful_no),
      activeDays: toInt(t.active_days),
      firstEvent: t.first_event,
      lastEvent: t.last_event,
    },
    previous: period.days
      ? {
          pageViews: toInt(p.page_views),
          quizCompletes: toInt(p.quiz_completes),
          connections: toInt(p.connections),
          sessions: toInt(p.sessions),
        }
      : null,
    funnel: {
      pageViews,
      quizStarts,
      quizCompletes,
      medSearches,
      connections,
      quizStartRate: pct(quizStarts, pageViews),
      quizCompleteRate: pct(quizCompletes, quizStarts),
      medSearchRate: pct(medSearches, quizCompletes),
      connectionRate: pct(connections, medSearches),
      sessionsToConnection: pct(connections, sessions),
    },
    connectionsByType: {
      copay: toInt(t.copay_clicks),
      pap: toInt(t.pap_clicks),
      foundation: toInt(t.foundation_clicks),
    },
    language: {
      en: toInt(t.en_events),
      es: toInt(t.es_events),
      unknown: toInt(t.total_events) - toInt(t.en_events) - toInt(t.es_events),
    },
    weekly: weekly.map((w) => ({
      week: w.week,
      events: toInt(w.events),
      pageViews: toInt(w.page_views),
      quizCompletes: toInt(w.quiz_completes),
      connections: toInt(w.connections),
      sessions: toInt(w.sessions),
    })),
    programs: programs.map((r) => ({
      programId: r.program_id,
      programType: r.program_type,
      name: PROGRAM_INFO[r.program_id]?.name || r.program_id,
      manufacturer: PROGRAM_INFO[r.program_id]?.manufacturer || null,
      clicks: toInt(r.clicks),
      lastClick: r.last_click,
    })),
    medications: medications.map((r) => ({
      medication: r.medication,
      clicks: toInt(r.clicks),
      copay: toInt(r.copay),
      pap: toInt(r.pap),
    })),
    coverage: coverage.map((r) => ({ value: r.value, count: toInt(r.count) })),
    costBurden: costBurden.map((r) => ({ value: r.value, count: toInt(r.count) })),
    sources: sources.map((r) => ({ page: r.page_source, views: toInt(r.views) })),
    ehrLogins,
  };
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

function csvEscape(value) {
  if (value == null) return '';
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function buildCsv(slug, pilot, period, a) {
  const lines = [];
  const push = (...cells) => lines.push(cells.map(csvEscape).join(','));

  push('Section', 'Metric', 'Value', 'Detail');
  push('Center', 'Partner tag', slug, '');
  push('Center', 'Center name', pilot?.centerName || '', '');
  push('Center', 'Pilot status', pilot?.status || '', '');
  push('Center', 'Pilot window', pilot?.startDate || '', pilot?.endDate || '');
  push('Period', 'Reporting window', period.label, `${period.startIso.slice(0, 10)} to ${period.endIso.slice(0, 10)}`);

  const s = a.summary;
  push('Summary', 'Patient sessions (estimated)', s.sessions, pilot?.targetPatients != null ? `target ${pilot.targetPatients}` : '');
  push('Summary', 'Pilot page arrivals', s.pilotArrivals, '');
  push('Summary', 'Page views', s.pageViews, '');
  push('Summary', 'Quiz starts', s.quizStarts, '');
  push('Summary', 'Quiz completes', s.quizCompletes, pilot?.targetQuizCompletes != null ? `target ${pilot.targetQuizCompletes}` : '');
  push('Summary', 'Medication searches', s.medSearches, '');
  push('Summary', 'Program connections', s.connections, pilot?.targetConnections != null ? `target ${pilot.targetConnections}` : '');
  push('Summary', 'Copay card clicks', a.connectionsByType.copay, '');
  push('Summary', 'PAP clicks', a.connectionsByType.pap, '');
  push('Summary', 'Foundation clicks', a.connectionsByType.foundation, '');
  push('Summary', 'MyChart imports', s.epicImports, `${s.epicMatchedMeds} medications matched`);
  push('Summary', 'Helpful votes (yes)', s.helpfulYes, '');
  push('Summary', 'Helpful votes (no)', s.helpfulNo, '');
  push('Summary', 'Spanish-language events', a.language.es, `${a.language.en} English`);
  push('Summary', 'Active days', s.activeDays, '');
  if (a.ehrLogins) {
    push('EHR', 'Epic logins (period)', a.ehrLogins.periodLogins, '');
    push('EHR', 'Epic logins (all time)', a.ehrLogins.allTime, a.ehrLogins.lastLogin || '');
  }

  for (const w of a.weekly) {
    push('Weekly', String(w.week).slice(0, 10), w.sessions, `views ${w.pageViews}; quiz ${w.quizCompletes}; connections ${w.connections}`);
  }
  for (const pr of a.programs) {
    push('Programs', pr.name, pr.clicks, `${pr.programType}${pr.manufacturer ? `; ${pr.manufacturer}` : ''}`);
  }
  for (const m of a.medications) {
    push('Medications', m.medication, m.clicks, `copay ${m.copay}; PAP ${m.pap}`);
  }
  for (const c of a.coverage) push('Coverage', c.value, c.count, '');
  for (const c of a.costBurden) push('Cost burden', c.value, c.count, '');
  for (const src of a.sources) push('Top pages', src.page, src.views, '');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function upsertPilot(db, body) {
  const slug = cleanSlug(body.partnerSlug);
  const centerName = cleanText(body.centerName, 200);
  if (!slug) return { error: 'partnerSlug is required (letters, numbers, dashes)' };
  if (!centerName) return { error: 'centerName is required' };
  const status = VALID_STATUS.includes(body.status) ? body.status : 'active';
  const startDate = cleanDate(body.startDate);
  const endDate = cleanDate(body.endDate);
  if (startDate && endDate && endDate < startDate) return { error: 'endDate must be after startDate' };

  const rows = await db`
    INSERT INTO pilot_programs (
      partner_slug, center_name, epic_org_id, status, start_date, end_date,
      target_patients, target_connections, target_quiz_completes, coordinator_name, notes
    ) VALUES (
      ${slug}, ${centerName}, ${cleanText(body.epicOrgId, 300)}, ${status}, ${startDate}, ${endDate},
      ${cleanInt(body.targetPatients)}, ${cleanInt(body.targetConnections)}, ${cleanInt(body.targetQuizCompletes)},
      ${cleanText(body.coordinatorName, 120)}, ${cleanText(body.notes, 2000)}
    )
    ON CONFLICT (partner_slug) DO UPDATE SET
      center_name = EXCLUDED.center_name,
      epic_org_id = EXCLUDED.epic_org_id,
      status = EXCLUDED.status,
      start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      target_patients = EXCLUDED.target_patients,
      target_connections = EXCLUDED.target_connections,
      target_quiz_completes = EXCLUDED.target_quiz_completes,
      coordinator_name = EXCLUDED.coordinator_name,
      notes = EXCLUDED.notes,
      updated_at = NOW()
    RETURNING *
  `;
  return { pilot: rowToPilot(rows[0]) };
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (!checkAuth(event)) return json(401, { error: 'Unauthorized' });

  try {
    const db = getDb();
    const params = event.queryStringParameters || {};

    if (event.httpMethod === 'POST') {
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        return json(400, { error: 'Invalid JSON body' });
      }
      const result = await upsertPilot(db, body);
      if (result.error) return json(400, { error: result.error });
      return json(200, result);
    }

    if (event.httpMethod === 'DELETE') {
      const slug = cleanSlug(params.partner);
      if (!slug) return json(400, { error: 'partner is required' });
      await db`DELETE FROM pilot_programs WHERE partner_slug = ${slug}`;
      return json(200, { deleted: slug });
    }

    if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });

    const slug = cleanSlug(params.partner);

    // Registry view: pilots + every partner tag seen in events
    if (!slug) {
      const [pilots, partners] = await Promise.all([listPilots(db), listPartnerTags(db)]);
      return json(200, { pilots, partners });
    }

    const pilot = await getPilot(db, slug);
    const period = resolvePeriod(params, pilot);
    const analytics = await getCenterAnalytics(db, slug, pilot, period);

    if ((params.format || '').toLowerCase() === 'csv') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="center-analytics-${slug}.csv"`,
        },
        body: buildCsv(slug, pilot, period, analytics),
      };
    }

    return json(200, {
      partner: slug,
      pilot,
      period: {
        mode: period.mode,
        label: period.label,
        days: period.days,
        start: period.startIso.slice(0, 10),
        end: period.endIso.slice(0, 10),
      },
      ...analytics,
    });
  } catch (error) {
    console.error('[admin-center-analytics] Error:', error);
    const isEnvError = /not configured/.test(error.message || '');
    return json(isEnvError ? 503 : 500, { error: isEnvError ? error.message : 'Internal server error' });
  }
};
