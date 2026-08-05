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
