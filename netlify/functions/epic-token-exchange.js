// Epic FHIR OAuth2 Token Exchange (PKCE / public client)
// Exchanges an authorization code + PKCE code_verifier for an access token.
// No client_secret is used — this is a public client relying on PKCE.

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { code, code_verifier } = JSON.parse(event.body || '{}');

        if (!code) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Authorization code is required' })
            };
        }

        if (!code_verifier) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'code_verifier is required for PKCE' })
            };
        }

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

        // Epic OAuth2 token endpoint
        const tokenUrl = process.env.EPIC_TOKEN_URL ||
            fhirBaseUrl.replace(/\/api\/FHIR\/R4\/?$/, '/oauth2/token');

        // Exchange authorization code for access token with PKCE code_verifier
        const tokenParams = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            code_verifier
        });

        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: tokenParams.toString()
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Epic token exchange failed:', tokenResponse.status, errorText);
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Failed to exchange authorization code' })
            };
        }

        const tokenData = await tokenResponse.json();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                access_token: tokenData.access_token,
                patient: tokenData.patient,
                expires_in: tokenData.expires_in,
                scope: tokenData.scope
            })
        };

    } catch (error) {
        console.error('Epic token exchange error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Token exchange failed' })
        };
    }
}
