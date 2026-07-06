/**
 * Error Logging Utility
 *
 * Logs errors to console in development; reports to Sentry in production
 * when a DSN is configured.
 *
 * TO ENABLE SENTRY:
 * 1. Create a project at sentry.io and copy its DSN
 * 2. Set VITE_SENTRY_DSN in Netlify environment variables
 * 3. Redeploy (VITE_ vars are baked in at build time)
 * The CSP in netlify.toml already allows Sentry's ingest domain.
 * Privacy note: Sentry receives error stack traces and, by default, client
 * IPs — if enabled, add Sentry to the processor list in the Privacy Policy.
 */

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Sentry instance (set when Sentry is initialized)
let Sentry = null;
let sentryInitialized = false;

/**
 * Initialize error logging
 * Call this once at app startup (e.g., in main.jsx)
 */
export const initErrorLogger = async () => {
  if (sentryInitialized) return;

  if (SENTRY_DSN && isProduction) {
    try {
      // Dynamic import keeps Sentry out of the main bundle when disabled
      const SentryModule = await import('@sentry/react');
      Sentry = SentryModule;

      Sentry.init({
        dsn: SENTRY_DSN,
        environment: 'production',
        tracesSampleRate: 0,
        sendDefaultPii: false,
      });

      sentryInitialized = true;
      console.info('Sentry error logging initialized');
    } catch (error) {
      console.warn('Failed to initialize Sentry:', error.message);
    }
  } else if (isDevelopment) {
    console.info('Error logger initialized (console mode)');
  }
};

/**
 * Log an error
 *
 * @param {Error} error - The error object
 * @param {object} context - Additional context about the error
 * @param {string} context.component - Component where error occurred
 * @param {object} context.extra - Additional data to log
 */
export const logError = (error, context = {}) => {
  const { component = 'Unknown', extra = {} } = context;

  // Always log to console in development
  if (isDevelopment) {
    console.group(`🚨 Error in ${component}`);
    console.error('Error:', error);
    if (Object.keys(extra).length > 0) {
      console.info('Context:', extra);
    }
    console.groupEnd();
  } else {
    // In production, still log to console (useful for debugging)
    console.error(`[${component}]`, error);
  }

  // Send to Sentry in production if initialized
  if (Sentry && sentryInitialized) {
    Sentry.withScope((scope) => {
      scope.setTag('component', component);
      Object.entries(extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  }
};

/**
 * Log a warning (non-fatal issue)
 *
 * @param {string} message - Warning message
 * @param {object} context - Additional context
 */
export const logWarning = (message, context = {}) => {
  const { component = 'Unknown', extra = {} } = context;

  if (isDevelopment) {
    console.group(`⚠️ Warning in ${component}`);
    console.warn('Message:', message);
    if (Object.keys(extra).length > 0) {
      console.info('Context:', extra);
    }
    console.groupEnd();
  } else {
    console.warn(`[${component}]`, message);
  }

  if (Sentry && sentryInitialized) {
    Sentry.withScope((scope) => {
      scope.setTag('component', component);
      scope.setLevel('warning');
      Object.entries(extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureMessage(message);
    });
  }
};

/**
 * Log an informational message (for tracking important events)
 *
 * @param {string} message - Info message
 * @param {object} context - Additional context
 */
export const logInfo = (message, context = {}) => {
  const { component = 'Unknown', extra = {} } = context;

  if (isDevelopment) {
    console.group(`ℹ️ Info from ${component}`);
    console.info('Message:', message);
    if (Object.keys(extra).length > 0) {
      console.info('Context:', extra);
    }
    console.groupEnd();
  }
};

/**
 * Set user context for error tracking
 * Call this after user authentication
 *
 * @param {object} user - User information
 * @param {string} user.id - User ID
 * @param {string} user.email - User email (optional)
 */
export const setUserContext = (user) => {
  if (Sentry && sentryInitialized) {
    Sentry.setUser(user);
  }
};

/**
 * Clear user context (call on logout)
 */
export const clearUserContext = () => {
  if (Sentry && sentryInitialized) {
    Sentry.setUser(null);
  }
};

// Export config for checking if Sentry is enabled
export const isSentryEnabled = () => Boolean(SENTRY_DSN) && sentryInitialized;
export const getSentryDSN = () => SENTRY_DSN;
