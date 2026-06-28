/**
 * Admin Login Stats API
 * Per-center patient login counts, sourced from patient_login_tracking joined
 * to fhir_endpoint_directory (see migration 037). Each row in
 * patient_login_tracking is one completed Epic EHR-launch login.
 *
 * Auth: same Bearer JWT scheme as admin-compliance (super_admin / org_admin).
 *
 * GET /.netlify/functions/admin-login-stats?days=30
 *   -> { period, summary, centers, unmatched }
 *      period    : the selected window ({ days, label }; days=null means all-time)
 *      summary   : totals for the period and all-time
 *      centers   : logins grouped by known endpoint (directory match)
 *      unmatched : logins whose iss is not yet in fhir_endpoint_directory
 *
 * GET /.netlify/functions/admin-login-stats?days=30&format=csv
 *   -> text/csv download of the per-center + unmatched rows for the window
 */

import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

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
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

// Mirror admin-compliance's token check: HMAC-signed payload with a role claim.
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

// Neon returns COUNT()/bigint as strings — coerce the numeric fields.
const toInt = (v) => (v == null ? 0 : Number(v));

function json(statusCode, data) {
  return { statusCode, headers, body: JSON.stringify(data) };
}

// Resolve the ?days= window. 'all' or '0' means all-time (a large interval).
function resolvePeriod(params) {
  const raw = (params.days ?? '30').toString();
  const isAll = raw === 'all' || raw === '0';
  let days = parseInt(raw, 10);
  if (!Number.isFinite(days) || days <= 0) days = 30;
  return {
    isAll,
    intervalDays: isAll ? 100000 : Math.min(days, 3650), // value fed to the SQL interval
    label: isAll ? 'All time' : `Last ${Math.min(days, 3650)} days`,
    days: isAll ? null : Math.min(days, 3650),
  };
}

// Minimal RFC-4180 CSV escaping.
function csvEscape(value) {
  if (value == null) return '';
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function buildCsv(centers, unmatched) {
  const header = [
    'Center',
    'Epic Org ID',
    'City',
    'State',
    'Transplant Center',
    'Period Logins',
    'All-Time Logins',
    'Last Login',
  ];
  const rows = [header.join(',')];

  for (const c of centers) {
    rows.push(
      [
        c.brandName,
        c.epicOrgId,
        c.city,
        c.state,
        c.isTransplantCenter ? 'Yes' : 'No',
        c.periodCount,
        c.allTime,
        c.lastLogin || '',
      ]
        .map(csvEscape)
        .join(',')
    );
  }
  for (const u of unmatched) {
    rows.push(
      [
        `(unrecognized) ${u.issUrl}`,
        '',
        '',
        '',
        '',
        u.periodCount,
        u.allTime,
        u.lastLogin || '',
      ]
        .map(csvEscape)
        .join(',')
    );
  }
  return rows.join('\n');
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }
  if (!checkAuth(event)) {
    return json(401, { error: 'Unauthorized' });
  }

  try {
    const db = getDb();
    const params = event.queryStringParameters || {};
    const period = resolvePeriod(params);
    const d = period.intervalDays;

    const [summaryRows, centerRows, unmatchedRows] = await Promise.all([
      // Overall totals: period vs all-time
      db`
        SELECT
          COUNT(*)                                                                       AS all_time,
          COUNT(*) FILTER (WHERE logged_in_at >= NOW() - INTERVAL '1 day' * ${d})        AS period,
          COUNT(DISTINCT endpoint_id) FILTER (WHERE endpoint_id IS NOT NULL)             AS centers_all,
          COUNT(DISTINCT endpoint_id) FILTER (
            WHERE endpoint_id IS NOT NULL AND logged_in_at >= NOW() - INTERVAL '1 day' * ${d}
          )                                                                              AS centers_period
        FROM patient_login_tracking
      `,
      // Logins grouped by a known directory endpoint
      db`
        SELECT
          fed.id                                                                  AS endpoint_id,
          fed.brand_name,
          fed.epic_org_id,
          fed.facility_city,
          fed.facility_state,
          fed.is_transplant_ctr,
          COUNT(*) FILTER (WHERE plt.logged_in_at >= NOW() - INTERVAL '1 day' * ${d}) AS period_count,
          COUNT(*)                                                                     AS all_time,
          MAX(plt.logged_in_at)                                                        AS last_login
        FROM patient_login_tracking plt
        JOIN fhir_endpoint_directory fed ON fed.id = plt.endpoint_id
        GROUP BY fed.id, fed.brand_name, fed.epic_org_id,
                 fed.facility_city, fed.facility_state, fed.is_transplant_ctr
        ORDER BY period_count DESC, all_time DESC, fed.brand_name
      `,
      // Logins whose iss is not yet catalogued in the directory
      db`
        SELECT
          iss_url,
          COUNT(*) FILTER (WHERE logged_in_at >= NOW() - INTERVAL '1 day' * ${d}) AS period_count,
          COUNT(*)                                                                AS all_time,
          MAX(logged_in_at)                                                       AS last_login
        FROM patient_login_tracking
        WHERE endpoint_id IS NULL
        GROUP BY iss_url
        ORDER BY period_count DESC, all_time DESC
      `,
    ]);

    const s = summaryRows[0] || {};
    const summary = {
      periodLogins: toInt(s.period),
      allTimeLogins: toInt(s.all_time),
      periodCenters: toInt(s.centers_period),
      allTimeCenters: toInt(s.centers_all),
    };

    const centers = centerRows.map((r) => ({
      endpointId: toInt(r.endpoint_id),
      brandName: r.brand_name,
      epicOrgId: r.epic_org_id,
      city: r.facility_city,
      state: r.facility_state,
      isTransplantCenter: r.is_transplant_ctr === true,
      periodCount: toInt(r.period_count),
      allTime: toInt(r.all_time),
      lastLogin: r.last_login,
    }));

    const unmatched = unmatchedRows.map((r) => ({
      issUrl: r.iss_url,
      periodCount: toInt(r.period_count),
      allTime: toInt(r.all_time),
      lastLogin: r.last_login,
    }));

    // CSV download mode
    if ((params.format || '').toLowerCase() === 'csv') {
      const csv = buildCsv(centers, unmatched);
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="center-logins.csv"',
        },
        body: csv,
      };
    }

    return json(200, {
      period: { days: period.days, label: period.label },
      summary,
      centers,
      unmatched,
    });
  } catch (error) {
    console.error('[admin-login-stats] Error:', error);
    return json(500, { error: 'Internal server error' });
  }
}
