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

// CORS headers for browser requests
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    // Short cache so medication edits/additions in the database appear quickly
    // (medications are actively being curated). browser 1 min, CDN 5 min, with
    // stale-while-revalidate to keep responses fast while refreshing.
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
};

// Transform database row to frontend format (snake_case to camelCase)
function transformMedication(row) {
    return {
        id: row.id,
        brandName: row.brand_name,
        genericName: row.generic_name,
        rxcui: row.rxcui,
        category: row.category,
        manufacturer: row.manufacturer,
        stage: row.stage,
        commonOrgans: row.common_organs || [],
        // Legacy flat fields (for backwards compatibility)
        papUrl: row.pap_program?.url || row.pap_url,
        papProgramId: row.pap_program_id,
        copayUrl: row.copay_program?.url || row.copay_url,
        copayProgramId: row.copay_program_id,
        supportUrl: row.support_url,
        cost_tier: row.cost_tier,
        generic_available: row.generic_available,
        typical_copay_tier: row.typical_copay_tier,
        // New nested program structure
        copayProgram: row.copay_program || null,
        papProgram: row.pap_program || null,
        medicarePartD: row.medicare_partd || null,
        // Pricing deep-link slug overrides
        costPlusSlug: row.cost_plus_slug || null,
        goodrxSlug: row.goodrx_slug || null,
        singlecareSlug: row.singlecare_slug || null
    };
}

export async function handler(event) {
    // Handle preflight CORS requests
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const db = getDb();
        const { id, category, search } = event.queryStringParameters || {};

        // Fetch single medication by ID
        if (id) {
            const results = await db`
                SELECT * FROM medications WHERE id = ${id}
            `;

            if (results.length === 0) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Medication not found' })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ medication: transformMedication(results[0]) })
            };
        }

        // Search medications by name
        if (search) {
            const searchPattern = `%${search}%`;
            const results = await db`
                SELECT * FROM medications
                WHERE generic_name ILIKE ${searchPattern}
                OR brand_name ILIKE ${searchPattern}
                ORDER BY generic_name
                LIMIT 50
            `;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    medications: results.map(transformMedication),
                    count: results.length
                })
            };
        }

        // Filter by category
        if (category) {
            const results = await db`
                SELECT * FROM medications
                WHERE category = ${category}
                ORDER BY generic_name
            `;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    medications: results.map(transformMedication),
                    count: results.length
                })
            };
        }

        // Fetch all medications (default)
        const results = await db`
            SELECT * FROM medications
            ORDER BY category, generic_name
        `;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                medications: results.map(transformMedication),
                count: results.length
            })
        };

    } catch (error) {
        console.error('Medications API error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
}
