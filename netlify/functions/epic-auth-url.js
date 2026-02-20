// Epic FHIR OAuth2 Authorization URL Generator (PKCE / SMART on FHIR standalone launch)
// Accepts a code_challenge from the client and returns the authorization URL.
// The client is responsible for generating the PKCE code_verifier / code_challenge
// pair and storing the code_verifier for the token exchange step.

import crypto from 'crypto';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
};

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

        // Accept PKCE code_challenge from the client
        const qs = event.queryStringParameters || {};
        const codeChallenge = qs.code_challenge;

        if (!codeChallenge) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'code_challenge query parameter is required for PKCE' })
            };
        }

        // Epic OAuth2 authorize endpoint derived from FHIR base URL
        const authorizeUrl = process.env.EPIC_AUTHORIZE_URL ||
            fhirBaseUrl.replace(/\/api\/FHIR\/R4\/?$/, '/oauth2/authorize');

        // Generate a cryptographically random state parameter for CSRF protection
        const state = crypto.randomBytes(24).toString('base64url');

        // SMART on FHIR scopes for reading patient medication data
        const scope = 'patient/MedicationRequest.read patient/Patient.read launch/patient openid fhirUser';

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

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ url: authUrl, state })
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
