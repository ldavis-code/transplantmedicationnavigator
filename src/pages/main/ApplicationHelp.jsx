import { useState, useEffect, useCallback, lazy, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import Fuse from 'fuse.js';
import { useChatQuiz } from '../../context/ChatQuizContext.jsx';
import EpicConnectButton from '../../components/EpicConnectButton.jsx';
import LanguageToggle from '../../components/LanguageToggle.jsx';
import { useMedicationsList } from '../../context/MedicationsContext.jsx';
import { Search, ShieldCheck, ArrowRight, X, HeartHandshake, CheckCircle, DollarSign, Shield, AlertTriangle, AlertCircle, Printer, ExternalLink, PlusCircle, List, Info, Copy, Check, FileText, Phone, ClipboardList, CheckSquare, Square, Stethoscope, AlertOctagon, Pill, Loader2, Sparkles, Filter } from 'lucide-react';
import APPLICATION_CHECKLIST_DATA from '../../data/application-checklist.json';
import APPLICATION_CHECKLIST_ES from '../../data/application-checklist.es.json';
import { localizeMedName } from '../../utils/medNames.js';
import { useMetaTags } from '../../hooks/useMetaTags.js';
import { seoMetadata } from '../../data/seo-metadata.js';
import { trackMedicationSearch } from '../../lib/medicationTrackingApi.js';
import { trackServerEvent } from '../../lib/trackServerEvent.js';
import { MedicationCard } from '../../components/MedicationCardKit.jsx';

const ApplicationHelp = () => {
    useMetaTags(seoMetadata.applicationHelp);
    const { t, i18n } = useTranslation();
    const MEDICATIONS = useMedicationsList();

    // Get quiz context for pre-selected medications
    const { answers: quizAnswers, selectedMedications: quizSelectedMeds, setAnswer: setContextAnswer, setSelectedMedications, addMedication, removeMedication } = useChatQuiz();

    // Local commercial insurance state - independent of quiz answers
    // This is the yes/no question shown in the MEDS tab
    const [localCommercialInsurance, setLocalCommercialInsurance] = useState(null);

    // Load commercial insurance preference from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('tmn_meds_commercial_insurance');
            if (stored) {
                setLocalCommercialInsurance(stored);
            }
        } catch (e) {
            // ignore
        }
    }, []);

    // Save commercial insurance preference when it changes
    useEffect(() => {
        if (localCommercialInsurance !== null) {
            try {
                localStorage.setItem('tmn_meds_commercial_insurance', localCommercialInsurance);
                // Also sync to quiz context so MedicationCard sees it
                if (localCommercialInsurance === 'yes') {
                    setContextAnswer('insurance_type', 'commercial');
                }
            } catch (e) {
                // ignore
            }
        }
    }, [localCommercialInsurance, setContextAnswer]);

    // Determine if copay cards should be shown based on the local yes/no answer
    const showCopayCards = localCommercialInsurance === 'yes';

    // Build quizAnswers override for MedicationCard display.
    // "No" to commercial insurance means exactly that — it does NOT mean
    // Medicare. Medicaid, VA, IHS, and uninsured all answer "no" here, and
    // the card's context banner prints whatever insurance_type says back to
    // the patient as fact ("Coverage: Medicare"). So the "no" branch carries
    // over only what the patient actually told us in the quiz and leaves the
    // field unset otherwise; the banner then omits the coverage line rather
    // than inventing one. Copay-card visibility is driven by the yes/no
    // answer itself (showCopayCards), not by this field.
    const cardQuizAnswers = (() => {
        if (localCommercialInsurance === 'yes') {
            return { ...quizAnswers, insurance_type: 'commercial' };
        }
        if (localCommercialInsurance === 'no') {
            const { insurance_type, ...rest } = quizAnswers || {};
            // "No" contradicts a stored commercial answer; any other coverage
            // the patient named in the quiz still stands.
            return insurance_type && insurance_type !== 'commercial'
                ? { ...rest, insurance_type }
                : rest;
        }
        return quizAnswers || {};
    })();

    const [activeTab, setActiveTab] = useState(() => {
        // After returning from the Epic (MyChart) OAuth redirect we must land back
        // on the MEDS tab. The EpicConnectButton only renders inside that tab, and
        // it picks up the imported medications from sessionStorage in its mount
        // effect. If the page reopens on the default START tab the button never
        // remounts, the imported meds are never consumed, and the patient sees a
        // blank list until they click Medications again. onBeforeConnect (below)
        // stashes this flag right before the redirect so we can restore the tab.
        try {
            const resumeTab = sessionStorage.getItem('apphelp_resume_tab');
            if (resumeTab) {
                sessionStorage.removeItem('apphelp_resume_tab');
                return resumeTab;
            }
        } catch (e) {
            // ignore storage errors (e.g. private mode)
        }
        // Allow deep-linking to a specific tab, e.g. /application-help?section=CHECKLIST
        // (same pattern as /education?topic=...).
        try {
            const valid = ['START', 'INCOME', 'STEPS', 'CHECKLIST', 'LETTERS', 'MEDS'];
            const params = new URLSearchParams(window.location.search);
            const section = (params.get('section') || '').toUpperCase();
            if (valid.includes(section)) return section;
        } catch (e) { /* ignore */ }
        return 'START';
    });
    // Deep link from the home page's "Bring my list from MyChart" button:
    // ?section=MEDS&connect=1 lands the patient directly on the Epic connect
    // panel with the health-system picker focused and ready to type into.
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            if (params.get('connect') !== '1') return;
        } catch (e) { return; }
        const timer = setTimeout(() => {
            document.getElementById('epic-connect')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('health-system-search')?.focus({ preventScroll: true });
        }, 100);
        return () => clearTimeout(timer);
        // Mount-only: the deep link applies to the initial navigation.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Checklist items live in the data layer with one file per language
    const checklistItems = i18n.resolvedLanguage === 'es' ? APPLICATION_CHECKLIST_ES : APPLICATION_CHECKLIST_DATA;
    const [checkedItems, setCheckedItems] = useState({});
    const toggleCheck = (index) => setCheckedItems(prev => ({...prev, [index]: !prev[index]}));
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    const progress = Math.round((checkedCount / checklistItems.length) * 100);

    // Medication search states for MEDS tab
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMedication, setSelectedMedication] = useState(null);
    const [medsTabListIds, setMedsTabListIds] = useState([]);
    const [searchResult, setSearchResult] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    // Fuse.js for fuzzy medication search
    const fuse = useMemo(() => new Fuse(MEDICATIONS, {
        keys: ['brandName', 'genericName'],
        threshold: 0.4,
        includeScore: true,
        ignoreLocation: true,
        minMatchCharLength: 2
    }), [MEDICATIONS]);

    // Merge quiz selections into the tab's list. This must MERGE, never
    // overwrite: on the return from the Epic (MyChart) redirect the
    // EpicConnectButton's mount effect adds the imported meds first, and both
    // effects run in the same commit where medsTabListIds still reads as the
    // initial []. A plain set here would clobber the whole import with the
    // saved quiz selection, cutting the list down to the old quiz meds.
    useEffect(() => {
        const quizMedIds = (quizSelectedMeds || [])
            .filter(m => m && m.id)
            .map(m => m.id);
        if (quizMedIds.length === 0) return;
        setMedsTabListIds(prev => {
            const newIds = quizMedIds.filter(id => !prev.includes(id));
            return newIds.length > 0 ? [...prev, ...newIds] : prev;
        });
    }, [quizSelectedMeds]);

    // Handle medication search
    const handleMedSearch = useCallback(() => {
        if (!searchTerm.trim()) {
            setSearchResult(null);
            setIsSearching(false);
            return;
        }
        const fuseResults = fuse.search(searchTerm.trim());
        const internalMatches = fuseResults.map(result => result.item);
        setSearchResult({ internal: internalMatches });
        setIsSearching(false);
        trackServerEvent('med_search', { resultCount: internalMatches.length, context: 'meds_tab' });
        if (internalMatches.length > 0) {
            trackMedicationSearch(internalMatches[0].genericName || internalMatches[0].brandName, searchTerm.trim());
        }
    }, [searchTerm, fuse]);

    // Debounced search effect
    useEffect(() => {
        if (searchTerm.trim()) {
            setIsSearching(true);
        } else {
            setSearchResult(null);
            setIsSearching(false);
        }
        const timer = setTimeout(() => {
            if (searchTerm.trim()) handleMedSearch();
            else setSearchResult(null);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, handleMedSearch]);

    // Add medication to list
    const addMedToList = (id) => {
        if (!medsTabListIds.includes(id)) {
            setMedsTabListIds([...medsTabListIds, id]);
        }
        setSearchTerm('');
        setSearchResult(null);
    };

    // Strip medications from the My Path Quiz's saved answers (quiz_resume) so the
    // wizard doesn't re-sync them back into the selection on its next visit. Pass
    // a medication id to remove one, or null to clear the whole list. Patients
    // have the right to fully delete a medication; if they need it back they can
    // re-import via SMART on FHIR (Connect to My Health System).
    const pruneQuizResumeMeds = (idToRemove) => {
        try {
            const saved = sessionStorage.getItem('quiz_resume');
            if (!saved) return;
            const parsed = JSON.parse(saved);
            if (!parsed?.answers || !Array.isArray(parsed.answers.medications)) return;
            parsed.answers.medications = idToRemove === null
                ? []
                : parsed.answers.medications.filter(m => m !== idToRemove);
            sessionStorage.setItem('quiz_resume', JSON.stringify(parsed));
        } catch (e) {
            // ignore storage errors (e.g. private mode)
        }
    };

    // Counterpart of pruneQuizResumeMeds: merge medication ids INTO the My Path
    // Quiz's saved answers. Without this, meds imported on this tab exist only in
    // local component state — the wizard's next visit mirrors its own (smaller)
    // saved list back into the shared selection and the import disappears.
    const mergeQuizResumeMeds = (idsToAdd) => {
        try {
            const saved = sessionStorage.getItem('quiz_resume');
            if (!saved) return;
            const parsed = JSON.parse(saved);
            if (!parsed?.answers || !Array.isArray(parsed.answers.medications)) return;
            const merged = [...parsed.answers.medications];
            for (const id of idsToAdd) {
                if (!merged.includes(id)) merged.push(id);
            }
            parsed.answers.medications = merged;
            sessionStorage.setItem('quiz_resume', JSON.stringify(parsed));
        } catch (e) {
            // ignore storage errors (e.g. private mode)
        }
    };

    // Remove a medication everywhere it persists so the delete is global and
    // sticks: the visible list, the shared quiz selection (also re-seeds the
    // list and feeds the "We loaded N medications" banner), and the wizard's
    // own saved answers.
    const removeMedFromList = (id) => {
        setMedsTabListIds(medsTabListIds.filter(m => m !== id));
        if (removeMedication) removeMedication(id);
        pruneQuizResumeMeds(id);
    };

    // Get medication objects for display
    const displayMeds = MEDICATIONS.filter(m => medsTabListIds.includes(m.id));

    // Letter builder states
    const [letterType, setLetterType] = useState("appeal");
    const [patientName, setPatientName] = useState("");
    const [medicationName, setMedicationName] = useState("");
    const [appealReason, setAppealReason] = useState("Financial Hardship");
    const [transplantType, setTransplantType] = useState("");
    const [transplantDate, setTransplantDate] = useState("");
    const [doctorName, setDoctorName] = useState("");
    const [programName, setProgramName] = useState("");
    const [hardshipDetails, setHardshipDetails] = useState("");
    const [generatedLetter, setGeneratedLetter] = useState("");
    const [copied, setCopied] = useState(false);

    // Letter body intentionally not localized — goes to US insurers/providers in English.
    const generateLetter = () => {
        const date = new Date().toLocaleDateString();
        let text = "";

        if (letterType === "appeal") {
            text = `Date: ${date}

To Whom It May Concern:

I am writing to appeal the coverage denial or specialty pharmacy requirement for my medication, ${medicationName || "[Medication Name]"}.

Patient Name: ${patientName || "[Your Name]"}
Medication: ${medicationName || "[Medication Name]"}

Reason for Appeal: ${appealReason}

This medication is medically necessary for my transplant care. The current requirement creates a significant barrier to my adherence and health outcomes because ${
                appealReason === 'Financial Hardship'
                ? 'the cost at the required pharmacy is unaffordable compared to available alternatives, putting me at risk of missing doses.'
                : appealReason === 'Access Issues'
                ? 'the required pharmacy cannot deliver the medication in a timely manner consistent with my medical needs.'
                : 'I have been stable on this specific regimen from my current pharmacy and disrupting this care poses a clinical risk.'
            }

Please review this appeal and allow me to access my medication at my pharmacy of choice.

Sincerely,
${patientName || "[Your Name]"}`;
        } else if (letterType === "pap") {
            text = `Date: ${date}

Dear ${programName || "[Program Name]"} Team,

I am writing to request reconsideration of my application for the Patient Assistance Program for ${medicationName || "[Medication Name]"}.

I am a ${transplantType || "[Organ Type]"} transplant recipient and require this medication to prevent organ rejection. My current financial situation makes it difficult to afford the full cost of this medication.

${hardshipDetails || "[Explain your specific circumstances: job loss, medical expenses, fixed income, etc.]"}

I have attached updated documentation to support my application.

Thank you for reconsidering my application. Please contact me if you need additional information.

Sincerely,
${patientName || "[Your Name]"}`;
        } else if (letterType === "doctor") {
            text = `Date: ${date}

Dear Dr. ${doctorName || "[Doctor's Name]"},

I am applying for Patient Assistance Programs to help cover the cost of my transplant medications. Several programs require a letter from my physician confirming my medical necessity.

Could you please provide a letter on your letterhead stating:
• My diagnosis and transplant date
• The medications I need and why I must take them
• That I need these medications to prevent organ rejection

Programs I am applying to: ${programName || "[List programs]"}

I have attached the application forms that require your signature. Please let me know if you need any additional information.

Thank you for your support.

Sincerely,
${patientName || "[Your Name]"}`;
        } else if (letterType === "hardship") {
            text = `Date: ${date}

To Whom It May Concern,

I am writing to explain my current financial hardship and request assistance with my transplant medication costs.

I received a ${transplantType || "[Organ Type]"} transplant${transplantDate ? ` on ${transplantDate}` : ""}. Since my transplant, I have faced significant financial challenges including:

${hardshipDetails || "[Describe your situation: reduced work hours, disability, high medical bills, loss of income, etc.]"}

Without financial help, I may not be able to afford the medications I need to keep my transplanted organ working.

I am committed to following my treatment plan and taking my medications as prescribed. Any assistance you can provide would be greatly appreciated.

Sincerely,
${patientName || "[Your Name]"}`;
        }

        setGeneratedLetter(text);
        setCopied(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLetter);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Filter medications based on search term
    const filteredMedications = MEDICATIONS.filter(med =>
        med.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.brandName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const TabButton = ({ id, label, icon: Icon, iconBg, iconColor }) => (
        <button onClick={() => setActiveTab(id)} role="tab" id={`${id}-tab`} aria-selected={activeTab === id} aria-controls={`${id}-panel`} tabIndex={activeTab === id ? 0 : -1} className={`flex items-center justify-center gap-3 px-4 py-4 font-bold text-base md:text-lg transition-all border-b-4 min-h-[52px] flex-1 min-w-[calc(33.333%-2px)] sm:min-w-0 ${activeTab === id ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50' : 'border-transparent text-slate-700 hover:text-emerald-600 hover:bg-slate-50'}`}>
            <span className={`flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg ${iconBg} transition-transform ${activeTab === id ? 'scale-110' : ''}`} aria-hidden="true">
                <Icon size={20} className={iconColor} strokeWidth={2.5} />
            </span>
            <span className="hidden md:inline">{label}</span>
            <span className="md:hidden">{label.split(' ')[0]}</span>
        </button>
    );

    return (
        <article className="max-w-5xl mx-auto space-y-8 pb-12">
            <header className="text-center py-8"><h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{t('applicationHelp.header.title')}</h1><p className="text-xl md:text-2xl text-slate-700 max-w-3xl mx-auto leading-relaxed">{t('applicationHelp.header.subtitle')}</p><div className="mt-6 flex justify-center"><LanguageToggle /></div></header>
            <Link to="/wizard" className="block bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 mb-6 hover:border-blue-400 transition group">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 text-white p-3 rounded-lg">
                            <Sparkles size={24} aria-hidden="true" />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-blue-900">{t('applicationHelp.header.quizPromptTitle')}</p>
                            <p className="text-base text-blue-700">{t('applicationHelp.header.quizPromptText')}</p>
                        </div>
                    </div>
                    <ArrowRight className="text-blue-600 group-hover:translate-x-1 transition-transform" size={24} aria-hidden="true" />
                </div>
            </Link>
            <nav className="bg-white rounded-xl shadow-md border border-slate-200" role="tablist" aria-label={t('applicationHelp.tabs.ariaLabel')}>
                <div className="flex flex-wrap">
                    <TabButton id="START" label={t('applicationHelp.tabs.start')} icon={HeartHandshake} iconBg="bg-rose-100" iconColor="text-rose-600" />
                    <TabButton id="INCOME" label={t('applicationHelp.tabs.income')} icon={DollarSign} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
                    <TabButton id="STEPS" label={t('applicationHelp.tabs.steps')} icon={ArrowRight} iconBg="bg-blue-100" iconColor="text-blue-600" />
                    <TabButton id="CHECKLIST" label={t('applicationHelp.tabs.checklist')} icon={ClipboardList} iconBg="bg-amber-100" iconColor="text-amber-600" />
                    <TabButton id="LETTERS" label={t('applicationHelp.tabs.letters')} icon={FileText} iconBg="bg-purple-100" iconColor="text-purple-600" />
                    <TabButton id="MEDS" label={t('applicationHelp.tabs.meds')} icon={Pill} iconBg="bg-teal-100" iconColor="text-teal-600" />
                </div>
            </nav>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[200px]" role="tabpanel" id={`${activeTab}-panel`} aria-labelledby={`${activeTab}-tab`}>
                {activeTab === 'START' && (
                    <div className="space-y-8">
                        <aside className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-lg" role="note"><h2 className="text-emerald-800 font-bold text-xl mb-3 flex items-center gap-2"><CheckCircle size={24} aria-hidden="true" /> {t('applicationHelp.start.goodNews.title')}</h2><ul className="list-disc pl-5 text-emerald-900 space-y-2 text-lg leading-relaxed"><li><strong>{t('applicationHelp.start.goodNews.item1')}</strong></li><li>{t('applicationHelp.start.goodNews.item2')}</li></ul></aside>

                        <section className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-8" aria-labelledby="pap-definition">
                            <h3 id="pap-definition" className="text-2xl font-bold text-emerald-900 mb-4">{t('applicationHelp.start.whatArePaps.title')}</h3>
                            <p className="text-lg text-slate-800 leading-relaxed mb-4">
                                {t('applicationHelp.start.whatArePaps.p1')}
                            </p>
                            <p className="text-lg text-slate-800 leading-relaxed font-medium">
                                <Trans i18nKey="applicationHelp.start.whatArePaps.p2" />
                            </p>
                        </section>

                        <div className="grid md:grid-cols-3 gap-6">
                            <section className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                                <div className="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center mb-4">
                                    <Pill size={28} aria-hidden="true" />
                                </div>
                                <h3 className="font-bold text-blue-900 text-xl mb-3">{t('applicationHelp.start.cards.pap.title')}</h3>
                                <p className="text-slate-800 text-base leading-relaxed">
                                    {t('applicationHelp.start.cards.pap.text')}
                                </p>
                            </section>

                            <section className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                                <div className="bg-purple-600 text-white w-14 h-14 rounded-full flex items-center justify-center mb-4">
                                    <DollarSign size={28} aria-hidden="true" />
                                </div>
                                <h3 className="font-bold text-purple-900 text-xl mb-3">{t('applicationHelp.start.cards.copay.title')}</h3>
                                <p className="text-slate-800 text-base leading-relaxed mb-3">
                                    {t('applicationHelp.start.cards.copay.text')}
                                </p>
                                <p className="text-amber-900 text-base font-medium bg-amber-50 border border-amber-200 p-3 rounded-lg">
                                    <Trans i18nKey="applicationHelp.start.cards.copay.eligibility" />
                                </p>
                                <div className="flex justify-center mt-4">
                                    <img
                                        src="/photos/copay-card-process.png"
                                        alt={t('applicationHelp.start.cards.copay.imgAlt')}
                                        aria-describedby="copay-card-desc"
                                        className="max-w-full h-auto rounded-lg shadow-md"
                                    />
                                </div>
                                <div id="copay-card-desc" className="sr-only">
                                    {t('applicationHelp.start.cards.copay.imgDesc')}
                                </div>
                            </section>

                            <section className="bg-indigo-50 p-6 rounded-xl border-2 border-indigo-200">
                                <div className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center mb-4">
                                    <Shield size={28} aria-hidden="true" />
                                </div>
                                <h3 className="font-bold text-indigo-900 text-xl mb-3">{t('applicationHelp.start.cards.insurance.title')}</h3>
                                <p className="text-slate-800 text-base leading-relaxed">
                                    {t('applicationHelp.start.cards.insurance.text')}
                                </p>
                            </section>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <section className="border border-slate-200 rounded-xl p-6 hover:border-emerald-300 transition-colors" aria-labelledby="pap-heading">
                                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3"><div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg" aria-hidden="true"><FileText size={28} /></div><div><h2 id="pap-heading" className="font-bold text-xl text-slate-900">{t('applicationHelp.start.compare.pap.title')}</h2><p className="text-base text-slate-700">{t('applicationHelp.start.compare.pap.subtitle')}</p></div></div>
                                <p className="text-slate-700 mb-4 text-base min-h-[40px]">{t('applicationHelp.start.compare.pap.description')}</p>
                                <div className="space-y-3 text-base"><div><span className="font-bold text-slate-800 block">{t('applicationHelp.start.compare.bestForLabel')}</span><ul className="list-disc pl-4 text-slate-700">{t('applicationHelp.start.compare.pap.bestFor', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)}</ul></div><div className="flex justify-between py-2 border-t border-slate-100"><span className="text-slate-700">{t('applicationHelp.start.compare.approvalTimeLabel')}</span><span className="font-medium text-emerald-700">{t('applicationHelp.start.compare.pap.approvalTime')}</span></div></div>
                            </section>
                            <section className="border border-slate-200 rounded-xl p-6 hover:border-sky-300 transition-colors" aria-labelledby="foundation-heading">
                                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3"><div className="p-3 bg-sky-100 text-sky-700 rounded-lg" aria-hidden="true"><HeartHandshake size={28} /></div><div><h2 id="foundation-heading" className="font-bold text-xl text-slate-900">{t('applicationHelp.start.compare.foundation.title')}</h2><p className="text-base text-slate-700">{t('applicationHelp.start.compare.foundation.subtitle')}</p></div></div>
                                <p className="text-slate-700 mb-4 text-base min-h-[40px]">{t('applicationHelp.start.compare.foundation.description')}</p>
                                <div className="space-y-3 text-base"><div><span className="font-bold text-slate-800 block">{t('applicationHelp.start.compare.bestForLabel')}</span><ul className="list-disc pl-4 text-slate-700">{t('applicationHelp.start.compare.foundation.bestFor', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)}</ul></div><div className="flex justify-between py-2 border-t border-slate-100"><span className="text-slate-700">{t('applicationHelp.start.compare.approvalTimeLabel')}</span><span className="font-medium text-emerald-700">{t('applicationHelp.start.compare.foundation.approvalTime')}</span></div></div>
                            </section>
                        </div>

                        <aside className="bg-rose-50 border-l-4 border-rose-500 p-6 rounded-r-lg" role="note">
                            <h3 className="font-bold text-xl text-rose-900 mb-3 flex items-center gap-2">
                                <AlertCircle size={24} aria-hidden="true" />
                                {t('applicationHelp.start.safety.title')}
                            </h3>
                            <p className="text-lg text-rose-900 font-bold leading-relaxed">
                                {t('applicationHelp.start.safety.text')}
                            </p>
                        </aside>

                        <aside className="bg-amber-50 p-6 rounded-xl border border-amber-100" role="note">
                            <h2 className="font-bold text-xl text-amber-900 mb-4 flex items-center gap-2"><AlertOctagon size={24} aria-hidden="true" /> {t('applicationHelp.start.reminders.title')}</h2>
                            <div className="grid md:grid-cols-2 gap-6 text-amber-800 text-base leading-relaxed"><div><strong className="block text-amber-900 text-lg">{t('applicationHelp.start.reminders.applyOnceTitle')}</strong>{t('applicationHelp.start.reminders.applyOnceText')}</div><div><strong className="block text-amber-900 text-lg">{t('applicationHelp.start.reminders.applyAnytimeTitle')}</strong>{t('applicationHelp.start.reminders.applyAnytimeText')}</div><div><strong className="block text-amber-900 text-lg">{t('applicationHelp.start.reminders.peopleHelpTitle')}</strong>{t('applicationHelp.start.reminders.peopleHelpText')}</div><div><strong className="block text-amber-900 text-lg">{t('applicationHelp.start.reminders.faxTitle')}</strong>{t('applicationHelp.start.reminders.faxText')}</div></div>
                        </aside>
                    </div>
                )}
                {activeTab === 'INCOME' && (
                    <div className="space-y-10 max-w-4xl mx-auto">
                        <div><h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{t('applicationHelp.income.title')}</h2><p className="text-lg md:text-xl text-slate-700 mb-4 leading-relaxed">{t('applicationHelp.income.intro')}</p><div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r" role="note"><p className="text-lg text-red-800 font-bold leading-relaxed">{t('applicationHelp.income.dontCountOut')}</p></div></div>
                        <div className="grid md:grid-cols-2 gap-8"><div><h3 className="font-bold text-slate-800 text-xl mb-4">{t('applicationHelp.income.howLimitsTitle')}</h3><ul className="space-y-3 text-slate-700 text-base leading-relaxed list-disc pl-5">{t('applicationHelp.income.howLimitsItems', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)}</ul></div><div><h3 className="font-bold text-slate-800 text-xl mb-4">{t('applicationHelp.income.whereTitle')}</h3><ul className="space-y-3 text-slate-700 text-base leading-relaxed list-disc pl-5">{t('applicationHelp.income.whereItems', { returnObjects: true }).map((item, i) => <li key={i}>{item}</li>)}</ul></div></div>
                        <section className="bg-slate-50 p-6 rounded-xl border border-slate-200" aria-labelledby="income-checker"><h3 id="income-checker" className="font-bold text-xl text-slate-900 mb-4 flex items-center gap-2"><DollarSign size={24} aria-hidden="true" /> {t('applicationHelp.income.checkerTitle')}</h3><p className="text-base text-slate-700 mb-4 leading-relaxed">{t('applicationHelp.income.checkerText')}</p><div className="flex flex-wrap gap-4"><a href="https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white border border-slate-300 px-5 py-3 rounded-lg text-base text-slate-700 font-medium hover:border-emerald-500 hover:text-emerald-600 transition" aria-label={t('applicationHelp.income.hhsAriaLabel')}>{t('applicationHelp.income.hhsLink')} <ExternalLink size={18} aria-hidden="true" /></a><a href="https://phrma.org/resources/patient-assistance" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white border border-slate-300 px-5 py-3 rounded-lg text-base text-slate-700 font-medium hover:border-emerald-500 hover:text-emerald-600 transition" aria-label={t('applicationHelp.income.phrmaAriaLabel')}>{t('applicationHelp.income.phrmaLink')} <ExternalLink size={18} aria-hidden="true" /></a></div></section>
                    </div>
                )}
                {activeTab === 'STEPS' && (
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">{t('applicationHelp.steps.title')}</h2>
                        <section className="bg-white p-6 md:p-8 rounded-xl border-l-4 border-emerald-500 shadow-sm" aria-labelledby="requirements-heading">
                            <h3 id="requirements-heading" className="font-bold text-xl text-slate-900 mb-5">{t('applicationHelp.steps.bothRequire')}</h3>
                            <ul className="grid md:grid-cols-2 gap-x-8 gap-y-4">{t('applicationHelp.steps.requirements', { returnObjects: true }).map((item, i) => <li key={i} className="flex items-center gap-3 text-base text-slate-800 leading-relaxed"><div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" aria-hidden="true"></div>{item}</li>)}</ul>
                        </section>
                    </div>
                )}
                {activeTab === 'CHECKLIST' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-6"><h2 className="text-2xl md:text-3xl font-bold text-slate-900">{t('applicationHelp.checklist.title')}</h2><button onClick={() => window.print()} className="flex items-center gap-2 text-base text-emerald-600 hover:text-emerald-700 font-bold" aria-label={t('applicationHelp.checklist.printAriaLabel')}><Printer size={20} aria-hidden="true" /> {t('applicationHelp.checklist.print')}</button></div>
                        <div className="grid lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-3 space-y-6">
                                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm" aria-labelledby="progress-heading"><div className="flex justify-between items-center mb-2"><span id="progress-heading" className="text-base font-bold text-slate-700">{t('applicationHelp.checklist.yourResponsibility')}</span><span className="text-base font-bold text-emerald-600" aria-live="polite">{t('applicationHelp.checklist.percentReady', { progress })}</span></div><div className="w-full bg-slate-100 rounded-full h-4" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" aria-label={t('applicationHelp.checklist.progressAriaLabel', { progress })}><div className="bg-emerald-500 h-4 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div></div><p className="text-slate-700 text-base mt-3 italic">{t('applicationHelp.checklist.gatherNote')}</p></section>
                                <div className="space-y-3" role="list" aria-label={t('applicationHelp.checklist.itemsAriaLabel')}>{checklistItems.map((item, idx) => { const isChecked = !!checkedItems[idx]; return ( <button key={idx} onClick={() => toggleCheck(idx)} role="checkbox" aria-checked={isChecked} className={`w-full flex items-start gap-4 p-4 rounded-lg border transition-all text-left ${isChecked ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-200 hover:border-emerald-300'}`}><div className={`flex-shrink-0 text-emerald-600 mt-0.5 transition-transform duration-200 ${isChecked ? 'scale-110' : 'scale-100 text-slate-300'}`} aria-hidden="true">{isChecked ? <CheckSquare size={24} /> : <Square size={24} />}</div><span className={`font-medium text-base leading-relaxed ${isChecked ? 'text-slate-900' : 'text-slate-700'}`}>{item}</span></button> ); })}</div>
                                {progress === 100 && ( <div className="p-4 bg-emerald-100 text-emerald-800 rounded-xl text-center" role="alert" aria-live="polite"><span className="font-bold text-lg">{t('applicationHelp.checklist.complete')}</span></div> )}
                            </div>
                            <aside className="lg:col-span-2 space-y-6">
                                <section className="bg-slate-50 p-6 rounded-xl border border-slate-200" aria-labelledby="clinic-handles"><h3 id="clinic-handles" className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><Stethoscope size={24} className="text-indigo-600" aria-hidden="true" /> {t('applicationHelp.checklist.clinicTitle')}</h3><p className="text-base text-slate-700 mb-4"><Trans i18nKey="applicationHelp.checklist.clinicIntro" /></p><ul className="space-y-3">{t('applicationHelp.checklist.clinicItems', { returnObjects: true }).map((item, i) => ( <li key={i} className="flex items-center gap-2 text-base text-slate-700"><CheckCircle size={18} className="text-indigo-500 flex-shrink-0" aria-hidden="true" />{item}</li> ))}</ul></section>
                                <aside className="bg-amber-50 p-6 rounded-xl border border-amber-200 shadow-sm" role="note"><h3 className="font-bold text-lg text-amber-800 mb-2 flex items-center gap-2"><AlertTriangle size={24} aria-hidden="true" /> {t('applicationHelp.checklist.crucialTitle')}</h3><p className="text-base text-amber-900 leading-relaxed"><Trans i18nKey="applicationHelp.checklist.crucialText" /></p></aside>
                            </aside>
                        </div>
                    </div>
                )}
                {activeTab === 'LETTERS' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Letter Builder */}
                        <section className="bg-indigo-50 p-6 md:p-8 rounded-xl border border-indigo-100" aria-labelledby="letter-builder">
                            <div className="flex items-center gap-3 mb-4">
                                <FileText className="text-indigo-600" size={28} aria-hidden="true" />
                                <h2 id="letter-builder" className="text-2xl font-bold text-indigo-900">{t('applicationHelp.letters.builder.title')}</h2>
                            </div>
                            <p className="text-base text-indigo-800 mb-6 leading-relaxed">{t('applicationHelp.letters.builder.intro')}</p>

                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="letter-type" className="block text-base font-bold text-slate-800 mb-2">{t('applicationHelp.letters.builder.letterTypeLabel')}</label>
                                    <select id="letter-type" className="w-full p-3 text-base rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" value={letterType} onChange={(e) => { setLetterType(e.target.value); setGeneratedLetter(""); }}>
                                        <option value="appeal">{t('applicationHelp.letters.builder.typeAppeal')}</option>
                                        <option value="pap">{t('applicationHelp.letters.builder.typePap')}</option>
                                        <option value="doctor">{t('applicationHelp.letters.builder.typeDoctor')}</option>
                                        <option value="hardship">{t('applicationHelp.letters.builder.typeHardship')}</option>
                                    </select>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="patient-name" className="block text-base font-bold text-slate-800 mb-2">{t('applicationHelp.letters.builder.yourNameLabel')}</label>
                                        <input id="patient-name" type="text" placeholder={t('applicationHelp.letters.builder.yourNamePlaceholder')} className="w-full p-3 text-base rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="medication-name" className="block text-base font-bold text-slate-800 mb-2">{t('applicationHelp.letters.builder.medicationLabel')}</label>
                                        <input id="medication-name" type="text" placeholder={t('applicationHelp.letters.builder.medicationPlaceholder')} className="w-full p-3 text-base rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" value={medicationName} onChange={(e) => setMedicationName(e.target.value)} />
                                    </div>
                                </div>

                                {letterType === "appeal" && (
                                    <div>
                                        <label htmlFor="appeal-reason" className="block text-base font-bold text-slate-800 mb-2">{t('applicationHelp.letters.builder.appealReasonLabel')}</label>
                                        <select id="appeal-reason" className="w-full p-3 text-base rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" value={appealReason} onChange={(e) => setAppealReason(e.target.value)}>
                                            <option value="Financial Hardship">{t('applicationHelp.letters.builder.reasonFinancial')}</option>
                                            <option value="Access Issues">{t('applicationHelp.letters.builder.reasonAccess')}</option>
                                            <option value="Clinical Stability">{t('applicationHelp.letters.builder.reasonStability')}</option>
                                        </select>
                                    </div>
                                )}

                                {(letterType === "pap" || letterType === "hardship") && (
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="transplant-type" className="block text-base font-bold text-slate-800 mb-2">{t('applicationHelp.letters.builder.transplantTypeLabel')}</label>
                                            <input id="transplant-type" type="text" placeholder={t('applicationHelp.letters.builder.transplantTypePlaceholder')} className="w-full p-3 text-base rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" value={transplantType} onChange={(e) => setTransplantType(e.target.value)} />
                                        </div>
                                        <div>
                                            <label htmlFor="transplant-date" className="block text-base font-bold text-slate-800 mb-2">{t('applicationHelp.letters.builder.transplantDateLabel')}</label>
                                            <input id="transplant-date" type="text" placeholder={t('applicationHelp.letters.builder.transplantDatePlaceholder')} className="w-full p-3 text-base rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" value={transplantDate} onChange={(e) => setTransplantDate(e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                {letterType === "doctor" && (
                                    <div>
                                        <label htmlFor="doctor-name" className="block text-base font-bold text-slate-800 mb-2">{t('applicationHelp.letters.builder.doctorNameLabel')}</label>
                                        <input id="doctor-name" type="text" placeholder={t('applicationHelp.letters.builder.doctorNamePlaceholder')} className="w-full p-3 text-base rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
                                    </div>
                                )}

                                {(letterType === "pap" || letterType === "doctor") && (
                                    <div>
                                        <label htmlFor="program-name" className="block text-base font-bold text-slate-800 mb-2">{t('applicationHelp.letters.builder.programNameLabel')}</label>
                                        <input id="program-name" type="text" placeholder={t('applicationHelp.letters.builder.programNamePlaceholder')} className="w-full p-3 text-base rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" value={programName} onChange={(e) => setProgramName(e.target.value)} />
                                    </div>
                                )}

                                {(letterType === "pap" || letterType === "hardship") && (
                                    <div>
                                        <label htmlFor="hardship-details" className="block text-base font-bold text-slate-800 mb-2">{t('applicationHelp.letters.builder.situationLabel')}</label>
                                        <textarea id="hardship-details" rows={3} placeholder={t('applicationHelp.letters.builder.situationPlaceholder')} className="w-full p-3 text-base rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" value={hardshipDetails} onChange={(e) => setHardshipDetails(e.target.value)} />
                                    </div>
                                )}

                                <button onClick={generateLetter} className="bg-indigo-600 hover:bg-indigo-700 text-white text-base font-bold py-3 px-6 rounded-lg transition flex items-center gap-2">
                                    <FileText size={20} aria-hidden="true" />
                                    {t('applicationHelp.letters.builder.generate')}
                                </button>

                                {generatedLetter && (
                                    <div className="mt-6 bg-white p-6 rounded-xl border border-indigo-200 relative">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-base font-bold text-slate-700 uppercase">{t('applicationHelp.letters.builder.generatedHeading')}</h3>
                                            <button onClick={copyToClipboard} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-base font-bold transition">
                                                {copied ? <Check size={18} className="text-green-600" aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
                                                {copied ? t('applicationHelp.letters.builder.copied') : t('applicationHelp.letters.builder.copyText')}
                                            </button>
                                        </div>
                                        <pre className="whitespace-pre-wrap font-serif text-base text-slate-800 leading-relaxed border-l-4 border-indigo-200 pl-4">{generatedLetter}</pre>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Phone Scripts */}
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">{t('applicationHelp.letters.scripts.title')}</h2>
                            <p className="text-lg text-slate-700 mb-6 leading-relaxed">{t('applicationHelp.letters.scripts.intro')}</p>
                            <div className="space-y-4">
                                <section className="border border-slate-200 rounded-xl overflow-hidden" aria-labelledby="manufacturer-script">
                                    <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center gap-3 font-bold text-lg text-slate-800">
                                        <Phone size={22} aria-hidden="true" />
                                        <span id="manufacturer-script">{t('applicationHelp.letters.scripts.manufacturerTitle')}</span>
                                    </div>
                                    <div className="p-6 bg-white">
                                        <p className="font-serif text-xl text-slate-800 leading-relaxed">{t('applicationHelp.letters.scripts.manufacturerPre')}<span className="bg-yellow-100 px-1">{t('applicationHelp.letters.scripts.manufacturerHighlight')}</span>{t('applicationHelp.letters.scripts.manufacturerPost')}</p>
                                    </div>
                                </section>
                                <section className="border border-slate-200 rounded-xl overflow-hidden" aria-labelledby="foundation-script">
                                    <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center gap-3 font-bold text-lg text-slate-800">
                                        <HeartHandshake size={22} aria-hidden="true" />
                                        <span id="foundation-script">{t('applicationHelp.letters.scripts.foundationTitle')}</span>
                                    </div>
                                    <div className="p-6 bg-white">
                                        <p className="font-serif text-xl text-slate-800 leading-relaxed">{t('applicationHelp.letters.scripts.foundationPre')}<span className="bg-yellow-100 px-1">{t('applicationHelp.letters.scripts.foundationHighlight1')}</span>{t('applicationHelp.letters.scripts.foundationMid')}<span className="bg-yellow-100 px-1">{t('applicationHelp.letters.scripts.foundationHighlight2')}</span>{t('applicationHelp.letters.scripts.foundationPost')}</p>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'MEDS' && (
                    <div className="space-y-6">
                        {/* Header with context */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{t('applicationHelp.meds.title')}</h2>
                                <p className="text-slate-600">{t('applicationHelp.meds.intro')}</p>
                            </div>
                        </div>

                        {/* Quiz data indicator */}
                        {quizSelectedMeds && quizSelectedMeds.length > 0 && (
                            <aside className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg" role="note">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
                                        <p className="text-emerald-800 font-medium">
                                            {t('applicationHelp.meds.loadedBanner', { count: quizSelectedMeds.length })}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedMedications([]); setMedsTabListIds([]); pruneQuizResumeMeds(null); }}
                                        className="text-emerald-700 hover:text-emerald-900 text-sm font-semibold underline whitespace-nowrap flex-shrink-0 min-h-[44px]"
                                        aria-label={t('applicationHelp.meds.clearListAriaLabel')}
                                    >
                                        {t('applicationHelp.meds.clearList')}
                                    </button>
                                </div>
                            </aside>
                        )}

                        {/* Epic MyChart Integration */}
                        <div id="epic-connect" className="scroll-mt-24">
                        <EpicConnectButton
                            onBeforeConnect={() => {
                                // Remember we were on the Medications tab so we can
                                // restore it when Epic redirects back, otherwise the
                                // page reopens on START, this button never remounts,
                                // and the imported meds don't appear until the patient
                                // clicks Medications again.
                                try { sessionStorage.setItem('apphelp_resume_tab', 'MEDS'); } catch (e) { /* ignore */ }
                            }}
                            onMedicationsImported={(matchedIds) => {
                                setMedsTabListIds(prev => {
                                    const newIds = matchedIds.filter(id => !prev.includes(id));
                                    return newIds.length > 0 ? [...prev, ...newIds] : prev;
                                });
                                // Mirror the import into the shared selection and the
                                // quiz's saved answers so it persists across navigation
                                // and every surface shows the same medication list.
                                matchedIds
                                    .map(id => MEDICATIONS.find(m => m.id === id))
                                    .filter(Boolean)
                                    .forEach(med => addMedication(med));
                                mergeQuizResumeMeds(matchedIds);
                            }}
                        />
                        </div>

                        {/* Search bar to add medications */}
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                            <h3 className="font-bold text-lg text-slate-800 mb-3 flex items-center gap-2">
                                <Search size={20} className="text-teal-600" aria-hidden="true" />
                                {t('applicationHelp.meds.searchTitle')}
                            </h3>
                            <p className="text-slate-600 text-sm mb-4">{t('applicationHelp.meds.searchIntro')}</p>
                            <div className="relative">
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="flex-grow relative">
                                        <label htmlFor="meds-tab-search" className="sr-only">{t('applicationHelp.meds.searchLabel')}</label>
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} aria-hidden="true" />
                                        <input
                                            id="meds-tab-search"
                                            type="text"
                                            placeholder={t('applicationHelp.meds.searchPlaceholder')}
                                            className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none text-base transition shadow-sm"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleMedSearch();
                                                if (e.key === 'Escape') { setSearchResult(null); setSearchTerm(''); }
                                            }}
                                            aria-expanded={!!(searchResult && searchTerm && !isSearching)}
                                        />
                                        {isSearching && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Loader2 size={20} className="text-teal-600 animate-spin" aria-label={t('applicationHelp.meds.searchingAriaLabel')} />
                                            </div>
                                        )}
                                        {searchTerm && !isSearching && (
                                            <button onClick={() => { setSearchTerm(''); setSearchResult(null); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={t('applicationHelp.meds.clearSearchAriaLabel')}>
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Search results dropdown */}
                                {searchResult && searchTerm && !isSearching && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-[40vh] overflow-y-auto z-50">
                                        {searchResult.internal.length > 0 ? (
                                            <div className="space-y-1">
                                                {searchResult.internal.map(med => {
                                                    const isAlreadyIn = medsTabListIds.includes(med.id);
                                                    return (
                                                        <button key={med.id} onClick={() => addMedToList(med.id)} disabled={isAlreadyIn} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex justify-between items-center group transition disabled:opacity-50 disabled:cursor-not-allowed">
                                                            <div>
                                                                <span className="font-bold text-slate-900 block">{localizeMedName(med.brandName)}</span>
                                                                <span className="text-sm text-slate-600">{localizeMedName(med.genericName)}</span>
                                                            </div>
                                                            {isAlreadyIn ? (
                                                                <span className="text-emerald-600 text-sm font-bold flex items-center gap-1"><CheckCircle size={16} /> {t('applicationHelp.meds.added')}</span>
                                                            ) : (
                                                                <span className="text-teal-600 bg-teal-50 px-3 py-1 rounded-full text-sm font-bold group-hover:bg-teal-100 flex items-center gap-1"><PlusCircle size={16} /> {t('applicationHelp.meds.add')}</span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center">
                                                <p className="text-slate-700 font-medium mb-1">{t('applicationHelp.meds.noMatches')}</p>
                                                <p className="text-slate-500 text-sm">{t('applicationHelp.meds.noMatchesPre')}<Link to="/medications" className="text-teal-600 hover:underline">{t('applicationHelp.meds.noMatchesLink')}</Link>{t('applicationHelp.meds.noMatchesPost')}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Commercial Insurance Question - always shown before medication cards */}
                        <div className="mb-6 bg-white border-2 border-blue-200 rounded-xl p-5" role="group" aria-labelledby="apphelp-insurance-heading">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                                    <ShieldCheck className="text-blue-600" size={28} aria-hidden="true" />
                                </div>
                                <div className="flex-1">
                                    <h3 id="apphelp-insurance-heading" className="font-bold text-lg text-slate-900 mb-2">
                                        {t('applicationHelp.meds.insurance.question')}
                                    </h3>
                                    <p className="text-slate-600 mb-4 text-sm">
                                        {t('applicationHelp.meds.insurance.explanation')}
                                    </p>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setLocalCommercialInsurance('yes')}
                                            className={`flex-1 py-3 px-4 rounded-lg font-bold text-center transition min-h-[48px] text-base ${
                                                localCommercialInsurance === 'yes'
                                                    ? 'bg-blue-600 text-white ring-2 ring-blue-600 shadow-md'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-slate-300'
                                            }`}
                                            role="radio"
                                            aria-checked={localCommercialInsurance === 'yes'}
                                        >
                                            {t('applicationHelp.meds.insurance.yes')}
                                        </button>
                                        <button
                                            onClick={() => setLocalCommercialInsurance('no')}
                                            className={`flex-1 py-3 px-4 rounded-lg font-bold text-center transition min-h-[48px] text-base ${
                                                localCommercialInsurance === 'no'
                                                    ? 'bg-blue-600 text-white ring-2 ring-blue-600 shadow-md'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-slate-300'
                                            }`}
                                            role="radio"
                                            aria-checked={localCommercialInsurance === 'no'}
                                        >
                                            {t('applicationHelp.meds.insurance.no')}
                                        </button>
                                    </div>
                                    {localCommercialInsurance === 'yes' && (
                                        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                            <p className="text-emerald-800 text-sm">
                                                <Trans i18nKey="applicationHelp.meds.insurance.yesInfo" />
                                            </p>
                                        </div>
                                    )}
                                    {localCommercialInsurance === 'no' && (
                                        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                            <p className="text-purple-800 text-sm">
                                                <Trans i18nKey="applicationHelp.meds.insurance.noInfo" />
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Medication cards with PAP info */}
                        {displayMeds.length > 0 ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                                        <Pill size={22} className="text-teal-600" aria-hidden="true" />
                                        {t('applicationHelp.meds.yourMedications', { count: displayMeds.length })}
                                    </h3>
                                </div>

                                {/* Info box about what they're seeing */}
                                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <Info size={20} className="text-teal-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                        <div>
                                            <p className="text-teal-800 font-medium">{t('applicationHelp.meds.cardShows')}</p>
                                            <ul className="text-teal-700 text-sm mt-1 list-disc pl-4">
                                                <li><Trans i18nKey="applicationHelp.meds.cardShowsAssistance" /></li>
                                                <li><Trans i18nKey="applicationHelp.meds.cardShowsPrice" /></li>
                                                <li><Trans i18nKey="applicationHelp.meds.cardShowsOverview" /></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {displayMeds.map(med => (
                                    <MedicationCard
                                        key={med.id}
                                        med={med}
                                        onRemove={() => removeMedFromList(med.id)}
                                        onPriceReportSubmit={() => {}}
                                        showCopayCards={showCopayCards}
                                        quizAnswers={cardQuizAnswers}
                                    />
                                ))}

                                {/* CTA to application education */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-600 text-white p-3 rounded-lg">
                                            <FileText size={24} aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-blue-900 mb-1">{t('applicationHelp.meds.readyTitle')}</h4>
                                            <p className="text-blue-700 text-sm mb-3">{t('applicationHelp.meds.readyText')}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <button onClick={() => setActiveTab('STEPS')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                                                    {t('applicationHelp.meds.viewSteps')}
                                                </button>
                                                <button onClick={() => setActiveTab('CHECKLIST')} className="bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-bold transition">
                                                    {t('applicationHelp.meds.viewChecklist')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50">
                                <div className="text-slate-400 mb-4" aria-hidden="true"><Pill size={64} className="mx-auto" /></div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('applicationHelp.meds.emptyTitle')}</h3>
                                <p className="text-slate-600 max-w-md mx-auto mb-6">{t('applicationHelp.meds.emptyText')}</p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Link to="/wizard?step=meds" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-bold transition">
                                        <Sparkles size={20} aria-hidden="true" />
                                        {t('applicationHelp.meds.takeQuiz')}
                                    </Link>
                                    <Link to="/medications" className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-lg font-bold transition">
                                        <Search size={20} aria-hidden="true" />
                                        {t('applicationHelp.meds.fullSearch')}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
};

// Loading fallback for lazy-loaded components

export default ApplicationHelp;
