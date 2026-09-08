/**
 * Fire-and-forget event tracking to the backend.
 * Sends events to /.netlify/functions/event for the admin dashboard.
 * Never throws, analytics should not break the user experience.
 */

const ENDPOINT = '/.netlify/functions/event';

// sessionStorage keys. Both values are scoped to the browser tab and cleared
// when it closes; neither identifies a person.
const PARTNER_KEY = 'tmn_partner';
const SESSION_KEY = 'tmn_session_id';

/**
 * Remember which transplant center (pilot partner) a visitor came through.
 * Called by the /pilot/:partner landing page so the tag follows the patient
 * to the medication search, quiz, and program links for the rest of the
 * session — without it, only the landing page itself would be attributed to
 * the center, and the admin Center Analytics page would have nothing to show.
 * @param {string} partner - slug such as 'methodist' (letters, digits, - and _)
 */
export function rememberPartner(partner) {
  try {
    const clean = String(partner || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50).toLowerCase();
    if (clean) sessionStorage.setItem(PARTNER_KEY, clean);
  } catch {
    // Storage may be unavailable (private mode); attribution is best-effort.
  }
}

// Partner from the URL first (?partner=hospital-xyz, or the /pilot/<slug>
// landing path), then the one remembered for this session. A URL tag wins so
// a coordinator's fresh link re-tags. Reading the pilot path here, not only in
// the Pilot page's effect, means the landing page_view itself is attributed
// even when the analytics hook fires before the lazy-loaded page mounts.
function getPartner() {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('partner');
    const fromPath = (window.location.pathname.match(/^(?:\/es)?\/pilot\/([a-z0-9_-]+)/i) || [])[1];
    const fromUrl = fromQuery || fromPath;
    if (fromUrl) {
      rememberPartner(fromUrl);
      return fromUrl;
    }
    return sessionStorage.getItem(PARTNER_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Current partner tag ('methodist') or null. Exported so other surfaces can
 * carry the same attribution the events do.
 */
export function getPartnerTag() {
  return getPartner();
}

// Random per-tab id so the admin dashboards can count distinct visits
// instead of guessing from page + date. Not tied to any account or person.
function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
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
    const sessionId = getSessionId();
    if (meta || sessionId) {
      body.meta = { ...(meta || {}) };
      if (sessionId && body.meta.sessionId === undefined) body.meta.sessionId = sessionId;
    }

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
