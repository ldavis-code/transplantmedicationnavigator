import MEDICATIONS_DATA from '../../src/data/medications.json';
import { matchEpicMedications } from '../../src/lib/epicMedicationMatching.js';
// netlify/functions/epic-medications.js
// NO node-fetch import needed - Node 18+ has built-in fetch

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

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
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS };
  }

  try {
    const body = JSON.parse(event.body);
    const accessToken = body.accessToken || body.access_token;
    const patientId = body.patientId || body.patient;
    // Support dynamic FHIR base URL from request body (for multi-health-system support).
    // Falls back to env var for backward compatibility.
    const baseUrl = body.fhir_base_url || process.env.EPIC_FHIR_BASE_URL;

    const grantedScope = body.scope || 'NOT_PROVIDED';

    // Decode JWT payload to see actual granted scopes (no verification needed for logging)
    let jwtClaims = {};
    try {
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        jwtClaims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      }
    } catch(e) { /* not a JWT or malformed */ }

    // Debug context without identifiers: no patient id, no JWT subject.
    console.error('=== EPIC MEDICATIONS ===',
      'token_len=' + accessToken?.length,
      'patient_present=' + Boolean(patientId),
      'scope_from_client="' + grantedScope + '"',
      'jwt_scope="' + (jwtClaims.scope || jwtClaims.scp || 'NONE') + '"',
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
    // Log the base endpoint only — the full URL contains the patient FHIR id
    console.log('Validating token with Patient endpoint:', `${baseUrl}/Patient/...`);

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

    // Step 2: Fetch the patient's ACTIVE medications.
    // Without a status filter Epic returns the ENTIRE medication history —
    // including discontinued/old prescriptions (past antibiotic, antiviral,
    // antifungal, pain courses, etc.) — which pulls over many drugs the patient
    // no longer takes. status=active matches the current medication list.
    let fhirUrl = `${baseUrl}/MedicationRequest?patient=${patientId}&status=active`;
    // Log the endpoint without the patient id and never any part of the token
    console.log('Calling FHIR endpoint:', `${baseUrl}/MedicationRequest (status=active)`);

    let medRequestResponse = await fhirFetchWithRetry(fhirUrl, accessToken, {
      retries: 2,
      delayMs: 1500
    });

    let rawText = await medRequestResponse.text();

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

    // Fallback: if the active filter returns no medications (some Epic orgs use
    // different status values), retry without the filter so the import still
    // works rather than showing an empty list.
    if (medRequestResponse.ok && !(medRequestData && Array.isArray(medRequestData.entry) && medRequestData.entry.length)) {
      const allUrl = `${baseUrl}/MedicationRequest?patient=${patientId}`;
      console.log('Active filter returned no meds; retrying without status filter:', allUrl);
      const fallbackRes = await fhirFetchWithRetry(allUrl, accessToken, { retries: 1, delayMs: 1000 });
      const fallbackText = await fallbackRes.text();
      if (fallbackRes.ok) {
        try {
          const fallbackData = JSON.parse(fallbackText);
          if (fallbackData && Array.isArray(fallbackData.entry) && fallbackData.entry.length) {
            medRequestResponse = fallbackRes;
            rawText = fallbackText;
            medRequestData = fallbackData;
          }
        } catch (e) { /* keep the active-filter result */ }
      }
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

    // Match against the transplant medication database server-side so every
    // client (static callback page, React app) receives finished results:
    // matched internal med IDs, unmatched names, generic flags, and the
    // assistance programs tied to the matched medications.
    const { matched, unmatched, genericIds } = matchEpicMedications(medications, MEDICATIONS_DATA);
    const matchedMeds = MEDICATIONS_DATA.filter(m => matched.includes(m.id));
    const assistancePrograms = matchedMeds
      .filter(m => m.papProgramId || m.copayProgramId)
      .map(m => ({
        medId: m.id,
        papProgramId: m.papProgramId || null,
        copayProgramId: m.copayProgramId || null
      }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        medications,
        matched,
        unmatched,
        genericIds,
        totalFhirMeds: medications.length,
        assistancePrograms
      })
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
