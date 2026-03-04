import { neon } from '@neondatabase/serverless';

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

// CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
};

// Valid interaction types
const VALID_INTERACTION_TYPES = ['search', 'view', 'add_to_list', 'program_click'];

export async function handler(event) {
    // Handle preflight CORS requests
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    try {
        const db = getDb();

        // POST: Track a medication interaction
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { medicationName, interactionType, searchQuery } = body;

            if (!medicationName || !interactionType) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Missing required fields: medicationName, interactionType' })
                };
            }

            if (!VALID_INTERACTION_TYPES.includes(interactionType)) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error: `Invalid interactionType. Must be one of: ${VALID_INTERACTION_TYPES.join(', ')}`
                    })
                };
            }

            await db`
                INSERT INTO medication_tracking (medication_name, interaction_type, search_query)
                VALUES (${medicationName}, ${interactionType}, ${searchQuery || null})
            `;

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({ success: true })
            };
        }

        // GET: Fetch tracking analytics (for admin/reporting)
        if (event.httpMethod === 'GET') {
            const { type, days = '30', limit = '20' } = event.queryStringParameters || {};
            const daysInt = parseInt(days);
            const limitInt = parseInt(limit);

            // Most tracked medications by interaction type
            if (type && VALID_INTERACTION_TYPES.includes(type)) {
                const results = await db`
                    SELECT medication_name, COUNT(*) as count
                    FROM medication_tracking
                    WHERE interaction_type = ${type}
                      AND created_at >= NOW() - INTERVAL '1 day' * ${daysInt}
                    GROUP BY medication_name
                    ORDER BY count DESC
                    LIMIT ${limitInt}
                `;

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ results, type, days: daysInt })
                };
            }

            // Default: summary of all interaction types
            const summary = await db`
                SELECT interaction_type, COUNT(*) as count
                FROM medication_tracking
                WHERE created_at >= NOW() - INTERVAL '1 day' * ${daysInt}
                GROUP BY interaction_type
                ORDER BY count DESC
            `;

            const topMedications = await db`
                SELECT medication_name, COUNT(*) as count
                FROM medication_tracking
                WHERE created_at >= NOW() - INTERVAL '1 day' * ${daysInt}
                GROUP BY medication_name
                ORDER BY count DESC
                LIMIT ${limitInt}
            `;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ summary, topMedications, days: daysInt })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('Medication tracking error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
}
