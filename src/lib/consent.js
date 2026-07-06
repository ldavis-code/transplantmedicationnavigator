/**
 * Analytics consent state.
 *
 * Google Analytics never loads until the visitor explicitly accepts via the
 * ConsentBanner. A Global Privacy Control (GPC) browser signal is honored as
 * an automatic decline, with no banner shown. Everything on the site works
 * without analytics; the anonymous first-party event counts (no cookies, no
 * identifiers, PHI blocklist on the endpoint) are unaffected by this choice.
 */

const CONSENT_KEY = 'tmn_consent';
export const CONSENT_CHANGE_EVENT = 'tmn-consent-change';
export const CONSENT_OPEN_EVENT = 'tmn-open-consent';

export function hasGPC() {
  try {
    return navigator.globalPrivacyControl === true;
  } catch {
    return false;
  }
}

/**
 * @returns {'granted'|'denied'|null} the stored choice; GPC counts as a
 * denial when no explicit choice has been made; null means "not asked yet".
 */
export function getAnalyticsConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (raw) {
      const stored = JSON.parse(raw);
      if (stored.analytics === 'granted' || stored.analytics === 'denied') {
        return stored.analytics;
      }
    }
  } catch {
    // fall through
  }
  if (hasGPC()) return 'denied';
  return null;
}

export function setAnalyticsConsent(value) {
  try {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ analytics: value, updatedAt: new Date().toISOString() })
    );
  } catch {
    // localStorage unavailable — treat as session-only choice
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: { analytics: value } }));
}

/** Re-open the consent banner (used by the footer "Privacy choices" link). */
export function openConsentBanner() {
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}
