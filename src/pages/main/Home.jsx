import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import LanguageToggle from '../../components/LanguageToggle.jsx';
import { Map, Search, BookOpen, ShieldCheck, ArrowRight, Heart, Anchor, Lock, UserCheck, ShieldAlert, HeartHandshake, CheckCircle, DollarSign, ExternalLink, Building2, Phone, Pill, CreditCard, Sparkles, Download, Smartphone } from 'lucide-react';
import HOME_STATS from '../../data/home-stats.json';
import { useMetaTags } from '../../hooks/useMetaTags.js';
import { seoMetadata } from '../../data/seo-metadata.js';

// Home-page stat tiles are counted from the data files at build time
// (scripts/generate-home-stats.js regenerates home-stats.json on every
// build, so they can never go stale) instead of importing 156 KB of
// medication/program JSON into the entry bundle to show three integers.
const STAT_MEDICATIONS = HOME_STATS.medications;
const STAT_COPAY_CARDS = HOME_STATS.copayCards;
const STAT_ASSISTANCE_PROGRAMS = HOME_STATS.assistancePrograms;

// Home Page
const Home = () => {
    useMetaTags(seoMetadata.home);
    const { t, i18n } = useTranslation();
    // B2B pitch is an English-only offering — hidden in Spanish mode
    const isSpanish = i18n.resolvedLanguage === 'es';

    return (
        <article className="space-y-8">
            {/* Up-to-date Banner */}
            <Link
                to="/education"
                className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all text-center"
                aria-label={t('home.updateBanner.ariaLabel')}
            >
                <span className="inline-flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle size={18} className="flex-shrink-0" aria-hidden="true" />
                    {t('home.updateBanner.verified')}
                </span>
                <span className="hidden sm:inline text-emerald-300" aria-hidden="true">•</span>
                <span className="text-sm text-slate-700">
                    <Trans i18nKey="home.updateBanner.totalAssist" />
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                    {t('home.updateBanner.seeWhatsNew')} <ArrowRight size={14} aria-hidden="true" />
                </span>
            </Link>

            {/* Hero Section */}
            <section className="text-center max-w-4xl mx-auto py-8 md:py-12">
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
                    {t('home.hero.titlePre')}<span className="text-emerald-600">{t('home.hero.titleHighlight')}</span>
                </h1>
                <p className="text-lg md:text-xl font-medium italic text-slate-500 mb-4 tracking-wide">
                    {t('home.hero.tagline')}
                </p>
                <p className="text-lg md:text-xl font-semibold text-slate-900 mb-8 max-w-2xl mx-auto">
                    {t('home.hero.subtitle')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        to="/wizard"
                        className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-bold rounded-xl hover:border-slate-300 transition flex items-center justify-center gap-2"
                        aria-label={t('home.hero.quizAriaLabel')}
                    >
                        <Search size={20} aria-hidden="true" />
                        {t('home.hero.quizButton')}
                    </Link>
                    <Link
                        to="/education/appeals"
                        className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-3"
                        aria-label={t('home.hero.deniedAriaLabel')}
                    >
                        <ShieldAlert size={20} aria-hidden="true" />
                        <div className="text-left">
                            <span className="block">{t('home.hero.deniedTitle')}</span>
                            <span className="block text-sm font-normal opacity-90">{t('home.hero.deniedSubtitle')}</span>
                        </div>
                    </Link>
                    <Link
                        to="/application-help"
                        className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-blue-700 border-2 border-blue-200 font-bold rounded-xl hover:border-blue-300 transition flex items-center justify-center gap-2"
                        aria-label={t('home.hero.grantsAriaLabel')}
                    >
                        <HeartHandshake size={20} aria-hidden="true" />
                        {t('home.hero.grantsButton')}
                    </Link>
                </div>

                <div className="mt-6 flex justify-center">
                    <LanguageToggle />
                </div>

                {/* Stats Banner */}
                <div className="grid grid-cols-3 gap-3 md:gap-6 mt-10 max-w-3xl mx-auto">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 md:p-6 text-center border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3" aria-hidden="true">
                            <Pill size={20} className="md:hidden" />
                            <Pill size={24} className="hidden md:block" />
                        </div>
                        <div className="text-2xl md:text-4xl font-extrabold text-emerald-700">{STAT_MEDICATIONS}</div>
                        <div className="text-xs md:text-sm text-slate-600 font-medium mt-1">{t('home.stats.medications')}</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 md:p-6 text-center border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3" aria-hidden="true">
                            <HeartHandshake size={20} className="md:hidden" />
                            <HeartHandshake size={24} className="hidden md:block" />
                        </div>
                        <div className="text-2xl md:text-4xl font-extrabold text-amber-700">{STAT_ASSISTANCE_PROGRAMS}</div>
                        <div className="text-xs md:text-sm text-slate-600 font-medium mt-1">{t('home.stats.assistancePrograms')}</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 md:p-6 text-center border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3" aria-hidden="true">
                            <CreditCard size={20} className="md:hidden" />
                            <CreditCard size={24} className="hidden md:block" />
                        </div>
                        <div className="text-2xl md:text-4xl font-extrabold text-emerald-700">{STAT_COPAY_CARDS}</div>
                        <div className="text-xs md:text-sm text-slate-600 font-medium mt-1">{t('home.stats.copayCards')}</div>
                    </div>
                </div>
            </section>

            {/* Epic / MyChart Import Headline */}
            <section className="max-w-4xl mx-auto" aria-labelledby="mychart-heading">
                <Link
                    to="/wizard"
                    className="group block rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 p-6 md:p-8 shadow-md hover:shadow-lg hover:border-emerald-400 transition-all"
                    aria-label={t('home.mychart.ariaLabel')}
                >
                    <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                        <div className="w-14 h-14 flex-shrink-0 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm" aria-hidden="true">
                            <Smartphone size={28} />
                        </div>
                        <div className="flex-grow">
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold tracking-wide text-emerald-700 uppercase mb-1">
                                <Sparkles size={13} aria-hidden="true" /> {t('home.mychart.new')}
                            </span>
                            <h2 id="mychart-heading" className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">
                                {t('home.mychart.title')}
                            </h2>
                            <p className="text-slate-600 mt-1 md:text-lg">
                                <Trans i18nKey="home.mychart.text" />
                            </p>
                        </div>
                        <span className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 group-hover:bg-emerald-700 text-white font-bold rounded-xl transition whitespace-nowrap">
                            <Download size={18} aria-hidden="true" /> {t('home.mychart.connect')}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-4 text-center sm:text-left">
                        {t('home.mychart.footnote')}
                    </p>
                </Link>
            </section>

            {/* Features Grid */}
            <section className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto" aria-label={t('home.features.ariaLabel')}>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-100 transition">
                    <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
                        <BookOpen size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{t('home.features.learn.title')}</h2>
                    <p className="text-slate-600 mb-4">
                        {t('home.features.learn.text')}
                    </p>
                    <Link to="/application-help" className="text-emerald-700 font-medium hover:underline inline-flex items-center gap-1" aria-label={t('home.features.learn.linkAriaLabel')}>
                        {t('home.features.learn.link')} <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-100 transition">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
                        <ShieldCheck size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{t('home.features.coverage.title')}</h2>
                    <p className="text-slate-600 mb-4">
                        {t('home.features.coverage.text')}
                    </p>
                    <Link to="/education" className="text-emerald-700 font-medium hover:underline inline-flex items-center gap-1" aria-label={t('home.features.coverage.linkAriaLabel')}>
                        {t('home.features.coverage.link')} <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-100 transition">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
                        <Search size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{t('home.features.resources.title')}</h2>
                    <p className="text-slate-600 mb-4">
                        {t('home.features.resources.text')}
                    </p>
                    <Link to="/education" className="text-emerald-700 font-medium hover:underline inline-flex items-center gap-1" aria-label={t('home.features.resources.linkAriaLabel')}>
                        {t('home.features.resources.link')} <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>
            </section>

            {/* Real Patient Savings Story */}
            <section className="max-w-4xl mx-auto" aria-labelledby="savings-story-heading">
                <div className="bg-gradient-to-br from-emerald-50 to-sky-50 rounded-2xl border-2 border-emerald-200 p-8 md:p-10 shadow-lg">
                    <div className="text-center mb-6">
                        <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-bold">
                            <DollarSign size={16} aria-hidden="true" />
                            {t('home.story.badge')}
                        </span>
                    </div>

                    <blockquote className="text-center">
                        <p className="text-xl md:text-2xl text-slate-800 leading-relaxed mb-6">
                            {t('home.story.quotePre')}<span className="line-through text-slate-500">{t('home.story.price1')}</span>{t('home.story.quoteMid1')}<span className="line-through text-slate-500">{t('home.story.price2')}</span>{t('home.story.quoteMid2')}<strong className="text-emerald-700">{t('home.story.price3')}</strong>{t('home.story.quotePost')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-6">
                            <div className="bg-white rounded-xl px-6 py-4 shadow-sm border border-emerald-100">
                                <div className="text-3xl font-extrabold text-emerald-600">$2,220</div>
                                <div className="text-sm text-slate-600 font-medium">{t('home.story.savedLabel')}</div>
                            </div>
                            <div className="text-slate-600 text-sm max-w-xs">
                                {t('home.story.why')}
                            </div>
                        </div>
                    </blockquote>

                    {/* Evidence callout: leads with the problem the research documents */}
                    <div className="mt-8 pt-6 border-t border-emerald-200 text-center">
                        <p className="text-slate-800 font-semibold mb-1">{t('home.story.notAloneTitle')}</p>
                        <p className="text-slate-600 text-sm max-w-2xl mx-auto mb-3">{t('home.story.notAloneText')}</p>
                        <Link to="/evidence" className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline">
                            {t('home.story.evidenceLink')} <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* For Hospitals & Transplant Centers (English-only B2B offering) */}
            {!isSpanish && (
            <section className="max-w-5xl mx-auto" aria-labelledby="for-hospitals-heading">
                <div className="rounded-2xl bg-slate-900 text-white p-8 md:p-10 shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex-grow">
                            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-emerald-300 uppercase mb-2">
                                <Building2 size={14} aria-hidden="true" /> {t('home.hospitals.eyebrow')}
                            </span>
                            <h2 id="for-hospitals-heading" className="text-2xl md:text-3xl font-extrabold leading-tight mb-3">
                                {t('home.hospitals.title')}
                            </h2>
                            <p className="text-slate-300 md:text-lg mb-4 max-w-2xl">
                                {t('home.hospitals.text')}
                            </p>
                            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-200">
                                <li className="inline-flex items-center gap-1.5"><CheckCircle size={16} className="text-emerald-400 flex-shrink-0" aria-hidden="true" /> {t('home.hospitals.feature1')}</li>
                                <li className="inline-flex items-center gap-1.5"><CheckCircle size={16} className="text-emerald-400 flex-shrink-0" aria-hidden="true" /> {t('home.hospitals.feature2')}</li>
                                <li className="inline-flex items-center gap-1.5"><CheckCircle size={16} className="text-emerald-400 flex-shrink-0" aria-hidden="true" /> {t('home.hospitals.feature3')}</li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-3 flex-shrink-0 w-full md:w-auto">
                            <Link
                                to="/for-hospitals"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition whitespace-nowrap"
                            >
                                {t('home.hospitals.demo')} <ArrowRight size={18} aria-hidden="true" />
                            </Link>
                            <Link
                                to="/pilot"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border-2 border-slate-600 hover:border-slate-400 text-white font-bold rounded-xl transition whitespace-nowrap"
                            >
                                {t('home.hospitals.pilot')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            )}

            {/* Mission & Vision Section */}
            <section className="max-w-5xl mx-auto" aria-labelledby="mission-heading">
                <div className="bg-gradient-to-br from-emerald-50 to-sky-50 rounded-2xl border-2 border-emerald-200 shadow-lg overflow-hidden">

                    {/* Centered Badge Header */}
                    <div className="pt-8 pb-2 text-center">
                        <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-bold">
                            <UserCheck size={16} aria-hidden="true" />
                            {t('home.mission.badge')}
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true"><Anchor size={24}/></div>
                                <h2 id="mission-heading" className="text-2xl font-bold text-slate-900 tracking-tight">{t('home.mission.missionTitle')}</h2>
                            </div>
                            <p className="text-lg text-slate-700 leading-relaxed">
                                {t('home.mission.missionText')}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true"><Heart size={24}/></div>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('home.mission.visionTitle')}</h2>
                            </div>
                            <p className="text-lg text-slate-700 leading-relaxed">
                                {t('home.mission.visionText')}
                            </p>
                        </div>
                    </div>

                    {/* Core Values / "The Why" */}
                    <div className="border-t border-emerald-200 bg-white/50 p-8 md:p-10">
                        <h3 className="text-center font-bold text-emerald-800 uppercase tracking-wider text-sm mb-8">{t('home.mission.whyTitle')}</h3>
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div>
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3" aria-hidden="true"><BookOpen size={22}/></div>
                                <h4 className="font-bold text-slate-900 text-lg mb-2">{t('home.mission.why1Title')}</h4>
                                <p className="text-slate-600 text-sm">{t('home.mission.why1Text')}</p>
                            </div>
                            <div>
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3" aria-hidden="true"><ShieldCheck size={22}/></div>
                                <h4 className="font-bold text-slate-900 text-lg mb-2">{t('home.mission.why2Title')}</h4>
                                <p className="text-slate-600 text-sm">{t('home.mission.why2Text')}</p>
                            </div>
                            <div>
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3" aria-hidden="true"><DollarSign size={22}/></div>
                                <h4 className="font-bold text-slate-900 text-lg mb-2">{t('home.mission.why3Title')}</h4>
                                <p className="text-slate-600 text-sm">{t('home.mission.why3Text')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Start Quiz CTA */}
            <section className="text-center max-w-4xl mx-auto py-8">
                <Link
                    to="/wizard"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
                    aria-label={t('home.quizCta.ariaLabel')}
                >
                    <Map size={20} aria-hidden="true" />
                    {t('home.quizCta.button')}
                </Link>
                <p className="text-base md:text-lg text-slate-900 font-medium text-center mt-6 max-w-2xl mx-auto">
                    {t('home.quizCta.text')}
                </p>
            </section>

            {/* Created by Someone Who's Been There (condensed, full story on /about) */}
            <section className="bg-gradient-to-br from-slate-50 to-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto" aria-labelledby="founder-heading">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <img
                        src="/photos/lorrinda-gray-davis.jpg"
                        alt={t('home.founder.photoAlt')}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-emerald-200 shadow-lg flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="flex-grow text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <Heart size={20} className="text-emerald-600" aria-hidden="true" />
                            <h2 id="founder-heading" className="text-xl md:text-2xl font-bold text-slate-900">{t('home.founder.title')}</h2>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{t('home.founder.name')}</h3>
                        <p className="text-emerald-700 font-medium text-sm mb-3">{t('home.founder.role')}</p>
                        <p className="text-slate-700 leading-relaxed mb-4">{t('home.founder.bio')}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-5 mb-4">
                            <span className="text-center"><span className="block text-2xl font-extrabold text-emerald-700">2018</span><span className="text-xs text-slate-600">{t('home.founder.stat1Label')}</span></span>
                            <span className="text-center"><span className="block text-2xl font-extrabold text-emerald-700">183</span><span className="text-xs text-slate-600">{t('home.founder.stat2Label')}</span></span>
                            <span className="text-center"><span className="block text-2xl font-extrabold text-emerald-700">550+</span><span className="text-xs text-slate-600">{t('home.founder.stat3Label')}</span></span>
                        </div>
                        <Link to="/about" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold underline">
                            {t('home.founder.link')} <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Mental Health Hotline */}
            <section className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-300 rounded-2xl p-6 md:p-8 text-center max-w-3xl mx-auto mb-12" aria-labelledby="mental-health-hotline">
                <div className="bg-rose-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md" aria-hidden="true">
                    <Phone size={32} />
                </div>
                <h3 id="mental-health-hotline" className="text-2xl font-bold text-slate-900 mb-3">
                    {t('home.hotline.title')}
                </h3>
                <p className="text-slate-600 mb-4">
                    {t('home.hotline.intro')}
                </p>
                <div className="mb-4">
                    <a href="tel:988" className="inline-block text-5xl md:text-6xl font-black text-rose-600 hover:text-rose-700 transition mb-2 tracking-tight">
                        988
                    </a>
                    <p className="text-lg font-bold text-slate-700">{t('home.hotline.lifeline')}</p>
                    <p className="text-sm text-slate-600 mt-1">{t('home.hotline.availability')}</p>
                </div>
                <p className="text-sm text-slate-700 max-w-2xl mx-auto mb-6 leading-relaxed">
                    {t('home.hotline.encouragement')}
                </p>
                <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left text-sm">
                    <div className="bg-white/80 p-3 rounded-lg">
                        <p className="font-bold text-slate-900 mb-1">{t('home.hotline.callTitle')}</p>
                        <p className="text-slate-600"><Trans i18nKey="home.hotline.callText" /></p>
                    </div>
                    <div className="bg-white/80 p-3 rounded-lg">
                        <p className="font-bold text-slate-900 mb-1">{t('home.hotline.chatTitle')}</p>
                        <a href="https://988lifeline.org/chat/" target="_blank" rel="noreferrer" className="text-rose-600 font-medium hover:underline flex items-center gap-1">
                            988lifeline.org/chat <ExternalLink size={12} aria-hidden="true" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Privacy Note */}
            <section className="bg-slate-100 rounded-xl p-6 text-center max-w-2xl mx-auto mb-12" aria-labelledby="privacy-heading">
                <div className="flex justify-center mb-2 text-slate-400" aria-hidden="true"><Lock size={20}/></div>
                <h3 id="privacy-heading" className="font-bold text-slate-800 mb-2">{t('home.privacy.title')}</h3>
                <p className="text-slate-600 text-sm">
                    {t('home.privacy.text')}
                </p>
            </section>

            {/* Built by Patient Tagline */}
            <p className="text-center text-slate-500 text-sm font-medium">
                {t('home.tagline')}
            </p>
        </article>
    );
};

// Organ-specific medication data

export default Home;
