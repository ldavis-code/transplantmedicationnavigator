/**
 * Admin Impact Report API
 * Aggregates funding-ready metrics: patient reach, program connections, medication insights
 */

import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

let _sql;
function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not configured. Set it in Netlify Dashboard > Site Settings > Environment Variables. ' +
      'Get your connection string from console.neon.tech'
    );
  }
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

/**
 * Fetch site traffic from Netlify Analytics API
 * Requires NETLIFY_API_TOKEN and NETLIFY_SITE_ID env variables
 */
async function fetchNetlifyAnalytics(days) {
  const token = process.env.NETLIFY_API_TOKEN;
  const siteId = process.env.NETLIFY_SITE_ID;

  if (!token || !siteId) {
    return {
      available: false,
      error: !token && !siteId
        ? 'NETLIFY_API_TOKEN and NETLIFY_SITE_ID are not configured'
        : !token
          ? 'NETLIFY_API_TOKEN is not configured'
          : 'NETLIFY_SITE_ID is not configured',
      hint: 'Set these in Netlify Dashboard > Site Settings > Environment Variables',
    };
  }

  try {
    const now = Date.now();
    const from = now - days * 24 * 60 * 60 * 1000;
    const baseUrl = `https://analytics.services.netlify.com/v2/${siteId}`;
    const qs = `from=${from}&to=${now}&timezone=-0500&resolution=day`;

    const [pagesRes, sourcesRes] = await Promise.all([
      fetch(`${baseUrl}/pages?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${baseUrl}/sources?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!pagesRes.ok) {
      const errText = await pagesRes.text();
      return {
        available: false,
        error: `Netlify Analytics API returned ${pagesRes.status}: ${errText}`,
      };
    }

    const pages = await pagesRes.json();
    const sources = sourcesRes.ok ? await sourcesRes.json() : [];

    // Aggregate page view totals
    let totalPageviews = 0;
    let totalUniques = 0;
    const topPages = [];

    if (Array.isArray(pages.data)) {
      pages.data.forEach(p => {
        totalPageviews += p.count || 0;
        totalUniques += p.uniques || 0;
        topPages.push({ path: p.path, views: p.count || 0, uniques: p.uniques || 0 });
      });
      topPages.sort((a, b) => b.views - a.views);
    }

    const topSources = [];
    if (Array.isArray(sources.data)) {
      sources.data.forEach(s => {
        topSources.push({ source: s.path || s.resource, views: s.count || 0 });
      });
      topSources.sort((a, b) => b.views - a.views);
    }

    return {
      available: true,
      pageviews: totalPageviews,
      uniques: totalUniques,
      topPages: topPages.slice(0, 10),
      topSources: topSources.slice(0, 10),
    };
  } catch (err) {
    return { available: false, error: err.message };
  }
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    if (payload.role !== 'super_admin' && payload.role !== 'org_admin') return null;
    return payload;
  } catch {
    return null;
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const auth = checkAuth(event);
  if (!auth) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const params = event.queryStringParameters || {};
    const days = parseInt(params.days) || 90;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Fetch Netlify Analytics in parallel with DB queries
    const analyticsPromise = fetchNetlifyAnalytics(days);

    const db = getDb();

    // 1. Patient Reach metrics
    const reach = await db`
      SELECT
        COUNT(*) as total_events,
        COUNT(DISTINCT COALESCE(meta_json->>'sessionId',
          CONCAT(COALESCE(partner, 'public'), '-', page_source, '-', DATE(ts))
        )) as unique_sessions,
        COUNT(*) FILTER (WHERE event_name = 'page_view') as page_views,
        COUNT(DISTINCT partner) FILTER (WHERE partner IS NOT NULL) as partner_count
      FROM events
      WHERE ts >= ${cutoff}
    `;

    // 2. Program connection metrics (the funding story)
    const connections = await db`
      SELECT
        COUNT(*) FILTER (WHERE event_name = 'copay_card_click') as copay_connections,
        COUNT(*) FILTER (WHERE event_name = 'foundation_click') as foundation_connections,
        COUNT(*) FILTER (WHERE event_name = 'pap_click') as pap_connections,
        COUNT(*) FILTER (WHERE event_name IN ('copay_card_click', 'foundation_click', 'pap_click')) as total_connections,
        COUNT(*) FILTER (WHERE event_name = 'quiz_start') as quiz_starts,
        COUNT(*) FILTER (WHERE event_name = 'quiz_complete') as quiz_completions,
        COUNT(*) FILTER (WHERE event_name = 'med_search') as med_searches
      FROM events
      WHERE ts >= ${cutoff}
    `;

    // 3. Top programs by clicks (which programs drive the most value)
    const topPrograms = await db`
      SELECT
        program_id,
        program_type,
        COUNT(*) as clicks
      FROM events
      WHERE program_id IS NOT NULL
        AND ts >= ${cutoff}
      GROUP BY program_id, program_type
      ORDER BY clicks DESC
      LIMIT 15
    `;

    // 4. Top medications searched/viewed
    let topMedications = [];
    try {
      topMedications = await db`
        SELECT medication_name, interaction_type, COUNT(*) as count
        FROM medication_tracking
        WHERE created_at >= ${cutoff}
        GROUP BY medication_name, interaction_type
        ORDER BY count DESC
        LIMIT 30
      `;
    } catch {
      // medication_tracking table may not exist yet
    }

    // 5. Weekly trend (for growth chart)
    const weeklyTrend = await db`
      SELECT
        DATE_TRUNC('week', ts) as week,
        COUNT(*) as events,
        COUNT(*) FILTER (WHERE event_name IN ('copay_card_click', 'foundation_click', 'pap_click')) as program_connections,
        COUNT(DISTINCT COALESCE(meta_json->>'sessionId',
          CONCAT(COALESCE(partner, 'public'), '-', page_source, '-', DATE(ts))
        )) as unique_sessions
      FROM events
      WHERE ts >= ${cutoff}
      GROUP BY DATE_TRUNC('week', ts)
      ORDER BY week ASC
    `;

    // 6. Price report stats
    let priceReportStats = { total_reports: 0, unique_medications: 0 };
    try {
      const pr = await db`
        SELECT COUNT(*) as total_reports, COUNT(DISTINCT medication_id) as unique_medications
        FROM price_reports
        WHERE created_at >= ${cutoff}
      `;
      priceReportStats = pr[0] || priceReportStats;
    } catch {
      // price_reports table may not exist
    }

    // 7. Quiz email leads
    let leadCount = 0;
    try {
      const leads = await db`
        SELECT COUNT(*) as count FROM quiz_email_leads
        WHERE created_at >= ${cutoff}
      `;
      leadCount = parseInt(leads[0]?.count || 0);
    } catch {
      // table may not exist
    }

    // Aggregate top medications by unique medication name
    const medMap = {};
    topMedications.forEach(row => {
      if (!medMap[row.medication_name]) {
        medMap[row.medication_name] = { name: row.medication_name, searches: 0, views: 0, clicks: 0, adds: 0 };
      }
      const m = medMap[row.medication_name];
      if (row.interaction_type === 'search') m.searches = parseInt(row.count);
      if (row.interaction_type === 'view') m.views = parseInt(row.count);
      if (row.interaction_type === 'program_click') m.clicks = parseInt(row.count);
      if (row.interaction_type === 'add_to_list') m.adds = parseInt(row.count);
    });
    const medicationInsights = Object.values(medMap)
      .sort((a, b) => (b.searches + b.views + b.clicks) - (a.searches + a.views + a.clicks))
      .slice(0, 15);

    const r = reach[0] || {};
    const c = connections[0] || {};

    // Await Netlify Analytics result
    const siteTraffic = await analyticsPromise;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        period: { days, start: cutoff.split('T')[0], end: new Date().toISOString().split('T')[0] },
        siteTraffic,
        patientReach: {
          uniqueSessions: parseInt(r.unique_sessions || 0),
          pageViews: parseInt(r.page_views || 0),
          totalEvents: parseInt(r.total_events || 0),
          partnerOrgs: parseInt(r.partner_count || 0),
        },
        programConnections: {
          total: parseInt(c.total_connections || 0),
          copay: parseInt(c.copay_connections || 0),
          foundation: parseInt(c.foundation_connections || 0),
          pap: parseInt(c.pap_connections || 0),
          quizStarts: parseInt(c.quiz_starts || 0),
          quizCompletions: parseInt(c.quiz_completions || 0),
          medSearches: parseInt(c.med_searches || 0),
        },
        topPrograms: topPrograms.map(p => ({
          programId: p.program_id,
          programType: p.program_type,
          clicks: parseInt(p.clicks),
        })),
        medicationInsights,
        weeklyTrend: weeklyTrend.map(w => ({
          week: w.week,
          events: parseInt(w.events),
          programConnections: parseInt(w.program_connections),
          uniqueSessions: parseInt(w.unique_sessions),
        })),
        communityPricing: {
          totalReports: parseInt(priceReportStats.total_reports || 0),
          uniqueMedications: parseInt(priceReportStats.unique_medications || 0),
        },
        emailLeads: leadCount,
      }),
    };
  } catch (error) {
    console.error('Impact report error:', error);

    // Surface helpful setup instructions for missing env variables
    const isEnvError = error.message?.includes('is not configured') ||
      error.message?.includes('DATABASE_URL') ||
      error.message?.includes('fetch failed');

    return {
      statusCode: isEnvError ? 503 : 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        setup: isEnvError ? {
          instructions: 'Configure required environment variables in Netlify Dashboard > Site Settings > Environment Variables',
          required: {
            DATABASE_URL: !process.env.DATABASE_URL ? 'MISSING — Get from console.neon.tech' : 'OK',
            NETLIFY_API_TOKEN: !process.env.NETLIFY_API_TOKEN ? 'MISSING — Get from app.netlify.com/user/applications > Personal access tokens' : 'OK',
            NETLIFY_SITE_ID: !process.env.NETLIFY_SITE_ID ? 'MISSING — Get from Site Settings > General > Site ID' : 'OK',
          },
        } : undefined,
      }),
    };
  }
}
