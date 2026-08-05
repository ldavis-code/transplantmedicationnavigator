import { useState, useEffect, useCallback, lazy, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import Fuse from 'fuse.js';
import TermTooltip from '../../components/TermTooltip.jsx';
import { useChatQuiz } from '../../context/ChatQuizContext.jsx';
import EpicConnectButton from '../../components/EpicConnectButton.jsx';
import LanguageToggle from '../../components/LanguageToggle.jsx';
import { useMedicationsList } from '../../context/MedicationsContext.jsx';
import { Map, Search, ArrowRight, Heart, X, HeartHandshake, CheckCircle, ChevronLeft, DollarSign, Shield, AlertTriangle, AlertCircle, Printer, PlusCircle, List, Check, LandPlot, Scale, Stethoscope, Pill, ChevronDown, Lightbulb, Users, Clock, Loader2 } from 'lucide-react';
import { Role, TransplantStatus, OrganType, InsuranceType, FinancialStatus } from '../../data/constants.js';
import ORGAN_MEDS_ES from '../../data/organ-medications.es.json';
import { localizeMedName } from '../../utils/medNames.js';
import { useMetaTags } from '../../hooks/useMetaTags.js';
import { seoMetadata } from '../../data/seo-metadata.js';
import { trackServerEvent } from '../../lib/trackServerEvent.js';
import { ORGAN_MEDICATIONS, PRE_TRANSPLANT_MEDICATIONS } from '../../data/organMedications.js';
import { medDisplayName } from '../../utils/medDisplay.js';

const organIcons = {
    Heart: Heart,
    Kidney: LandPlot,
    Liver: Shield,
    Lung: Stethoscope,
    Pancreas: Scale
};

// Organ-Specific Medication Guide Component
const OrganMedicationGuide = ({ answers, onMedicationToggle }) => {
    const { t, i18n } = useTranslation();
    // Spanish display text comes from the organ-medications.es.json overlay.
    // Brand names stay untouched; generic names show their Spanish form
    // (Brand (generic-in-Spanish)), matching Spanish-language pill bottles
    // and providers. The underlying data is never modified.
    const guideEs = i18n.resolvedLanguage === 'es' ? ORGAN_MEDS_ES : null;
    // Auto-expand the user's selected organ(s), first selected organ is expanded by default
    const selectedOrgans = answers.organs || [];
    const defaultExpanded = selectedOrgans.length > 0 ? selectedOrgans[0] : null;
    const [expandedOrgan, setExpandedOrgan] = useState(defaultExpanded);
    const organTypes = ['Heart', 'Kidney', 'Liver', 'Lung', 'Pancreas'];
    const selectedMeds = answers.medications || [];

    const handleOrganClick = (organ) => {
        setExpandedOrgan(expandedOrgan === organ ? null : organ);
    };

    return (
        <div className="mb-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Pill size={18} className="text-emerald-600" />
                    <h3 className="font-bold text-slate-800">{t('wizard.meds.guide.title')}</h3>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                    {answers.organs && answers.organs.length > 0 ? (
                        <>{t('wizard.meds.guide.basedOnPre')}<strong className="text-emerald-700">{(() => { const names = answers.organs.map(o => t(`wizard.organs.${o}`)); return names.length > 1 ? names.slice(0, -1).join(', ') + t('wizard.meds.guide.and') + names.slice(-1) : names[0]; })()}</strong>{t('wizard.meds.guide.basedOnPost')}</>
                    ) : (
                        <>{t('wizard.meds.guide.selectBelow')}</>
                    )}
                </p>
                <p className="text-sm font-semibold text-slate-700 mb-2">
                    {t('wizard.meds.guide.selectCore')}
                </p>
                <p className="text-sm text-slate-600 mb-4">
                    {t('wizard.meds.guide.clickPre')}<span className="font-semibold text-emerald-700">{t('wizard.meds.guide.addWord')}</span>{t('wizard.meds.guide.clickPost')}
                </p>

                {/* Organ Type Tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {organTypes.map(organ => {
                        const IconComponent = organIcons[organ];
                        const isExpanded = expandedOrgan === organ;
                        const isSelected = (answers.organs || []).includes(organ);
                        return (
                            <button
                                key={organ}
                                onClick={() => handleOrganClick(organ)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition font-medium text-sm ${
                                    isExpanded
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : isSelected
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:border-emerald-400'
                                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                                }`}
                            >
                                <IconComponent size={16} />
                                {t(`wizard.organs.${organ}`)}
                                {isSelected && !isExpanded && <CheckCircle size={14} className="text-emerald-600" />}
                                <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                        );
                    })}
                </div>

                {/* Expanded Organ Section */}
                {expandedOrgan && ORGAN_MEDICATIONS[expandedOrgan] && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-start gap-3 mb-4">
                            {(() => {
                                const IconComponent = organIcons[expandedOrgan];
                                return <IconComponent size={24} className="text-emerald-600 flex-shrink-0 mt-1" />;
                            })()}
                            <div>
                                <h4 className="font-bold text-lg text-slate-900">{guideEs?.organs?.[expandedOrgan]?.title || ORGAN_MEDICATIONS[expandedOrgan].title}</h4>
                                <p className="text-sm text-slate-600 mt-1">{guideEs?.organs?.[expandedOrgan]?.description || ORGAN_MEDICATIONS[expandedOrgan].description}</p>
                            </div>
                        </div>

                        {/* Medications Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-300">
                                        <th className="text-left py-2 px-3 font-bold text-slate-700">{t('wizard.meds.guide.thMedication')}</th>
                                        <th className="text-left py-2 px-3 font-bold text-slate-700">{t('wizard.meds.guide.thClass')}</th>
                                        <th className="text-left py-2 px-3 font-bold text-slate-700">{t('wizard.meds.guide.thNotes')}</th>
                                        <th className="text-right py-2 px-3 font-bold text-slate-700">{t('wizard.meds.guide.thAdd')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {ORGAN_MEDICATIONS[expandedOrgan].medications.map(med => {
                                        const isAdded = selectedMeds.includes(med.id);
                                        return (
                                            <tr key={med.id} className="hover:bg-white">
                                                <td className="py-3 px-3">
                                                    <span className="font-bold text-slate-900">{localizeMedName(med.brand)}</span>
                                                    <span className="text-slate-500 ml-1">({guideEs?.generics?.[med.name] || med.name})</span>
                                                </td>
                                                <td className="py-3 px-3 text-slate-600">{guideEs?.classes?.[med.class] || med.class}</td>
                                                <td className="py-3 px-3 text-slate-600">{guideEs?.organs?.[expandedOrgan]?.notes?.[med.id] || med.notes}</td>
                                                <td className="py-3 px-3 text-right">
                                                    <button
                                                        onClick={() => onMedicationToggle && onMedicationToggle(med.id)}
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition min-h-[36px] ${
                                                            isAdded
                                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                        }`}
                                                        aria-label={isAdded ? t('wizard.meds.guide.removeFromListAria', { name: localizeMedName(med.brand) }) : t('wizard.meds.guide.addToListAria', { name: localizeMedName(med.brand) })}
                                                        aria-pressed={isAdded}
                                                    >
                                                        {isAdded ? (
                                                            <><CheckCircle size={12} aria-hidden="true" /> {t('wizard.meds.added')}</>
                                                        ) : (
                                                            <><PlusCircle size={12} aria-hidden="true" /> {t('wizard.meds.add')}</>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Pre-Transplant Medication Guide Component
const PreTransplantMedicationGuide = ({ answers, onMedicationClick }) => {
    const { t, i18n } = useTranslation();
    // Spanish display text from the overlay; pre-transplant notes key by class
    const guideEs = i18n.resolvedLanguage === 'es' ? ORGAN_MEDS_ES : null;
    // Auto-expand the user's selected organ(s), first selected organ is expanded by default
    const selectedOrgans = answers.organs || [];
    const defaultExpanded = selectedOrgans.length > 0 ? selectedOrgans[0] : null;
    const [expandedOrgan, setExpandedOrgan] = useState(defaultExpanded);
    const organTypes = ['Heart', 'Kidney', 'Liver', 'Lung', 'Pancreas'];

    const handleOrganClick = (organ) => {
        setExpandedOrgan(expandedOrgan === organ ? null : organ);
    };

    return (
        <div className="mb-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Pill size={18} className="text-blue-600" />
                    <h3 className="font-bold text-slate-800">{t('wizard.meds.preGuide.title')}</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                    {t('wizard.meds.preGuide.intro')}
                </p>

                {/* Organ Type Tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {organTypes.map(organ => {
                        const IconComponent = organIcons[organ];
                        const isExpanded = expandedOrgan === organ;
                        const isSelected = (answers.organs || []).includes(organ);
                        return (
                            <button
                                key={organ}
                                onClick={() => handleOrganClick(organ)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition font-medium text-sm ${
                                    isExpanded
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : isSelected
                                            ? 'bg-blue-50 text-blue-700 border-blue-300 hover:border-blue-400'
                                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                            >
                                <IconComponent size={16} />
                                {t(`wizard.organs.${organ}`)}
                                {isSelected && !isExpanded && <CheckCircle size={14} className="text-blue-600" />}
                                <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                        );
                    })}
                </div>

                {/* Expanded Organ Section */}
                {expandedOrgan && PRE_TRANSPLANT_MEDICATIONS[expandedOrgan] && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-start gap-3 mb-4">
                            {(() => {
                                const IconComponent = organIcons[expandedOrgan];
                                return <IconComponent size={24} className="text-blue-600 flex-shrink-0 mt-1" />;
                            })()}
                            <div>
                                <h4 className="font-bold text-lg text-slate-900">{guideEs?.preTransplant?.[expandedOrgan]?.title || PRE_TRANSPLANT_MEDICATIONS[expandedOrgan].title}</h4>
                                <p className="text-sm text-slate-600 mt-1">{guideEs?.preTransplant?.[expandedOrgan]?.description || PRE_TRANSPLANT_MEDICATIONS[expandedOrgan].description}</p>
                            </div>
                        </div>

                        {/* Medications Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-300">
                                        <th className="text-left py-2 px-3 font-bold text-slate-700">{t('wizard.meds.preGuide.thClass')}</th>
                                        <th className="text-left py-2 px-3 font-bold text-slate-700">{t('wizard.meds.preGuide.thExamples')}</th>
                                        <th className="text-left py-2 px-3 font-bold text-slate-700">{t('wizard.meds.preGuide.thPurpose')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {PRE_TRANSPLANT_MEDICATIONS[expandedOrgan].medications.map(med => {
                                        return (
                                            <tr key={med.class} className="hover:bg-white">
                                                <td className="py-3 px-3">
                                                    <span className="font-bold text-slate-900">{guideEs?.classes?.[med.class] || med.class}</span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {med.examples.map((ex) => {
                                                            const selected = (answers.medications || []).includes(ex.id);
                                                            const exLabel = guideEs?.examples?.[ex.id] || ex.label;
                                                            return (
                                                                <button
                                                                    key={ex.id}
                                                                    onClick={() => onMedicationClick && onMedicationClick(ex.id)}
                                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-colors ${selected ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400 hover:text-blue-700'}`}
                                                                    aria-label={selected ? t('wizard.meds.preGuide.addedAria', { name: exLabel }) : t('wizard.meds.guide.addToListAria', { name: exLabel })}
                                                                >
                                                                    {selected ? <Check size={12} aria-hidden="true" /> : <PlusCircle size={12} aria-hidden="true" />}
                                                                    {exLabel}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 text-slate-600">{guideEs?.preTransplant?.[expandedOrgan]?.notes?.[med.class] || med.notes}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Warning for specific organs (like liver) */}
                        {PRE_TRANSPLANT_MEDICATIONS[expandedOrgan].warning && (
                            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-amber-800">{guideEs?.preTransplant?.[expandedOrgan]?.warning || PRE_TRANSPLANT_MEDICATIONS[expandedOrgan].warning}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Wizard Page
const Wizard = () => {
    useMetaTags(seoMetadata.wizard);
    const { t } = useTranslation();
    const MEDICATIONS = useMedicationsList();
    const { setAnswer: setContextAnswer, setSelectedMedications } = useChatQuiz();

    // Map InsuranceType display values to ChatQuizContext format
    const mapInsuranceToContextFormat = (insuranceValue) => {
        const mapping = {
            [InsuranceType.COMMERCIAL]: 'commercial',
            [InsuranceType.MARKETPLACE]: 'commercial', // Marketplace is also commercial
            [InsuranceType.MEDICARE]: 'medicare',
            [InsuranceType.MEDICAID]: 'medicaid',
            [InsuranceType.TRICARE_VA]: 'tricare_va',
            [InsuranceType.IHS]: 'ihs',
            [InsuranceType.UNINSURED]: 'uninsured',
            [InsuranceType.OTHER]: 'other',
        };
        return mapping[insuranceValue] || 'other';
    };

    // Default quiz answers, and helpers to restore position after the Epic
    // MyChart round-trip (OAuth redirects away and back, remounting the app).
    const QUIZ_DEFAULTS = {
        role: null,
        status: null,
        organs: [],
        insurance: null,
        medications: [],
        specialtyPharmacyAware: null,
        financialStatus: null,
    };
    const readQuizResume = () => {
        try {
            const saved = sessionStorage.getItem('quiz_resume');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    };
    const [step, setStep] = useState(() => {
        // Deep-link: /wizard?step=meds drops the patient straight on the
        // Medications step (step 3). The Grants & Foundations page uses this to
        // route patients who just need to build a medication list. Existing quiz
        // answers are still restored below, so this never wipes progress.
        try {
            const stepParam = new URLSearchParams(window.location.search).get('step');
            if (stepParam && ['meds', 'medications'].includes(stepParam.toLowerCase())) {
                return 3;
            }
        } catch (e) {
            // ignore and fall through to resume/default
        }
        const r = readQuizResume();
        return r && typeof r.step === 'number' ? r.step : 1;
    });
    const [answers, setAnswers] = useState(() => {
        const r = readQuizResume();
        return r && r.answers ? { ...QUIZ_DEFAULTS, ...r.answers } : { ...QUIZ_DEFAULTS };
    });

    // Persist the quiz position on every change so it survives the Epic MyChart
    // round-trip (the OAuth redirect reloads the app). Restored by the lazy
    // initializers above. This is more reliable than only saving on connect.
    useEffect(() => {
        try { sessionStorage.setItem('quiz_resume', JSON.stringify({ step, answers })); } catch (e) { /* ignore */ }
    }, [step, answers]);

    // Mirror the quiz's selected medications into the shared ChatQuiz store so
    // other surfaces, notably the Grants & Foundations "Medications" tab, can
    // display them. The wizard tracks meds as IDs in answers.medications, while
    // the context stores full medication records, so map IDs -> records here.
    // Only sync when the quiz actually has meds so we never clobber a selection
    // the patient made elsewhere (e.g. the medication chat assistant).
    useEffect(() => {
        const ids = answers.medications || [];
        if (ids.length === 0) return;
        const objs = ids
            .map(id => MEDICATIONS.find(m => m.id === id))
            .filter(Boolean);
        if (objs.length > 0) setSelectedMedications(objs);
    }, [answers.medications, MEDICATIONS, setSelectedMedications]);

    // Medication verification state - patient confirms their medications

    // Search state for Step 5
    const [medSearchTerm, setMedSearchTerm] = useState('');
    const [medSearchResult, setMedSearchResult] = useState(null);
    const [isMedSearching, setIsMedSearching] = useState(false);

    // Scroll to top when step changes for accessibility
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    // Fuse.js instance for fuzzy medication search
    const medFuse = useMemo(() => new Fuse(MEDICATIONS, {
        keys: ['brandName', 'genericName'],
        threshold: 0.4,
        includeScore: true,
        ignoreLocation: true,
        minMatchCharLength: 2
    }), [MEDICATIONS]);

    // Handle medication search
    const handleMedSearch = useCallback(() => {
        if (!medSearchTerm.trim()) {
            setMedSearchResult(null);
            setIsMedSearching(false);
            return;
        }
        const fuseResults = medFuse.search(medSearchTerm.trim());
        const matches = fuseResults.map(result => result.item);
        setMedSearchResult(matches);
        setIsMedSearching(false);
        trackServerEvent('med_search', { resultCount: matches.length, context: 'wizard' });
    }, [medSearchTerm, medFuse]);

    // Debounced search effect
    useEffect(() => {
        if (medSearchTerm.trim()) {
            setIsMedSearching(true);
        } else {
            setMedSearchResult(null);
            setIsMedSearching(false);
        }
        const timer = setTimeout(() => {
            if (medSearchTerm.trim()) handleMedSearch();
            else setMedSearchResult(null);
        }, 300);
        return () => clearTimeout(timer);
    }, [medSearchTerm, handleMedSearch]);

    // Add medication from search
    const addMedFromSearch = (medId) => {
        const currentMeds = answers.medications || [];
        if (!currentMeds.includes(medId)) {
            setAnswers({ ...answers, medications: [...currentMeds, medId] });
        }
        setMedSearchTerm('');
        setMedSearchResult(null);
    };

    const handleSingleSelect = (key, value) => {
        setAnswers({ ...answers, [key]: value });

        // Sync insurance selection to ChatQuizContext so MedicationSearch can filter copay cards correctly
        if (key === 'insurance') {
            setContextAnswer('insurance_type', mapInsuranceToContextFormat(value));
            // Anonymous, aggregate coverage-mix tracking (category only, no identity, no PHI)
            trackServerEvent('coverage_selected', { insuranceType: value });
        }
        // Anonymous, aggregate cost-burden tracking (category only, no identity, no PHI)
        if (key === 'financialStatus') {
            trackServerEvent('cost_burden', { financialStatus: value });
        }
    };

    const handleMultiSelect = (key, value) => {
        const current = answers[key];
        const updated = current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value];
        setAnswers({ ...answers, [key]: updated });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    // Navigation Logic - Updated for grouped sections
    const handleNextFromAboutYou = () => { trackServerEvent('quiz_start'); setStep(2); };
    // Step order: About You (1) → Transplant (2) → Medications (3) → Coverage (4) → Costs (5)
    const handleNextFromTransplant = () => setStep(3);
    const handleNextFromMeds = () => setStep(4);
    const handleNextFromCoverage = () => setStep(5);
    const handleNextFromCosts = () => {
        // Go directly to results
        setStep(7);
    };

    // Track quiz completion when user reaches results
    useEffect(() => {
        if (step === 7) trackServerEvent('quiz_complete');
    }, [step]);

    // Check if commercial insurance for specialty pharmacy question
    const isCommercialInsurance = answers.insurance === InsuranceType.COMMERCIAL || answers.insurance === InsuranceType.MARKETPLACE;

    // New grouped step labels with color themes
    const stepLabels = t('wizard.progress.labels', { returnObjects: true });
    const totalVisibleSteps = 5; // 5 sections shown in progress

    // Display labels for stored answer values. The values themselves (from
    // constants.js) are persisted in answers/sessionStorage and compared in
    // logic, so only the rendered label goes through i18n.
    const roleLabels = {
        [Role.PATIENT]: t('wizard.aboutYou.rolePatient'),
        [Role.CAREPARTNER]: t('wizard.aboutYou.roleCarepartner'),
        [Role.SOCIAL_WORKER]: t('wizard.aboutYou.roleSocialWorker'),
    };
    const statusLabels = {
        [TransplantStatus.PRE_EVAL]: t('wizard.aboutYou.statusPreEval'),
        [TransplantStatus.POST_ACUTE]: t('wizard.aboutYou.statusPostAcute'),
        [TransplantStatus.POST_STABLE]: t('wizard.aboutYou.statusPostStable'),
    };

    // Color themes for each step (matching the icon colors)
    const stepColors = {
        1: { bg: 'bg-emerald-500', bgLight: 'bg-emerald-100', ring: 'ring-emerald-100', text: 'text-emerald-600', textBold: 'text-emerald-700', border: 'border-emerald-500', bgSelect: 'bg-emerald-50', hoverBorder: 'hover:border-emerald-200', badge: 'bg-emerald-600' },
        2: { bg: 'bg-rose-500', bgLight: 'bg-rose-100', ring: 'ring-rose-100', text: 'text-rose-600', textBold: 'text-rose-700', border: 'border-rose-500', bgSelect: 'bg-rose-50', hoverBorder: 'hover:border-rose-200', badge: 'bg-rose-600' },
        3: { bg: 'bg-blue-500', bgLight: 'bg-blue-100', ring: 'ring-blue-100', text: 'text-blue-600', textBold: 'text-blue-700', border: 'border-blue-500', bgSelect: 'bg-blue-50', hoverBorder: 'hover:border-blue-200', badge: 'bg-blue-600' },
        4: { bg: 'bg-purple-500', bgLight: 'bg-purple-100', ring: 'ring-purple-100', text: 'text-purple-600', textBold: 'text-purple-700', border: 'border-purple-500', bgSelect: 'bg-purple-50', hoverBorder: 'hover:border-purple-200', badge: 'bg-purple-600' },
        5: { bg: 'bg-teal-500', bgLight: 'bg-teal-100', ring: 'ring-teal-100', text: 'text-teal-600', textBold: 'text-teal-700', border: 'border-teal-500', bgSelect: 'bg-teal-50', hoverBorder: 'hover:border-teal-200', badge: 'bg-teal-600' },
    };

    const renderProgress = () => {
        // For step 6 (results), show all steps as complete
        const displayStep = Math.min(step, totalVisibleSteps);
        const currentColor = stepColors[displayStep] || stepColors[1];

        return (
            <div className="mb-8 no-print">
                {/* Step indicators */}
                <div className="flex justify-between items-center mb-3">
                    {stepLabels.map((label, index) => {
                        const stepNum = index + 1;
                        const isCompleted = displayStep > stepNum;
                        const isCurrent = displayStep === stepNum;
                        const color = stepColors[stepNum];

                        return (
                            <div key={label} className="flex flex-col items-center flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                    isCompleted ? `${color.bg} text-white` :
                                    isCurrent ? `${color.bg} text-white ring-4 ${color.ring}` :
                                    'bg-slate-200 text-slate-500'
                                }`}>
                                    {isCompleted ? <CheckCircle size={16} /> : stepNum}
                                </div>
                                <span className={`text-xs mt-1 hidden sm:block ${
                                    isCurrent ? `${color.textBold} font-bold` :
                                    isCompleted ? color.text :
                                    'text-slate-600'
                                }`}>{label}</span>
                            </div>
                        );
                    })}
                </div>
                {/* Progress bar - consistent emerald color for accessibility */}
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden" role="progressbar" aria-valuenow={(displayStep / totalVisibleSteps) * 100} aria-valuemin="0" aria-valuemax="100" aria-label={t('wizard.progress.ariaLabel')}>
                    <div
                        className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(displayStep / totalVisibleSteps) * 100}%` }}
                    ></div>
                </div>
            </div>
        );
    };


    // Step 1: About You (combines Role + Status)
    if (step === 1) {
        return (
            <div className="max-w-2xl mx-auto">

                <div className="mb-4 flex justify-end">
                    <LanguageToggle />
                </div>
                {renderProgress()}
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                        <Users size={24} className="text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold">{t('wizard.aboutYou.title')}</h1>
                </div>
                <p className="text-slate-600 mb-4">{t('wizard.aboutYou.intro')}</p>
                <p className="text-sm text-slate-500 mb-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <Trans i18nKey="wizard.aboutYou.note" />
                </p>

                {/* Question 1a: Role */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded">{t('wizard.aboutYou.roleBadge')}</span>
                        <h2 className="text-lg font-bold text-slate-800">{t('wizard.aboutYou.roleQuestion')}</h2>
                    </div>
                    <div className="space-y-3" role="radiogroup" aria-label={t('wizard.aboutYou.roleAria')}>
                        {Object.values(Role).map((r) => (
                            <button
                                key={r}
                                onClick={() => handleSingleSelect('role', r)}
                                className={`w-full p-5 text-left rounded-xl border-3 transition-all duration-200 flex justify-between items-center shadow-sm ${
                                    answers.role === r
                                        ? 'border-emerald-600 bg-emerald-100 ring-2 ring-emerald-300 shadow-md'
                                        : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md'
                                }`}
                                role="radio"
                                aria-checked={answers.role === r}
                            >
                                <span className={`font-bold text-lg ${answers.role === r ? 'text-emerald-800' : 'text-slate-800'}`}>{roleLabels[r]}</span>
                                {answers.role === r && <CheckCircle className="text-emerald-600" size={24} aria-hidden="true" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question 1b: Status - shows after role is selected */}
                {answers.role && (
                    <div className="mb-8 ">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded">{t('wizard.aboutYou.statusBadge')}</span>
                            <h2 className="text-lg font-bold text-slate-800">{t('wizard.aboutYou.statusQuestion')}</h2>
                        </div>
                        <div className="space-y-3" role="radiogroup" aria-label={t('wizard.aboutYou.statusAria')}>
                            {Object.values(TransplantStatus).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleSingleSelect('status', s)}
                                    className={`w-full p-5 text-left rounded-xl border-3 transition-all duration-200 flex justify-between items-center shadow-sm ${
                                        answers.status === s
                                            ? 'border-emerald-600 bg-emerald-100 ring-2 ring-emerald-300 shadow-md'
                                            : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md'
                                    }`}
                                    role="radio"
                                    aria-checked={answers.status === s}
                                >
                                    <span className={`font-bold text-lg ${answers.status === s ? 'text-emerald-800' : 'text-slate-800'}`}>{statusLabels[s]}</span>
                                    {answers.status === s && <CheckCircle className="text-emerald-600" size={24} aria-hidden="true" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Next button - enabled when both role and status are selected */}
                <button
                    disabled={!answers.role || !answers.status}
                    onClick={handleNextFromAboutYou}
                    className="w-full py-3 bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-lg disabled:cursor-not-allowed transition hover:bg-emerald-800"
                    aria-label={t('wizard.nav.nextAria')}
                >
                    {t('wizard.nav.nextSection')}
                </button>
            </div>
        );
    }

    // Step 2: Your Transplant (Organ selection)
    if (step === 2) {
        return (
            <div className="max-w-2xl mx-auto">

                {renderProgress()}
                <button onClick={prevStep} className="text-slate-700 mb-4 flex items-center gap-1 text-sm hover:text-emerald-600 min-h-[44px] min-w-[44px]" aria-label={t('wizard.nav.backAria')}><ChevronLeft size={16} aria-hidden="true" /> {t('wizard.nav.back')}</button>
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-rose-100 p-2 rounded-lg">
                        <Heart size={24} className="text-rose-600" />
                    </div>
                    <h1 className="text-2xl font-bold">{t('wizard.transplant.title')}</h1>
                </div>
                <p className="text-slate-600 mb-6">{t('wizard.transplant.intro')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8" role="group" aria-label={t('wizard.transplant.groupAria')}>
                    {Object.values(OrganType).map((o) => (
                        <button
                            key={o}
                            onClick={() => handleMultiSelect('organs', o)}
                            className={`p-5 text-left rounded-xl border-3 transition-all duration-200 flex justify-between items-center shadow-sm ${
                                answers.organs.includes(o)
                                    ? 'border-rose-600 bg-rose-100 ring-2 ring-rose-300 shadow-md'
                                    : 'border-slate-300 bg-slate-50 hover:border-rose-400 hover:bg-rose-50 hover:shadow-md'
                            }`}
                            role="checkbox"
                            aria-checked={answers.organs.includes(o)}
                        >
                            <span className={`font-bold text-lg ${answers.organs.includes(o) ? 'text-rose-800' : 'text-slate-800'}`}>{t(`wizard.organs.${o}`)}</span>
                            {answers.organs.includes(o) && <CheckCircle size={24} className="text-rose-600" aria-hidden="true" />}
                        </button>
                    ))}
                </div>
                <button
                    disabled={answers.organs.length === 0}
                    onClick={handleNextFromTransplant}
                    className="w-full py-3 bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-lg disabled:cursor-not-allowed transition hover:bg-emerald-800"
                    aria-label={t('wizard.nav.nextAria')}
                >
                    {t('wizard.nav.nextSection')}
                </button>
            </div>
        );
    }

    // Step 4: Your Coverage (combines Insurance + Specialty Pharmacy for commercial)
    if (step === 4) {
        const insuranceOptions = [
            {
                value: InsuranceType.COMMERCIAL,
                label: t('wizard.coverage.commercialLabel'),
                description: t('wizard.coverage.commercialDescription'),
                helpText: t('wizard.coverage.commercialHelp')
            },
            {
                value: InsuranceType.MEDICARE,
                label: t('wizard.coverage.medicareLabel'),
                description: t('wizard.coverage.medicareDescription'),
                helpText: t('wizard.coverage.medicareHelp')
            },
            {
                value: InsuranceType.MEDICAID,
                label: t('wizard.coverage.medicaidLabel'),
                description: t('wizard.coverage.medicaidDescription'),
                helpText: t('wizard.coverage.medicaidHelp')
            },
            {
                value: InsuranceType.TRICARE_VA,
                label: t('wizard.coverage.tricareLabel'),
                description: t('wizard.coverage.tricareDescription'),
                helpText: t('wizard.coverage.tricareHelp')
            },
            {
                value: InsuranceType.IHS,
                label: t('wizard.coverage.ihsLabel'),
                description: t('wizard.coverage.ihsDescription'),
                helpText: t('wizard.coverage.ihsHelp')
            },
            {
                value: InsuranceType.UNINSURED,
                label: t('wizard.coverage.uninsuredLabel'),
                description: t('wizard.coverage.uninsuredDescription'),
                helpText: t('wizard.coverage.uninsuredHelp')
            }
        ];

        // Rendered labels for the specialty-pharmacy options; the raw
        // 'Yes'/'No'/'Not Sure' values drive the selection logic below.
        const pharmacyOptionLabels = {
            'Yes': t('wizard.coverage.yes'),
            'No': t('wizard.coverage.no'),
            'Not Sure': t('wizard.coverage.notSure'),
        };

        return (
            <div className="max-w-2xl mx-auto">

                {renderProgress()}
                <button onClick={prevStep} className="text-slate-700 mb-4 flex items-center gap-1 text-sm hover:text-emerald-600 min-h-[44px] min-w-[44px]" aria-label={t('wizard.nav.backAria')}><ChevronLeft size={16} aria-hidden="true" /> {t('wizard.nav.back')}</button>
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <Shield size={24} className="text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold">{t('wizard.coverage.title')}</h1>
                </div>
                <div className="flex items-center gap-2 mb-6 text-slate-700">
                    <Lightbulb className="text-amber-500 flex-shrink-0" size={18} aria-hidden="true" />
                    <p className="text-sm"><strong>{t('wizard.coverage.tip')}</strong></p>
                </div>

                {/* Question 3a: Insurance Type */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">{t('wizard.coverage.insuranceBadge')}</span>
                        <h2 className="text-lg font-bold text-slate-800">{t('wizard.coverage.insuranceQuestion')}</h2>
                    </div>
                    <div className="space-y-3" role="radiogroup" aria-label={t('wizard.coverage.insuranceAria')}>
                        {insuranceOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSingleSelect('insurance', option.value)}
                                className={`w-full p-5 text-left rounded-xl border-3 transition-all duration-200 shadow-sm ${
                                    answers.insurance === option.value
                                        ? 'border-blue-600 bg-blue-100 ring-2 ring-blue-300 shadow-md'
                                        : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
                                }`}
                                role="radio"
                                aria-checked={answers.insurance === option.value}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className={`font-bold text-lg ${answers.insurance === option.value ? 'text-blue-800' : 'text-blue-700'}`}>{option.label}</div>
                                        <div className={`text-sm mt-1 ${answers.insurance === option.value ? 'text-blue-700' : 'text-slate-600'}`}>{option.description}</div>
                                        {option.helpText && (
                                            <div className={`text-sm mt-2 flex items-center gap-1 ${answers.insurance === option.value ? 'text-blue-800 font-medium' : 'text-blue-700'}`}>
                                                <Lightbulb className="text-amber-500" size={14} aria-hidden="true" />
                                                {option.helpText}
                                            </div>
                                        )}
                                    </div>
                                    {answers.insurance === option.value && <CheckCircle className="text-blue-600 flex-shrink-0" size={24} aria-hidden="true" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question 3b: Specialty Pharmacy - only shows for commercial insurance */}
                {isCommercialInsurance && answers.insurance && (
                    <div className="mb-8 ">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">{t('wizard.coverage.pharmacyBadge')}</span>
                            <h2 className="text-lg font-bold text-slate-800">{t('wizard.coverage.pharmacyQuestion')}</h2>
                        </div>
                        <p className="text-slate-600 text-sm mb-4">{t('wizard.coverage.pharmacyIntro')}</p>
                        <div className="space-y-3" role="radiogroup" aria-label={t('wizard.coverage.pharmacyAria')}>
                            {['Yes', 'No', 'Not Sure'].map(opt => {
                                const isSelected = (opt === 'Yes' && answers.specialtyPharmacyAware === true) ||
                                    (opt === 'No' && answers.specialtyPharmacyAware === false) ||
                                    (opt === 'Not Sure' && answers.specialtyPharmacyAware === null && answers.insurance);
                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleSingleSelect('specialtyPharmacyAware', opt === 'Yes' ? true : opt === 'No' ? false : null)}
                                        className={`w-full p-5 text-left rounded-xl border-3 transition-all duration-200 flex justify-between items-center shadow-sm ${
                                            isSelected
                                                ? 'border-blue-600 bg-blue-100 ring-2 ring-blue-300 shadow-md'
                                                : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
                                        }`}
                                        role="radio"
                                        aria-checked={
                                            (opt === 'Yes' && answers.specialtyPharmacyAware === true) ||
                                            (opt === 'No' && answers.specialtyPharmacyAware === false)
                                        }
                                    >
                                        <span className={`font-bold text-lg ${isSelected ? 'text-blue-800' : 'text-slate-800'}`}>{pharmacyOptionLabels[opt]}</span>
                                        {((opt === 'Yes' && answers.specialtyPharmacyAware === true) ||
                                          (opt === 'No' && answers.specialtyPharmacyAware === false)) &&
                                            <CheckCircle className="text-blue-600" size={24} aria-hidden="true" />
                                        }
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Next button */}
                <button
                    disabled={!answers.insurance}
                    onClick={handleNextFromCoverage}
                    className="w-full py-3 bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-lg disabled:cursor-not-allowed transition hover:bg-emerald-800"
                    aria-label={t('wizard.nav.nextAria')}
                >
                    {t('wizard.nav.nextSection')}
                </button>
            </div>
        );
    }

    // Step 3: Your Medications
    if (step === 3) {
        const isPreTransplant = answers.status === TransplantStatus.PRE_EVAL;

        return (
            <div className="max-w-3xl mx-auto">

                {renderProgress()}
                <button onClick={prevStep} className="text-slate-700 mb-4 flex items-center gap-1 text-sm hover:text-emerald-600 min-h-[44px] min-w-[44px]" aria-label={t('wizard.nav.backAria')}><ChevronLeft size={16} aria-hidden="true" /> {t('wizard.nav.back')}</button>
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <Pill size={24} className="text-purple-600" />
                        </div>
                        <h1 className="text-2xl font-bold">{t('wizard.meds.title')}</h1>
                    </div>
                    <p className="text-slate-600">
                        {t('wizard.meds.intro')}
                    </p>
                </div>

                {/* Epic MyChart Integration */}
                <EpicConnectButton
                    className="mb-6"
                    onBeforeConnect={() => {
                        try { sessionStorage.setItem('quiz_resume', JSON.stringify({ step, answers })); } catch (e) { /* ignore */ }
                    }}
                    onMedicationsImported={(matchedIds) => {
                        const currentMeds = answers.medications || [];
                        const newMeds = matchedIds.filter(id => !currentMeds.includes(id));
                        if (newMeds.length > 0) {
                            setAnswers(prev => ({ ...prev, medications: [...prev.medications, ...newMeds] }));
                        }
                    }}
                />

                {/* Selected Medications Display, imported/downloaded meds appear first */}
                {(answers.medications || []).length > 0 && (
                    <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle size={18} className="text-emerald-600" />
                            <h3 className="font-bold text-slate-800">{t('wizard.meds.selectedHeading', { count: (answers.medications || []).length })}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(answers.medications || []).map(id => {
                                const med = MEDICATIONS.find(m => m.id === id);
                                return (
                                    <span key={id} className="bg-white text-slate-700 px-3 py-1.5 rounded-full text-sm border border-emerald-200 shadow-sm flex items-center gap-2">
                                        <Pill size={14} className="text-emerald-600" />
                                        {medDisplayName(med) || id}
                                        <button
                                            onClick={() => handleMultiSelect('medications', id)}
                                            className="text-slate-400 hover:text-red-500 transition"
                                            aria-label={t('wizard.meds.removeAria', { name: med?.brandName || id })}
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Divider: manual options for patients who can't or don't want to connect */}
                <div className="relative mb-6" role="separator" aria-label={t('wizard.meds.separatorAria')}>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-sm font-semibold text-slate-500">{t('wizard.meds.separatorLabel')}</span>
                    </div>
                </div>

                {/* Medication Search Box, add a medication if needed */}
                <div className="mb-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <Search size={18} className="text-emerald-600" />
                        <h3 className="font-bold text-slate-800">{t('wizard.meds.searchHeadingPre')}<span className="text-emerald-600">+</span>{t('wizard.meds.searchHeadingPost')}</h3>
                    </div>
                    <div className="relative">
                        <label htmlFor="wizard-med-search" className="sr-only">{t('wizard.meds.searchLabel')}</label>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                        <input
                            id="wizard-med-search"
                            type="text"
                            placeholder={t('wizard.meds.searchPlaceholder')}
                            className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                            value={medSearchTerm}
                            onChange={(e) => setMedSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') { setMedSearchResult(null); setMedSearchTerm(''); }
                            }}
                        />
                        {isMedSearching ? (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 size={18} className="text-emerald-600 animate-spin" aria-label={t('wizard.meds.searchingAria')} />
                            </div>
                        ) : medSearchTerm && (
                            <button onClick={() => { setMedSearchTerm(''); setMedSearchResult(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={t('wizard.meds.clearSearchAria')}>
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    {medSearchResult && medSearchTerm && !isMedSearching && (
                        <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
                            {medSearchResult.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {medSearchResult.slice(0, 8).map(med => {
                                        const isAlreadySelected = (answers.medications || []).includes(med.id);
                                        return (
                                            <button
                                                key={med.id}
                                                onClick={() => addMedFromSearch(med.id)}
                                                disabled={isAlreadySelected}
                                                className="w-full text-left p-3 hover:bg-emerald-50 flex justify-between items-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div>
                                                    <span className="font-bold text-slate-900">{localizeMedName(med.brandName)}</span>
                                                    <span className="text-sm text-slate-600 ml-2">({localizeMedName(med.genericName)})</span>
                                                </div>
                                                {isAlreadySelected ? (
                                                    <span className="text-emerald-600 text-sm font-medium flex items-center gap-1"><CheckCircle size={14} /> {t('wizard.meds.added')}</span>
                                                ) : (
                                                    <span className="text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><PlusCircle size={12} /> {t('wizard.meds.add')}</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                    {t('wizard.meds.noResults')}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Organ-Specific Medication Guide, common meds by organ, shown last */}
                {isPreTransplant ? (
                    <PreTransplantMedicationGuide answers={answers} onMedicationClick={setMedSearchTerm} />
                ) : (
                    <OrganMedicationGuide answers={answers} onMedicationToggle={(id) => handleMultiSelect('medications', id)} />
                )}

                {/* Important Medical Information */}
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                            <p className="font-bold mb-2">{t('wizard.meds.medicalInfoTitle')}</p>
                            <p>
                                {t('wizard.meds.medicalInfoText')}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleNextFromMeds}
                    className="w-full py-3 font-bold rounded-lg shadow-md transition-all min-h-[48px] bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                    aria-label={t('wizard.nav.nextAria')}
                >
                    {t('wizard.meds.continueButton')}
                </button>
            </div>
        );
    }

    // Step 5: Your Costs (Financial Status)
    if (step === 5) {
        return (
            <div className="max-w-2xl mx-auto">

                {renderProgress()}
                <button onClick={prevStep} className="text-slate-700 mb-4 flex items-center gap-1 text-sm hover:text-emerald-600 min-h-[44px] min-w-[44px]" aria-label={t('wizard.nav.backAria')}><ChevronLeft size={16} aria-hidden="true" /> {t('wizard.nav.back')}</button>
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-amber-100 p-2 rounded-lg">
                        <DollarSign size={24} className="text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-bold">{t('wizard.costs.title')}</h1>
                </div>
                <p className="text-slate-600 mb-6">{t('wizard.costs.intro')}</p>

                <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200 text-sm text-slate-600" role="note">
                    {t('wizard.costs.note')}
                </div>

                <div className="space-y-4" role="radiogroup" aria-label={t('wizard.costs.groupAria')}>
                    {[
                        { val: FinancialStatus.MANAGEABLE, label: t('wizard.costs.manageableLabel'), desc: t('wizard.costs.manageableDesc'), color: 'emerald' },
                        { val: FinancialStatus.CHALLENGING, label: t('wizard.costs.challengingLabel'), desc: t('wizard.costs.challengingDesc'), color: 'amber' },
                        { val: FinancialStatus.UNAFFORDABLE, label: t('wizard.costs.unaffordableLabel'), desc: t('wizard.costs.unaffordableDesc'), color: 'orange' },
                        { val: FinancialStatus.CRISIS, label: t('wizard.costs.crisisLabel'), desc: t('wizard.costs.crisisDesc'), color: 'rose' },
                    ].map(opt => {
                        const isSelected = answers.financialStatus === opt.val;
                        const colorStyles = {
                            emerald: {
                                selected: 'border-emerald-600 bg-emerald-100 ring-2 ring-emerald-300',
                                unselected: 'border-emerald-300 bg-emerald-50 hover:border-emerald-500 hover:bg-emerald-100',
                                label: isSelected ? 'text-emerald-800' : 'text-emerald-700',
                                desc: isSelected ? 'text-emerald-700' : 'text-emerald-600',
                                icon: 'text-emerald-600'
                            },
                            amber: {
                                selected: 'border-amber-600 bg-amber-100 ring-2 ring-amber-300',
                                unselected: 'border-amber-300 bg-amber-50 hover:border-amber-500 hover:bg-amber-100',
                                label: isSelected ? 'text-amber-800' : 'text-amber-700',
                                desc: isSelected ? 'text-amber-700' : 'text-amber-600',
                                icon: 'text-amber-600'
                            },
                            orange: {
                                selected: 'border-orange-600 bg-orange-100 ring-2 ring-orange-300',
                                unselected: 'border-orange-300 bg-orange-50 hover:border-orange-500 hover:bg-orange-100',
                                label: isSelected ? 'text-orange-800' : 'text-orange-700',
                                desc: isSelected ? 'text-orange-700' : 'text-orange-600',
                                icon: 'text-orange-600'
                            },
                            rose: {
                                selected: 'border-rose-600 bg-rose-100 ring-2 ring-rose-300',
                                unselected: 'border-rose-300 bg-rose-50 hover:border-rose-500 hover:bg-rose-100',
                                label: isSelected ? 'text-rose-800' : 'text-rose-700',
                                desc: isSelected ? 'text-rose-700' : 'text-rose-600',
                                icon: 'text-rose-600'
                            }
                        };
                        const styles = colorStyles[opt.color];
                        return (
                            <button
                                key={opt.val}
                                onClick={() => { handleSingleSelect('financialStatus', opt.val); handleNextFromCosts(); }}
                                className={`w-full p-5 text-left rounded-xl border-3 transition-all duration-200 shadow-sm hover:shadow-md ${
                                    isSelected ? styles.selected + ' shadow-md' : styles.unselected
                                }`}
                                role="radio"
                                aria-checked={isSelected}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`font-bold text-xl ${styles.label}`}>{opt.label}</span>
                                    {isSelected && <CheckCircle className={styles.icon} size={24} aria-hidden="true" />}
                                </div>
                                <div className={`text-base ${styles.desc}`}>{opt.desc}</div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Step 7: Results (formerly step 6 was email collection, now skipped)
    if (step === 7) {
        const isKidney = answers.organs.includes(OrganType.KIDNEY);
        const isMedicare = answers.insurance === InsuranceType.MEDICARE;
        const isCommercial = answers.insurance === InsuranceType.COMMERCIAL || answers.insurance === InsuranceType.MARKETPLACE;
        const isUninsured = answers.insurance === InsuranceType.UNINSURED;
        const financial = answers.financialStatus;
        // Manufacturer PAPs are brand-only. When every selected medication is a
        // generic, the "check manufacturer PAPs" step doesn't apply — swap in
        // generic-specific guidance so the plan matches the patient's list.
        const resultsMeds = (answers.medications || [])
            .map((id) => MEDICATIONS.find((m) => m.id === id))
            .filter(Boolean);
        const hasOnlyGenericMeds = resultsMeds.length > 0 && resultsMeds.every(
            (m) => /\(generic\)/i.test(m.brandName || '') || (m.manufacturer || '').toLowerCase() === 'generic'
        );

        return (
            <article className="max-w-4xl mx-auto space-y-8 pb-12">

                {/* Back Button */}
                <button
                    onClick={() => setStep(5)}
                    className="text-slate-700 flex items-center gap-1 text-sm hover:text-emerald-600 min-h-[44px] min-w-[44px] no-print"
                    aria-label={t('wizard.results.backAria')}
                >
                    <ChevronLeft size={16} aria-hidden="true" /> {t('wizard.nav.back')}
                </button>

                {/* Header */}
                <div className={`p-8 rounded-2xl shadow-xl text-white flex justify-between items-start ${
                    financial === FinancialStatus.CRISIS || financial === FinancialStatus.UNAFFORDABLE
                    ? 'bg-indigo-900'
                    : 'bg-emerald-900'
                }`}>
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{t('wizard.results.title')}</h1>
                        <p className="opacity-90">
                            {t('wizard.results.subtitle')}
                        </p>
                    </div>
                    <button 
                        onClick={() => window.print()}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border border-white/20 transition no-print"
                        aria-label={t('wizard.results.printAria')}
                    >
                        <Printer size={16} aria-hidden="true" /> {t('wizard.results.printButton')}
                    </button>
                </div>

                {/* Critical Alerts */}
                {isKidney && isMedicare && (
                    <aside className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-600" role="alert" aria-labelledby="medicare-alert">
                        <h2 id="medicare-alert" className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                            <AlertCircle aria-hidden="true" /> {t('wizard.results.medicareAlert.title')}
                        </h2>
                        <p className="mt-2 text-slate-700">
                            <Trans i18nKey="wizard.results.medicareAlert.text" />
                        </p>
                        <a href="https://www.medicare.gov" target="_blank" rel="noreferrer" className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition no-print">
                            {t('wizard.results.medicareAlert.cta')}
                        </a>
                    </aside>
                )}
                
                <div className="grid md:grid-cols-2 gap-6">

                    {/* Column 1 (Left): Med List & Tools */}
                    <div className="space-y-6">
                        <section className="bg-slate-50 p-6 rounded-xl border border-slate-200" aria-labelledby="med-list-heading">
                            <h2 id="med-list-heading" className="font-bold text-slate-800 mb-4">{t('wizard.results.medListTitle')}</h2>
                            {(answers.medications || []).length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(answers.medications || []).map(id => {
                                        const med = MEDICATIONS.find(m => m.id === id);
                                        return (
                                            <span key={id} className="bg-white text-slate-700 px-3 py-1 rounded-full text-sm border border-slate-200 shadow-sm flex items-center gap-1">
                                                {medDisplayName(med)}
                                                <button
                                                    onClick={() => handleMultiSelect('medications', id)}
                                                    className="text-slate-400 hover:text-red-500 ml-1"
                                                    aria-label={t('wizard.meds.removeAria', { name: med?.brandName })}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Add More Medications */}
                            <div className="mb-4 no-print">
                                <div className="relative">
                                    <label htmlFor="results-med-search" className="sr-only">{t('wizard.results.addMoreLabel')}</label>
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
                                    <input
                                        id="results-med-search"
                                        type="text"
                                        placeholder={t('wizard.results.addMorePlaceholder')}
                                        className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition text-sm"
                                        value={medSearchTerm}
                                        onChange={(e) => setMedSearchTerm(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') { setMedSearchResult(null); setMedSearchTerm(''); }
                                        }}
                                    />
                                    {medSearchTerm && (
                                        <button onClick={() => { setMedSearchTerm(''); setMedSearchResult(null); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={t('wizard.meds.clearSearchAria')}>
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                {medSearchResult && medSearchTerm && !isMedSearching && (
                                    <div className="mt-1 bg-white border border-slate-200 rounded-lg max-h-48 overflow-y-auto shadow-sm">
                                        {medSearchResult.length > 0 ? (
                                            <div className="divide-y divide-slate-100">
                                                {medSearchResult.slice(0, 6).map(med => {
                                                    const isAlreadySelected = (answers.medications || []).includes(med.id);
                                                    return (
                                                        <button
                                                            key={med.id}
                                                            onClick={() => addMedFromSearch(med.id)}
                                                            disabled={isAlreadySelected}
                                                            className="w-full text-left p-2 hover:bg-emerald-50 flex justify-between items-center transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                        >
                                                            <div>
                                                                <span className="font-medium text-slate-900">{localizeMedName(med.brandName)}</span>
                                                                <span className="text-slate-500 ml-1">({localizeMedName(med.genericName)})</span>
                                                            </div>
                                                            {isAlreadySelected ? (
                                                                <span className="text-emerald-600 text-xs"><CheckCircle size={14} /></span>
                                                            ) : (
                                                                <span className="text-emerald-600 text-xs"><PlusCircle size={14} /></span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-2 text-center text-slate-500 text-xs">
                                                {t('wizard.results.noResults')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 no-print">
                                {answers.medications.length > 0 && (
                                    <Link
                                        to={`/medications?ids=${answers.medications.join(',')}`}
                                        className="w-full block text-center py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2"
                                        aria-label={t('wizard.results.viewPricesAria')}
                                    >
                                        <DollarSign size={22} aria-hidden="true" />
                                        {t('wizard.results.viewPricesButton')}
                                    </Link>
                                )}
                            </div>
                        </section>

                        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 break-inside-avoid" aria-labelledby="tools-heading">
                            <h2 id="tools-heading" className="font-bold text-slate-800 mb-4">{t('wizard.results.toolsTitle')}</h2>
                            <p className="text-sm text-slate-600 mb-4">{t('wizard.results.toolsIntro')}</p>

                            <Link to="/application-help" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 group transition" aria-label={t('wizard.results.appEducationAria')}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-100 text-emerald-600 p-2 rounded" aria-hidden="true"><HeartHandshake size={18} /></div>
                                    <div>
                                        <span className="font-bold text-slate-800 block text-sm">{t('wizard.results.appEducationTitle')}</span>
                                        <span className="text-xs text-slate-600">{t('wizard.results.appEducationDesc')}</span>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-600 no-print" aria-hidden="true" />
                            </Link>

                            <Link to="/education" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 group transition mt-2" aria-label={t('wizard.results.insuranceAria')}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-100 text-amber-600 p-2 rounded" aria-hidden="true"><Shield size={18} /></div>
                                    <div>
                                        <span className="font-bold text-slate-800 block text-sm">{t('wizard.results.insuranceTitle')}</span>
                                        <span className="text-xs text-slate-600">{t('wizard.results.insuranceDesc')}</span>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-600 no-print" aria-hidden="true" />
                            </Link>
                        </section>
                    </div>

                    {/* Column 2 (Right): Strategy / Action Plan */}
                    <div className="space-y-6">
                        {financial === FinancialStatus.MANAGEABLE && (
                            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200" aria-labelledby="savings-heading">
                                <h2 id="savings-heading" className="text-lg font-bold text-emerald-800 border-b pb-2 mb-4 flex items-center gap-2">
                                    <DollarSign size={20} aria-hidden="true" /> {t('wizard.results.manageable.title')}
                                </h2>
                                <ul className="space-y-4 text-slate-700">
                                    {isCommercial && (
                                        <li className="flex gap-3 items-start">
                                            <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded mt-0.5" aria-label={t('wizard.results.manageable.priorityAria')}>{t('wizard.results.manageable.priorityBadge')}</div>
                                            <div>
                                                <strong>{t('wizard.results.manageable.copayPre')}<TermTooltip term="copay">{t('wizard.results.manageable.copayTerm')}</TermTooltip>{t('wizard.results.manageable.copayPost')}</strong>
                                                <p className="text-sm text-slate-600 mt-1">{t('wizard.results.manageable.copayText')}</p>
                                            </div>
                                        </li>
                                    )}
                                    <li className="flex gap-3 items-start">
                                        <div className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mt-0.5" aria-label={t('wizard.results.manageable.compareAria')}>{t('wizard.results.manageable.compareBadge')}</div>
                                        <div>
                                            <strong>{t('wizard.results.manageable.cashTitle')}</strong>
                                            <p className="text-sm text-slate-600 mt-1">{t('wizard.results.manageable.cashText')}</p>
                                        </div>
                                    </li>
                                    {isCommercial && (
                                        <li className="flex gap-3 items-start">
                                            <div className="bg-slate-100 text-slate-800 text-xs font-bold px-2 py-1 rounded mt-0.5" aria-label={t('wizard.results.manageable.verifyAria')}>{t('wizard.results.manageable.verifyBadge')}</div>
                                            <div>
                                                <strong><TermTooltip term="specialty-pharmacy">{t('wizard.results.manageable.spTerm')}</TermTooltip>{t('wizard.results.manageable.spPost')}</strong>
                                                <p className="text-sm text-slate-600 mt-1">{t('wizard.results.manageable.spText')}</p>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <p className="text-sm text-slate-600 italic">{t('wizard.results.manageable.tipPre')}<TermTooltip term="pap">{t('wizard.results.manageable.tipTerm')}</TermTooltip>{t('wizard.results.manageable.tipPost')}</p>
                                </div>
                            </section>
                        )}

                        {financial === FinancialStatus.CHALLENGING && (
                            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200" aria-labelledby="burden-heading">
                                <h2 id="burden-heading" className="text-lg font-bold text-amber-700 border-b pb-2 mb-4 flex items-center gap-2">
                                    <Shield size={20} aria-hidden="true" /> {t('wizard.results.challenging.title')}
                                </h2>
                                <ul className="space-y-4 text-slate-700">
                                    <li className="flex gap-3 items-start">
                                        <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded mt-0.5" aria-label={t('wizard.results.challenging.step1Aria')}>{t('wizard.results.challenging.step1Badge')}</div>
                                        <div>
                                            <strong>{hasOnlyGenericMeds ? t('wizard.results.challenging.papTitleGeneric') : t('wizard.results.challenging.papTitle')}</strong>
                                            <p className="text-sm text-slate-600 mt-1">{hasOnlyGenericMeds ? t('wizard.results.challenging.papTextGeneric') : t('wizard.results.challenging.papText')}</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <div className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-1 rounded mt-0.5" aria-label={t('wizard.results.challenging.step2Aria')}>{t('wizard.results.challenging.step2Badge')}</div>
                                        <div>
                                            <strong>{t('wizard.results.challenging.foundationsPre')}<TermTooltip term="foundation-grant">{t('wizard.results.challenging.foundationsTerm')}</TermTooltip>{t('wizard.results.challenging.foundationsPost')}</strong>
                                            <p className="text-sm text-slate-600 mt-1">{t('wizard.results.challenging.foundationsText')}</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <div className="bg-slate-100 text-slate-800 text-xs font-bold px-2 py-1 rounded mt-0.5" aria-label={t('wizard.results.challenging.step3Aria')}>{t('wizard.results.challenging.step3Badge')}</div>
                                        <div>
                                            <strong>{t('wizard.results.challenging.cashTitle')}</strong>
                                            <p className="text-sm text-slate-600 mt-1">{t('wizard.results.challenging.cashText')}</p>
                                        </div>
                                    </li>
                                </ul>
                            </section>
                        )}

                        {(financial === FinancialStatus.UNAFFORDABLE || financial === FinancialStatus.CRISIS) && (
                            <section className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-rose-500" role="alert" aria-labelledby="assistance-heading">
                                <h2 id="assistance-heading" className="text-lg font-bold text-rose-800 border-b pb-2 mb-4 flex items-center gap-2">
                                    <AlertTriangle size={20} aria-hidden="true" /> {t('wizard.results.crisis.title')}
                                </h2>
                                {financial === FinancialStatus.CRISIS && (
                                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-4">
                                        <p className="text-rose-900 font-semibold">{t('wizard.results.crisis.callTeamTitle')}</p>
                                        <p className="text-rose-800 text-sm mt-1">{t('wizard.results.crisis.callTeamText')}</p>
                                        <p className="text-rose-700 text-xs mt-2">{t('wizard.results.crisis.notEmergency')}</p>
                                    </div>
                                )}
                                <Link to="/education?topic=EMERGENCY" className="flex items-center gap-3 bg-rose-600 text-white p-3 rounded-lg font-semibold hover:bg-rose-700 transition mb-4">
                                    <Clock size={20} aria-hidden="true" />
                                    <span>{t('wizard.results.crisis.emergencyLink')}</span>
                                </Link>
                                {financial === FinancialStatus.CRISIS && (
                                    <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded">
                                        {t('wizard.results.crisis.notAlone')}
                                    </p>
                                )}
                                <ol className="space-y-4 text-slate-700 list-decimal pl-6">
                                    <li>
                                        <strong>{hasOnlyGenericMeds ? t('wizard.results.crisis.papTitleGeneric') : t('wizard.results.crisis.papTitle')}</strong>
                                        <p className="text-sm text-slate-600 mt-1">
                                            {hasOnlyGenericMeds ? t('wizard.results.crisis.papTextGeneric') : t('wizard.results.crisis.papText')}
                                            <br/>
                                            <Link to={`/medications?ids=${(answers.medications || []).join(',')}`} className="text-rose-700 font-bold underline">{t('wizard.results.crisis.papLinkText')}</Link>{hasOnlyGenericMeds ? t('wizard.results.crisis.papLinkPostGeneric') : t('wizard.results.crisis.papLinkPost')}
                                        </p>
                                    </li>
                                    <li>
                                        <strong>{t('wizard.results.crisis.medicaidTitle')}</strong>
                                        <p className="text-sm text-slate-600 mt-1">{t('wizard.results.crisis.medicaidText')}</p>
                                    </li>
                                    {answers.insurance === InsuranceType.IHS && (
                                        <li>
                                            <strong>{t('wizard.results.crisis.ihsTitle')}</strong>
                                            <p className="text-sm text-slate-600 mt-1">{t('wizard.results.crisis.ihsText')}</p>
                                        </li>
                                    )}
                                </ol>
                                <div className="mt-5 pt-4 border-t border-slate-200">
                                    <h3 className="font-bold text-slate-800 text-sm mb-2">{t('wizard.results.crisis.notQualifyTitle')}</h3>
                                    <p className="text-sm text-slate-600 mb-2">{t('wizard.results.crisis.notQualifyIntro')}</p>
                                    <ul className="space-y-2 text-sm text-slate-700 list-disc pl-6">
                                        <li><Trans i18nKey="wizard.results.crisis.tryPrograms" /></li>
                                        <li><Trans i18nKey="wizard.results.crisis.tryCharity" /></li>
                                        <li><Trans i18nKey="wizard.results.crisis.tryCash" /></li>
                                        <li><strong>{t('wizard.results.crisis.appealTitle')}</strong>{t('wizard.results.crisis.appealMid')}<Link to="/education" className="text-rose-700 font-semibold underline">{t('wizard.results.crisis.appealLink')}</Link>{t('wizard.results.crisis.appealPost')}</li>
                                    </ul>
                                    <Link to="/application-help" className="inline-block mt-3 text-rose-700 font-semibold underline text-sm">{t('wizard.results.crisis.getHelpLink')}</Link>
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                <div className="text-center pt-8 border-t border-slate-100 no-print">
                    <button onClick={() => setStep(1)} className="text-slate-700 hover:text-emerald-600 text-sm underline min-h-[44px] px-4" aria-label={t('wizard.results.restartAria')}>{t('wizard.results.restart')}</button>
                </div>
            </article>
        );
    }
    return <div>{t('wizard.loading')}</div>;
};

// --- PRICE REPORTING HELPERS ---

export default Wizard;
