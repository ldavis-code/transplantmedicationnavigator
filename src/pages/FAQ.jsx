import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Info, ChevronDown, Shield, CheckCircle2, XCircle, HelpCircle, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';
import FAQS_DATA from '../data/faqs.json';

// Health-literate COB Quiz Results
const COB_RESULTS = {
    medicare_employer_working: {
        title: 'Your Job Insurance Pays First',
        primary: 'Your employer insurance',
        secondary: 'Medicare',
        copayCards: true,
        paps: true,
        summary: 'Good news! Since you or your spouse still works, your job insurance pays first. This means you CAN use copay cards to lower your costs.',
        tips: [
            'Show your job insurance card at the pharmacy first',
            'You can use copay cards from drug makers',
            'Keep your Medicare card as backup'
        ]
    },
    medicare_retiree: {
        title: 'Medicare Pays First',
        primary: 'Medicare',
        secondary: 'Your retiree plan',
        copayCards: false,
        paps: true,
        summary: 'Since you retired, Medicare now pays first. You cannot use copay cards with Medicare. But you can still get help from Patient Assistance Programs.',
        tips: [
            'Apply for Patient Assistance Programs (PAPs) for free meds',
            'Check if foundations can help with your costs',
            'Your retiree plan helps pay what Medicare does not'
        ]
    },
    medicare_medicaid: {
        title: 'You Have Great Coverage',
        primary: 'Medicare + Medicaid',
        secondary: 'Both work together',
        copayCards: false,
        paps: true,
        summary: 'You have dual coverage. This usually means very low or no costs for your medicines. Medicaid helps pay what Medicare does not cover.',
        tips: [
            'Your copays should be very low or $0',
            'Make sure both cards are on file at your pharmacy',
            'Ask about "Extra Help" to lower costs even more'
        ]
    },
    esrd_employer: {
        title: 'Special Rules for Kidney Patients',
        primary: 'Your employer insurance (first 30 months)',
        secondary: 'Medicare',
        copayCards: true,
        paps: true,
        summary: 'Kidney patients have special rules. For the first 30 months, your job insurance pays first. After 30 months, Medicare pays first and you cannot use copay cards.',
        tips: [
            'Use copay cards now while your job insurance pays first',
            'Mark your calendar for when 30 months ends',
            'Plan ahead: apply for PAPs before Medicare takes over'
        ]
    },
    not_sure: {
        title: 'Let\'s Figure This Out',
        primary: 'We need more info',
        secondary: '',
        copayCards: null,
        paps: true,
        summary: 'Insurance rules can be tricky. The best way to know for sure is to call both insurance companies and ask: "Which plan pays first?"',
        tips: [
            'Call Medicare: 1-800-MEDICARE',
            'Call your other insurance company',
            'Ask your transplant social worker for help'
        ]
    }
};

// Health-Literate COB Quiz Component
const COBQuiz = () => {
    const [step, setStep] = useState('start'); // start, question1, question2, result
    const [hasTwoPlans, setHasTwoPlans] = useState(null);
    const [situation, setSituation] = useState(null);

    const resetQuiz = () => {
        setStep('start');
        setHasTwoPlans(null);
        setSituation(null);
    };

    const result = situation ? COB_RESULTS[situation] : null;

    // Start screen
    if (step === 'start') {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                        <Shield size={32} className="text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Do You Have Two Insurance Plans?</h3>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto">
                        Many transplant patients have more than one insurance. This quiz helps you know which one pays first.
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex gap-3">
                        <Lightbulb size={24} className="text-blue-600 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-blue-900 mb-2">Why does this matter?</p>
                            <p className="text-blue-800">
                                Which insurance pays first changes what help you can get. Some savings programs only work with certain insurance types.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-5">
                    <p className="font-semibold text-slate-800 mb-3">Common reasons transplant patients have two plans:</p>
                    <ul className="space-y-2 text-slate-700">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span><strong>Kidney disease</strong> — You may get Medicare even if you're under 65</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span><strong>Disability</strong> — After 2 years on disability, you get Medicare</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span><strong>Still working at 65+</strong> — You have Medicare AND job insurance</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span><strong>Spouse's insurance</strong> — Your spouse's job covers you too</span>
                        </li>
                    </ul>
                </div>

                <button
                    onClick={() => setStep('question1')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all text-lg"
                >
                    Start the Quiz
                    <ArrowRight size={20} />
                </button>
                <p className="text-center text-sm text-slate-500">Takes about 1 minute</p>
            </div>
        );
    }

    // Question 1: Do you have two plans?
    if (step === 'question1') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">1 of 2</span>
                    <span>Question 1</span>
                </div>

                <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Do you have more than one health insurance plan?
                    </h3>
                    <p className="text-slate-600">
                        For example: Medicare AND insurance from a job
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
                                <div className="font-semibold text-lg text-slate-900">Yes, I have two or more plans</div>
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
                                <div className="font-semibold text-lg text-slate-900">No, I have just one plan</div>
                            </div>
                        </div>
                    </button>
                </div>

                <button
                    onClick={resetQuiz}
                    className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 font-medium"
                >
                    <ArrowLeft size={18} />
                    Start over
                </button>
            </div>
        );
    }

    // Question 2: What's your situation?
    if (step === 'question2') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">2 of 2</span>
                    <span>Question 2</span>
                </div>

                <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Which best describes your situation?
                    </h3>
                    <p className="text-slate-600">
                        Pick the one that fits you best
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => { setSituation('medicare_employer_working'); setStep('result'); }}
                        className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                    >
                        <div className="font-semibold text-slate-900">I have Medicare AND job insurance</div>
                        <div className="text-slate-600 text-sm mt-1">I or my spouse still works</div>
                    </button>

                    <button
                        onClick={() => { setSituation('medicare_retiree'); setStep('result'); }}
                        className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                    >
                        <div className="font-semibold text-slate-900">I have Medicare AND retiree insurance</div>
                        <div className="text-slate-600 text-sm mt-1">I'm retired but still have coverage from my old job</div>
                    </button>

                    <button
                        onClick={() => { setSituation('medicare_medicaid'); setStep('result'); }}
                        className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                    >
                        <div className="font-semibold text-slate-900">I have Medicare AND Medicaid</div>
                        <div className="text-slate-600 text-sm mt-1">I have both government programs</div>
                    </button>

                    <button
                        onClick={() => { setSituation('esrd_employer'); setStep('result'); }}
                        className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                    >
                        <div className="font-semibold text-slate-900">I have kidney disease Medicare AND job insurance</div>
                        <div className="text-slate-600 text-sm mt-1">I got Medicare because of kidney failure (ESRD)</div>
                    </button>

                    <button
                        onClick={() => { setSituation('not_sure'); setStep('result'); }}
                        className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all"
                    >
                        <div className="font-semibold text-slate-900">I'm not sure / Something else</div>
                        <div className="text-slate-600 text-sm mt-1">My situation is different</div>
                    </button>
                </div>

                <button
                    onClick={() => setStep('question1')}
                    className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 font-medium"
                >
                    <ArrowLeft size={18} />
                    Go back
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
                        <h3 className="text-xl font-bold text-emerald-900 mb-2">You Have One Insurance Plan</h3>
                        <p className="text-emerald-800">
                            Since you have just one plan, you don't need to worry about which pays first. Use our main quiz to find help programs for your situation.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            to="/wizard"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-center transition-all"
                        >
                            Find Help Programs
                        </Link>
                        <button
                            onClick={resetQuiz}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all"
                        >
                            Take Quiz Again
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
                        <div className="text-sm font-bold text-emerald-700 mb-1">PAYS FIRST</div>
                        <div className="text-lg font-bold text-emerald-900">{result.primary}</div>
                    </div>
                    {result.secondary && (
                        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
                            <div className="text-sm font-bold text-slate-500 mb-1">PAYS SECOND</div>
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
                    <h4 className="font-bold text-slate-900 mb-4">Can you use copay cards?</h4>
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
                                    <div className="font-bold text-slate-800">Copay Cards</div>
                                    <div className={`text-sm ${result.copayCards ? 'text-green-700' : result.copayCards === false ? 'text-red-600' : 'text-amber-600'}`}>
                                        {result.copayCards ? 'Yes, you can use them!' : result.copayCards === false ? 'No, not with Medicare first' : 'It depends on your situation'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={28} className="text-green-600" />
                                <div>
                                    <div className="font-bold text-slate-800">Free Medicine Programs</div>
                                    <div className="text-sm text-green-700">Yes, you can apply for PAPs</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-slate-50 rounded-xl p-5">
                    <h4 className="font-bold text-slate-900 mb-3">What to do next:</h4>
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
                        Find Help Programs
                    </Link>
                    <button
                        onClick={resetQuiz}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all"
                    >
                        Take Quiz Again
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

const FAQ = () => {
    useMetaTags(seoMetadata.faq);

    const [openIndex, setOpenIndex] = useState(null);

    // Add FAQPage structured data for AI discoverability
    useEffect(() => {
        // Flatten all FAQs for schema
        const allFaqs = FAQS_DATA.flatMap(section =>
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
    }, []);

    const toggleQuestion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqs = FAQS_DATA;

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
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Frequently Asked Questions</h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                    Find answers to common questions about transplant medications, assistance programs, and using this site.
                </p>
            </header>

            {/* Coordination of Benefits Quiz Section */}
            <section className="bg-white rounded-xl shadow-sm border-2 border-emerald-200 p-6 md:p-8">
                <COBQuiz />
            </section>

            <div className="space-y-8">
                {faqs && faqs.length > 0 ? (
                    faqs.map((section, sectionIndex) => (
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
                    ))
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
                        <Info size={48} className="mx-auto text-slate-300 mb-4" aria-hidden="true" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">No FAQs available</h2>
                        <p className="text-slate-600 mb-6">Check back later for frequently asked questions.</p>
                        <Link
                            to="/education"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                        >
                            Browse Resources
                        </Link>
                    </div>
                )}
            </div>

            <aside className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 md:p-8 text-center">
                <h2 className="text-xl font-bold text-emerald-900 mb-3">Still have questions?</h2>
                <p className="text-emerald-800 mb-6">
                    Your transplant center's social worker or financial coordinator is your best resource for personalized guidance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/wizard"
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition"
                    >
                        Start My Path Quiz
                    </Link>
                    <Link
                        to="/education"
                        className="px-6 py-3 bg-white hover:bg-slate-50 text-emerald-700 font-bold rounded-lg shadow-md border border-emerald-200 transition"
                    >
                        Browse Resources
                    </Link>
                </div>
            </aside>
        </article>
    );
};

export default FAQ;
