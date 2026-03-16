// netlify/functions/epic-ehr-launch.js
// Handles the Epic EHR launch flow (SMART on FHIR "EHR launch").
//
// When a clinician launches this app from inside Epic, Epic POSTs/GETs to this
// endpoint with `iss` (the FHIR base URL) and `launch` (an opaque token).
// We validate the organization's license, discover the authorize endpoint via
// SMART .well-known, build the OAuth URL with PKCE, and redirect the browser.

import crypto from 'crypto';
import { checkLicense } from '../../lib/licenseCheck.ts';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

// --------------- helpers ---------------

function normalizeUrl(url) {
  return url ? url.replace(/\/+$/, '') : url;
}

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(codeVerifier) {
  return crypto
    .createHash('sha256')
    .update(codeVerifier, 'ascii')
    .digest('base64url');
}

/**
 * Discover OAuth2 endpoints from the FHIR server's SMART configuration.
 */
async function discoverSmartEndpoints(fhirBaseUrl) {
  const base = normalizeUrl(fhirBaseUrl);

  // .well-known/smart-configuration (SMART App Launch STU2+)
  try {
    const res = await fetch(`${base}/.well-known/smart-configuration`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const config = await res.json();
      if (config.authorization_endpoint && config.token_endpoint) {
        return {
          authorize: config.authorization_endpoint,
          token: config.token_endpoint,
        };
      }
    }
  } catch (e) {
    console.log('[epic-ehr-launch] .well-known discovery failed:', e.message);
  }

  // Fallback: /metadata CapabilityStatement
  try {
    const res = await fetch(`${base}/metadata`, {
      headers: { Accept: 'application/fhir+json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const cap = await res.json();
      const oauthExt = cap.rest?.[0]?.security?.extension?.find(
        (ext) =>
          ext.url ===
          'http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris'
      );
      if (oauthExt) {
        const authorize = oauthExt.extension?.find(
          (e) => e.url === 'authorize'
        )?.valueUri;
        const token = oauthExt.extension?.find(
          (e) => e.url === 'token'
        )?.valueUri;
        if (authorize && token) {
          return { authorize, token };
        }
      }
    }
  } catch (e) {
    console.log('[epic-ehr-launch] /metadata discovery failed:', e.message);
  }

  return null;
}

/**
 * Try to extract an Epic organization identifier from the ISS URL so we can
 * run a license check.  Epic ISS URLs typically look like:
 *   https://fhir.myhealthsystem.org/interconnect/api/FHIR/R4
 * We extract the hostname as a stable org identifier.
 */
function extractOrgIdFromIss(iss) {
  try {
    const url = new URL(iss);
    return url.hostname; // e.g. "fhir.myhealthsystem.org"
  } catch {
    return null;
  }
}

// --------------- handler ---------------

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { iss, launch } = event.queryStringParameters || {};

    // ── Validate required SMART launch parameters ──
    if (!iss || !launch) {
      console.error('[epic-ehr-launch] Missing launch params: iss=%s launch=%s', iss, launch);
      return {
        statusCode: 302,
        headers: {
          Location: '/error?msg=missing_launch_params',
        },
      };
    }

    const fhirBaseUrl = normalizeUrl(iss);

    // ── License check ──
    const epicOrgId = extractOrgIdFromIss(fhirBaseUrl);
    if (epicOrgId) {
      const license = await checkLicense(epicOrgId);
      if (!license.licensed) {
        console.warn(
          '[epic-ehr-launch] Unlicensed org %s: %s',
          epicOrgId,
          license.reason
        );
        return {
          statusCode: 302,
          headers: {
            Location: `/error?msg=org_not_licensed&reason=${encodeURIComponent(license.reason)}`,
          },
        };
      }
      console.log(
        '[epic-ehr-launch] Licensed org: %s (%s, tier=%s)',
        license.org.name,
        license.org.id,
        license.org.tier
      );
    }

    // ── Env vars ──
    const clientId = process.env.EPIC_CLIENT_ID;
    let redirectUri = process.env.EPIC_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error:
            'Epic integration not configured. Set EPIC_CLIENT_ID and EPIC_REDIRECT_URI.',
        }),
      };
    }

    // Auto-fix / normalise redirect URI
    if (!redirectUri.startsWith('http://') && !redirectUri.startsWith('https://')) {
      redirectUri = 'https://' + redirectUri;
    }
    redirectUri = redirectUri.replace(/\/+$/, '');

    // ── Discover authorize endpoint ──
    let authorizeUrl = process.env.EPIC_AUTHORIZE_URL;
    let tokenUrl = process.env.EPIC_TOKEN_URL;

    if (!authorizeUrl || !tokenUrl) {
      const discovered = await discoverSmartEndpoints(fhirBaseUrl);
      if (discovered) {
        authorizeUrl = authorizeUrl || discovered.authorize;
        tokenUrl = tokenUrl || discovered.token;
      }
    }

    if (!authorizeUrl) {
      authorizeUrl = fhirBaseUrl.replace(/\/api\/FHIR\/R4\/?$/, '/oauth2/authorize');
      console.warn(
        '[epic-ehr-launch] Falling back to URL-derived authorize endpoint:',
        authorizeUrl
      );
    }

    // ── PKCE ──
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    // ── EHR launch scopes ──
    // "launch" (without /patient) is required for EHR launch — Epic supplies
    // patient context via the launch token rather than a patient picker.
    const scope =
      process.env.EPIC_EHR_SCOPES ||
      'launch openid fhirUser patient/Patient.read patient/MedicationRequest.read';

    // ── State ──
    // Encode iss + codeVerifier + tokenUrl so the callback can use them.
    const state = Buffer.from(
      JSON.stringify({
        iss: fhirBaseUrl,
        cv: codeVerifier,
        te: tokenUrl || null,
      })
    ).toString('base64url');

    // ── Build authorization URL ──
    const authParams = [
      ['response_type', 'code'],
      ['client_id', clientId],
      ['redirect_uri', redirectUri],
      ['launch', launch],
      ['scope', scope],
      ['state', state],
      ['aud', fhirBaseUrl],
      ['code_challenge', codeChallenge],
      ['code_challenge_method', 'S256'],
    ];
    const queryString = authParams
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    const authUrl = `${authorizeUrl}?${queryString}`;

    console.log('[epic-ehr-launch] Redirecting to:', authorizeUrl);
    console.log('[epic-ehr-launch] iss=%s client_id=%s', fhirBaseUrl, clientId);

    // ── Redirect browser to Epic's authorization page ──
    return {
      statusCode: 302,
      headers: {
        Location: authUrl,
        'Cache-Control': 'no-store',
      },
    };
  } catch (error) {
    console.error('[epic-ehr-launch] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'EHR launch failed: ' + error.message,
      }),
    };
  }
}
