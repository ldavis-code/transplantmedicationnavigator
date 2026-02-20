// Epic FHIR Medications Fetcher
// Uses a patient access token to retrieve MedicationRequest resources,
// maps them to the app's medication IDs via RxCUI and drug name matching,
// and returns matching assistance programs (PAPs, copay cards, foundations).

import MEDICATIONS_DATA from '../../src/data/medications.json';
import PROGRAMS_DATA from '../../src/data/programs.json';

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
        if (med.rxcui) {
            byRxcui[med.rxcui] = med.id;
        }

        if (med.genericName) {
            nameTerms.push({ term: med.genericName.toLowerCase(), id: med.id });
        }

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

// Find assistance programs for a set of matched medication IDs
function findAssistancePrograms(matchedIds) {
    const programs = [];
    const medIdSet = new Set(matchedIds);

    // Build a medication ID lookup from the data
    const medsById = {};
    for (const med of MEDICATIONS_DATA) {
        medsById[med.id] = med;
    }

    // Check copay programs
    if (PROGRAMS_DATA.copayPrograms) {
        for (const [programId, program] of Object.entries(PROGRAMS_DATA.copayPrograms)) {
            const overlapping = (program.medications || []).filter(medId => medIdSet.has(medId));
            if (overlapping.length > 0) {
                programs.push({
                    type: 'copay',
                    programId,
                    name: program.name,
                    manufacturer: program.manufacturer,
                    url: program.url,
                    phone: program.phone,
                    maxBenefit: program.maxBenefit,
                    eligibility: program.eligibility,
                    matchedMedications: overlapping
                });
            }
        }
    }

    // Check PAP programs
    if (PROGRAMS_DATA.papPrograms) {
        for (const [programId, program] of Object.entries(PROGRAMS_DATA.papPrograms)) {
            const overlapping = (program.medications || []).filter(medId => medIdSet.has(medId));
            if (overlapping.length > 0) {
                programs.push({
                    type: 'pap',
                    programId,
                    name: program.name,
                    manufacturer: program.manufacturer,
                    url: program.url,
                    phone: program.phone,
                    maxBenefit: program.maxBenefit,
                    eligibility: program.eligibility,
                    matchedMedications: overlapping
                });
            }
        }
    }

    // Check foundation programs
    if (PROGRAMS_DATA.foundationPrograms) {
        for (const [programId, program] of Object.entries(PROGRAMS_DATA.foundationPrograms)) {
            const overlapping = (program.medications || []).filter(medId => medIdSet.has(medId));
            if (overlapping.length > 0) {
                programs.push({
                    type: 'foundation',
                    programId,
                    name: program.name,
                    url: program.url,
                    phone: program.phone,
                    maxBenefit: program.maxBenefit,
                    eligibility: program.eligibility,
                    matchedMedications: overlapping
                });
            }
        }
    }

    return programs;
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
        const fhirUrl = `${fhirBaseUrl}/MedicationRequest?patient=${encodeURIComponent(patient)}&status=active&_count=100`;

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
                const name = resource.medicationCodeableConcept?.text ||
                    resource.medicationCodeableConcept?.coding?.[0]?.display ||
                    'Unknown medication';
                unmatchedNames.push(name);
            }
        }

        const matchedArray = Array.from(matchedIds);

        // Find assistance programs that cover the matched medications
        const assistancePrograms = findAssistancePrograms(matchedArray);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                matched: matchedArray,
                unmatched: [...new Set(unmatchedNames)],
                totalFhirMeds: entries.length,
                assistancePrograms
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
