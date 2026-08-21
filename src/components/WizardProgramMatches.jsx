import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Gift, CreditCard, Pill, ArrowRight, AlertCircle } from 'lucide-react';
import PROGRAMS from '../data/programs.json';
import PROGRAMS_ES from '../data/programs.es.json';
import { InsuranceType } from '../data/constants.js';
import { medDisplayName } from '../utils/medDisplay.js';

/**
 * WizardProgramMatches - the payoff panel on the wizard results screen.
 *
 * The quiz already knows the patient's exact medications and insurance type,
 * and programs.json already links each brand med to its manufacturer PAP and
 * copay card with per-insurance eligibility flags. This panel surfaces those
 * matches inline — "Prograf → Astellas Patient Assistance, you likely
 * qualify, Apply" — instead of sending the patient off to search.
 */

// Wizard insurance answers → programs.json eligibility keys.
const ELIGIBILITY_KEY = {
    [InsuranceType.COMMERCIAL]: 'commercial',
    [InsuranceType.MARKETPLACE]: 'commercial',
    [InsuranceType.MEDICARE]: 'medicare',
    [InsuranceType.MEDICAID]: 'medicaid',
    [InsuranceType.UNINSURED]: 'uninsured',
};

const isGenericMed = (med) =>
    /\(generic\)/i.test(med?.brandName || '') || (med?.manufacturer || '').toLowerCase() === 'generic';

// Foundations that only serve specific organs — hidden unless the patient
// selected a matching organ (the rest of the program data has no organ field).
const FOUNDATION_ORGANS = {
    'american-kidney-fund': ['Kidney'],
};

const WizardProgramMatches = ({ medIds, insurance, medications, organs }) => {
    const { t, i18n } = useTranslation();
    const eligKey = ELIGIBILITY_KEY[insurance] || null;
    const isMedicare = insurance === InsuranceType.MEDICARE;
    const isCommercial = eligKey === 'commercial';
    const isUninsured = insurance === InsuranceType.UNINSURED;

    // Spanish eligibility notes and name overrides come from the
    // programs.es.json overlay, keyed by programId — same convention as
    // MedicationCardKit.
    const isEs = i18n.resolvedLanguage === 'es';
    const esNotes = (group, programId) =>
        (isEs && programId && PROGRAMS_ES[group]?.[programId]?.notes) || null;
    const esName = (group, programId) =>
        (isEs && programId && PROGRAMS_ES[group]?.[programId]?.name) || null;
    // Income limits in the data read like "400% FPL" — in Spanish, expand the
    // acronym the way the rest of the Spanish site does.
    const localizeIncome = (income) =>
        isEs && income ? income.replace(/%\s*FPL\b/, '% del nivel federal de pobreza (FPL)') : income;

    const meds = (medIds || [])
        .map((id) => (medications || []).find((m) => m.id === id))
        .filter(Boolean);
    if (meds.length === 0) return null;

    const insuranceLabel = eligKey ? t(`wizard.results.programs.insuranceLabels.${eligKey}`) : null;

    // Foundations that accept this insurance type (shown for Medicare, where
    // copay cards are legally off the table, and as a backup for others).
    const foundations = Object.entries(PROGRAMS.foundationPrograms || {})
        .filter(([, p]) => !eligKey || p.eligibility?.[eligKey] !== false)
        .filter(([id]) => {
            const only = FOUNDATION_ORGANS[id];
            return !only || only.some((o) => (organs || []).includes(o));
        })
        .slice(0, 4);

    const rowsForMed = (med) => {
        const rows = [];
        const pap = med.papProgramId ? PROGRAMS.papPrograms?.[med.papProgramId] : null;
        const copay = med.copayProgramId ? PROGRAMS.copayPrograms?.[med.copayProgramId] : null;

        if (isGenericMed(med)) {
            return [{ kind: 'generic' }];
        }

        // Copay card first for commercial insurance — it's the fastest win.
        if (isCommercial && (copay || med.copayUrl)) {
            rows.push({
                kind: 'copay',
                name: esName('copayPrograms', med.copayProgramId) || copay?.name || t('wizard.results.programs.copayFallbackName', { manufacturer: med.manufacturer }),
                url: copay?.url || med.copayUrl,
                programId: med.copayProgramId,
                benefit: copay?.maxBenefit || null,
                eligible: copay ? copay.eligibility?.commercial !== false : true,
            });
        }

        // Manufacturer PAP — skip only when the program explicitly excludes
        // this insurance type.
        if ((pap || med.papUrl) && !(pap && eligKey && pap.eligibility?.[eligKey] === false)) {
            rows.push({
                kind: 'pap',
                name: esName('papPrograms', med.papProgramId) || pap?.name || t('wizard.results.programs.papFallbackName', { manufacturer: med.manufacturer }),
                url: pap?.url || med.papUrl,
                programId: med.papProgramId,
                incomeLimit: pap?.incomeLimit || null,
                eligible: pap ? (eligKey ? pap.eligibility?.[eligKey] === true : null) : null,
            });
        }

        if (rows.length === 0) rows.push({ kind: 'none' });
        return rows;
    };

    return (
        <section
            className="bg-white rounded-xl shadow-sm border-2 border-emerald-200 overflow-hidden"
            aria-labelledby="program-matches-heading"
        >
            <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-200">
                <h2 id="program-matches-heading" className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                    <Gift size={20} aria-hidden="true" /> {t('wizard.results.programs.title')}
                </h2>
                <p className="text-sm text-emerald-800 mt-1">{t('wizard.results.programs.subtitle')}</p>
            </div>

            <div className="p-6 space-y-4">
                {meds.map((med) => (
                    <div key={med.id} className="border border-slate-200 rounded-lg p-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
                            <Pill size={16} className="text-emerald-600" aria-hidden="true" />
                            {medDisplayName(med)}
                        </h3>
                        <ul className="space-y-3">
                            {rowsForMed(med).map((row, i) => {
                                if (row.kind === 'generic') {
                                    return (
                                        <li key={i} className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                                            <span className="inline-block bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded mr-2">{t('wizard.results.programs.genericBadge')}</span>
                                            {t('wizard.results.programs.genericNote')}
                                        </li>
                                    );
                                }
                                if (row.kind === 'none') {
                                    return (
                                        <li key={i} className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                                            {t('wizard.results.programs.noProgramNote')}
                                        </li>
                                    );
                                }
                                const isPap = row.kind === 'pap';
                                const eligibilityLine = isPap
                                    ? (row.eligible === true && insuranceLabel
                                        ? (row.incomeLimit
                                            ? t('wizard.results.programs.likelyQualify', { insurance: insuranceLabel, income: localizeIncome(row.incomeLimit) })
                                            : t('wizard.results.programs.likelyQualifyNoIncome', { insurance: insuranceLabel }))
                                        : (esNotes('papPrograms', row.programId) || t('wizard.results.programs.checkEligibility')))
                                    : (row.benefit || esNotes('copayPrograms', row.programId) || t('wizard.results.programs.copayGenericBenefit'));
                                return (
                                    <li key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-slate-50 rounded-lg p-3">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2">
                                                {isPap
                                                    ? <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded"><Gift size={12} aria-hidden="true" />{t('wizard.results.programs.papBadge')}</span>
                                                    : <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded"><CreditCard size={12} aria-hidden="true" />{t('wizard.results.programs.copayBadge')}</span>}
                                                <span className="font-semibold text-slate-900">{row.name}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-1">{eligibilityLine}</p>
                                        </div>
                                        {row.url && (
                                            <a
                                                href={row.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition min-h-[44px] no-print"
                                                aria-label={t('wizard.results.programs.applyAria', { program: row.name, med: medDisplayName(med) })}
                                            >
                                                {t('wizard.results.programs.applyButton')} <ExternalLink size={14} aria-hidden="true" />
                                            </a>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}

                {isMedicare && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-4">
                        <p className="text-amber-900 text-sm font-semibold flex items-start gap-2">
                            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
                            {t('wizard.results.programs.medicareCallout')}
                        </p>
                        <ul className="mt-3 space-y-2">
                            {foundations.map(([id, p]) => (
                                <li key={id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-white rounded-lg p-3 border border-amber-100">
                                    <div className="flex-grow">
                                        <span className="font-semibold text-slate-900">{esName('foundationPrograms', id) || p.name}</span>
                                        <p className="text-sm text-slate-600 mt-0.5">
                                            {p.incomeLimit && /\d/.test(p.incomeLimit)
                                                ? t('wizard.results.programs.foundationIncome', { income: localizeIncome(p.incomeLimit) })
                                                : t('wizard.results.programs.foundationIncomeGeneric')}
                                        </p>
                                    </div>
                                    <a
                                        href={p.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-sm px-4 py-2 rounded-lg transition min-h-[44px] no-print"
                                        aria-label={t('wizard.results.programs.foundationAria', { program: p.name })}
                                    >
                                        {t('wizard.results.programs.applyButton')} <ExternalLink size={14} aria-hidden="true" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {isUninsured && (
                    <p className="text-sm text-emerald-900 bg-emerald-50 rounded-lg p-3">
                        {t('wizard.results.programs.uninsuredCallout')}
                    </p>
                )}

                <Link
                    to={`/medications?ids=${(medIds || []).join(',')}`}
                    className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold hover:underline text-sm no-print"
                >
                    {t('wizard.results.programs.detailsLink')} <ArrowRight size={14} aria-hidden="true" />
                </Link>
            </div>
        </section>
    );
};

export default WizardProgramMatches;
