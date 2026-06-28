/**
 * Admin Login Stats API
 * Per-center patient login counts, sourced from patient_login_tracking joined
 * to fhir_endpoint_directory (see migration 037). Each row in
 * patient_login_tracking is one completed Epic EHR-launch login.
 *
 * Auth: same Bearer JWT scheme as admin-compliance (super_admin / org_admin).
 *
 * GET /.netlify/functions/admin-login-stats
 *   -> { summary, centers, unmatched }
 *      summary   : overall totals (all-time / 30d / 7d / distinct centers)
 *      centers   : logins grouped by known endpoint (directory match)
 *      unmatched : logins whose iss is not yet in fhir_endpoint_directory
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

    const [summaryRows, centerRows, unmatchedRows] = await Promise.all([
      // Overall totals
      db`
        SELECT
          COUNT(*)                                                                    AS all_time,
          COUNT(*) FILTER (WHERE logged_in_at >= NOW() - INTERVAL '30 days')          AS last_30d,
          COUNT(*) FILTER (WHERE logged_in_at >= NOW() - INTERVAL '7 days')           AS last_7d,
          COUNT(DISTINCT endpoint_id) FILTER (WHERE endpoint_id IS NOT NULL)          AS distinct_centers
        FROM patient_login_tracking
      `,
      // Logins grouped by a known directory endpoint
      db`
        SELECT
          fed.id                                                              AS endpoint_id,
          fed.brand_name,
          fed.epic_org_id,
          fed.facility_city,
          fed.facility_state,
          fed.is_transplant_ctr,
          COUNT(*) FILTER (WHERE plt.logged_in_at >= NOW() - INTERVAL '7 days')  AS this_week,
          COUNT(*) FILTER (WHERE plt.logged_in_at >= NOW() - INTERVAL '30 days') AS this_month,
          COUNT(*)                                                              AS all_time,
          MAX(plt.logged_in_at)                                                 AS last_login
        FROM patient_login_tracking plt
        JOIN fhir_endpoint_directory fed ON fed.id = plt.endpoint_id
        GROUP BY fed.id, fed.brand_name, fed.epic_org_id,
                 fed.facility_city, fed.facility_state, fed.is_transplant_ctr
        ORDER BY all_time DESC, fed.brand_name
      `,
      // Logins whose iss is not yet catalogued in the directory
      db`
        SELECT
          iss_url,
          COUNT(*) FILTER (WHERE logged_in_at >= NOW() - INTERVAL '7 days')  AS this_week,
          COUNT(*) FILTER (WHERE logged_in_at >= NOW() - INTERVAL '30 days') AS this_month,
          COUNT(*)                                                           AS all_time,
          MAX(logged_in_at)                                                  AS last_login
        FROM patient_login_tracking
        WHERE endpoint_id IS NULL
        GROUP BY iss_url
        ORDER BY all_time DESC
      `,
    ]);

    const s = summaryRows[0] || {};
    const summary = {
      allTime: toInt(s.all_time),
      last30d: toInt(s.last_30d),
      last7d: toInt(s.last_7d),
      distinctCenters: toInt(s.distinct_centers),
    };

    const centers = centerRows.map((r) => ({
      endpointId: toInt(r.endpoint_id),
      brandName: r.brand_name,
      epicOrgId: r.epic_org_id,
      city: r.facility_city,
      state: r.facility_state,
      isTransplantCenter: r.is_transplant_ctr === true,
      thisWeek: toInt(r.this_week),
      thisMonth: toInt(r.this_month),
      allTime: toInt(r.all_time),
      lastLogin: r.last_login,
    }));

    const unmatched = unmatchedRows.map((r) => ({
      issUrl: r.iss_url,
      thisWeek: toInt(r.this_week),
      thisMonth: toInt(r.this_month),
      allTime: toInt(r.all_time),
      lastLogin: r.last_login,
    }));

    return json(200, { summary, centers, unmatched });
  } catch (error) {
    console.error('[admin-login-stats] Error:', error);
    return json(500, { error: 'Internal server error' });
  }
}
