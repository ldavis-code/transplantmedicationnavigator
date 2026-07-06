// netlify/functions/feedback.js
// Receives anonymous feedback from the FeedbackWidget (medication pages) and
// the /feedback survey page and stores it in the Neon `feedback` table
// (migration 039). Replaces the old direct-from-browser Supabase insert.
//
// Anonymous by design: every multiple-choice answer is validated against a
// whitelist, the free-text comment is length-capped, and no identifier of any
// kind (email, name, IP) is accepted or stored.

import { neon } from '@neondatabase/serverless';
import { allowRequest, rateLimitedResponse } from '../../lib/rateLimit.js';

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

const ALLOWED = {
    source: ['widget', 'feedback_page'],
    got_medication: ['yes', 'no_too_expensive', 'no_another_pharmacy', 'no_other'],
    program_found: ['found_copay_card', 'found_pap', 'found_not_tried', 'no_didnt_qualify', 'no_not_listed'],
    savings_range: ['0-50', '50-100', '100-250', '250-500', '500+', '500-1000', '1000+', 'unsure'],
    without_tool: ['paid_full', 'skipped_rationed', 'called_coordinator', 'not_filled', 'other']
};

// Return the value if it is in the whitelist, otherwise null (never echo
// arbitrary input into the database).
const pick = (field, value) =>
    ALLOWED[field].includes(value) ? value : null;

const clampText = (value, max) => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, max) : null;
};

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const row = {
        source: pick('source', body.source) || 'widget',
        got_medication: pick('got_medication', body.got_medication),
        program_found: pick('program_found', body.program_found),
        savings_range: pick('savings_range', body.savings_range),
        without_tool: pick('without_tool', body.without_tool),
        medication_searched: clampText(body.medication_searched, 200),
        comment: clampText(body.comment, 2000)
    };

    // Require at least one actual answer so the endpoint can't be used to
    // insert empty rows.
    if (!row.got_medication && !row.program_found && !row.savings_range && !row.without_tool && !row.comment) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'No valid feedback answers provided' }) };
    }

    try {
        const db = getDb();
        if (!(await allowRequest(db, event, 'feedback', 10, 15))) {
            return rateLimitedResponse(headers);
        }
        await db`
            INSERT INTO feedback (source, got_medication, program_found, savings_range, without_tool, medication_searched, comment)
            VALUES (${row.source}, ${row.got_medication}, ${row.program_found}, ${row.savings_range}, ${row.without_tool}, ${row.medication_searched}, ${row.comment})
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch (error) {
        console.error('feedback error:', error.message);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
    }
}
