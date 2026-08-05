import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { initErrorLogger } from './utils/errorLogger';
import { i18nReady } from './i18n.js';
import './main.css';

// Initialize error logging (connects to Sentry in production if DSN is configured)
initErrorLogger();

// Wait for the detected language's strings before first paint: instant for
// English (bundled); for Spanish this waits for the small lazy locale chunk
// so Spanish visitors never see an English flash. See src/i18n.js.
i18nReady.then(() => {
    ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </React.StrictMode>
    );
});
