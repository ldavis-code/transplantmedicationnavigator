// netlify/functions/epic-medications.js
// NO node-fetch import needed - Node 18+ has built-in fetch

export async function handler(event) {
  try {
    const { accessToken, patientId } = JSON.parse(event.body);
    const baseUrl = process.env.EPIC_FHIR_BASE_URL;

    console.log('Access token length:', accessToken?.length);
    console.log('Patient ID:', patientId);
    console.log('Request URL:', `${baseUrl}/MedicationRequest?patient=${patientId}`);

    // Fetch MedicationRequests (no status filter for sandbox)
    const medRequestResponse = await fetch(
      `${baseUrl}/MedicationRequest?patient=${patientId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/fhir+json'
        }
      }
    );

    console.log('FHIR response status:', medRequestResponse.status);
    console.log('FHIR response headers:', JSON.stringify(Object.fromEntries(medRequestResponse.headers.entries())));

    const rawResponse = await medRequestResponse.text();
    console.log('FHIR raw response body:', rawResponse);

    let medRequestData;
    try {
      medRequestData = JSON.parse(rawResponse);
    } catch (e) {
      console.error('Response is not JSON:', rawResponse.substring(0, 200));
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Invalid FHIR response',
          raw: rawResponse.substring(0, 200)
        })
      };
    }

    console.log('FHIR response entries:',
      medRequestData.entry ? medRequestData.entry.length : 0);

    if (!medRequestResponse.ok) {
      console.error('FHIR error:', JSON.stringify(medRequestData));
      return {
        statusCode: medRequestResponse.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'FHIR API error',
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
