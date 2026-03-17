/**
 * Admin Impact Report API
 * Combines Netlify Analytics (real traffic) with DB events (program interactions)
 */

import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;

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

/**
 * Fetch from Netlify Analytics API
 * Docs: https://analytics.services.netlify.com/v2/{site_id}/...
 */
async function fetchNetlifyAnalytics(endpoint, from, to, extraParams = '') {
  if (!NETLIFY_API_TOKEN || !NETLIFY_SITE_ID) return null;

  const url = `https://analytics.services.netlify.com/v2/${NETLIFY_SITE_ID}/${endpoint}?from=${from}&to=${to}&timezone=America/New_York${extraParams}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${NETLIFY_API_TOKEN}` },
    });
    if (!res.ok) {
      console.error(`Netlify Analytics ${endpoint} error: ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`Netlify Analytics ${endpoint} fetch error:`, err.message);
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
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const cutoff = cutoffDate.toISOString();

    // Unix timestamps in seconds for Netlify API
    const fromTs = Math.floor(cutoffDate.getTime() / 1000);
    const toTs = Math.floor(now.getTime() / 1000);

    // --- Netlify Analytics (real traffic data) ---
    const [pageviewsData, visitorsData, topPagesData, topSourcesData] = await Promise.all([
      fetchNetlifyAnalytics('pageviews', fromTs, toTs, '&resolution=day'),
      fetchNetlifyAnalytics('visitors', fromTs, toTs, '&resolution=day'),
      fetchNetlifyAnalytics('ranking/pages', fromTs, toTs, '&limit=20'),
      fetchNetlifyAnalytics('ranking/sources', fromTs, toTs, '&limit=15'),
    ]);

    // Aggregate Netlify totals
    let netlifyPageviews = 0;
    let netlifyVisitors = 0;
    let dailyTraffic = [];

    if (pageviewsData?.data) {
      netlifyPageviews = pageviewsData.data.reduce((sum, d) => sum + (d.count || 0), 0);
      dailyTraffic = pageviewsData.data.map(d => ({ date: d.date, pageviews: d.count || 0 }));
    }
    if (visitorsData?.data) {
      netlifyVisitors = visitorsData.data.reduce((sum, d) => sum + (d.count || 0), 0);
      // Merge visitor counts into daily traffic
      visitorsData.data.forEach((d, i) => {
        if (dailyTraffic[i]) {
          dailyTraffic[i].visitors = d.count || 0;
        }
      });
    }

    // Top pages from Netlify
    const topPages = (topPagesData?.data || []).map(p => ({
      path: p.resource,
      count: p.count || 0,
    }));

    // Top referral sources from Netlify
    const topSources = (topSourcesData?.data || []).map(s => ({
      source: s.resource || 'Direct',
      count: s.count || 0,
    }));

    const hasNetlifyData = !!(NETLIFY_API_TOKEN && NETLIFY_SITE_ID);

    // --- Database: program interaction metrics ---
    // Wrapped in try/catch — events table may not exist yet
    let connections = [{}];
    let reach = [];
    let topPrograms = [];
    let weeklyTrend = [];
    let dbAvailable = false;
    try {
      const results = await Promise.all([
        db`
          SELECT
            COUNT(*) FILTER (WHERE event_name = 'copay_card_click') as copay_connections,
            COUNT(*) FILTER (WHERE event_name = 'foundation_click') as foundation_connections,
            COUNT(*) FILTER (WHERE event_name = 'pap_click') as pap_connections,
            COUNT(*) FILTER (WHERE event_name IN ('copay_card_click', 'foundation_click', 'pap_click')) as total_connections,
            COUNT(*) FILTER (WHERE event_name = 'quiz_start') as quiz_starts,
            COUNT(*) FILTER (WHERE event_name = 'quiz_complete') as quiz_completions,
            COUNT(*) FILTER (WHERE event_name = 'med_search') as med_searches,
            COUNT(*) FILTER (WHERE event_name = 'page_view') as db_page_views,
            COUNT(DISTINCT COALESCE(meta_json->>'sessionId',
              CONCAT(COALESCE(partner, 'public'), '-', page_source, '-', DATE(ts))
            )) as unique_sessions,
            COUNT(DISTINCT partner) FILTER (WHERE partner IS NOT NULL) as partner_count
          FROM events
          WHERE ts >= ${cutoff}
        `,
        db`
          SELECT event_name, COUNT(*) as count
          FROM events
          WHERE ts >= ${cutoff}
          GROUP BY event_name
        `,
        db`
          SELECT program_id, program_type, COUNT(*) as clicks
          FROM events
          WHERE program_id IS NOT NULL AND ts >= ${cutoff}
          GROUP BY program_id, program_type
          ORDER BY clicks DESC
          LIMIT 15
        `,
        db`
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
        `,
      ]);
      connections = results[0];
      reach = results[1];
      topPrograms = results[2];
      weeklyTrend = results[3];
      dbAvailable = true;
    } catch (dbErr) {
      console.warn('Events table query failed (table may not exist):', dbErr.message);
    }

    // Medication insights (table may not exist)
    let medicationInsights = [];
    try {
      const topMedications = await db`
        SELECT medication_name, interaction_type, COUNT(*) as count
        FROM medication_tracking
        WHERE created_at >= ${cutoff}
        GROUP BY medication_name, interaction_type
        ORDER BY count DESC
        LIMIT 30
      `;
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
      medicationInsights = Object.values(medMap)
        .sort((a, b) => (b.searches + b.views + b.clicks) - (a.searches + a.views + a.clicks))
        .slice(0, 15);
    } catch {
      // medication_tracking table may not exist yet
    }

    // Price reports (table may not exist)
    let priceReportStats = { total_reports: 0, unique_medications: 0 };
    try {
      const pr = await db`
        SELECT COUNT(*) as total_reports, COUNT(DISTINCT medication_id) as unique_medications
        FROM price_reports WHERE created_at >= ${cutoff}
      `;
      priceReportStats = pr[0] || priceReportStats;
    } catch {
      // table may not exist
    }

    // Quiz email leads (table may not exist)
    let leadCount = 0;
    try {
      const leads = await db`
        SELECT COUNT(*) as count FROM quiz_email_leads WHERE created_at >= ${cutoff}
      `;
      leadCount = parseInt(leads[0]?.count || 0);
    } catch {
      // table may not exist
    }

    const c = connections[0] || {};
    const funnelCounts = Object.fromEntries(reach.map(r => [r.event_name, parseInt(r.count)]));

    // Use Netlify data for traffic, fall back to DB events
    const totalPageviews = hasNetlifyData ? netlifyPageviews : parseInt(c.db_page_views || 0);
    const totalVisitors = hasNetlifyData ? netlifyVisitors : parseInt(c.unique_sessions || 0);

    // Await Netlify Analytics result
    const siteTraffic = await analyticsPromise;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        period: {
          days,
          start: cutoff.split('T')[0],
          end: now.toISOString().split('T')[0],
        },
        dataSource: hasNetlifyData && dbAvailable ? 'netlify+db'
          : hasNetlifyData ? 'netlify'
          : dbAvailable ? 'db'
          : 'none',
        dataSources: {
          netlify: hasNetlifyData,
          netlifyConfigured: !!(NETLIFY_API_TOKEN && NETLIFY_SITE_ID),
          database: dbAvailable,
        },
        // Traffic metrics (from Netlify if available, else DB)
        traffic: {
          pageviews: totalPageviews,
          uniqueVisitors: totalVisitors,
          topPages,
          topSources,
          dailyTraffic: hasNetlifyData ? dailyTraffic : [],
        },
        // Patient reach (from DB events)
        patientReach: {
          uniqueSessions: parseInt(c.unique_sessions || 0),
          pageViews: parseInt(c.db_page_views || 0),
          partnerOrgs: parseInt(c.partner_count || 0),
        },
        // Program connections (from DB events)
        programConnections: {
          total: parseInt(c.total_connections || 0),
          copay: parseInt(c.copay_connections || 0),
          foundation: parseInt(c.foundation_connections || 0),
          pap: parseInt(c.pap_connections || 0),
          quizStarts: parseInt(c.quiz_starts || 0),
          quizCompletions: parseInt(c.quiz_completions || 0),
          medSearches: parseInt(c.med_searches || 0),
        },
        // Conversion funnel
        funnel: {
          pageViews: funnelCounts.page_view || 0,
          quizStarts: funnelCounts.quiz_start || 0,
          quizCompletes: funnelCounts.quiz_complete || 0,
          medSearches: funnelCounts.med_search || 0,
          applicationClicks: (funnelCounts.copay_card_click || 0) +
            (funnelCounts.foundation_click || 0) +
            (funnelCounts.pap_click || 0),
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
