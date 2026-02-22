// Epic FHIR OAuth2 Authorization URL Generator (PKCE / SMART on FHIR standalone launch)
// Uses SMART on FHIR .well-known discovery to find the correct authorize endpoint,
// generates a PKCE code_verifier + code_challenge pair server-side,
// and returns the authorization URL + code_verifier to the frontend.

import crypto from 'crypto';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
};

/**
 * Generate a random code_verifier (43-128 characters, base64url-encoded).
 * Per RFC 7636 Section 4.1.
 */
function generateCodeVerifier() {
    // 32 random bytes → 43 base64url characters
    return crypto.randomBytes(32).toString('base64url');
}

/**
 * Create a code_challenge by SHA-256 hashing the code_verifier
 * and base64url-encoding the result. Per RFC 7636 Section 4.2.
 */
function generateCodeChallenge(codeVerifier) {
    return crypto
        .createHash('sha256')
        .update(codeVerifier, 'ascii')
        .digest('base64url');
}

/**
 * Normalize a FHIR base URL by removing any trailing slash.
 * Epic is strict about the `aud` parameter matching exactly.
 */
function normalizeUrl(url) {
    return url ? url.replace(/\/+$/, '') : url;
}

/**
 * Discover OAuth2 endpoints from the FHIR server's SMART configuration.
 * Tries .well-known/smart-configuration first (SMART on FHIR STU2),
 * then falls back to the server's /metadata CapabilityStatement.
 *
 * @param {string} fhirBaseUrl - The FHIR R4 base URL
 * @returns {Promise<{authorize: string, token: string} | null>}
 */
async function discoverSmartEndpoints(fhirBaseUrl) {
    const base = normalizeUrl(fhirBaseUrl);

    // Try 1: .well-known/smart-configuration (preferred, SMART App Launch STU2+)
    try {
        const wellKnownUrl = `${base}/.well-known/smart-configuration`;
        console.log('[epic-auth-url] Discovering SMART config from:', wellKnownUrl);
        const res = await fetch(wellKnownUrl, {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(5000)
        });
        if (res.ok) {
            const config = await res.json();
            if (config.authorization_endpoint && config.token_endpoint) {
                console.log('[epic-auth-url] SMART discovery succeeded:',
                    'authorize=' + config.authorization_endpoint,
                    'token=' + config.token_endpoint);
                return {
                    authorize: config.authorization_endpoint,
                    token: config.token_endpoint
                };
            }
        }
    } catch (e) {
        console.log('[epic-auth-url] .well-known/smart-configuration failed:', e.message);
    }

    // Try 2: /metadata CapabilityStatement (SMART App Launch STU1 / DSTU2)
    try {
        const metadataUrl = `${base}/metadata`;
        console.log('[epic-auth-url] Trying /metadata discovery:', metadataUrl);
        const res = await fetch(metadataUrl, {
            headers: { 'Accept': 'application/fhir+json' },
            signal: AbortSignal.timeout(5000)
        });
        if (res.ok) {
            const cap = await res.json();
            const security = cap.rest?.[0]?.security;
            const oauthExt = security?.extension?.find(
                ext => ext.url === 'http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris'
            );
            if (oauthExt) {
                const authorize = oauthExt.extension?.find(e => e.url === 'authorize')?.valueUri;
                const token = oauthExt.extension?.find(e => e.url === 'token')?.valueUri;
                if (authorize && token) {
                    console.log('[epic-auth-url] /metadata discovery succeeded:',
                        'authorize=' + authorize, 'token=' + token);
                    return { authorize, token };
                }
            }
        }
    } catch (e) {
        console.log('[epic-auth-url] /metadata discovery failed:', e.message);
    }

    return null;
}

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const clientId = process.env.EPIC_CLIENT_ID;
        const redirectUri = process.env.EPIC_REDIRECT_URI;

        // Support dynamic FHIR base URL from query param (for multi-health-system support)
        // Falls back to env var for backward compatibility
        const queryFhirBaseUrl = event.queryStringParameters?.fhir_base_url;
        const rawFhirBaseUrl = queryFhirBaseUrl || process.env.EPIC_FHIR_BASE_URL;

        if (!clientId || !redirectUri) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Epic FHIR integration is not configured. Set EPIC_CLIENT_ID and EPIC_REDIRECT_URI.' })
            };
        }

        // Auto-fix redirect URI if protocol is missing
        let safeRedirectUri = redirectUri;
        if (redirectUri && !redirectUri.startsWith('http://') && !redirectUri.startsWith('https://')) {
            safeRedirectUri = 'https://' + redirectUri;
            console.warn('[epic-auth-url] EPIC_REDIRECT_URI is missing https:// protocol. Auto-correcting to:', safeRedirectUri,
                '— Please update EPIC_REDIRECT_URI in Netlify env vars to include https://');
        }

        if (!rawFhirBaseUrl) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: 'No FHIR base URL provided. Please select your health system or set EPIC_FHIR_BASE_URL.'
                })
            };
        }

        const fhirBaseUrl = normalizeUrl(rawFhirBaseUrl);

        // Warn if still using Epic sandbox in what appears to be production
        if (fhirBaseUrl.includes('interconnect-fhir-oauth') && process.env.URL && !process.env.URL.includes('localhost')) {
            console.warn('[epic-auth-url] NOTE: Using Epic SANDBOX endpoint. This is fine for testing with Epic test patients but will not work for real patients.');
        }

        // Generate PKCE code_verifier and code_challenge server-side
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = generateCodeChallenge(codeVerifier);

        // Determine the authorize endpoint:
        // 1. Explicit env var override (highest priority)
        // 2. SMART on FHIR .well-known discovery (recommended)
        // 3. Fallback: derive from FHIR base URL (fragile, may not work for all servers)
        let authorizeUrl = process.env.EPIC_AUTHORIZE_URL;
        let tokenUrl = process.env.EPIC_TOKEN_URL;
        let discoveryMethod = 'env_override';

        if (!authorizeUrl || !tokenUrl) {
            const discovered = await discoverSmartEndpoints(fhirBaseUrl);
            if (discovered) {
                authorizeUrl = authorizeUrl || discovered.authorize;
                tokenUrl = tokenUrl || discovered.token;
                discoveryMethod = 'smart_discovery';
            }
        }

        // Final fallback: derive from FHIR base URL pattern
        if (!authorizeUrl) {
            authorizeUrl = fhirBaseUrl.replace(/\/api\/FHIR\/R4\/?$/, '/oauth2/authorize');
            discoveryMethod = 'url_derivation';
            console.warn('[epic-auth-url] Using URL derivation fallback for authorize endpoint. ' +
                'Set EPIC_AUTHORIZE_URL or ensure the FHIR server supports .well-known/smart-configuration.');
        }

        // Generate a cryptographically random state parameter for CSRF protection
        const state = crypto.randomBytes(24).toString('base64url');

        // SMART on FHIR scopes for reading patient medication data.
        // IMPORTANT: Epic rejects the ENTIRE authorization request if ANY scope
        // is not enabled in the app registration. Use EPIC_SCOPES env var to
        // match EXACTLY what is configured in your Epic Developer portal.
        //
        // Default scopes are intentionally minimal — only Patient.read and
        // MedicationRequest.read. Adding Medication.read or other scopes that
        // aren't enabled in your Epic app registration will cause Epic to reject
        // the ENTIRE authorization request with "request is invalid".
        const scope = process.env.EPIC_SCOPES ||
            'patient/Patient.read patient/MedicationRequest.read';

        // Pre-flight: warn if any requested scopes aren't in the server's supported list
        const requestedScopes = scope.split(' ');
        let scopeWarnings = [];
        try {
            const smartRes = await fetch(`${fhirBaseUrl}/.well-known/smart-configuration`, {
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(3000)
            });
            if (smartRes.ok) {
                const smartConfig = await smartRes.json();
                if (smartConfig.scopes_supported && smartConfig.scopes_supported.length > 0) {
                    const unsupported = requestedScopes.filter(s => !smartConfig.scopes_supported.includes(s));
                    if (unsupported.length > 0) {
                        scopeWarnings = unsupported;
                        console.warn('[epic-auth-url] WARNING: These scopes are NOT in the server\'s supported list:', unsupported.join(', '),
                            'Supported scopes:', smartConfig.scopes_supported.join(', '));
                    }
                }
            }
        } catch (e) {
            // Don't block on scope check failure
            console.log('[epic-auth-url] Scope pre-flight check skipped:', e.message);
        }

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            redirect_uri: safeRedirectUri,
            scope,
            state,
            aud: fhirBaseUrl,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
        });

        const authUrl = `${authorizeUrl}?${params.toString()}`;

        // Log all parameters for debugging Epic "request is invalid" errors
        const debugInfo = {
            client_id: clientId,
            redirect_uri: safeRedirectUri,
            scope,
            aud: fhirBaseUrl,
            authorize_endpoint: authorizeUrl,
            token_endpoint: tokenUrl || '(will derive at token exchange)',
            discovery_method: discoveryMethod,
            scope_warnings: scopeWarnings.length > 0 ? scopeWarnings : undefined
        };
        console.log('[epic-auth-url] Authorization URL:', authUrl);
        console.log('[epic-auth-url] Parameters:', JSON.stringify(debugInfo));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                url: authUrl,
                state,
                code_verifier: codeVerifier,
                // Pass discovered token endpoint so the callback can use it
                token_endpoint: tokenUrl || null,
                // Pass FHIR base URL so callback can forward to token exchange
                fhir_base_url: fhirBaseUrl,
                // Include debug info so frontend can log it
                _debug: debugInfo
            })
        };

    } catch (error) {
        console.error('Epic auth URL error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to generate authorization URL',
                details: error.message
            })
        };
    }
}
