import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackServerEvent } from '../lib/trackServerEvent';
import { getAnalyticsConsent, CONSENT_CHANGE_EVENT } from '../lib/consent';

/**
 * Google Analytics 4 Integration Component
 *
 * GA4 loads ONLY after the visitor accepts analytics in the ConsentBanner.
 * Until then (and forever if they decline or send a Global Privacy Control
 * signal) no Google script is loaded and no _ga cookies are set. The
 * anonymous first-party server events are consent-independent: they carry no
 * cookies or identifiers.
 */

// ============================================================================
// GA4 MEASUREMENT ID - REPLACE THIS WITH YOUR ACTUAL ID
// ============================================================================
// Format: G-XXXXXXXXXX (e.g., G-ABC123XYZ0)
// Find this in Google Analytics: Admin > Data Streams > Web > Measurement ID
// ============================================================================
const GA4_MEASUREMENT_ID = 'G-MRRECSDQWC';
// ============================================================================

/**
 * Initialize Google Analytics 4
 * Loads the gtag.js script and configures it with the measurement ID
 */
const initializeGA4 = () => {
  // Don't initialize if already loaded or if ID is placeholder
  if (window.gtag || GA4_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    if (GA4_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
      console.warn(
        'Google Analytics: Using placeholder measurement ID. ' +
        'Replace GA4_MEASUREMENT_ID in src/components/GoogleAnalytics.jsx with your actual ID.'
      );
    }
    return;
  }

  // Create and inject the gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize the dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  // Set the initial timestamp
  window.gtag('js', new Date());

  // Configure GA4 with the measurement ID
  window.gtag('config', GA4_MEASUREMENT_ID, {
    send_page_view: false, // We'll handle page views manually for SPA routing
  });
};

/**
 * Track a page view in GA4
 * @param {string} path - The page path to track
 * @param {string} title - The page title
 */
const trackPageView = (path, title) => {
  if (!window.gtag || GA4_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    return;
  }

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
};

/**
 * GoogleAnalytics Component
 *
 * Place this component inside your Router (e.g., BrowserRouter) to enable
 * automatic page view tracking on route changes.
 *
 * Usage:
 *   <BrowserRouter>
 *     <GoogleAnalytics />
 *     <Routes>...</Routes>
 *   </BrowserRouter>
 */
const GoogleAnalytics = () => {
  const location = useLocation();

  // Initialize GA4 only once the visitor has granted analytics consent —
  // either previously stored, or the moment they accept in the banner.
  useEffect(() => {
    if (getAnalyticsConsent() === 'granted') {
      initializeGA4();
    }
    const onConsentChange = (e) => {
      if (e.detail?.analytics === 'granted') {
        window[`ga-disable-${GA4_MEASUREMENT_ID}`] = false;
        initializeGA4();
      } else if (e.detail?.analytics === 'denied') {
        // If GA was already running this session, stop it immediately.
        window[`ga-disable-${GA4_MEASUREMENT_ID}`] = true;
      }
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsentChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onConsentChange);
  }, []);

  // Track page views on route changes
  useEffect(() => {
    // Small delay to ensure the page title has updated
    const timeoutId = setTimeout(() => {
      trackPageView(location.pathname + location.search, document.title);
      trackServerEvent('page_view');
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location]);

  // This component doesn't render anything
  return null;
};

export default GoogleAnalytics;

// Export utility functions for custom event tracking
export { GA4_MEASUREMENT_ID, trackPageView };

/**
 * Track a custom event in GA4
 *
 * Usage:
 *   import { trackEvent } from './components/GoogleAnalytics';
 *   trackEvent('button_click', { button_name: 'signup' });
 *
 * @param {string} eventName - The name of the event
 * @param {object} parameters - Additional event parameters
 */
export const trackEvent = (eventName, parameters = {}) => {
  if (!window.gtag || GA4_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    return;
  }

  window.gtag('event', eventName, parameters);
};
