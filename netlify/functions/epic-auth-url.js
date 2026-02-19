// Epic FHIR OAuth2 Authorization URL Generator
// Returns the URL to redirect the user to Epic's authorization page

// CORS headers
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

        // Epic OAuth2 authorize endpoint derived from FHIR base URL
        // Standard: {base}/oauth2/authorize
        const authorizeUrl = process.env.EPIC_AUTHORIZE_URL ||
            fhirBaseUrl.replace(/\/api\/FHIR\/R4\/?$/, '/oauth2/authorize');

        // Generate a random state parameter for CSRF protection
        const state = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');

        // SMART on FHIR scopes for reading patient medication data
        const scope = 'patient/MedicationRequest.read patient/Patient.read launch/patient openid fhirUser';

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            redirect_uri: redirectUri,
            scope,
            state,
            aud: fhirBaseUrl
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
