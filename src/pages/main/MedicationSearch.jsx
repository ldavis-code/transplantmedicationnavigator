import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import Fuse from 'fuse.js';
import { useChatQuiz } from '../../context/ChatQuizContext.jsx';
import FeedbackWidget from '../../components/FeedbackWidget.jsx';
import LanguageToggle from '../../components/LanguageToggle.jsx';
import { useMedicationsList } from '../../context/MedicationsContext.jsx';
import { Search, BookOpen, ShieldCheck, ArrowRight, Heart, Award, X, HeartHandshake, CheckCircle, ChevronLeft, DollarSign, Shield, AlertTriangle, AlertCircle, Printer, Building, PlusCircle, List, Info, FileText, Users, Loader2 } from 'lucide-react';
import { localizeMedName } from '../../utils/medNames.js';
import { useMetaTags } from '../../hooks/useMetaTags.js';
import { seoMetadata } from '../../data/seo-metadata.js';
import { fplDollars } from '../../data/constants.js';
import { trackMedicationSearch, trackMedicationAddToList } from '../../lib/medicationTrackingApi.js';
import { trackServerEvent } from '../../lib/trackServerEvent.js';
import { MedicationCard, ExternalMedCard } from '../../components/MedicationCardKit.jsx';

const MedicationSearch = () => {
    const { t } = useTranslation();
    const MEDICATIONS = useMedicationsList();
    const {
        answers: quizAnswers,
        setAnswer: setContextAnswer
    } = useChatQuiz();

    // Determine if copay cards should be shown based on insurance type from quiz
    // Copay cards are only for commercial/employer insurance
    // If insurance type is not set, we'll prompt the user to select it
    const insuranceType = quizAnswers?.insurance_type;
    const isCommercialInsurance = insuranceType === 'commercial';
    const showCopayCards = isCommercialInsurance;

    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [myListIds, setMyListIds] = useState([]);
    const [myCustomMeds, setMyCustomMeds] = useState([]);
    const [linkCopied, setLinkCopied] = useState(false);
    const [priceReportRefresh, setPriceReportRefresh] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    // Skip straight to medication cards when arriving with medication IDs in the URL
    const [showSavings, setShowSavings] = useState(!!searchParams.get('ids'));

    // Two views share this route. Once the visitor is looking at their savings,
    // the tab and the screen-reader announcement should say so instead of still
    // advertising the search they came from. t() already resolves to the active
    // language, so the same string serves both the default and the Spanish
    // override; the canonical stays on /medications either way.
    const metaConfig = useMemo(() => {
        if (!showSavings) return seoMetadata.medications;
        const title = `${t('medications.verify.savingsButton')} | Transplant Medication Navigator\u2122`;
        return {
            ...seoMetadata.medications,
            title,
            es: { ...seoMetadata.medications.es, title },
        };
    }, [showSavings, t]);
    useMetaTags(metaConfig);

    // Fuse.js instance for fuzzy search (typo-tolerant)
    const fuse = useMemo(() => new Fuse(MEDICATIONS, {
        keys: ['brandName', 'genericName'],
        threshold: 0.4, // 0 = exact match, 1 = match anything
        includeScore: true,
        ignoreLocation: true,
        minMatchCharLength: 2
    }), [MEDICATIONS]);

    useEffect(() => {
        const ids = searchParams.get('ids');
        if (ids) {
            const idArray = ids.split(',').filter(id => id.trim() !== '');
            if (idArray.length > 0) setMyListIds(idArray);
        }
    }, [searchParams]);

    // Merge into the existing query string instead of replacing it: a plain
    // setSearchParams({ ids }) wiped every other param (historically the
    // ?lang=es that kept Spanish pages shareable before /es/ paths).
    useEffect(() => {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (myListIds.length > 0) {
                params.set('ids', myListIds.join(','));
            } else {
                params.delete('ids');
            }
            return params;
        }, { replace: true });
    }, [myListIds, setSearchParams]);

    const handleSearch = useCallback(() => {
        if (!searchTerm.trim()) {
            setSearchResult(null);
            setIsSearching(false);
            return;
        }
        // Exact-first matching: names or name-tokens that start with the query,
        // then substring hits. Fuse.js fuzzy matching (typos like "tacrolimis")
        // only fills in when nothing matches directly — a loose fuzzy list can
        // put an unrelated drug next to the right one, and a tired patient can
        // click the wrong row.
        const term = searchTerm.trim().toLowerCase();
        const tokenPrefix = (name) => {
            const n = (name || '').toLowerCase();
            return n.startsWith(term) || n.split(/[^a-z0-9]+/).some(tok => tok.startsWith(term));
        };
        const contains = (name) => (name || '').toLowerCase().includes(term);
        const prefixMatches = [];
        const substrMatches = [];
        for (const m of MEDICATIONS) {
            if (tokenPrefix(m.brandName) || tokenPrefix(m.genericName)) prefixMatches.push(m);
            else if (contains(m.brandName) || contains(m.genericName)) substrMatches.push(m);
        }
        let internalMatches = [...prefixMatches, ...substrMatches];
        if (internalMatches.length === 0) {
            internalMatches = fuse.search(searchTerm.trim()).map(result => result.item);
        }
        internalMatches = internalMatches.slice(0, 6);
        setSearchResult({ internal: internalMatches, showExternalOption: true });
        setIsSearching(false);

        // Track search interactions for analytics
        trackServerEvent('med_search', { resultCount: internalMatches.length });
        if (internalMatches.length > 0) {
            trackMedicationSearch(internalMatches[0].genericName || internalMatches[0].brandName, searchTerm.trim());
        }
    }, [searchTerm, fuse, MEDICATIONS]);

    useEffect(() => {
        if (searchTerm.trim()) {
            setIsSearching(true);
        } else {
            setSearchResult(null);
            setIsSearching(false);
        }
        const timer = setTimeout(() => {
            if (searchTerm.trim()) handleSearch();
            else setSearchResult(null);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, handleSearch]);

    const addInternalToList = (id) => {
        if (!myListIds.includes(id)) {
            setMyListIds([...myListIds, id]);
            // Track when user adds a medication to their search list
            const med = MEDICATIONS.find(m => m.id === id);
            if (med) {
                trackMedicationAddToList(med.genericName || med.brandName);
            }
        }
        setSearchTerm('');
        setSearchResult(null);
    };

    const removeInternalFromList = (id) => {
        setMyListIds(myListIds.filter(m => m !== id));
    };

    const addCustomToList = () => {
        const term = searchTerm.trim();
        if (term && !myCustomMeds.some(m => m.toLowerCase() === term.toLowerCase())) {
            setMyCustomMeds([...myCustomMeds, term]);
        }
        setSearchTerm('');
        setSearchResult(null);
    };

    const removeCustomFromList = (name) => {
        setMyCustomMeds(myCustomMeds.filter(m => m !== name));
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
    };

    const displayListInternal = MEDICATIONS.filter(m => myListIds.includes(m.id));
    const hasItems = displayListInternal.length > 0 || myCustomMeds.length > 0;

    return (
        <>
        <article className="max-w-5xl mx-auto space-y-8">
            {/* Show full search section only when no items OR when showSavings is false and user wants to add more */}
            {!hasItems && (
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{t('medications.search.title')}</h1>
                        <p className="text-slate-600">{t('medications.search.subtitle')}</p>
                    </div>
                    <LanguageToggle />
                </div>

                {/* Important Safety Warning */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 no-print" role="alert">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} aria-hidden="true" />
                        <div>
                            <p className="font-bold text-red-800 mb-1">{t('medications.search.safety.title')}</p>
                            <p className="text-red-700 text-sm"><Trans i18nKey="medications.search.safety.text" /></p>
                            <Link to="/education?topic=GENERICS" className="inline-flex items-center gap-1 text-red-800 font-semibold text-sm underline mt-1">
                                {t('medications.search.safety.link')}<ArrowRight size={14} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="relative z-20 no-print">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-grow relative">
                            <label htmlFor="med-search" className="sr-only">{t('medications.search.inputLabel')}</label>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} aria-hidden="true" />
                            <input
                                id="med-search"
                                type="text"
                                placeholder={t('medications.search.placeholder')}
                                className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none text-lg transition shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSearch();
                                    if (e.key === 'Escape') { setSearchResult(null); setSearchTerm(''); }
                                }}
                                aria-describedby="search-instructions"
                                role="combobox"
                                aria-autocomplete="list"
                                aria-expanded={!!(searchResult && searchTerm && !isSearching)}
                                aria-controls="search-results-listbox"
                            />
                            <span id="search-instructions" className="sr-only">{t('medications.search.instructions')}</span>
                            {isSearching ? (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2" aria-live="polite" aria-busy="true">
                                    <Loader2 size={20} className="text-emerald-600 animate-spin" aria-label={t('medications.search.searchingAria')} />
                                </div>
                            ) : searchTerm && (
                                <button onClick={() => { setSearchTerm(''); setSearchResult(null); setIsSearching(false); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={t('medications.search.clearAria')}>
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                        <button onClick={handleSearch} disabled={!searchTerm.trim()} className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-md transition flex items-center gap-2 justify-center shrink-0 disabled:cursor-not-allowed min-h-[56px]" aria-label={t('medications.search.inputLabel')}>
                            <Search size={22} aria-hidden="true" /> {t('medications.search.button')}
                        </button>
                    </div>

                    {isSearching && !searchResult && searchTerm && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50" role="status" aria-label={t('medications.search.loadingResultsAria')}>
                            <div className="flex items-center justify-center gap-3 text-slate-700 py-4">
                                <Loader2 size={20} className="animate-spin text-emerald-600" />
                                <span>{t('medications.search.searchingText')}</span>
                            </div>
                        </div>
                    )}
                    {searchResult && searchTerm && !isSearching && (
                        <div id="search-results-listbox" className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-[60vh] overflow-y-auto z-50" role="listbox" aria-label={t('medications.search.resultsAria')}>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-2 mx-2">
                                <p className="text-emerald-800 text-sm font-medium">{t('medications.search.helpBanner')}</p>
                            </div>
                            <div className="px-4 py-2 text-sm font-bold text-slate-700 uppercase tracking-wider">{t('medications.search.resultsHeading')}</div>
                            {searchResult.internal.length > 0 ? (
                                <div className="space-y-1 mb-2">
                                    {searchResult.internal.map(med => {
                                        const isAlreadyIn = myListIds.includes(med.id);
                                        return (
                                            <button key={med.id} onClick={() => addInternalToList(med.id)} disabled={isAlreadyIn} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex justify-between items-center group transition disabled:opacity-50 disabled:cursor-not-allowed" role="option" aria-selected={isAlreadyIn}>
                                                <div>
                                                    <span className="font-bold text-slate-900 block">{localizeMedName(med.brandName)}</span>
                                                    <span className="text-sm text-slate-600">{localizeMedName(med.genericName)}</span>
                                                </div>
                                                {isAlreadyIn ? (
                                                    <span className="text-emerald-600 text-sm font-bold flex items-center gap-1" aria-label={t('medications.search.alreadyAddedAria')}><CheckCircle size={16} aria-hidden="true" /> {t('medications.search.added')}</span>
                                                ) : (
                                                    <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-bold group-hover:bg-emerald-100 flex items-center gap-1"><PlusCircle size={16} aria-hidden="true" /> {t('medications.search.add')}</span>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 text-center">
                                    <div className="text-slate-400 mb-2">
                                        <Search size={24} className="mx-auto" aria-hidden="true" />
                                    </div>
                                    <p className="text-slate-700 font-medium mb-1">{t('medications.search.noMatches')}</p>
                                    <p className="text-slate-500 text-sm">{t('medications.search.noMatchesHint')}</p>
                                </div>
                            )}
                            {searchResult.showExternalOption && (
                                <div className="border-t border-slate-100 pt-2 mt-1">
                                    <button onClick={addCustomToList} className="w-full text-left p-3 rounded-lg hover:bg-indigo-50 flex justify-between items-center group transition">
                                        <div>
                                            <span className="font-bold text-indigo-900 block">{t('medications.search.addCustomLabel', { term: searchTerm })}</span>
                                            <span className="text-xs text-indigo-600">{t('medications.search.checkExternal')}</span>
                                        </div>
                                        <span className="text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full text-sm font-bold group-hover:bg-indigo-200 flex items-center gap-1"><PlusCircle size={16} aria-hidden="true" /> {t('medications.search.addCustom')}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
            )}

            {/* When user has medications - show confirmation prompt and guidance */}
            {hasItems && !showSavings && (
                <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{t('medications.verify.title')}</h1>
                            <p className="text-slate-600">{t('medications.verify.subtitle')}</p>
                        </div>
                        <div className="flex gap-2 no-print">
                            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition border border-slate-200" aria-label={t('medications.verify.printAria')}>
                                <Printer size={18} aria-hidden="true" /> {t('medications.verify.print')}
                            </button>
                        </div>
                    </div>

                    {/* Medication Verification Alert - Accessible alert for patients */}
                    <div
                        className="mb-6 bg-blue-50 border-2 border-blue-400 rounded-xl p-5 ring-2 ring-blue-200"
                        role="alert"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                                <AlertCircle className="text-blue-600" size={28} aria-hidden="true" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg text-blue-800 mb-2">
                                    {t('medications.verify.alertTitle')}
                                </h2>
                                <p className="text-blue-700 mb-3">
                                    {t('medications.verify.alertText')}
                                </p>
                                <p className="text-blue-600 text-sm font-medium">
                                    {t('medications.verify.alertNote')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Simple add more medications search */}
                    <div className="relative z-20 no-print mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-grow relative">
                                <label htmlFor="med-search-add" className="sr-only">{t('medications.verify.addMoreLabel')}</label>
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} aria-hidden="true" />
                                <input
                                    id="med-search-add"
                                    type="text"
                                    placeholder={t('medications.verify.addMorePlaceholder')}
                                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none text-base transition shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSearch();
                                        if (e.key === 'Escape') { setSearchResult(null); setSearchTerm(''); }
                                    }}
                                    aria-expanded={!!(searchResult && searchTerm && !isSearching)}
                                />
                                {searchTerm && (
                                    <button onClick={() => { setSearchTerm(''); setSearchResult(null); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={t('medications.search.clearAria')}>
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                        {searchResult && searchTerm && !isSearching && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-[40vh] overflow-y-auto z-50" role="listbox">
                                {searchResult.internal.length > 0 && (
                                    <div className="space-y-1 mb-2">
                                        {searchResult.internal.map(med => {
                                            const isAlreadyIn = myListIds.includes(med.id);
                                            return (
                                                <button key={med.id} onClick={() => addInternalToList(med.id)} disabled={isAlreadyIn} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex justify-between items-center group transition disabled:opacity-50" role="option" aria-selected={isAlreadyIn}>
                                                    <div>
                                                        <span className="font-bold text-slate-900 block">{localizeMedName(med.brandName)}</span>
                                                        <span className="text-sm text-slate-600">{localizeMedName(med.genericName)}</span>
                                                    </div>
                                                    {isAlreadyIn ? (
                                                        <span className="text-emerald-600 text-sm font-bold flex items-center gap-1"><CheckCircle size={16} /> {t('medications.search.added')}</span>
                                                    ) : (
                                                        <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><PlusCircle size={16} /> {t('medications.search.add')}</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                {searchResult.showExternalOption && (
                                    <button onClick={addCustomToList} className="w-full text-left p-3 rounded-lg hover:bg-indigo-50 flex justify-between items-center border-t border-slate-100">
                                        <span className="font-bold text-indigo-900">{t('medications.search.addAsCustom', { term: searchTerm })}</span>
                                        <span className="text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full text-sm font-bold"><PlusCircle size={16} className="inline" /> {t('medications.search.add')}</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Medication list */}
                    <div className="space-y-3 mb-6">
                        {displayListInternal.map(med => (
                            <div key={med.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <span className="font-bold text-slate-900">{localizeMedName(med.brandName)}</span>
                                    <span className="text-slate-600 ml-2">({localizeMedName(med.genericName)})</span>
                                </div>
                                <button onClick={() => removeInternalFromList(med.id)} className="text-red-600 hover:text-red-700 p-2" aria-label={t('medications.verify.removeAria', { name: localizeMedName(med.brandName) })}>
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                        {myCustomMeds.map((name, idx) => (
                            <div key={`${name}-${idx}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="font-bold text-slate-900">{name}</span>
                                <button onClick={() => removeCustomFromList(name)} className="text-red-600 hover:text-red-700 p-2" aria-label={t('medications.verify.removeAria', { name })}>
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Insurance Type Selection - shown when user hasn't set insurance via quiz */}
                    {!insuranceType && (
                        <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-xl p-5" role="group" aria-labelledby="insurance-select-heading">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-amber-100 rounded-full flex-shrink-0">
                                    <Shield className="text-amber-600" size={28} aria-hidden="true" />
                                </div>
                                <div className="flex-1">
                                    <h2 id="insurance-select-heading" className="font-bold text-lg text-amber-800 mb-2">
                                        {t('medications.insurance.heading')}
                                    </h2>
                                    <p className="text-amber-700 mb-4 text-sm">
                                        {t('medications.insurance.text')}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {[
                                            { value: 'commercial', label: t('medications.insurance.options.commercial'), icon: Building },
                                            { value: 'medicare', label: t('medications.insurance.options.medicare'), icon: ShieldCheck },
                                            { value: 'medicaid', label: t('medications.insurance.options.medicaid'), icon: HeartHandshake },
                                            { value: 'tricare_va', label: t('medications.insurance.options.tricare_va'), icon: Award },
                                            { value: 'ihs', label: t('medications.insurance.options.ihs'), icon: Users },
                                            { value: 'uninsured', label: t('medications.insurance.options.uninsured'), icon: AlertCircle },
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setContextAnswer('insurance_type', opt.value)}
                                                className="flex items-center gap-3 p-3 rounded-lg border-2 border-amber-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition text-left min-h-[48px]"
                                                aria-label={t('medications.insurance.selectAria', { label: opt.label })}
                                            >
                                                <opt.icon size={20} className="text-slate-600 flex-shrink-0" aria-hidden="true" />
                                                <span className="font-medium text-slate-800 text-sm">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Guidance to click My Medication Savings */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 no-print">
                        <div className="flex items-start gap-3">
                            <DollarSign className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} aria-hidden="true" />
                            <div>
                                <p className="font-bold text-emerald-800 mb-1">{t('medications.verify.ready.title')}</p>
                                <p className="text-emerald-700 text-sm"><Trans i18nKey="medications.verify.ready.text" /></p>
                            </div>
                        </div>
                    </div>
                </section>
            )}


            {hasItems && showSavings && (
                <div className="flex items-center justify-between mb-4 no-print">
                    <button
                        onClick={() => setShowSavings(false)}
                        className="text-slate-700 flex items-center gap-1 text-sm hover:text-emerald-600 min-h-[44px]"
                    >
                        <ChevronLeft size={16} aria-hidden="true" /> {t('medications.verify.back')}
                    </button>
                    {/* The results view hides the search section, so this is
                        the page's one H1 (the a11y review found the Spanish
                        results with no H1 at all). */}
                    <h1 className="text-lg font-bold text-emerald-700">{t('medications.verify.savingsButton')}</h1>
                </div>
            )}

            <div className="space-y-6 pb-12">
                {!hasItems && (
                    <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50">
                        <div className="text-slate-400 mb-4" aria-hidden="true"><List size={64} className="mx-auto"/></div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">{t('medications.search.emptyTitle')}</h2>
                        <p className="text-slate-700 max-w-md mx-auto">{t('medications.search.emptyText')}</p>
                    </div>
                )}
                {hasItems && showSavings && (
                    <>
                        {displayListInternal.map(med => (
                            <MedicationCard key={med.id} med={med} onRemove={() => removeInternalFromList(med.id)} onPriceReportSubmit={() => setPriceReportRefresh(prev => prev + 1)} showCopayCards={showCopayCards} quizAnswers={quizAnswers} />
                        ))}
                        {myCustomMeds.map((name, idx) => (
                            <ExternalMedCard key={`${name}-${idx}`} name={name} onRemove={() => removeCustomFromList(name)} />
                        ))}
                    </>
                )}
            </div>

            {/* How-to-read panel: collapsed by default so the medication cards
                — the thing the patient came for — are the first screen. */}
            {hasItems && showSavings && (
                <details className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl mb-6 no-print shadow-md">
                    <summary className="cursor-pointer p-5 text-lg font-bold text-emerald-800 hover:text-emerald-900">
                        {t('medications.verify.options.howToRead')}
                    </summary>
                    <div className="px-6 pb-6">
                        <p className="text-emerald-700 text-lg mb-4">{t('medications.verify.options.subtitle')}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 bg-pink-100 border border-pink-300 rounded-xl p-4">
                                    <Heart className="text-pink-600 flex-shrink-0" size={24} aria-hidden="true" />
                                    <div>
                                        <p className="font-bold text-pink-800 text-lg">{t('medications.verify.options.assistance')}</p>
                                        <p className="text-pink-700">{t('medications.verify.options.assistanceDesc')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-green-100 border border-green-300 rounded-xl p-4">
                                    <DollarSign className="text-green-600 flex-shrink-0" size={24} aria-hidden="true" />
                                    <div>
                                        <p className="font-bold text-green-800 text-lg">{t('medications.verify.options.price')}</p>
                                        <p className="text-green-700">{t('medications.verify.options.priceDesc')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-blue-100 border border-blue-300 rounded-xl p-4">
                                    <Info className="text-blue-600 flex-shrink-0" size={24} aria-hidden="true" />
                                    <div>
                                        <p className="font-bold text-blue-800 text-lg">{t('medications.verify.options.overview')}</p>
                                        <p className="text-blue-700">{t('medications.verify.options.overviewDesc')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-100 border border-slate-300 rounded-xl p-4">
                                    <Printer className="text-slate-600 flex-shrink-0" size={24} aria-hidden="true" />
                                    <div>
                                        <p className="font-bold text-slate-800 text-lg">{t('medications.verify.options.print')}</p>
                                        <p className="text-slate-700">{t('medications.verify.options.printDesc')}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Income Eligibility Reference - helps users avoid self-disqualifying from PAPs */}
                            <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl p-4" role="note" aria-label={t('medications.verify.fpl.aria')}>
                                <div className="flex items-start gap-3">
                                    <Users size={22} className="text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-amber-900 mb-2">{t('medications.verify.fpl.title')}</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-amber-900 mb-3">
                                            {[1, 2, 3, 4].map((size) => (
                                                <div key={size}>
                                                    <span className="font-semibold">{t('medications.verify.fpl.familyOf', { size, count: size })}</span> {fplDollars(size)}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-sm text-amber-800">
                                            <span className="font-bold">{t('medications.verify.fpl.dontDisqualify')}</span>{t('medications.verify.fpl.papRange')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                </details>
            )}

            {/* My Medication Savings Button */}
            {hasItems && !showSavings && (
                <div className="flex flex-col items-center gap-2 no-print">
                    <button
                        onClick={() => {
                            setShowSavings(true);
                            setTimeout(() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }, 100);
                        }}
                        disabled={!insuranceType}
                        className={`px-8 py-4 rounded-xl font-bold text-lg shadow-md transition flex items-center gap-2 ${!insuranceType ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                    >
                        {t('medications.verify.savingsButton')}
                    </button>
                    {!insuranceType && (
                        <p className="text-amber-700 text-sm font-medium">{t('medications.verify.selectInsuranceFirst')}</p>
                    )}
                </div>
            )}

            {/* Grants & Foundations */}
            {/* Feedback Widget - at bottom of page */}
            {hasItems && showSavings && (
                <div className="no-print">
                    <FeedbackWidget />
                </div>
            )}

            {hasItems && !showSavings && (
                <section className="bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-200 rounded-xl p-6 shadow-sm no-print" aria-labelledby="app-guide-heading">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-emerald-600 text-white p-3 rounded-full" aria-hidden="true">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h2 id="app-guide-heading" className="text-lg font-bold text-slate-900 mb-1">{t('medications.verify.help.title')}</h2>
                                <p className="text-slate-600 text-sm">{t('medications.verify.help.text')}</p>
                            </div>
                        </div>
                        <Link
                            to="/application-help"
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition shadow-md whitespace-nowrap"
                            aria-label={t('medications.verify.help.aria')}
                        >
                            <FileText size={18} aria-hidden="true" />
                            {t('medications.verify.help.button')}
                        </Link>
                    </div>
                </section>
            )}
        </article>
        </>
    );
};

// Price Report Modal Component

export default MedicationSearch;
