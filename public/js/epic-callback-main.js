// Epic OAuth callback logic. External file for CSP compliance —
// script-src 'self' blocks inline scripts, so inlining this breaks the
// whole page silently (endless spinner, no console beyond CSP errors).
import {
    verifyState,
    exchangeCodeForToken,
    fetchEpicMedications,
    storeImportedMeds,
    getReturnPath
} from '/js/epic-connect.js';

window.__epicCallbackStarted = true;

const $ = (id) => document.getElementById(id);

// Visible elapsed-time ticker: makes 'how long has it been stuck'
// readable from a screenshot, no DevTools needed.
const __startedAt = Date.now();
let __currentStep = 'Exchanging authorization...';
setInterval(() => {
    const el = $('processing-msg');
    const processing = $('state-processing');
    if (!el || !processing || processing.classList.contains('hidden')) return;
    const secs = Math.round((Date.now() - __startedAt) / 1000);
    if (secs >= 3) el.textContent = __currentStep + ' (' + secs + 's)';
}, 1000);
const setStep = (text) => { __currentStep = text; const el = $('processing-msg'); if (el) el.textContent = text; };

function showState(state) {
    $('state-processing').classList.toggle('hidden', state !== 'processing');
    $('state-success').classList.toggle('hidden', state !== 'success');
    $('state-error').classList.toggle('hidden', state !== 'error');
}

function showError(msg, details) {
    $('error-msg').textContent = msg;
    const returnPath = sessionStorage.getItem('epic_return_path') || '/wizard';
    $('retry-link').href = returnPath;
    if (details) {
        const detailsEl = $('error-details');
        const contentEl = $('error-details-content');
        contentEl.textContent = typeof details === 'string' ? details : JSON.stringify(details, null, 2);
        detailsEl.classList.remove('hidden');
    }
    showState('error');
}

function renderProgramsSummary(programs) {
    if (!programs || programs.length === 0) return;

    const byType = {};
    for (const p of programs) {
        if (!byType[p.type]) byType[p.type] = [];
        byType[p.type].push(p);
    }

    const typeLabels = {
        pap: 'Patient Assistance Programs',
        copay: 'Copay Card Programs',
        foundation: 'Foundation Grants'
    };

    let html = '<h3>Assistance Programs Found</h3><ul>';
    for (const [type, list] of Object.entries(byType)) {
        const label = typeLabels[type] || type;
        html += `<li><span class="program-type">${label}:</span> ${list.length} program${list.length !== 1 ? 's' : ''} available</li>`;
    }
    html += '</ul>';

    const el = $('programs-summary');
    el.innerHTML = html;
    el.classList.remove('hidden');
}

async function processCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const errorParam = params.get('error');

    // Handle Epic-side errors (user denied consent, invalid client, etc.)
    if (errorParam) {
        let desc = params.get('error_description') || 'Authorization was not completed.';

        // Provide specific guidance based on the error type
        const errorGuide = {
            'invalid_client': 'The EPIC_CLIENT_ID is not recognized by this FHIR server. Verify it matches your Epic App Orchard registration.',
            'unauthorized_client': 'This app is not authorized for the requested flow. Check that your Epic app is registered for SMART App Launch (standalone).',
            'invalid_scope': 'One or more requested scopes are not registered for this app in Epic App Orchard.',
            'access_denied': 'Access was denied. The user may have declined consent, or the app is not approved for this health system.',
            'invalid_request': 'The authorization request was malformed. The redirect_uri or aud parameter may not match what is registered in Epic.'
        };

        if (errorGuide[errorParam]) {
            desc += ' ' + errorGuide[errorParam];
        }

        showError(desc, {
            error: errorParam,
            error_description: params.get('error_description'),
            error_uri: params.get('error_uri'),
            guidance: errorGuide[errorParam] || 'Check your Epic App Orchard configuration.',
            debug_url: '/api/epic-config-check'
        });
        return;
    }

    if (!code) {
        showError('No authorization code received from your health system.');
        return;
    }

    // Verify CSRF state
    if (state && !verifyState(state)) {
        showError('Security verification failed. Please try connecting again.');
        return;
    }

    // Check that codeVerifier exists before attempting token exchange
    const codeVerifier = sessionStorage.getItem('epic_pkce_code_verifier');
    if (!codeVerifier) {
        showError('Session expired - please try again');
        return;
    }

    // Log what's being sent to the token exchange
    // Note: epic_token_endpoint in sessionStorage is read by exchangeCodeForToken()
    console.log('Sending to token exchange:', {
        codeLength: code?.length,
        verifierLength: codeVerifier?.length,
        tokenEndpoint: sessionStorage.getItem('epic_token_endpoint') || 'default'
    });

    try {
        // Step 1: Exchange code for token
        setStep('Exchanging authorization...');
        const tokenData = await exchangeCodeForToken(code);

        console.log('Token data received:', JSON.stringify({
            patient: tokenData.patient,
            scope: tokenData.scope,
            tokenLength: tokenData.access_token?.length,
            keys: Object.keys(tokenData)
        }));

        // Check for error in token response
        if (tokenData.error) {
            const errorMsg = tokenData.details
                ? `${tokenData.error}: ${JSON.stringify(tokenData.details)}`
                : tokenData.error;
            showError(errorMsg, {
                ...tokenData,
                source: 'Epic token exchange failed. This is an Epic OAuth2 issue, visit /api/epic-config-check to diagnose.',
                debug_url: '/api/epic-config-check'
            });
            return;
        }

        // Verify patient context was returned (requires launch/patient scope)
        if (!tokenData.patient) {
            console.error('No patient ID in token response. Keys:', Object.keys(tokenData));
            showError('Your health system did not return a patient identifier. Please ensure the app has the launch/patient scope and try again.');
            return;
        }

        // Verify MedicationRequest scope was granted
        const grantedScope = tokenData.scope || '';
        console.log('Granted scope:', grantedScope);
        if (!grantedScope.toLowerCase().includes('medicationrequest')) {
            console.error('MedicationRequest scope not granted. Scope:', grantedScope);
            showError('Your health system did not grant medication access. Granted scopes: ' + grantedScope + '. The app registration may need MedicationRequest.Read enabled.');
            return;
        }

        // Step 2: Fetch medications
        setStep('Importing your medications...');
        const medsData = await fetchEpicMedications(tokenData.access_token, tokenData.patient, grantedScope);

        // Step 3: Store results for the calling page
        storeImportedMeds(medsData);

        // Step 4: Show success
        const count = medsData.matched ? medsData.matched.length : 0;
        $('success-msg').textContent =
            `Found ${count} transplant medication${count !== 1 ? 's' : ''} in your health system.` +
            (medsData.unmatched && medsData.unmatched.length > 0
                ? ` ${medsData.unmatched.length} non-transplant medication${medsData.unmatched.length !== 1 ? 's were' : ' was'} skipped.`
                : '');

        // Show assistance program summary if any
        renderProgramsSummary(medsData.assistancePrograms);

        showState('success');

        // Redirect back after a brief delay
        const returnPath = getReturnPath();
        setTimeout(() => {
            window.location.href = returnPath;
        }, 2500);

    } catch (err) {
        console.error('Epic callback error:', err);
        // Show actual error details from the token exchange response
        let errorMsg = err.message || 'An unexpected error occurred. Please try again.';
        let errorDetails = null;
        try {
            const parsed = JSON.parse(err.message);
            if (parsed.error) {
                errorMsg = parsed.details
                    ? `${parsed.error}: ${JSON.stringify(parsed.details)}`
                    : parsed.error;
                errorDetails = parsed;
            }
        } catch {
            // err.message is not JSON, use as-is
            errorDetails = { message: err.message, stack: err.stack };
        }
        showError(errorMsg, errorDetails);
    }
}

processCallback();
