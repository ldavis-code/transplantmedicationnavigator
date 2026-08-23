import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { initErrorLogger } from './utils/errorLogger';
import { i18nReady } from './i18n.js';
import { medicationsReady } from './context/MedicationsContext.jsx';
import './main.css';

// Initialize error logging (connects to Sentry in production if DSN is configured)
initErrorLogger();

// A deploy replaces the content-hashed chunks, so a tab loaded from the
// previous deploy can fail a later dynamic import (route chunk, locale
// bundle, fuse.js) — and without this, that failure is silent: the module
// that owns a button never arrives and the page just stops responding
// (seen in the wild as frozen tabs right after a language switch that
// crossed a deploy boundary). Vite surfaces those failures as
// 'vite:preloadError'; reload once to pick up the current version.
window.addEventListener('vite:preloadError', (event) => {
    const KEY = 'tmn-preload-reloaded';
    try {
        if (sessionStorage.getItem(KEY) === window.location.href) return; // no reload loops
        sessionStorage.setItem(KEY, window.location.href);
    } catch {
        // sessionStorage unavailable — reload anyway; worst case the loop
        // guard is lost for this visit
    }
    event.preventDefault();
    window.location.reload();
});

// Wait for render-critical data before first paint: the active language's
// strings (src/i18n.js) and the medications fallback (MedicationsContext).
// Both live in their own chunks with modulepreload hints in the HTML, so
// they download in parallel with this entry module — the gate is about
// ordering, not extra waiting. The static pre-hydration HTML is visible
// the whole time.
Promise.all([i18nReady, medicationsReady]).then(() => {
    ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </React.StrictMode>
    );
});
