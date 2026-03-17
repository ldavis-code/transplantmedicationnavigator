/**
 * Organization API
 * Fetches organization configuration by slug
 */

import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

let _sql;
function getDb() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Content-Type': 'application/json',
};

function checkAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const [data, signature] = authHeader.substring(7).split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const sql = getDb();

  // PUT /organization/update - Save org settings
  if (event.httpMethod === 'PUT') {
    const path = event.path.replace('/.netlify/functions/organization', '');
    if (path === '/update') {
      const auth = checkAuth(event);
      if (!auth || (auth.role !== 'super_admin' && auth.role !== 'org_admin')) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
      }

      try {
        const { orgId, name, logoUrl, primaryColor, secondaryColor, contactEmail, websiteUrl } = JSON.parse(event.body);
        const targetOrgId = orgId || auth.orgId;
        if (!targetOrgId) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'orgId required' }) };
        }

        await sql`
          UPDATE organizations SET
            name = COALESCE(${name || null}, name),
            logo_url = ${logoUrl || null},
            primary_color = COALESCE(${primaryColor || null}, primary_color),
            secondary_color = COALESCE(${secondaryColor || null}, secondary_color),
            contact_email = ${contactEmail || null},
            website_url = ${websiteUrl || null}
          WHERE id = ${targetOrgId}
        `;

        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
      } catch (error) {
        console.error('Organization update error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
      }
    }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const params = event.queryStringParameters || {};
    const { slug, id } = params;

    if (!slug && !id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing slug or id parameter' }),
      };
    }

    let org;

    if (id) {
      const result = await sql`
        SELECT id, slug, name, logo_url, primary_color, secondary_color,
               contact_email, website_url, features, plan, is_active
        FROM organizations
        WHERE id = ${parseInt(id)} AND is_active = true
      `;
      org = result[0];
    } else {
      const result = await sql`
        SELECT id, slug, name, logo_url, primary_color, secondary_color,
               contact_email, website_url, features, plan, is_active
        FROM organizations
        WHERE slug = ${slug.toLowerCase()} AND is_active = true
      `;
      org = result[0];
    }

    if (!org) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Organization not found' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(org),
    };
  } catch (error) {
    console.error('Organization API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
