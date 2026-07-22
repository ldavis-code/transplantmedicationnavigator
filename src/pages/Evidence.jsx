/**
 * Evidence page: peer-reviewed research making the case for medication and
 * financial navigation across the transplant journey. Fully bilingual —
 * cited by the home page story, For Hospitals page, About page, and footer.
 * Academic citations stay in English (the papers are English-language).
 */

import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { BookOpen, TrendingUp, AlertTriangle, Pill, ClipboardCheck, CheckCircle, ArrowRight, Mail, Building2, HeartPulse, Scale, FileSearch } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';
import LanguageToggle from '../components/LanguageToggle.jsx';

const Evidence = () => {
    const { t } = useTranslation();
    useMetaTags(seoMetadata.evidence);

    const burdenStats = [
        { stat: '23.3%', label: t('evidence.burden.stat1') },
        { stat: '27.6%', label: t('evidence.burden.stat2') },
        { stat: '66.4%', label: t('evidence.burden.stat3') },
        { stat: '29%', label: t('evidence.burden.stat4') },
        { stat: '72.9%', label: t('evidence.burden.stat5') },
        { stat: '38.3%', label: t('evidence.burden.stat6') }
    ];

    const oddsRatios = [
        { outcome: t('evidence.odds.row1'), odds: '6.1×' },
        { outcome: t('evidence.odds.row2'), odds: '4.8×' },
        { outcome: t('evidence.odds.row3'), odds: '4.8×' },
        { outcome: t('evidence.odds.row4'), odds: '4.7×' },
        { outcome: t('evidence.odds.row5'), odds: '4.6×' },
        { outcome: t('evidence.odds.row6'), odds: '4.0×' },
        { outcome: t('evidence.odds.row7'), odds: '2.9×' }
    ];

    const tmnStrategies = [
        { icon: Building2, title: t('evidence.tmn.s1Title'), description: t('evidence.tmn.s1Text') },
        { icon: Scale, title: t('evidence.tmn.s2Title'), description: t('evidence.tmn.s2Text') },
        { icon: ClipboardCheck, title: t('evidence.tmn.s3Title'), description: t('evidence.tmn.s3Text') },
        { icon: HeartPulse, title: t('evidence.tmn.s4Title'), description: t('evidence.tmn.s4Text') }
    ];

    return (
        <article className="max-w-5xl mx-auto space-y-12 pb-12">
            {/* Hero */}
            <header className="text-center py-8 md:py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                    <BookOpen size={32} className="text-emerald-700" aria-hidden="true" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                    {t('evidence.hero.title')}
                </h1>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                    {t('evidence.hero.intro')}
                </p>
                <div className="mt-6 flex justify-center">
                    <LanguageToggle />
                </div>
            </header>

            {/* Study 1: Financial burden in liver transplant candidates */}
            <section className="bg-white border-2 border-slate-200 rounded-2xl p-8 md:p-10 shadow-sm" aria-labelledby="burden-heading">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <AlertTriangle size={24} />
                    </div>
                    <h2 id="burden-heading" className="text-xl md:text-2xl font-extrabold text-slate-900">
                        {t('evidence.burden.title')}
                    </h2>
                </div>
                <p className="text-slate-700 leading-relaxed mb-8">
                    <Trans i18nKey="evidence.burden.intro" components={{ em: <em /> }} />
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {burdenStats.map((item, index) => (
                        <div key={index} className="bg-rose-50 border border-rose-100 rounded-xl p-5 text-center">
                            <div className="text-3xl font-extrabold text-rose-700 mb-2">{item.stat}</div>
                            <p className="text-slate-700 text-sm leading-relaxed">{item.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Adjusted odds table */}
            <section className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl p-8 md:p-10" aria-labelledby="odds-heading">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <TrendingUp size={24} />
                    </div>
                    <h2 id="odds-heading" className="text-xl md:text-2xl font-extrabold text-slate-900">
                        {t('evidence.odds.title')}
                    </h2>
                </div>
                <p className="text-slate-700 leading-relaxed mb-6">
                    {t('evidence.odds.intro')}
                </p>
                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                    <table className="w-full text-left">
                        <caption className="sr-only">{t('evidence.odds.caption')}</caption>
                        <thead>
                            <tr className="border-b-2 border-slate-200 bg-slate-50">
                                <th scope="col" className="px-5 py-3 text-sm font-bold text-slate-700 uppercase tracking-wide">{t('evidence.odds.colOutcome')}</th>
                                <th scope="col" className="px-5 py-3 text-sm font-bold text-slate-700 uppercase tracking-wide text-right whitespace-nowrap">{t('evidence.odds.colOdds')}<span className="hidden sm:inline">{t('evidence.odds.colOddsQualifier')}</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {oddsRatios.map((row, index) => (
                                <tr key={index} className={index < oddsRatios.length - 1 ? 'border-b border-slate-100' : ''}>
                                    <td className="px-5 py-3 text-slate-700">{row.outcome}</td>
                                    <td className="px-5 py-3 text-right font-extrabold text-rose-700 text-lg whitespace-nowrap">{row.odds}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-slate-700 leading-relaxed mt-6">
                    {t('evidence.odds.work')}
                </p>
            </section>

            {/* Study 2: AST survey — post-transplant cost nonadherence */}
            <section className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-8 md:p-10 shadow-md" aria-labelledby="graft-heading">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Pill size={24} />
                    </div>
                    <h2 id="graft-heading" className="text-xl md:text-2xl font-extrabold text-slate-900">
                        {t('evidence.graft.title')}
                    </h2>
                </div>
                <p className="text-slate-800 leading-relaxed mb-6">
                    <Trans i18nKey="evidence.graft.intro" components={{ em: <em /> }} />
                </p>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-xl border border-amber-200 p-6 text-center">
                        <div className="text-4xl font-extrabold text-amber-700 mb-2">{t('evidence.graft.stat1Value')}</div>
                        <p className="text-slate-700 leading-relaxed">{t('evidence.graft.stat1Label')}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-amber-200 p-6 text-center">
                        <div className="text-4xl font-extrabold text-amber-700 mb-2">{t('evidence.graft.stat2Value')}</div>
                        <p className="text-slate-700 leading-relaxed">{t('evidence.graft.stat2Label')}</p>
                    </div>
                </div>
                <p className="text-slate-800 leading-relaxed mb-4">
                    {t('evidence.graft.p1')}
                </p>
                <p className="text-slate-800 leading-relaxed font-medium">
                    {t('evidence.graft.p2')}
                </p>
            </section>

            {/* The gap: screening without a strategy */}
            <section className="bg-white border-2 border-slate-200 rounded-2xl p-8 md:p-10" aria-labelledby="gap-heading">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <FileSearch size={24} />
                    </div>
                    <h2 id="gap-heading" className="text-xl md:text-2xl font-extrabold text-slate-900">
                        {t('evidence.gap.title')}
                    </h2>
                </div>
                <blockquote className="border-l-4 border-blue-300 pl-6 py-2 mb-5">
                    <p className="text-slate-800 text-lg leading-relaxed italic">
                        <Trans i18nKey="evidence.gap.quote" components={{ strong: <strong className="text-slate-900" /> }} />
                    </p>
                </blockquote>
                <p className="text-slate-700 leading-relaxed">
                    <Trans i18nKey="evidence.gap.text" components={{ em: <em /> }} />
                </p>
            </section>

            {/* TMN as the targeted strategy */}
            <section className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-8 md:p-10" aria-labelledby="tmn-heading">
                <h2 id="tmn-heading" className="text-2xl font-bold text-white mb-2 text-center">
                    {t('evidence.tmn.title')}
                </h2>
                <p className="text-emerald-200 text-center mb-8 max-w-2xl mx-auto">
                    {t('evidence.tmn.intro')}
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    {tmnStrategies.map((item, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="flex items-center gap-3 mb-3">
                                <item.icon size={22} className="text-emerald-300 flex-shrink-0" aria-hidden="true" />
                                <h3 className="font-bold text-white">{item.title}</h3>
                            </div>
                            <p className="text-emerald-100 text-sm leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why now: IOTA and value-based accountability */}
            <section className="bg-gradient-to-br from-rose-50 to-red-50 border-2 border-rose-300 rounded-2xl p-8 md:p-10 shadow-md" aria-labelledby="whynow-heading">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Building2 size={24} />
                    </div>
                    <h2 id="whynow-heading" className="text-xl md:text-2xl font-extrabold text-slate-900">
                        {t('evidence.whyNow.title')}
                    </h2>
                </div>
                <p className="text-slate-800 leading-relaxed mb-4">
                    {t('evidence.whyNow.p1')}
                </p>
                <p className="text-slate-800 leading-relaxed font-semibold mb-6">
                    {t('evidence.whyNow.p2')}
                </p>
                <div className="bg-white rounded-xl border border-rose-200 p-5 mb-6">
                    <p className="text-slate-600 text-sm leading-relaxed">
                        <strong className="text-slate-700">{t('evidence.whyNow.scopeLabel')}</strong>{t('evidence.whyNow.scopeText')}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link
                        to="/for-hospitals"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        {t('evidence.whyNow.ctaPrograms')}
                        <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                    <a
                        href="mailto:info@transplantmedicationnavigator.com?subject=Evidence%20Briefing%20Request"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-sm border-2 border-slate-200 hover:border-slate-300 transition"
                    >
                        <Mail size={18} aria-hidden="true" />
                        {t('evidence.whyNow.ctaBriefing')}
                    </a>
                </div>
            </section>

            {/* Patient cross-link */}
            <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 md:p-8 text-center" aria-labelledby="patient-heading">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <CheckCircle size={22} className="text-emerald-700" aria-hidden="true" />
                    <h2 id="patient-heading" className="text-lg font-bold text-emerald-900">{t('evidence.patient.title')}</h2>
                </div>
                <p className="text-emerald-800 mb-2 max-w-2xl mx-auto">
                    {t('evidence.patient.p1')}
                </p>
                <p className="text-emerald-800 mb-4 max-w-2xl mx-auto">
                    {t('evidence.patient.p2')}
                </p>
                <Link
                    to="/wizard"
                    className="inline-flex items-center gap-2 text-emerald-700 font-bold hover:underline"
                >
                    {t('evidence.patient.cta')}
                    <ArrowRight size={16} aria-hidden="true" />
                </Link>
            </section>

            {/* Sources (citations stay in English — the papers are English-language) */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8" aria-labelledby="sources-heading">
                <h2 id="sources-heading" className="text-lg font-bold text-slate-900 mb-4">{t('evidence.sources.title')}</h2>
                <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 leading-relaxed">
                    <li>
                        Aby ES, Hundt M, Rice J, et al. Financial burden among liver transplant candidates is associated with financial distress and work impairment: A U.S. multicenter study. <em>Hepatology Communications.</em> 2026;10:e0985.{' '}
                        <a
                            href="https://doi.org/10.1097/HC9.0000000000000985"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 underline font-medium"
                        >
                            doi:10.1097/HC9.0000000000000985
                        </a>{' '}
                        {t('evidence.sources.openAccess')}
                        {t('evidence.sources.study1Summary') && (
                            <p className="mt-1 text-slate-500 italic">{t('evidence.sources.study1Summary')}</p>
                        )}
                    </li>
                    <li>
                        Taber DJ, Gordon EJ, Myaskovsky L, et al. Therapeutic needs in solid organ transplant recipients: The American Society of Transplantation patient survey. <em>American Journal of Transplantation.</em> 2025;25:2565–2577.{' '}
                        <a
                            href="https://doi.org/10.1016/j.ajt.2025.07.2474"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 underline font-medium"
                        >
                            doi:10.1016/j.ajt.2025.07.2474
                        </a>{' '}
                        (PMID: 40744428)
                        {t('evidence.sources.study2Summary') && (
                            <p className="mt-1 text-slate-500 italic">{t('evidence.sources.study2Summary')}</p>
                        )}
                    </li>
                </ol>
                <p className="text-slate-400 text-xs mt-6 italic">
                    {t('evidence.sources.disclaimer')}
                </p>
            </section>
        </article>
    );
};

export default Evidence;
