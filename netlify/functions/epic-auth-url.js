// Epic FHIR OAuth2 Authorization URL Generator (PKCE / SMART on FHIR standalone launch)
// Generates a PKCE code_verifier + code_challenge pair server-side,
// includes the code_challenge in the Epic authorization URL,
// and returns the code_verifier to the frontend for the token exchange step.

import crypto from 'crypto';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
};

/**
 * Generate a random code_verifier (43-128 characters, base64url-encoded).
 * Per RFC 7636 Section 4.1.
 */
function generateCodeVerifier() {
    // 32 random bytes → 43 base64url characters
    return crypto.randomBytes(32).toString('base64url');
}

/**
 * Create a code_challenge by SHA-256 hashing the code_verifier
 * and base64url-encoding the result. Per RFC 7636 Section 4.2.
 */
function generateCodeChallenge(codeVerifier) {
    return crypto
        .createHash('sha256')
        .update(codeVerifier, 'ascii')
        .digest('base64url');
}

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const clientId = process.env.EPIC_CLIENT_ID;
        const redirectUri = process.env.EPIC_REDIRECT_URI;
        const fhirBaseUrl = process.env.EPIC_FHIR_BASE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4';

        if (!clientId || !redirectUri) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Epic FHIR integration is not configured' })
            };
        }

        // Generate PKCE code_verifier and code_challenge server-side
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = generateCodeChallenge(codeVerifier);

        // Epic OAuth2 authorize endpoint derived from FHIR base URL
        const authorizeUrl = process.env.EPIC_AUTHORIZE_URL ||
            fhirBaseUrl.replace(/\/api\/FHIR\/R4\/?$/, '/oauth2/authorize');

        // Generate a cryptographically random state parameter for CSRF protection
        const state = crypto.randomBytes(24).toString('base64url');

        // SMART on FHIR scopes for reading patient medication data.
        // IMPORTANT: Epic rejects the entire authorization request if ANY scope
        // is not enabled in the app registration. Use EPIC_SCOPES env var to
        // match exactly what is configured in your Epic Developer portal.
        // Default is the minimal set needed for medication import.
        const scope = process.env.EPIC_SCOPES ||
            'openid launch/patient patient/MedicationRequest.read patient/Patient.read';

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            redirect_uri: redirectUri,
            scope,
            state,
            aud: fhirBaseUrl,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
        });

        const authUrl = `${authorizeUrl}?${params.toString()}`;

        // Log the full authorization URL for debugging Epic "request is invalid" errors
        console.error('ERROR [epic-auth-url] Authorization URL:', authUrl);
        console.error('ERROR [epic-auth-url] Params:', JSON.stringify({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope,
            aud: fhirBaseUrl,
            authorize_endpoint: authorizeUrl
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                url: authUrl,
                state,
                code_verifier: codeVerifier,
                // Include debug info so frontend can log it
                _debug: {
                    scope,
                    redirect_uri: redirectUri,
                    aud: fhirBaseUrl,
                    authorize_endpoint: authorizeUrl
                }
            })
        };

    } catch (error) {
        console.error('Epic auth URL error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to generate authorization URL' })
        };
    }
}
