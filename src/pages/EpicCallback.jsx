import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import MEDICATIONS_DATA from '../data/medications.json';
import { fetchAllMedications } from '../lib/medicationsApi.js';

/**
 * Strip dosage strength (mg/mcg/mL/etc.), dosage form, and route descriptors
 * from a medication name so only the drug name remains. Epic returns names like
 * "Tacrolimus 1 MG Oral Capsule"; copay-card and patient-assistance lookups are
 * keyed on the medication NAME, not the strength, so we normalize the name
 * before matching and before showing it to the patient.
 */
function cleanMedicationName(name) {
    if (!name) return '';
    let n = String(name);
    // Strengths with units, including ratios like "100 mg/5 mL"
    n = n.replace(/\b\d+(\.\d+)?\s*(mg|mcg|g|gm|ml|l|units?|meq|iu|%)\b(\s*\/\s*\d+(\.\d+)?\s*(mg|mcg|g|ml)?)?/gi, ' ');
    // Leftover unit-only ratios like "/mL" (when the numerator strength was removed)
    n = n.replace(/\/\s*(mg|mcg|g|gm|ml|l|units?|meq|iu|%)\b/gi, ' ');
    // Multi-word dosage forms
    n = n.replace(/\b(extended|delayed|sustained|immediate|modified|controlled)[ -]release\b/gi, ' ');
    // Dosage forms / routes of administration
    n = n.replace(/\b(oral|tablets?|capsules?|caps?|solution|suspension|injectable|injection|intravenous|subcutaneous|intramuscular|topical|transdermal|cream|ointment|gel|lotion|patches?|inhalation|inhaler|nebulizer|spray|drops?|ophthalmic|otic|nasal|syrup|elixir|powder|granules?|kit|pack|disintegrating|chewable)\b/gi, ' ');
    // Standalone dosage-form abbreviations
    n = n.replace(/\b(er|xr|xl|sr|dr|cr|la|ec|iv|im)\b/gi, ' ');
    // Leftover standalone numbers
    n = n.replace(/\b\d+(\.\d+)?\b/g, ' ');
    // Tidy punctuation and whitespace
    n = n.replace(/[(),;]/g, ' ').replace(/\s{2,}/g, ' ').trim();
    n = n.replace(/\s*[-/]\s*$/, '').trim();
    return n;
}

/**
 * Cleaned, lowercased brand-name segments for a medication record. A record's
 * brandName can list several products (e.g. "Prograf / Envarsus XR / Astagraf
 * XL"); each segment is cleaned so "Envarsus XR" still matches "Envarsus".
 */
function brandSegments(med) {
    return (med.brandName || '')
        .split('/')
        .map(s => cleanMedicationName(s).toLowerCase().trim())
        .filter(Boolean);
}

/**
 * True when EVERY significant word of `phrase` appears in `name`. Word-based
 * (not substring) so word order doesn't matter — e.g. our generic
 * "Trimethoprim-Sulfamethoxazole" still matches Epic's "Sulfamethoxazole-
 * Trimethoprim" — and so similar drugs are distinguished: "tenofovir
 * disoproxil" (Viread) matches Viread but not "tenofovir alafenamide" (Vemlidy).
 */
function wordsAllPresent(phrase, name) {
    // Whole-word (token) match, NOT substring — so "ganciclovir" does not match
    // inside "valganciclovir", and "vitamin" does not match inside "multivitamin".
    const nameWords = new Set((name || '').split(/[^a-z0-9]+/).filter(Boolean));
    const words = (phrase || '').split(/[^a-z0-9]+/).filter(w => w.length > 2);
    return words.length > 0 && words.every(w => nameWords.has(w));
}

/** How specifically a record matches a name — more matched words = more specific. */
function matchSpecificity(name, med) {
    const wordCount = phrase => (phrase || '').split(/[^a-z0-9]+/).filter(w => w.length > 2).length;
    let score = 0;
    const generic = (med.genericName || '').toLowerCase().trim();
    if (wordsAllPresent(generic, name)) score = Math.max(score, wordCount(generic));
    for (const seg of brandSegments(med)) {
        if (wordsAllPresent(seg, name)) score = Math.max(score, wordCount(seg));
    }
    return score;
}

/** Does a (cleaned, lowercased) FHIR name correspond to this medication record? */
function nameMatchesMed(name, med) {
    if (wordsAllPresent((med.genericName || '').toLowerCase().trim(), name)) return true;
    return brandSegments(med).some(seg => wordsAllPresent(seg, name));
}

/**
 * Is the patient taking the GENERIC (vs a brand) of this medication? Determined
 * from the name Epic sent: it's the generic when the name matches the generic
 * name and does not specifically name a brand product. Generics have no
 * manufacturer copay card, so the UI steers to cash options instead.
 */
function isGenericName(name, med) {
    const generic = (med.genericName || '').toLowerCase().trim();
    if (!generic) return false;
    const matchesGeneric = wordsAllPresent(generic, name);
    const matchesBrand = brandSegments(med).some(seg => wordsAllPresent(seg, name));
    return matchesGeneric && !matchesBrand;
}

/** Is this record the generic itself (vs a brand-name product)? */
function isGenericRecord(med) {
    const brand = (med.brandName || '').toLowerCase();
    const generic = (med.genericName || '').toLowerCase().trim();
    return (med.manufacturer || '').toLowerCase() === 'generic'
        || brand.includes('generic')
        || brand.trim() === generic;
}

/**
 * Pick the single best record for a patient's medication name. We want the ONE
 * product the patient actually takes — never a pile of related brands — so:
 *   1. an exact brand-name hit (the patient named a specific brand), else
 *   2. the generic record when the patient's name is the generic, else
 *   3. the first reasonable name match.
 */
function pickBestMatch(name, candidates) {
    if (candidates.length <= 1) return candidates[0] || null;
    // Prefer the most SPECIFIC match (most words matched, e.g. "Fluticasone
    // Nasal" over plain "Fluticasone"); break ties toward the generic record so
    // a generic name maps to the generic, not a brand.
    let best = null;
    let bestScore = -1;
    for (const m of candidates) {
        const tieBreak = isGenericRecord(m) && isGenericName(name, m) ? 0.25 : 0;
        const score = matchSpecificity(name, m) + tieBreak;
        if (score > bestScore) {
            bestScore = score;
            best = m;
        }
    }
    return best;
}

/**
 * Curated fallbacks for generic-name variants Epic sends that don't token-match
 * our record names — e.g. Epic's "mycophenolate sodium" is our Myfortic, and a
 * bare "tenofovir" is our Viread. Most specific entries first. These are GENERIC
 * chemical names, so a synonym hit is treated as the generic.
 */
const SYNONYM_MAP = [
    { tokens: ['mycophenolate', 'sodium'], id: 'myfortic' },
    { tokens: ['mycophenolic'], id: 'myfortic' },
    { tokens: ['mycophenolate', 'mofetil'], id: 'mycophenolate' },
    { tokens: ['mycophenolate'], id: 'mycophenolate' },
    { tokens: ['tenofovir', 'alafenamide'], id: 'vemlidy' },
    { tokens: ['tenofovir', 'disoproxil'], id: 'viread' },
    { tokens: ['tenofovir'], id: 'viread' },
];

/** Match a name against the curated synonym map; returns the record id or null. */
function matchSynonym(name, medsList) {
    const nameWords = new Set((name || '').split(/[^a-z0-9]+/).filter(Boolean));
    for (const syn of SYNONYM_MAP) {
        if (syn.tokens.every(t => nameWords.has(t)) && medsList.some(m => m.id === syn.id)) {
            return syn.id;
        }
    }
    return null;
}

/**
 * Match raw FHIR medications (name + RxNorm code) from Epic against our
 * transplant medication database, returning internal medication IDs that the
 * My Path Quiz and the Grants & Foundations medications tab can consume.
 *
 * Strategy: exact RxNorm (rxcui) match first (most reliable), then fall back to
 * brand/generic name matching. Epic returns names like "Tacrolimus 1 MG Oral
 * Capsule" or "Prograf 1 MG Oral Capsule", so we check whether the FHIR name
 * contains our generic name or any brand-name segment. We also record which
 * matches are the GENERIC so copay cards (brand-only) can be hidden for them.
 */
function matchEpicMedications(fhirMeds, medsList = MEDICATIONS_DATA) {
    const matched = new Set();
    const genericIds = new Set();
    const unmatched = [];
    for (const med of fhirMeds) {
        const cleanName = cleanMedicationName(med.name);
        const name = cleanName.toLowerCase().trim();
        const rx = String(med.rxNormCode || '').trim();
        let found = null;

        // 1) RxNorm code match
        if (rx) {
            found = medsList.find(m => m.rxcui && String(m.rxcui) === rx);
        }

        // 2) Brand / generic name match — pick the single best product so we
        //    import only the drug the patient actually takes, not every related brand.
        if (!found && name) {
            found = pickBestMatch(name, medsList.filter(m => nameMatchesMed(name, m)));
        }

        // 3) Curated synonym fallback for generic-name variants Epic uses that
        //    don't token-match our names (e.g. "mycophenolate sodium" -> Myfortic,
        //    "tenofovir" -> Viread).
        let viaSynonym = false;
        if (!found && name) {
            const synId = matchSynonym(name, medsList);
            if (synId) {
                found = medsList.find(m => m.id === synId) || null;
                viaSynonym = !!found;
            }
        }

        if (found) {
            matched.add(found.id);
            // Synonym hits are generic chemical names; otherwise detect generic
            // from the name. Either way, show the generic (not a brand).
            if (viaSynonym || (name && isGenericName(name, found))) {
                genericIds.add(found.id);
            }
        } else if (cleanName || med.name) {
            // Store the cleaned (name-only) value so skipped meds show without
            // the strength/form clutter.
            unmatched.push(cleanName || med.name);
        }
    }
    return {
        matched: Array.from(matched),
        unmatched,
        genericIds: Array.from(genericIds)
    };
}

/**
 * EpicCallback - Handles the OAuth2 PKCE callback from Epic.
 * Route: /auth/epic/callback
 *
 * Flow:
 * 1. Epic redirects here with ?code=...&state=...
 * 2. Verify the state matches what we stored (CSRF protection)
 * 3. Retrieve PKCE code_verifier from sessionStorage (stored before redirect)
 * 4. Exchange the code + code_verifier for an access token via /api/epic-token-exchange
 * 5. Fetch medications via /api/epic-medications
 * 6. Store matched medication IDs + assistance programs in sessionStorage
 * 7. Redirect back to the page the user came from
 */

const EpicCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing'); // processing | success | error
    const [message, setMessage] = useState('Connecting to your health system...');
    const [matchedCount, setMatchedCount] = useState(0);
    const [programCount, setProgramCount] = useState(0);

    useEffect(() => {
        const processCallback = async () => {
            try {
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                const errorParam = searchParams.get('error');

                // Handle Epic-side errors (user denied consent, invalid client, etc.)
                if (errorParam) {
                    let errorDesc = searchParams.get('error_description') || 'Authorization was not completed.';

                    // Add specific guidance based on the error type
                    const guides = {
                        'invalid_client': ' The app client ID is not recognized by this health system.',
                        'unauthorized_client': ' This app is not authorized for the standalone launch flow.',
                        'invalid_scope': ' One or more requested permissions are not registered for this app.',
                        'access_denied': ' Access was denied. You may have declined consent, or the app is not approved for your health system.',
                        'invalid_request': ' The authorization request was invalid. The redirect URI or audience may not match the app registration.'
                    };

                    if (guides[errorParam]) {
                        errorDesc += guides[errorParam];
                    }

                    setStatus('error');
                    setMessage(errorDesc);
                    return;
                }

                if (!code) {
                    setStatus('error');
                    setMessage('No authorization code received from your health system.');
                    return;
                }

                // Verify CSRF state
                const savedState = sessionStorage.getItem('epic_oauth_state');
                if (savedState && state !== savedState) {
                    setStatus('error');
                    setMessage('Security verification failed. Please try connecting again.');
                    return;
                }
                sessionStorage.removeItem('epic_oauth_state');

                // Retrieve PKCE code_verifier
                const codeVerifier = sessionStorage.getItem('epic_pkce_code_verifier');
                sessionStorage.removeItem('epic_pkce_code_verifier');

                // Retrieve discovered token endpoint (if any)
                const tokenEndpoint = sessionStorage.getItem('epic_token_endpoint');
                sessionStorage.removeItem('epic_token_endpoint');

                // Retrieve the FHIR base URL for the health system the user authorized with.
                // This must be passed to token exchange and medications so they use the
                // correct endpoints (not just the env var default).
                const fhirBaseUrl = sessionStorage.getItem('epic_fhir_base_url');
                sessionStorage.removeItem('epic_fhir_base_url');

                if (!codeVerifier) {
                    setStatus('error');
                    setMessage('PKCE verification data not found. Please try connecting again.');
                    return;
                }

                // Step 1: Exchange code + code_verifier for token
                setMessage('Exchanging authorization...');
                const tokenResponse = await fetch('/api/epic-token-exchange', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        code_verifier: codeVerifier,
                        token_endpoint: tokenEndpoint || undefined,
                        fhir_base_url: fhirBaseUrl || undefined
                    })
                });

                const tokenData = await tokenResponse.json();

                if (!tokenResponse.ok || !tokenData.access_token) {
                    setStatus('error');
                    setMessage(tokenData.error || 'Failed to authorize with your health system.');
                    return;
                }

                // Step 2: Fetch medications
                setMessage('Importing your medications...');
                const medsResponse = await fetch('/api/epic-medications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_token: tokenData.access_token,
                        patient: tokenData.patient,
                        scope: tokenData.scope || '',
                        fhir_base_url: fhirBaseUrl || undefined
                    })
                });

                const medsData = await medsResponse.json();

                if (!medsResponse.ok) {
                    setStatus('error');
                    if (medsResponse.status === 403) {
                        setMessage('Your health system did not grant permission to read medication data. Please try reconnecting and approve all requested permissions.');
                    } else if (medsResponse.status === 401) {
                        setMessage('Your authorization has expired. Please try connecting again.');
                    } else {
                        setMessage(medsData.error || 'Failed to fetch medications from your health system.');
                    }
                    return;
                }

                // Step 3: Match the raw FHIR medications against our transplant
                // medication database (by RxNorm code, then brand/generic name) to
                // produce internal medication IDs the quiz and grants tab consume.
                // The backend returns { medications: [...] }; matching happens here
                // so it uses the same medication ID set the UI renders.
                const fhirMeds = medsData.medications || [];
                // Match against the LIVE medication database (the same list the app
                // renders) so meds added in Neon are recognized without a code change;
                // fall back to the bundled JSON only if the API is unavailable.
                let medsList = MEDICATIONS_DATA;
                try {
                    const dbMeds = await fetchAllMedications();
                    if (Array.isArray(dbMeds) && dbMeds.length > 0) medsList = dbMeds;
                } catch (e) {
                    // use bundled fallback
                }
                const { matched, unmatched, genericIds } = matchEpicMedications(fhirMeds, medsList);
                const matchedMeds = medsList.filter(m => matched.includes(m.id));
                const assistancePrograms = matchedMeds
                    .filter(m => m.papProgramId || m.copayProgramId)
                    .map(m => ({
                        medId: m.id,
                        papProgramId: m.papProgramId || null,
                        copayProgramId: m.copayProgramId || null
                    }));

                // Persist which imported meds the patient takes as the GENERIC so
                // medication cards can hide the brand-only copay card and point to
                // cash options (Cost Plus Drugs, GoodRx) instead.
                try {
                    localStorage.setItem('tmn_epic_generic_meds', JSON.stringify(genericIds));
                } catch (e) {
                    // ignore storage errors (e.g. private mode)
                }

                sessionStorage.setItem('epic_imported_meds', JSON.stringify({
                    matched,
                    unmatched,
                    genericIds,
                    totalFhirMeds: fhirMeds.length,
                    assistancePrograms,
                    timestamp: Date.now()
                }));

                setMatchedCount(matched.length);
                setProgramCount(assistancePrograms.length);
                setStatus('success');
                if (matched.length > 0) {
                    setMessage(`Found ${matched.length} transplant medication${matched.length !== 1 ? 's' : ''} in your health system.`);
                } else if (fhirMeds.length > 0) {
                    setMessage(`We found ${fhirMeds.length} medication${fhirMeds.length !== 1 ? 's' : ''} in your health system, but none matched our transplant medication database. You can add your medications manually.`);
                } else {
                    setMessage('No medications were found in your health system record.');
                }

                // Auto-redirect back after a brief delay
                const returnPath = sessionStorage.getItem('epic_return_path') || '/wizard';
                sessionStorage.removeItem('epic_return_path');

                setTimeout(() => {
                    navigate(returnPath, { replace: true });
                }, 2000);

            } catch (err) {
                console.error('Epic callback error:', err);
                setStatus('error');
                setMessage('An unexpected error occurred. Please try again.');
            }
        };

        processCallback();
    }, [searchParams, navigate]);

    const returnPath = sessionStorage.getItem('epic_return_path') || '/wizard';

    return (
        <div className="max-w-lg mx-auto py-16 px-4">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
                    status === 'processing' ? 'bg-blue-100' :
                    status === 'success' ? 'bg-emerald-100' :
                    'bg-red-100'
                }`}>
                    {status === 'processing' && (
                        <Loader2 size={32} className="text-blue-600 animate-spin" aria-hidden="true" />
                    )}
                    {status === 'success' && (
                        <CheckCircle size={32} className="text-emerald-600" aria-hidden="true" />
                    )}
                    {status === 'error' && (
                        <AlertCircle size={32} className="text-red-600" aria-hidden="true" />
                    )}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    {status === 'processing' && 'Connecting to Your Health System'}
                    {status === 'success' && 'Medications Imported'}
                    {status === 'error' && 'Connection Issue'}
                </h1>

                {/* Message */}
                <p className={`mb-6 ${
                    status === 'processing' ? 'text-blue-700' :
                    status === 'success' ? 'text-emerald-700' :
                    'text-red-700'
                }`}>
                    {message}
                </p>

                {/* Success details */}
                {status === 'success' && (
                    <>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-center gap-2 text-emerald-800">
                                <ShieldCheck size={18} aria-hidden="true" />
                                <span className="font-medium">Redirecting you back automatically...</span>
                            </div>
                        </div>
                        {programCount > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-blue-800 font-medium text-sm">
                                    {programCount} assistance program{programCount !== 1 ? 's' : ''} found for your medications.
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Error retry */}
                {status === 'error' && (
                    <div className="space-y-3">
                        <Link
                            to={returnPath}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition"
                        >
                            Go Back and Try Again
                            <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                        <p className="text-sm text-slate-500">
                            If this continues, your transplant center may not support this integration. You can always add medications manually.
                        </p>
                    </div>
                )}

                {/* Privacy note */}
                <p className="text-xs text-slate-400 mt-6">
                    Your health system credentials were handled securely. We only received your medication list.
                </p>
            </div>
        </div>
    );
};

export default EpicCallback;
