// netlify/functions/epic-config-check.js
// Diagnostic endpoint to verify Epic OAuth2 configuration in production.
// Returns masked values so you can verify env vars are set correctly
// without exposing secrets. Hit GET /api/epic-config-check to use.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

function mask(value, showChars = 6) {
  if (!value) return '(NOT SET)';
  if (value.length <= showChars) return value;
  return value.substring(0, showChars) + '...' + `[${value.length} chars]`;
}

function normalizeUrl(url) {
  return url ? url.replace(/\/+$/, '') : url;
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS };
  }

  const clientId = process.env.EPIC_CLIENT_ID;
  const redirectUri = process.env.EPIC_REDIRECT_URI;
  const fhirBaseUrl = process.env.EPIC_FHIR_BASE_URL;
  const authorizeUrl = process.env.EPIC_AUTHORIZE_URL;
  const tokenUrl = process.env.EPIC_TOKEN_URL;
  const scopes = process.env.EPIC_SCOPES;

  const issues = [];

  // Check required vars
  if (!clientId) {
    issues.push('EPIC_CLIENT_ID is not set. This is required.');
  }
  if (!redirectUri) {
    issues.push('EPIC_REDIRECT_URI is not set. This is required.');
  }

  // Check for sandbox indicators in production
  if (clientId && clientId.length < 30) {
    issues.push('EPIC_CLIENT_ID looks short — sandbox IDs are different from production IDs.');
  }
  if (fhirBaseUrl && fhirBaseUrl.includes('interconnect-fhir-oauth')) {
    issues.push('EPIC_FHIR_BASE_URL contains "interconnect-fhir-oauth" which is the Epic SANDBOX. For production, use your health system\'s actual FHIR endpoint.');
  }
  if (redirectUri && redirectUri.includes('localhost')) {
    issues.push('EPIC_REDIRECT_URI contains "localhost". This must be your production domain.');
  }

  // Check redirect URI format
  if (redirectUri) {
    if (redirectUri.endsWith('/')) {
      issues.push('EPIC_REDIRECT_URI has a trailing slash. Epic is strict about exact URI matching — remove the trailing slash if your Epic registration does not include it.');
    }
    if (!redirectUri.startsWith('https://')) {
      issues.push('EPIC_REDIRECT_URI does not start with https://. Epic requires HTTPS in production.');
    }
    if (!redirectUri.includes('/auth/epic/callback')) {
      issues.push('EPIC_REDIRECT_URI does not contain /auth/epic/callback. Expected format: https://yourdomain.com/auth/epic/callback');
    }
  }

  // Try SMART discovery
  let discoveryResult = null;
  const base = normalizeUrl(fhirBaseUrl || 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4');
  try {
    const wellKnownUrl = `${base}/.well-known/smart-configuration`;
    const res = await fetch(wellKnownUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const config = await res.json();
      discoveryResult = {
        status: 'OK',
        authorization_endpoint: config.authorization_endpoint || '(not found)',
        token_endpoint: config.token_endpoint || '(not found)',
        scopes_supported: config.scopes_supported || []
      };
    } else {
      discoveryResult = { status: 'FAILED', http_status: res.status, message: 'SMART discovery endpoint returned non-OK status' };
      issues.push('SMART on FHIR .well-known discovery failed. The FHIR base URL may be incorrect.');
    }
  } catch (e) {
    discoveryResult = { status: 'ERROR', message: e.message };
    issues.push(`SMART discovery request failed: ${e.message}. Check EPIC_FHIR_BASE_URL.`);
  }

  // Check scope compatibility
  const requestedScopes = (scopes || 'launch/patient openid fhirUser patient/Patient.read patient/MedicationRequest.read').split(' ');
  if (!requestedScopes.includes('launch/patient')) {
    issues.push('EPIC_SCOPES is missing "launch/patient". This scope is REQUIRED for standalone patient-facing launch — without it, Epic cannot provide patient context and may show a generic "OAuth2 Error" page.');
  }
  if (discoveryResult?.scopes_supported?.length > 0) {
    const unsupported = requestedScopes.filter(s => !discoveryResult.scopes_supported.includes(s));
    if (unsupported.length > 0) {
      issues.push(`These requested scopes are NOT in the server's supported list: ${unsupported.join(', ')}. This will cause authorization to fail.`);
    }
  }

  const config = {
    epic_client_id: mask(clientId, 8),
    epic_redirect_uri: redirectUri || '(NOT SET)',
    epic_fhir_base_url: fhirBaseUrl || '(NOT SET — using sandbox default)',
    epic_authorize_url: authorizeUrl || '(NOT SET — will use SMART discovery)',
    epic_token_url: tokenUrl || '(NOT SET — will use SMART discovery)',
    epic_scopes: scopes || '(NOT SET — using default: patient/Patient.read patient/MedicationRequest.read)',
    netlify_url: process.env.URL || '(NOT SET)',
    node_env: process.env.NODE_ENV || '(NOT SET)',
  };

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      status: issues.length === 0 ? 'OK' : 'ISSUES_FOUND',
      issues,
      config,
      smart_discovery: discoveryResult,
      checklist: [
        `1. EPIC_CLIENT_ID must be your PRODUCTION client ID from Epic App Orchard (not sandbox)`,
        `2. EPIC_REDIRECT_URI must EXACTLY match what's registered in Epic (currently: ${redirectUri || 'NOT SET'})`,
        `3. EPIC_FHIR_BASE_URL must point to the production FHIR server (currently: ${fhirBaseUrl ? (fhirBaseUrl.includes('interconnect-fhir-oauth') ? 'SANDBOX' : 'custom') : 'NOT SET — defaulting to SANDBOX'})`,
        `4. All requested scopes must be enabled in your Epic app registration`,
        `5. Your app must be approved for production use in Epic App Orchard`
      ]
    }, null, 2)
  };
}
