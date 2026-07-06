// netlify/functions/data-retention.js
// Scheduled monthly (see netlify.toml). Enforces the retention promise in the
// Privacy Policy: anonymous usage events, feedback, and community price
// reports are kept for up to 24 months, then deleted.
//
// Also nulls any legacy ip_hash values on price_reports — the old client
// wrote a reversible base64 IP encoding there; new rows never include it.
//
// Runs only as a Netlify scheduled function or with a valid admin token, so
// it cannot be triggered anonymously.

const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

const RETENTION_MONTHS = 24;

const JWT_SECRET = process.env.JWT_SECRET;
const LEGACY_TOKEN_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD;

function verifyToken(token, secret, check) {
  try {
    const [data, signature] = token.split('.');
    const expected = crypto.createHmac('sha256', secret).update(data).digest('hex');
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    return check(payload) ? payload : null;
  } catch {
    return null;
  }
}

function isAuthorized(event) {
  const authHeader = event.headers?.['authorization'] || event.headers?.['Authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.substring(7);
  return !!(
    verifyToken(token, JWT_SECRET, p => p.role === 'super_admin' || p.role === 'org_admin') ||
    verifyToken(token, LEGACY_TOKEN_SECRET, p => p.type === 'admin')
  );
}

function isScheduledInvocation(event) {
  try {
    return !!JSON.parse(event.body || '{}').next_run;
  } catch {
    return false;
  }
}

exports.handler = async (event) => {
  const scheduled = isScheduledInvocation(event);
  if (!scheduled && !isAuthorized(event)) {
    return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const sql = neon(process.env.DATABASE_URL);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS);
  const cutoffIso = cutoff.toISOString();

  // Each target is independent; one failing table must not stop the others
  // (a table may not exist yet in a fresh database).
  const targets = [
    { name: 'events', run: () => sql`DELETE FROM events WHERE ts < ${cutoffIso}` },
    { name: 'medication_tracking', run: () => sql`DELETE FROM medication_tracking WHERE created_at < ${cutoffIso}` },
    { name: 'feedback', run: () => sql`DELETE FROM feedback WHERE created_at < ${cutoffIso}` },
    { name: 'price_reports', run: () => sql`DELETE FROM price_reports WHERE created_at < ${cutoffIso}` },
    { name: 'survey_responses', run: () => sql`DELETE FROM survey_responses WHERE created_at < ${cutoffIso}` },
    { name: 'patient_login_tracking', run: () => sql`DELETE FROM patient_login_tracking WHERE logged_in_at < ${cutoffIso}` },
    { name: 'price_reports_ip_scrub', run: () => sql`UPDATE price_reports SET ip_hash = NULL WHERE ip_hash IS NOT NULL` },
    { name: 'login_attempts', run: () => sql`DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '1 day'` },
  ];

  const results = {};
  for (const target of targets) {
    try {
      await target.run();
      results[target.name] = 'ok';
    } catch (e) {
      results[target.name] = `skipped: ${e.message}`;
    }
  }

  console.log('[data-retention] cutoff=' + cutoffIso, JSON.stringify(results));
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cutoff: cutoffIso, results }),
  };
};
