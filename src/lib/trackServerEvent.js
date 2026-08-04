/**
 * Fire-and-forget event tracking to the backend.
 * Sends events to /.netlify/functions/event for the admin dashboard.
 * Never throws, analytics should not break the user experience.
 */

const ENDPOINT = '/.netlify/functions/event';

// Get partner from URL params (e.g., ?partner=hospital-xyz)
function getPartner() {
  try {
    return new URLSearchParams(window.location.search).get('partner') || null;
  } catch {
    return null;
  }
}

// Get the current UI language ('en' or 'es'). i18n.js keeps <html lang> in
// sync with the active i18next language, so reading it at send time reflects
// mid-session language switches.
function getLang() {
  try {
    return document.documentElement.lang || 'en';
  } catch {
    return null;
  }
}

/**
 * Track an event to the backend database.
 * @param {string} eventName - One of the allowed event names (page_view, quiz_start, quiz_complete, med_search, etc.)
 * @param {object} [meta] - Optional metadata (no PHI allowed)
 */
export function trackServerEvent(eventName, meta) {
  try {
    const body = {
      event_name: eventName,
      page_source: window.location.pathname,
      partner: getPartner(),
      lang: getLang(),
    };
    if (meta) body.meta = meta;

    // Fire and forget, don't await, don't block UI
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {
      // Silently ignore, analytics must never break the app
    });
  } catch {
    // Silently ignore
  }
}
