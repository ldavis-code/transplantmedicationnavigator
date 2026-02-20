// netlify/functions/epic-token-exchange.js
// NO node-fetch import needed - Node 18+ has built-in fetch

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

  try {
    const { code, code_verifier } = JSON.parse(event.body);

    console.log('Exchanging token with code length:', code?.length);
    console.log('code_verifier present:', !!code_verifier);
    console.log('EPIC_CLIENT_ID present:', !!process.env.EPIC_CLIENT_ID);
    console.log('EPIC_REDIRECT_URI:', process.env.EPIC_REDIRECT_URI);

    const tokenResponse = await fetch(
      'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
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
          code_verifier: code_verifier
        })
      }
    );

    const tokenData = await tokenResponse.json();
    console.log('Token response status:', tokenResponse.status);
    console.log('Patient ID received:', tokenData.patient);

    if (!tokenResponse.ok) {
      console.error('Token error:', JSON.stringify(tokenData));
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Token exchange failed',
          details: tokenData
        })
      };
    }

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
    console.error('Token exchange error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Token exchange failed',
        details: error.message
      })
    };
  }
}
