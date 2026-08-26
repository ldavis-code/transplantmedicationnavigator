import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { Download, ArrowRight, BookOpen, ShieldCheck, HeartHandshake, Phone, ExternalLink, X, CheckCircle, Quote } from 'lucide-react';
import HOME_STATS from '../../data/home-stats.json';
import { useChatQuiz } from '../../context/ChatQuizContext.jsx';
import { useMedicationsList } from '../../context/MedicationsContext.jsx';
import { localizeMedName } from '../../utils/medNames.js';
import { trackServerEvent } from '../../lib/trackServerEvent.js';
import { useMetaTags } from '../../hooks/useMetaTags.js';
import ShareButton from '../../components/ShareButton.jsx';
import { seoMetadata } from '../../data/seo-metadata.js';

// Home-page counts are generated from the data files at build time
// (scripts/generate-home-stats.js regenerates home-stats.json on every
// build, so they can never go stale) instead of importing 156 KB of
// medication/program JSON into the entry bundle to show an integer.
const STAT_MEDICATIONS = HOME_STATS.medications;

// Quick-pick chips: the three medications almost every transplant patient
// recognizes, one per situation the brand/generic explainer below describes.
// esLabel is the Spanish drug name, used only where the label is a generic
// name: a generic drug name is a word, and the rest of the Spanish site
// already writes "micofenolato". Brand names never localize — Prograf is
// what the bottle says in any language.
const EXAMPLE_MEDS = [
    { id: 'tacrolimus', label: 'Tacrolimus', esLabel: 'Tacrolimus', tagKey: 'home.steps.tagGeneric' },
    { id: 'prograf', label: 'Prograf', tagKey: 'home.steps.tagBrand' },
    { id: 'mycophenolate', label: 'Mycophenolate', esLabel: 'Micofenolato', tagKey: 'home.steps.tagGeneric' },
];

const INSURANCE_OPTIONS = [
    { value: 'commercial', labelKey: 'home.steps.insCommercial' },
    { value: 'medicare', labelKey: 'home.steps.insMedicare' },
    { value: 'medicaid', labelKey: 'home.steps.insMedicaid' },
    { value: 'uninsured', labelKey: 'home.steps.insUninsured' },
];

// Home Page
const Home = () => {
    useMetaTags(seoMetadata.home);
    const { t, i18n } = useTranslation();
    const isSpanish = (i18n.resolvedLanguage || i18n.language || '').startsWith('es');
    const navigate = useNavigate();
    const MEDICATIONS = useMedicationsList();
    const { answers, setAnswer } = useChatQuiz();
    const insuranceType = answers?.insurance_type;

    const [searchTerm, setSearchTerm] = useState('');
    // Medication chosen in step 1, carried to the results page by the
    // "See my options" button under step 2.
    const [pendingMed, setPendingMed] = useState(null);

    // fuse.js stays out of the entry bundle: the chunk loads on the first
    // keystroke, and plain substring matching answers until it arrives.
    const [FuseCtor, setFuseCtor] = useState(null);
    useEffect(() => {
        if (!searchTerm.trim() || FuseCtor) return;
        let alive = true;
        import('fuse.js').then(
            (mod) => { if (alive) setFuseCtor(() => mod.default); },
            () => { /* substring fallback keeps working */ }
        );
        return () => { alive = false; };
    }, [searchTerm, FuseCtor]);

    const fuse = useMemo(() => (
        FuseCtor
            ? new FuseCtor(MEDICATIONS, {
                keys: ['brandName', 'genericName'],
                threshold: 0.4, // typo-tolerant, same tuning as the search page
                ignoreLocation: true,
                minMatchCharLength: 2,
            })
            : null
    ), [FuseCtor, MEDICATIONS]);

    // Exact-first matching: names or name-tokens that start with the query,
    // then substring hits. The typo-tolerant fuzzy search only fills in when
    // nothing matches directly — on a medication tool a loose fuzzy list can
    // surface an unrelated drug next to the right one, and a tired patient
    // can click the wrong row.
    const results = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (term.length < 2) return [];
        const tokenPrefix = (name) => {
            const n = (name || '').toLowerCase();
            return n.startsWith(term) || n.split(/[^a-z0-9]+/).some(tok => tok.startsWith(term));
        };
        const contains = (name) => (name || '').toLowerCase().includes(term);
        const prefix = [];
        const substr = [];
        for (const m of MEDICATIONS) {
            if (tokenPrefix(m.brandName) || tokenPrefix(m.genericName)) prefix.push(m);
            else if (contains(m.brandName) || contains(m.genericName)) substr.push(m);
        }
        const direct = [...prefix, ...substr];
        if (direct.length > 0) return direct.slice(0, 6);
        return fuse ? fuse.search(term).slice(0, 6).map(r => r.item) : [];
    }, [searchTerm, fuse, MEDICATIONS]);

    // Step 1 selects and stays put; the "See my options" button under step 2
    // is the single navigation point, so the 1-2 sequence reads true whether
    // the patient picks the medication or the insurance first.
    const chooseMedication = (med) => {
        setSearchTerm('');
        setPendingMed(med);
        trackServerEvent('home_med_selected', { medicationId: med.id });
    };

    const chooseExample = (id) => {
        const med = MEDICATIONS.find(m => m.id === id);
        if (med) chooseMedication(med);
    };

    const chooseInsurance = (value) => {
        setAnswer('insurance_type', value);
        trackServerEvent('coverage_selected', { insuranceType: value, source: 'home' });
    };

    const seeOptions = () => {
        if (!pendingMed) return;
        trackServerEvent('home_see_options', { medicationId: pendingMed.id, insuranceType: insuranceType || 'unset' });
        navigate(`/medications?ids=${pendingMed.id}`);
    };

    return (
        <article className="space-y-10">
            {/* Hero */}
            <section className="text-center max-w-3xl mx-auto pt-6 md:pt-10">
                <h1 className="text-3xl md:text-5xl font-extrabold text-emerald-900 leading-tight mb-4">
                    {t('home.hero.title1')}<br />{t('home.hero.title2')}
                </h1>
                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
                    {t('home.hero.subtitle')}
                </p>

                {/* Three-step journey map, so a first-time visitor sees the
                    whole path before scrolling into step 1. */}
                <ol className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 mt-7" aria-label={t('home.flow.ariaLabel')}>
                    {[1, 2, 3].map((n) => (
                        <li key={n} className="flex items-center gap-3">
                            {n > 1 && <ArrowRight size={16} className="text-slate-400 rotate-90 sm:rotate-0" aria-hidden="true" />}
                            <span className="flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-1.5 pr-4 py-1.5 shadow-sm">
                                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center" aria-hidden="true">{n}</span>
                                <span className="text-sm font-semibold text-slate-700">{t(`home.flow.step${n}`)}</span>
                            </span>
                        </li>
                    ))}
                </ol>

                {/* One line of Spanish on the ENGLISH page: in many households
                    the patient is Spanish-dominant while the person holding
                    the phone is English-dominant — this line is what gets the
                    phone handed over. Deliberately not in the locale files
                    (it renders Spanish on the English page), and the URL is
                    spelled out so it can be read aloud, copied, or printed.
                    The Spanish page doesn't need it. */}
                {!isSpanish && (
                    <p lang="es" className="mt-5 text-sm text-slate-600">
                        Este sitio está disponible en español:{' '}{/* i18n-ok */}
                        <a href="/es" className="font-semibold text-emerald-700 underline hover:text-emerald-800 break-words">
                            transplantmedicationnavigator.com/es
                        </a>
                    </p>
                )}
            </section>

            {/* Step 1: medications */}
            <section className="max-w-2xl mx-auto" aria-labelledby="step-meds-heading">
                <h2 id="step-meds-heading" className="text-sm font-extrabold tracking-widest uppercase text-slate-500 mb-3">
                    {t('home.steps.medsLabel')}
                </h2>

                <div className="relative">
                    <label htmlFor="home-med-search" className="sr-only">{t('home.steps.searchAriaLabel')}</label>
                    <input
                        id="home-med-search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            // Typing the full name and hitting Enter selects the top match
                            if (e.key === 'Enter' && results.length > 0) {
                                e.preventDefault();
                                chooseMedication(results[0]);
                            }
                        }}
                        placeholder={t('home.steps.searchPlaceholder')}
                        autoComplete="off"
                        className="w-full px-5 py-4 text-lg bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400"
                    />
                    {searchTerm.trim().length >= 2 && (
                        <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden" role="listbox" aria-label={t('home.steps.resultsAriaLabel')}>
                            {results.map((med) => (
                                <button
                                    key={med.id}
                                    onClick={() => chooseMedication(med)}
                                    className="w-full text-left px-5 py-3 hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none transition flex items-baseline justify-between gap-3"
                                    role="option"
                                    aria-selected="false"
                                    aria-label={t('home.steps.resultAria', { name: localizeMedName(med.brandName) })}
                                >
                                    <span className="font-bold text-slate-900">{localizeMedName(med.brandName)}</span>
                                    <span className="text-sm text-slate-500">{localizeMedName(med.genericName)}</span>
                                </button>
                            ))}
                            {results.length === 0 && (
                                <div className="px-5 py-3 text-sm text-slate-600">
                                    {t('home.steps.noResults')}{' '}
                                    <Link to="/medications" className="text-emerald-700 font-semibold underline">
                                        {t('home.steps.noResultsLink')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 my-4" aria-hidden="true">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="text-xs font-bold tracking-widest uppercase text-slate-500">{t('home.steps.or')}</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <Link
                    to="/application-help?section=MEDS&connect=1"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold border-2 border-emerald-600 rounded-xl transition"
                    aria-label={t('home.steps.mychartAriaLabel')}
                >
                    <Download size={20} aria-hidden="true" />
                    {t('home.steps.mychartButton')}
                </Link>
                <p className="text-sm text-slate-500 text-center mt-3">
                    {t('home.steps.mychartFootnote')}
                </p>

                <div className="flex flex-wrap gap-2 mt-4" role="group" aria-label={t('home.steps.examplesAriaLabel')}>
                    {EXAMPLE_MEDS.map((ex) => (
                        <button
                            key={ex.id}
                            onClick={() => chooseExample(ex.id)}
                            className="px-4 py-2 bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-full text-sm font-semibold text-slate-800 shadow-sm transition"
                        >
                            {(isSpanish && ex.esLabel) || ex.label} <span className="font-normal text-slate-500">{t(ex.tagKey)}</span>
                        </button>
                    ))}
                </div>

                {/* Confirms coverage up front: the visitor can check the full
                    list instead of guessing whether their drug is in it. */}
                <p className="text-sm text-slate-500 mt-3">
                    <Link
                        to="/medications"
                        className="text-emerald-700 font-semibold underline hover:text-emerald-800"
                        aria-label={t('home.steps.browseAllAria', { count: STAT_MEDICATIONS })}
                    >
                        {t('home.steps.browseAll', { count: STAT_MEDICATIONS })}
                    </Link>
                </p>

                {pendingMed && (
                    <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
                        <p className="flex-grow text-slate-800">
                            <span className="font-bold">{t('home.steps.selectedPre')}{localizeMedName(pendingMed.brandName)}</span>
                        </p>
                        <button
                            onClick={() => setPendingMed(null)}
                            className="text-slate-400 hover:text-slate-600"
                            aria-label={t('home.steps.clearSelected')}
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                    </div>
                )}
            </section>

            {/* Step 2: insurance */}
            <section className="max-w-2xl mx-auto" aria-labelledby="step-insurance-heading">
                <h2 id="step-insurance-heading" className="text-sm font-extrabold tracking-widest uppercase text-slate-500 mb-3">
                    {t('home.steps.insuranceLabel')}
                </h2>
                <div className="flex flex-wrap gap-2" role="group" aria-label={t('home.steps.insuranceAriaLabel')}>
                    {INSURANCE_OPTIONS.map((opt) => {
                        const selected = insuranceType === opt.value;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => chooseInsurance(opt.value)}
                                aria-pressed={selected}
                                className={`px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm border transition ${selected
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-400 hover:bg-emerald-50'}`}
                            >
                                {t(opt.labelKey)}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={seeOptions}
                    disabled={!pendingMed}
                    className={`mt-6 w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg shadow-md transition flex items-center justify-center gap-2 ${pendingMed
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
                >
                    {t('home.steps.seeOptions')} <ArrowRight size={18} aria-hidden="true" />
                </button>
                {!pendingMed && (
                    <p className="text-sm text-slate-500 mt-2">{t('home.steps.seeOptionsHint')}</p>
                )}

                <p className="text-slate-600 mt-6">
                    {t('home.steps.multiplePre')}{' '}
                    <Link to="/wizard" className="font-semibold text-slate-900 underline hover:text-emerald-700 inline-flex items-center gap-1">
                        {t('home.steps.multipleLink')} <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                </p>

                {/* The 5 questions up front, so nobody starts the quiz blind
                    to the time commitment or what it asks. */}
                <details className="mt-2 max-w-xl text-sm text-slate-600">
                    <summary className="cursor-pointer font-semibold text-slate-700 underline decoration-dotted hover:text-emerald-700 w-fit">
                        {t('home.steps.previewSummary')}
                    </summary>
                    <p className="mt-2">{t('home.steps.previewIntro')}</p>
                    <ol className="list-decimal pl-5 mt-1 space-y-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <li key={n}>{t(`home.steps.previewQ${n}`)}</li>
                        ))}
                    </ol>
                </details>

                <p className="text-sm text-slate-500 mt-6">
                    {t('home.trust', { count: STAT_MEDICATIONS })}
                </p>
            </section>

            {/* Brand vs. generic explainer */}
            <section className="max-w-3xl mx-auto pt-4" aria-labelledby="explainer-heading">
                <h2 id="explainer-heading" className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
                    {t('home.explainer.title')}
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                    {t('home.explainer.intro')}
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <h3 className="font-bold text-slate-900 text-lg">{t('home.explainer.genericTitle')}</h3>
                        <p className="text-slate-600 text-sm mt-1">{t('home.explainer.genericText')}</p>
                        <p className="font-bold text-emerald-800 text-sm mt-2">→ {t('home.explainer.genericAction')}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <h3 className="font-bold text-slate-900 text-lg">{t('home.explainer.brandTitle')}</h3>
                        <p className="font-semibold text-slate-800 text-sm mt-1">{t('home.explainer.brandText')}</p>
                        <p className="font-bold text-amber-700 text-sm mt-2">→ {t('home.explainer.brandAction')}</p>
                    </div>
                </div>

                <p className="text-slate-700 mt-6 max-w-xl">
                    <strong className="text-slate-900">{t('home.explainer.neverTitle')}</strong>{' '}
                    {t('home.explainer.neverText')}
                </p>
            </section>

            {/* Guides & programs */}
            <section className="max-w-3xl mx-auto space-y-4" aria-label={t('home.cards.ariaLabel')}>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-100 transition">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true"><BookOpen size={20} /></div>
                        <h3 className="text-xl font-bold text-slate-900">{t('home.cards.learn.title')}</h3>
                    </div>
                    <p className="text-slate-600 mb-3">{t('home.cards.learn.text')}</p>
                    <Link to="/application-help" className="text-emerald-700 font-medium hover:underline inline-flex items-center gap-1" aria-label={t('home.cards.learn.ariaLabel')}>
                        {t('home.cards.learn.link')} <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-100 transition">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true"><ShieldCheck size={20} /></div>
                        <h3 className="text-xl font-bold text-slate-900">{t('home.cards.coverage.title')}</h3>
                    </div>
                    <p className="text-slate-600 mb-3">{t('home.cards.coverage.text')}</p>
                    <Link to="/education" className="text-emerald-700 font-medium hover:underline inline-flex items-center gap-1" aria-label={t('home.cards.coverage.ariaLabel')}>
                        {t('home.cards.coverage.link')} <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-100 transition">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true"><HeartHandshake size={20} /></div>
                        <h3 className="text-xl font-bold text-slate-900">{t('home.cards.grants.title')}</h3>
                    </div>
                    <p className="text-slate-600 mb-3">{t('home.cards.grants.text', { programs: HOME_STATS.assistancePrograms, copayCards: HOME_STATS.copayCards })}</p>
                    <Link to="/application-help" className="text-emerald-700 font-medium hover:underline inline-flex items-center gap-1" aria-label={t('home.cards.grants.ariaLabel')}>
                        {t('home.cards.grants.link')} <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>
            </section>

            {/* Real patient savings story */}
            <section className="max-w-3xl mx-auto text-center pt-4" aria-label={t('home.story.ariaLabel')}>
                <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
                    {t('home.story.badge')}
                </span>
                <blockquote>
                    <p className="text-xl md:text-2xl text-emerald-900 font-semibold leading-relaxed max-w-2xl mx-auto">
                        {t('home.story.quotePre')}<span className="line-through decoration-2 text-slate-500 font-normal">{t('home.story.price1')}</span>{t('home.story.quoteMid1')}<span className="line-through decoration-2 text-slate-500 font-normal">{t('home.story.price2')}</span>{t('home.story.quoteMid2')}<strong>{t('home.story.price3')}</strong>{t('home.story.quotePost')}
                    </p>
                    <footer className="text-sm text-slate-500 mt-4">{t('home.story.attribution')}</footer>
                </blockquote>
            </section>

            {/* Named patient testimonial. Deliberately a card rather than a
                second centered pull-quote: it sits next to the savings story
                above and would otherwise read as the same component twice.
                The story it tells is the one no other section tells — the
                Navigator open in the exam room, at the moment a medication
                changed. Published with Mike's permission. */}
            <section className="max-w-3xl mx-auto" aria-label={t('home.testimonial.ariaLabel')}>
                <figure className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
                    <Quote size={28} className="text-emerald-600 mb-3" aria-hidden="true" />
                    <blockquote>
                        <p className="text-lg md:text-xl text-slate-800 leading-relaxed">
                            {t('home.testimonial.quote')}
                        </p>
                    </blockquote>
                    <figcaption className="mt-5 pt-4 border-t border-slate-100">
                        <span className="block font-bold text-slate-900">{t('home.testimonial.name')}</span>
                        <span className="block text-sm text-slate-600">{t('home.testimonial.role')}</span>
                        <span className="block text-xs text-slate-500 mt-2">{t('home.testimonial.disclaimer')}</span>
                    </figcaption>
                    {/* Placed on the testimonial deliberately: the moment a
                        reader is most likely to think of someone who needs
                        this is straight after reading that it helped a real
                        patient. */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
                        <p className="text-sm text-slate-700 flex-grow">{t('share.prompt')}</p>
                        <ShareButton source="home-testimonial" className="flex-shrink-0" />
                    </div>
                </figure>
            </section>

            {/* Evidence stat */}
            <section className="max-w-3xl mx-auto" aria-label={t('home.evidence.ariaLabel')}>
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 flex flex-col sm:flex-row items-center gap-5">
                    <div className="text-5xl md:text-6xl font-black text-emerald-800 flex-shrink-0">{t('home.evidence.stat')}</div>
                    <p className="text-slate-700 text-center sm:text-left">
                        <Trans i18nKey="home.evidence.text" />{' '}
                        <Link to="/evidence" className="text-emerald-700 font-semibold underline inline-flex items-center gap-1">
                            {t('home.evidence.link')} <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                    </p>
                </div>
            </section>

            {/* Founder */}
            <section className="max-w-3xl mx-auto border-t border-slate-200 pt-10" aria-labelledby="founder-heading">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <img
                        src="/photos/lorrinda-gray-davis.jpg"
                        alt={t('home.founder.photoAlt')}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-emerald-100 shadow flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="flex-grow text-center md:text-left">
                        <h2 id="founder-heading" className="text-xl font-bold text-slate-900">{t('home.founder.name')}</h2>
                        <p className="text-slate-500 text-sm mb-4">{t('home.founder.role')}</p>
                        <p className="text-slate-700 leading-relaxed">
                            {t('home.founder.bio')}{' '}
                            <Link to="/about" className="text-emerald-700 font-semibold underline whitespace-nowrap">
                                {t('home.founder.link')} <ArrowRight size={14} className="inline" aria-hidden="true" />
                            </Link>
                        </p>
                    </div>
                </div>
            </section>

            {/* Mental health support — deliberately calm: this is "support is
                here", not an emergency alarm. */}
            <section className="bg-rose-50 border border-rose-200 rounded-2xl p-6 md:p-8 max-w-3xl mx-auto mb-12" aria-labelledby="mental-health-hotline">
                <div className="flex items-start gap-4">
                    <div className="bg-rose-100 text-rose-700 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Phone size={22} />
                    </div>
                    <div className="flex-grow">
                        <h3 id="mental-health-hotline" className="text-xl font-bold text-slate-900 mb-2">
                            {t('home.hotline.title')}
                        </h3>
                        <p className="text-slate-700 mb-4">
                            {t('home.hotline.intro')}
                        </p>
                        <p>
                            <a href="tel:988" className="text-3xl font-bold text-rose-700 hover:text-rose-800 transition">988</a>
                        </p>
                        <p className="font-semibold text-slate-800 mt-1">{t('home.hotline.lifeline')}</p>
                        <p className="text-sm text-slate-600 mb-4">{t('home.hotline.availability')}</p>
                        <p className="text-sm text-slate-700 mb-5 leading-relaxed">
                            {t('home.hotline.encouragement')}
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                            <div className="bg-white p-3 rounded-lg border border-rose-100">
                                <p className="font-bold text-slate-900 mb-1">{t('home.hotline.callTitle')}</p>
                                <p className="text-slate-600"><Trans i18nKey="home.hotline.callText" /></p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-rose-100">
                                <p className="font-bold text-slate-900 mb-1">{t('home.hotline.chatTitle')}</p>
                                <a href="https://988lifeline.org/chat/" target="_blank" rel="noreferrer" className="text-rose-700 font-medium hover:underline flex items-center gap-1">
                                    988lifeline.org/chat <ExternalLink size={12} aria-hidden="true" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </article>
    );
};

export default Home;
