// Epic FHIR Medications Fetcher
// Uses a patient access token to retrieve MedicationRequest resources
// and maps them back to the app's medication IDs via RxCUI and drug name matching

import MEDICATIONS_DATA from '../../src/data/medications.json';

// CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

// Build lookup maps for matching FHIR medications to our database
function buildLookups() {
    const byRxcui = {};
    const nameTerms = []; // { term, id }

    for (const med of MEDICATIONS_DATA) {
        // Index by RxCUI
        if (med.rxcui) {
            byRxcui[med.rxcui] = med.id;
        }

        // Index generic name (lowercase)
        if (med.genericName) {
            nameTerms.push({ term: med.genericName.toLowerCase(), id: med.id });
        }

        // Index brand names (may contain slashes for multiple brands)
        if (med.brandName) {
            for (const brand of med.brandName.split('/')) {
                const trimmed = brand.trim();
                if (trimmed) {
                    nameTerms.push({ term: trimmed.toLowerCase(), id: med.id });
                }
            }
        }
    }

    return { byRxcui, nameTerms };
}

// Try to match a FHIR MedicationRequest to one of our medication IDs
function matchMedication(resource, byRxcui, nameTerms) {
    const medicationCodeableConcept = resource.medicationCodeableConcept;
    if (!medicationCodeableConcept) return null;

    // 1) Try matching by RxNorm code (RxCUI)
    const codings = medicationCodeableConcept.coding || [];
    for (const coding of codings) {
        if (coding.system === 'http://www.nlm.nih.gov/research/umls/rxnorm' && coding.code) {
            if (byRxcui[coding.code]) {
                return byRxcui[coding.code];
            }
        }
    }

    // 2) Try matching by display text (drug name)
    const displayText = (medicationCodeableConcept.text || '').toLowerCase();
    const codingDisplay = codings.map(c => (c.display || '').toLowerCase()).join(' ');
    const combinedText = `${displayText} ${codingDisplay}`;

    for (const { term, id } of nameTerms) {
        if (combinedText.includes(term)) {
            return id;
        }
    }

    return null;
}

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
        const { access_token, patient } = JSON.parse(event.body || '{}');

        if (!access_token || !patient) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'access_token and patient are required' })
            };
        }

        const fhirBaseUrl = process.env.EPIC_FHIR_BASE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4';

        // Fetch active MedicationRequest resources for the patient
        const fhirUrl = `${fhirBaseUrl}/MedicationRequest?patient=${patient}&status=active&_count=100`;

        const fhirResponse = await fetch(fhirUrl, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Accept': 'application/fhir+json'
            }
        });

        if (!fhirResponse.ok) {
            const errorText = await fhirResponse.text();
            console.error('Epic FHIR request failed:', fhirResponse.status, errorText);
            return {
                statusCode: fhirResponse.status === 401 ? 401 : 502,
                headers,
                body: JSON.stringify({
                    error: fhirResponse.status === 401
                        ? 'Epic session expired. Please reconnect.'
                        : 'Failed to fetch medications from Epic'
                })
            };
        }

        const bundle = await fhirResponse.json();
        const entries = (bundle.entry || []).map(e => e.resource).filter(Boolean);

        // Build lookup tables
        const { byRxcui, nameTerms } = buildLookups();

        // Match FHIR medications to our database
        const matchedIds = new Set();
        const unmatchedNames = [];

        for (const resource of entries) {
            if (resource.resourceType !== 'MedicationRequest') continue;

            const matchedId = matchMedication(resource, byRxcui, nameTerms);
            if (matchedId) {
                matchedIds.add(matchedId);
            } else {
                // Collect unmatched medication names for display
                const name = resource.medicationCodeableConcept?.text ||
                    resource.medicationCodeableConcept?.coding?.[0]?.display ||
                    'Unknown medication';
                unmatchedNames.push(name);
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                matched: Array.from(matchedIds),
                unmatched: [...new Set(unmatchedNames)],
                totalFhirMeds: entries.length
            })
        };

    } catch (error) {
        console.error('Epic medications error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to process medications' })
        };
    }
}
