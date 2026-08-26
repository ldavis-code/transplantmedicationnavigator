// MedicationCard and its supporting pieces (price estimates, community
// price reports, the report modal). Extracted from App.jsx so the routes
// that render medication cards (medication search, application help) load
// this as a shared chunk instead of shipping it to every page.
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import TermTooltip from '../components/TermTooltip.jsx';
import ReadAloudButton from '../components/ReadAloudButton.jsx';
import { BookOpen, ArrowRight, Heart, X, CheckCircle, DollarSign, Shield, AlertTriangle, AlertCircle, Printer, ExternalLink, Building, Trash2, Globe, Info, Check, FileText, Pill, HelpCircle, Users, TrendingUp, Clock, Loader2, Star, Filter } from 'lucide-react';
import { LINKS_LAST_VERIFIED } from '../data/constants.js';
import PROGRAMS_ES from '../data/programs.es.json';
import PROGRAM_ELIGIBILITY from '../data/program-eligibility.json';
import COST_PLUS_EXCLUSIONS_DATA from '../data/cost-plus-exclusions.json';
import GOODRX_EXCLUSIONS_DATA from '../data/goodrx-exclusions.json';
import SINGLECARE_EXCLUSIONS_DATA from '../data/singlecare-exclusions.json';
import TRUMPRX_PRICES_DATA from '../data/trumprx-prices.json';
import PRICE_ESTIMATES_DATA from '../data/price-estimates.json';
import { localizeMedName } from '../utils/medNames.js';
import { submitPriceReport, fetchAllPriceStats } from '../lib/priceReportsApi.js';
import { costPlusUrl, goodRxUrl, singleCareUrl } from '../components/PricingLinks.jsx';
import { trackServerEvent, getUiLang } from '../lib/trackServerEvent.js';
import { isEpicGenericMed } from '../utils/medDisplay.js';
import { PAP_FPL_MULTIPLE, fplDollars } from '../data/constants.js';

const getPriceEstimate = (medicationId, category, source) => {
    // Check for medication-specific override first
    if (PRICE_ESTIMATES_DATA.medicationOverrides[medicationId]) {
        const override = PRICE_ESTIMATES_DATA.medicationOverrides[medicationId][source];
        if (override) {
            return `$${override.min} - $${override.max}`;
        }
    }

    // Fall back to category defaults
    const categoryKey = category === 'Immunosuppressant' ? 'Immunosuppressant' : 'default';
    const categoryDefaults = PRICE_ESTIMATES_DATA.categoryDefaults[categoryKey];
    if (categoryDefaults && categoryDefaults[source]) {
        return `$${categoryDefaults[source].min} - $${categoryDefaults[source].max}`;
    }

    // Ultimate fallback
    return 'Check live price';
};

// Helper function to get medication-specific savings estimates
const getMedicationSavingsEstimate = (med) => {
    const medId = med.id?.toLowerCase();
    const category = med.category;
    const costTier = med.cost_tier;
    const copayTier = med.typical_copay_tier;

    // Get retail price from price-estimates data
    let retailPrice;
    if (PRICE_ESTIMATES_DATA.medicationOverrides[medId]) {
        // Use walmart max as retail estimate (highest typical retail)
        const override = PRICE_ESTIMATES_DATA.medicationOverrides[medId];
        retailPrice = override.walmart?.max || override.goodrx?.max || override.costplus?.max;
    }

    // Fall back to category defaults if no override
    if (!retailPrice) {
        const categoryKey = category === 'Immunosuppressant' ? 'Immunosuppressant' : 'default';
        const categoryDefaults = PRICE_ESTIMATES_DATA.categoryDefaults[categoryKey];
        if (categoryDefaults?.walmart) {
            retailPrice = categoryDefaults.walmart.max;
        }
    }

    // Final fallback based on cost_tier
    if (!retailPrice) {
        retailPrice = costTier === 'high' ? 550 : costTier === 'medium' ? 250 : 75;
    }

    // Calculate copay card price based on typical_copay_tier
    // Tier 1: $0-5, Tier 2: $5-15, Tier 3: $15-35, Tier 4/Specialty: $25-75
    let copayPrice;
    if (copayTier === 'Specialty' || copayTier === 4) {
        // Specialty medications: higher copay even with assistance
        copayPrice = Math.round(5 + (retailPrice % 70)); // $5-75 range, varies by med
    } else if (copayTier === 3) {
        copayPrice = Math.round(10 + (retailPrice % 25)); // $10-35 range
    } else if (copayTier === 2) {
        copayPrice = Math.round(5 + (retailPrice % 15)); // $5-20 range
    } else {
        // Tier 1 or low-cost generics
        copayPrice = Math.round(retailPrice % 10); // $0-10 range
    }

    // Ensure copay is always less than retail
    copayPrice = Math.min(copayPrice, Math.round(retailPrice * 0.1));

    // Calculate monthly and annual savings
    const monthlySavings = retailPrice - copayPrice;
    const annualSavings = monthlySavings * 12;

    return {
        retailPrice,
        copayPrice,
        monthlySavings,
        annualSavings
    };
};

// --- COMPONENTS ---

// ScrollToTop Component

const PRICE_REPORTS_KEY = 'transplant_med_price_reports';
const PRICE_STATS_KEY = 'transplant_med_price_stats';
const PRICE_ESTIMATES_LAST_UPDATED = '2026-04-07'; // April 7, 2026

// Get cached stats from localStorage (for immediate render)
const getCachedStats = () => {
    try {
        const stored = localStorage.getItem(PRICE_STATS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        return {};
    }
};

// Legacy: Get local price reports (fallback)
const getPriceReports = () => {
    try {
        const stored = localStorage.getItem(PRICE_REPORTS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.error('Error reading price reports:', e);
        return {};
    }
};

// Save price report - uses API with localStorage fallback
const savePriceReportAsync = async (medicationId, source, price, location, date) => {
    try {
        // Try API first
        const result = await submitPriceReport(medicationId, source, price, location, date);
        if (result.success) {
            // Refresh stats cache in background
            syncPriceStatsFromAPI();
            return true;
        }
        return false;
    } catch (e) {
        console.error('Error saving price report:', e);
        return false;
    }
};

// Sync price stats from API to localStorage cache
const syncPriceStatsFromAPI = async () => {
    try {
        const stats = await fetchAllPriceStats();
        if (stats && Object.keys(stats).length > 0) {
            localStorage.setItem(PRICE_STATS_KEY, JSON.stringify(stats));
        }
    } catch (e) {
        console.warn('Could not sync price stats from API:', e.message);
    }
};

// Get community price stats - uses cached data for immediate render
const getCommunityPriceStats = (medicationId, source) => {
    // First check API-synced stats cache
    const cachedStats = getCachedStats();
    const key = `${medicationId}_${source}`;
    if (cachedStats[key]) {
        return cachedStats[key];
    }

    // Fallback to legacy localStorage format
    const reports = getPriceReports();
    const priceData = reports[key] || [];

    if (priceData.length === 0) return null;

    const prices = priceData.map(r => r.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Only show community prices from last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const recentReports = priceData.filter(r => new Date(r.timestamp) > ninetyDaysAgo);

    return {
        min: min.toFixed(2),
        max: max.toFixed(2),
        avg: avg.toFixed(2),
        count: recentReports.length,
        total: priceData.length
    };
};

// Initialize: sync stats from API on app load
if (typeof window !== 'undefined') {
    syncPriceStatsFromAPI();
}

// MedicationSearch Page

const PriceReportModal = ({ isOpen, onClose, medicationId, medicationName, source, onSubmit }) => {
    const { t } = useTranslation();
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!price || parseFloat(price) <= 0) {
            setFormError(t('medications.priceReport.errorInvalid'));
            return;
        }

        setSubmitting(true);
        const success = await savePriceReportAsync(medicationId, source, price, location, date);

        if (success) {
            onSubmit();
            setPrice('');
            setLocation('');
            setDate(new Date().toISOString().split('T')[0]);
            setFormError('');
            onClose();
        } else {
            setFormError(t('medications.priceReport.errorSaving'));
        }
        setSubmitting(false);
    };

    // Clear error when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormError('');
        }
    }, [isOpen]);

    // Handle Escape key to close modal
    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="price-report-title"
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 id="price-report-title" className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Users size={20} className="text-emerald-600" aria-hidden="true" />
                            {t('medications.priceReport.title')}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">{t('medications.priceReport.via', { name: medicationName, source })}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-600 hover:text-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={t('medications.priceReport.closeAria')}>
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                {/* Error message for accessibility */}
                {formError && (
                    <div
                        role="alert"
                        aria-live="assertive"
                        className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2"
                    >
                        <AlertTriangle size={16} className="flex-shrink-0" aria-hidden="true" />
                        {formError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" aria-describedby={formError ? "price-form-error" : undefined}>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">
                            {t('medications.priceReport.priceLabel')}<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-600">$</span>
                            <input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
                            {t('medications.priceReport.locationLabel')}
                        </label>
                        <input
                            id="location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder={t('medications.priceReport.locationPlaceholder')}
                        />
                    </div>

                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
                            {t('medications.priceReport.dateLabel')}
                        </label>
                        <input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                        />
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                        <Info size={14} className="mt-0.5 flex-shrink-0" />
                        <p>{t('medications.priceReport.note')}</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                        >
                            {t('medications.priceReport.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                            {submitting ? t('medications.priceReport.submitting') : t('medications.priceReport.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// "Link verified" stamp: "July 2026" in English, "julio de 2026" in Spanish.
// iso is a YYYY-MM-DD date string.
function formatVerifiedMonthYear(iso, lang) {
    return new Date(iso + 'T00:00:00').toLocaleDateString(lang === 'es' ? 'es' : 'en-US', { month: 'long', year: 'numeric' });
}

const MedicationCard = ({ med, onRemove, onPriceReportSubmit, showCopayCards: showCopayCardsProp = true, quizAnswers = {} }) => {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('ASSISTANCE');
    // In Spanish, program eligibility text comes from the programs.es.json
    // overlay (keyed by programId); English text from the program record.
    const esProgramNotes = (group, programId) =>
        (i18n.resolvedLanguage === 'es' && programId && PROGRAMS_ES[group]?.[programId]?.notes) || null;
    // If the patient's Epic import shows they take the GENERIC of this med, there
    // is no manufacturer copay card (those are brand-only). Force copay cards off
    // so every showCopayCards-gated section hides, and surface a note pointing to
    // cash options like Cost Plus Drugs instead.
    const takesGeneric = isEpicGenericMed(med.id);
    const showCopayCards = showCopayCardsProp && !takesGeneric;
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportModalData, setReportModalData] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const contentRef = useRef(null);

    // Pharmacy availability - exclude medications not carried by each pharmacy
    // Excluded: Injectable biologics, IV formulations, hospital-only medications
    // Cost Plus Drugs only carries generics - only show if generic_available is true
    const isCostPlusAvailable = med.generic_available === true && !COST_PLUS_EXCLUSIONS_DATA.includes(med.id) && med.manufacturer !== 'Various';
    const isGoodRxAvailable = !GOODRX_EXCLUSIONS_DATA.includes(med.id) && med.manufacturer !== 'Various';
    const isSingleCareAvailable = !SINGLECARE_EXCLUSIONS_DATA.includes(med.id) && med.manufacturer !== 'Various';

    // TrumpRx availability - check if this medication has a TrumpRx discounted price
    const trumpRxData = TRUMPRX_PRICES_DATA.medications[med.id] || null;
    const isTrumpRxAvailable = !!trumpRxData;

    // Cheapest cash source we can name for this medication, preferring Cost
    // Plus (usually lowest, generics only) and falling back through the
    // discount cards. Each is gated on the same availability flags the Price
    // tab uses, so we never headline a price at a pharmacy that doesn't carry
    // the drug.
    const cashPriceSource = isCostPlusAvailable ? 'costplus'
        : isGoodRxAvailable ? 'goodrx'
        : isSingleCareAvailable ? 'singlecare'
        : null;

    // Whether that price is this drug's own figure or a category average.
    // Only 27 of the medications carry a specific override, so the headline
    // still shows for the rest — but it must not put a pharmacy's name next
    // to a number we didn't get for this drug. Naming "Cost Plus $15-45" on
    // brand CellCept would read as a price you can go and pay for the brand,
    // when what Cost Plus stocks is the generic.
    const hasSpecificCashPrice = !!(cashPriceSource
        && PRICE_ESTIMATES_DATA.medicationOverrides[med.id]?.[cashPriceSource]);

    // Lead with the drug (generic) name when (a) the record bundles several
    // brands (e.g. "Neoral / Sandimmune / Gengraf"), or (b) the patient's import
    // shows they take the GENERIC, so we show "Alprazolam", not the brand "Xanax".
    // Don't substitute a brand the patient isn't actually on.
    const hasMultipleBrands = (med.brandName || '').includes('/');
    const leadWithGeneric = takesGeneric || hasMultipleBrands;
    const displayName = localizeMedName(leadWithGeneric ? med.genericName : med.brandName);

    // Extract program info from new nested structure or legacy flat fields
    let copayProgram = med.copayProgram || (med.copayUrl ? { url: med.copayUrl, name: t('medications.card.fallbacks.copayCardName', { manufacturer: med.manufacturer }) } : null);
    let papProgram = med.papProgram || (med.papUrl ? { url: med.papUrl, name: t('medications.card.fallbacks.papName', { manufacturer: med.manufacturer }) } : null);
    const medicarePartD = med.medicarePartD || (med.medicarePartDUrl ? { url: med.medicarePartDUrl, notes: med.medicare2026Note } : null);

    // Determine URLs for copay and PAP programs
    // Use direct URLs for reliability; track clicks client-side via onClick
    const copayProgramId = copayProgram?.programId || med.copayProgramId;
    const copayUrl = copayProgram?.url || med.copayUrl;
    const papProgramId = papProgram?.programId || med.papProgramId;
    const papUrl = papProgram?.url || med.papUrl;
    // In Spanish, program names also come from the programs.es.json overlay;
    // official brand names without an override stay as-is.
    const esProgramName = (group, programId) =>
        (i18n.resolvedLanguage === 'es' && programId && PROGRAMS_ES[group]?.[programId]?.name) || null;
    const esCopayName = esProgramName('copayPrograms', copayProgramId);
    if (copayProgram && esCopayName) copayProgram = { ...copayProgram, name: esCopayName };
    const esPapName = esProgramName('papPrograms', papProgramId);
    if (papProgram && esPapName) papProgram = { ...papProgram, name: esPapName };

    // Commercial insurance is served by copay cards; everyone else by patient
    // assistance programs. The wizard already filters programs on these flags
    // (WizardProgramMatches ELIGIBILITY_KEY), but this card showed every PAP
    // at equal weight — so a commercial patient read a program presented as an
    // option that its own eligibility line rules them out of.
    //
    // Marked rather than hidden, and only when THIS program says so: patient
    // assistance programs vary, a couple do accept commercial coverage, and
    // some carry no eligibility block at all. Those keep full weight. Insurance
    // we don't know about changes nothing either — an unanswered quiz must not
    // grey out a program the patient may well qualify for.
    const eligibilityKey = ['commercial', 'medicare', 'medicaid', 'uninsured']
        .includes(quizAnswers?.insurance_type) ? quizAnswers.insurance_type : null;
    // Eligibility comes from the generated lookup keyed by program id, not
    // from papProgram: nothing upstream carries it. medications.js selects
    // straight from the medications table with no join to programs, so
    // med.papProgram is only ever the {url, name} fallback built above.
    const papNotForThisInsurance = !!(eligibilityKey && papProgramId
        && PROGRAM_ELIGIBILITY.papPrograms?.[papProgramId]?.[eligibilityKey] === false);
    const hasCopayProgram = !!(copayProgram || copayProgramId || med.copayUrl);
    // Manufacturer Patient Assistance Programs are brand-specific. If the patient
    // takes the GENERIC, the brand's PAP (and copay) don't apply, hide both, so a
    // generic never surfaces e.g. the Genentech program for CellCept/Valcyte.
    const hasPapProgram = !!(papProgram || papProgramId || med.papUrl) && !takesGeneric;

    // Use direct URL from JSON data (bypasses database lookup for reliability)
    const papLink = papUrl || `https://www.drugs.com/search.php?searchterm=${med.brandName.split('/')[0]}`;
    const papLinkText = papUrl ? t('medications.card.fallbacks.visitManufacturerProgram') : t('medications.card.fallbacks.searchOnDrugsCom');

    // Get community price stats for each source
    const costPlusStats = getCommunityPriceStats(med.id, 'costplus');
    const goodRxStats = getCommunityPriceStats(med.id, 'goodrx');
    const singleCareStats = getCommunityPriceStats(med.id, 'singlecare');

    const openReportModal = (source, sourceName) => {
        setReportModalData({ source, sourceName });
        setReportModalOpen(true);
    };

    const handleReportSubmit = () => {
        if (onPriceReportSubmit) {
            onPriceReportSubmit();
        }
    };

    return (
        <>
        {reportModalOpen && reportModalData && (
            <PriceReportModal
                isOpen={reportModalOpen}
                onClose={() => {
                    setReportModalOpen(false);
                    setReportModalData(null);
                }}
                medicationId={med.id}
                medicationName={med.brandName}
                source={reportModalData.source}
                onSubmit={handleReportSubmit}
            />
        )}

        <article className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition hover:shadow-md break-inside-avoid" aria-labelledby={`med-${med.id}-title`}>
            {/* User Context Banner - Shows quiz answers */}
            {(quizAnswers?.insurance_type || quizAnswers?.organ_type || quizAnswers?.cost_burden) && (
                <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 no-print">
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        {quizAnswers?.insurance_type && (
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500">{t('medications.card.context.insuranceLabel')}</span>
                                <span className="font-medium text-slate-800">
                                    {quizAnswers.insurance_type === 'commercial' ? t('medications.card.context.commercial') :
                                     quizAnswers.insurance_type === 'medicare' ? t('medications.card.context.medicare') :
                                     quizAnswers.insurance_type === 'medicaid' ? t('medications.card.context.medicaid') :
                                     quizAnswers.insurance_type === 'tricare' ? t('medications.card.context.tricare') :
                                     quizAnswers.insurance_type === 'ihs' ? t('medications.card.context.ihs') :
                                     quizAnswers.insurance_type === 'uninsured' ? t('medications.card.context.uninsured') :
                                     quizAnswers.insurance_type}
                                </span>
                            </div>
                        )}
                        {quizAnswers?.organ_type && (
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500">{t('medications.card.context.transplantLabel')}</span>
                                <span className="font-medium text-slate-800">
                                    {quizAnswers.organ_type.charAt(0).toUpperCase() + quizAnswers.organ_type.slice(1)}
                                    {quizAnswers?.transplant_stage && ` (${quizAnswers.transplant_stage === 'post_1yr' ? t('medications.card.context.stagePost1yr') : t('medications.card.context.stageUnder1yr')})`}
                                </span>
                            </div>
                        )}
                        {quizAnswers?.cost_burden && (
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500">{t('medications.card.context.situationLabel')}</span>
                                <span className={`font-medium ${
                                    quizAnswers.cost_burden === 'struggling' ? 'text-red-700' :
                                    quizAnswers.cost_burden === 'challenging' ? 'text-amber-700' :
                                    'text-emerald-700'
                                }`}>
                                    {quizAnswers.cost_burden === 'struggling' ? t('medications.card.context.struggling') :
                                     quizAnswers.cost_burden === 'challenging' ? t('medications.card.context.challenging') :
                                     quizAnswers.cost_burden === 'managing' ? t('medications.card.context.managing') :
                                     quizAnswers.cost_burden}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <header className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-start md:items-center">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <Pill size={20} className="text-white" aria-hidden="true" />
                    </div>
                    <div>
                        <h2 id={`med-${med.id}-title`} className="text-xl font-bold text-slate-900">{displayName}</h2>
                        <p className="text-slate-600 font-medium text-sm">{!leadWithGeneric && med.genericName !== med.brandName && <>{localizeMedName(med.genericName)} • </>}<span className="text-emerald-600">{t(`medications.categories.${med.category}`, { defaultValue: med.category })}</span></p>
                        {/* Cost Tier Badges */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {med.cost_tier && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    med.cost_tier === 'low' ? 'bg-green-100 text-green-800' :
                                    med.cost_tier === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    <DollarSign size={12} aria-hidden="true" />
                                    {med.cost_tier === 'low' ? t('medications.card.header.lowCost') : med.cost_tier === 'medium' ? t('medications.card.header.mediumCost') : t('medications.card.header.highCost')}
                                </span>
                            )}
                            {med.typical_copay_tier && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    med.typical_copay_tier === 'Specialty' ? 'bg-purple-100 text-purple-800' :
                                    med.typical_copay_tier <= 2 ? 'bg-blue-100 text-blue-800' :
                                    'bg-orange-100 text-orange-800'
                                }`}>
                                    <Pill size={12} aria-hidden="true" />
                                    {med.typical_copay_tier === 'Specialty' ? t('medications.card.header.specialtyTier') : t('medications.card.header.tier', { tier: med.typical_copay_tier })}
                                </span>
                            )}
                            {med.generic_available && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                    <CheckCircle size={12} aria-hidden="true" />
                                    <TermTooltip term="generic" showIcon={false}>{t('medications.card.header.generic')}</TermTooltip>{t('medications.card.header.genericAvailable')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <ReadAloudButton contentRef={contentRef} label={t('medications.card.header.readAloud')} />
                    <button onClick={onRemove} className="text-slate-600 hover:text-red-500 transition p-2 no-print min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={t('medications.card.header.removeAria', { name: localizeMedName(med.brandName) })} title={t('medications.card.header.removeTitle')}><Trash2 size={20} /></button>
                </div>
            </header>

            {/* Savings Summary Card - Shows potential savings at a glance */}
            {showCopayCards && hasCopayProgram && (() => {
                const savingsEstimate = getMedicationSavingsEstimate(med);
                return (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-600 text-white p-2 rounded-lg" aria-hidden="true">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-emerald-800">{t('medications.card.savings.title')}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-slate-500 line-through text-sm">{t('medications.card.savings.withoutHelp')}</span>
                                    <span className="text-red-600 font-bold line-through">${savingsEstimate.retailPrice.toLocaleString()}{t('medications.card.perMo')}</span>
                                    <ArrowRight size={16} className="text-slate-400" aria-hidden="true" />
                                    <span className="text-emerald-700 text-sm">{t('medications.card.savings.withCopayCard')}</span>
                                    <span className="text-emerald-700 font-bold text-lg">${savingsEstimate.copayPrice}{t('medications.card.perMo')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-emerald-700">{t('medications.card.savings.annual')}</p>
                            <p className="text-2xl font-bold text-emerald-700">~${savingsEstimate.annualSavings.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                );
            })()}

            {/* Quick Filters */}
            <div className="bg-white px-6 py-3 border-b border-slate-200 no-print">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Filter size={14} aria-hidden="true" />
                        {t('medications.card.filters.label')}
                    </span>
                    {[
                        { id: 'all', label: t('medications.card.filters.all') },
                        { id: 'eligible', label: t('medications.card.filters.eligible') },
                        { id: 'free', label: t('medications.card.filters.free') },
                        { id: 'under50', label: t('medications.card.filters.under50') },
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                activeFilter === filter.id
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Per-card tab navigation */}
            <nav className="flex overflow-x-auto gap-1 p-2 no-print bg-slate-100 border-b border-slate-200" role="tablist" aria-label={t('medications.card.tabs.aria', { name: localizeMedName(med.brandName) })}>
                {[
                    { id: 'ASSISTANCE', label: t('medications.card.tabs.assistance'), icon: Heart },
                    { id: 'PRICE', label: t('medications.card.tabs.price'), icon: DollarSign },
                    { id: 'OVERVIEW', label: t('medications.card.tabs.overview'), icon: Info },
                    { id: 'PRINT', label: t('medications.card.tabs.print'), icon: Printer },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`${med.id}-${tab.id}-panel`}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                            activeTab === tab.id
                                ? 'bg-emerald-700 text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                        }`}
                    >
                        <tab.icon size={16} aria-hidden="true" /> {tab.label}
                    </button>
                ))}
            </nav>

            <div className="p-6" role="tabpanel" id={`${med.id}-${activeTab}-panel`} ref={contentRef}>
                {activeTab === 'OVERVIEW' && (
                    <div className="space-y-6">
                        <p className="text-slate-700 leading-relaxed">
                            {t('medications.card.overview.manufacturerLabel')}<strong>{med.manufacturer}</strong><br/>
                            {t('medications.card.overview.commonlyPrescribed')}<strong>{(med.commonOrgans || []).map(o => o.charAt(0).toUpperCase() + o.slice(1)).join(', ')}</strong>{t('medications.card.overview.recipients')}
                            {med.stage && <><br/>{t('medications.card.overview.stageLabel')}<strong>{med.stage}</strong></>}
                        </p>
                        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 flex gap-2 items-start" role="note">
                            <Info size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                            <Trans i18nKey="medications.card.overview.tip" />
                        </div>
                        <div className="flex gap-4 mt-4 no-print">
                            <a href={`/out/pap/drugs-com-search?q=${encodeURIComponent(med.brandName.split('/')[0])}&source=medication-card&lang=${getUiLang()}`} target="_blank" rel="noreferrer" className="text-emerald-600 font-medium hover:underline flex items-center gap-1" aria-label={t('medications.card.overview.drugFactsAria', { name: localizeMedName(med.brandName) })}>{t('medications.card.overview.drugFactsLink')}<ExternalLink size={14} aria-hidden="true" /></a>
                        </div>

                        {/* Pharmacies Section */}
                        <section className="mt-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <Building size={20} className="text-emerald-600" aria-hidden="true" />
                                {t('medications.card.overview.pharmaciesTitle')}
                            </h3>
                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 text-slate-700 font-bold">
                                        <tr>
                                            <th scope="col" className="p-3">{t('medications.card.overview.thPharmacy')}</th>
                                            <th scope="col" className="p-3">{t('medications.card.overview.thDescription')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        <tr className="bg-white hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-900">Cost Plus Drugs</td>{/* i18n-ok: brand name */}
                                            <td className="p-3 text-slate-600">{t('medications.card.overview.costPlusDesc')}</td>
                                        </tr>
                                        <tr className="bg-white hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-900">TrumpRx.gov</td>
                                            <td className="p-3 text-slate-600">{t('medications.card.overview.trumpRxDesc')}<a href={t('medications.card.trumpRxGuideHref')} className="text-teal-600 hover:underline font-medium">{t('medications.card.overview.trumpRxGuideLink')}</a></td>
                                        </tr>
                                        <tr className="bg-white hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-900">Walmart Pharmacy</td>
                                            <td className="p-3 text-slate-600">{t('medications.card.overview.walmartDesc')}</td>
                                        </tr>
                                        <tr className="bg-white hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-900">Costco Pharmacy</td>
                                            <td className="p-3 text-slate-600">{t('medications.card.overview.costcoDesc')}</td>
                                        </tr>
                                        <tr className="bg-white hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-900">CVS Pharmacy</td>
                                            <td className="p-3 text-slate-600">{t('medications.card.overview.cvsDesc')}</td>
                                        </tr>
                                        <tr className="bg-white hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-900">Walgreens</td>
                                            <td className="p-3 text-slate-600">{t('medications.card.overview.walgreensDesc')}</td>
                                        </tr>
                                        <tr className="bg-white hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-900">Kroger/Grocery Pharmacies</td>
                                            <td className="p-3 text-slate-600">{t('medications.card.overview.krogerDesc')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Discount Tools Section */}
                        <section className="mt-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <DollarSign size={20} className="text-emerald-600" aria-hidden="true" />
                                {t('medications.card.overview.discountToolsTitle')}
                            </h3>
                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 text-slate-700 font-bold">
                                        <tr>
                                            <th scope="col" className="p-3">{t('medications.card.overview.thTool')}</th>
                                            <th scope="col" className="p-3">{t('medications.card.overview.thDescription')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        <tr className="bg-white hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-900">GoodRx</td>
                                            <td className="p-3 text-slate-600">{t('medications.card.overview.goodRxDesc')}</td>
                                        </tr>
                                        <tr className="bg-white hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-900">SingleCare</td>
                                            <td className="p-3 text-slate-600">{t('medications.card.overview.singleCareDesc')}</td>
                                        </tr>
                                        <tr className="bg-white hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-900">RxSaver</td>
                                            <td className="p-3 text-slate-600">{t('medications.card.overview.rxSaverDesc')}</td>
                                        </tr>
                                        <tr className="bg-white hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-900">ScriptSave WellRx</td>
                                            <td className="p-3 text-slate-600">{t('medications.card.overview.scriptSaveDesc')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}
                {activeTab === 'ASSISTANCE' && (
                    <div className="space-y-4">
                        {/* Cash-price headline. Only one of the four insurance paths —
                            brand plus commercial insurance — used to open with a number,
                            because only that path has a copay card. Generic-plus-
                            commercial, Medicare, and uninsured opened on Foundations &
                            Grants and a deductible warning, while the answer that
                            actually applies to them (a Cost Plus or discount-card cash
                            price) sat one tab over. When there is no copay card to
                            recommend, lead with the cash price instead of leading with
                            nothing. */}
                        {!(showCopayCards && hasCopayProgram) && cashPriceSource && (activeFilter === 'all' || activeFilter === 'under50') && (
                            <section className="border-2 border-teal-400 rounded-xl overflow-hidden bg-gradient-to-r from-teal-50 to-cyan-50 shadow-md">
                                <div className="bg-teal-600 px-4 py-1.5">
                                    <span className="text-white text-xs font-bold flex items-center gap-1">
                                        <DollarSign size={12} aria-hidden="true" />
                                        {t('medications.card.cash.badge')}
                                    </span>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-teal-900">
                                                {hasSpecificCashPrice
                                                    ? t(`medications.card.cash.source.${cashPriceSource}`)
                                                    : t('medications.card.cash.sourceTypical')}
                                            </h3>
                                            <p className="text-sm text-slate-700 mt-2">
                                                {t('medications.card.cash.text')}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-teal-800 font-bold text-lg whitespace-nowrap">
                                                {getPriceEstimate(med.id, med.category, cashPriceSource)}
                                            </div>
                                            <div className="text-xs text-slate-500">{t('medications.card.assistance.perMonth')}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('PRICE')}
                                        className="mt-4 w-full inline-flex items-center justify-center gap-1 bg-teal-700 hover:bg-teal-800 text-white py-2.5 rounded-lg text-sm font-bold transition min-h-[44px]"
                                    >
                                        {t('medications.card.cash.compare')}<ArrowRight size={14} aria-hidden="true" />
                                    </button>
                                    <p className="mt-2 text-xs text-slate-500 text-center">
                                        {hasSpecificCashPrice ? t('medications.card.cash.estimate') : t('medications.card.cash.estimateTypical')}
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* Generic notice - copay cards are brand-only; steer to cash options */}
                        {takesGeneric && (
                            <section className="border-2 border-emerald-300 rounded-xl p-5 bg-emerald-50" role="note">
                                <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                                    <CheckCircle size={16} aria-hidden="true" />
                                    {t('medications.card.assistance.takesGenericTitle')}{med.genericName ? ` (${localizeMedName(med.genericName)})` : ''}
                                </h3>
                                <p className="text-sm text-slate-700 mt-2">
                                    <Trans i18nKey="medications.card.assistance.takesGenericText" />
                                </p>
                            </section>
                        )}
                        {/* Copay Card Section - RECOMMENDED FOR YOU - For Commercial Insurance ONLY */}
                        {showCopayCards && hasCopayProgram && (activeFilter === 'all' || activeFilter === 'eligible' || activeFilter === 'under50') && (
                            <section className="border-2 border-emerald-400 rounded-xl overflow-hidden bg-gradient-to-r from-emerald-50 to-teal-50 shadow-md">
                                <div className="bg-emerald-600 px-4 py-1.5">
                                    <span className="text-white text-xs font-bold flex items-center gap-1">
                                        <Star size={12} className="fill-current" aria-hidden="true" />
                                        {t('medications.card.assistance.recommended')}
                                    </span>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5"></span>
                                            <div>
                                                <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                                                    {copayProgram?.name || t('medications.card.fallbacks.brandCopayCard', { name: localizeMedName(med.brandName) })}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                        <CheckCircle size={12} aria-hidden="true" />
                                                        {t('medications.card.assistance.eligible')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-2">
                                                    {t('medications.card.assistance.copayFor')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-emerald-700 font-bold text-lg">$0 - $10</div>
                                            <div className="text-xs text-slate-500">{t('medications.card.assistance.perMonth')}</div>
                                        </div>
                                    </div>
                                    <a href={copayUrl} target="_blank" rel="noreferrer" onClick={() => { trackServerEvent('copay_card_click', { medication: med.brandName, programId: copayProgramId, source: 'medication-card' }); }} className="mt-4 w-full block text-center bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-bold transition no-print flex items-center justify-center gap-1" aria-label={t('medications.card.assistance.getCardAria', { name: localizeMedName(med.brandName) })}>
                                        {t('medications.card.assistance.getCard')}<ArrowRight size={14} aria-hidden="true" />
                                    </a>
                                    <p className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-500">
                                        <CheckCircle size={12} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
                                        {t('medications.card.assistance.linkVerified', { date: formatVerifiedMonthYear(copayProgram?.lastVerified || LINKS_LAST_VERIFIED, i18n.resolvedLanguage) })}
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* Patient Assistance Program (PAP) - Income Based.
                            hasPapProgram is already false for generics (manufacturer PAPs
                            are brand-specific); Foundations & Grants below still apply. */}
                        {hasPapProgram && (activeFilter === 'all' || activeFilter === 'free') && (
                            <section className={`rounded-xl p-5 ${
                                papNotForThisInsurance
                                    ? 'border border-slate-200 bg-slate-50'
                                    : 'border border-amber-200 bg-gradient-to-r from-amber-50/50 to-orange-50/50'
                            }`}>
                                {/* Says plainly that this one isn't the patient's
                                    route, and where their route is, instead of
                                    leaving them to infer it from an eligibility
                                    line further down. */}
                                {papNotForThisInsurance && (
                                    <div className="mb-3 pb-3 border-b border-slate-200">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                                            <Info size={12} aria-hidden="true" />
                                            {t('medications.card.assistance.papNotEligible')}
                                        </span>
                                        <p className="text-sm text-slate-600 mt-2">
                                            {/* Point at the copay card only when the
                                                patient can actually use one — it is
                                                commercial-only, so the same gate the
                                                copay section itself uses. Medicaid and
                                                Medicare patients get the neutral note. */}
                                            {showCopayCards && hasCopayProgram
                                                ? t('medications.card.assistance.papUseCopayInstead')
                                                : t('medications.card.assistance.papNotEligibleText')}
                                        </p>
                                    </div>
                                )}
                                <div className={`flex items-start justify-between gap-4 ${papNotForThisInsurance ? 'opacity-60' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        <span className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${papNotForThisInsurance ? 'bg-slate-400' : 'bg-amber-500'}`}></span>
                                        <div>
                                            <h3 className={`font-bold flex items-center gap-2 ${papNotForThisInsurance ? 'text-slate-700' : 'text-amber-800'}`}>
                                                {papProgram?.name || t('medications.card.fallbacks.manufacturerPap', { manufacturer: med.manufacturer })}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                    <HelpCircle size={12} aria-hidden="true" />
                                                    {t('medications.card.assistance.incomeBased')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-2">
                                                {t('medications.card.assistance.papFor', {
                                                    multiple: PAP_FPL_MULTIPLE,
                                                    amount: fplDollars(1, PAP_FPL_MULTIPLE),
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-amber-700 font-bold text-lg">{t('medications.card.assistance.free')}</div>
                                        <div className="text-xs text-slate-500">{t('medications.card.assistance.ifEligible')}</div>
                                    </div>
                                </div>
                                <a href={papLink} target="_blank" rel="noreferrer" onClick={() => { trackServerEvent('pap_click', { medication: med.brandName, programId: papProgramId, source: 'medication-card' }); }} className="mt-4 w-full block text-center bg-white border-2 border-amber-500 text-amber-700 hover:bg-amber-50 py-2 rounded-lg text-sm font-medium transition no-print flex items-center justify-center gap-1" aria-label={t('medications.card.assistance.applyAria', { name: localizeMedName(med.brandName) })}>
                                    {t('medications.card.assistance.apply')}<ArrowRight size={14} aria-hidden="true" />
                                </a>
                                {papUrl && (
                                    <p className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-500">
                                        <CheckCircle size={12} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
                                        {t('medications.card.assistance.linkVerified', { date: formatVerifiedMonthYear(papProgram?.lastVerified || LINKS_LAST_VERIFIED, i18n.resolvedLanguage) })}
                                    </p>
                                )}
                            </section>
                        )}

                        {/* Foundations & Grants */}
                        {(activeFilter === 'all' || activeFilter === 'free') && (
                            <section className="border border-sky-200 rounded-xl p-5 bg-gradient-to-r from-sky-50/50 to-blue-50/50">
                                <div className="flex items-start gap-3">
                                    <span className="w-3 h-3 rounded-full bg-sky-500 flex-shrink-0 mt-1.5"></span>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-sky-800 flex items-center gap-2">
                                            <TermTooltip term="foundation-grant" showIcon={false}>{t('medications.card.assistance.foundations')}</TermTooltip>{t('medications.card.assistance.andGrants')}
                                        </h3>
                                        <p className="text-sm text-slate-600 mt-2">
                                            {t('medications.card.assistance.foundationsText')}
                                        </p>
                                        <a href={`/out/foundation/totalassist?source=medication-card&lang=${getUiLang()}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sky-700 hover:text-sky-800 font-medium text-sm" aria-label={t('medications.card.assistance.fundFinderAria')}>
                                            {t('medications.card.assistance.fundFinderLink')}<ExternalLink size={14} aria-hidden="true" />
                                        </a>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Medicare Part D Information */}
                        {medicarePartD && (activeFilter === 'all') && (
                            <section className="border border-blue-200 rounded-xl p-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                                <div className="flex items-start gap-3">
                                    <span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></span>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-blue-800 flex items-center gap-2">
                                            <Shield size={18} aria-hidden="true" />
                                            {t('medications.card.assistance.partDTitle')}
                                        </h3>
                                        <p className="text-sm text-slate-600 mt-2">
                                            {t('medications.card.assistance.partDText', { name: localizeMedName(med.brandName) })}
                                            {(medicarePartD.notes || med.medicare2026Note) && <span className="block mt-2 text-blue-700 font-medium">{medicarePartD.notes || med.medicare2026Note}</span>}
                                        </p>
                                        <a href={medicarePartD.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 font-medium text-sm" aria-label={t('medications.card.assistance.partDAria', { name: localizeMedName(med.brandName) })}>
                                            {t('medications.card.assistance.viewDetails')}<ExternalLink size={14} aria-hidden="true" />
                                        </a>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Deductible Warning */}
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-red-600 text-white p-2 rounded-full flex-shrink-0" aria-hidden="true">
                                    <AlertTriangle size={16} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-red-900 text-sm mb-2">{t('medications.card.warning.title')}</h4>
                                    <p className="text-xs text-red-800 mb-2">
                                        <strong>{t('medications.card.warning.word')}</strong>{t('medications.card.warning.pre')}<span className="font-bold bg-yellow-200 px-1 rounded">{t('medications.card.warning.notCount')}<TermTooltip term="deductible">{t('medications.card.warning.deductible')}</TermTooltip></span>{t('medications.card.warning.notCountPost')}
                                    </p>
                                    <p className="text-xs text-slate-700 mb-3">
                                        {t('medications.card.warning.text2')}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                        <div className="bg-white/80 p-2 rounded border border-emerald-200">
                                            <div className="font-bold text-emerald-700">{t('medications.card.warning.usingInsurance')}</div>
                                            <div className="text-slate-600">{t('medications.card.warning.usingInsuranceDesc')}</div>
                                        </div>
                                        <div className="bg-white/80 p-2 rounded border border-red-200">
                                            <div className="font-bold text-red-700">{t('medications.card.warning.discountCards')}</div>
                                            <div className="text-slate-600">{t('medications.card.warning.discountCardsDesc')}</div>
                                        </div>
                                    </div>
                                    <Link to="/education" className="text-red-700 hover:text-red-800 font-bold text-xs inline-flex items-center gap-1">
                                        {t('medications.card.warning.learnMore')}<ArrowRight size={12} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Footer Notes */}
                        <div className="text-xs text-slate-500 space-y-1 pt-2">
                            {/* Only worth saying where a copay card is actually in
                                play. On a generic, where none exists, it read as an
                                orphan rule about something the card never offered. */}
                            {hasCopayProgram && (
                                <p className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                    {t('medications.card.assistance.copayCommercialOnly')}
                                </p>
                            )}
                            <p className="flex items-center gap-1">
                                <Info size={12} aria-hidden="true" />
                                {t('medications.card.assistance.pricesNote')}
                            </p>
                        </div>

                        {/* Help with Forms */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-5 shadow-sm no-print">
                            <div className="flex items-start gap-4">
                                <div className="bg-indigo-600 text-white p-2.5 rounded-lg flex-shrink-0" aria-hidden="true">
                                    <FileText size={20} />
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
                                        {t('medications.card.assistance.formsTitle')}
                                    </h4>
                                    <p className="text-sm text-slate-700 mb-3">
                                        {t('medications.card.assistance.formsText')}
                                    </p>
                                    <Link
                                        to="/application-help"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition text-sm shadow-md"
                                        aria-label={t('medications.card.assistance.viewGuideAria')}
                                    >
                                        <BookOpen size={16} aria-hidden="true" />
                                        {t('medications.card.assistance.viewGrants')}
                                        <ArrowRight size={16} aria-hidden="true" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'PRICE' && (
                    <div>
                        {/* Color-Coded Legend */}
                        <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-3 text-sm">{t('medications.card.price.guideTitle')}</h4>
                            <div className={`grid grid-cols-2 ${showCopayCards ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-3 text-xs`}>
                                {showCopayCards && (
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0"></span>
                                        <div>
                                            <div className="font-semibold text-emerald-600">{t('medications.card.price.legendCopay')}</div>
                                            <div className="text-slate-500">{t('medications.card.price.legendCopayDesc')}</div>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></span>
                                    <div>
                                        <div className="font-semibold text-orange-600">{t('medications.card.price.legendPap')}</div>
                                        <div className="text-slate-500">{t('medications.card.price.legendPapDesc')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></span>
                                    <div>
                                        <div className="font-semibold text-blue-600">{t('medications.card.price.legendDiscount')}</div>
                                        <div className="text-slate-500">GoodRx, SingleCare</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-slate-400 flex-shrink-0"></span>
                                    <div>
                                        <div className="font-semibold text-slate-500">{t('medications.card.price.legendCash')}</div>
                                        <div className="text-slate-500">{t('medications.card.price.legendCashDesc')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-teal-500 flex-shrink-0"></span>
                                    <div>
                                        <div className="font-semibold text-teal-600">TrumpRx.gov</div>
                                        <div className="text-slate-500">{t('medications.card.price.legendTrumpRxDesc')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price Estimates Notice */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800 flex items-start gap-2">
                            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <p><Trans i18nKey="medications.card.price.estimatesNotice" /></p>
                        </div>

                        {/* Unified Price Estimates Table */}
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-sm text-left min-w-[500px]">
                                <caption className="sr-only">{t('medications.card.price.caption', { name: localizeMedName(med.brandName) })}</caption>
                                <thead className="bg-slate-100 text-slate-700 font-bold">
                                    <tr>
                                        <th scope="col" className="p-3">{t('medications.card.price.thPharmacyTool')}</th>
                                        <th scope="col" className="p-3">{t('medications.card.price.thEstimatedPrice')}</th>
                                        <th scope="col" className="p-3 no-print">{t('medications.card.price.thAction')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {/* Copay Card Row - Green - Only show for commercial insurance */}
                                    {showCopayCards && hasCopayProgram && (
                                    <tr className="bg-emerald-50/50 hover:bg-emerald-50">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                                                <div className="font-bold text-emerald-600">{copayProgram?.name || t('medications.card.fallbacks.copayCardName', { manufacturer: med.manufacturer })}</div>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5 ml-4.5">{t('medications.card.price.copayForShort')}</div>
                                        </td>
                                        <td className="p-3">
                                            <div className="text-emerald-600 font-bold">{t('medications.card.price.copayRange')}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{t('medications.card.price.manufacturerProgram')}</div>
                                        </td>
                                        <td className="p-3 no-print">
                                            <button onClick={() => setActiveTab('ASSISTANCE')} className="text-emerald-600 hover:underline font-medium flex items-center gap-1" aria-label={t('medications.card.price.viewCopayAria', { name: localizeMedName(med.brandName) })}>
                                                {t('medications.card.assistance.getCard')}<ArrowRight size={14} aria-hidden="true" />
                                            </button>
                                        </td>
                                    </tr>
                                    )}

                                    {/* Patient Assistance Row - Orange */}
                                    {hasPapProgram && (
                                    <tr className="bg-orange-50/50 hover:bg-orange-50">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0"></span>
                                                <div className="font-bold text-orange-600">{papProgram?.name || t('medications.card.fallbacks.manufacturerPapShort', { manufacturer: med.manufacturer })}</div>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5 ml-4.5">{t('medications.card.price.papForShort')}</div>
                                        </td>
                                        <td className="p-3">
                                            <div className="text-orange-600 font-bold">{t('medications.card.assistance.free')}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{t('medications.card.price.incomeRules')}</div>
                                        </td>
                                        <td className="p-3 no-print">
                                            <button onClick={() => setActiveTab('ASSISTANCE')} className="text-orange-600 hover:underline font-medium flex items-center gap-1" aria-label={t('medications.card.price.viewPapAria', { name: localizeMedName(med.brandName) })}>
                                                {t('medications.card.assistance.apply')}<ArrowRight size={14} aria-hidden="true" />
                                            </button>
                                        </td>
                                    </tr>
                                    )}

                                    {/* GoodRx Row - Blue */}
                                    {isGoodRxAvailable && (
                                    <tr className="bg-blue-50/50 hover:bg-blue-50">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                                                <div className="font-bold text-blue-600">GoodRx</div>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5 ml-4.5">{t('medications.card.price.goodRxDesc')}</div>
                                            {goodRxStats && (
                                                <div className="text-xs text-blue-600 flex items-center gap-1 mt-1 ml-4.5">
                                                    <Users size={14} />
                                                    {t('medications.card.price.community', { min: goodRxStats.min, max: goodRxStats.max, num: goodRxStats.count })}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="text-blue-600 font-bold">
                                                {getPriceEstimate(med.id, med.category, 'goodrx')}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <Clock size={14} />
                                                {t('medications.card.price.estUpdated')}
                                            </div>
                                        </td>
                                        <td className="p-3 no-print">
                                            <div className="flex flex-col gap-1">
                                                <a href={goodRxUrl(med)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium flex items-center gap-1" aria-label={t('medications.card.price.checkLiveGoodRxAria', { name: localizeMedName(med.genericName) })}>
                                                    {t('medications.card.price.checkLive')}<ExternalLink size={14} aria-hidden="true" />
                                                </a>
                                                <button onClick={() => openReportModal('goodrx', 'GoodRx')} className="text-slate-500 hover:underline text-sm flex items-center gap-1 min-h-[44px] px-2">
                                                    <TrendingUp size={14} aria-hidden="true" /> {t('medications.card.price.reportPrice')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    )}

                                    {/* SingleCare Row - Blue */}
                                    {isSingleCareAvailable && (
                                    <tr className="bg-blue-50/50 hover:bg-blue-50">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                                                <div className="font-bold text-blue-600">SingleCare</div>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5 ml-4.5">{t('medications.card.price.singleCareDesc')}</div>
                                            {singleCareStats && (
                                                <div className="text-xs text-blue-600 flex items-center gap-1 mt-1 ml-4.5">
                                                    <Users size={14} />
                                                    {t('medications.card.price.community', { min: singleCareStats.min, max: singleCareStats.max, num: singleCareStats.count })}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="text-blue-600 font-bold">
                                                {getPriceEstimate(med.id, med.category, 'singlecare')}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <Clock size={14} />
                                                {t('medications.card.price.estUpdated')}
                                            </div>
                                        </td>
                                        <td className="p-3 no-print">
                                            <div className="flex flex-col gap-1">
                                                <a href={singleCareUrl(med)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium flex items-center gap-1" aria-label={t('medications.card.price.checkLiveSingleCareAria', { name: localizeMedName(med.genericName) })}>
                                                    {t('medications.card.price.checkLive')}<ExternalLink size={14} aria-hidden="true" />
                                                </a>
                                                <button onClick={() => openReportModal('singlecare', 'SingleCare')} className="text-slate-500 hover:underline text-sm flex items-center gap-1 min-h-[44px] px-2">
                                                    <TrendingUp size={14} aria-hidden="true" /> {t('medications.card.price.reportPrice')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    )}

                                    {/* Cost Plus Drugs Row - Gray */}
                                    {isCostPlusAvailable && (
                                    <tr className="bg-slate-50/50 hover:bg-slate-100">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 flex-shrink-0"></span>
                                                <div className="font-bold text-slate-500">Cost Plus Drugs</div>{/* i18n-ok: brand name */}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5 ml-4.5">{t('medications.card.price.costPlusDesc')}</div>
                                            {costPlusStats && (
                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1 ml-4.5">
                                                    <Users size={14} />
                                                    {t('medications.card.price.community', { min: costPlusStats.min, max: costPlusStats.max, num: costPlusStats.count })}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="text-slate-600 font-bold">
                                                {getPriceEstimate(med.id, med.category, 'costplus')}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <Clock size={14} />
                                                {t('medications.card.price.estUpdated')}
                                            </div>
                                        </td>
                                        <td className="p-3 no-print">
                                            <div className="flex flex-col gap-1">
                                                <a href={costPlusUrl(med)} target="_blank" rel="noreferrer" className="text-slate-600 hover:underline font-medium flex items-center gap-1" aria-label={t('medications.card.price.checkLiveCostPlusAria')}>
                                                    {t('medications.card.price.checkLive')}<ExternalLink size={14} aria-hidden="true" />
                                                </a>
                                                <button onClick={() => openReportModal('costplus', 'Cost Plus Drugs')} className="text-slate-500 hover:underline text-sm flex items-center gap-1 min-h-[44px] px-2">
                                                    <TrendingUp size={14} aria-hidden="true" /> {t('medications.card.price.reportPrice')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    )}

                                    {/* TrumpRx Row - Teal */}
                                    {isTrumpRxAvailable && (
                                    <tr className="bg-teal-50/50 hover:bg-teal-50">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 flex-shrink-0"></span>
                                                <div className="font-bold text-teal-700">TrumpRx.gov</div>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5 ml-4.5">{t('medications.card.price.trumpRxDesc')}</div>
                                            {trumpRxData.medicareRestriction && (
                                                <div className="text-xs text-red-600 flex items-center gap-1 mt-1 ml-4.5">
                                                    <AlertCircle size={12} />
                                                    {t('medications.card.price.trumpRxExclude')}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="text-teal-700 font-bold">
                                                ${trumpRxData.trumprxPrice}{trumpRxData.trumprxPriceMax ? ` - $${trumpRxData.trumprxPriceMax}` : ''}{t('medications.card.perMo')}
                                            </div>
                                            {(trumpRxData.originalPrice || trumpRxData.discount) && (
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {trumpRxData.originalPrice && <span className="line-through">${trumpRxData.originalPrice}</span>}
                                                {' '}<span className="text-teal-600 font-semibold">{trumpRxData.discount}</span>
                                            </div>
                                            )}
                                            {trumpRxData.note && (
                                                <div className="text-xs text-slate-500 mt-1 italic">{trumpRxData.note}</div>
                                            )}
                                        </td>
                                        <td className="p-3 no-print">
                                            <div className="flex flex-col gap-1">
                                                <a href={t('medications.card.trumpRxGuideHref')} className="text-teal-600 hover:underline font-medium flex items-center gap-1" aria-label={t('medications.card.price.ourGuideAria')}>
                                                    {t('medications.card.price.ourGuide')}<ArrowRight size={14} aria-hidden="true" />
                                                </a>
                                                <a href={`/out/pap/trumprx-gov?source=medication-card&lang=${getUiLang()}`} target="_blank" rel="noreferrer" className="text-teal-500 hover:underline text-sm flex items-center gap-1 min-h-[44px] px-2" aria-label={t('medications.card.price.visitTrumpRxAria')}>
                                                    <ExternalLink size={14} aria-hidden="true" /> TrumpRx.gov
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Copay Card Warning - Only show when copay cards are displayed */}
                        {showCopayCards && hasCopayProgram && (
                            <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle size={14} />
                                {t('medications.card.assistance.copayCommercialOnly')}
                            </div>
                        )}

                        {/* Price Info Footer */}
                        <div className="mt-3 space-y-2">
                            <div className="text-xs text-slate-600 italic flex items-start gap-2" role="note">
                                <Info size={14} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
                                <p>{t('medications.card.price.footerNote')}</p>
                            </div>
                            {(costPlusStats || goodRxStats || singleCareStats) && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-start gap-2">
                                    <Users size={14} className="flex-shrink-0 mt-0.5" />
                                    <p><Trans i18nKey="medications.card.price.communityNote" /></p>
                                </div>
                            )}

                            {/* Deductible Trap with Discount Cards & Cash Warning */}
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-4 mt-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-red-600 text-white p-2 rounded-full flex-shrink-0" aria-hidden="true">
                                        <AlertTriangle size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-red-900 text-sm mb-2">{t('medications.card.warning.title')}</h4>
                                        <p className="text-xs text-red-800 mb-2">
                                            <strong>{t('medications.card.warning.word')}</strong>{t('medications.card.warning.pre')}<span className="font-bold bg-yellow-200 px-1 rounded">{t('medications.card.warning.notCount')}<TermTooltip term="deductible">{t('medications.card.warning.deductible')}</TermTooltip></span>{t('medications.card.warning.notCountPost')}
                                        </p>
                                        <p className="text-xs text-slate-700 mb-3">
                                            {t('medications.card.warning.text2')}
                                        </p>
                                        {isCostPlusAvailable && (
                                            <div className="bg-amber-100 border border-amber-300 rounded p-2 mb-3 text-xs text-amber-900">
                                                <Trans i18nKey="medications.card.price.costPlusNote" />
                                            </div>
                                        )}
                                        {isTrumpRxAvailable && (
                                            <div className="bg-teal-100 border border-teal-300 rounded p-2 mb-3 text-xs text-teal-900">
                                                <Trans i18nKey="medications.card.price.trumpRxNotePre" />{trumpRxData.medicareRestriction ? t('medications.card.price.trumpRxNoteMedicare') : ''}{t('medications.card.price.trumpRxNoteCompare')}<a href={t('medications.card.trumpRxGuideHref')} className="text-teal-700 font-bold underline">{t('medications.card.price.readFullGuide')}</a>.
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                            <div className="bg-white/80 p-2 rounded border border-emerald-200">
                                                <div className="font-bold text-emerald-700">{t('medications.card.warning.usingInsurance')}</div>
                                                <div className="text-slate-600">{t('medications.card.warning.usingInsuranceDesc')}</div>
                                            </div>
                                            <div className="bg-white/80 p-2 rounded border border-red-200">
                                                <div className="font-bold text-red-700">{t('medications.card.warning.discountCards')}</div>
                                                <div className="text-slate-600">{t('medications.card.warning.discountCardsDesc')}</div>
                                            </div>
                                        </div>
                                        <Link to="/education" className="text-red-700 hover:text-red-800 font-bold text-xs inline-flex items-center gap-1">
                                            {t('medications.card.warning.learnMore')}<ArrowRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'PRINT' && (
                    <div className="space-y-4 print-friendly">
                        {/* Medication Summary for Print */}
                        <div className="border-b border-slate-200 pb-4">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('medications.card.print.detailsTitle')}</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="text-slate-600">{t('medications.card.print.brandName')}</span> <strong>{localizeMedName(med.brandName)}</strong></div>
                                <div><span className="text-slate-600">{t('medications.card.print.genericName')}</span> <strong>{localizeMedName(med.genericName)}</strong></div>
                                <div><span className="text-slate-600">{t('medications.card.print.category')}</span> <strong>{t(`medications.categories.${med.category}`, { defaultValue: med.category })}</strong></div>
                                <div><span className="text-slate-600">{t('medications.card.print.manufacturer')}</span> <strong>{med.manufacturer}</strong></div>
                                <div><span className="text-slate-600">{t('medications.card.print.organs')}</span> <strong>{(med.commonOrgans || []).map(o => o.charAt(0).toUpperCase() + o.slice(1)).join(', ')}</strong></div>
                                <div><span className="text-slate-600">{t('medications.card.print.stage')}</span> <strong>{med.stage || t('medications.card.print.notAvailable')}</strong></div>
                            </div>
                        </div>

                        {/* Price Estimates Summary */}
                        <div className="border-b border-slate-200 pb-4">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('medications.card.print.priceTitle')}</h3>
                            <div className="space-y-1 text-sm">
                                {showCopayCards && hasCopayProgram && (
                                    <div className="flex justify-between">
                                        <span>{copayProgram?.name || t('medications.card.print.copayCardFallback')}:</span>
                                        <strong className="text-emerald-600">{t('medications.card.price.copayRange')}</strong>
                                    </div>
                                )}
                                {hasPapProgram && (
                                    <div className="flex justify-between">
                                        <span>{papProgram?.name || t('medications.card.print.papFallback')}:</span>
                                        <strong className="text-orange-600">{t('medications.card.print.freeIfEligible')}</strong>
                                    </div>
                                )}
                                {isGoodRxAvailable && (
                                    <div className="flex justify-between">
                                        <span>GoodRx:</span>
                                        <strong className="text-blue-600">{getPriceEstimate(med.id, med.category, 'goodrx')}</strong>
                                    </div>
                                )}
                                {isSingleCareAvailable && (
                                    <div className="flex justify-between">
                                        <span>SingleCare:</span>
                                        <strong className="text-blue-600">{getPriceEstimate(med.id, med.category, 'singlecare')}</strong>
                                    </div>
                                )}
                                {isCostPlusAvailable && (
                                    <div className="flex justify-between">
                                        <span>Cost Plus Drugs:</span>
                                        <strong className="text-slate-600">{getPriceEstimate(med.id, med.category, 'costplus')}</strong>
                                    </div>
                                )}
                                {isTrumpRxAvailable && (
                                    <div className="flex justify-between">
                                        <span>TrumpRx.gov:</span>
                                        <strong className="text-teal-600">${trumpRxData.trumprxPrice}{trumpRxData.trumprxPriceMax ? ` - $${trumpRxData.trumprxPriceMax}` : ''}{t('medications.card.perMo')}</strong>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Assistance Programs Summary */}
                        <div className="border-b border-slate-200 pb-4">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('medications.card.print.assistanceTitle')}</h3>
                            <div className="space-y-2 text-sm">
                                {showCopayCards && hasCopayProgram && (
                                    <div className="p-2 bg-violet-50 rounded">
                                        <strong className="text-violet-800">{copayProgram?.name || t('medications.card.print.copayAvailableFallback')}</strong>
                                        <p className="text-slate-600 text-xs">{esProgramNotes('copayPrograms', copayProgramId) || copayProgram?.eligibility_notes || t('medications.card.print.copayEligibilityFallback')}</p>
                                    </div>
                                )}
                                {hasPapProgram && (
                                    <div className="p-2 bg-emerald-50 rounded">
                                        <strong className="text-emerald-800">{papProgram?.name || t('medications.card.print.papProgramFallback')}</strong>
                                        <p className="text-slate-600 text-xs">{esProgramNotes('papPrograms', papProgramId) || papProgram?.eligibility_notes || t('medications.card.print.papEligibilityFallback')}</p>
                                    </div>
                                )}
                                <div className="p-2 bg-sky-50 rounded">
                                    <strong className="text-sky-800">{t('medications.card.print.foundationGrants')}</strong>
                                    <p className="text-slate-600 text-xs">{t('medications.card.print.foundationCheck')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Items Checklist */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('medications.card.print.checklistTitle')}</h3>
                            <ul className="space-y-1 text-sm">
                                {showCopayCards && hasCopayProgram && (
                                    <li className="flex items-center gap-2">
                                        <span className="w-4 h-4 border border-slate-400 rounded inline-block flex-shrink-0"></span>
                                        {t('medications.card.print.applyFor')}{copayProgram?.name || t('medications.card.fallbacks.copayCardName', { manufacturer: med.manufacturer })}
                                    </li>
                                )}
                                {hasPapProgram && (
                                    <li className="flex items-center gap-2">
                                        <span className="w-4 h-4 border border-slate-400 rounded inline-block flex-shrink-0"></span>
                                        {t('medications.card.print.applyFor')}{papProgram?.name || t('medications.card.fallbacks.manufacturerPap', { manufacturer: med.manufacturer })}
                                    </li>
                                )}
                                <li className="flex items-center gap-2">
                                    <span className="w-4 h-4 border border-slate-400 rounded inline-block flex-shrink-0"></span>
                                    {t('medications.card.print.checkFoundation')}
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-4 h-4 border border-slate-400 rounded inline-block flex-shrink-0"></span>
                                    {t('medications.card.print.comparePrices')}
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-4 h-4 border border-slate-400 rounded inline-block flex-shrink-0"></span>
                                    {t('medications.card.print.askTeam')}
                                </li>
                            </ul>
                        </div>

                        {/* Print Button */}
                        <div className="pt-4 no-print">
                            <button
                                onClick={() => window.print()}
                                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg flex items-center justify-center gap-2"
                            >
                                <Printer size={18} /> {t('medications.card.print.printButton')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </article>
        </>
    );
};

const ExternalMedCard = ({ name, onRemove }) => {
    const { t } = useTranslation();
    const encodedTerm = encodeURIComponent(name);
    return (
        <article className="bg-white rounded-xl shadow-sm border border-indigo-200 overflow-hidden transition hover:shadow-md break-inside-avoid" aria-labelledby={`custom-med-${name}`}>
            <header className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
                <div>
                    <h2 id={`custom-med-${name}`} className="text-xl font-bold text-indigo-900 flex items-center gap-2"><Globe size={20} aria-hidden="true" /> {name}</h2>
                    <p className="text-indigo-700 text-xs font-medium">{t('medications.external.label')}</p>
                </div>
                <button onClick={onRemove} className="text-indigo-300 hover:text-red-500 transition p-2 no-print" title={t('medications.card.header.removeTitle')} aria-label={t('medications.card.header.removeAria', { name })}><Trash2 size={20} /></button>
            </header>
            <div className="p-6">
                <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400 text-sm text-amber-900 mb-4 flex gap-2 items-start" role="note">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <p><Trans i18nKey="medications.external.note" /></p>
                </div>
                <nav className="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label={t('medications.external.navAria', { name })}>
                    <a href={`/out/copay/costplus-search?q=${encodedTerm}&source=medication-card-external&lang=${getUiLang()}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-sm transition group" aria-label={t('medications.external.checkCostPlusAria', { name })}>
                        <span className="font-bold text-slate-800 group-hover:text-emerald-800">Cost Plus</span>
                        <ExternalLink size={16} className="text-slate-400 group-hover:text-emerald-500" aria-hidden="true" />
                    </a>
                    <a href={`/out/copay/goodrx-search?q=${encodedTerm}&source=medication-card-external&lang=${getUiLang()}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-sm transition group" aria-label={t('medications.external.checkGoodRxAria', { name })}>
                        <span className="font-bold text-slate-800 group-hover:text-emerald-800">GoodRx</span>
                        <ExternalLink size={16} className="text-slate-400 group-hover:text-emerald-500" aria-hidden="true" />
                    </a>
                    <a href={`/out/copay/singlecare-search?q=${encodedTerm}&source=medication-card-external&lang=${getUiLang()}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-sm transition group" aria-label={t('medications.external.checkSingleCareAria', { name })}>
                        <span className="font-bold text-slate-800 group-hover:text-emerald-800">SingleCare</span>
                        <ExternalLink size={16} className="text-slate-400 group-hover:text-emerald-500" aria-hidden="true" />
                    </a>
                </nav>
                <div className="mt-4 pt-4 border-t border-slate-100 text-center no-print">
                    <a href={`/out/pap/drugs-com-search?q=${encodedTerm}&source=medication-card-external&lang=${getUiLang()}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline flex items-center justify-center gap-1" aria-label={t('medications.external.searchDrugsAria', { name })}>
                        {t('medications.external.searchDrugsLink', { name })}<ExternalLink size={12} aria-hidden="true" />
                    </a>
                </div>
            </div>
        </article>
    );
};

// Insurance Change Simulation Component

export { MedicationCard, ExternalMedCard, PriceReportModal };
