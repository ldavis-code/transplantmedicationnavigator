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
 * Current UI language for tagging outbound /out/ links ('en' or 'es').
 * Exported so link hrefs carry the same language the client events carry —
 * the out-redirect function logs it next to the click's source.
 */
export function getUiLang() {
  const lang = getLang();
  return lang && lang.startsWith('es') ? 'es' : 'en';
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

    // Fire and forget, don't await, don't block UI.
    //
    // keepalive lets the request outlive the page that started it. No
    // current call site needs that — every tracked outbound link opens in a
    // new tab, and /out/ links are logged server-side by out-redirect.js —
    // so this is insurance for the first same-tab tracked navigation, not a
    // fix for a loss we've measured. Costs nothing: the browser cap on
    // keepalive bodies is 64 KB and these are a few hundred bytes.
    //
    // Deliberately still fetch, not navigator.sendBeacon: the endpoint's
    // events are JSON and sendBeacon can't set a Content-Type header.
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {
      // Silently ignore, analytics must never break the app
    });
  } catch {
    // Silently ignore
  }
}
