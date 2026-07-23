import { Link } from 'react-router-dom';
import { Shield, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';

// Section headings and body text come from the legal.privacy i18n namespace.
// The English strings are the reviewed source of truth; the Spanish text is a
// translation of the same policy, not a separate policy.
const PrivacyPolicy = () => {
    useMetaTags(seoMetadata.privacyPolicy);
    const { t } = useTranslation();

    const Section = ({ title, children }) => (
        <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                {title}
            </h2>
            {children}
        </section>
    );

    const InfoCard = ({ titleKey, textKey }) => (
        <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-2">{t(titleKey)}</h3>
            <p className="text-slate-700">{t(textKey)}</p>
        </div>
    );

    return (
        <article className="max-w-4xl mx-auto space-y-8 pb-12">
            <header className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                    <Shield size={32} className="text-emerald-700" aria-hidden="true" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{t('legal.privacy.title')}</h1>
                <p className="text-slate-600">{t('legal.privacy.lastUpdated')}</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
                <section>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.privacy.intro1')}
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        {t('legal.privacy.intro2')}
                    </p>
                </section>

                <Section title={t('legal.privacy.s1Title')}>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        {t('legal.privacy.s1Intro')}
                    </p>
                    <div className="space-y-4">
                        <InfoCard titleKey="legal.privacy.cardDeviceTitle" textKey="legal.privacy.cardDeviceText" />
                        <InfoCard titleKey="legal.privacy.cardUsageTitle" textKey="legal.privacy.cardUsageText" />
                        <InfoCard titleKey="legal.privacy.cardFeedbackTitle" textKey="legal.privacy.cardFeedbackText" />
                        <InfoCard titleKey="legal.privacy.cardEpicTitle" textKey="legal.privacy.cardEpicText" />
                        <InfoCard titleKey="legal.privacy.cardChatTitle" textKey="legal.privacy.cardChatText" />
                        <InfoCard titleKey="legal.privacy.cardCookiesTitle" textKey="legal.privacy.cardCookiesText" />
                    </div>
                </Section>

                <Section title={t('legal.privacy.s2Title')}>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        {t('legal.privacy.s2Intro')}
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                        {t('legal.privacy.s2Items', { returnObjects: true }).map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </Section>

                <Section title={t('legal.privacy.s3Title')}>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        {t('legal.privacy.s3Intro')}
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                        <li><strong>{t('legal.privacy.s3ProvidersLabel')}</strong> {t('legal.privacy.s3ProvidersText')}</li>
                        <li><strong>{t('legal.privacy.s3LegalLabel')}</strong> {t('legal.privacy.s3LegalText')}</li>
                        <li><strong>{t('legal.privacy.s3TransfersLabel')}</strong> {t('legal.privacy.s3TransfersText')}</li>
                    </ul>
                    <p className="text-slate-700 leading-relaxed mt-4 font-semibold bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        {t('legal.privacy.s3NoSell')}
                    </p>
                </Section>

                <Section title={t('legal.privacy.s4Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.privacy.s4P1')}
                    </p>
                </Section>

                <Section title={t('legal.privacy.s5Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.privacy.s5P1')}
                    </p>
                </Section>

                <Section title={t('legal.privacy.s6Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.privacy.s6P1')}
                    </p>
                </Section>

                <Section title={t('legal.privacy.s7Title')}>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        {t('legal.privacy.s7Intro')}
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                        <li><strong>{t('legal.privacy.s7AccessLabel')}</strong> {t('legal.privacy.s7AccessText')}</li>
                        <li><strong>{t('legal.privacy.s7CorrectionLabel')}</strong> {t('legal.privacy.s7CorrectionText')}</li>
                        <li><strong>{t('legal.privacy.s7DeletionLabel')}</strong> {t('legal.privacy.s7DeletionText')}</li>
                        <li><strong>{t('legal.privacy.s7OptOutLabel')}</strong> {t('legal.privacy.s7OptOutText')}</li>
                    </ul>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        {t('legal.privacy.s7P2')}
                    </p>
                </Section>

                <Section title={t('legal.privacy.s8Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.privacy.s8P1')}
                    </p>
                </Section>

                <Section title={t('legal.privacy.s9Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.privacy.s9P1')}
                    </p>
                </Section>

                <Section title={t('legal.privacy.s10Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.privacy.s10P1')}
                    </p>
                </Section>

                <Section title={t('legal.privacy.s11Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.privacy.s11P1')}
                    </p>
                </Section>

                <Section title={t('legal.privacy.s12Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.privacy.s12Pre')}{' '}
                        <a
                            href="mailto:info@transplantmedicationnavigator.com"
                            className="text-emerald-600 hover:text-emerald-700 underline inline-flex items-center gap-1"
                        >
                            <Mail size={16} aria-hidden="true" />
                            info@transplantmedicationnavigator.com
                        </a>
                    </p>
                </Section>
            </div>

            <aside className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 md:p-8 text-center">
                <h2 className="text-xl font-bold text-emerald-900 mb-3">{t('legal.privacy.asideTitle')}</h2>
                <p className="text-emerald-800 mb-6">
                    {t('legal.privacy.asideText')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/terms-and-conditions"
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition"
                    >
                        {t('legal.privacy.asideTerms')}
                    </Link>
                    <Link
                        to="/"
                        className="px-6 py-3 bg-white hover:bg-slate-50 text-emerald-700 font-bold rounded-lg shadow-md border border-emerald-200 transition"
                    >
                        {t('legal.privacy.asideHome')}
                    </Link>
                </div>
            </aside>
        </article>
    );
};

export default PrivacyPolicy;
