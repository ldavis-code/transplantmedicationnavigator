import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';

/**
 * Point-of-use data notice shown immediately before a sensitive action
 * (health-system connection, letter generation). The full privacy policy is
 * not an adequate substitute at the moment of the action, so this explains
 * in place what happens to the information and links to the policy.
 *
 * @param {string} textKey - i18n key for the body text (e.g. 'privacyNotice.epic')
 */
const PrivacyPointNotice = ({ textKey, className = '' }) => {
    const { t } = useTranslation();
    return (
        <div role="note" className={`bg-slate-50 border border-slate-200 rounded-lg p-3 ${className}`}>
            <div className="flex items-start gap-2">
                <ShieldCheck size={16} className="text-slate-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-xs text-slate-600 leading-relaxed">
                    <p>
                        <strong className="text-slate-700">{t('privacyNotice.title')}:</strong>{' '}
                        {t(textKey)}{' '}
                        <Link to="/privacy" className="underline text-slate-700 hover:text-slate-900">
                            {t('privacyNotice.policyLink')}
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPointNotice;
