// netlify/functions/epic-config-check.js
// Diagnostic endpoint to verify Epic OAuth2 configuration in production.
// Returns masked values so you can verify env vars are set correctly
// without exposing secrets. Hit GET /api/epic-config-check to use.
//
// Also checks Backend Systems OAuth / JKU configuration per Breaking Change
// Notification Q-7365177 (JWK Set URL requirement for backend OAuth apps).

import crypto from 'crypto';

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
  const requestedScopes = (scopes || 'patient/Patient.read patient/MedicationRequest.read').split(' ');
  if (discoveryResult?.scopes_supported?.length > 0) {
    const unsupported = requestedScopes.filter(s => !discoveryResult.scopes_supported.includes(s));
    if (unsupported.length > 0) {
      issues.push(`These requested scopes are NOT in the server's supported list: ${unsupported.join(', ')}. This will cause authorization to fail.`);
    }
  }

  // --- Backend Systems OAuth / JKU diagnostics (Q-7365177) ---
  const backendClientId = process.env.EPIC_BACKEND_CLIENT_ID;
  const privateKey = process.env.EPIC_PRIVATE_KEY;
  const keyId = process.env.EPIC_KEY_ID;
  const jwksUrl = process.env.EPIC_JWKS_URL;
  const siteUrl = (process.env.URL || '').replace(/\/+$/, '');

  const backendIssues = [];
  let jkuResult = null;
  let keyInfo = null;

  const hasBackendConfig = !!(privateKey || backendClientId);

  if (hasBackendConfig) {
    if (!privateKey) {
      backendIssues.push('EPIC_PRIVATE_KEY is not set. Required for backend OAuth JWT assertions.');
    }
    if (!backendClientId && !clientId) {
      backendIssues.push('Neither EPIC_BACKEND_CLIENT_ID nor EPIC_CLIENT_ID is set. A client ID is required.');
    }

    // Validate the private key can be parsed
    if (privateKey) {
      try {
        const normalizedPem = privateKey.replace(/\\n/g, '\n').trim();
        const privKeyObj = crypto.createPrivateKey(normalizedPem);
        const pubKeyObj = crypto.createPublicKey(privKeyObj);
        const jwk = pubKeyObj.export({ format: 'jwk' });

        const derivedKid = keyId || crypto.createHash('sha256')
          .update(pubKeyObj.export({ type: 'spki', format: 'der' }))
          .digest('hex').substring(0, 16);

        keyInfo = {
          status: 'OK',
          key_type: jwk.kty,
          algorithm: 'RS384',
          kid: derivedKid,
          kid_source: keyId ? 'EPIC_KEY_ID env var' : 'derived from public key',
          modulus_length: jwk.n ? Math.ceil(jwk.n.length * 6 / 8) * 8 + ' bits (approx)' : 'unknown'
        };

        // Check key size (Epic requires at least 2048 bits)
        if (jwk.n && jwk.n.length < 340) {
          backendIssues.push('RSA key appears to be smaller than 2048 bits. Epic requires at least 2048-bit RSA keys.');
        }
      } catch (e) {
        keyInfo = { status: 'ERROR', message: e.message };
        backendIssues.push(`EPIC_PRIVATE_KEY could not be parsed: ${e.message}. Ensure it is a valid RSA private key in PEM format. If stored as a single line, use literal \\n for newlines.`);
      }
    }

    // Determine and test the JKU URL
    const effectiveJkuUrl = jwksUrl || (siteUrl ? `${siteUrl}/.well-known/jwks.json` : null);
    if (!effectiveJkuUrl) {
      backendIssues.push('Cannot determine JKU URL. Set EPIC_JWKS_URL or ensure the Netlify URL environment variable is set.');
    } else {
      // Try fetching the JWKS endpoint
      try {
        const jkuRes = await fetch(effectiveJkuUrl, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });
        if (jkuRes.ok) {
          const jwks = await jkuRes.json();
          const keyCount = jwks.keys?.length || 0;
          jkuResult = {
            status: 'OK',
            url: effectiveJkuUrl,
            url_source: jwksUrl ? 'EPIC_JWKS_URL env var' : 'derived from site URL',
            keys_found: keyCount,
            key_ids: jwks.keys?.map(k => k.kid) || []
          };
          if (keyCount === 0) {
            backendIssues.push('JWKS endpoint returned an empty key set. Ensure EPIC_PRIVATE_KEY is configured.');
          }
        } else {
          jkuResult = { status: 'FAILED', url: effectiveJkuUrl, http_status: jkuRes.status };
          backendIssues.push(`JWKS endpoint returned HTTP ${jkuRes.status}. The endpoint may not be deployed yet.`);
        }
      } catch (e) {
        jkuResult = { status: 'ERROR', url: effectiveJkuUrl, message: e.message };
        backendIssues.push(`Could not reach JWKS endpoint at ${effectiveJkuUrl}: ${e.message}`);
      }
    }

    // Check for rotation key
    if (process.env.EPIC_PRIVATE_KEY_2) {
      try {
        const pem2 = process.env.EPIC_PRIVATE_KEY_2.replace(/\\n/g, '\n').trim();
        crypto.createPrivateKey(pem2);
        // Key is valid, no issue
      } catch (e) {
        backendIssues.push(`EPIC_PRIVATE_KEY_2 (rotation key) could not be parsed: ${e.message}`);
      }
    }
  }

  const config = {
    epic_client_id: mask(clientId, 8),
    epic_redirect_uri: redirectUri || '(NOT SET)',
    epic_fhir_base_url: fhirBaseUrl || '(NOT SET — using sandbox default)',
    epic_authorize_url: authorizeUrl || '(NOT SET — will use SMART discovery)',
    epic_token_url: tokenUrl || '(NOT SET — will use SMART discovery)',
    epic_scopes: scopes || '(NOT SET — using default: patient/Patient.read patient/MedicationRequest.read)',
    netlify_url: siteUrl || '(NOT SET)',
    node_env: process.env.NODE_ENV || '(NOT SET)',
  };

  const backendConfig = {
    epic_backend_client_id: mask(backendClientId, 8),
    epic_private_key: privateKey ? `(SET — ${privateKey.length} chars)` : '(NOT SET)',
    epic_key_id: keyId || '(NOT SET — will derive from key)',
    epic_jwks_url: jwksUrl || (siteUrl ? `(NOT SET — will use ${siteUrl}/.well-known/jwks.json)` : '(NOT SET)'),
    epic_private_key_2: process.env.EPIC_PRIVATE_KEY_2 ? '(SET — rotation key)' : '(NOT SET — no rotation key)',
  };

  const allIssues = [...issues, ...backendIssues];

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      status: allIssues.length === 0 ? 'OK' : 'ISSUES_FOUND',
      issues: allIssues,
      config,
      smart_discovery: discoveryResult,
      backend_oauth: hasBackendConfig ? {
        status: backendIssues.length === 0 ? 'OK' : 'ISSUES_FOUND',
        issues: backendIssues,
        config: backendConfig,
        key_info: keyInfo,
        jwks_endpoint: jkuResult
      } : {
        status: 'NOT_CONFIGURED',
        message: 'Backend Systems OAuth is not configured. Set EPIC_PRIVATE_KEY and optionally EPIC_BACKEND_CLIENT_ID to enable. Required by Epic Breaking Change Q-7365177 for apps with "Backend Systems" user type.'
      },
      checklist: [
        `1. EPIC_CLIENT_ID must be your PRODUCTION client ID from Epic App Orchard (not sandbox)`,
        `2. EPIC_REDIRECT_URI must EXACTLY match what's registered in Epic (currently: ${redirectUri || 'NOT SET'})`,
        `3. EPIC_FHIR_BASE_URL must point to the production FHIR server (currently: ${fhirBaseUrl ? (fhirBaseUrl.includes('interconnect-fhir-oauth') ? 'SANDBOX' : 'custom') : 'NOT SET — defaulting to SANDBOX'})`,
        `4. All requested scopes must be enabled in your Epic app registration`,
        `5. Your app must be approved for production use in Epic App Orchard`,
        `6. [Backend OAuth] EPIC_PRIVATE_KEY must contain your RSA private key in PEM format`,
        `7. [Backend OAuth] JWKS endpoint must be publicly accessible at /.well-known/jwks.json`,
        `8. [Backend OAuth] Register your JKU URL in Epic App Orchard / Vendor Services (per Q-7365177)`
      ]
    }, null, 2)
  };
}
