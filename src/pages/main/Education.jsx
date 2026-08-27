import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import TermTooltip from '../../components/TermTooltip.jsx';
import Coverage101 from '../../components/Coverage101.jsx';
import GenericsVsBrand from '../../components/GenericsVsBrand.jsx';
import LanguageToggle from '../../components/LanguageToggle.jsx';
import { getUiLang } from '../../lib/trackServerEvent.js';
import { Search, BookOpen, ShieldCheck, ArrowRight, Heart, ShieldAlert, HeartHandshake, CheckCircle, DollarSign, Shield, AlertTriangle, AlertCircle, ExternalLink, Globe, List, Info, Check, LandPlot, Scale, Phone, AlertOctagon, Pill, ChevronDown, HelpCircle, Users, Clock } from 'lucide-react';
import DIRECTORY_RESOURCES_DATA from '../../data/resources.json';
import DIRECTORY_RESOURCES_ES from '../../data/resources.es.json';
import STATES_DATA from '../../data/states.json';
import { useMetaTags } from '../../hooks/useMetaTags.js';
import { seoMetadata } from '../../data/seo-metadata.js';
import { trackServerEvent } from '../../lib/trackServerEvent.js';

const DIRECTORY_RESOURCES = DIRECTORY_RESOURCES_DATA;
const STATES = STATES_DATA;

const InsuranceChangeSimulator = () => {
    const { t } = useTranslation();
    const [currentInsurance, setCurrentInsurance] = useState('');
    const [futureInsurance, setFutureInsurance] = useState('');
    const [showResults, setShowResults] = useState(false);

    const insuranceTypes = [
        { id: 'commercial', label: t('education.simulator.insuranceTypes.commercial') },
        { id: 'medicare', label: t('education.simulator.insuranceTypes.medicare') },
        { id: 'medicaid', label: t('education.simulator.insuranceTypes.medicaid') },
        { id: 'marketplace', label: t('education.simulator.insuranceTypes.marketplace') },
        { id: 'uninsured', label: t('education.simulator.insuranceTypes.uninsured') },
    ];

    // Non-translatable flags per transition change; the matching strings
    // (title, timing, changes[].title/desc, action) live in locales/*.json
    // under education.simulator.transitions.<key>.
    const transitionFlags = {
        'commercial_medicare': [
            { type: 'loss', icon: '🚫' },
            { type: 'gain', icon: '✅' },
            { type: 'change', icon: '🔄' },
            { type: 'info', icon: '💡' },
            { type: 'info', icon: '📅' },
        ],
        'commercial_medicaid': [
            { type: 'loss', icon: '🚫' },
            { type: 'gain', icon: '✅' },
            { type: 'gain', icon: '✅' },
            { type: 'change', icon: '🔄' },
        ],
        'medicaid_medicare': [
            { type: 'gain', icon: '✅' },
            { type: 'info', icon: '💡' },
            { type: 'change', icon: '🔄' },
            { type: 'gain', icon: '✅' },
        ],
        'commercial_marketplace': [
            { type: 'gain', icon: '✅' },
            { type: 'gain', icon: '✅' },
            { type: 'change', icon: '🔄' },
            { type: 'info', icon: '💡' },
        ],
        'uninsured_medicare': [
            { type: 'gain', icon: '✅' },
            { type: 'gain', icon: '✅' },
            { type: 'loss', icon: '🚫' },
            { type: 'info', icon: '💡' },
        ],
        'uninsured_medicaid': [
            { type: 'gain', icon: '✅' },
            { type: 'gain', icon: '✅' },
            { type: 'change', icon: '🔄' },
        ],
        'uninsured_marketplace': [
            { type: 'gain', icon: '✅' },
            { type: 'gain', icon: '✅' },
            { type: 'gain', icon: '✅' },
            { type: 'info', icon: '💡' },
        ],
    };

    const getTransitionKey = () => {
        if (!currentInsurance || !futureInsurance || currentInsurance === futureInsurance) return null;
        return `${currentInsurance}_${futureInsurance}`;
    };

    const transitionKey = getTransitionKey();
    const flags = transitionFlags[transitionKey];
    const transition = flags
        ? (() => {
            const data = t(`education.simulator.transitions.${transitionKey}`, { returnObjects: true });
            return { ...data, changes: data.changes.map((change, i) => ({ ...change, ...flags[i] })) };
        })()
        : undefined;

    const handleSimulate = () => {
        if (currentInsurance && futureInsurance && currentInsurance !== futureInsurance) {
            setShowResults(true);
        }
    };

    return (
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 md:p-8" aria-labelledby="insurance-simulator">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-600 text-white p-2 rounded-lg">
                    <ArrowRight size={24} />
                </div>
                <div>
                    <h2 id="insurance-simulator" className="text-xl md:text-2xl font-bold text-indigo-900">{t('education.simulator.title')}</h2>
                    <p className="text-sm text-indigo-700">{t('education.simulator.subtitle')}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label htmlFor="current-insurance" className="block text-sm font-bold text-slate-700 mb-2">{t('education.simulator.currentLabel')}</label>
                    <select
                        id="current-insurance"
                        value={currentInsurance}
                        onChange={(e) => { setCurrentInsurance(e.target.value); setShowResults(false); }}
                        className="w-full p-3 rounded-lg border border-indigo-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">{t('education.simulator.selectCurrent')}</option>
                        {insuranceTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="future-insurance" className="block text-sm font-bold text-slate-700 mb-2">{t('education.simulator.futureLabel')}</label>
                    <select
                        id="future-insurance"
                        value={futureInsurance}
                        onChange={(e) => { setFutureInsurance(e.target.value); setShowResults(false); }}
                        className="w-full p-3 rounded-lg border border-indigo-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">{t('education.simulator.selectFuture')}</option>
                        {insuranceTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                </div>
            </div>

            <button
                onClick={handleSimulate}
                disabled={!currentInsurance || !futureInsurance || currentInsurance === futureInsurance}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition flex items-center justify-center gap-2"
            >
                <ArrowRight size={20} />
                {t('education.simulator.cta')}
            </button>

            {showResults && transition && (
                <div className="mt-8 space-y-6">
                    <div className="bg-white rounded-xl p-6 border border-indigo-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{transition.title}</h3>
                        <p className="text-sm text-slate-600 mb-6">{transition.timing}</p>

                        <div className="space-y-4">
                            {transition.changes.map((change, i) => (
                                <div key={i} className={`flex gap-4 p-4 rounded-lg ${
                                    change.type === 'loss' ? 'bg-red-50 border border-red-100' :
                                    change.type === 'gain' ? 'bg-green-50 border border-green-100' :
                                    change.type === 'change' ? 'bg-amber-50 border border-amber-100' :
                                    'bg-blue-50 border border-blue-100'
                                }`}>
                                    <span className="text-2xl" aria-hidden="true">{change.icon}</span>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{change.title}</h4>
                                        <p className="text-sm text-slate-700">{change.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <h4 className="font-bold text-emerald-800 mb-1">{t('education.simulator.recommendedAction')}</h4>
                            <p className="text-sm text-emerald-900">{transition.action}</p>
                        </div>
                    </div>
                </div>
            )}

            {showResults && !transition && currentInsurance !== futureInsurance && (
                <div className="mt-6 p-4 bg-slate-100 rounded-lg text-center">
                    <p className="text-slate-600">{t('education.simulator.comingSoon')}</p>
                </div>
            )}

            {currentInsurance && futureInsurance && currentInsurance === futureInsurance && (
                <p className="mt-4 text-sm text-indigo-600">{t('education.simulator.selectDifferent')}</p>
            )}
        </section>
    );
};

// Education Page
const Education = () => {
    const { t, i18n } = useTranslation();
    useMetaTags(seoMetadata.education);
    // Resource descriptions live in the data layer with one file per language
    const directoryResources = i18n.resolvedLanguage === 'es' ? DIRECTORY_RESOURCES_ES : DIRECTORY_RESOURCES;

    const [activeTab, setActiveTab] = useState(() => {
        // Allow deep-linking to a specific tab, e.g. /education?topic=EMERGENCY
        // (used by the wizard's crisis path). Falls back to the default tab.
        try {
            const valid = ['GENERICS', 'DEDUCTIBLE_TRAP', 'DIVERSION', 'DIRECTORY', 'INSURANCE', 'MENTAL', 'OOP', 'EMERGENCY'];
            const params = new URLSearchParams(window.location.search);
            const topic = (params.get('topic') || window.location.hash.replace('#', '')).toUpperCase();
            if (valid.includes(topic)) return topic;
        } catch (e) { /* ignore */ }
        // Default to the emergency tab: a patient arriving without a deep
        // link sees "Out of Meds?" first — the visitor in crisis should
        // never have to hunt. It is also the first tab in the row, so the
        // page opens with the leftmost tab active. Deep links
        // (?topic=deductible_trap etc.) still land on their own tab.
        return 'EMERGENCY';
    });
    const [selectedState, setSelectedState] = useState("");
    const [appealName, setAppealName] = useState("");
    const [appealDrug, setAppealDrug] = useState("");
    const [appealReason, setAppealReason] = useState("Financial Hardship");
    const [generatedLetter, setGeneratedLetter] = useState("");
    const [copied, setCopied] = useState(false);

    // Letter body intentionally not localized — appeal letters go to US insurers in English.
    const generateAppealLetter = () => {
        const date = new Date().toLocaleDateString();
        const text = `Date: ${date}\n\nTo Whom It May Concern:\n\nI am writing to appeal the coverage denial or specialty pharmacy requirement for my medication, ${appealDrug}. \n\nPatient Name: ${appealName}\nMedication: ${appealDrug}\n\nReason for Appeal: ${appealReason}\n\nThis medication is medically necessary for my transplant care. The current requirement creates a significant barrier to my adherence and health outcomes because ${
            appealReason === 'Financial Hardship' 
            ? 'the cost at the required pharmacy is unaffordable compared to available alternatives, putting me at risk of missing doses.' 
            : appealReason === 'Access Issues' 
            ? 'the required pharmacy cannot deliver the medication in a timely manner consistent with my medical needs.' 
            : 'I have been stable on this specific regimen from my current pharmacy and disrupting this care poses a clinical risk.'
        }\n\nPlease review this appeal and allow me to access my medication at my pharmacy of choice.\n\nSincerely,\n${appealName}`;
        setGeneratedLetter(text);
        setCopied(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLetter);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            aria-current={activeTab === id ? 'true' : undefined}
            className={`flex items-center justify-center gap-2 px-3 sm:px-5 py-3 font-bold text-sm sm:text-base transition-all border-b-4 min-h-[48px] flex-1 min-w-[calc(33.333%-2px)] sm:min-w-0 ${
                activeTab === id
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50'
                    : 'border-transparent text-slate-800 hover:text-emerald-700 hover:bg-slate-100'
            }`}
        >
            <Icon size={20} aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );

    return (
        <article className="max-w-6xl mx-auto space-y-8 pb-12">
            <header className="text-center py-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{t('education.header.title')}</h1>
                <p className="text-xl text-slate-700 max-w-3xl mx-auto">{t('education.header.subtitle')}</p>
                <div className="mt-6 flex justify-center">
                    <LanguageToggle />
                </div>
            </header>

            {/* TotalAssist Launch Announcement */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-xl flex-shrink-0" aria-hidden="true">
                        <Info size={24} />
                    </div>
                    <div>
                        <span className="inline-block bg-blue-600 text-white text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-2">{t('education.totalAssist.badge')}</span>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">{t('education.totalAssist.title')}</h2>
                        <p className="text-slate-700 text-sm leading-relaxed mb-3">
                            <Trans i18nKey="education.totalAssist.p1" />
                        </p>
                        <p className="text-slate-700 text-sm leading-relaxed mb-3">
                            <Trans i18nKey="education.totalAssist.p2" />
                        </p>
                        <p className="text-slate-700 text-sm leading-relaxed mb-3">
                            {t('education.totalAssist.applyPre')}<a href="tel:+18665123861" className="font-semibold text-blue-700 hover:text-blue-900">{t('education.totalAssist.phone')}</a>{t('education.totalAssist.applyPost')}
                        </p>
                        <a href="https://totalassist.org/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors">
                            {t('education.totalAssist.learnMore')} <ExternalLink size={14} aria-hidden="true" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Got Denied? Appeal Help Card */}
            <Link
                to="/education/appeals"
                className="block p-6 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 hover:border-rose-300 hover:shadow-md transition-all"
            >
                <div className="flex items-start gap-4">
                    <div className="bg-red-100 text-red-600 p-3 rounded-xl flex-shrink-0" aria-hidden="true">
                        <ShieldAlert size={28} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-red-600 mb-2">{t('education.gotDenied.title')}</h2>
                        <p className="text-slate-700 mb-3">
                            {t('education.gotDenied.text')}
                        </p>
                        <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                            {t('education.gotDenied.cta')} <ArrowRight size={16} aria-hidden="true" />
                        </span>
                    </div>
                </div>
            </Link>

            <nav className="bg-white rounded-xl shadow-md border border-slate-200" aria-label={t('education.tabs.ariaLabel')}>
                <div className="flex flex-wrap">
                    {/* Ordered by need, not name: emergency first, then the
                        money-literacy arc (brand vs. generic -> deductible
                        trap -> its companion OOP max -> alternative funding
                        -> insurance), mental health, and the directory as
                        the "where to go next" endpoint. */}
                    <TabButton id="EMERGENCY" label={t('education.tabs.emergency')} icon={Clock} />
                    <TabButton id="GENERICS" label={t('education.tabs.generics')} icon={Pill} />
                    <TabButton id="DEDUCTIBLE_TRAP" label={t('education.tabs.deductibleTrap')} icon={AlertTriangle} />
                    <TabButton id="OOP" label={t('education.tabs.oop')} icon={DollarSign} />
                    <TabButton id="DIVERSION" label={t('education.tabs.diversion')} icon={AlertOctagon} />
                    <TabButton id="INSURANCE" label={t('education.tabs.insurance')} icon={Shield} />
                    <TabButton id="MENTAL" label={t('education.tabs.mental')} icon={Heart} />
                    <TabButton id="DIRECTORY" label={t('education.tabs.directory')} icon={Search} />
                </div>
            </nav>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[200px]" id={`${activeTab}-panel`}>
                {activeTab === 'GENERICS' && (
                    <div className="max-w-4xl mx-auto">
                        <GenericsVsBrand />
                    </div>
                )}
                {activeTab === 'EMERGENCY' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="prose prose-slate max-w-none">
                            <h2 className="text-2xl font-bold text-slate-900">{t('education.emergency.title')}</h2>
                            <p className="text-lg text-slate-700">{t('education.emergency.intro')}</p>
                        </div>

                        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-lg" role="alert">
                            <p className="text-rose-900 font-bold flex items-center gap-2 mb-1"><AlertTriangle size={18} aria-hidden="true" /> {t('education.emergency.call911')}</p>
                            <p className="text-rose-800 text-sm"><Trans i18nKey="education.emergency.call911Text" /></p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 flex items-start gap-4">
                                <div className="bg-emerald-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
                                <div>
                                    <h3 className="font-bold text-emerald-900 mb-1 flex items-center gap-2"><Phone size={16} aria-hidden="true" /> {t('education.emergency.step1Title')}</h3>
                                    <p className="text-slate-700 text-sm"><Trans i18nKey="education.emergency.step1Text" /></p>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 flex items-start gap-4">
                                <div className="bg-blue-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
                                <div>
                                    <h3 className="font-bold text-blue-900 mb-1 flex items-center gap-2"><Pill size={16} aria-hidden="true" /> {t('education.emergency.step2Title')}</h3>
                                    <p className="text-slate-700 text-sm">{t('education.emergency.step2Pre')}<em>{t('education.emergency.step2Quote')}</em>{t('education.emergency.step2Post')}</p>
                                </div>
                            </div>

                            <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 flex items-start gap-4">
                                <div className="bg-purple-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
                                <div>
                                    <h3 className="font-bold text-purple-900 mb-1 flex items-center gap-2"><Clock size={16} aria-hidden="true" /> {t('education.emergency.step3Title')}</h3>
                                    <p className="text-slate-700 text-sm">{t('education.emergency.step3Text')}</p>
                                    <Link to="/medications" className="text-purple-700 font-semibold text-sm underline mt-1 inline-block">{t('education.emergency.step3Link')}</Link>
                                </div>
                            </div>

                            <div className="bg-amber-50 p-5 rounded-xl border border-amber-100 flex items-start gap-4">
                                <div className="bg-amber-700 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">4</div>
                                <div>
                                    <h3 className="font-bold text-amber-900 mb-1 flex items-center gap-2"><Heart size={16} aria-hidden="true" /> {t('education.emergency.step4Title')}</h3>
                                    <p className="text-slate-700 text-sm">{t('education.emergency.step4Text')}</p>
                                    <Link to="/education?topic=DIRECTORY" className="text-amber-800 font-semibold text-sm underline mt-1 inline-block">{t('education.emergency.step4Link')}</Link>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-3">{t('education.emergency.readyTitle')}</h3>
                            <p className="text-slate-600 text-sm mb-3">{t('education.emergency.readySubtitle')}</p>
                            <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-700">
                                {t('education.emergency.readyItems', { returnObjects: true }).map((item, i) => (
                                    <li key={i} className="flex items-start gap-2"><span className="text-emerald-600 font-bold">✓</span><span>{item}</span></li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-rose-50 border border-rose-200 p-5 rounded-xl text-center">
                            <p className="text-rose-900 font-semibold mb-1">{t('education.emergency.dontStopTitle')}</p>
                            <p className="text-rose-800 text-sm">{t('education.emergency.dontStopText')}</p>
                            <Link to="/application-help" className="inline-block mt-3 bg-rose-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-rose-700 transition text-sm">{t('education.emergency.dontStopCta')}</Link>
                        </div>
                    </div>
                )}
                {activeTab === 'OOP' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="prose prose-slate max-w-none">
                            <h2 className="text-2xl font-bold text-slate-900">{t('education.oop.title')}</h2>
                            <p className="text-lg text-slate-700">{t('education.oop.intro')}</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                             <section className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                                 <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">{t('education.oop.negotiation.badge')}</span>
                                    <h3 className="font-bold text-purple-900">{t('education.oop.negotiation.title')}</h3>
                                 </div>
                                 <p className="text-sm text-purple-900 mb-4 font-medium">{t('education.oop.negotiation.lead')}</p>
                                 <p className="text-slate-700 text-sm mb-4 leading-relaxed"><Trans i18nKey="education.oop.negotiation.p1" /></p>
                                 <p className="text-slate-700 text-sm mb-4">{t('education.oop.negotiation.p2')}</p>
                                 <p className="text-slate-700 text-sm italic">{t('education.oop.negotiation.p3')}</p>
                                 <div className="mt-4 p-3 bg-purple-100 rounded-lg border border-purple-200">
                                     <p className="text-purple-900 text-sm font-bold mb-1">{t('education.oop.negotiation.round3Title')}</p>
                                     <p className="text-slate-700 text-sm mb-2"><Trans i18nKey="education.oop.negotiation.round3P1" /></p>
                                     <p className="text-slate-700 text-xs"><Trans i18nKey="education.oop.negotiation.round3P2" /></p>
                                 </div>
                             </section>
                             <section className="bg-teal-50 p-6 rounded-xl border border-teal-100">
                                 <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded">{t('education.oop.glp1.badge')}</span>
                                    <h3 className="font-bold text-teal-900">{t('education.oop.glp1.title')}</h3>
                                 </div>
                                 <p className="text-sm text-teal-900 mb-4 font-medium">{t('education.oop.glp1.lead')}</p>
                                 <p className="text-slate-700 text-sm mb-4 leading-relaxed">{t('education.oop.glp1.p1')}</p>
                                 <p className="text-slate-700 text-sm mb-4"><Trans i18nKey="education.oop.glp1.p2" /></p>
                                 <p className="text-slate-700 text-sm italic">{t('education.oop.glp1.p3')}</p>
                             </section>
                             <section className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                                 <div className="flex items-center gap-2 mb-3">
                                    <h3 className="font-bold text-indigo-900">{t('education.oop.m3p.title')}</h3>
                                 </div>
                                 <p className="text-sm text-indigo-900 mb-4 font-medium">{t('education.oop.m3p.lead')}</p>
                                 <p className="text-slate-700 text-sm mb-4 leading-relaxed">{t('education.oop.m3p.p1')}</p>
                                 <p className="text-slate-700 text-sm mb-4">{t('education.oop.m3p.p2')}</p>
                                 <p className="text-slate-700 text-sm font-medium">{t('education.oop.m3p.p3')}</p>
                             </section>
                        </div>

                        <div className="border-t border-slate-200 pt-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('education.oop.pick.title')}</h2>
                            <p className="text-slate-600 mb-6">{t('education.oop.pick.intro')}</p>
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <section className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                                    <h3 className="font-bold text-blue-900 text-xl mb-3">{t('education.oop.pick.partDTitle')}</h3>
                                    <p className="text-sm text-slate-600 mb-4">{t('education.oop.pick.partDDesc')}</p>
                                    <ul className="space-y-2 text-slate-700 text-sm">
                                        {t('education.oop.pick.partDItems', { returnObjects: true }).map((item, i) => (
                                            <li key={i} className="flex items-start gap-2"><span className="text-blue-600 font-bold">✓</span><span>{item}</span></li>
                                        ))}
                                    </ul>
                                </section>
                                <section className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                                    <h3 className="font-bold text-green-900 text-xl mb-3">{t('education.oop.pick.maTitle')}</h3>
                                    <p className="text-sm text-slate-600 mb-4">{t('education.oop.pick.maDesc')}</p>
                                    <ul className="space-y-2 text-slate-700 text-sm">
                                        {t('education.oop.pick.maItems', { returnObjects: true }).map((item, i) => (
                                            <li key={i} className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>{item}</span></li>
                                        ))}
                                    </ul>
                                </section>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-slate-200 mb-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{t('education.oop.compare.title')}</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 mb-1">{t('education.oop.compare.step1Title')}</h4>
                                            <p className="text-slate-600 text-sm mb-2">{t('education.oop.compare.step1Text')}</p>
                                            <a href="https://www.medicare.gov/plan-compare/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1" aria-label={t('education.oop.compare.step1LinkAria')}>{t('education.oop.compare.step1Link')} <ExternalLink size={12} aria-hidden="true" /></a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 mb-1">{t('education.oop.compare.step2Title')}</h4>
                                            <p className="text-slate-600 text-sm">{t('education.oop.compare.step2Text')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 mb-1">{t('education.oop.compare.step3Title')}</h4>
                                            <p className="text-slate-600 text-sm mb-2">{t('education.oop.compare.step3Text')}</p>
                                            <a href="https://www.ssa.gov/medicare/part-d-extra-help" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1" aria-label={t('education.oop.compare.step3LinkAria')}>{t('education.oop.compare.step3Link')} <ExternalLink size={12} aria-hidden="true" /></a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">4</div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 mb-1">{t('education.oop.compare.step4Title')}</h4>
                                            <p className="text-slate-600 text-sm mb-2">{t('education.oop.compare.step4Text')}</p>
                                            <a href="https://www.shiphelp.org/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1" aria-label={t('education.oop.compare.step4LinkAria')}>{t('education.oop.compare.step4Link')} <ExternalLink size={12} aria-hidden="true" /></a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{t('education.oop.parts.title')}</h3>
                                <p className="text-slate-600 mb-4">{t('education.oop.parts.intro')}</p>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                                        <h4 className="font-bold text-blue-700 text-lg mb-2">{t('education.oop.parts.partATitle')}</h4>
                                        <p className="text-xs text-slate-600 mb-3">{t('education.oop.parts.partADesc')}</p>
                                        <ul className="text-sm text-slate-700 list-disc pl-4">
                                            <li>{t('education.oop.parts.partAItem')}</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                                        <h4 className="font-bold text-blue-700 text-lg mb-2">{t('education.oop.parts.partBTitle')}</h4>
                                        <p className="text-xs text-slate-600 mb-3">{t('education.oop.parts.partBDesc')}</p>
                                        <ul className="text-sm text-slate-700 list-disc pl-4">
                                            <li>{t('education.oop.parts.partBItem')}</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                                        <h4 className="font-bold text-blue-700 text-lg mb-2">{t('education.oop.parts.partDTitle')}</h4>
                                        <p className="text-xs text-slate-600 mb-3">{t('education.oop.parts.partDDesc')}</p>
                                        <ul className="text-sm text-slate-700 list-disc pl-4">
                                            <li>{t('education.oop.parts.partDItem')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">{t('education.oop.strategies.title')}</h3>
                            <div className="grid gap-6 md:grid-cols-2">
                                <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <h4 className="font-bold text-slate-900 text-lg mb-3">{t('education.oop.strategies.commercialTitle')}</h4>
                                    <ol className="space-y-2 text-slate-700 list-decimal pl-5">
                                        <li><Trans i18nKey="education.oop.strategies.commercialItem1" /></li>
                                        <li><Trans i18nKey="education.oop.strategies.commercialItem2" /></li>
                                    </ol>
                                </section>
                                <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <h4 className="font-bold text-slate-900 text-lg mb-3">{t('education.oop.strategies.medicareTitle')}</h4>
                                    <ol className="space-y-2 text-slate-700 list-decimal pl-5">
                                        <li><Trans i18nKey="education.oop.strategies.medicareItem1" /></li>
                                        <li><Trans i18nKey="education.oop.strategies.medicareItem2" /></li>
                                    </ol>
                                </section>
                            </div>
                        </div>
                        <aside className="bg-emerald-50 p-6 rounded-xl border border-emerald-100" role="note">
                            <h3 className="font-bold text-emerald-900 mb-2">{t('education.oop.keyInsightTitle')}</h3>
                            <p className="text-emerald-800">{t('education.oop.keyInsightText')}</p>
                        </aside>

                        <div className="border-t border-slate-200 pt-8">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-200">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <BookOpen size={24} className="text-blue-600" aria-hidden="true" />
                                    {t('education.oop.glossary.title')}
                                </h2>
                                <p className="text-slate-600 mb-6">{t('education.oop.glossary.intro')}</p>

                                <div className="space-y-6">
                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.premiumTerm')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.premiumDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2"><TermTooltip term="deductible" showIcon={false}>{t('education.oop.glossary.deductibleTerm')}</TermTooltip></h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.deductibleDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2"><TermTooltip term="copay" showIcon={false}>{t('education.oop.glossary.copayTerm')}</TermTooltip>{t('education.oop.glossary.copaySuffix')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.copayDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2"><TermTooltip term="coinsurance" showIcon={false}>{t('education.oop.glossary.coinsuranceTerm')}</TermTooltip></h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.coinsuranceDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.oopMaxPre')}<TermTooltip term="out-of-pocket-maximum" showIcon={false}>{t('education.oop.glossary.oopMaxTerm')}</TermTooltip>{t('education.oop.glossary.oopMaxPost')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.oopMaxDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.formularyPre')}<TermTooltip term="formulary" showIcon={false}>{t('education.oop.glossary.formularyTerm')}</TermTooltip>{t('education.oop.glossary.formularyPost')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.formularyDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.tierTerm')}</h3>
                                        <p className="text-slate-700 text-sm mb-3">{t('education.oop.glossary.tierDef')}</p>
                                        <ul className="text-slate-600 text-sm space-y-1 ml-4 list-disc">
                                            <li><Trans i18nKey="education.oop.glossary.tier1" /></li>
                                            <li><Trans i18nKey="education.oop.glossary.tier2" /></li>
                                            <li><Trans i18nKey="education.oop.glossary.tier3" /></li>
                                        </ul>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2"><TermTooltip term="prior-authorization" showIcon={false}>{t('education.oop.glossary.paTerm')}</TermTooltip></h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.paDef')}</p>
                                        <div className="mt-3 p-2 bg-amber-50 rounded border border-amber-200">
                                            <p className="text-amber-900 text-xs font-bold">{t('education.oop.glossary.paWiserTitle')}</p>
                                            <p className="text-slate-700 text-xs">{t('education.oop.glossary.paWiserPre')}<a href="/appeals" className="text-blue-600 hover:underline">{t('education.oop.glossary.paWiserLink')}</a>{t('education.oop.glossary.paWiserPost')}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2"><TermTooltip term="generic" showIcon={false}>{t('education.oop.glossary.genericTerm')}</TermTooltip>{t('education.oop.glossary.genericSuffix')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.genericDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.brandTerm')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.brandDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2"><TermTooltip term="specialty-pharmacy" showIcon={false}>{t('education.oop.glossary.specialtyTerm')}</TermTooltip>{t('education.oop.glossary.specialtySuffix')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.specialtyDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.partDTerm')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.partDDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.oopCapTerm')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.oopCapDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.catastrophicTerm')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.catastrophicDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.inNetworkTerm')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.inNetworkDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.outNetworkTerm')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.outNetworkDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.pbmTerm')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.pbmDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.papPre')}<TermTooltip term="pap" showIcon={false}>{t('education.oop.glossary.papTerm')}</TermTooltip>{t('education.oop.glossary.papPost')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.papDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.copayCardTerm')}</h3>
                                        <p className="text-slate-700 text-sm"><Trans i18nKey="education.oop.glossary.copayCardDef" /></p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.mfrTerm')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.mfrDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.mailTerm')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.mailDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.stepTerm')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.stepDef')}</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                        <h3 className="font-bold text-lg text-blue-800 mb-2">{t('education.oop.glossary.exclusionTerm')}</h3>
                                        <p className="text-slate-700 text-sm">{t('education.oop.glossary.exclusionDef')}</p>
                                    </div>
                                </div>

                                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                    <h3 className="font-bold text-yellow-900 text-lg mb-3">{t('education.oop.glossary.whyTitle')}</h3>
                                    <p className="text-yellow-900 mb-4">{t('education.oop.glossary.whyIntro')}</p>
                                    <ul className="text-yellow-900 space-y-2 ml-6 list-disc">
                                        {t('education.oop.glossary.whyItems', { returnObjects: true }).map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                                    <h3 className="font-bold text-emerald-900 text-lg mb-3">{t('education.oop.glossary.askTitle')}</h3>
                                    <ul className="text-emerald-900 space-y-2 ml-6 list-disc">
                                        {t('education.oop.glossary.askItems', { returnObjects: true }).map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'DIRECTORY' && (
                    <section aria-labelledby="directory-heading">
                        <h2 id="directory-heading" className="text-2xl font-bold text-slate-900 mb-6">{t('education.directory.title')}</h2>
                        {directoryResources && directoryResources.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {directoryResources.map((res) => (
                                    <a key={res.name} href={res.url} target="_blank" rel="noreferrer" onClick={() => trackServerEvent('resource_view', { resource: res.name, category: res.category })} className="group block bg-white p-6 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition h-full" aria-label={t('education.directory.visitAria', { name: res.name })}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 pr-2">{res.name}</h3>
                                            <ExternalLink size={16} className="opacity-50 group-hover:opacity-100 text-slate-400 flex-shrink-0 mt-1" aria-hidden="true" />
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold mb-3 inline-block ${res.category === 'Foundation' ? 'bg-rose-50 text-rose-700' : res.category === 'Government' ? 'bg-purple-50 text-purple-700' : res.category === 'Support Group' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{t(`education.directory.categories.${res.category}`, { defaultValue: res.category })}</span>
                                        {/* A resource that has stopped taking applications stays listed —
                                            it still helps in other ways, and a patient who has been told to
                                            apply here needs to learn the pause from us rather than from a
                                            dead form. Said before the description, so nobody reads "gives
                                            grants" and applies. */}
                                        {res.status === 'paused' && (
                                            <span className="text-xs px-2 py-1 rounded-full font-bold mb-3 ml-2 inline-flex items-center gap-1 bg-amber-100 text-amber-800">
                                                <Clock size={12} aria-hidden="true" />
                                                {t('education.directory.statusPaused')}
                                            </span>
                                        )}
                                        <p className="text-slate-600 text-sm leading-relaxed">{res.description}</p>
                                        {res.status === 'paused' && (
                                            <p className="text-amber-800 text-sm leading-relaxed mt-2">{t('education.directory.statusPausedNote')}</p>
                                        )}
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                                <Globe size={48} className="mx-auto text-slate-300 mb-4" aria-hidden="true" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('education.directory.emptyTitle')}</h3>
                                <p className="text-slate-600 max-w-md mx-auto">{t('education.directory.emptyText')}</p>
                            </div>
                        )}
                    </section>
                )}
                {activeTab === 'INSURANCE' && (
                    <div className="max-w-4xl mx-auto space-y-12">
                        {/* Coverage 101, how each insurance type works (moved from home) */}
                        <Coverage101 />

                        {/* WISeR Prior Authorization Pilot */}
                        <section className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle size={28} className="text-amber-600" aria-hidden="true" />
                                <h2 className="text-xl font-bold text-slate-900">{t('education.insurance.wiser.title')}</h2>
                            </div>
                            <p className="text-slate-700 mb-4">
                                <Trans i18nKey="education.insurance.wiser.intro" />
                            </p>
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-white p-4 rounded-lg border border-amber-200">
                                    <h3 className="font-bold text-amber-900 mb-2">{t('education.insurance.wiser.statesTitle')}</h3>
                                    <ul className="text-sm text-slate-700 space-y-1">
                                        <li className="flex items-center gap-2"><Check size={14} className="text-amber-500" aria-hidden="true" /> {t('education.insurance.wiser.stateAz')}</li>
                                        <li className="flex items-center gap-2"><Check size={14} className="text-amber-500" aria-hidden="true" /> {t('education.insurance.wiser.stateNj')}</li>
                                        <li className="flex items-center gap-2"><Check size={14} className="text-amber-500" aria-hidden="true" /> {t('education.insurance.wiser.stateOh')}</li>
                                        <li className="flex items-center gap-2"><Check size={14} className="text-amber-500" aria-hidden="true" /> <strong>{t('education.insurance.wiser.stateOk')}</strong></li>
                                        <li className="flex items-center gap-2"><Check size={14} className="text-amber-500" aria-hidden="true" /> {t('education.insurance.wiser.stateTx')}</li>
                                        <li className="flex items-center gap-2"><Check size={14} className="text-amber-500" aria-hidden="true" /> {t('education.insurance.wiser.stateWa')}</li>
                                    </ul>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-amber-200">
                                    <h3 className="font-bold text-amber-900 mb-2">{t('education.insurance.wiser.knowTitle')}</h3>
                                    <ul className="text-sm text-slate-700 space-y-1 list-disc pl-4">
                                        <li><Trans i18nKey="education.insurance.wiser.know1" /></li>
                                        <li>{t('education.insurance.wiser.know2')}</li>
                                        <li>{t('education.insurance.wiser.know3')}</li>
                                        <li>{t('education.insurance.wiser.know4')}</li>
                                    </ul>
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm">
                                {t('education.insurance.wiser.footer')}
                            </p>
                        </section>

                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-center mb-8" role="note">
                            <p className="text-blue-900 font-medium">{t('education.insurance.note')}</p>
                        </div>

                        {/* Healthcare Insurance Infographic */}
                        <div className="flex justify-center mb-8">
                            <img
                                src="/photos/tmn_infographic.jpg"
                                alt={t('education.insurance.infographicAlt')}
                                aria-describedby="insurance-infographic-desc"
                                className="max-w-full h-auto rounded-lg shadow-md"
                            />
                        </div>
                        <div id="insurance-infographic-desc" className="sr-only">
                            {t('education.insurance.infographicDesc')}
                        </div>

                        {/* Insurance Change Simulation */}
                        <InsuranceChangeSimulator />

                        <section aria-labelledby="medicare-guide">
                            <h2 id="medicare-guide" className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200">{t('education.insurance.medicareGuide.title')}</h2>
                            <div className="mb-8">
                                <h3 className="font-bold text-lg text-slate-800 mb-4">{t('education.insurance.medicareGuide.partsTitle')}</h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
                                        <strong className="text-blue-700 text-lg block mb-1">{t('education.insurance.medicareGuide.partATitle')}</strong>
                                        <ul className="text-sm font-medium text-slate-800 list-disc pl-4">{t('education.insurance.medicareGuide.partAItems', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)}</ul>
                                    </div>
                                    <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
                                        <strong className="text-blue-700 text-lg block mb-1">{t('education.insurance.medicareGuide.partBTitle')}</strong>
                                        <ul className="text-sm font-medium text-slate-800 list-disc pl-4">{t('education.insurance.medicareGuide.partBItems', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)}</ul>
                                    </div>
                                    <div className="border border-purple-200 p-4 rounded-lg bg-purple-50">
                                        <strong className="text-purple-700 text-lg block mb-1">{t('education.insurance.medicareGuide.partCTitle')}</strong>
                                        <ul className="text-sm font-medium text-slate-800 list-disc pl-4">{t('education.insurance.medicareGuide.partCItems', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)}</ul>
                                    </div>
                                    <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
                                        <strong className="text-blue-700 text-lg block mb-1">{t('education.insurance.medicareGuide.partDTitle')}</strong>
                                        <ul className="text-sm font-medium text-slate-800 list-disc pl-4">{t('education.insurance.medicareGuide.partDItems', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)}</ul>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-8">
                                <h3 className="font-bold text-lg text-slate-800 mb-4">{t('education.insurance.medicareGuide.chooseTitle')}</h3>
                                <div className="overflow-hidden border border-slate-200 rounded-xl">
                                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                                        <div className="p-6">
                                            <h4 className="font-bold text-indigo-700 text-lg mb-2">{t('education.insurance.medicareGuide.tradTitle')}</h4>
                                            <ul className="space-y-2 text-sm text-slate-800 list-disc pl-5">{t('education.insurance.medicareGuide.tradItems', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)}</ul>
                                        </div>
                                        <div className="p-6">
                                            <h4 className="font-bold text-indigo-700 text-lg mb-2">{t('education.insurance.medicareGuide.maTitle')}</h4>
                                            <ul className="space-y-2 text-sm text-slate-800 list-disc pl-5">{t('education.insurance.medicareGuide.maItems', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)}</ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section aria-labelledby="commercial-insurance">
                            <h2 id="commercial-insurance" className="text-xl font-bold text-blue-900 bg-blue-50 p-4 rounded-t-xl border-b border-blue-100">{t('education.insurance.commercial.title')}</h2>
                            <div className="bg-white border border-slate-200 rounded-b-xl p-6 space-y-4">
                                <p className="text-slate-700">{t('education.insurance.commercial.intro')}</p>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-2">{t('education.insurance.commercial.keyPointsTitle')}</h3>
                                        <ul className="list-disc pl-5 text-slate-600 text-sm space-y-1">{t('education.insurance.commercial.keyPoints', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)}</ul>
                                    </div>
                                    <div><h3 className="font-bold text-emerald-700 mb-2">{t('education.insurance.commercial.strategyTitle')}</h3><p className="text-sm text-slate-700">{t('education.insurance.commercial.strategy')}</p></div>
                                </div>
                            </div>
                        </section>
                        <div className="grid md:grid-cols-2 gap-6">
                            <section className="border border-slate-200 rounded-xl overflow-hidden" aria-labelledby="va-health">
                                <h2 id="va-health" className="font-bold bg-slate-50 p-3 border-b border-slate-200 text-slate-800">{t('education.insurance.va.title')}</h2>
                                <div className="p-4 space-y-3"><p className="text-sm text-slate-600">{t('education.insurance.va.intro')}</p><div className="text-sm"><strong className="block text-emerald-700">{t('education.insurance.va.strategyTitle')}</strong>{t('education.insurance.va.strategy')}</div><a href="https://www.va.gov/health-care/eligibility/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1 mt-2" aria-label={t('education.insurance.va.linkAria')}>{t('education.insurance.va.link')} <ExternalLink size={12} aria-hidden="true" /></a></div>
                            </section>
                            <section className="border border-slate-200 rounded-xl overflow-hidden" aria-labelledby="tricare">
                                <h2 id="tricare" className="font-bold bg-slate-50 p-3 border-b border-slate-200 text-slate-800">{t('education.insurance.tricare.title')}</h2>
                                <div className="p-4 space-y-3"><p className="text-sm text-slate-600">{t('education.insurance.tricare.intro')}</p><div className="text-sm"><strong className="block text-emerald-700">{t('education.insurance.tricare.strategyTitle')}</strong>{t('education.insurance.tricare.strategy')}</div><a href="https://www.tricare.mil/CoveredServices/Pharmacy" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1 mt-2" aria-label={t('education.insurance.tricare.linkAria')}>{t('education.insurance.tricare.link')} <ExternalLink size={12} aria-hidden="true" /></a></div>
                            </section>
                        </div>
                        <section className="border border-slate-200 rounded-xl overflow-hidden" aria-labelledby="no-insurance">
                            <h2 id="no-insurance" className="font-bold bg-slate-50 p-3 border-b border-slate-200 text-slate-800">{t('education.insurance.noInsurance.title')}</h2>
                            <div className="p-6 bg-white"><p className="text-slate-700 mb-4">{t('education.insurance.noInsurance.intro')}</p><h3 className="font-bold text-emerald-700 mb-2">{t('education.insurance.noInsurance.strategyTitle')}</h3><ul className="list-disc pl-5 text-slate-600 text-sm space-y-1">{t('education.insurance.noInsurance.items', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)}</ul><a href="https://www.healthcare.gov/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1 mt-4" aria-label={t('education.insurance.noInsurance.linkAria')}>{t('education.insurance.noInsurance.link')} <ExternalLink size={12} aria-hidden="true" /></a></div>
                        </section>

                        <section aria-labelledby="medicaid-section">
                            <h2 id="medicaid-section" className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200">{t('education.insurance.medicaid.title')}</h2>
                            <p className="text-slate-600 mb-6">{t('education.insurance.medicaid.intro')}</p>
                            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
                                <label htmlFor="state-select" className="block font-bold text-slate-700 mb-2">{t('education.insurance.medicaid.selectLabel')}</label>
                                <div className="relative">
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={20} aria-hidden="true" />
                                    <select id="state-select" className="w-full appearance-none p-4 pr-10 rounded-lg border border-slate-300 text-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none" onChange={(e) => setSelectedState(e.target.value)} value={selectedState}>
                                        <option value="">{t('education.insurance.medicaid.selectPlaceholder')}</option>
                                        {STATES.map(s => <option key={s.name} value={s.url}>{s.name}</option>)}
                                    </select>
                                </div>
                                {selectedState && (
                                    <div className="mt-6 text-center">
                                        <a href={selectedState} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transition" aria-label={t('education.insurance.medicaid.goAria')}>{t('education.insurance.medicaid.go')} <ExternalLink size={18} aria-hidden="true" /></a>
                                        <p className="text-xs text-slate-600 mt-3">{t('education.insurance.medicaid.leaving')}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section aria-labelledby="ihs-section">
                            <h2 id="ihs-section" className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200">{t('education.insurance.ihs.title')}</h2>
                            <p className="text-slate-600 mb-6">{t('education.insurance.ihs.intro')}</p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <a href="https://www.ihs.gov/findhealthcare/" target="_blank" rel="noreferrer" className="bg-white p-6 rounded-xl border-2 border-emerald-100 hover:border-emerald-200 transition text-center group" aria-label={t('education.insurance.ihs.findAria')}>
                                    <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-700" aria-hidden="true"><LandPlot size={32} /></div>
                                    <h3 className="font-bold text-lg text-slate-900 mb-2">{t('education.insurance.ihs.findTitle')}</h3>
                                    <p className="text-sm text-slate-600 mb-6">{t('education.insurance.ihs.findText')}</p>
                                    <span className="inline-block w-full bg-emerald-700 group-hover:bg-emerald-800 text-white font-bold py-2 rounded-lg">{t('education.insurance.ihs.findCta')}</span>
                                </a>
                                <section className="bg-white p-6 rounded-xl border border-slate-200" aria-labelledby="ihs-strategy"><h3 id="ihs-strategy" className="font-bold text-slate-900 mb-4">{t('education.insurance.ihs.strategyTitle')}</h3><p className="text-slate-600 text-sm">{t('education.insurance.ihs.strategy')}</p></section>
                            </div>
                        </section>
                    </div>
                )}
                {activeTab === 'DEDUCTIBLE_TRAP' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('education.deductibleTrap.title')}</h1>
                            <p className="text-xl text-slate-600">{t('education.deductibleTrap.subtitle')}</p>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-orange-50 border-4 border-red-300 rounded-2xl p-8 shadow-lg">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="bg-red-600 text-white p-3 rounded-full flex-shrink-0" aria-hidden="true">
                                    <AlertTriangle size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-red-900 mb-2">{t('education.deductibleTrap.warning.title')}</h2>
                                    <p className="text-lg font-bold text-red-800">{t('education.deductibleTrap.warning.lead')}</p>
                                </div>
                            </div>
                            <div className="bg-white/80 p-6 rounded-xl border-2 border-red-200 mt-4">
                                <h3 className="font-bold text-red-900 text-xl mb-3">{t('education.deductibleTrap.warning.boxTitle')}</h3>
                                <p className="text-red-900 text-lg leading-relaxed mb-4">{t('education.deductibleTrap.warning.boxP1Pre')}<span className="font-bold bg-yellow-200 px-2 py-1 rounded">{t('education.deductibleTrap.warning.boxP1Highlight')}</span>{t('education.deductibleTrap.warning.boxP1Post')}</p>
                                <p className="text-slate-800 leading-relaxed mb-3">{t('education.deductibleTrap.warning.boxP2')}</p>
                                <p className="text-slate-700 font-medium">{t('education.deductibleTrap.warning.boxP3')}</p>
                            </div>
                            <div className="bg-white/80 p-5 rounded-xl border-2 border-red-200 mt-4 flex items-start gap-3">
                                <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={22} aria-hidden="true" />
                                <p className="text-red-900 leading-relaxed">
                                    <strong>{t('education.deductibleTrap.warning.trumpRxBold')}</strong>{' '}
                                    {t('education.deductibleTrap.warning.trumpRxText')}{' '}
                                    <a href={t('education.deductibleTrap.warning.trumpRxHref')} className="font-semibold underline text-red-800 hover:text-red-950">{t('education.deductibleTrap.warning.trumpRxLink')}</a>
                                </p>
                            </div>
                        </div>

                        <section className="bg-slate-50 p-8 rounded-xl border border-slate-200" aria-labelledby="real-example">
                            <h2 id="real-example" className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <DollarSign className="text-emerald-600" size={28} aria-hidden="true" />
                                {t('education.deductibleTrap.example.title')}
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-xl border-2 border-emerald-200">
                                    <div className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full inline-block mb-3">{t('education.deductibleTrap.example.rightBadge')}</div>
                                    <h3 className="font-bold text-lg text-slate-900 mb-4">{t('education.deductibleTrap.example.rightTitle')}</h3>
                                    <ul className="space-y-3 text-slate-700">
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-slate-900">{t('education.deductibleTrap.example.rightM13Label')}</span>
                                            <span>{t('education.deductibleTrap.example.rightM13')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-slate-900">{t('education.deductibleTrap.example.rightM412Label')}</span>
                                            <span>{t('education.deductibleTrap.example.rightM412')}</span>
                                        </li>
                                        <li className="pt-3 border-t-2 border-emerald-200">
                                            <span className="font-bold text-emerald-700 text-xl">{t('education.deductibleTrap.example.rightTotal')}</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-white p-6 rounded-xl border-2 border-red-200">
                                    <div className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full inline-block mb-3">{t('education.deductibleTrap.example.trapBadge')}</div>
                                    <h3 className="font-bold text-lg text-slate-900 mb-4">{t('education.deductibleTrap.example.trapTitle')}</h3>
                                    <ul className="space-y-3 text-slate-700">
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-slate-900">{t('education.deductibleTrap.example.trapM112Label')}</span>
                                            <span>{t('education.deductibleTrap.example.trapM112')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-slate-900">{t('education.deductibleTrap.example.trapResultLabel')}</span>
                                            <span>{t('education.deductibleTrap.example.trapResult')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-bold text-slate-900">{t('education.deductibleTrap.example.trapRestLabel')}</span>
                                            <span>{t('education.deductibleTrap.example.trapRest')}</span>
                                        </li>
                                        <li className="pt-3 border-t-2 border-red-200">
                                            <span className="font-bold text-red-700 text-xl">{t('education.deductibleTrap.example.trapTotal')}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                                <p className="text-yellow-900 font-bold text-lg">{t('education.deductibleTrap.example.takeaway')}</p>
                            </div>
                        </section>

                        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-200" aria-labelledby="when-to-use">
                            <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 mb-6">{t('education.deductibleTrap.whenToUse.title')}</h2>
                            <div className="space-y-4">
                                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                    <h3 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                                        <CheckCircle size={20} aria-hidden="true" />
                                        {t('education.deductibleTrap.whenToUse.s1Title')}
                                    </h3>
                                    <p className="text-slate-700 text-sm">{t('education.deductibleTrap.whenToUse.s1Text')}</p>
                                </div>
                                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                    <h3 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                                        <CheckCircle size={20} aria-hidden="true" />
                                        {t('education.deductibleTrap.whenToUse.s2Title')}
                                    </h3>
                                    <p className="text-slate-700 text-sm">{t('education.deductibleTrap.whenToUse.s2Text')}</p>
                                </div>
                                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                    <h3 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                                        <CheckCircle size={20} aria-hidden="true" />
                                        {t('education.deductibleTrap.whenToUse.s3Title')}
                                    </h3>
                                    <p className="text-slate-700 text-sm">{t('education.deductibleTrap.whenToUse.s3Text')}</p>
                                </div>
                            </div>
                            <div className="mt-6 bg-red-100 border-2 border-red-300 rounded-lg p-6">
                                <h3 className="font-bold text-red-900 text-lg mb-3 flex items-center gap-2">
                                    {t('education.deductibleTrap.whenToUse.neverTitle')}
                                </h3>
                                <p className="text-red-900 font-bold text-lg">{t('education.deductibleTrap.whenToUse.neverP1')}</p>
                                <p className="text-red-800 mt-2">{t('education.deductibleTrap.whenToUse.neverP2')}</p>
                            </div>
                        </section>

                        <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm" aria-labelledby="better-alternatives">
                            <h2 id="better-alternatives" className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <HeartHandshake className="text-emerald-600" size={28} aria-hidden="true" />
                                {t('education.deductibleTrap.alternatives.title')}
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                                    <h3 className="font-bold text-emerald-900 text-lg mb-3">{t('education.deductibleTrap.alternatives.papsTitle')}</h3>
                                    <p className="text-slate-700 text-sm mb-4">{t('education.deductibleTrap.alternatives.papsText')}</p>
                                    <p className="text-emerald-800 font-bold text-sm">{t('education.deductibleTrap.alternatives.counts')}</p>
                                </div>
                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                                    <h3 className="font-bold text-blue-900 text-lg mb-3">{t('education.deductibleTrap.alternatives.foundationsTitle')}</h3>
                                    <p className="text-slate-700 text-sm mb-4">{t('education.deductibleTrap.alternatives.foundationsText')}</p>
                                    <p className="text-blue-800 font-bold text-sm">{t('education.deductibleTrap.alternatives.counts')}</p>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                                    <h3 className="font-bold text-purple-900 text-lg mb-3">{t('education.deductibleTrap.alternatives.copayTitle')}</h3>
                                    <p className="text-slate-700 text-sm mb-4">{t('education.deductibleTrap.alternatives.copayText')}</p>
                                    {/* Copay cards can't share the green check: with a copay
                                        accumulator the card's money does NOT count toward the
                                        limit — the exact trap this page warns about. */}
                                    <p className="text-amber-800 font-bold text-sm">{t('education.deductibleTrap.alternatives.countsCopay')}</p>
                                    <p className="text-slate-600 text-sm mt-2">{t('education.deductibleTrap.alternatives.countsCopayAsk')}</p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-gradient-to-r from-amber-50 to-yellow-50 p-8 rounded-xl border-2 border-amber-300" aria-labelledby="key-takeaways">
                            <h2 id="key-takeaways" className="text-2xl font-bold text-slate-900 mb-6">{t('education.deductibleTrap.takeaways.title')}</h2>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="bg-amber-700 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                                    <p className="text-slate-800 pt-1"><span className="font-bold">{t('education.deductibleTrap.takeaways.t1Bold')}</span> {t('education.deductibleTrap.takeaways.t1Rest')}</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="bg-amber-700 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                                    <p className="text-slate-800 pt-1"><span className="font-bold">{t('education.deductibleTrap.takeaways.t2Bold')}</span> {t('education.deductibleTrap.takeaways.t2Rest')}</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="bg-amber-700 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                                    <p className="text-slate-800 pt-1"><span className="font-bold">{t('education.deductibleTrap.takeaways.t3Bold')}</span> {t('education.deductibleTrap.takeaways.t3Rest')}</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="bg-amber-700 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                                    <p className="text-slate-800 pt-1"><span className="font-bold">{t('education.deductibleTrap.takeaways.t4Bold')}</span> {t('education.deductibleTrap.takeaways.t4Rest')}</p>
                                </li>
                            </ul>
                        </section>

                        <aside className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-lg" role="note">
                            <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2 text-lg">
                                <Info size={24} aria-hidden="true" />
                                {t('education.deductibleTrap.questionsTitle')}
                            </h3>
                            <p className="text-emerald-900 leading-relaxed">
                                {t('education.deductibleTrap.questionsText')}
                            </p>
                        </aside>
                    </div>
                )}
                {activeTab === 'DIVERSION' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('education.diversion.title')}</h1>
                            <p className="text-xl text-slate-600">{t('education.diversion.subtitle')}</p>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-orange-50 border-4 border-red-300 rounded-2xl p-8 shadow-lg">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="bg-red-600 text-white p-3 rounded-full flex-shrink-0" aria-hidden="true">
                                    <AlertOctagon size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-red-900 mb-2">{t('education.diversion.warning.title')}</h2>
                                    <p className="text-lg font-bold text-red-800">{t('education.diversion.warning.lead')}</p>
                                </div>
                            </div>
                            <div className="bg-white/80 p-6 rounded-xl border-2 border-red-200 mt-4">
                                <h3 className="font-bold text-red-900 text-xl mb-3">{t('education.diversion.warning.boxTitle')}</h3>
                                <p className="text-slate-800 leading-relaxed mb-3">{t('education.diversion.warning.boxP1Pre')}<span className="font-bold bg-yellow-200 px-2 py-1 rounded">{t('education.diversion.warning.boxP1Highlight')}</span></p>
                                <p className="text-slate-700 leading-relaxed">{t('education.diversion.warning.boxP2')}</p>
                            </div>
                        </div>

                        <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm" aria-labelledby="types-heading">
                            <h2 id="types-heading" className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <List className="text-indigo-600" size={28} aria-hidden="true" />
                                {t('education.diversion.types.title')}
                            </h2>
                            <p className="text-slate-600 mb-8">{t('education.diversion.types.intro')}</p>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">1</div>
                                        <div>
                                            <h3 className="font-bold text-purple-900 text-xl mb-2">{t('education.diversion.types.acc.title')}</h3>
                                            <p className="text-slate-700 mb-4">{t('education.diversion.types.acc.pre')}<span className="font-bold text-red-700">{t('education.diversion.types.acc.highlight')}</span>{t('education.diversion.types.acc.post')}</p>
                                            <div className="bg-white p-4 rounded-lg border border-purple-200">
                                                <h4 className="font-bold text-slate-900 mb-2">{t('education.diversion.types.whyHurts')}</h4>
                                                <ul className="text-slate-700 text-sm space-y-2">
                                                    {t('education.diversion.types.acc.why', { returnObjects: true }).map((item, i) => (
                                                        <li key={i} className="flex items-start gap-2"><span className="text-red-500">•</span><span>{item}</span></li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border-2 border-orange-200">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">2</div>
                                        <div>
                                            <h3 className="font-bold text-orange-900 text-xl mb-2">{t('education.diversion.types.max.title')}</h3>
                                            <p className="text-slate-700 mb-4">{t('education.diversion.types.max.pre')}<span className="font-bold text-red-700">{t('education.diversion.types.max.highlight')}</span>{t('education.diversion.types.max.post')}</p>
                                            <div className="bg-white p-4 rounded-lg border border-orange-200">
                                                <h4 className="font-bold text-slate-900 mb-2">{t('education.diversion.types.whyHurts')}</h4>
                                                <ul className="text-slate-700 text-sm space-y-2">
                                                    {t('education.diversion.types.max.why', { returnObjects: true }).map((item, i) => (
                                                        <li key={i} className="flex items-start gap-2"><span className="text-red-500">•</span><span>{item}</span></li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-rose-50 to-red-50 p-6 rounded-xl border-2 border-rose-200">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-rose-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">3</div>
                                        <div>
                                            <h3 className="font-bold text-rose-900 text-xl mb-2">{t('education.diversion.types.afp.title')}</h3>
                                            <p className="text-slate-700 mb-4">{t('education.diversion.types.afp.pre')}<span className="font-bold text-red-700">{t('education.diversion.types.afp.highlight')}</span></p>
                                            <div className="bg-white p-4 rounded-lg border border-rose-200">
                                                <h4 className="font-bold text-slate-900 mb-2">{t('education.diversion.types.whyHurts')}</h4>
                                                <ul className="text-slate-700 text-sm space-y-2">
                                                    {t('education.diversion.types.afp.why', { returnObjects: true }).map((item, i) => (
                                                        <li key={i} className="flex items-start gap-2"><span className="text-red-500">•</span><span>{item}</span></li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-slate-50 p-8 rounded-xl border border-slate-200" aria-labelledby="identify-heading">
                            <h2 id="identify-heading" className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Search className="text-emerald-600" size={28} aria-hidden="true" />
                                {t('education.diversion.identify.title')}
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-4">{t('education.diversion.identify.signsTitle')}</h3>
                                    <ul className="space-y-3">
                                        {t('education.diversion.identify.signs', { returnObjects: true }).map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-slate-700">
                                                <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-4">{t('education.diversion.identify.askTitle')}</h3>
                                    <ul className="space-y-3">
                                        {t('education.diversion.identify.questions', { returnObjects: true }).map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-slate-700">
                                                <HelpCircle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-xl border border-emerald-200" aria-labelledby="protect-heading">
                            <h2 id="protect-heading" className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <ShieldCheck className="text-emerald-600" size={28} aria-hidden="true" />
                                {t('education.diversion.protect.title')}
                            </h2>
                            <div className="space-y-4">
                                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                    <h3 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                                        <div className="bg-emerald-100 text-emerald-700 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm">1</div>
                                        {t('education.diversion.protect.s1Title')}
                                    </h3>
                                    <p className="text-slate-700 text-sm">{t('education.diversion.protect.s1Text')}</p>
                                </div>
                                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                    <h3 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                                        <div className="bg-emerald-100 text-emerald-700 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm">2</div>
                                        {t('education.diversion.protect.s2Title')}
                                    </h3>
                                    <p className="text-slate-700 text-sm">{t('education.diversion.protect.s2Text')}</p>
                                </div>
                                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                    <h3 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                                        <div className="bg-emerald-100 text-emerald-700 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm">3</div>
                                        {t('education.diversion.protect.s3Title')}
                                    </h3>
                                    <p className="text-slate-700 text-sm">{t('education.diversion.protect.s3Text')}</p>
                                </div>
                                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                    <h3 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                                        <div className="bg-emerald-100 text-emerald-700 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm">4</div>
                                        {t('education.diversion.protect.s4Title')}
                                    </h3>
                                    <p className="text-slate-700 text-sm">{t('education.diversion.protect.s4Text')}</p>
                                </div>
                                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                                    <h3 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                                        <div className="bg-emerald-100 text-emerald-700 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm">5</div>
                                        {t('education.diversion.protect.s5Title')}
                                    </h3>
                                    <p className="text-slate-700 text-sm">{t('education.diversion.protect.s5Text')}</p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-blue-50 p-8 rounded-xl border border-blue-200" aria-labelledby="state-laws-heading">
                            <h2 id="state-laws-heading" className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Scale className="text-blue-600" size={28} aria-hidden="true" />
                                {t('education.diversion.stateLaws.title')}
                            </h2>
                            <p className="text-slate-700 mb-6">{t('education.diversion.stateLaws.intro')}</p>
                            <div className="bg-white p-6 rounded-xl border border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-3">{t('education.diversion.stateLaws.listTitle')}</h3>
                                <p className="text-slate-700 text-sm mb-4">{t('education.diversion.stateLaws.list')}</p>
                                <div className="bg-blue-100 p-4 rounded-lg mt-4">
                                    <p className="text-blue-900 text-sm font-medium">{t('education.diversion.stateLaws.note')}</p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-gradient-to-r from-amber-50 to-yellow-50 p-8 rounded-xl border-2 border-amber-300" aria-labelledby="why-matters">
                            <h2 id="why-matters" className="text-2xl font-bold text-slate-900 mb-6">{t('education.diversion.whyMatters.title')}</h2>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="bg-amber-700 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                                    <p className="text-slate-800 pt-1"><span className="font-bold">{t('education.diversion.whyMatters.t1Bold')}</span> {t('education.diversion.whyMatters.t1Rest')}</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="bg-amber-700 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                                    <p className="text-slate-800 pt-1"><span className="font-bold">{t('education.diversion.whyMatters.t2Bold')}</span> {t('education.diversion.whyMatters.t2Rest')}</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="bg-amber-700 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                                    <p className="text-slate-800 pt-1"><span className="font-bold">{t('education.diversion.whyMatters.t3Bold')}</span> {t('education.diversion.whyMatters.t3Rest')}</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="bg-amber-700 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                                    <p className="text-slate-800 pt-1"><span className="font-bold">{t('education.diversion.whyMatters.t4Bold')}</span> {t('education.diversion.whyMatters.t4Rest')}</p>
                                </li>
                            </ul>
                        </section>

                        <aside className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-lg" role="note">
                            <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2 text-lg">
                                <Info size={24} aria-hidden="true" />
                                {t('education.diversion.help.title')}
                            </h3>
                            <p className="text-emerald-900 leading-relaxed mb-4">
                                {t('education.diversion.help.text')}
                            </p>
                            <p className="text-emerald-800 text-sm">
                                {t('education.diversion.help.pafPre')}<a href={`/out/foundation/totalassist?source=education-diversion&lang=${getUiLang()}`} target="_blank" rel="noreferrer" className="font-bold text-emerald-700 hover:underline">{t('education.diversion.help.pafLink')}</a>{t('education.diversion.help.pafPost')}
                            </p>
                        </aside>
                    </div>
                )}
                {activeTab === 'MENTAL' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('education.mental.title')}</h2>
                            <p className="text-lg text-slate-600">{t('education.mental.subtitle')}</p>
                        </div>

                        <section className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-300 rounded-2xl p-8 shadow-lg text-center" aria-labelledby="crisis-hotline">
                            <div className="bg-rose-600 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md" aria-hidden="true">
                                <Phone size={40} />
                            </div>
                            <h3 id="crisis-hotline" className="text-3xl font-extrabold text-slate-900 mb-3">
                                {t('education.mental.crisis.title')}
                            </h3>
                            <div className="mb-6">
                                <a href="tel:988" className="inline-block text-6xl md:text-7xl font-black text-rose-600 hover:text-rose-700 transition mb-2 tracking-tight">
                                    988
                                </a>
                                <p className="text-lg font-bold text-slate-700">{t('education.mental.crisis.name')}</p>
                                <p className="text-sm text-slate-600 mt-2">{t('education.mental.crisis.availability')}</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                                <div className="bg-white/80 p-4 rounded-lg">
                                    <p className="font-bold text-slate-900 mb-1">{t('education.mental.crisis.callTitle')}</p>
                                    <p className="text-sm text-slate-600"><Trans i18nKey="education.mental.crisis.callText" /></p>
                                </div>
                                <div className="bg-white/80 p-4 rounded-lg">
                                    <p className="font-bold text-slate-900 mb-1">{t('education.mental.crisis.chatTitle')}</p>
                                    <a href="https://988lifeline.org/chat/" target="_blank" rel="noreferrer" className="text-sm text-rose-600 font-medium hover:underline flex items-center gap-1">
                                        988lifeline.org/chat <ExternalLink size={12} aria-hidden="true" />
                                    </a>
                                </div>
                            </div>
                        </section>

                        <div className="grid md:grid-cols-2 gap-6">
                            <a href="https://www.samhsa.gov/find-support" target="_blank" rel="noreferrer" className="group block bg-white p-6 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-lg transition h-full" aria-label={t('education.mental.samhsa.aria')}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-900 group-hover:text-indigo-700 mb-1">{t('education.mental.samhsa.title')}</h3>
                                        <span className="text-xs px-2 py-1 rounded-full font-bold bg-indigo-100 text-indigo-700">{t('education.mental.samhsa.badge')}</span>
                                    </div>
                                    <ExternalLink size={18} className="opacity-50 group-hover:opacity-100 text-slate-400 flex-shrink-0" aria-hidden="true" />
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                                    <Trans i18nKey="education.mental.samhsa.desc" />
                                </p>
                                <div className="space-y-2 text-sm">
                                    <p className="text-slate-600">
                                        <strong className="text-slate-900">{t('education.mental.helplineLabel')}</strong>{' '}
                                        <a href="tel:1-800-662-4357" className="text-indigo-600 font-bold hover:underline">1-800-662-HELP (4357)</a>
                                    </p>
                                    <p className="text-slate-600 text-xs">{t('education.mental.samhsa.availability')}</p>
                                </div>
                            </a>

                            <section className="bg-white p-6 rounded-xl border border-slate-200 h-full" aria-labelledby="transplant-mental-health">
                                <h3 id="transplant-mental-health" className="font-bold text-lg text-slate-900 mb-4">{t('education.mental.transplant.title')}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                    {t('education.mental.transplant.intro')}
                                </p>
                                <ul className="space-y-2 text-sm text-slate-700">
                                    {t('education.mental.transplant.items', { returnObjects: true }).map((item, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <CheckCircle size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <a href="https://www.nami.org/Support-Education/Support-Groups" target="_blank" rel="noreferrer" className="group block bg-white p-6 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition h-full" aria-label={t('education.mental.nami.aria')}>
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-purple-700">{t('education.mental.nami.title')}</h3>
                                    <ExternalLink size={16} className="opacity-50 group-hover:opacity-100 text-slate-400 flex-shrink-0" aria-hidden="true" />
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                    {t('education.mental.nami.desc')}
                                </p>
                                <p className="text-slate-600 text-sm">
                                    <strong className="text-slate-900">{t('education.mental.helplineLabel')}</strong>{' '}
                                    <a href="tel:1-800-950-6264" className="text-purple-600 font-bold hover:underline">1-800-950-NAMI (6264)</a>
                                </p>
                            </a>

                            <a href="https://findtreatment.gov/" target="_blank" rel="noreferrer" className="group block bg-white p-6 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition h-full" aria-label={t('education.mental.findTreatment.aria')}>
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700">FindTreatment.gov</h3>
                                    <ExternalLink size={16} className="opacity-50 group-hover:opacity-100 text-slate-400 flex-shrink-0" aria-hidden="true" />
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {t('education.mental.findTreatment.desc')}
                                </p>
                            </a>
                        </div>

                        <section className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-2xl p-8" aria-labelledby="caregiver-support">
                            <h3 id="caregiver-support" className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                <Users size={28} className="text-teal-600" aria-hidden="true" />
                                {t('education.mental.caregivers.title')}
                            </h3>
                            <p className="text-slate-700 mb-6 leading-relaxed">
                                {t('education.mental.caregivers.intro')}
                            </p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white/80 p-5 rounded-xl">
                                    <h4 className="font-bold text-slate-900 mb-3">{t('education.mental.caregivers.tipsTitle')}</h4>
                                    <ul className="space-y-2 text-sm text-slate-700">
                                        {t('education.mental.caregivers.tips', { returnObjects: true }).map((item, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <CheckCircle size={16} className="text-teal-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <a href="https://www.caregiving.org/" target="_blank" rel="noreferrer" className="group block bg-white/80 p-5 rounded-xl hover:shadow-md transition" aria-label={t('education.mental.caregivers.nacAria')}>
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-slate-900 group-hover:text-teal-700">{t('education.mental.caregivers.nacTitle')}</h4>
                                        <ExternalLink size={16} className="opacity-50 group-hover:opacity-100 text-slate-400 flex-shrink-0" aria-hidden="true" />
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                                        {t('education.mental.caregivers.nacDesc')}
                                    </p>
                                    <span className="text-xs px-2 py-1 rounded-full font-bold bg-teal-100 text-teal-700">{t('education.mental.caregivers.nacBadge')}</span>
                                </a>
                            </div>
                        </section>

                        <aside className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg" role="note">
                            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                <Heart size={20} aria-hidden="true" />
                                {t('education.mental.remember.title')}
                            </h3>
                            <p className="text-amber-900 text-sm leading-relaxed">
                                {t('education.mental.remember.text')}
                            </p>
                        </aside>
                    </div>
                )}
            </div>
        </article>
    );
};

// ApplicationHelp Page

export default Education;
