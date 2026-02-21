import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

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

                // Handle Epic-side errors (user denied consent, etc.)
                if (errorParam) {
                    const errorDesc = searchParams.get('error_description') || 'Authorization was not completed.';
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
                    body: JSON.stringify({ code, code_verifier: codeVerifier })
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
                        scope: tokenData.scope
                    })
                });

                const medsData = await medsResponse.json();

                if (!medsResponse.ok) {
                    setStatus('error');
                    setMessage(medsData.error || 'Failed to fetch medications from your health system.');
                    return;
                }

                // Step 3: Store results in sessionStorage for the calling page to pick up
                sessionStorage.setItem('epic_imported_meds', JSON.stringify({
                    matched: medsData.matched || [],
                    unmatched: medsData.unmatched || [],
                    totalFhirMeds: medsData.totalFhirMeds || 0,
                    assistancePrograms: medsData.assistancePrograms || [],
                    timestamp: Date.now()
                }));

                setMatchedCount(medsData.matched?.length || 0);
                setProgramCount(medsData.assistancePrograms?.length || 0);
                setStatus('success');
                setMessage(`Found ${medsData.matched?.length || 0} transplant medication${(medsData.matched?.length || 0) !== 1 ? 's' : ''} in your health system.`);

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
