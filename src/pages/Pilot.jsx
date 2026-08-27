import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartHandshake, Search, Map, Building2, ShieldCheck } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';

// Partner configuration - add new partners here. Partner and health-system
// names are proper nouns and stay as-is in both languages; every sentence
// around them renders through t().
const PARTNER_CONFIG = {
    methodist: {
        name: 'Methodist Health System',
        displayName: 'Methodist',
    },
    duke: {
        name: 'Duke Transplant Center',
        displayName: 'Duke',
    },
    mayo: {
        name: 'Mayo Clinic',
        displayName: 'Mayo Clinic',
    },
};

const Pilot = () => {
    const { t } = useTranslation();
    const { partner } = useParams();

    // Get partner config; unknown partners fall back to the generic copy
    const partnerConfig = PARTNER_CONFIG[partner?.toLowerCase()] || null;
    const isGenericPilot = !partnerConfig;

    useMetaTags(seoMetadata.pilot);

    // Track page view with partner tag
    useEffect(() => {
        // Send page_view event with partner tag for analytics
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'page_view', {
                page_title: partnerConfig ? `Pilot - ${partnerConfig.name}` : 'Pilot Landing',
                page_location: window.location.href,
                partner_tag: partner || 'generic',
                pilot_partner: partnerConfig ? partnerConfig.name : 'Partner'
            });
        }
    }, [partner, partnerConfig]);

    return (
        <article className="max-w-4xl mx-auto space-y-10 pb-12">
            {/* Hero Section */}
            <header className="text-center py-8 md:py-12">
                {!isGenericPilot && (
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <Building2 size={16} aria-hidden="true" />
                        {t('pilot.partnerProgram', { name: partnerConfig.name })}
                    </div>
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                    <HeartHandshake size={32} className="text-emerald-700" aria-hidden="true" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                    {isGenericPilot
                        ? t('pilot.welcomeGeneric')
                        : t('pilot.welcomePartner', { name: partnerConfig.displayName })}
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    {isGenericPilot
                        ? t('pilot.heroGeneric')
                        : t('pilot.heroPartner', { name: partnerConfig.displayName })}
                </p>
            </header>

            {/* Main CTAs */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">{t('pilot.getStarted')}</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link
                        to="/medications"
                        className="flex flex-col items-center text-center p-6 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition group"
                    >
                        <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-700 transition">
                            <Search size={24} aria-hidden="true" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('pilot.ctaSearchTitle')}</h3>
                        <p className="text-slate-600 text-sm">{t('pilot.ctaSearchText')}</p>
                    </Link>
                    <Link
                        to="/wizard"
                        className="flex flex-col items-center text-center p-6 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition group"
                    >
                        <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-700 transition">
                            <Map size={24} aria-hidden="true" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('pilot.ctaQuizTitle')}</h3>
                        <p className="text-slate-600 text-sm">{t('pilot.ctaQuizText')}</p>
                    </Link>
                    <Link
                        to="/application-help"
                        className="flex flex-col items-center text-center p-6 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition group"
                    >
                        <div className="w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-700 transition">
                            <HeartHandshake size={24} aria-hidden="true" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('pilot.ctaGrantsTitle')}</h3>
                        <p className="text-slate-600 text-sm">{t('pilot.ctaGrantsText')}</p>
                    </Link>
                </div>
            </section>

            {/* What This Site Does */}
            <section className="bg-slate-50 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">{t('pilot.whatTitle')}</h2>
                <ul className="space-y-3">
                    {['what1', 'what2', 'what3', 'what4', 'what5'].map((key) => (
                        <li key={key} className="flex items-start gap-3">
                            <ShieldCheck size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <span className="text-slate-700">{t(`pilot.${key}`)}</span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Trust Indicators */}
            <section className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                    <p className="font-bold text-emerald-700 text-lg">{t('pilot.trustFreeTitle')}</p>
                    <p className="text-slate-600 text-sm">{t('pilot.trustFreeText')}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                    <p className="font-bold text-emerald-700 text-lg">{t('pilot.trustLoginTitle')}</p>
                    <p className="text-slate-600 text-sm">{t('pilot.trustLoginText')}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                    <p className="font-bold text-emerald-700 text-lg">{t('pilot.trustPrivacyTitle')}</p>
                    <p className="text-slate-600 text-sm">{t('pilot.trustPrivacyText')}</p>
                </div>
            </section>

            {/* Safety Note */}
            <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                <p className="text-amber-800 font-medium">
                    <strong>{t('pilot.safetyLabel')}</strong> {t('pilot.safetyText')}
                </p>
            </section>

            {/* About Section */}
            <section className="text-center py-4">
                <p className="text-slate-600 text-sm">
                    {t('pilot.aboutText')}
                </p>
                <Link to="/" className="text-emerald-700 font-medium hover:underline text-sm mt-2 inline-block">
                    {t('pilot.aboutLink')}
                </Link>
            </section>
        </article>
    );
};

export default Pilot;
