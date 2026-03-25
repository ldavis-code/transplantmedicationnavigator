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

    // Netlify Analytics API expects timestamps in milliseconds
    var fromTs = thirtyDaysAgo.getTime();
    var toTs = now.getTime();

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

    // Log to Netlify function logs for debugging
    console.log('WEB ANALYTICS RESULT:', JSON.stringify({
      totalPageviews: totalPageviews,
      totalVisitors: totalVisitors,
      totalBandwidth: totalBandwidth,
      hasPageviewsData: !!(pageviewsData && pageviewsData.data),
      pageviewsDataLength: pageviewsData && pageviewsData.data ? pageviewsData.data.length : 0,
      firstEntry: pageviewsData && pageviewsData.data && pageviewsData.data[0] ? pageviewsData.data[0] : 'none',
      isArray: pageviewsData && pageviewsData.data && pageviewsData.data[0] ? Array.isArray(pageviewsData.data[0]) : 'no data',
    }));

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
