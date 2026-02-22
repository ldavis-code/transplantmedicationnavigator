// netlify/functions/epic-token-exchange.js
// Exchanges an OAuth2 authorization code for an access token using PKCE.
// Supports SMART on FHIR .well-known discovery for the token endpoint.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Normalize a URL by removing any trailing slash.
 */
function normalizeUrl(url) {
  return url ? url.replace(/\/+$/, '') : url;
}

/**
 * Discover the token endpoint from the FHIR server's SMART configuration.
 * @param {string} fhirBaseUrl - The FHIR R4 base URL
 * @returns {Promise<string|null>}
 */
async function discoverTokenEndpoint(fhirBaseUrl) {
  const base = normalizeUrl(fhirBaseUrl);
  try {
    const res = await fetch(`${base}/.well-known/smart-configuration`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const config = await res.json();
      if (config.token_endpoint) {
        console.log('[epic-token-exchange] Discovered token endpoint:', config.token_endpoint);
        return config.token_endpoint;
      }
    }
  } catch (e) {
    console.log('[epic-token-exchange] SMART discovery failed:', e.message);
  }
  return null;
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS };
  }

  try {
    const body = JSON.parse(event.body);
    const { code, code_verifier: codeVerifier, token_endpoint: clientTokenEndpoint } = body;

    if (!code || !codeVerifier) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Missing required parameters: code and code_verifier are required'
        })
      };
    }

    // Detailed pre-fetch logging
    console.log('[epic-token-exchange] Code length:', code?.length);
    console.log('[epic-token-exchange] Code verifier length:', codeVerifier?.length);
    console.log('[epic-token-exchange] Client ID:', process.env.EPIC_CLIENT_ID);
    console.log('[epic-token-exchange] Redirect URI:', process.env.EPIC_REDIRECT_URI);

    const fhirBaseUrl = normalizeUrl(
      process.env.EPIC_FHIR_BASE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4'
    );

    // Determine token endpoint:
    // 1. Explicit env var override (highest priority)
    // 2. Token endpoint passed from the auth-url step (discovered earlier)
    // 3. SMART discovery (if not already discovered)
    // 4. Fallback: derive from FHIR base URL
    let tokenUrl = process.env.EPIC_TOKEN_URL;

    if (!tokenUrl && clientTokenEndpoint) {
      tokenUrl = clientTokenEndpoint;
      console.log('[epic-token-exchange] Using token endpoint from auth step:', tokenUrl);
    }

    if (!tokenUrl) {
      tokenUrl = await discoverTokenEndpoint(fhirBaseUrl);
    }

    if (!tokenUrl) {
      tokenUrl = fhirBaseUrl.replace(/\/api\/FHIR\/R4\/?$/, '/oauth2/token');
      console.warn('[epic-token-exchange] Using URL derivation fallback for token endpoint:', tokenUrl);
    }

    console.log('[epic-token-exchange] Token URL:', tokenUrl);

    const tokenResponse = await fetch(
      tokenUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: process.env.EPIC_REDIRECT_URI,
          client_id: process.env.EPIC_CLIENT_ID,
          code_verifier: codeVerifier
        })
      }
    );

    // Log full response before parsing
    const responseText = await tokenResponse.text();
    console.log('[epic-token-exchange] Response status:', tokenResponse.status);
    console.log('[epic-token-exchange] Response body:', responseText);

    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch {
      console.error('[epic-token-exchange] Response is not JSON:', responseText.substring(0, 300));
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Token endpoint returned an invalid response. The token URL may be incorrect.',
          token_url: tokenUrl
        })
      };
    }

    if (!tokenResponse.ok) {
      console.error('[epic-token-exchange] Token error:', JSON.stringify(tokenData));

      // Provide specific guidance based on the error
      let userMessage = 'Token exchange failed';
      const errorDesc = tokenData.error_description || '';
      if (tokenData.error === 'invalid_grant') {
        userMessage = 'The authorization code has expired or was already used. Please try connecting again.';
      } else if (tokenData.error === 'invalid_client') {
        userMessage = 'The app client ID is not recognized by this FHIR server. Verify EPIC_CLIENT_ID is set to your production (not sandbox) client ID in Netlify environment variables.';
      } else if (tokenData.error === 'invalid_request') {
        userMessage = 'The token request was rejected by Epic. This usually means EPIC_REDIRECT_URI (' +
          (process.env.EPIC_REDIRECT_URI || 'NOT SET') +
          ') does not exactly match what is registered in Epic App Orchard, or the PKCE code_verifier is invalid.';
      } else if (tokenData.error === 'unauthorized_client') {
        userMessage = 'This client is not authorized for the authorization_code grant type. Ensure your Epic app is registered for the SMART App Launch (standalone) flow.';
      } else if (tokenData.error) {
        userMessage = `Epic token error: ${tokenData.error}${errorDesc ? ' — ' + errorDesc : ''}. Visit /api/epic-config-check to diagnose configuration issues.`;
      }

      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: userMessage,
          details: tokenData,
          token_url: tokenUrl
        })
      };
    }

    // Log granted scope so it's visible in logs
    console.log('[epic-token-exchange] TOKEN GRANTED: scope="' + (tokenData.scope || 'NONE') + '" patient=' + tokenData.patient);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(tokenData)
    };
  } catch (error) {
    console.error('[epic-token-exchange] Error:', error.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Token exchange failed: ' + error.message
      })
    };
  }
}
