/**
 * Admin Licenses API
 * CRUD for licensed_organizations — the gate that controls which
 * transplant centers can use TMN via Epic EHR launch.
 *
 * All endpoints require ADMIN_SECRET_KEY in the Authorization header.
 *
 * GET    /api/admin-licenses              — list all orgs
 * GET    /api/admin-licenses?id=<id>      — get one org
 * POST   /api/admin-licenses              — create a new license
 * PATCH  /api/admin-licenses              — update an existing license
 * DELETE /api/admin-licenses?id=<id>      — hard-delete (prefer PATCH active=false)
 *
 * GET    /api/admin-licenses/access-log   — recent access log entries
 */

import { neon } from '@neondatabase/serverless';

let sql;
const getDb = () => {
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
};

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

// ── Auth ──────────────────────────────────────────────────────────────

function checkAdminSecret(event) {
  const authHeader =
    event.headers.authorization || event.headers.Authorization;
  if (!authHeader) return false;

  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) {
    console.error('[admin-licenses] ADMIN_SECRET_KEY is not set');
    return false;
  }

  // Accept "Bearer <secret>" or raw "<secret>"
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  return token === secret;
}

function unauthorized() {
  return {
    statusCode: 401,
    headers,
    body: JSON.stringify({ error: 'Unauthorized — provide ADMIN_SECRET_KEY' }),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────

function json(statusCode, data) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(data),
  };
}

// ── Handler ───────────────────────────────────────────────────────────

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (!checkAdminSecret(event)) {
    return unauthorized();
  }

  const db = getDb();
  const path = event.path.replace('/.netlify/functions/admin-licenses', '');
  const params = event.queryStringParameters || {};

  try {
    // ── GET /access-log ────────────────────────────────────────────
    if (event.httpMethod === 'GET' && path === '/access-log') {
      const limit = Math.min(parseInt(params.limit) || 100, 500);
      const epicOrgId = params.org_id;

      let rows;
      if (epicOrgId) {
        rows = await db`
          SELECT id, epic_org_id, org_name, granted, reason, ts
          FROM access_log
          WHERE epic_org_id = ${epicOrgId}
          ORDER BY ts DESC
          LIMIT ${limit}
        `;
      } else {
        rows = await db`
          SELECT id, epic_org_id, org_name, granted, reason, ts
          FROM access_log
          ORDER BY ts DESC
          LIMIT ${limit}
        `;
      }

      return json(200, { entries: rows, count: rows.length });
    }

    // ── GET / or GET /?id=<id> ─────────────────────────────────────
    if (event.httpMethod === 'GET') {
      if (params.id) {
        const rows = await db`
          SELECT * FROM licensed_organizations
          WHERE epic_org_id = ${params.id}
          LIMIT 1
        `;
        if (rows.length === 0) {
          return json(404, { error: 'Organization not found' });
        }
        return json(200, { org: rows[0] });
      }

      // List all
      const rows = await db`
        SELECT * FROM licensed_organizations
        ORDER BY org_name
      `;
      return json(200, { orgs: rows, count: rows.length });
    }

    // ── POST / — create ────────────────────────────────────────────
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const {
        epic_org_id,
        org_name,
        tier = 'standard',
        contract_start = null,
        contract_end = null,
        notes = null,
      } = body;

      if (!epic_org_id || !org_name) {
        return json(400, {
          error: 'epic_org_id and org_name are required',
        });
      }

      // Check for duplicate
      const existing = await db`
        SELECT epic_org_id FROM licensed_organizations
        WHERE epic_org_id = ${epic_org_id}
        LIMIT 1
      `;
      if (existing.length > 0) {
        return json(409, {
          error: 'Organization already exists. Use PATCH to update.',
        });
      }

      await db`
        INSERT INTO licensed_organizations
          (epic_org_id, org_name, tier, contract_start, contract_end, notes)
        VALUES
          (${epic_org_id}, ${org_name}, ${tier}, ${contract_start}, ${contract_end}, ${notes})
      `;

      console.log('[admin-licenses] Created license: %s (%s)', org_name, epic_org_id);

      return json(201, {
        created: true,
        epic_org_id,
        org_name,
        tier,
      });
    }

    // ── PATCH / — update ───────────────────────────────────────────
    if (event.httpMethod === 'PATCH') {
      const body = JSON.parse(event.body || '{}');
      const { epic_org_id } = body;

      if (!epic_org_id) {
        return json(400, { error: 'epic_org_id is required' });
      }

      // Build SET clauses from provided fields
      const allowedFields = [
        'org_name',
        'tier',
        'contract_start',
        'contract_end',
        'active',
        'notes',
      ];
      const updates = {};
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updates[field] = body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return json(400, {
          error: 'No fields to update. Allowed: ' + allowedFields.join(', '),
        });
      }

      // Verify org exists
      const existing = await db`
        SELECT epic_org_id FROM licensed_organizations
        WHERE epic_org_id = ${epic_org_id}
        LIMIT 1
      `;
      if (existing.length === 0) {
        return json(404, { error: 'Organization not found' });
      }

      // Dynamic update using Neon tagged template
      // Build each SET clause individually to stay safe with parameterised queries
      if (updates.org_name !== undefined) {
        await db`UPDATE licensed_organizations SET org_name = ${updates.org_name}, updated_at = NOW() WHERE epic_org_id = ${epic_org_id}`;
      }
      if (updates.tier !== undefined) {
        await db`UPDATE licensed_organizations SET tier = ${updates.tier}, updated_at = NOW() WHERE epic_org_id = ${epic_org_id}`;
      }
      if (updates.contract_start !== undefined) {
        await db`UPDATE licensed_organizations SET contract_start = ${updates.contract_start}, updated_at = NOW() WHERE epic_org_id = ${epic_org_id}`;
      }
      if (updates.contract_end !== undefined) {
        await db`UPDATE licensed_organizations SET contract_end = ${updates.contract_end}, updated_at = NOW() WHERE epic_org_id = ${epic_org_id}`;
      }
      if (updates.active !== undefined) {
        await db`UPDATE licensed_organizations SET active = ${updates.active}, updated_at = NOW() WHERE epic_org_id = ${epic_org_id}`;
      }
      if (updates.notes !== undefined) {
        await db`UPDATE licensed_organizations SET notes = ${updates.notes}, updated_at = NOW() WHERE epic_org_id = ${epic_org_id}`;
      }

      console.log(
        '[admin-licenses] Updated %s: %s',
        epic_org_id,
        JSON.stringify(updates)
      );

      // Return updated record
      const rows = await db`
        SELECT * FROM licensed_organizations
        WHERE epic_org_id = ${epic_org_id}
        LIMIT 1
      `;

      return json(200, { updated: true, org: rows[0] });
    }

    // ── DELETE /?id=<id> ───────────────────────────────────────────
    if (event.httpMethod === 'DELETE') {
      const id = params.id;
      if (!id) {
        return json(400, { error: 'id query param is required' });
      }

      const result = await db`
        DELETE FROM licensed_organizations
        WHERE epic_org_id = ${id}
        RETURNING epic_org_id
      `;

      if (result.length === 0) {
        return json(404, { error: 'Organization not found' });
      }

      console.log('[admin-licenses] Deleted: %s', id);
      return json(200, { deleted: true, epic_org_id: id });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('[admin-licenses] Error:', error);
    return json(500, { error: 'Internal server error' });
  }
}
