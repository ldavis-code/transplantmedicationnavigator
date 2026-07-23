import { Link } from 'react-router-dom';
import { FileText, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';

// Section headings and body text come from the legal.terms i18n namespace.
// The English strings are the legally reviewed source of truth; the Spanish
// text is a translation of the same terms, not a separate agreement.
const TermsAndConditions = () => {
    useMetaTags(seoMetadata.termsAndConditions);
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

    return (
        <article className="max-w-4xl mx-auto space-y-8 pb-12">
            <header className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                    <FileText size={32} className="text-emerald-700" aria-hidden="true" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{t('legal.terms.title')}</h1>
                <p className="text-slate-600">{t('legal.terms.lastUpdated')}</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
                <section>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.terms.intro1')}
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        {t('legal.terms.intro2')}
                    </p>
                </section>

                <Section title={t('legal.terms.s1Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.terms.s1P1')}
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        {t('legal.terms.s1P2')}
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4 font-semibold bg-red-50 border border-red-200 rounded-lg p-4">
                        {t('legal.terms.s1Emergency')}
                    </p>
                </Section>

                <Section title={t('legal.terms.s2Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.terms.s2P1')}
                    </p>
                </Section>

                <Section title={t('legal.terms.s3Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.terms.s3P1')}
                    </p>
                </Section>

                <Section title={t('legal.terms.s4Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.terms.s4P1')}
                    </p>
                </Section>

                <Section title={t('legal.terms.s5Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.terms.s5P1')}
                    </p>
                </Section>

                <Section title={t('legal.terms.s6Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.terms.s6P1')}
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        {t('legal.terms.s6P2')}
                    </p>
                </Section>

                <Section title={t('legal.terms.s7Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.terms.s7P1')}
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        {t('legal.terms.s7P2')}
                    </p>
                </Section>

                <Section title={t('legal.terms.s8Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.terms.s8P1')}
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        {t('legal.terms.s8P2')}
                    </p>
                </Section>

                <Section title={t('legal.terms.s9Title')}>
                    <p className="text-slate-700 leading-relaxed">
                        {t('legal.terms.s9Pre')}{' '}
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
                <h2 className="text-xl font-bold text-emerald-900 mb-3">{t('legal.terms.asideTitle')}</h2>
                <p className="text-emerald-800 mb-6">
                    {t('legal.terms.asideText')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/faq"
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition"
                    >
                        {t('legal.terms.asideFaq')}
                    </Link>
                    <Link
                        to="/"
                        className="px-6 py-3 bg-white hover:bg-slate-50 text-emerald-700 font-bold rounded-lg shadow-md border border-emerald-200 transition"
                    >
                        {t('legal.terms.asideHome')}
                    </Link>
                </div>
            </aside>
        </article>
    );
};

export default TermsAndConditions;
