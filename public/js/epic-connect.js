/**
 * epic-connect.js - Shared Epic FHIR PKCE + Connect logic
 *
 * The "Connect to My Health System" flow:
 *   1. Call /api/epic-auth-url — the server generates PKCE code_verifier +
 *      code_challenge, builds the authorization URL, and returns:
 *      { url, state, code_verifier }
 *   2. Store code_verifier + state + return path in sessionStorage
 *   3. Redirect to Epic authorization page
 *
 * After the user authorizes, Epic redirects to /auth/epic/callback which
 * uses the helpers below to exchange the code and fetch medications.
 *
 * Usage (from React or plain HTML):
 *   import { startEpicConnect, exchangeCodeForToken, fetchEpicMedications, ... } from '/js/epic-connect.js';
 */

// ── Session Storage Keys ──────────────────────────────────────────────────────

const STORAGE_KEYS = {
    CODE_VERIFIER: 'epic_pkce_code_verifier',
    OAUTH_STATE: 'epic_oauth_state',
    RETURN_PATH: 'epic_return_path',
    IMPORTED_MEDS: 'epic_imported_meds',
    TOKEN_ENDPOINT: 'epic_token_endpoint',
    FHIR_BASE_URL: 'epic_fhir_base_url'
};

// ── Connect Flow ──────────────────────────────────────────────────────────────

/**
 * Initiate the Epic FHIR SMART on FHIR standalone launch with PKCE.
 * Calls the server to generate PKCE values and the auth URL, then redirects.
 *
 * @param {string} [fhirBaseUrl] - Optional FHIR base URL for the selected health system.
 *   If not provided, the server uses the EPIC_FHIR_BASE_URL env var.
 * @returns {Promise<void>} Resolves after redirect (page will navigate away)
 * @throws {Error} If the auth URL request fails
 */
export async function startEpicConnect(fhirBaseUrl) {
    // 1. Request the authorization URL — server generates PKCE pair
    let url = '/api/epic-auth-url';
    if (fhirBaseUrl) {
        url += '?fhir_base_url=' + encodeURIComponent(fhirBaseUrl);
    }
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.url) {
        throw new Error(data.error || 'Could not generate Epic authorization URL');
    }

    // 2. Store code_verifier for the token exchange step
    sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, data.code_verifier);

    // 3. Save state for CSRF verification on callback
    sessionStorage.setItem(STORAGE_KEYS.OAUTH_STATE, data.state);

    // 4. Save discovered token endpoint (if any) for the token exchange step
    if (data.token_endpoint) {
        sessionStorage.setItem(STORAGE_KEYS.TOKEN_ENDPOINT, data.token_endpoint);
    }

    // 5. Save the FHIR base URL so the callback can pass it to token exchange
    if (fhirBaseUrl) {
        sessionStorage.setItem(STORAGE_KEYS.FHIR_BASE_URL, fhirBaseUrl);
    }

    // 6. Save the current page path so the callback can redirect back
    sessionStorage.setItem(STORAGE_KEYS.RETURN_PATH, window.location.pathname + window.location.search);

    // 7. Redirect to Epic authorization
    window.location.href = data.url;
}

// ── Callback Helpers ──────────────────────────────────────────────────────────

/**
 * Verify the OAuth state parameter matches what was stored (CSRF protection).
 * @param {string} stateFromUrl - The state parameter from the callback URL
 * @returns {boolean}
 */
export function verifyState(stateFromUrl) {
    const savedState = sessionStorage.getItem(STORAGE_KEYS.OAUTH_STATE);
    if (!savedState) return true; // No state stored, allow (backward compat)
    const valid = stateFromUrl === savedState;
    sessionStorage.removeItem(STORAGE_KEYS.OAUTH_STATE);
    return valid;
}

/**
 * Exchange the authorization code for an access token using PKCE.
 * Sends the code + code_verifier to our serverless token exchange function.
 *
 * @param {string} code - The authorization code from Epic
 * @returns {Promise<{access_token: string, patient: string, expires_in: number, scope: string}>}
 */
export async function exchangeCodeForToken(code) {
    const codeVerifier = sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);
    sessionStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);

    const tokenEndpoint = sessionStorage.getItem(STORAGE_KEYS.TOKEN_ENDPOINT);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN_ENDPOINT);

    const fhirBaseUrl = sessionStorage.getItem(STORAGE_KEYS.FHIR_BASE_URL);
    sessionStorage.removeItem(STORAGE_KEYS.FHIR_BASE_URL);

    if (!codeVerifier) {
        throw new Error('PKCE code_verifier not found. Please try connecting again.');
    }

    const response = await fetch('/api/epic-token-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
            token_endpoint: tokenEndpoint || undefined,
            fhir_base_url: fhirBaseUrl || undefined
        })
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
        throw new Error(data.error || 'Failed to authorize with Epic');
    }

    return data;
}

/**
 * Fetch the patient's medications from Epic FHIR and match to our database.
 *
 * @param {string} accessToken - The access token from the token exchange
 * @param {string} patientId - The patient ID from the token exchange
 * @returns {Promise<{matched: string[], unmatched: string[], totalFhirMeds: number, assistancePrograms: Array}>}
 */
export async function fetchEpicMedications(accessToken, patientId, grantedScope) {
    const response = await fetch('/api/epic-medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken, patient: patientId, scope: grantedScope })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch medications from Epic');
    }

    return data;
}

/**
 * Store imported medication results in sessionStorage for the calling page.
 * @param {object} medsData - The response from fetchEpicMedications
 */
export function storeImportedMeds(medsData) {
    sessionStorage.setItem(STORAGE_KEYS.IMPORTED_MEDS, JSON.stringify({
        matched: medsData.matched || [],
        unmatched: medsData.unmatched || [],
        totalFhirMeds: medsData.totalFhirMeds || 0,
        assistancePrograms: medsData.assistancePrograms || [],
        timestamp: Date.now()
    }));
}

/**
 * Read and clear imported medication results from sessionStorage.
 * Returns null if nothing is stored.
 * @returns {object|null}
 */
export function consumeImportedMeds() {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEYS.IMPORTED_MEDS);
        if (!stored) return null;
        const data = JSON.parse(stored);
        sessionStorage.removeItem(STORAGE_KEYS.IMPORTED_MEDS);
        return data;
    } catch {
        return null;
    }
}

/**
 * Get the return path (the page the user was on before connecting).
 * @returns {string}
 */
export function getReturnPath() {
    const path = sessionStorage.getItem(STORAGE_KEYS.RETURN_PATH) || '/wizard';
    sessionStorage.removeItem(STORAGE_KEYS.RETURN_PATH);
    return path;
}
