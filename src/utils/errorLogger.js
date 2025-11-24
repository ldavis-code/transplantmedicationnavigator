/**
 * Error Logging Utility
 *
 * Logs errors to console in development and can be connected to Sentry in production.
 *
 * SETUP FOR SENTRY:
 * 1. Install Sentry: npm install @sentry/react
 * 2. Add your Sentry DSN below
 * 3. Errors will automatically be sent to Sentry in production
 */

// ============================================================================
// SENTRY CONFIGURATION - ADD YOUR DSN HERE TO ENABLE SENTRY
// ============================================================================
// Get your DSN from: https://sentry.io -> Project Settings -> Client Keys (DSN)
// Format: https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
// ============================================================================
const SENTRY_DSN = ''; // <-- INSERT YOUR SENTRY DSN HERE (leave empty to disable)
// ============================================================================

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Sentry instance (lazy-loaded when DSN is provided)
let Sentry = null;
let sentryInitialized = false;

/**
 * Initialize Sentry if DSN is provided
 * Call this once at app startup (e.g., in main.jsx)
 */
export const initErrorLogger = async () => {
  if (sentryInitialized) return;

  if (SENTRY_DSN && isProduction) {
    try {
      // Dynamic import to avoid bundling Sentry if not used
      Sentry = await import('@sentry/react');

      Sentry.init({
        dsn: SENTRY_DSN,
        environment: isProduction ? 'production' : 'development',
        // Capture 100% of transactions for performance monitoring
        tracesSampleRate: 1.0,
        // Don't send errors in development
        enabled: isProduction,
      });

      sentryInitialized = true;
      console.info('Sentry error logging initialized');
    } catch (error) {
      console.warn(
        'Sentry SDK not installed. To enable Sentry, run: npm install @sentry/react'
      );
    }
  } else if (SENTRY_DSN && isDevelopment) {
    console.info('Sentry is configured but disabled in development mode');
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

  // Only send to Sentry if explicitly needed (uncomment if desired)
  // if (Sentry && sentryInitialized) {
  //   Sentry.captureMessage(message, 'info');
  // }
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
