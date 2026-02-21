// netlify/functions/epic-medications.js
// NO node-fetch import needed - Node 18+ has built-in fetch

const FHIR_HEADERS = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/fhir+json'
});

/**
 * Make a FHIR GET request with retry logic.
 * Retries once after a short delay on 403 to handle token propagation delays
 * between Epic's authorization server and resource server.
 */
async function fhirFetchWithRetry(url, accessToken, { retries = 1, delayMs = 1000 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, {
      method: 'GET',
      headers: FHIR_HEADERS(accessToken)
    });

    // If success or a non-retryable error, return immediately
    if (response.ok || (response.status !== 403 && response.status !== 401)) {
      return response;
    }

    // On 403/401, retry after delay (except on last attempt)
    if (attempt < retries) {
      console.log(`FHIR request returned ${response.status}, retrying in ${delayMs}ms (attempt ${attempt + 1}/${retries + 1})`);
      await new Promise(r => setTimeout(r, delayMs));
    } else {
      return response;
    }
  }
}

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    const accessToken = body.accessToken || body.access_token;
    const patientId = body.patientId || body.patient;
    const baseUrl = process.env.EPIC_FHIR_BASE_URL;

    const grantedScope = body.scope || 'NOT_PROVIDED';

    // Decode JWT payload to see actual granted scopes (no verification needed for logging)
    let jwtClaims = {};
    try {
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        jwtClaims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      }
    } catch(e) { /* not a JWT or malformed */ }

    console.error('=== EPIC MEDICATIONS ===',
      'token_len=' + accessToken?.length,
      'patient=' + patientId,
      'scope_from_client="' + grantedScope + '"',
      'jwt_scope="' + (jwtClaims.scope || jwtClaims.scp || 'NONE') + '"',
      'jwt_aud=' + JSON.stringify(jwtClaims.aud),
      'jwt_sub=' + jwtClaims.sub,
      'baseUrl=' + baseUrl);

    // Validate required fields before making the FHIR call
    if (!accessToken || typeof accessToken !== 'string') {
      console.error('Missing or invalid accessToken:', typeof accessToken);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing access token. The token exchange may not have returned an access_token field.',
          bodyKeys: Object.keys(body)
        })
      };
    }

    if (!patientId || typeof patientId !== 'string') {
      console.error('Missing or invalid patientId:', typeof patientId);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing patient ID. The token exchange may not have returned a patient field. Check that launch/patient scope is granted.',
          bodyKeys: Object.keys(body)
        })
      };
    }

    // Step 1: Validate the token by fetching the Patient resource first.
    // This serves two purposes:
    //  - Confirms the token is valid and has patient-level access
    //  - Warms up Epic's token cache on the resource server (handles propagation delay)
    const patientUrl = `${baseUrl}/Patient/${patientId}`;
    console.log('Validating token with Patient endpoint:', patientUrl);

    const patientResponse = await fetch(patientUrl, {
      method: 'GET',
      headers: FHIR_HEADERS(accessToken)
    });

    if (!patientResponse.ok) {
      const patientRaw = await patientResponse.text();
      const patientWwwAuth = patientResponse.headers.get('WWW-Authenticate') || 'none';
      console.error('Patient validation failed: status=' + patientResponse.status,
        'WWW-Authenticate=' + patientWwwAuth,
        'body=' + patientRaw.substring(0, 300));

      // If Patient endpoint also fails with 403, the token itself is the problem
      if (patientResponse.status === 403 || patientResponse.status === 401) {
        return {
          statusCode: patientResponse.status,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Your health system authorization does not have sufficient permissions. Please reconnect and ensure you approve all requested permissions.',
            status: patientResponse.status,
            wwwAuthenticate: patientWwwAuth,
            scope: grantedScope
          })
        };
      }
    } else {
      console.log('Patient validation succeeded');
    }

    // Step 2: Fetch MedicationRequests with retry logic
    const fhirUrl = `${baseUrl}/MedicationRequest?patient=${patientId}`;
    console.log('Calling FHIR URL:', fhirUrl);
    console.log('Token prefix:', accessToken.substring(0, 20) + '...');

    const medRequestResponse = await fhirFetchWithRetry(fhirUrl, accessToken, {
      retries: 2,
      delayMs: 1500
    });

    const rawText = await medRequestResponse.text();

    // Log everything at ERROR level so it always shows in filtered logs
    const wwwAuth = medRequestResponse.headers.get('WWW-Authenticate') || 'none';
    console.error('FHIR RESPONSE: status=' + medRequestResponse.status,
      'redirected=' + medRequestResponse.redirected,
      'url=' + medRequestResponse.url,
      'WWW-Authenticate=' + wwwAuth,
      'body=' + rawText.substring(0, 300));

    let medRequestData;
    try {
      medRequestData = JSON.parse(rawText);
    } catch(e) {
      medRequestData = { error: 'Not JSON', raw: rawText.substring(0, 200) };
    }

    if (!medRequestResponse.ok) {
      console.error('FHIR error: status=' + medRequestResponse.status, JSON.stringify(medRequestData));

      // Provide specific error messages based on status
      let userError = 'FHIR API error';
      if (medRequestResponse.status === 403) {
        userError = 'Your health system did not grant permission to read medication data. This may happen if the required scopes were not approved during sign-in, or if your health system does not support medication access for third-party apps.';
      } else if (medRequestResponse.status === 401) {
        userError = 'Your authorization has expired. Please reconnect to your health system.';
      }

      return {
        statusCode: medRequestResponse.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: userError,
          status: medRequestResponse.status,
          wwwAuthenticate: wwwAuth,
          details: medRequestData
        })
      };
    }

    const medications = [];
    if (medRequestData.entry) {
      for (const entry of medRequestData.entry) {
        const resource = entry.resource;
        medications.push({
          name: resource.medicationCodeableConcept?.text
            || resource.medicationCodeableConcept?.coding?.[0]?.display
            || resource.medicationReference?.display
            || 'Unknown Medication',
          status: resource.status,
          dosage: resource.dosageInstruction?.[0]?.text || '',
          prescriber: resource.requester?.display || '',
          dateWritten: resource.authoredOn || '',
          rxNormCode: resource.medicationCodeableConcept?.coding?.find(
            c => c.system === 'http://www.nlm.nih.gov/research/umls/rxnorm'
          )?.code || ''
        });
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ medications })
    };
  } catch (error) {
    console.error('Medication fetch error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to fetch medications',
        details: error.message
      })
    };
  }
}
