/**
 * Admin API - Analytics and Reporting
 *
 * All endpoints require admin authentication via Bearer token
 *
 * GET /api/admin-api/stats - Summary statistics
 * GET /api/admin-api/events - Paginated events list
 * GET /api/admin-api/events/by-partner - Events aggregated by partner
 * GET /api/admin-api/events/by-program - Events aggregated by program
 * GET /api/admin-api/funnel - Funnel metrics
 * GET /api/admin-api/export/csv - CSV export
 * GET /api/admin-api/report/:partner - Partner pilot report
 */

import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

// Initialize Neon client lazily
let sql;
const getDb = () => {
    if (!sql) {
        sql = neon(process.env.DATABASE_URL);
    }
    return sql;
};

// Token secret for verification — must match auth.js
const JWT_SECRET = process.env.JWT_SECRET;
// Legacy admin-auth token secret (kept for backward compatibility)
const LEGACY_TOKEN_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
};

const csvHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'text/csv',
};

// Verify token signed by auth.js (DB-backed login)
function verifyAuthToken(token) {
    try {
        const [data, signature] = token.split('.');
        const expectedSignature = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(data)
            .digest('hex');

        if (signature !== expectedSignature) {
            return null;
        }

        const payload = JSON.parse(Buffer.from(data, 'base64').toString());

        if (payload.exp < Date.now()) {
            return null;
        }

        // Must be an admin role
        if (payload.role !== 'super_admin' && payload.role !== 'org_admin') {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

// Verify legacy admin-auth token (password-only login)
function verifyLegacyAdminToken(token) {
    try {
        const [data, signature] = token.split('.');
        const expectedSignature = crypto
            .createHmac('sha256', LEGACY_TOKEN_SECRET)
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

// Try both token formats
function verifyAdminToken(token) {
    return verifyAuthToken(token) || verifyLegacyAdminToken(token);
}

// Check admin auth from request
function checkAuth(event) {
    const authHeader = event.headers.authorization || event.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    return verifyAdminToken(token);
}

// Parse date range from query params
function parseDateRange(params) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let start = params.start ? new Date(params.start) : null;
    let end = params.end ? new Date(params.end) : null;

    // Ensure end is end of day
    if (end) {
        end.setHours(23, 59, 59, 999);
    }

    return {
        start,
        end,
        startOfWeek,
        startOfMonth,
        now,
    };
}

// Get summary stats
async function getStats(db) {
    const dates = parseDateRange({});

    // Total events all time
    const totalEvents = await db`SELECT COUNT(*) as count FROM events`;

    // Events this week
    const eventsThisWeek = await db`
        SELECT COUNT(*) as count FROM events
        WHERE ts >= ${dates.startOfWeek.toISOString()}
    `;

    // Events this month
    const eventsThisMonth = await db`
        SELECT COUNT(*) as count FROM events
        WHERE ts >= ${dates.startOfMonth.toISOString()}
    `;

    // Unique sessions this month (approximation using meta_json->sessionId or distinct partner+page_source combos)
    const uniqueSessions = await db`
        SELECT COUNT(DISTINCT COALESCE(
            meta_json->>'sessionId',
            CONCAT(COALESCE(partner, 'public'), '-', page_source, '-', DATE(ts))
        )) as count
        FROM events
        WHERE ts >= ${dates.startOfMonth.toISOString()}
    `;

    // Program click stats
    const clickStats = await db`
        SELECT
            COUNT(*) FILTER (WHERE event_name = 'copay_card_click') as copay_clicks,
            COUNT(*) FILTER (WHERE event_name = 'foundation_click') as foundation_clicks,
            COUNT(*) FILTER (WHERE event_name = 'pap_click') as pap_clicks,
            COUNT(*) FILTER (WHERE event_name = 'quiz_start') as quiz_starts,
            COUNT(*) FILTER (WHERE event_name = 'quiz_complete') as quiz_completes,
            COUNT(*) FILTER (WHERE event_name = 'epic_import') as epic_imports,
            COUNT(*) FILTER (WHERE event_name = 'epic_import' AND ts >= ${dates.startOfMonth.toISOString()}) as epic_imports_month,
            COUNT(*) FILTER (WHERE event_name = 'helpful_vote_yes') as helpful_yes,
            COUNT(*) FILTER (WHERE event_name = 'helpful_vote_no') as helpful_no,
            COUNT(*) FILTER (WHERE event_name = 'resource_view') as resource_views
        FROM events
    `;

    // What MyChart imports actually pulled down (aggregate counts stored in
    // the epic_import event meta: total meds on the chart, how many matched
    // our catalog, how many did not). No drug names or PHI in this event.
    const epicMeta = await db`
        SELECT
            COALESCE(SUM(CASE WHEN meta_json->>'totalFhirMeds' ~ '^[0-9]+$' THEN (meta_json->>'totalFhirMeds')::int ELSE 0 END), 0) as meds_pulled,
            COALESCE(SUM(CASE WHEN meta_json->>'matched' ~ '^[0-9]+$' THEN (meta_json->>'matched')::int ELSE 0 END), 0) as meds_matched,
            COALESCE(SUM(CASE WHEN meta_json->>'unmatched' ~ '^[0-9]+$' THEN (meta_json->>'unmatched')::int ELSE 0 END), 0) as meds_unmatched
        FROM events
        WHERE event_name = 'epic_import'
    `;

    return {
        totalEvents: parseInt(totalEvents[0]?.count || 0),
        eventsThisWeek: parseInt(eventsThisWeek[0]?.count || 0),
        eventsThisMonth: parseInt(eventsThisMonth[0]?.count || 0),
        uniqueSessionsThisMonth: parseInt(uniqueSessions[0]?.count || 0),
        copayClicks: parseInt(clickStats[0]?.copay_clicks || 0),
        foundationClicks: parseInt(clickStats[0]?.foundation_clicks || 0),
        papClicks: parseInt(clickStats[0]?.pap_clicks || 0),
        quizStarts: parseInt(clickStats[0]?.quiz_starts || 0),
        quizCompletes: parseInt(clickStats[0]?.quiz_completes || 0),
        epicImports: parseInt(clickStats[0]?.epic_imports || 0),
        epicImportsThisMonth: parseInt(clickStats[0]?.epic_imports_month || 0),
        epicMedsPulled: parseInt(epicMeta[0]?.meds_pulled || 0),
        epicMedsMatched: parseInt(epicMeta[0]?.meds_matched || 0),
        epicMedsUnmatched: parseInt(epicMeta[0]?.meds_unmatched || 0),
        helpfulVotesYes: parseInt(clickStats[0]?.helpful_yes || 0),
        helpfulVotesNo: parseInt(clickStats[0]?.helpful_no || 0),
        resourceViews: parseInt(clickStats[0]?.resource_views || 0),
    };
}

// Get events list with pagination
async function getEvents(db, params) {
    const limit = Math.min(parseInt(params.limit) || 50, 100);
    const offset = parseInt(params.offset) || 0;
    const { partner, event_name, start, end } = params;

    // Build dynamic query conditions
    let conditions = [];
    let values = [];

    if (partner) {
        conditions.push(`partner = $${values.length + 1}`);
        values.push(partner);
    }

    if (event_name) {
        conditions.push(`event_name = $${values.length + 1}`);
        values.push(event_name);
    }

    if (start) {
        conditions.push(`ts >= $${values.length + 1}`);
        values.push(new Date(start).toISOString());
    }

    if (end) {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        conditions.push(`ts <= $${values.length + 1}`);
        values.push(endDate.toISOString());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await db.query(
        `SELECT COUNT(*) as count FROM events ${whereClause}`,
        values
    );

    // Get events
    const eventsResult = await db.query(
        `SELECT id, ts, event_name, partner, page_source, program_type, program_id, meta_json
         FROM events ${whereClause}
         ORDER BY ts DESC
         LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, limit, offset]
    );

    return {
        events: eventsResult,
        total: parseInt(countResult[0]?.count || 0),
        limit,
        offset,
    };
}

// Get events by partner
async function getEventsByPartner(db, params) {
    const dates = parseDateRange(params);

    const startIso = params.start ? new Date(params.start).toISOString() : '1970-01-01T00:00:00.000Z';
    const endIso = params.end ? (() => { const d = new Date(params.end); d.setHours(23,59,59,999); return d.toISOString(); })() : '2099-12-31T23:59:59.999Z';

    const result = await db`
        SELECT COALESCE(partner, '(none)') as partner, COUNT(*) as total,
            COUNT(*) FILTER (WHERE ts >= ${dates.startOfWeek.toISOString()}) as this_week,
            COUNT(*) FILTER (WHERE ts >= ${dates.startOfMonth.toISOString()}) as this_month
        FROM events
        WHERE ts >= ${startIso} AND ts <= ${endIso}
        GROUP BY partner ORDER BY total DESC
    `;

    // Get top program for each partner
    const topPrograms = await db`
        SELECT DISTINCT ON (COALESCE(partner, '(none)'))
            COALESCE(partner, '(none)') as partner,
            program_id as top_program
        FROM events
        WHERE program_id IS NOT NULL
        GROUP BY partner, program_id
        ORDER BY COALESCE(partner, '(none)'), COUNT(*) DESC
    `;

    const programMap = Object.fromEntries(
        topPrograms.map(p => [p.partner, p.top_program])
    );

    return result.map(r => ({
        partner: r.partner,
        thisWeek: parseInt(r.this_week),
        thisMonth: parseInt(r.this_month),
        allTime: parseInt(r.total),
        topProgram: programMap[r.partner] || null,
    }));
}

// Get events by program
async function getEventsByProgram(db, params) {
    const dates = parseDateRange(params);
    const { program_type, start, end } = params;
    const startIso = start ? new Date(start).toISOString() : '1970-01-01T00:00:00.000Z';
    const endIso = end ? (() => { const d = new Date(end); d.setHours(23,59,59,999); return d.toISOString(); })() : '2099-12-31T23:59:59.999Z';

    let result;
    if (program_type) {
        result = await db`
            SELECT program_id, program_type, COUNT(*) as total,
                COUNT(*) FILTER (WHERE ts >= ${dates.startOfWeek.toISOString()}) as this_week,
                COUNT(*) FILTER (WHERE ts >= ${dates.startOfMonth.toISOString()}) as this_month
            FROM events WHERE program_id IS NOT NULL AND program_type = ${program_type}
              AND ts >= ${startIso} AND ts <= ${endIso}
            GROUP BY program_id, program_type ORDER BY total DESC
        `;
    } else {
        result = await db`
            SELECT program_id, program_type, COUNT(*) as total,
                COUNT(*) FILTER (WHERE ts >= ${dates.startOfWeek.toISOString()}) as this_week,
                COUNT(*) FILTER (WHERE ts >= ${dates.startOfMonth.toISOString()}) as this_month
            FROM events WHERE program_id IS NOT NULL
              AND ts >= ${startIso} AND ts <= ${endIso}
            GROUP BY program_id, program_type ORDER BY total DESC
        `;
    }

    return result.map(r => ({
        programId: r.program_id,
        programType: r.program_type,
        thisWeek: parseInt(r.this_week),
        thisMonth: parseInt(r.this_month),
        allTime: parseInt(r.total),
    }));
}

// Get funnel metrics
async function getFunnel(db, params) {
    const { partner, start, end } = params;
    // Use extreme date bounds as defaults to avoid nested tagged templates
    const startIso = start ? new Date(start).toISOString() : '1970-01-01T00:00:00.000Z';
    const endIso = end ? (() => { const d = new Date(end); d.setHours(23,59,59,999); return d.toISOString(); })() : '2099-12-31T23:59:59.999Z';

    let result;
    if (partner) {
        result = await db`
            SELECT event_name, COUNT(*) as count
            FROM events
            WHERE partner = ${partner} AND ts >= ${startIso} AND ts <= ${endIso}
            GROUP BY event_name
        `;
    } else {
        result = await db`
            SELECT event_name, COUNT(*) as count
            FROM events
            WHERE ts >= ${startIso} AND ts <= ${endIso}
            GROUP BY event_name
        `;
    }

    const counts = Object.fromEntries(
        result.map(r => [r.event_name, parseInt(r.count)])
    );

    const pageViews = counts.page_view || 0;
    const quizStarts = counts.quiz_start || 0;
    const quizCompletes = counts.quiz_complete || 0;
    const medSearches = counts.med_search || 0;
    const applicationClicks = (counts.copay_card_click || 0) +
        (counts.foundation_click || 0) +
        (counts.pap_click || 0);

    return {
        pageViews,
        quizStarts,
        quizCompletes,
        medSearches,
        applicationClicks,
        // Calculated percentages
        quizStartRate: pageViews > 0 ? Math.round((quizStarts / pageViews) * 100) : 0,
        quizCompleteRate: quizStarts > 0 ? Math.round((quizCompletes / quizStarts) * 100) : 0,
        medSearchRate: quizCompletes > 0 ? Math.round((medSearches / quizCompletes) * 100) : 0,
        applicationClickRate: medSearches > 0 ? Math.round((applicationClicks / medSearches) * 100) : 0,
    };
}

// Generate CSV export
async function exportCsv(db, params) {
    const { partner, start, end } = params;
    const startIso = start ? new Date(start).toISOString() : '1970-01-01T00:00:00.000Z';
    const endIso = end ? (() => { const d = new Date(end); d.setHours(23,59,59,999); return d.toISOString(); })() : '2099-12-31T23:59:59.999Z';

    let result;
    if (partner) {
        result = await db`
            SELECT id, ts, event_name, partner, page_source, program_type, program_id
            FROM events
            WHERE partner = ${partner} AND ts >= ${startIso} AND ts <= ${endIso}
            ORDER BY ts DESC LIMIT 10000
        `;
    } else {
        result = await db`
            SELECT id, ts, event_name, partner, page_source, program_type, program_id
            FROM events
            WHERE ts >= ${startIso} AND ts <= ${endIso}
            ORDER BY ts DESC LIMIT 10000
        `;
    }

    // Build CSV
    const csvRows = [
        ['ID', 'Timestamp', 'Event Name', 'Partner', 'Page Source', 'Program Type', 'Program ID'].join(','),
        ...result.map(r => [
            r.id,
            r.ts,
            r.event_name,
            r.partner || '',
            `"${(r.page_source || '').replace(/"/g, '""')}"`,
            r.program_type || '',
            r.program_id || '',
        ].join(',')),
    ];

    return csvRows.join('\n');
}

// Generate partner pilot report
async function getPartnerReport(db, partner, params) {
    const { start, end } = params;

    // Default to last 90 days if no date range specified
    const endDate = end ? new Date(end) : new Date();
    const startDate = start ? new Date(start) : new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Get funnel metrics for this partner
    const funnel = await getFunnel(db, { partner, start: startDate.toISOString(), end: endDate.toISOString() });

    // Get event counts by type
    const eventCounts = await db`
        SELECT event_name, COUNT(*) as count
        FROM events
        WHERE partner = ${partner}
          AND ts >= ${startDate.toISOString()}
          AND ts <= ${endDate.toISOString()}
        GROUP BY event_name
        ORDER BY count DESC
    `;

    // Get top 5 programs
    const topPrograms = await db`
        SELECT program_id, program_type, COUNT(*) as clicks
        FROM events
        WHERE partner = ${partner}
          AND program_id IS NOT NULL
          AND ts >= ${startDate.toISOString()}
          AND ts <= ${endDate.toISOString()}
        GROUP BY program_id, program_type
        ORDER BY clicks DESC
        LIMIT 5
    `;

    // Get clicks by type
    const clicksByType = await db`
        SELECT
            COUNT(*) FILTER (WHERE event_name = 'copay_card_click') as copay,
            COUNT(*) FILTER (WHERE event_name = 'foundation_click') as foundation,
            COUNT(*) FILTER (WHERE event_name = 'pap_click') as pap
        FROM events
        WHERE partner = ${partner}
          AND ts >= ${startDate.toISOString()}
          AND ts <= ${endDate.toISOString()}
    `;

    // Get weekly trend data
    const weeklyTrend = await db`
        SELECT
            DATE_TRUNC('week', ts) as week,
            COUNT(*) as events,
            COUNT(*) FILTER (WHERE event_name IN ('copay_card_click', 'foundation_click', 'pap_click')) as clicks
        FROM events
        WHERE partner = ${partner}
          AND ts >= ${startDate.toISOString()}
          AND ts <= ${endDate.toISOString()}
        GROUP BY DATE_TRUNC('week', ts)
        ORDER BY week ASC
    `;

    return {
        partner,
        reportPeriod: {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0],
            days: Math.round((endDate - startDate) / (24 * 60 * 60 * 1000)),
        },
        summary: {
            totalEvents: eventCounts.reduce((sum, e) => sum + parseInt(e.count), 0),
            pageViews: funnel.pageViews,
            quizStarts: funnel.quizStarts,
            quizCompletes: funnel.quizCompletes,
            medSearches: funnel.medSearches,
            applicationClicks: funnel.applicationClicks,
        },
        clicksByType: {
            copay: parseInt(clicksByType[0]?.copay || 0),
            foundation: parseInt(clicksByType[0]?.foundation || 0),
            pap: parseInt(clicksByType[0]?.pap || 0),
        },
        topPrograms: topPrograms.map(p => ({
            programId: p.program_id,
            programType: p.program_type,
            clicks: parseInt(p.clicks),
        })),
        weeklyTrend: weeklyTrend.map(w => ({
            week: w.week,
            events: parseInt(w.events),
            clicks: parseInt(w.clicks),
        })),
        conversionRates: {
            quizStartRate: funnel.quizStartRate,
            quizCompleteRate: funnel.quizCompleteRate,
            medSearchRate: funnel.medSearchRate,
            applicationClickRate: funnel.applicationClickRate,
        },
    };
}

// Aggregate patient-logged savings (Neon user_savings). This is the operator's
// headline impact number and was previously only visible to the patient.
async function getSavingsSummary(db) {
    try {
        const totals = await db`
            SELECT
                COUNT(*) as total_entries,
                COUNT(DISTINCT user_id) as unique_patients,
                COALESCE(SUM(amount_saved), 0) as total_saved,
                COALESCE(SUM(original_price), 0) as total_original,
                COALESCE(ROUND(AVG(amount_saved), 2), 0) as avg_saved_per_fill
            FROM user_savings
        `;
        const byProgram = await db`
            SELECT
                COALESCE(program_type, 'other') as program_type,
                COUNT(*) as entries,
                COALESCE(SUM(amount_saved), 0) as saved
            FROM user_savings
            GROUP BY program_type
            ORDER BY saved DESC
        `;
        const recent = await db`
            SELECT medication_name, program_name, program_type, amount_saved, fill_date, created_at
            FROM user_savings
            ORDER BY created_at DESC
            LIMIT 15
        `;
        const t = totals[0] || {};
        return {
            available: true,
            totalSaved: parseFloat(t.total_saved || 0),
            totalOriginal: parseFloat(t.total_original || 0),
            totalEntries: parseInt(t.total_entries || 0),
            uniquePatients: parseInt(t.unique_patients || 0),
            avgSavedPerFill: parseFloat(t.avg_saved_per_fill || 0),
            byProgram: byProgram.map(r => ({
                programType: r.program_type,
                entries: parseInt(r.entries || 0),
                saved: parseFloat(r.saved || 0),
            })),
            recent: recent.map(r => ({
                medicationName: r.medication_name,
                programName: r.program_name,
                programType: r.program_type,
                amountSaved: parseFloat(r.amount_saved || 0),
                fillDate: r.fill_date,
                createdAt: r.created_at,
            })),
        };
    } catch (error) {
        // Table may not exist yet in a fresh environment.
        console.error('Error fetching savings summary:', error.message);
        return { available: false, error: error.message };
    }
}

// Medications patients searched for that are NOT in the catalog — a ranked
// "what to add next" list. Written by track-missing-medications.js.
async function getMissingMedications(db) {
    try {
        const rows = await db`
            SELECT display_name, name_normalized, request_count, last_seen
            FROM missing_medications
            ORDER BY request_count DESC, last_seen DESC
            LIMIT 100
        `;
        return {
            available: true,
            total: rows.length,
            medications: rows.map(r => ({
                displayName: r.display_name,
                nameNormalized: r.name_normalized,
                requestCount: parseInt(r.request_count || 0),
                lastSeen: r.last_seen,
            })),
        };
    } catch (error) {
        console.error('Error fetching missing medications:', error.message);
        return { available: false, error: error.message };
    }
}

// Coverage mix + cost burden: anonymous, aggregate counts from the quiz.
// Powers the Health Equity story for IOTA: what share of patients reached are
// on Medicaid / IHS / uninsured, and how heavy their reported cost burden is.
// No identity, no PHI, just category counts.
async function getCoverageMix(db) {
    try {
        const coverage = await db`
            SELECT meta_json->>'insuranceType' AS insurance_type, COUNT(*) AS count
            FROM events
            WHERE event_name = 'coverage_selected'
              AND meta_json->>'insuranceType' IS NOT NULL
            GROUP BY meta_json->>'insuranceType'
            ORDER BY count DESC
        `;
        const burden = await db`
            SELECT meta_json->>'financialStatus' AS financial_status, COUNT(*) AS count
            FROM events
            WHERE event_name = 'cost_burden'
              AND meta_json->>'financialStatus' IS NOT NULL
            GROUP BY meta_json->>'financialStatus'
            ORDER BY count DESC
        `;

        const coverageRows = coverage.map(r => ({
            insuranceType: r.insurance_type,
            count: parseInt(r.count || 0),
        }));
        const burdenRows = burden.map(r => ({
            financialStatus: r.financial_status,
            count: parseInt(r.count || 0),
        }));

        const coverageTotal = coverageRows.reduce((s, r) => s + r.count, 0);
        const burdenTotal = burdenRows.reduce((s, r) => s + r.count, 0);

        // Underserved / health-equity segments (public-payer + uninsured).
        const UNDERSERVED = [
            'Medicaid (State)',
            'Indian Health Service / Tribal',
            'Uninsured / Self-pay',
        ];
        const underservedCount = coverageRows
            .filter(r => UNDERSERVED.includes(r.insuranceType))
            .reduce((s, r) => s + r.count, 0);

        // High cost burden = Unaffordable + Crisis.
        const HIGH_BURDEN = ['Unaffordable', 'Crisis'];
        const highBurdenCount = burdenRows
            .filter(r => HIGH_BURDEN.includes(r.financialStatus))
            .reduce((s, r) => s + r.count, 0);

        return {
            available: true,
            coverage: coverageRows,
            costBurden: burdenRows,
            coverageTotal,
            burdenTotal,
            underservedCount,
            underservedPct: coverageTotal ? Math.round((underservedCount / coverageTotal) * 100) : 0,
            highBurdenCount,
            highBurdenPct: burdenTotal ? Math.round((highBurdenCount / burdenTotal) * 100) : 0,
        };
    } catch (error) {
        console.error('Error fetching coverage mix:', error.message);
        return { available: false, error: error.message };
    }
}

// Patient feedback (Neon `feedback` table, migration 039) — written by the
// FeedbackWidget and the /feedback survey page via the feedback function.
async function getFeedbackSummary() {
    try {
        const db = getDb();
        const all = await db`
            SELECT got_medication, program_found, savings_range, without_tool,
                   comment, medication_searched, source, created_at
            FROM feedback
            ORDER BY created_at DESC
            LIMIT 500
        `;

        const tally = (key) => {
            const out = {};
            all.forEach(r => {
                const v = r[key];
                if (v !== null && v !== undefined && v !== '') out[v] = (out[v] || 0) + 1;
            });
            return out;
        };
        // "Got medication" comes from the widget (got_medication) or the
        // survey page (program_found) — combine both into one outcome tally.
        const gotOutcome = {};
        all.forEach(r => {
            const v = r.got_medication || r.program_found;
            if (v) gotOutcome[v] = (gotOutcome[v] || 0) + 1;
        });

        return {
            available: true,
            total: all.length,
            gotMedication: gotOutcome,
            savingsRange: tally('savings_range'),
            withoutTool: tally('without_tool'),
            recentComments: all
                .filter(r => r.comment && r.comment.trim())
                .slice(0, 20)
                .map(r => ({
                    comment: r.comment,
                    medication: r.medication_searched || null,
                    source: r.source || null,
                    createdAt: r.created_at,
                })),
        };
    } catch (error) {
        console.error('Error fetching feedback summary:', error.message);
        return { available: false, error: error.message };
    }
}

export async function handler(event) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    // Check authentication
    const auth = checkAuth(event);
    if (!auth) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Unauthorized' }),
        };
    }

    const path = event.path.replace('/.netlify/functions/admin-api', '');
    const params = event.queryStringParameters || {};

    try {
        const db = getDb();

        // GET /admin-api/stats
        if (path === '/stats') {
            const stats = await getStats(db);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(stats),
            };
        }

        // GET /admin-api/savings-summary
        if (path === '/savings-summary') {
            const result = await getSavingsSummary(db);
            return { statusCode: 200, headers, body: JSON.stringify(result) };
        }

        // GET /admin-api/missing-medications
        if (path === '/missing-medications') {
            const result = await getMissingMedications(db);
            return { statusCode: 200, headers, body: JSON.stringify(result) };
        }

        // GET /admin-api/feedback-summary
        if (path === '/feedback-summary') {
            const result = await getFeedbackSummary();
            return { statusCode: 200, headers, body: JSON.stringify(result) };
        }

        // GET /admin-api/coverage-mix
        if (path === '/coverage-mix') {
            const result = await getCoverageMix(db);
            return { statusCode: 200, headers, body: JSON.stringify(result) };
        }

        // GET /admin-api/events
        if (path === '/events') {
            const result = await getEvents(db, params);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result),
            };
        }

        // GET /admin-api/events/by-partner
        if (path === '/events/by-partner') {
            const result = await getEventsByPartner(db, params);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result),
            };
        }

        // GET /admin-api/events/by-program
        if (path === '/events/by-program') {
            const result = await getEventsByProgram(db, params);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result),
            };
        }

        // GET /admin-api/funnel
        if (path === '/funnel') {
            const result = await getFunnel(db, params);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result),
            };
        }

        // GET /admin-api/export/csv
        if (path === '/export/csv') {
            const csv = await exportCsv(db, params);
            const filename = params.partner
                ? `partner_report_${params.partner}_${new Date().toISOString().split('T')[0]}.csv`
                : `events_export_${new Date().toISOString().split('T')[0]}.csv`;

            return {
                statusCode: 200,
                headers: {
                    ...csvHeaders,
                    'Content-Disposition': `attachment; filename="${filename}"`,
                },
                body: csv,
            };
        }

        // GET /admin-api/report/:partner
        if (path.startsWith('/report/')) {
            const partner = path.replace('/report/', '');
            if (!partner) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Partner name required' }),
                };
            }
            const report = await getPartnerReport(db, partner, params);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(report),
            };
        }

        // GET /admin-api/partners (list of unique partners)
        if (path === '/partners') {
            const partners = await db`
                SELECT DISTINCT COALESCE(partner, '(none)') as partner
                FROM events
                ORDER BY partner
            `;
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(partners.map(p => p.partner)),
            };
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Not found' }),
        };
    } catch (error) {
        console.error('Admin API error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
}
