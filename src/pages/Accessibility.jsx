import { Link } from 'react-router-dom';
import { Accessibility as AccessibilityIcon, Mail, CheckCircle, AlertCircle, ExternalLink, Scale, Phone } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';

// All copy comes from the legal.a11y i18n namespace. Strings containing
// <kbd> or <code> markup are rendered through <Trans> so the tags become
// real elements in both languages.
const Accessibility = () => {
    useMetaTags(seoMetadata.accessibility);
    const { t } = useTranslation();

    const Section = ({ id, title, children }) => (
        <section id={id}>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                {title}
            </h2>
            {children}
        </section>
    );

    const FeatureCard = ({ titleKey, textKey }) => (
        <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-2">{t(titleKey)}</h3>
            <p className="text-slate-700">
                <Trans i18nKey={textKey} components={{ kbd: <kbd /> }} />
            </p>
        </div>
    );

    const codeEl = <code className="bg-slate-100 px-1 rounded text-sm" />;

    return (
        <article className="max-w-4xl mx-auto space-y-8 pb-12">
            <header className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                    <AccessibilityIcon size={32} className="text-emerald-700" aria-hidden="true" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{t('legal.a11y.title')}</h1>
                <p className="text-slate-600">{t('legal.a11y.lastUpdated')}</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">

                {/* Section 504 Non-Discrimination Notice */}
                <Section id="section-504" title={t('legal.a11y.s504Title')}>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-blue-900 leading-relaxed">
                            {t('legal.a11y.s504NoticePre')} <strong>{t('legal.a11y.s504NoticeStrong')}</strong>{' '}
                            {t('legal.a11y.s504NoticeMid')}{' '}
                            <a
                                href="https://www.hhs.gov/civil-rights/for-individuals/disability/section-504-rehabilitation-act-of-1973/index.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 hover:text-blue-800 underline inline-flex items-center gap-1"
                            >
                                {t('legal.a11y.s504NoticeLink')}
                                <ExternalLink size={14} aria-hidden="true" />
                            </a>
                            {t('legal.a11y.s504NoticePost')}
                        </p>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.a11y.s504P1Pre')}{' '}
                        <a
                            href="https://www.w3.org/TR/WCAG21/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 underline inline-flex items-center gap-1"
                        >
                            {t('legal.a11y.s504WcagLink')}
                            <ExternalLink size={14} aria-hidden="true" />
                        </a>
                        {' '}{t('legal.a11y.s504P1Post')}
                    </p>
                </Section>

                {/* Commitment */}
                <Section title={t('legal.a11y.commitTitle')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.a11y.commitP1')}
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        {t('legal.a11y.commitP2')}
                    </p>
                </Section>

                {/* Conformance Status */}
                <Section title={t('legal.a11y.confTitle')}>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3 mb-4">
                        <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} aria-hidden="true" />
                        <p className="text-emerald-800">
                            <strong>{t('legal.a11y.confBadgeStrong')}</strong> {t('legal.a11y.confBadgeRest')}
                        </p>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.a11y.confP1')}
                    </p>
                </Section>

                {/* What We Do Well */}
                <Section title={t('legal.a11y.featTitle')}>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        {t('legal.a11y.featIntro')}
                    </p>
                    <div className="space-y-4">
                        <FeatureCard titleKey="legal.a11y.featKeyboardTitle" textKey="legal.a11y.featKeyboardText" />
                        <FeatureCard titleKey="legal.a11y.featScreenReaderTitle" textKey="legal.a11y.featScreenReaderText" />
                        <FeatureCard titleKey="legal.a11y.featRouteTitle" textKey="legal.a11y.featRouteText" />
                        <FeatureCard titleKey="legal.a11y.featSkipTitle" textKey="legal.a11y.featSkipText" />
                        <FeatureCard titleKey="legal.a11y.featContrastTitle" textKey="legal.a11y.featContrastText" />
                        <FeatureCard titleKey="legal.a11y.featFocusTitle" textKey="legal.a11y.featFocusText" />
                        <FeatureCard titleKey="legal.a11y.featMotionTitle" textKey="legal.a11y.featMotionText" />
                        <FeatureCard titleKey="legal.a11y.featHcTitle" textKey="legal.a11y.featHcText" />
                        <FeatureCard titleKey="legal.a11y.featSpacingTitle" textKey="legal.a11y.featSpacingText" />
                        <FeatureCard titleKey="legal.a11y.featFormsTitle" textKey="legal.a11y.featFormsText" />
                        <FeatureCard titleKey="legal.a11y.featTouchTitle" textKey="legal.a11y.featTouchText" />
                        <FeatureCard titleKey="legal.a11y.featPlainTitle" textKey="legal.a11y.featPlainText" />
                        <FeatureCard titleKey="legal.a11y.featSimpleTitle" textKey="legal.a11y.featSimpleText" />
                        <FeatureCard titleKey="legal.a11y.featReadTitle" textKey="legal.a11y.featReadText" />
                    </div>
                </Section>

                {/* Technical Details */}
                <Section title={t('legal.a11y.techTitle')}>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        {t('legal.a11y.techIntro')}
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <li key={i}>
                                <Trans i18nKey={`legal.a11y.techItem${i}`} components={{ code: codeEl }} />
                            </li>
                        ))}
                    </ul>
                </Section>

                {/* Compatibility */}
                <Section title={t('legal.a11y.compatTitle')}>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        {t('legal.a11y.compatIntro')}
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                        {t('legal.a11y.compatItems', { returnObjects: true }).map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        {t('legal.a11y.compatP2')}
                    </p>
                </Section>

                {/* Known Limitations */}
                <Section title={t('legal.a11y.limitsTitle')}>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        {t('legal.a11y.limitsIntro')}
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} aria-hidden="true" />
                        <div className="text-amber-800">
                            <ul className="list-disc list-inside space-y-2 text-sm">
                                <li><strong>{t('legal.a11y.limitsInfographicLabel')}</strong> {t('legal.a11y.limitsInfographicText')}</li>
                                <li><strong>{t('legal.a11y.limitsThirdPartyLabel')}</strong> {t('legal.a11y.limitsThirdPartyText')}</li>
                                <li><strong>{t('legal.a11y.limitsChatLabel')}</strong> {t('legal.a11y.limitsChatText')}</li>
                            </ul>
                        </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        {t('legal.a11y.limitsP2')}
                    </p>
                </Section>

                {/* Assessment Approach */}
                <Section title={t('legal.a11y.testTitle')}>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        {t('legal.a11y.testIntro')}
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                        {t('legal.a11y.testItems', { returnObjects: true }).map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        {t('legal.a11y.testP2')}
                    </p>
                </Section>

                {/* Section 504 Grievance Procedure */}
                <Section id="grievance-procedure" title={t('legal.a11y.grievTitle')}>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        {t('legal.a11y.grievIntro')}
                    </p>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-2">{t('legal.a11y.grievFileTitle')}</h3>
                            <p className="text-slate-700">
                                {t('legal.a11y.grievFileText')}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-2">{t('legal.a11y.grievSubmitTitle')}</h3>
                            <div className="text-slate-700 space-y-1">
                                <p><strong>{t('legal.a11y.grievCoordinator')}</strong></p>
                                <p>{t('legal.a11y.grievCompany')}</p>
                                <p>
                                    {t('legal.a11y.grievEmailLabel')}{' '}
                                    <a
                                        href="mailto:ldavis@transplantnav.com?subject=Section%20504%20Grievance"
                                        className="text-emerald-600 hover:text-emerald-700 underline"
                                    >
                                        ldavis@transplantnav.com
                                    </a>
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-2">{t('legal.a11y.grievResTitle')}</h3>
                            <ol className="list-decimal list-inside space-y-2 text-slate-700">
                                {t('legal.a11y.grievResSteps', { returnObjects: true }).map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ol>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-2">{t('legal.a11y.grievAltTitle')}</h3>
                            <p className="text-slate-700">
                                {t('legal.a11y.grievAltText')}
                            </p>
                        </div>
                    </div>
                </Section>

                {/* Feedback */}
                <Section title={t('legal.a11y.fbTitle')}>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        {t('legal.a11y.fbIntro')}
                    </p>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                        <p className="text-slate-700">
                            <strong>{t('legal.a11y.fbEmailLabel')}</strong>{' '}
                            <a
                                href="mailto:info@transplantmedicationnavigator.com?subject=Accessibility%20Feedback"
                                className="text-emerald-600 hover:text-emerald-700 underline inline-flex items-center gap-1"
                            >
                                <Mail size={16} aria-hidden="true" />
                                info@transplantmedicationnavigator.com
                            </a>
                        </p>
                        <p className="text-slate-700">
                            <strong>{t('legal.a11y.fbSubjectLabel')}</strong> {t('legal.a11y.fbSubjectValue')}
                        </p>
                    </div>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        {t('legal.a11y.fbHelpIntro')}
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 mt-2">
                        {t('legal.a11y.fbHelpItems', { returnObjects: true }).map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        {t('legal.a11y.fbResponse')}
                    </p>
                </Section>

                {/* Formal Complaint Process */}
                <Section title={t('legal.a11y.extTitle')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.a11y.extP1Pre')}{' '}
                        <a
                            href="https://www.hhs.gov/civil-rights/filing-a-complaint/index.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 underline inline-flex items-center gap-1"
                        >
                            {t('legal.a11y.extP1Link')}
                            <ExternalLink size={14} aria-hidden="true" />
                        </a>
                        {t('legal.a11y.extP1Post')}
                    </p>
                    <div className="bg-slate-50 rounded-lg p-4 mt-4 space-y-2">
                        <p className="text-slate-700"><strong>{t('legal.a11y.extOcr')}</strong></p>
                        <p className="text-slate-700">
                            {t('legal.a11y.extPhoneLabel')}{' '}
                            <a href="tel:1-800-368-1019" className="text-emerald-600 hover:text-emerald-700 underline">
                                1-800-368-1019
                            </a>
                        </p>
                        <p className="text-slate-700">
                            {t('legal.a11y.extTddLabel')}{' '}
                            <a href="tel:1-800-537-7697" className="text-emerald-600 hover:text-emerald-700 underline">
                                1-800-537-7697
                            </a>
                        </p>
                        <p className="text-slate-700">
                            {t('legal.a11y.extOnlineLabel')}{' '}
                            <a
                                href="https://ocrportal.hhs.gov/ocr/smartscreen/main.jsf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 underline inline-flex items-center gap-1"
                            >
                                {t('legal.a11y.extPortal')}
                                <ExternalLink size={14} aria-hidden="true" />
                            </a>
                        </p>
                    </div>
                </Section>
            </div>

            {/* Help CTA */}
            <aside className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 md:p-8 text-center">
                <h2 className="text-xl font-bold text-emerald-900 mb-3">{t('legal.a11y.asideTitle')}</h2>
                <p className="text-emerald-800 mb-6">
                    {t('legal.a11y.asideText')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="mailto:info@transplantmedicationnavigator.com?subject=Accessibility%20Assistance"
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition inline-flex items-center justify-center gap-2 min-h-[44px]"
                    >
                        <Mail size={18} aria-hidden="true" />
                        {t('legal.a11y.asideContact')}
                    </a>
                    <Link
                        to="/"
                        className="px-6 py-3 bg-white hover:bg-slate-50 text-emerald-700 font-bold rounded-lg shadow-md border border-emerald-200 transition min-h-[44px] inline-flex items-center justify-center"
                    >
                        {t('legal.a11y.asideHome')}
                    </Link>
                </div>
            </aside>
        </article>
    );
};

export default Accessibility;
