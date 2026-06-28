/**
 * Admin Sync Endpoints API
 * Populates fhir_endpoint_directory from the bundled Epic endpoint catalog
 * (src/data/epic-endpoints.json) so login tracking can resolve iss URLs to
 * named centers. Lets an admin run the sync from the Center Logins dashboard
 * instead of the command line.
 *
 * Auth: same Bearer JWT scheme as admin-login-stats (super_admin / org_admin).
 *
 * POST /.netlify/functions/admin-sync-endpoints
 *   -> { inserted, updated, total }
 *
 * The whole sync is three bulk queries (insert-missing, refresh-names, count)
 * so it stays well within the function timeout even for hundreds of endpoints.
 */

import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import endpoints from '../../src/data/epic-endpoints.json';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

let _sql;
function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

function json(statusCode, data) {
  return { statusCode, headers, body: JSON.stringify(data) };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }
  if (!checkAuth(event)) {
    return json(401, { error: 'Unauthorized' });
  }

  try {
    const db = getDb();

    // Build parallel arrays of valid (iss_url, brand_name) pairs.
    const issArr = [];
    const nameArr = [];
    for (const e of endpoints) {
      if (e && e.fhirBaseUrl && e.name) {
        issArr.push(e.fhirBaseUrl);
        nameArr.push(e.name);
      }
    }

    // 1) Insert endpoints whose iss isn't already in the directory.
    const inserted = await db`
      INSERT INTO fhir_endpoint_directory (iss_url, brand_name)
      SELECT u.iss_url, u.brand_name
      FROM unnest(${issArr}::text[], ${nameArr}::text[]) AS u(iss_url, brand_name)
      WHERE NOT EXISTS (
        SELECT 1 FROM fhir_endpoint_directory d
        WHERE lower(rtrim(d.iss_url, '/')) = lower(rtrim(u.iss_url, '/'))
      )
      RETURNING id
    `;

    // 2) Refresh brand_name for existing endpoints whose name changed. Curated
    //    columns (city/state/is_transplant_ctr/epic_org_id) are left untouched.
    const updated = await db`
      UPDATE fhir_endpoint_directory d
      SET brand_name = u.brand_name, updated_at = NOW()
      FROM unnest(${issArr}::text[], ${nameArr}::text[]) AS u(iss_url, brand_name)
      WHERE lower(rtrim(d.iss_url, '/')) = lower(rtrim(u.iss_url, '/'))
        AND d.brand_name IS DISTINCT FROM u.brand_name
      RETURNING d.id
    `;

    const [{ count }] = await db`SELECT COUNT(*) AS count FROM fhir_endpoint_directory`;

    return json(200, {
      inserted: inserted.length,
      updated: updated.length,
      total: Number(count),
    });
  } catch (error) {
    console.error('[admin-sync-endpoints] Error:', error);
    return json(500, { error: 'Sync failed: ' + error.message });
  }
}
