// netlify/functions/epic-token-exchange.js
// NO node-fetch import needed - Node 18+ has built-in fetch

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS };
  }

  try {
    const { code, code_verifier: codeVerifier } = JSON.parse(event.body);

    // Detailed pre-fetch logging
    console.log('Code length:', code?.length);
    console.log('Code verifier length:', codeVerifier?.length);
    console.log('Client ID:', process.env.EPIC_CLIENT_ID);
    console.log('Redirect URI:', process.env.EPIC_REDIRECT_URI);

    const fhirBaseUrl = process.env.EPIC_FHIR_BASE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4';
    const tokenUrl = process.env.EPIC_TOKEN_URL ||
      fhirBaseUrl.replace(/\/api\/FHIR\/R4\/?$/, '/oauth2/token');
    console.log('Token URL:', tokenUrl);

    const tokenResponse = await fetch(
      tokenUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: process.env.EPIC_REDIRECT_URI,
          client_id: process.env.EPIC_CLIENT_ID,
          code_verifier: codeVerifier
        })
      }
    );

    // Log full response before parsing
    const responseText = await tokenResponse.text();
    console.log('Token response status:', tokenResponse.status);
    console.log('Token response body:', responseText);

    const tokenData = JSON.parse(responseText);
    console.log('=== FULL TOKEN RESPONSE ===');
    console.log(JSON.stringify(tokenData));

    if (!tokenResponse.ok) {
      console.error('Token error:', JSON.stringify(tokenData));
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Token exchange failed',
          details: tokenData
        })
      };
    }

    // Log granted scope at ERROR level so it's visible in filtered logs
    console.error('TOKEN GRANTED: scope="' + (tokenData.scope || 'NONE') + '" patient=' + tokenData.patient);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(tokenData)
    };
  } catch (error) {
    console.error('Token exchange error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Token exchange failed',
        details: error.message
      })
    };
  }
}
