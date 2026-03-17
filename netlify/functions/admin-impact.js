/**
 * Admin Impact Report API
 * Combines Netlify Analytics (real traffic) with DB events (program interactions)
 */

const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;

let _sql;
function getDb() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

function checkAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const parts = authHeader.substring(7).split('.');
    const data = parts[0];
    const signature = parts[1];
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    if (payload.role !== 'super_admin' && payload.role !== 'org_admin') return null;
    return payload;
  } catch (e) {
    return null;
  }
}

/**
 * Fetch from Netlify Analytics API
 */
async function fetchNetlifyAnalytics(endpoint, from, to, extraParams) {
  if (!extraParams) extraParams = '';
  if (!NETLIFY_API_TOKEN || !NETLIFY_SITE_ID) return null;

  const url = 'https://analytics.services.netlify.com/v2/' + NETLIFY_SITE_ID + '/' + endpoint + '?from=' + from + '&to=' + to + '&timezone=America/New_York' + extraParams;
  try {
    const res = await fetch(url, {
      headers: { Authorization: 'Bearer ' + NETLIFY_API_TOKEN },
    });
    if (!res.ok) {
      console.error('Netlify Analytics ' + endpoint + ' error: ' + res.status + ' ' + res.statusText);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('Netlify Analytics ' + endpoint + ' fetch error:', err.message);
    return null;
  }
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const auth = checkAuth(event);
  if (!auth) {
    return { statusCode: 401, headers: headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const db = getDb();
    const params = event.queryStringParameters || {};
    const days = parseInt(params.days) || 90;
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const cutoff = cutoffDate.toISOString();

    // Unix timestamps in seconds for Netlify API
    const fromTs = Math.floor(cutoffDate.getTime() / 1000);
    const toTs = Math.floor(now.getTime() / 1000);

    // --- Netlify Analytics (real traffic data) ---
    var results = await Promise.all([
      fetchNetlifyAnalytics('pageviews', fromTs, toTs, '&resolution=day'),
      fetchNetlifyAnalytics('visitors', fromTs, toTs, '&resolution=day'),
      fetchNetlifyAnalytics('ranking/pages', fromTs, toTs, '&limit=20'),
      fetchNetlifyAnalytics('ranking/sources', fromTs, toTs, '&limit=15'),
    ]);
    var pageviewsData = results[0];
    var visitorsData = results[1];
    var topPagesData = results[2];
    var topSourcesData = results[3];

    // Aggregate Netlify totals
    var netlifyPageviews = 0;
    var netlifyVisitors = 0;
    var dailyTraffic = [];

    if (pageviewsData && pageviewsData.data) {
      netlifyPageviews = pageviewsData.data.reduce(function(sum, d) { return sum + (d.count || 0); }, 0);
      dailyTraffic = pageviewsData.data.map(function(d) { return { date: d.date, pageviews: d.count || 0 }; });
    }
    if (visitorsData && visitorsData.data) {
      netlifyVisitors = visitorsData.data.reduce(function(sum, d) { return sum + (d.count || 0); }, 0);
      visitorsData.data.forEach(function(d, i) {
        if (dailyTraffic[i]) {
          dailyTraffic[i].visitors = d.count || 0;
        }
      });
    }

    // Top pages from Netlify
    var topPages = ((topPagesData && topPagesData.data) || []).map(function(p) {
      return { path: p.resource, count: p.count || 0 };
    });

    // Top referral sources from Netlify
    var topSources = ((topSourcesData && topSourcesData.data) || []).map(function(s) {
      return { source: s.resource || 'Direct', count: s.count || 0 };
    });

    var hasNetlifyData = !!(NETLIFY_API_TOKEN && NETLIFY_SITE_ID);

    // --- Database: program interaction metrics ---
    var connections = [{}];
    var reach = [];
    var topPrograms = [];
    var weeklyTrend = [];
    var dbAvailable = false;
    try {
      var dbResults = await Promise.all([
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
      connections = dbResults[0];
      reach = dbResults[1];
      topPrograms = dbResults[2];
      weeklyTrend = dbResults[3];
      dbAvailable = true;
    } catch (dbErr) {
      console.warn('Events table query failed (table may not exist):', dbErr.message);
    }

    // Medication insights (table may not exist)
    var medicationInsights = [];
    try {
      var topMedications = await db`
        SELECT medication_name, interaction_type, COUNT(*) as count
        FROM medication_tracking
        WHERE created_at >= ${cutoff}
        GROUP BY medication_name, interaction_type
        ORDER BY count DESC
        LIMIT 30
      `;
      var medMap = {};
      topMedications.forEach(function(row) {
        if (!medMap[row.medication_name]) {
          medMap[row.medication_name] = { name: row.medication_name, searches: 0, views: 0, clicks: 0, adds: 0 };
        }
        var m = medMap[row.medication_name];
        if (row.interaction_type === 'search') m.searches = parseInt(row.count);
        if (row.interaction_type === 'view') m.views = parseInt(row.count);
        if (row.interaction_type === 'program_click') m.clicks = parseInt(row.count);
        if (row.interaction_type === 'add_to_list') m.adds = parseInt(row.count);
      });
      medicationInsights = Object.values(medMap)
        .sort(function(a, b) { return (b.searches + b.views + b.clicks) - (a.searches + a.views + a.clicks); })
        .slice(0, 15);
    } catch (e) {
      // medication_tracking table may not exist yet
    }

    // Price reports (table may not exist)
    var priceReportStats = { total_reports: 0, unique_medications: 0 };
    try {
      var pr = await db`
        SELECT COUNT(*) as total_reports, COUNT(DISTINCT medication_id) as unique_medications
        FROM price_reports WHERE created_at >= ${cutoff}
      `;
      priceReportStats = pr[0] || priceReportStats;
    } catch (e) {
      // table may not exist
    }

    // Quiz email leads (table may not exist)
    var leadCount = 0;
    try {
      var leads = await db`
        SELECT COUNT(*) as count FROM quiz_email_leads WHERE created_at >= ${cutoff}
      `;
      leadCount = parseInt((leads[0] && leads[0].count) || 0);
    } catch (e) {
      // table may not exist
    }

    var c = connections[0] || {};
    var funnelCounts = {};
    reach.forEach(function(r) { funnelCounts[r.event_name] = parseInt(r.count); });

    // Use Netlify data for traffic, fall back to DB events
    var totalPageviews = hasNetlifyData ? netlifyPageviews : parseInt(c.db_page_views || 0);
    var totalVisitors = hasNetlifyData ? netlifyVisitors : parseInt(c.unique_sessions || 0);

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        period: {
          days: days,
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
        traffic: {
          pageviews: totalPageviews,
          uniqueVisitors: totalVisitors,
          topPages: topPages,
          topSources: topSources,
          dailyTraffic: hasNetlifyData ? dailyTraffic : [],
        },
        patientReach: {
          uniqueSessions: parseInt(c.unique_sessions || 0),
          pageViews: parseInt(c.db_page_views || 0),
          partnerOrgs: parseInt(c.partner_count || 0),
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
        funnel: {
          pageViews: funnelCounts.page_view || 0,
          quizStarts: funnelCounts.quiz_start || 0,
          quizCompletes: funnelCounts.quiz_complete || 0,
          medSearches: funnelCounts.med_search || 0,
          applicationClicks: (funnelCounts.copay_card_click || 0) +
            (funnelCounts.foundation_click || 0) +
            (funnelCounts.pap_click || 0),
        },
        topPrograms: topPrograms.map(function(p) {
          return { programId: p.program_id, programType: p.program_type, clicks: parseInt(p.clicks) };
        }),
        medicationInsights: medicationInsights,
        weeklyTrend: weeklyTrend.map(function(w) {
          return {
            week: w.week,
            events: parseInt(w.events),
            programConnections: parseInt(w.program_connections),
            uniqueSessions: parseInt(w.unique_sessions),
          };
        }),
        communityPricing: {
          totalReports: parseInt(priceReportStats.total_reports || 0),
          uniqueMedications: parseInt(priceReportStats.unique_medications || 0),
        },
        emailLeads: leadCount,
      }),
    };
  } catch (error) {
    console.error('Impact report error:', error);
    return { statusCode: 500, headers: headers, body: JSON.stringify({ error: error.message }) };
  }
};
