import { neon } from '@neondatabase/serverless';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const programsJson = require('../../src/data/programs.json');

// Get URL from JSON fallback
const getUrlFromJson = (programType, programId) => {
    const typeMap = {
        copay: 'copayPrograms',
        pap: 'papPrograms',
        foundation: 'foundationPrograms'
    };
    const section = programsJson[typeMap[programType]] || {};
    const program = section[programId];
    return program?.url || null;
};

// Initialize Neon client lazily to avoid cold start overhead
let sql;
const getDb = () => {
    if (!sql) {
        sql = neon(process.env.DATABASE_URL);
    }
    return sql;
};

// Valid program types for redirects
const VALID_PROGRAM_TYPES = ['copay', 'foundation', 'pap'];

// Map program types to event names
const EVENT_NAMES = {
    copay: 'copay_card_click',
    foundation: 'foundation_click',
    pap: 'pap_click'
};

export async function handler(event) {
    try {
        // Parse the path to extract program type and ID
        // Expected paths: /out/copay/:program_id, /out/foundation/:program_id, /out/pap/:program_id
        const pathParts = event.path.split('/').filter(Boolean);

        // pathParts should be ['out', 'copay|foundation|pap', 'program_id']
        if (pathParts.length < 3 || pathParts[0] !== 'out') {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid path format' })
            };
        }

        const programType = pathParts[1];
        const programId = pathParts[2];

        // Validate program type
        if (!VALID_PROGRAM_TYPES.includes(programType)) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid program type' })
            };
        }

        // Get page source from referer header or query param
        const referer = event.headers.referer || event.headers.Referer || null;
        const querySource = event.queryStringParameters?.source || null;
        const pageSource = querySource || referer || '/unknown';

        // Get partner from query param if provided
        const partner = event.queryStringParameters?.partner || null;

        const db = getDb();
        let redirectUrl = null;
        let usedFallback = false;

        // Try database first, then fall back to JSON
        try {
            // Look up the program in the database
            const programs = await db`
                SELECT program_id, program_type, name, official_url, active
                FROM programs
                WHERE program_id = ${programId}
                AND program_type = ${programType}
            `;

            if (programs.length > 0 && programs[0].active && programs[0].official_url) {
                redirectUrl = programs[0].official_url;
            }
        } catch (dbError) {
            console.warn('Database lookup failed, trying JSON fallback:', dbError.message);
        }

        // Fall back to JSON if database didn't return a valid URL
        if (!redirectUrl) {
            redirectUrl = getUrlFromJson(programType, programId);
            usedFallback = true;
            if (redirectUrl) {
                console.log(`Using JSON fallback for ${programType}/${programId}: ${redirectUrl}`);
            }
        }

        // If still no URL found, return 404
        if (!redirectUrl) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Program not found' })
            };
        }

        // Log the event to the database (best effort, don't fail if this errors)
        try {
            const eventName = EVENT_NAMES[programType];
            await db`
                INSERT INTO events (event_name, partner, page_source, program_type, program_id, meta_json)
                VALUES (
                    ${eventName},
                    ${partner},
                    ${pageSource},
                    ${programType},
                    ${programId},
                    ${JSON.stringify({ redirect: true, fallback: usedFallback })}
                )
            `;
        } catch (logError) {
            console.warn('Failed to log event:', logError.message);
        }

        // 302 redirect to the official URL
        return {
            statusCode: 302,
            headers: {
                'Location': redirectUrl,
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        };

    } catch (error) {
        console.error('Redirect error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
}
