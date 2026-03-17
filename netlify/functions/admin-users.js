/**
 * Admin Users API
 * GET  - List all users for the org
 * PUT  - Update a user's role
 * DELETE - Deactivate a user
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
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

function verifyToken(token) {
  try {
    const [data, signature] = token.split('.');
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

function checkAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.substring(7));
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const auth = checkAuth(event);
  if (!auth) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const db = getDb();

  try {
    // GET - List users
    if (event.httpMethod === 'GET') {
      let users;
      if (auth.orgId) {
        users = await db`
          SELECT id, email, name, role, is_active, created_at, last_login_at
          FROM users WHERE org_id = ${auth.orgId}
          ORDER BY created_at DESC
        `;
      } else {
        users = await db`
          SELECT id, email, name, role, is_active, created_at, last_login_at
          FROM users ORDER BY created_at DESC
        `;
      }
      return { statusCode: 200, headers, body: JSON.stringify({ users }) };
    }

    // PUT - Update role
    if (event.httpMethod === 'PUT') {
      const { userId, role } = JSON.parse(event.body);
      const validRoles = ['viewer', 'editor', 'org_admin'];
      if (auth.role === 'super_admin') validRoles.push('super_admin');

      if (!validRoles.includes(role)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid role' }) };
      }

      await db`UPDATE users SET role = ${role} WHERE id = ${userId}`;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // DELETE - Deactivate user
    if (event.httpMethod === 'DELETE') {
      const { userId } = JSON.parse(event.body);
      await db`UPDATE users SET is_active = false WHERE id = ${userId}`;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    console.error('Admin users error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
}
