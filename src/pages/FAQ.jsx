import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { Info, ChevronDown, Shield, CheckCircle2, XCircle, HelpCircle, ArrowRight, ArrowLeft, Lightbulb, Search, X, Sparkles } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';
import LanguageToggle from '../components/LanguageToggle.jsx';
import FAQS_EN from '../data/faqs.json';
import FAQS_ES from '../data/faqs.es.json';

// Non-translatable flags per COB quiz outcome; the matching strings
// (title, primary, secondary, summary, tips) live in locales/*.json
// under faq.cob.results.<key>.
const COB_FLAGS = {
    medicare_employer_working: { copayCards: true, paps: true },
    medicare_retiree: { copayCards: false, paps: true },
    medicare_medicaid: { copayCards: false, paps: true },
    esrd_employer: { copayCards: true, paps: true },
    not_sure: { copayCards: null, paps: true }
};

// Health-Literate COB Quiz Component
const COBQuiz = () => {
    const { t } = useTranslation();
    const [step, setStep] = useState('start'); // start, question1, question2, result
    const [hasTwoPlans, setHasTwoPlans] = useState(null);
    const [situation, setSituation] = useState(null);

    const resetQuiz = () => {
        setStep('start');
        setHasTwoPlans(null);
        setSituation(null);
    };

    const result = situation
        ? { ...COB_FLAGS[situation], ...t(`faq.cob.results.${situation}`, { returnObjects: true }) }
        : null;

    // Start screen
    if (step === 'start') {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                        <Shield size={32} className="text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{t('faq.cob.start.title')}</h3>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto">
                        {t('faq.cob.start.subtitle')}
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex gap-3">
                        <Lightbulb size={24} className="text-blue-600 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-blue-900 mb-2">{t('faq.cob.start.whyTitle')}</p>
                            <p className="text-blue-800">
                                {t('faq.cob.start.whyText')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-5">
                    <p className="font-semibold text-slate-800 mb-3">{t('faq.cob.start.reasonsTitle')}</p>
                    <ul className="space-y-2 text-slate-700">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span><Trans i18nKey="faq.cob.start.reasons.kidney" /></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span><Trans i18nKey="faq.cob.start.reasons.disability" /></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span><Trans i18nKey="faq.cob.start.reasons.working" /></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span><Trans i18nKey="faq.cob.start.reasons.spouse" /></span>
                        </li>
                    </ul>
                </div>

                <button
                    onClick={() => setStep('question1')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all text-lg"
                >
                    {t('faq.cob.start.startButton')}
                    <ArrowRight size={20} />
                </button>
                <p className="text-center text-sm text-slate-500">{t('faq.cob.start.duration')}</p>
            </div>
        );
    }

    // Question 1: Do you have two plans?
    if (step === 'question1') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{t('faq.cob.progress', { current: 1, total: 2 })}</span>
                    <span>{t('faq.cob.questionLabel', { number: 1 })}</span>
                </div>

                <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {t('faq.cob.question1.title')}
                    </h3>
                    <p className="text-slate-600">
                        {t('faq.cob.question1.subtitle')}
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => { setHasTwoPlans(true); setStep('question2'); }}
                        className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                            <div>
                                <div className="font-semibold text-lg text-slate-900">{t('faq.cob.question1.yes')}</div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => { setHasTwoPlans(false); setSituation(null); setStep('result'); }}
                        className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                            <div>
                                <div className="font-semibold text-lg text-slate-900">{t('faq.cob.question1.no')}</div>
                            </div>
                        </div>
                    </button>
                </div>

                <button
                    onClick={resetQuiz}
                    className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 font-medium"
                >
                    <ArrowLeft size={18} />
                    {t('faq.cob.question1.startOver')}
                </button>
            </div>
        );
    }

    // Question 2: What's your situation?
    if (step === 'question2') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{t('faq.cob.progress', { current: 2, total: 2 })}</span>
                    <span>{t('faq.cob.questionLabel', { number: 2 })}</span>
                </div>

                <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {t('faq.cob.question2.title')}
                    </h3>
                    <p className="text-slate-600">
                        {t('faq.cob.question2.subtitle')}
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => { setSituation('medicare_employer_working'); setStep('result'); }}
                        className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                    >
                        <div className="font-semibold text-slate-900">{t('faq.cob.question2.options.medicare_employer_working.label')}</div>
                        <div className="text-slate-600 text-sm mt-1">{t('faq.cob.question2.options.medicare_employer_working.detail')}</div>
                    </button>

                    <button
                        onClick={() => { setSituation('medicare_retiree'); setStep('result'); }}
                        className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                    >
                        <div className="font-semibold text-slate-900">{t('faq.cob.question2.options.medicare_retiree.label')}</div>
                        <div className="text-slate-600 text-sm mt-1">{t('faq.cob.question2.options.medicare_retiree.detail')}</div>
                    </button>

                    <button
                        onClick={() => { setSituation('medicare_medicaid'); setStep('result'); }}
                        className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                    >
                        <div className="font-semibold text-slate-900">{t('faq.cob.question2.options.medicare_medicaid.label')}</div>
                        <div className="text-slate-600 text-sm mt-1">{t('faq.cob.question2.options.medicare_medicaid.detail')}</div>
                    </button>

                    <button
                        onClick={() => { setSituation('esrd_employer'); setStep('result'); }}
                        className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                    >
                        <div className="font-semibold text-slate-900">{t('faq.cob.question2.options.esrd_employer.label')}</div>
                        <div className="text-slate-600 text-sm mt-1">{t('faq.cob.question2.options.esrd_employer.detail')}</div>
                    </button>

                    <button
                        onClick={() => { setSituation('not_sure'); setStep('result'); }}
                        className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all"
                    >
                        <div className="font-semibold text-slate-900">{t('faq.cob.question2.options.not_sure.label')}</div>
                        <div className="text-slate-600 text-sm mt-1">{t('faq.cob.question2.options.not_sure.detail')}</div>
                    </button>
                </div>

                <button
                    onClick={() => setStep('question1')}
                    className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 font-medium"
                >
                    <ArrowLeft size={18} />
                    {t('faq.cob.question2.goBack')}
                </button>
            </div>
        );
    }

    // Result screen
    if (step === 'result') {
        // No dual coverage
        if (!hasTwoPlans) {
            return (
                <div className="space-y-6">
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 text-center">
                        <CheckCircle2 size={48} className="mx-auto text-emerald-600 mb-3" />
                        <h3 className="text-xl font-bold text-emerald-900 mb-2">{t('faq.cob.result.onePlanTitle')}</h3>
                        <p className="text-emerald-800">
                            {t('faq.cob.result.onePlanText')}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            to="/wizard"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-center transition-all"
                        >
                            {t('faq.cob.result.findHelp')}
                        </Link>
                        <button
                            onClick={resetQuiz}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all"
                        >
                            {t('faq.cob.result.takeAgain')}
                        </button>
                    </div>
                </div>
            );
        }

        // Has dual coverage with results
        return (
            <div className="space-y-6">
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 text-center">
                    <Shield size={48} className="mx-auto text-emerald-600 mb-3" />
                    <h3 className="text-2xl font-bold text-emerald-900 mb-2">{result.title}</h3>
                </div>

                {/* Primary/Secondary display */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4">
                        <div className="text-sm font-bold text-emerald-700 mb-1">{t('faq.cob.result.paysFirst')}</div>
                        <div className="text-lg font-bold text-emerald-900">{result.primary}</div>
                    </div>
                    {result.secondary && (
                        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
                            <div className="text-sm font-bold text-slate-500 mb-1">{t('faq.cob.result.paysSecond')}</div>
                            <div className="text-lg font-bold text-slate-700">{result.secondary}</div>
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <p className="text-blue-900 leading-relaxed">{result.summary}</p>
                </div>

                {/* Can you use copay cards? */}
                <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
                    <h4 className="font-bold text-slate-900 mb-4">{t('faq.cob.result.copayQuestion')}</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className={`rounded-xl p-4 ${result.copayCards ? 'bg-green-50 border border-green-200' : result.copayCards === false ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                            <div className="flex items-center gap-3">
                                {result.copayCards ? (
                                    <CheckCircle2 size={28} className="text-green-600" />
                                ) : result.copayCards === false ? (
                                    <XCircle size={28} className="text-red-500" />
                                ) : (
                                    <HelpCircle size={28} className="text-amber-500" />
                                )}
                                <div>
                                    <div className="font-bold text-slate-800">{t('faq.cob.result.copayCards')}</div>
                                    <div className={`text-sm ${result.copayCards ? 'text-green-700' : result.copayCards === false ? 'text-red-600' : 'text-amber-600'}`}>
                                        {result.copayCards ? t('faq.cob.result.copayYes') : result.copayCards === false ? t('faq.cob.result.copayNo') : t('faq.cob.result.copayDepends')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={28} className="text-green-600" />
                                <div>
                                    <div className="font-bold text-slate-800">{t('faq.cob.result.papTitle')}</div>
                                    <div className="text-sm text-green-700">{t('faq.cob.result.papYes')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-slate-50 rounded-xl p-5">
                    <h4 className="font-bold text-slate-900 mb-3">{t('faq.cob.result.nextTitle')}</h4>
                    <ul className="space-y-2">
                        {result.tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2 text-slate-700">
                                <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        to="/wizard"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-center transition-all"
                    >
                        {t('faq.cob.result.findHelp')}
                    </Link>
                    <button
                        onClick={resetQuiz}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all"
                    >
                        {t('faq.cob.result.takeAgain')}
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

// Curated "start here" questions as [sectionIndex, questionIndex] into the
// FAQ data files. The English and Spanish files are parallel arrays, so the
// same indices point at the same question in both languages.
const STARTER_PICKS = [
    [12, 0], // I am overwhelmed. Where do I start?
    [0, 0],  // What is Transplant Med Navigator?
    [1, 0],  // What is a Patient Assistance Program (PAP)?
    [3, 0],  // What is a copay card?
    [5, 1],  // Can I use copay cards with Medicare?
];

// Accent-insensitive matching so "medicacion" finds "medicación"
const normalize = (text) =>
    (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const FAQ = () => {
    const { t, i18n } = useTranslation();
    useMetaTags(seoMetadata.faq);

    const [openIndex, setOpenIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState(null); // section index or null = all

    // FAQ content lives in the data layer with one file per language
    const faqs = i18n.resolvedLanguage === 'es' ? FAQS_ES : FAQS_EN;

    // Apply the topic filter, then the search, keeping original section indices
    const query = normalize(searchTerm.trim());
    const filteredFaqs = faqs
        .map((section, sectionIndex) => ({ ...section, sectionIndex }))
        .filter((section) => activeCategory === null || section.sectionIndex === activeCategory)
        .map((section) => ({
            ...section,
            questions: query
                ? section.questions.filter(
                    (faq) => normalize(faq.q).includes(query) || normalize(faq.a).includes(query))
                : section.questions,
        }))
        .filter((section) => section.questions.length > 0);
    const matchCount = filteredFaqs.reduce((acc, sec) => acc + sec.questions.length, 0);
    const isFiltering = query.length > 0 || activeCategory !== null;

    const starters = STARTER_PICKS
        .map(([si, qi]) => ({ faq: faqs[si]?.questions?.[qi], key: `starter-${si}-${qi}` }))
        .filter((item) => item.faq);

    // Add FAQPage structured data for AI discoverability
    useEffect(() => {
        // Flatten all FAQs for schema
        const allFaqs = faqs.flatMap(section =>
            section.questions.map(faq => ({
                '@type': 'Question',
                'name': faq.q,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': faq.a
                }
            }))
        );

        const faqSchema = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': allFaqs
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-faq-schema', 'true');
        script.textContent = JSON.stringify(faqSchema);
        document.head.appendChild(script);

        return () => {
            const existingScript = document.querySelector('script[data-faq-schema="true"]');
            if (existingScript) {
                existingScript.remove();
            }
        };
    }, [faqs]);

    const toggleQuestion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const FAQItem = ({ question, answer, index }) => {
        const isOpen = openIndex === index;
        return (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full px-6 py-4 text-left bg-white hover:bg-slate-50 transition flex items-center justify-between gap-4 min-h-[44px]"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                >
                    <span className="font-semibold text-slate-900 pr-4">{question}</span>
                    <ChevronDown
                        size={20}
                        className={`flex-shrink-0 text-emerald-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                    />
                </button>
                {isOpen && (
                    <div
                        id={`faq-answer-${index}`}
                        className="px-6 py-4 bg-slate-50 border-t border-slate-200"
                        role="region"
                    >
                        <p className="text-slate-700 leading-relaxed">{answer}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <article className="max-w-5xl mx-auto space-y-8 pb-12">
            <header className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                    <Info size={32} className="text-emerald-700" aria-hidden="true" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{t('faq.page.title')}</h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                    {t('faq.page.subtitle')}
                </p>
                <div className="mt-6 flex justify-center">
                    <LanguageToggle />
                </div>
            </header>

            {/* Coordination of Benefits Quiz Section */}
            <section className="bg-white rounded-xl shadow-sm border-2 border-emerald-200 p-6 md:p-8">
                <COBQuiz />
            </section>

            {/* Search + topic filters */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 space-y-4">
                <div className="relative">
                    <label htmlFor="faq-search" className="sr-only">{t('faq.page.searchLabel')}</label>
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                        id="faq-search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('faq.page.searchPlaceholder')}
                        className="w-full pl-12 pr-12 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label={t('faq.page.clearSearch')}
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-2" role="group" aria-label={t('faq.page.topicsAria')}>
                    <button
                        onClick={() => setActiveCategory(null)}
                        aria-pressed={activeCategory === null}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition min-h-[44px] ${
                            activeCategory === null
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        {t('faq.page.allTopics')}
                    </button>
                    {faqs.map((section, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveCategory(activeCategory === index ? null : index)}
                            aria-pressed={activeCategory === index}
                            className={`px-3 py-2 rounded-full text-sm font-medium transition min-h-[44px] ${
                                activeCategory === index
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            {section.category}
                        </button>
                    ))}
                </div>
                {query.length > 0 && (
                    <p className="text-sm text-slate-600" role="status" aria-live="polite">
                        {t('faq.page.resultsCount', { count: matchCount })}
                    </p>
                )}
            </section>

            {/* Start here — five basics, hidden while searching or filtering */}
            {!isFiltering && starters.length > 0 && (
                <section className="bg-emerald-50 rounded-xl shadow-sm border-2 border-emerald-200 p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-emerald-900 mb-2 flex items-center gap-3">
                        <Sparkles size={24} className="text-emerald-600" aria-hidden="true" />
                        {t('faq.page.startHere')}
                    </h2>
                    <p className="text-emerald-800 mb-6">{t('faq.page.startHereText')}</p>
                    <div className="space-y-3">
                        {starters.map(({ faq, key }) => (
                            <FAQItem key={key} question={faq.q} answer={faq.a} index={key} />
                        ))}
                    </div>
                </section>
            )}

            <div className="space-y-8">
                {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((section) => {
                    const sectionIndex = section.sectionIndex;
                    return (
                        <section key={sectionIndex} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <span className="w-1 h-8 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                                {section.category}
                            </h2>
                            <div className="space-y-3">
                                {section.questions.map((faq, faqIndex) => {
                                    const globalIndex = `${sectionIndex}-${faqIndex}`;
                                    return (
                                        <FAQItem
                                            key={globalIndex}
                                            question={faq.q}
                                            answer={faq.a}
                                            index={globalIndex}
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    );
                    })
                ) : isFiltering ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
                        <Search size={48} className="mx-auto text-slate-300 mb-4" aria-hidden="true" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">{t('faq.page.noResultsTitle')}</h2>
                        <p className="text-slate-600 mb-6">{t('faq.page.noResultsText')}</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveCategory(null); }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                        >
                            {t('faq.page.clearSearch')}
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
                        <Info size={48} className="mx-auto text-slate-300 mb-4" aria-hidden="true" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">{t('faq.page.emptyTitle')}</h2>
                        <p className="text-slate-600 mb-6">{t('faq.page.emptyText')}</p>
                        <Link
                            to="/education"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                        >
                            {t('faq.page.browseResources')}
                        </Link>
                    </div>
                )}
            </div>

            <aside className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 md:p-8 text-center">
                <h2 className="text-xl font-bold text-emerald-900 mb-3">{t('faq.page.stillTitle')}</h2>
                <p className="text-emerald-800 mb-6">
                    {t('faq.page.stillText')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/wizard"
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition"
                    >
                        {t('faq.page.startQuiz')}
                    </Link>
                    <Link
                        to="/education"
                        className="px-6 py-3 bg-white hover:bg-slate-50 text-emerald-700 font-bold rounded-lg shadow-md border border-emerald-200 transition"
                    >
                        {t('faq.page.browseResources')}
                    </Link>
                </div>
            </aside>
        </article>
    );
};

export default FAQ;
