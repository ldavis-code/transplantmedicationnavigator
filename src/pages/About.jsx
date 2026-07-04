/**
 * About page: the full founder story, credentials, and published research.
 * Moved off the home page to keep it focused; the home page links here.
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Award, BookOpen, CheckCircle, Star, ExternalLink } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags';
import { seoMetadata } from '../data/seo-metadata';

const About = () => {
    useMetaTags(seoMetadata.about || seoMetadata.home);

    return (
        <article className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <Link to="/" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium">
                <ArrowLeft size={18} aria-hidden="true" /> Back to home
            </Link>

            <section className="bg-gradient-to-br from-slate-50 to-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 md:p-8" aria-labelledby="about-founder-heading">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-100 p-2 rounded-lg" aria-hidden="true">
                        <Heart size={24} className="text-emerald-600"/>
                    </div>
                    <h1 id="about-founder-heading" className="text-2xl md:text-3xl font-bold text-slate-900">
                        Created by Someone Who's Been There
                    </h1>
                </div>

                {/* Founder Bio */}
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-8">
                    <img
                        src="/photos/lorrinda-gray-davis.jpg"
                        alt="Lorrinda Gray-Davis, founder of Transplant Medication Navigator"
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-emerald-200 shadow-lg flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-1">Lorrinda Gray-Davis</h2>
                        <p className="text-emerald-700 font-medium text-sm mb-3">
                            Liver cancer survivor, liver transplant recipient, and President of Transplant Recipients International Organization (TRIO)
                        </p>
                        <p className="text-slate-700 leading-relaxed mb-3">
                            Lorrinda built this tool from lived experience. She has spent seven years post-transplant turning her journey into national patient advocacy and published peer-reviewed research, and she has personally supported more than 586 patients through their transplant journeys.
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                            Participants in her daily recovery program for alcohol-associated liver disease have gone on to receive 183 life-saving transplants — outcomes published in peer-reviewed literature.
                        </p>
                    </div>
                </div>

                {/* Impact Stats */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="bg-white/80 rounded-xl p-4 text-center border border-emerald-100">
                        <p className="text-2xl md:text-3xl font-extrabold text-emerald-700">7</p>
                        <p className="text-xs md:text-sm text-slate-600 font-medium">Years Post-Transplant</p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 text-center border border-emerald-100">
                        <p className="text-2xl md:text-3xl font-extrabold text-emerald-700">183</p>
                        <p className="text-xs md:text-sm text-slate-600 font-medium">Transplants Among Program Participants</p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 text-center border border-emerald-100">
                        <p className="text-2xl md:text-3xl font-extrabold text-emerald-700">586+</p>
                        <p className="text-xs md:text-sm text-slate-600 font-medium">Patients Supported</p>
                    </div>
                </div>

                {/* Credentials & Roles */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <Award size={18} className="text-emerald-600" aria-hidden="true" />
                        <h2 className="text-base md:text-lg font-bold text-slate-900">Leadership & Recognition</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[
                            'Vice Chair, OPTN Patient Affairs Committee',
                            'President, TRIO (1,500+ members)',
                            'Harrison Fellow, Fatty Liver Foundation',
                            'AASLD Patient Advisory Group',
                            'HRSA Commendation Letter',
                            'Co-First Author, Hepatology Communications'
                        ].map((credential) => (
                            <span key={credential} className="inline-flex items-center gap-1.5 bg-white border border-emerald-200 text-slate-700 text-xs md:text-sm font-medium px-3 py-1.5 rounded-full">
                                <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" aria-hidden="true" />
                                {credential}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Published Research & Presentations */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen size={18} className="text-emerald-600" aria-hidden="true" />
                        <h2 className="text-base md:text-lg font-bold text-slate-900">Published Research & Presentations (7 Publications)</h2>
                    </div>
                    <div className="space-y-4">
                        {/* Peer-Reviewed Journal */}
                        <div className="bg-white/80 border border-emerald-100 rounded-xl p-4">
                            <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded mb-2">Peer-Reviewed Journal</span>
                            <p className="text-slate-900 font-semibold text-sm leading-snug mb-1">
                                Enhancing Care in Alcohol-Associated Liver Disease Through Peer Support for Alcohol Use Disorder
                            </p>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                Hepatology Communications, Vol. 10, Issue 2 (2026) · Co-First Author
                            </p>
                            <p className="text-slate-400 text-xs mt-1">
                                PMID: 41543482 · DOI: 10.1097/HC9.0000000000000843
                            </p>
                        </div>

                        {/* Peer-Reviewed Journal 2 */}
                        <div className="bg-white/80 border border-emerald-100 rounded-xl p-4">
                            <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded mb-2">Peer-Reviewed Journal</span>
                            <p className="text-slate-900 font-semibold text-sm leading-snug mb-1">
                                Fight Songs: Why Transplant Patients Battling for Life Deserve Positive Anthems, Too
                            </p>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                Liver Transplantation, 2026 · First Author
                            </p>
                            <p className="text-slate-400 text-xs mt-1">
                                DOI: 10.1097/LVT.0000000000000852
                            </p>
                        </div>

                        {/* Poster of Distinction 1 */}
                        <div className="bg-white/80 border border-emerald-100 rounded-xl p-4">
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded mb-2">
                                <Star size={12} aria-hidden="true" /> Poster of Distinction
                            </span>
                            <p className="text-slate-900 font-semibold text-sm leading-snug mb-1">
                                How the Cause of Liver Failure Shapes the Post-Transplant Journey: Patient-Reported Outcomes Across Etiologic Categories
                            </p>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                Hepatology, Vol. 82, S1 · AASLD The Liver Meeting 2025 (Washington, DC) · First Author
                            </p>
                        </div>

                        {/* Poster of Distinction 2 */}
                        <div className="bg-white/80 border border-emerald-100 rounded-xl p-4">
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded mb-2">
                                <Star size={12} aria-hidden="true" /> Poster of Distinction
                            </span>
                            <p className="text-slate-900 font-semibold text-sm leading-snug mb-1">
                                How Can Gen AI Empower Liver Patients?
                            </p>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                Hepatology, Vol. 82, S1 · AASLD The Liver Meeting 2025 (Washington, DC) · Co-Author
                            </p>
                        </div>

                        {/* Conference Poster 1 */}
                        <div className="bg-white/80 border border-emerald-100 rounded-xl p-4">
                            <span className="inline-block bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded mb-2">Conference Poster</span>
                            <p className="text-slate-900 font-semibold text-sm leading-snug mb-1">
                                Mental Health Needs of Patients Seeking Support Through TRIO
                            </p>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                Hepatology, Vol. 80, S1 · AASLD The Liver Meeting 2024 (San Diego, CA) · First Author
                            </p>
                        </div>

                        {/* Conference Poster 2 */}
                        <div className="bg-white/80 border border-emerald-100 rounded-xl p-4">
                            <span className="inline-block bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded mb-2">Conference Poster</span>
                            <p className="text-slate-900 font-semibold text-sm leading-snug mb-1">
                                Value of Educational Components of a Peer-to-Peer Mentoring Program: A TRIO Study
                            </p>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                Hepatology, Vol. 80, S1 · AASLD The Liver Meeting 2024 (San Diego, CA) · First Author
                            </p>
                        </div>

                        {/* World Transplant Congress */}
                        <div className="bg-white/80 border border-emerald-100 rounded-xl p-4">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded mb-2">World Transplant Congress</span>
                            <p className="text-slate-900 font-semibold text-sm leading-snug mb-1">
                                Do Social Determinants of Health Contribute to Inactivation of Adult Kidney Candidates?
                            </p>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                American Journal of Transplantation, Vol. 25, S1 · WTC 2025 (San Francisco, CA) · Co-Author
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <a href="https://www.lorrindagraydavis.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold underline">
                        Learn more about Lorrinda <ExternalLink size={14} aria-hidden="true" />
                    </a>
                </div>
            </section>
        </article>
    );
};

export default About;
