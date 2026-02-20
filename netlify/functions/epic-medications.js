// netlify/functions/epic-medications.js
// NO node-fetch import needed - Node 18+ has built-in fetch

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    const accessToken = body.accessToken || body.access_token;
    const patientId = body.patientId || body.patient;
    const baseUrl = process.env.EPIC_FHIR_BASE_URL;

    console.log('=== EPIC MEDICATIONS DEBUG ===');
    console.log('accessToken type:', typeof accessToken, 'length:', accessToken?.length);
    console.log('patientId type:', typeof patientId, 'value:', patientId);
    console.log('baseUrl:', baseUrl);
    console.log('Request body keys:', Object.keys(body));

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

    // Fetch MedicationRequests (no status filter for sandbox)
    const fhirUrl = `${baseUrl}/MedicationRequest?patient=${patientId}`;
    console.log('Calling FHIR URL:', fhirUrl);

    console.log('Token prefix:', accessToken.substring(0, 20) + '...');

    const medRequestResponse = await fetch(fhirUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/fhir+json'
      }
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
      return {
        statusCode: medRequestResponse.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'FHIR API error',
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
