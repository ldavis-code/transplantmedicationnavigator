/**
 * Netlify Analytics API Proxy
 *
 * Fetches site analytics (pageviews, unique visitors, bandwidth)
 * from the Netlify API for the last 30 days, plus all-time totals
 * from the events table in the database.
 *
 * Uses the same pattern as admin-impact.js which successfully fetches
 * from the Netlify Analytics API.
 */

const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

function checkAuth(event) {
  var authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    var parts = authHeader.substring(7).split('.');
    var data = parts[0];
    var signature = parts[1];
    var expected = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
    if (signature !== expected) return null;
    var payload = JSON.parse(Buffer.from(data, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    if (payload.role !== 'super_admin' && payload.role !== 'org_admin') return null;
    return payload;
  } catch (e) {
    return null;
  }
}

/**
 * Fetch from Netlify Analytics API — same pattern as admin-impact.js
 */
async function fetchNetlifyAnalytics(endpoint, from, to, extraParams) {
  if (!extraParams) extraParams = '';
  if (!NETLIFY_API_TOKEN || !NETLIFY_SITE_ID) return null;

  var url = 'https://analytics.services.netlify.com/v2/' + NETLIFY_SITE_ID + '/' + endpoint + '?from=' + from + '&to=' + to + '&timezone=America/New_York' + extraParams;
  try {
    var res = await fetch(url, {
      headers: { Authorization: 'Bearer ' + NETLIFY_API_TOKEN },
    });
    if (!res.ok) {
      console.error('Netlify Analytics ' + endpoint + ' error: ' + res.status + ' ' + res.statusText);
      return { _error: res.status + ' ' + res.statusText };
    }
    return await res.json();
  } catch (err) {
    console.error('Netlify Analytics ' + endpoint + ' fetch error:', err.message);
    return { _error: err.message };
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  var i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + sizes[i];
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  var auth = checkAuth(event);
  if (!auth) {
    return { statusCode: 401, headers: headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (!NETLIFY_API_TOKEN || !NETLIFY_SITE_ID) {
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        available: false,
        message: 'Netlify Analytics not configured. Set NETLIFY_API_TOKEN and NETLIFY_SITE_ID.',
      }),
    };
  }

  try {
    var now = new Date();
    var thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Netlify Analytics API expects timestamps in milliseconds
    var fromTs = thirtyDaysAgo.getTime();
    var toTs = now.getTime();

    // Fetch Netlify analytics and database event counts in parallel
    var dbPageviewsPromise = (function() {
      if (!process.env.DATABASE_URL) return Promise.resolve(null);
      try {
        var db = neon(process.env.DATABASE_URL);
        return db`
          SELECT
            COUNT(*) AS all_time_total,
            COUNT(*) FILTER (WHERE ts >= NOW() - INTERVAL '7 days') AS last_7_days,
            COUNT(*) FILTER (WHERE ts >= NOW() - INTERVAL '30 days') AS last_30_days,
            COUNT(*) FILTER (WHERE ts >= CURRENT_DATE) AS today
          FROM events
          WHERE event_name = 'page_view'
        `.then(function(rows) { return rows[0]; })
         .catch(function(err) { console.error('DB pageview query error:', err.message); return null; });
      } catch (e) {
        return Promise.resolve(null);
      }
    })();

    var dailyPageviewsPromise = (function() {
      if (!process.env.DATABASE_URL) return Promise.resolve([]);
      try {
        var db = neon(process.env.DATABASE_URL);
        return db`
          SELECT ts::date AS day, COUNT(*) AS count
          FROM events
          WHERE event_name = 'page_view' AND ts >= NOW() - INTERVAL '30 days'
          GROUP BY ts::date
          ORDER BY day ASC
        `.catch(function(err) { console.error('DB daily pageview query error:', err.message); return []; });
      } catch (e) {
        return Promise.resolve([]);
      }
    })();

    var results = await Promise.all([
      fetchNetlifyAnalytics('pageviews', fromTs, toTs, '&resolution=day'),
      fetchNetlifyAnalytics('visitors', fromTs, toTs, '&resolution=day'),
      fetchNetlifyAnalytics('bandwidth', fromTs, toTs, '&resolution=day'),
      dbPageviewsPromise,
      dailyPageviewsPromise,
    ]);

    var pageviewsData = results[0];
    var visitorsData = results[1];
    var bandwidthData = results[2];
    var dbPageviews = results[3];
    var dailyPageviews = results[4];

    var totalPageviews = 0;
    var totalVisitors = 0;
    var totalBandwidth = 0;

    // Netlify Analytics returns arrays: [[timestamp, value], ...]
    function sumData(dataArray) {
      if (!dataArray || !dataArray.length) return 0;
      return dataArray.reduce(function(sum, d) {
        // Handle both formats: [ts, value] arrays and {count: value} objects
        if (Array.isArray(d)) return sum + (d[1] || 0);
        return sum + (d.count || d.value || 0);
      }, 0);
    }

    if (pageviewsData && pageviewsData.data) {
      totalPageviews = sumData(pageviewsData.data);
    }

    if (visitorsData && visitorsData.data) {
      totalVisitors = sumData(visitorsData.data);
    }

    if (bandwidthData && bandwidthData.data) {
      totalBandwidth = sumData(bandwidthData.data);
    }

    // Build running totals from database events
    var runningTotals = null;
    if (dbPageviews) {
      runningTotals = {
        allTime: parseInt(dbPageviews.all_time_total || 0),
        last30Days: parseInt(dbPageviews.last_30_days || 0),
        last7Days: parseInt(dbPageviews.last_7_days || 0),
        today: parseInt(dbPageviews.today || 0),
      };
    }

    // Format daily pageview data for chart display
    var dailyData = (dailyPageviews || []).map(function(d) {
      return { date: d.day, count: parseInt(d.count) };
    });

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        available: true,
        period: {
          from: thirtyDaysAgo.toISOString().split('T')[0],
          to: now.toISOString().split('T')[0],
          days: 30,
        },
        totalPageviews: totalPageviews,
        totalUniqueVisitors: totalVisitors,
        totalBandwidthBytes: totalBandwidth,
        totalBandwidthFormatted: formatBytes(totalBandwidth),
        runningTotals: runningTotals,
        dailyPageviews: dailyData,
      }),
    };
  } catch (error) {
    console.error('Netlify Analytics error:', error);
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        available: false,
        message: 'Failed to fetch Netlify Analytics data.',
        error: error.message,
      }),
    };
  }
};
