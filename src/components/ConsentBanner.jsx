import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  CONSENT_OPEN_EVENT,
} from '../lib/consent';

/**
 * Cookie/analytics consent banner.
 *
 * Shown until the visitor makes a choice. Google Analytics only loads after
 * "Accept" (see GoogleAnalytics.jsx). Visitors sending a Global Privacy
 * Control signal are treated as declined and never see the banner. The
 * footer "Privacy choices" link re-opens it so the choice can be changed.
 */
export default function ConsentBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => getAnalyticsConsent() === null);

  useEffect(() => {
    const reopen = () => setVisible(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  if (!visible) return null;

  const choose = (value) => {
    setAnalyticsConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label={t('consent.ariaLabel')}
      className="fixed bottom-0 inset-x-0 z-[60] bg-slate-900 text-white shadow-2xl border-t border-slate-700 no-print"
    >
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center gap-3">
        <p className="text-sm leading-relaxed flex-1">
          {t('consent.body')}{' '}
          <Link to="/privacy" className="underline text-emerald-300 hover:text-emerald-200">
            {t('consent.privacyLink')}
          </Link>
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={() => choose('denied')}
            className="px-4 py-2 min-h-[44px] rounded-lg border border-slate-500 text-slate-200 hover:bg-slate-800 font-medium text-sm transition"
          >
            {t('consent.decline')}
          </button>
          <button
            onClick={() => choose('granted')}
            className="px-4 py-2 min-h-[44px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition"
          >
            {t('consent.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
