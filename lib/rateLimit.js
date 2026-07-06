/**
 * Shared fixed-window rate limiter for public (unauthenticated) endpoints.
 * Backed by the rate_counters table (migration 041): one row per caller per
 * window, upsert-incremented — cheap even for high-traffic endpoints.
 *
 * Privacy: callers are identified by an HMAC of IP + endpoint name; the raw
 * IP is never stored. Rows are deleted after a day by the data-retention job.
 *
 * Availability: fails OPEN — if the table is missing or the database errors,
 * requests are allowed. Rate limiting must never take the site down.
 */

import crypto from 'crypto';

function clientKey(event, endpoint) {
  const ip =
    event.headers['x-nf-client-connection-ip'] ||
    (event.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    'unknown';
  const salt = process.env.JWT_SECRET || 'rate-limit-salt';
  return crypto.createHmac('sha256', salt).update(`${ip}:${endpoint}`).digest('hex');
}

/**
 * @returns {Promise<boolean>} true if this request is allowed.
 */
export async function allowRequest(sql, event, endpoint, limit, windowMinutes = 15) {
  try {
    const identifier = clientKey(event, endpoint);
    const windowMs = windowMinutes * 60 * 1000;
    const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs).toISOString();
    const rows = await sql`
      INSERT INTO rate_counters (identifier, window_start, count)
      VALUES (${identifier}, ${windowStart}, 1)
      ON CONFLICT (identifier, window_start)
      DO UPDATE SET count = rate_counters.count + 1
      RETURNING count
    `;
    return rows[0].count <= limit;
  } catch {
    return true;
  }
}

export function rateLimitedResponse(headers) {
  return {
    statusCode: 429,
    headers,
    body: JSON.stringify({ error: 'Too many requests. Please slow down and try again in a few minutes.' }),
  };
}
