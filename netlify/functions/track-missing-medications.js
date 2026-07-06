import { neon } from '@neondatabase/serverless';
import { allowRequest, rateLimitedResponse } from '../../lib/rateLimit.js';

// Initialize Neon client lazily
let sql = null;
const getDb = () => {
    if (!sql) {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is not set');
        }
        sql = neon(process.env.DATABASE_URL);
    }
    return sql;
};

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

// Normalize a medication name to a stable key: lowercase, collapse whitespace.
// We intentionally keep ONLY the drug name (no patient data, no dose) — these
// are aggregate counts to decide which medications to add to the database.
const normalize = (name) =>
    String(name || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    let names;
    try {
        const body = JSON.parse(event.body || '{}');
        names = body.names;
    } catch {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    if (!Array.isArray(names) || names.length === 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'names must be a non-empty array' }) };
    }

    // De-duplicate within this request and cap to avoid abuse from a single call.
    const seen = new Map();
    for (const raw of names) {
        const display = String(raw || '').trim();
        const key = normalize(display);
        if (!key || key.length > 200) continue;
        if (!seen.has(key)) seen.set(key, display.slice(0, 200));
        if (seen.size >= 100) break;
    }

    if (seen.size === 0) {
        return { statusCode: 200, headers, body: JSON.stringify({ tracked: 0 }) };
    }

    try {
        const db = getDb();
        if (!(await allowRequest(db, event, 'track-missing', 15, 15))) {
            return rateLimitedResponse(headers);
        }
        for (const [key, display] of seen) {
            await db`
                INSERT INTO missing_medications (name_normalized, display_name, request_count)
                VALUES (${key}, ${display}, 1)
                ON CONFLICT (name_normalized) DO UPDATE
                SET request_count = missing_medications.request_count + 1,
                    last_seen = now(),
                    display_name = EXCLUDED.display_name
            `;
        }
        return { statusCode: 200, headers, body: JSON.stringify({ tracked: seen.size }) };
    } catch (error) {
        console.error('track-missing-medications error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
    }
}
