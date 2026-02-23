// netlify/functions/epic-backend-auth.js
// Backend Systems OAuth 2.0 token endpoint for Epic.
//
// Implements the JWT client assertion flow required for Epic backend OAuth:
//   1. Generates a signed JWT assertion with a `jku` header pointing to our JWKS endpoint
//   2. Exchanges the assertion for an access token via the client_credentials grant
//
// This is used for server-to-server (Backend Systems) communication with Epic,
// separate from the patient-facing PKCE OAuth flow.
//
// Per Breaking Change Notification Q-7365177, the JWT header must include a
// `jku` claim pointing to the app's JWK Set URL so Epic can fetch the public
// key to verify the assertion.
//
// Environment variables:
//   EPIC_PRIVATE_KEY          - RSA private key in PEM format (required)
//   EPIC_KEY_ID               - Key ID matching the JWKS endpoint (optional, derived if not set)
//   EPIC_BACKEND_CLIENT_ID    - Client ID for the backend systems app (required)
//                                Falls back to EPIC_CLIENT_ID if not set.
//   EPIC_JWKS_URL             - Full URL to the JWKS endpoint (optional, derived from site URL)
//   EPIC_FHIR_BASE_URL        - FHIR base URL for token endpoint discovery (required)
//   EPIC_TOKEN_URL             - Explicit token endpoint override (optional)

import crypto from 'crypto';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Normalize a PEM key string that may have been stored as a single-line
 * environment variable with literal "\n" characters.
 */
function normalizePem(pem) {
  if (!pem) return null;
  let normalized = pem.replace(/\\n/g, '\n');
  normalized = normalized.trim();
  return normalized;
}

/**
 * Derive a stable key ID (kid) from the RSA private key.
 */
function deriveKeyId(privateKeyPem) {
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const publicKey = crypto.createPublicKey(privateKey);
  const der = publicKey.export({ type: 'spki', format: 'der' });
  return crypto.createHash('sha256').update(der).digest('hex').substring(0, 16);
}

/**
 * Base64url encode a buffer or string.
 */
function base64url(input) {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64url');
}

/**
 * Create a signed JWT assertion for Epic's backend OAuth flow.
 *
 * JWT Header:
 *   alg: RS384
 *   typ: JWT
 *   kid: key ID matching the JWKS
 *   jku: URL to the JWKS endpoint
 *
 * JWT Payload:
 *   iss: client_id
 *   sub: client_id
 *   aud: token endpoint URL
 *   jti: unique nonce
 *   exp: 4 minutes from now (Epic max is 5 min)
 *   iat: now
 *   nbf: now
 */
function createJwtAssertion({ privateKeyPem, clientId, tokenUrl, kid, jkuUrl }) {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: 'RS384',
    typ: 'JWT',
    kid,
    jku: jkuUrl
  };

  const payload = {
    iss: clientId,
    sub: clientId,
    aud: tokenUrl,
    jti: crypto.randomUUID(),
    exp: now + 240, // 4 minutes
    iat: now,
    nbf: now
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const signature = crypto.sign('sha384', Buffer.from(signingInput), privateKey);
  const encodedSignature = base64url(signature);

  return `${signingInput}.${encodedSignature}`;
}

/**
 * Discover the token endpoint from the FHIR server's SMART configuration.
 */
async function discoverTokenEndpoint(fhirBaseUrl) {
  const base = fhirBaseUrl.replace(/\/+$/, '');
  try {
    const res = await fetch(`${base}/.well-known/smart-configuration`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const config = await res.json();
      if (config.token_endpoint) {
        console.log('[epic-backend-auth] Discovered token endpoint:', config.token_endpoint);
        return config.token_endpoint;
      }
    }
  } catch (e) {
    console.log('[epic-backend-auth] SMART discovery failed:', e.message);
  }
  return null;
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  try {
    // Parse optional request body for dynamic FHIR base URL
    let requestFhirBaseUrl = null;
    if (event.body) {
      try {
        const body = JSON.parse(event.body);
        requestFhirBaseUrl = body.fhir_base_url;
      } catch {
        // Body is optional; ignore parse errors
      }
    }

    // Validate required configuration
    const rawPrivateKey = process.env.EPIC_PRIVATE_KEY;
    if (!rawPrivateKey) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Backend OAuth not configured. EPIC_PRIVATE_KEY is required.'
        })
      };
    }

    const clientId = process.env.EPIC_BACKEND_CLIENT_ID || process.env.EPIC_CLIENT_ID;
    if (!clientId) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Backend OAuth not configured. Set EPIC_BACKEND_CLIENT_ID or EPIC_CLIENT_ID.'
        })
      };
    }

    const fhirBaseUrl = (requestFhirBaseUrl || process.env.EPIC_FHIR_BASE_URL || '').replace(/\/+$/, '');
    if (!fhirBaseUrl) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'No FHIR base URL available. Provide fhir_base_url in the request body or set EPIC_FHIR_BASE_URL.'
        })
      };
    }

    // Determine the token endpoint
    let tokenUrl = process.env.EPIC_TOKEN_URL;
    if (!tokenUrl) {
      tokenUrl = await discoverTokenEndpoint(fhirBaseUrl);
    }
    if (!tokenUrl) {
      tokenUrl = fhirBaseUrl.replace(/\/api\/FHIR\/R4\/?$/, '/oauth2/token');
      console.warn('[epic-backend-auth] Using URL derivation fallback for token endpoint:', tokenUrl);
    }

    // Determine the JKU URL
    const siteUrl = (process.env.URL || '').replace(/\/+$/, '');
    const jkuUrl = process.env.EPIC_JWKS_URL || (siteUrl ? `${siteUrl}/.well-known/jwks.json` : null);
    if (!jkuUrl) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Cannot determine JKU URL. Set EPIC_JWKS_URL or ensure the Netlify URL environment variable is available.'
        })
      };
    }

    // Prepare the private key
    const privateKeyPem = normalizePem(rawPrivateKey);
    const kid = process.env.EPIC_KEY_ID || deriveKeyId(privateKeyPem);

    console.log('[epic-backend-auth] Client ID:', clientId);
    console.log('[epic-backend-auth] Token URL:', tokenUrl);
    console.log('[epic-backend-auth] JKU URL:', jkuUrl);
    console.log('[epic-backend-auth] Key ID:', kid);

    // Create the signed JWT assertion
    const assertion = createJwtAssertion({
      privateKeyPem,
      clientId,
      tokenUrl,
      kid,
      jkuUrl
    });

    // Exchange the JWT assertion for an access token
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: assertion
      })
    });

    const responseText = await tokenResponse.text();
    console.log('[epic-backend-auth] Token response status:', tokenResponse.status);

    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch {
      console.error('[epic-backend-auth] Non-JSON response:', responseText.substring(0, 300));
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Token endpoint returned an invalid response.',
          token_url: tokenUrl
        })
      };
    }

    if (!tokenResponse.ok) {
      console.error('[epic-backend-auth] Token error:', JSON.stringify(tokenData));

      let userMessage = 'Backend token exchange failed';
      const errorDesc = tokenData.error_description || '';
      if (tokenData.error === 'invalid_client') {
        userMessage = 'The backend client ID is not recognized or the JWT assertion could not be verified. ' +
          'Ensure EPIC_BACKEND_CLIENT_ID is correct, the private key matches the public key at ' +
          jkuUrl + ', and the app is registered for Backend Systems in Epic.';
      } else if (tokenData.error === 'invalid_grant') {
        userMessage = 'The JWT assertion was rejected. Check that the key ID (kid) matches between the JWKS and the assertion, ' +
          'and that the JKU URL is accessible from Epic\'s servers.';
      } else if (tokenData.error === 'unauthorized_client') {
        userMessage = 'This client is not authorized for the client_credentials grant type. ' +
          'Ensure your Epic app has the "Backend Systems" user type enabled.';
      } else if (tokenData.error) {
        userMessage = `Epic backend auth error: ${tokenData.error}${errorDesc ? ' - ' + errorDesc : ''}`;
      }

      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: userMessage,
          details: tokenData,
          token_url: tokenUrl,
          jku_url: jkuUrl
        })
      };
    }

    console.log('[epic-backend-auth] Backend token granted, scope=' + (tokenData.scope || 'NONE'));

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(tokenData)
    };
  } catch (error) {
    console.error('[epic-backend-auth] Error:', error.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Backend token exchange failed: ' + error.message
      })
    };
  }
}
