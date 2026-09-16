// CommonJS on purpose: Netlify bundles functions to CJS, where import.meta is
// empty, so the previous ESM createRequire(import.meta.url) threw at module
// load and every /out/ click returned 502 instead of redirecting (and logging).
const { neon } = require('@neondatabase/serverless');
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
let schemaFixed = false;
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

// Links that live under /out/copay/ and /out/pap/ so the redirect can look up
// their search-template URL, but are not assistance programs: price lookups
// (GoodRx, SingleCare, Cost Plus Drugs, TrumpRx) and the "Drug facts" link
// on every medication card (Drugs.com). Logging those as copay_card_click /
// pap_click inflated "programs reached" and its copay/PAP split (a Medicare
// patient reading drug facts counted as reaching a PAP). They get their own
// event names and program types, so every program-click report leaves them
// out. Migration 055 reclassifies the rows written before this.
const NON_PROGRAM_LINKS = {
    'goodrx-search': { eventName: 'price_lookup_click', programType: 'price_lookup' },
    'singlecare-search': { eventName: 'price_lookup_click', programType: 'price_lookup' },
    'costplus-search': { eventName: 'price_lookup_click', programType: 'price_lookup' },
    'trumprx-gov': { eventName: 'price_lookup_click', programType: 'price_lookup' },
    'drugs-com-search': { eventName: 'drug_info_click', programType: 'drug_info' }
};

exports.handler = async function handler(event) {
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

        // UI language the click came from - whitelist of supported languages
        const rawLang = event.queryStringParameters?.lang || null;
        const lang = ['en', 'es'].includes(rawLang) ? rawLang : null;

        // Per-tab session id the client attaches to /out/ links (&sid=), the
        // same random id its own events carry. Stored as meta_json.sessionId
        // so distinct-session counts include redirect clicks. Never a person.
        const rawSid = event.queryStringParameters?.sid || '';
        const sessionId = String(rawSid).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || null;

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
            // Ensure the lang column exists (self-healing for old schema,
            // runs once per cold start - same guard as event.js)
            if (!schemaFixed) {
                await db`ALTER TABLE events ADD COLUMN IF NOT EXISTS lang TEXT`.catch(() => {});
                schemaFixed = true;
            }
            const nonProgram = NON_PROGRAM_LINKS[programId] || null;
            const eventName = nonProgram ? nonProgram.eventName : EVENT_NAMES[programType];
            const loggedType = nonProgram ? nonProgram.programType : programType;
            await db`
                INSERT INTO events (event_name, partner, page_source, program_type, program_id, meta_json, lang)
                VALUES (
                    ${eventName},
                    ${partner},
                    ${pageSource},
                    ${loggedType},
                    ${programId},
                    ${JSON.stringify(sessionId ? { redirect: true, fallback: usedFallback, sessionId } : { redirect: true, fallback: usedFallback })},
                    ${lang}
                )
            `;
        } catch (logError) {
            console.warn('Failed to log event:', logError.message);
        }

        // Substitute {query} placeholder if the URL is a search template
        const searchQuery = event.queryStringParameters?.q || null;
        if (redirectUrl.includes('{query}') && searchQuery) {
            redirectUrl = redirectUrl.replace('{query}', encodeURIComponent(searchQuery));
        } else if (redirectUrl.includes('{query}')) {
            // Remove the placeholder if no query was provided
            redirectUrl = redirectUrl.replace('{query}', '');
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
};
