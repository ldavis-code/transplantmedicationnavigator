/**
 * About page: the full founder story, credentials, and published research.
 * Moved off the home page to keep it focused; the home page links here.
 * Fully bilingual — publication titles stay in English (as published), with
 * a Spanish note explaining why.
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Heart, Award, BookOpen, CheckCircle, Star, ExternalLink } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags';
import { seoMetadata } from '../data/seo-metadata';

// Publication titles are proper titles of English-language works; the
// surrounding labels and venue lines are translated via the locale files.
const PUBLICATIONS = [
    { title: 'Enhancing Care in Alcohol-Associated Liver Disease Through Peer Support for Alcohol Use Disorder', venueKey: 'about.pub1Venue', badgeKey: 'about.badgePeer', badge: 'peer', ids: 'PMID: 41543482 · DOI: 10.1097/HC9.0000000000000843' },
    { title: 'Fight Songs: Why Transplant Patients Battling for Life Deserve Positive Anthems, Too', venueKey: 'about.pub2Venue', badgeKey: 'about.badgePeer', badge: 'peer', ids: 'DOI: 10.1097/LVT.0000000000000852' },
    { title: 'How the Cause of Liver Failure Shapes the Post-Transplant Journey: Patient-Reported Outcomes Across Etiologic Categories', venueKey: 'about.pub3Venue', badgeKey: 'about.badgeDistinction', badge: 'distinction' },
    { title: 'How Can Gen AI Empower Liver Patients?', venueKey: 'about.pub4Venue', badgeKey: 'about.badgeDistinction', badge: 'distinction' },
    { title: 'Mental Health Needs of Patients Seeking Support Through TRIO', venueKey: 'about.pub5Venue', badgeKey: 'about.badgePoster', badge: 'poster' },
    { title: 'Value of Educational Components of a Peer-to-Peer Mentoring Program: A TRIO Study', venueKey: 'about.pub6Venue', badgeKey: 'about.badgePoster', badge: 'poster' },
    { title: 'Do Social Determinants of Health Contribute to Inactivation of Adult Kidney Candidates?', venueKey: 'about.pub7Venue', badgeKey: 'about.badgeWtc', badge: 'wtc' },
];

const BADGE_STYLES = {
    peer: 'bg-emerald-100 text-emerald-800',
    distinction: 'bg-amber-100 text-amber-800',
    poster: 'bg-slate-100 text-slate-700',
    wtc: 'bg-blue-100 text-blue-800',
};

const About = () => {
    useMetaTags(seoMetadata.about || seoMetadata.home);
    const { t, i18n } = useTranslation();
    const isSpanish = i18n.resolvedLanguage === 'es';
    const credentials = t('about.credentials', { returnObjects: true });

    return (
        <article className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <Link to="/" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium">
                <ArrowLeft size={18} aria-hidden="true" /> {t('about.back')}
            </Link>

            <section className="bg-gradient-to-br from-slate-50 to-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 md:p-8" aria-labelledby="about-founder-heading">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-100 p-2 rounded-lg" aria-hidden="true">
                        <Heart size={24} className="text-emerald-600"/>
                    </div>
                    <h1 id="about-founder-heading" className="text-2xl md:text-3xl font-bold text-slate-900">
                        {t('about.heading')}
                    </h1>
                </div>

                {/* Founder Bio */}
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-8">
                    <img
                        src="/photos/lorrinda-gray-davis.jpg"
                        alt={t('about.photoAlt')}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-emerald-200 shadow-lg flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-1">{t('about.name')}</h2>
                        <p className="text-emerald-700 font-medium text-sm mb-3">
                            {t('about.role')}
                        </p>
                        <p className="text-slate-700 leading-relaxed mb-3">
                            {t('about.bio1')}
                        </p>
                        <p className="text-slate-700 leading-relaxed mb-3">
                            {t('about.bio2')}
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                            {t('about.bio3')}
                        </p>
                    </div>
                </div>

                {/* Impact Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    <div className="bg-white/80 rounded-xl p-4 text-center border border-emerald-100">
                        <p className="text-2xl md:text-3xl font-extrabold text-emerald-700">2018</p>
                        <p className="text-xs md:text-sm text-slate-600 font-medium">{t('about.stat1Label')}</p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 text-center border border-emerald-100">
                        <p className="text-2xl md:text-3xl font-extrabold text-emerald-700">550+</p>
                        <p className="text-xs md:text-sm text-slate-600 font-medium">{t('about.stat2Label')}</p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 text-center border border-emerald-100">
                        <p className="text-2xl md:text-3xl font-extrabold text-emerald-700">183</p>
                        <p className="text-xs md:text-sm text-slate-600 font-medium">{t('about.stat3Label')}</p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 text-center border border-emerald-100">
                        <p className="text-2xl md:text-3xl font-extrabold text-emerald-700">7</p>
                        <p className="text-xs md:text-sm text-slate-600 font-medium">{t('about.stat4Label')}</p>
                    </div>
                </div>

                {/* Credentials & Roles */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <Award size={18} className="text-emerald-600" aria-hidden="true" />
                        <h2 className="text-base md:text-lg font-bold text-slate-900">{t('about.credsTitle')}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {credentials.map((credential) => (
                            <span key={credential} className="inline-flex items-center gap-1.5 bg-white border border-emerald-200 text-slate-700 text-xs md:text-sm font-medium px-3 py-1.5 rounded-full">
                                <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" aria-hidden="true" />
                                {credential}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Published Research & Presentations */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BookOpen size={18} className="text-emerald-600" aria-hidden="true" />
                        <h2 className="text-base md:text-lg font-bold text-slate-900">{t('about.pubsTitle')}</h2>
                    </div>
                    {isSpanish && (
                        <p className="text-slate-500 text-xs mb-4">{t('about.pubsNote')}</p>
                    )}
                    <div className="space-y-4 mt-4">
                        {PUBLICATIONS.map((pub) => (
                            <div key={pub.title} className="bg-white/80 border border-emerald-100 rounded-xl p-4">
                                <span className={`inline-flex items-center gap-1 ${BADGE_STYLES[pub.badge]} text-xs font-bold px-2 py-0.5 rounded mb-2`}>
                                    {pub.badge === 'distinction' && <Star size={12} aria-hidden="true" />}
                                    {t(pub.badgeKey)}
                                </span>
                                <p className="text-slate-900 font-semibold text-sm leading-snug mb-1" lang="en">
                                    {pub.title}
                                </p>
                                <p className="text-slate-500 text-xs leading-relaxed">
                                    {t(pub.venueKey)}
                                </p>
                                {pub.ids && (
                                    <p className="text-slate-400 text-xs mt-1">
                                        {pub.ids}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Independent research backing the mission */}
                <div className="mt-6 bg-white/80 border border-emerald-100 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={18} className="text-emerald-600" aria-hidden="true" />
                        <h2 className="text-base md:text-lg font-bold text-slate-900">{t('about.whyTitle')}</h2>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed mb-3">
                        {t('about.whyText')}
                    </p>
                    <Link to="/evidence" className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline text-sm">
                        {t('about.evidenceLink')} <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                </div>

                <div className="mt-6 text-center">
                    <a href="https://www.lorrindagraydavis.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold underline">
                        {t('about.learnMore')} <ExternalLink size={14} aria-hidden="true" />
                    </a>
                </div>
            </section>
        </article>
    );
};

export default About;
