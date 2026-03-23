/**
 * Netlify Analytics API Proxy
 *
 * Fetches site analytics (pageviews, unique visitors, bandwidth)
 * from the Netlify API for the last 30 days.
 *
 * Requires environment variables:
 *   NETLIFY_API_TOKEN - Personal access token from Netlify
 *   NETLIFY_SITE_ID   - The site ID (or uses built-in SITE_ID)
 */

import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const LEGACY_TOKEN_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'admin-secret-change-me';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

function verifyAuthToken(token) {
  try {
    const [data, signature] = token.split('.');
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(data)
      .digest('hex');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    if (payload.role !== 'super_admin' && payload.role !== 'org_admin') return null;
    return payload;
  } catch {
    return null;
  }
}

function verifyLegacyAdminToken(token) {
  try {
    const [data, signature] = token.split('.');
    const expectedSignature = crypto
      .createHmac('sha256', LEGACY_TOKEN_SECRET)
      .update(data)
      .digest('hex');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    if (payload.type !== 'admin') return null;
    return payload;
  } catch {
    return null;
  }
}

function checkAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAuthToken(token) || verifyLegacyAdminToken(token);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${sizes[i]}`;
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

  const netlifyToken = process.env.NETLIFY_API_TOKEN;
  const siteId = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;

  if (!netlifyToken || !siteId) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        available: false,
        message: 'Netlify Analytics not configured. Set NETLIFY_API_TOKEN and NETLIFY_SITE_ID environment variables.',
      }),
    };
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const from = thirtyDaysAgo.getTime();
    const to = now.getTime();

    const netlifyApi = `https://analytics.services.netlify.com/v2/${siteId}`;
    const authHeader = { Authorization: `Bearer ${netlifyToken}` };

    // Fetch pageviews, visitors, and bandwidth in parallel
    const [pageviewsRes, visitorsRes, bandwidthRes] = await Promise.all([
      fetch(`${netlifyApi}/pageviews?from=${from}&to=${to}&timezone=-0500&resolution=day`, {
        headers: authHeader,
      }),
      fetch(`${netlifyApi}/visitors?from=${from}&to=${to}&timezone=-0500&resolution=day`, {
        headers: authHeader,
      }),
      fetch(`${netlifyApi}/bandwidth?from=${from}&to=${to}&timezone=-0500&resolution=day`, {
        headers: authHeader,
      }),
    ]);

    let totalPageviews = 0;
    let totalVisitors = 0;
    let totalBandwidth = 0;
    let dailyPageviews = [];
    let dailyVisitors = [];

    if (pageviewsRes.ok) {
      const data = await pageviewsRes.json();
      // Netlify analytics returns { data: [{ ts, count }, ...] }
      if (data.data) {
        dailyPageviews = data.data;
        totalPageviews = data.data.reduce((sum, d) => sum + (d.count || 0), 0);
      } else if (typeof data === 'number') {
        totalPageviews = data;
      }
    }

    if (visitorsRes.ok) {
      const data = await visitorsRes.json();
      if (data.data) {
        dailyVisitors = data.data;
        totalVisitors = data.data.reduce((sum, d) => sum + (d.count || 0), 0);
      } else if (typeof data === 'number') {
        totalVisitors = data;
      }
    }

    if (bandwidthRes.ok) {
      const data = await bandwidthRes.json();
      if (data.data) {
        totalBandwidth = data.data.reduce((sum, d) => sum + (d.count || 0), 0);
      } else if (typeof data === 'number') {
        totalBandwidth = data;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        available: true,
        period: {
          from: thirtyDaysAgo.toISOString().split('T')[0],
          to: now.toISOString().split('T')[0],
          days: 30,
        },
        totalPageviews,
        totalUniqueVisitors: totalVisitors,
        totalBandwidthBytes: totalBandwidth,
        totalBandwidthFormatted: formatBytes(totalBandwidth),
        dailyPageviews,
        dailyVisitors,
      }),
    };
  } catch (error) {
    console.error('Netlify Analytics error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        available: false,
        message: 'Failed to fetch Netlify Analytics data.',
        error: error.message,
      }),
    };
  }
}
