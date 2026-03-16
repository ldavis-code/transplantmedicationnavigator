// netlify/functions/epic-ehr-callback.js
// Handles the OAuth2 callback for the Epic EHR launch flow.
//
// After epic-ehr-launch.js redirects the browser to Epic's authorize endpoint,
// Epic redirects back here with ?code=...&state=... . This function:
//   1. Decodes state to recover iss, PKCE code_verifier, and token endpoint
//   2. Exchanges the auth code for tokens (with PKCE)
//   3. Extracts the Epic organization identifier from the token response
//   4. Runs checkLicense() to verify the org is licensed
//   5. Sets an httpOnly session cookie and redirects to the app

import { checkLicense } from '../../lib/licenseCheck.ts';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
};

// --------------- helpers ---------------

function normalizeUrl(url) {
  return url ? url.replace(/\/+$/, '') : url;
}

/**
 * Discover the token endpoint from the FHIR server's SMART configuration.
 */
async function discoverTokenEndpoint(fhirBaseUrl) {
  const base = normalizeUrl(fhirBaseUrl);
  try {
    const res = await fetch(`${base}/.well-known/smart-configuration`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const config = await res.json();
      if (config.token_endpoint) {
        console.log('[epic-ehr-callback] Discovered token endpoint:', config.token_endpoint);
        return config.token_endpoint;
      }
    }
  } catch (e) {
    console.log('[epic-ehr-callback] SMART discovery failed:', e.message);
  }
  return null;
}

/**
 * Extract a stable org identifier from the ISS URL.
 * e.g. https://fhir.myhealthsystem.org/interconnect/api/FHIR/R4 → fhir.myhealthsystem.org
 */
function extractOrgFromIss(iss) {
  try {
    return new URL(iss).hostname;
  } catch {
    return iss;
  }
}

/**
 * Build a Set-Cookie header value for an httpOnly, Secure cookie.
 */
function buildCookie(name, value, maxAge) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  return parts.join('; ');
}

function redirectTo(path, cookies) {
  const headers = {
    Location: path,
    'Cache-Control': 'no-store',
  };
  if (cookies && cookies.length > 0) {
    // Netlify supports multiValueHeaders for multiple Set-Cookie headers
    return {
      statusCode: 302,
      headers,
      multiValueHeaders: {
        'Set-Cookie': cookies,
      },
    };
  }
  return { statusCode: 302, headers };
}

// --------------- handler ---------------

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { code, state, error: epicError, error_description: epicErrorDesc } =
      event.queryStringParameters || {};

    // ── Handle Epic-side errors (user denied consent, etc.) ──
    if (epicError) {
      console.error(
        '[epic-ehr-callback] Epic returned error: %s — %s',
        epicError,
        epicErrorDesc
      );
      return redirectTo(
        `/error?msg=epic_auth_error&detail=${encodeURIComponent(epicErrorDesc || epicError)}`
      );
    }

    // ── Validate required params ──
    if (!code || !state) {
      console.error('[epic-ehr-callback] Missing callback params');
      return redirectTo('/error?msg=missing_callback_params');
    }

    // ── Decode state ──
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    } catch (e) {
      // Try standard base64 as fallback (the user's original code used plain base64)
      try {
        stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      } catch {
        console.error('[epic-ehr-callback] Failed to decode state:', e.message);
        return redirectTo('/error?msg=invalid_state');
      }
    }

    const iss = normalizeUrl(stateData.iss);
    const codeVerifier = stateData.cv;
    let tokenUrl = stateData.te;

    if (!iss) {
      return redirectTo('/error?msg=invalid_state');
    }

    // ── Resolve token endpoint ──
    if (!tokenUrl) {
      tokenUrl = process.env.EPIC_TOKEN_URL;
    }
    if (!tokenUrl) {
      tokenUrl = await discoverTokenEndpoint(iss);
    }
    if (!tokenUrl) {
      tokenUrl = iss.replace(/\/api\/FHIR\/R4\/?$/, '/oauth2/token');
      console.warn(
        '[epic-ehr-callback] Using URL-derived token endpoint:',
        tokenUrl
      );
    }

    // ── Normalise redirect URI ──
    let redirectUri = process.env.EPIC_REDIRECT_URI;
    if (redirectUri && !redirectUri.startsWith('http://') && !redirectUri.startsWith('https://')) {
      redirectUri = 'https://' + redirectUri;
    }
    if (redirectUri) {
      redirectUri = redirectUri.replace(/\/+$/, '');
    }

    // ── Exchange code for tokens ──
    console.log('[epic-ehr-callback] Exchanging code at %s', tokenUrl);

    const tokenParams = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: process.env.EPIC_CLIENT_ID,
    };
    // Include code_verifier for PKCE (EHR launch flow includes it)
    if (codeVerifier) {
      tokenParams.code_verifier = codeVerifier;
    }

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(tokenParams),
    });

    const responseText = await tokenResponse.text();
    console.log('[epic-ehr-callback] Token response status:', tokenResponse.status);

    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch {
      console.error(
        '[epic-ehr-callback] Non-JSON token response:',
        responseText.substring(0, 300)
      );
      return redirectTo('/error?msg=token_exchange_failed');
    }

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('[epic-ehr-callback] Token error:', JSON.stringify(tokenData));
      return redirectTo(
        `/error?msg=token_exchange_failed&detail=${encodeURIComponent(tokenData.error_description || tokenData.error || 'unknown')}`
      );
    }

    console.log(
      '[epic-ehr-callback] Token granted: scope="%s" patient=%s',
      tokenData.scope || 'NONE',
      tokenData.patient
    );

    // ── Extract organization identity ──
    // Epic puts the org ID in different places depending on version.
    const epicOrgId =
      tokenData.organization ||
      tokenData.tenant ||
      extractOrgFromIss(iss);

    // ── License check ──
    const license = await checkLicense(epicOrgId);

    if (!license.licensed) {
      console.warn(
        '[epic-ehr-callback] Unlicensed org %s: %s',
        epicOrgId,
        license.reason
      );
      // Set short-lived cookies so the "not licensed" page can show context
      const cookies = [
        buildCookie('tmn_org_id', epicOrgId, 300),
        buildCookie('tmn_iss', iss, 300),
      ];
      return redirectTo('/not-licensed', cookies);
    }

    // ── Licensed — set session cookie and redirect to the app ──
    console.log(
      '[epic-ehr-callback] Licensed org: %s (%s, tier=%s)',
      license.org.name,
      license.org.id,
      license.org.tier
    );

    const sessionPayload = JSON.stringify({
      accessToken: tokenData.access_token,
      patientId: tokenData.patient,
      orgId: epicOrgId,
      orgName: license.org.name,
      tier: license.org.tier,
      iss,
    });

    const cookies = [
      buildCookie('tmn_session', sessionPayload, 3600),
    ];

    return redirectTo('/app', cookies);
  } catch (error) {
    console.error('[epic-ehr-callback] Error:', error);
    return redirectTo('/error?msg=callback_error');
  }
}
