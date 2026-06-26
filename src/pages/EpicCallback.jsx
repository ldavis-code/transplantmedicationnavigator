import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import MEDICATIONS_DATA from '../data/medications.json';

/**
 * Match raw FHIR medications (name + RxNorm code) from Epic against our
 * transplant medication database, returning internal medication IDs that the
 * My Path Quiz and the Grants & Foundations medications tab can consume.
 *
 * Strategy: exact RxNorm (rxcui) match first (most reliable), then fall back to
 * brand/generic name matching. Epic returns names like "Tacrolimus 1 MG Oral
 * Capsule" or "Prograf 1 MG Oral Capsule", so we check whether the FHIR name
 * contains our generic name or any brand-name segment.
 */
function matchEpicMedications(fhirMeds) {
    const matched = new Set();
    const unmatched = [];
    for (const med of fhirMeds) {
        const name = (med.name || '').toLowerCase().trim();
        const rx = String(med.rxNormCode || '').trim();
        let found = null;

        // 1) RxNorm code match
        if (rx) {
            found = MEDICATIONS_DATA.find(m => m.rxcui && String(m.rxcui) === rx);
        }

        // 2) Brand / generic name match
        if (!found && name) {
            found = MEDICATIONS_DATA.find(m => {
                const generic = (m.genericName || '').toLowerCase().trim();
                if (generic && name.includes(generic)) return true;
                const brands = (m.brandName || '')
                    .toLowerCase()
                    .split('/')
                    .map(s => s.trim())
                    .filter(Boolean);
                return brands.some(b => name.includes(b));
            });
        }

        if (found) {
            matched.add(found.id);
        } else if (med.name) {
            unmatched.push(med.name);
        }
    }
    return { matched: Array.from(matched), unmatched };
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
                const { matched, unmatched } = matchEpicMedications(fhirMeds);
                const matchedMeds = MEDICATIONS_DATA.filter(m => matched.includes(m.id));
                const assistancePrograms = matchedMeds
                    .filter(m => m.papProgramId || m.copayProgramId)
                    .map(m => ({
                        medId: m.id,
                        papProgramId: m.papProgramId || null,
                        copayProgramId: m.copayProgramId || null
                    }));

                sessionStorage.setItem('epic_imported_meds', JSON.stringify({
                    matched,
                    unmatched,
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
