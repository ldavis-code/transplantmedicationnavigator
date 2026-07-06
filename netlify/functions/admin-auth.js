/**
 * Simple Admin Authentication API
 * Uses a single ADMIN_PASSWORD environment variable for authentication
 *
 * POST /api/admin-auth/login - Login with password
 * GET /api/admin-auth/verify - Verify token validity
 */

import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';

// Secret for signing tokens (use JWT_SECRET or fallback)
const TOKEN_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD;

// ---- Brute-force protection (login_attempts table, migration 040) ----
let _sql;
function getDb() {
    if (!process.env.DATABASE_URL) return null;
    if (!_sql) _sql = neon(process.env.DATABASE_URL);
    return _sql;
}

const RATE_LIMIT_MAX = 5;

function rateLimitIdentifier(event) {
    const ip =
        event.headers['x-nf-client-connection-ip'] ||
        (event.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
        'unknown';
    return crypto
        .createHmac('sha256', TOKEN_SECRET || 'rate-limit-salt')
        .update(`${ip}:reporting-portal`)
        .digest('hex');
}

async function isRateLimited(db, identifier) {
    if (!db) return false;
    try {
        const rows = await db`
            SELECT COUNT(*)::int AS count FROM login_attempts
            WHERE identifier = ${identifier} AND attempted_at > NOW() - INTERVAL '15 minutes'
        `;
        return rows[0].count >= RATE_LIMIT_MAX;
    } catch {
        return false;
    }
}

async function recordFailedAttempt(db, identifier) {
    if (!db) return;
    try {
        await db`INSERT INTO login_attempts (identifier) VALUES (${identifier})`;
        await db`DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '1 day'`;
    } catch {
        // Best-effort only
    }
}

// Constant-time string comparison (avoids leaking the password length or a
// prefix-match timing signal)
function safeEqual(a, b) {
    const ha = crypto.createHash('sha256').update(String(a)).digest();
    const hb = crypto.createHash('sha256').update(String(b)).digest();
    return crypto.timingSafeEqual(ha, hb);
}

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
};

// Generate a simple signed token
function generateAdminToken() {
    if (!TOKEN_SECRET) {
        throw new Error('JWT_SECRET (or ADMIN_PASSWORD) is not configured. Set it in Netlify environment variables.');
    }
    const payload = {
        type: 'admin',
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        iat: Date.now(),
    };
    const data = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto
        .createHmac('sha256', TOKEN_SECRET)
        .update(data)
        .digest('hex');
    return `${data}.${signature}`;
}

// Verify token and return payload if valid
function verifyAdminToken(token) {
    try {
        const [data, signature] = token.split('.');
        const expectedSignature = crypto
            .createHmac('sha256', TOKEN_SECRET)
            .update(data)
            .digest('hex');

        if (signature !== expectedSignature) {
            return null;
        }

        const payload = JSON.parse(Buffer.from(data, 'base64').toString());

        if (payload.exp < Date.now()) {
            return null;
        }

        if (payload.type !== 'admin') {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

// Export verification function for use by other admin endpoints
export { verifyAdminToken };

export async function handler(event) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const path = event.path.replace('/.netlify/functions/admin-auth', '');

    try {
        // POST /admin-auth/login
        if (event.httpMethod === 'POST' && path === '/login') {
            const { password } = JSON.parse(event.body || '{}');

            if (!password) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Password required' }),
                };
            }

            const db = getDb();
            const limiterId = rateLimitIdentifier(event);
            if (await isRateLimited(db, limiterId)) {
                return {
                    statusCode: 429,
                    headers,
                    body: JSON.stringify({ error: 'Too many failed login attempts. Please try again in 15 minutes.' }),
                };
            }

            // Check against ADMIN_PASSWORD environment variable
            const adminPassword = process.env.ADMIN_PASSWORD;

            if (!adminPassword) {
                console.error('ADMIN_PASSWORD environment variable not set');
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'Admin authentication not configured' }),
                };
            }

            if (!safeEqual(password, adminPassword)) {
                await recordFailedAttempt(db, limiterId);
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Invalid password' }),
                };
            }

            // Generate token
            const token = generateAdminToken();

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    token,
                }),
            };
        }

        // GET /admin-auth/verify
        if (event.httpMethod === 'GET' && path === '/verify') {
            const authHeader = event.headers.authorization || event.headers.Authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'No token provided' }),
                };
            }

            const token = authHeader.substring(7);
            const payload = verifyAdminToken(token);

            if (!payload) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Invalid or expired token' }),
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ valid: true }),
            };
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Not found' }),
        };
    } catch (error) {
        console.error('Admin auth error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
}
