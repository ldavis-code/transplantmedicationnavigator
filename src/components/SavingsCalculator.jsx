import { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, ChevronDown, Shield, Database, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import priceEstimates from '../data/price-estimates.json';

// Assistance type savings estimates (percentage off retail)
const ASSISTANCE_SAVINGS = {
    pap: { min: 0.95, max: 1.0, label: 'Patient Assistance Program', description: 'Usually free ($0)' },
    copay_card: { min: 0.70, max: 0.95, label: 'Copay Card', description: '$0-$35/month typical' },
    foundation: { min: 0.80, max: 1.0, label: 'Foundation Grant', description: 'Covers copays' },
    generic: { min: 0.70, max: 0.90, label: 'Generic Switch', description: '70-90% savings' },
    discount_card: { min: 0.50, max: 0.80, label: 'Discount Card (GoodRx)', description: '50-80% off retail' },
    medicare_negotiated: { min: 0.50, max: 0.79, label: 'Medicare Negotiated', description: '50-79% off (2026)' },
};

// Get a low–high monthly price range for a medication, plus whether we have
// medication-specific data. When there is no override we fall back to a category
// average, so `hasOverride` is false and the UI labels the result as a rough
// estimate (a range) rather than a false-precise single number.
function getPriceRange(medicationId, medicationName) {
    const id = medicationId?.toLowerCase() || medicationName?.toLowerCase().split(' ')[0];
    const override = id ? priceEstimates.medicationOverrides[id] : null;
    const data = override
        || priceEstimates.categoryDefaults?.Immunosuppressant
        || priceEstimates.categoryDefaults?.default
        || {};

    // Retail baseline = Walmart-style cash price (higher than discount pharmacies).
    const retailLow = data.walmart?.min ?? data.goodrx?.min ?? 30;
    const retailHigh = data.walmart?.max ?? data.goodrx?.max ?? 85;
    // Assisted = best discount/cash route (Cost Plus first, then GoodRx).
    let assistedLow = data.costplus?.min ?? data.goodrx?.min ?? 15;
    let assistedHigh = data.costplus?.max ?? data.goodrx?.max ?? 45;
    // A Medicare 2026 negotiated price is a firm figure when present.
    if (override?.medicare2026?.negotiated) {
        assistedLow = Math.min(assistedLow, override.medicare2026.negotiated);
        assistedHigh = override.medicare2026.negotiated;
    }
    return { retailLow, retailHigh, assistedLow, assistedHigh, hasOverride: !!override };
}

// Fallback medications if none provided from context
const FALLBACK_MEDICATIONS = [
    { id: 'creon', name: 'Creon (Pancrelipase)', category: 'Digestive Enzyme' },
    { id: 'eliquis', name: 'Eliquis (Apixaban)', category: 'Anticoagulant' },
    { id: 'entresto', name: 'Entresto (Heart Failure)', category: 'Cardiovascular' },
    { id: 'farxiga', name: 'Farxiga (Dapagliflozin)', category: 'Diabetes/Heart/Kidney' },
    { id: 'jardiance', name: 'Jardiance (Empagliflozin)', category: 'Diabetes/Heart/Kidney' },
    { id: 'mycophenolate', name: 'Mycophenolate (Generic CellCept)', category: 'Immunosuppressant' },
    { id: 'noxafil', name: 'Noxafil (Posaconazole)', category: 'Antifungal' },
    { id: 'prevymis', name: 'Prevymis (Letermovir)', category: 'Antiviral' },
    { id: 'prograf', name: 'Prograf (Brand Tacrolimus)', category: 'Immunosuppressant' },
    { id: 'sirolimus', name: 'Sirolimus (Generic Rapamune)', category: 'Immunosuppressant' },
    { id: 'tacrolimus', name: 'Tacrolimus (Generic Prograf)', category: 'Immunosuppressant' },
    { id: 'valcyte', name: 'Valganciclovir (Generic Valcyte)', category: 'Antiviral' },
    { id: 'vfend', name: 'Voriconazole (Generic Vfend)', category: 'Antifungal' },
    { id: 'xarelto', name: 'Xarelto (Rivaroxaban)', category: 'Anticoagulant' },
];

export default function SavingsCalculator({ medications = [] }) {
    const { t } = useTranslation();
    const [selectedMeds, setSelectedMeds] = useState([
        { id: 'valcyte', name: 'Valganciclovir (Generic Valcyte)', quantity: 1 }
    ]);
    const [showResults, setShowResults] = useState(false);
    const [calculations, setCalculations] = useState(null);
    const [errors, setErrors] = useState({});

    // Free for all patients - no medication limit
    const canAddMore = true;

    // Format dollars, and a low–high range. When both ends round to the same
    // value we show one number; otherwise a range, so default-based estimates
    // read as approximate, not precise.
    const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
    const range = (lo, hi) => (Math.round(lo) === Math.round(hi) ? money(lo) : `${money(lo)} – ${money(hi)}`);

    // Use medications from context if available, otherwise use fallback
    // This gives access to all medications from the database
    const allMedications = medications?.length > 0
        ? medications.map(med => ({
            id: med.id,
            name: med.brandName || med.genericName || med.name,
            category: med.category
        }))
        : [...FALLBACK_MEDICATIONS];

    // Sort alphabetically by name
    allMedications.sort((a, b) => a.name.localeCompare(b.name));

    const addMedication = () => {
        setSelectedMeds(prev => [...prev, { id: '', name: '', quantity: 1 }]);
        setShowResults(false);
    };

    const updateMedication = (index, field, value) => {
        setSelectedMeds(prev => {
            const updated = [...prev];
            if (field === 'medication') {
                const med = allMedications.find(m => m.id === value);
                updated[index] = {
                    ...updated[index],
                    id: value,
                    name: med?.name || value
                };
            } else {
                updated[index] = { ...updated[index], [field]: value };
            }
            return updated;
        });
        setErrors(prev => {
            const updated = { ...prev };
            delete updated[`medication-${index}`];
            delete updated[`quantity-${index}`];
            return updated;
        });
        setShowResults(false);
    };

    const removeMedication = (index) => {
        setSelectedMeds(prev => prev.filter((_, i) => i !== index));
        setShowResults(false);
    };

    const calculateSavings = () => {
        // Validate inputs
        const newErrors = {};
        selectedMeds.forEach((med, index) => {
            if (!med.id && !med.name) {
                newErrors[`medication-${index}`] = t('savings.calculator.medicationError');
            }
            if (!med.quantity || med.quantity < 1 || med.quantity > 12) {
                newErrors[`quantity-${index}`] = t('savings.calculator.quantityError');
            }
        });
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        const results = selectedMeds
            .filter(med => med.id || med.name)
            .map(med => {
                const r = getPriceRange(med.id, med.name);
                const qty = med.quantity || 1;
                const retailLow = r.retailLow * qty;
                const retailHigh = r.retailHigh * qty;
                const assistedLow = r.assistedLow * qty;
                const assistedHigh = r.assistedHigh * qty;
                // Savings assume the cheapest assisted route (the one we steer to).
                // The range then reflects how much the cash/retail price itself varies.
                const monthlySavingsHigh = Math.max(0, retailHigh - assistedLow);
                const monthlySavingsLow = Math.max(0, retailLow - assistedLow);
                return {
                    ...med,
                    hasOverride: r.hasOverride,
                    retailLow, retailHigh,
                    assistedLow, assistedHigh,
                    monthlySavingsLow, monthlySavingsHigh,
                    annualSavingsLow: monthlySavingsLow * 12,
                    annualSavingsHigh: monthlySavingsHigh * 12,
                };
            });

        const sum = (key) => results.reduce((acc, r) => acc + r[key], 0);
        setCalculations({
            medications: results,
            totalMonthlyRetailLow: sum('retailLow'),
            totalMonthlyRetailHigh: sum('retailHigh'),
            totalMonthlyAssistedLow: sum('assistedLow'),
            totalMonthlyAssistedHigh: sum('assistedHigh'),
            totalAnnualLow: sum('annualSavingsLow'),
            totalAnnualHigh: sum('annualSavingsHigh'),
            anyRough: results.some(r => !r.hasOverride),
        });
        setShowResults(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                    <Calculator className="w-8 h-8 text-emerald-600" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {t('savings.calculator.title')}
                </h2>
                <p className="text-slate-600 max-w-xl mx-auto">
                    {t('savings.calculator.intro')}
                </p>
            </div>

            {/* Medication List Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('savings.calculator.listTitle')}</h3>
                <p className="text-sm text-slate-500 mb-4">
                    {t('savings.calculator.listSubtitle')}
                </p>

                {/* Medication Entries */}
                <div className="space-y-3">
                    {selectedMeds.map((med, index) => (
                        <div key={index} className="flex items-end gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="flex-1">
                                <label htmlFor={`medication-select-${index}`} className="block text-sm font-medium text-slate-700 mb-1">
                                    {t('savings.calculator.medicationLabel', { number: index + 1 })}
                                </label>
                                <select
                                    id={`medication-select-${index}`}
                                    value={med.id}
                                    onChange={(e) => updateMedication(index, 'medication', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white min-h-[44px] ${errors[`medication-${index}`] ? 'border-red-500' : 'border-slate-300'}`}
                                    aria-describedby={errors[`medication-${index}`] ? `medication-error-${index}` : undefined}
                                    aria-invalid={errors[`medication-${index}`] ? 'true' : undefined}
                                >
                                    <option value="">{t('savings.calculator.selectPlaceholder')}</option>
                                    {allMedications.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                                {errors[`medication-${index}`] && (
                                    <p id={`medication-error-${index}`} className="text-red-600 text-xs mt-1" role="alert">
                                        {errors[`medication-${index}`]}
                                    </p>
                                )}
                            </div>
                            <div className="w-24">
                                <label htmlFor={`medication-quantity-${index}`} className="block text-sm font-medium text-slate-700 mb-1">
                                    {t('savings.calculator.quantityLabel')}
                                </label>
                                <input
                                    id={`medication-quantity-${index}`}
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={med.quantity}
                                    onChange={(e) => updateMedication(index, 'quantity', parseInt(e.target.value) || 1)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center min-h-[44px] ${errors[`quantity-${index}`] ? 'border-red-500' : 'border-slate-300'}`}
                                    aria-describedby={errors[`quantity-${index}`] ? `quantity-error-${index}` : undefined}
                                    aria-invalid={errors[`quantity-${index}`] ? 'true' : undefined}
                                />
                                {errors[`quantity-${index}`] && (
                                    <p id={`quantity-error-${index}`} className="text-red-600 text-xs mt-1" role="alert">
                                        {errors[`quantity-${index}`]}
                                    </p>
                                )}
                            </div>
                            {selectedMeds.length > 1 && (
                                <button
                                    onClick={() => removeMedication(index)}
                                    className="p-2 text-slate-500 hover:text-red-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                                    aria-label={t('savings.calculator.removeAria', { name: med.name || t('savings.calculator.removeFallbackName') })}
                                >
                                    <Trash2 size={18} aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add Medication Button */}
                <button
                    onClick={addMedication}
                    className="mt-4 w-full py-3 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors min-h-[44px] border-slate-300 text-slate-600 hover:border-emerald-400 hover:text-emerald-600"
                >
                    <Plus size={18} aria-hidden="true" />
                    {t('savings.calculator.addButton')}
                </button>

                {/* Calculate Button */}
                <button
                    onClick={calculateSavings}
                    disabled={!selectedMeds.some(m => m.id || m.name)}
                    className="mt-6 w-full bg-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg min-h-[44px]"
                >
                    <Calculator size={22} aria-hidden="true" />
                    {t('savings.calculator.calculateButton')}
                </button>
            </div>

            {/* Results */}
            <div aria-live="polite" aria-atomic="true">
            {showResults && calculations && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Main Savings Display */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white text-center">
                        <p className="text-emerald-100 text-sm uppercase tracking-wide mb-2">
                            {t('savings.calculator.annualSavingsLabel')}
                        </p>
                        <div className="text-5xl font-bold mb-2">
                            {range(calculations.totalAnnualLow, calculations.totalAnnualHigh)}
                        </div>
                        <p className="text-emerald-100">
                            {t('savings.calculator.annualSavingsNote')}
                        </p>

                        {/* Monthly Comparison */}
                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
                            <div>
                                <p className="text-emerald-100 text-xs uppercase mb-1">{t('savings.calculator.monthlyRetailLabel')}</p>
                                <p className="text-2xl font-bold">
                                    {range(calculations.totalMonthlyRetailLow, calculations.totalMonthlyRetailHigh)}
                                </p>
                            </div>
                            <div>
                                <p className="text-emerald-100 text-xs uppercase mb-1">{t('savings.calculator.monthlyNewLabel')}</p>
                                <p className="text-2xl font-bold">
                                    {range(calculations.totalMonthlyAssistedLow, calculations.totalMonthlyAssistedHigh)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Estimate caveat */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                        <p>
                            <strong>{t('savings.calculator.caveatBold')}</strong> {t('savings.calculator.caveatText')}
                            {calculations.anyRough && ` ${t('savings.calculator.caveatRough')}`}
                            {' '}{t('savings.calculator.caveatSearch')}
                        </p>
                        {priceEstimates.lastUpdated && (
                            <p className="text-amber-700 text-xs mt-1">{t('savings.calculator.priceDataUpdated', { date: priceEstimates.lastUpdated })}</p>
                        )}
                    </div>

                    {/* Savings Breakdown */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('savings.calculator.breakdownTitle')}</h3>
                        <div className="space-y-3">
                            {calculations.medications.map((med, index) => (
                                <div key={index} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                    <div>
                                        <p className="font-medium text-slate-900">{med.name}</p>
                                        <p className="text-sm text-slate-500">
                                            {range(med.retailLow, med.retailHigh)}{t('savings.calculator.perMonth')} → {range(med.assistedLow, med.assistedHigh)}{t('savings.calculator.perMonth')}
                                            {!med.hasOverride && <span className="ml-1 text-amber-600">{t('savings.calculator.roughEstimate')}</span>}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600 text-lg">
                                            -{range(med.annualSavingsLow, med.annualSavingsHigh)}{t('savings.calculator.perYear')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA to Find Programs */}
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
                        <h3 className="text-lg font-bold text-purple-900 mb-2">{t('savings.calculator.unlockTitle')}</h3>
                        <p className="text-purple-700 mb-4">
                            {t('savings.calculator.unlockText')}
                        </p>
                        <Link
                            to="/medications"
                            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors min-h-[44px]"
                        >
                            {t('savings.calculator.unlockButton')}
                            <ArrowRight size={18} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            )}
            </div>

            {/* Trust Indicators */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full mb-3">
                        <Shield className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-1">{t('savings.calculator.trustVerifiedTitle')}</h4>
                    <p className="text-sm text-slate-600">
                        {t('savings.calculator.trustVerifiedText')}
                    </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-3">
                        <Database className="w-5 h-5 text-blue-600" aria-hidden="true" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-1">{t('savings.calculator.trustDataTitle')}</h4>
                    <p className="text-sm text-slate-600">
                        {t('savings.calculator.trustDataText')}
                    </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-rose-100 rounded-full mb-3">
                        <Heart className="w-5 h-5 text-rose-600" aria-hidden="true" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-1">{t('savings.calculator.trustPatientTitle')}</h4>
                    <p className="text-sm text-slate-600">
                        {t('savings.calculator.trustPatientText')}
                    </p>
                </div>
            </div>
        </div>
    );
}
