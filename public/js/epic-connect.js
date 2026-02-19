/**
 * epic-connect.js - Shared Epic FHIR PKCE + Connect logic
 *
 * Provides PKCE utilities (code_verifier / code_challenge generation) and
 * the "Connect to My Health System" flow:
 *   1. Generate PKCE pair and store code_verifier in sessionStorage
 *   2. Call /api/epic-auth-url?code_challenge=... to get the authorization URL
 *   3. Save OAuth state + return path in sessionStorage
 *   4. Redirect to Epic authorization page
 *
 * After the user authorizes, Epic redirects to /auth/epic/callback which
 * uses the helpers below to exchange the code and fetch medications.
 *
 * Usage (from React or plain HTML):
 *   import { startEpicConnect, exchangeCodeForToken, fetchEpicMedications, ... } from '/js/epic-connect.js';
 */

// ── PKCE Helpers ──────────────────────────────────────────────────────────────

/**
 * Generate a cryptographically random code_verifier (43-128 chars, base64url).
 */
export function generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return base64UrlEncode(array);
}

/**
 * Compute the S256 code_challenge from a code_verifier.
 * Returns a Promise<string> (base64url-encoded SHA-256 hash).
 */
export async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(new Uint8Array(digest));
}

/**
 * Base64url encode a Uint8Array (no padding, URL-safe alphabet).
 */
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

// ── Session Storage Keys ──────────────────────────────────────────────────────

const STORAGE_KEYS = {
    CODE_VERIFIER: 'epic_pkce_code_verifier',
    OAUTH_STATE: 'epic_oauth_state',
    RETURN_PATH: 'epic_return_path',
    IMPORTED_MEDS: 'epic_imported_meds'
};

// ── Connect Flow ──────────────────────────────────────────────────────────────

/**
 * Initiate the Epic FHIR SMART on FHIR standalone launch with PKCE.
 * Generates PKCE values, calls the auth URL endpoint, and redirects.
 *
 * @returns {Promise<void>} Resolves after redirect (page will navigate away)
 * @throws {Error} If the auth URL request fails
 */
export async function startEpicConnect() {
    // 1. Generate PKCE code_verifier + code_challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // 2. Store code_verifier for the token exchange step
    sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);

    // 3. Request the authorization URL from our serverless function
    const response = await fetch('/api/epic-auth-url?code_challenge=' + encodeURIComponent(codeChallenge));
    const data = await response.json();

    if (!response.ok || !data.url) {
        throw new Error(data.error || 'Could not generate Epic authorization URL');
    }

    // 4. Save state for CSRF verification on callback
    sessionStorage.setItem(STORAGE_KEYS.OAUTH_STATE, data.state);

    // 5. Save the current page path so the callback can redirect back
    sessionStorage.setItem(STORAGE_KEYS.RETURN_PATH, window.location.pathname + window.location.search);

    // 6. Redirect to Epic authorization
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

    if (!codeVerifier) {
        throw new Error('PKCE code_verifier not found. Please try connecting again.');
    }

    const response = await fetch('/api/epic-token-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, code_verifier: codeVerifier })
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
export async function fetchEpicMedications(accessToken, patientId) {
    const response = await fetch('/api/epic-medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken, patient: patientId })
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
