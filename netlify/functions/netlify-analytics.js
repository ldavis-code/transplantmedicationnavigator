/**
 * Netlify Analytics API Proxy
 *
 * Fetches site analytics (pageviews, unique visitors, bandwidth)
 * from the Netlify API for the last 30 days.
 *
 * Uses the same pattern as admin-impact.js which successfully fetches
 * from the Netlify Analytics API.
 */

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

    // Unix timestamps in seconds for Netlify API
    var fromTs = Math.floor(thirtyDaysAgo.getTime() / 1000);
    var toTs = Math.floor(now.getTime() / 1000);

    // Fetch all three in parallel — same as admin-impact.js
    var results = await Promise.all([
      fetchNetlifyAnalytics('pageviews', fromTs, toTs, '&resolution=day'),
      fetchNetlifyAnalytics('visitors', fromTs, toTs, '&resolution=day'),
      fetchNetlifyAnalytics('bandwidth', fromTs, toTs, '&resolution=day'),
    ]);

    var pageviewsData = results[0];
    var visitorsData = results[1];
    var bandwidthData = results[2];

    var totalPageviews = 0;
    var totalVisitors = 0;
    var totalBandwidth = 0;
    var debug = {
      pageviewsType: pageviewsData ? typeof pageviewsData : 'null',
      pageviewsKeys: pageviewsData ? Object.keys(pageviewsData) : [],
      visitorsType: visitorsData ? typeof visitorsData : 'null',
      visitorsKeys: visitorsData ? Object.keys(visitorsData) : [],
      bandwidthType: bandwidthData ? typeof bandwidthData : 'null',
      bandwidthKeys: bandwidthData ? Object.keys(bandwidthData) : [],
    };

    if (pageviewsData && pageviewsData.data) {
      totalPageviews = pageviewsData.data.reduce(function(sum, d) { return sum + (d.count || 0); }, 0);
      debug.pageviewsSample = pageviewsData.data.slice(0, 2);
      debug.pageviewsLength = pageviewsData.data.length;
    } else if (pageviewsData) {
      debug.pageviewsRaw = JSON.stringify(pageviewsData).substring(0, 200);
    }

    if (visitorsData && visitorsData.data) {
      totalVisitors = visitorsData.data.reduce(function(sum, d) { return sum + (d.count || 0); }, 0);
      debug.visitorsSample = visitorsData.data.slice(0, 2);
    } else if (visitorsData) {
      debug.visitorsRaw = JSON.stringify(visitorsData).substring(0, 200);
    }

    if (bandwidthData && bandwidthData.data) {
      totalBandwidth = bandwidthData.data.reduce(function(sum, d) { return sum + (d.count || 0); }, 0);
    } else if (bandwidthData) {
      debug.bandwidthRaw = JSON.stringify(bandwidthData).substring(0, 200);
    }

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
        debug: debug,
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
