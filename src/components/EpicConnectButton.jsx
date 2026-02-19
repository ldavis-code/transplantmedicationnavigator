import { useState } from 'react';
import { Loader2, ShieldCheck, AlertCircle, Zap } from 'lucide-react';

/**
 * EpicConnectButton - Shared button that initiates Epic FHIR OAuth2 PKCE flow.
 * Used in the Wizard Step 4 and the Grants & Foundations MEDS tab.
 *
 * The flow:
 * 1. User clicks "Connect to My Health System"
 * 2. We generate PKCE code_verifier + code_challenge (SHA-256)
 * 3. We call /api/epic-auth-url?code_challenge=... to get the authorization URL
 * 4. State + code_verifier are saved to sessionStorage
 * 5. User is redirected to Epic's authorization page
 * 6. After consent, Epic redirects to /auth/epic/callback with an auth code
 * 7. The callback page exchanges the code (with code_verifier), fetches meds, stores results
 * 8. On return, the calling page reads the matched medication IDs + assistance programs
 *
 * @param {function} onMedicationsImported - Called with (matchedIds[], unmatchedNames[])
 *   after the user returns from the Epic callback and meds are ready.
 * @param {string} className - Optional additional CSS classes for the wrapper div
 */

// ── PKCE Helpers (browser-native crypto) ──────────────────────────────────────

function generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return base64UrlEncode(array);
}

async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(bytes) {
    let binary = '';
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

const EpicConnectButton = ({ onMedicationsImported, className = '' }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check on mount/render if medications were imported via callback
    const checkForImportedMeds = () => {
        try {
            const stored = sessionStorage.getItem('epic_imported_meds');
            if (stored) {
                const data = JSON.parse(stored);
                sessionStorage.removeItem('epic_imported_meds');
                if (data.matched && data.matched.length > 0 && onMedicationsImported) {
                    onMedicationsImported(data.matched, data.unmatched || []);
                }
                return data;
            }
        } catch (e) {
            // ignore parse errors
        }
        return null;
    };

    const importedData = checkForImportedMeds();

    const handleConnect = async () => {
        setLoading(true);
        setError(null);

        try {
            // Generate PKCE code_verifier + code_challenge
            const codeVerifier = generateCodeVerifier();
            const codeChallenge = await generateCodeChallenge(codeVerifier);

            // Store code_verifier for the token exchange step
            sessionStorage.setItem('epic_pkce_code_verifier', codeVerifier);

            // Request the authorization URL with code_challenge
            const response = await fetch('/api/epic-auth-url?code_challenge=' + encodeURIComponent(codeChallenge));
            const data = await response.json();

            if (!response.ok || !data.url) {
                setError(data.error || 'Could not connect to your health system. Please try again.');
                setLoading(false);
                return;
            }

            // Save state for CSRF verification on callback
            sessionStorage.setItem('epic_oauth_state', data.state);

            // Save the current page path so callback can redirect back
            sessionStorage.setItem('epic_return_path', window.location.pathname + window.location.search);

            // Redirect to Epic authorization
            window.location.href = data.url;

        } catch (err) {
            console.error('Epic connect error:', err);
            setError('Could not connect to your health system. Please check your connection and try again.');
            setLoading(false);
        }
    };

    return (
        <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 ${className}`}>
            <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white p-2.5 rounded-lg flex-shrink-0">
                    <Zap size={22} aria-hidden="true" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-blue-900 mb-1">
                        Connect to My Health System
                    </h3>
                    <p className="text-blue-700 text-sm mb-3">
                        Securely connect to your health system to automatically import your current medications. This saves time and helps us find the right assistance programs for you.
                    </p>

                    {error && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2" role="alert">
                            <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {importedData && importedData.matched && importedData.matched.length > 0 && (
                        <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg" role="status">
                            <div className="flex items-start gap-2">
                                <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                <div className="text-sm">
                                    <p className="text-emerald-700">
                                        Imported {importedData.matched.length} medication{importedData.matched.length !== 1 ? 's' : ''} from your health system.
                                        {importedData.unmatched && importedData.unmatched.length > 0 && (
                                            <span className="block mt-1 text-slate-600">
                                                {importedData.unmatched.length} medication{importedData.unmatched.length !== 1 ? 's' : ''} not in our transplant database were skipped.
                                            </span>
                                        )}
                                    </p>
                                    {importedData.assistancePrograms && importedData.assistancePrograms.length > 0 && (
                                        <p className="text-blue-700 mt-2 font-medium">
                                            {importedData.assistancePrograms.length} assistance program{importedData.assistancePrograms.length !== 1 ? 's' : ''} found for your medications.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleConnect}
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                        aria-label="Connect to your health system to import your medications"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={18} aria-hidden="true" />
                                Connect to My Health System
                            </>
                        )}
                    </button>

                    <p className="text-xs text-blue-600 mt-2">
                        Your data is transmitted securely using PKCE. We do not store your login credentials.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EpicConnectButton;
