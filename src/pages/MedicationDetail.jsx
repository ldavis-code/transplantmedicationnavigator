/**
 * MedicationDetail — per-medication SEO landing page.
 *
 * Targets the searches real patients make ("how to afford tacrolimus",
 * "Prograf copay card", "mycophenolate patient assistance"). One page per
 * medication at /medications/:slug (slug = medication id). Renders unique,
 * useful content plus Drug + FAQ structured data. The page is listed in the
 * sitemap and prerendered (scripts/generate-sitemap.js, scripts/prerender-seo.js)
 * so crawlers see per-medication titles, descriptions, and content.
 */

import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Pill, CreditCard, HeartHandshake, Tag, DollarSign, ArrowRight, Search, ShieldCheck, AlertTriangle } from 'lucide-react';
import MEDICATIONS_DATA from '../data/medications.json';
import PROGRAMS_DATA from '../data/programs.json';
import PRICE_ESTIMATES from '../data/price-estimates.json';
import PROGRAMS_ES from '../data/programs.es.json';
import COST_PLUS_EXCLUSIONS from '../data/cost-plus-exclusions.json';
import { useMetaTags } from '../hooks/useMetaTags';
import { localizeMedName } from '../utils/medNames.js';
import { isGenericRecord, medPageName, medNameWithGeneric, brandNamesForGeneric, stripGenericTag } from '../utils/medIdentity.js';
import { buildMedFacts, priceFor } from '../utils/medFacts.js';

const BASE_URL = 'https://transplantmedicationnavigator.com';

// "a" vs "an" for the leading category word (an immunosuppressant, an antiviral).
const aOrAn = (word) => (/^[aeiou]/i.test((word || '').trim()) ? 'an' : 'a');

// Resolve a program (copay/pap/foundation) by id across all groups.
function findProgram(id) {
    if (!id) return null;
    const groups = [PROGRAMS_DATA.copayPrograms, PROGRAMS_DATA.papPrograms, PROGRAMS_DATA.foundationPrograms];
    for (const g of groups) {
        if (g && g[id]) return g[id];
    }
    return null;
}

// Cash price range for THIS record (src/utils/medFacts.js priceFor — the
// same figure the prerendered facts block shows), formatted for display.
const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
function formatRange({ min, max }, t) {
    return Math.round(min) === Math.round(max)
        ? t('medications.detail.priceRangeSingle', { price: money(min) })
        : t('medications.detail.priceRangeBetween', { min: money(min), max: money(max) });
}

function useStructuredData(schemas) {
    useEffect(() => {
        // The prerendered page ships the same object in its head (same
        // builder); drop that copy so there is only ever one.
        document.querySelectorAll('script[data-med-detail]').forEach((s) => s.remove());
        const el = document.createElement('script');
        el.type = 'application/ld+json';
        el.setAttribute('data-med-detail', 'true');
        if (!schemas) return undefined;
        el.textContent = JSON.stringify(schemas);
        document.head.appendChild(el);
        return () => { el.remove(); };
    }, [schemas]);
}

const MedicationDetail = () => {
    const { t, i18n } = useTranslation();
    const isSpanish = (i18n.resolvedLanguage || i18n.language || '').startsWith('es');
    const { slug } = useParams();
    const med = MEDICATIONS_DATA.find((m) => m.id === slug);

    // A few records ARE the generic ("Tacrolimus (generic)", "Prednisone")
    // rather than a brand that has one. medIdentity keeps the difference in
    // one place: the page name loses the "(generic)" label, the intro drops
    // the parenthetical that would repeat it, and the generic questions below
    // ask whether this IS the generic instead of whether one exists.
    const isGeneric = isGenericRecord(med);
    const pageNameEn = medPageName(med);
    const nameWithGeneric = medNameWithGeneric(med);
    // Brands this generic stands in for ("Prograf"); empty for a generic we
    // list no brand for, which the copy below has a variant for.
    const genericBrands = brandNamesForGeneric(med, MEDICATIONS_DATA);

    // Not found — keep it out of the index and point back to search.
    // Built with t() so document.title (read aloud by the RouteAnnouncer)
    // follows the active language.
    useMetaTags(med ? {
        // localizeMedName so the hydrated title matches the prerendered
        // Spanish head ("(genérico)", not "(generic)"); no-op in English.
        title: t('medications.detail.meta.title', { name: localizeMedName(nameWithGeneric) }),
        description: t('medications.detail.meta.description', { name: localizeMedName(nameWithGeneric) }),
        canonical: `${BASE_URL}/medications/${med.id}`,
        breadcrumbName: pageNameEn,
        // Fully translated via t(): declare the /es/ variant so the
        // canonical and hreflang alternates track the active language.
        langAlternates: true,
    } : {
        title: t('medications.detail.meta.notFoundTitle'),
        description: t('medications.detail.meta.notFoundDescription'),
        canonical: `${BASE_URL}/medications`,
        noindex: true,
    });

    // Display name for this page's subject: the brand for a brand record, the
    // drug name for a generic one (localizeMedName only touches qualifiers).
    const nameDisplay = localizeMedName(pageNameEn);
    const brandsDisplay = genericBrands.map(localizeMedName).join(', ');

    const hasCopay = !!(med && (med.copayUrl || med.copayProgramId));
    const hasPap = !!(med && (med.papUrl || med.papProgramId));
    const copayLink = med && (med.copayUrl || findProgram(med.copayProgramId)?.url);
    const papLink = med && (med.papUrl || findProgram(med.papProgramId)?.url);
    const priceEst = med && priceFor(med, PRICE_ESTIMATES, COST_PLUS_EXCLUSIONS);
    const price = priceEst ? formatRange(priceEst, t) : null;
    const genericDiffers = nameWithGeneric !== pageNameEn;

    // FAQ and structured data come from the shared facts builder — the same
    // one the prerendered page uses — so the FAQ a patient reads, the
    // FAQPage JSON-LD, and the static page say the same thing, and the
    // answers follow the per-program eligibility rule
    // (src/utils/programEligibility.js) instead of routing by insurance type.
    const facts = useMemo(() => (med ? buildMedFacts(med, {
        lang: isSpanish ? 'es' : 'en',
        allMeds: MEDICATIONS_DATA,
        programs: PROGRAMS_DATA,
        programsEs: PROGRAMS_ES,
        priceEstimates: PRICE_ESTIMATES,
        costPlusExclusions: COST_PLUS_EXCLUSIONS,
        localizeName: localizeMedName,
        categoryLabel: (c) => t(`medications.categories.${c}`, { defaultValue: c }),
        priceRange: (r) => formatRange(r, t),
    }) : null), [med, isSpanish, t]);
    const faqs = facts ? facts.faqs : [];
    const papFor = facts ? (facts.sections.find((sec) => sec.pap)?.pap || null) : null;
    const structured = useMemo(() => (facts ? facts.jsonLd : null), [facts]);

    useStructuredData(structured);

    if (!med) {
        return (
            <article className="max-w-2xl mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-3">{t('medications.detail.notFound.title')}</h1>
                <p className="text-slate-600 mb-6">{t('medications.detail.notFound.text')}</p>
                <Link to="/medications" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">
                    <Search size={18} aria-hidden="true" /> {t('medications.detail.notFound.button')}
                </Link>
            </article>
        );
    }

    const related = MEDICATIONS_DATA
        .filter((m) => m.id !== med.id && m.category === med.category)
        .slice(0, 6);

    return (
        <article className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-slate-500" aria-label={t('medications.detail.breadcrumbAria')}>
                <Link to="/" className="hover:underline">{t('medications.detail.home')}</Link>
                <span className="mx-1.5" aria-hidden="true">/</span>
                <Link to="/medications" className="hover:underline">{t('medications.detail.medications')}</Link>
                <span className="mx-1.5" aria-hidden="true">/</span>
                <span className="text-slate-700">{nameDisplay}</span>
            </nav>

            {/* Header */}
            <header>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700 mb-2">
                    <Pill size={14} aria-hidden="true" /> {t(`medications.categories.${med.category}`, { defaultValue: med.category })}
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                    {t('medications.detail.heading', { name: nameDisplay })}
                </h1>
                <p className="text-lg text-slate-600 mt-3">
                    {nameDisplay}{genericDiffers ? ` (${localizeMedName(med.genericName)})` : ''}{t('medications.detail.introIs')}{isSpanish ? '' : aOrAn(med.category) + ' '}{med.category && t(`medications.categories.${med.category}`, { defaultValue: med.category }).toLowerCase()}{t('medications.detail.introUsedBy')}{med.commonOrgans?.length ? ` (${med.commonOrgans.map((o) => t(`wizard.organs.${o}`, { defaultValue: o })).join(', ')})` : ''}{t('medications.detail.introTail')}
                </p>
                {price && (
                    <p className="text-sm text-slate-500 mt-2">{t('medications.detail.estPricePre')}<strong className="text-slate-700">{price}</strong>{t('medications.detail.estPricePost')}</p>
                )}
            </header>

            {/* Ways to save */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">{t('medications.detail.waysTitle', { name: nameDisplay })}</h2>

                {hasCopay && (
                    <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-5">
                        <h3 className="flex items-center gap-2 font-bold text-emerald-900 mb-1"><CreditCard size={18} aria-hidden="true" /> {t('medications.detail.copayTitle')}</h3>
                        <p className="text-slate-700 text-sm">{t('medications.detail.copayText')}</p>
                        {copayLink && <a href={copayLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-sm mt-2 hover:underline">{t('medications.detail.copayLink')}<ArrowRight size={14} aria-hidden="true" /></a>}
                    </div>
                )}

                <div className="border border-amber-200 bg-amber-50 rounded-xl p-5">
                    <h3 className="flex items-center gap-2 font-bold text-amber-900 mb-1"><HeartHandshake size={18} aria-hidden="true" /> {t('medications.detail.papTitle')}</h3>
                    <p className="text-slate-700 text-sm">
                        {/* Who the PAP serves comes from the program's own
                            eligibility flags (same facts as the static page),
                            never from insurance type alone. Generic wording
                            only when the program carries no flags. */}
                        {papFor
                            ? [papFor.forLine, papFor.check ? facts.checkLabel : null].filter(Boolean).join(' ')
                            : <>{t('medications.detail.papText', { name: nameDisplay })}{hasPap ? '' : t('medications.detail.papAsk')}</>}
                    </p>
                    {hasPap && papLink && <a href={papLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-amber-800 font-semibold text-sm mt-2 hover:underline">{t('medications.detail.papLink')}<ArrowRight size={14} aria-hidden="true" /></a>}
                </div>

                <div className="border border-sky-200 bg-sky-50 rounded-xl p-5">
                    <h3 className="flex items-center gap-2 font-bold text-sky-900 mb-1"><HeartHandshake size={18} aria-hidden="true" /> {t('medications.detail.grantsTitle')}</h3>
                    <p className="text-slate-700 text-sm">{t('medications.detail.grantsText')}</p>
                    <Link to="/application-help" className="inline-flex items-center gap-1 text-sky-700 font-semibold text-sm mt-2 hover:underline">{t('medications.detail.grantsLink')}<ArrowRight size={14} aria-hidden="true" /></Link>
                </div>

                {/* On a generic's own page this card used to offer the
                    patient the drug they are already taking. Same slot, but
                    it now confirms what they have instead. */}
                {(isGeneric || med.generic_available) && (
                    <div className="border border-slate-200 bg-white rounded-xl p-5">
                        <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-1"><Tag size={18} aria-hidden="true" /> {isGeneric ? t('medications.detail.isGenericTitle') : t('medications.detail.genericTitle')}</h3>
                        <p className="text-slate-700 text-sm">
                            {isGeneric
                                ? (brandsDisplay
                                    ? t('medications.detail.isGenericText', { generic: nameDisplay, brand: brandsDisplay })
                                    : t('medications.detail.isGenericNoBrandText', { generic: nameDisplay }))
                                : t('medications.detail.genericText', { generic: localizeMedName(med.genericName) })}
                        </p>
                        <Link to="/education?topic=GENERICS" className="inline-flex items-center gap-1 text-slate-700 font-semibold text-sm mt-2 hover:underline"><ShieldCheck size={14} aria-hidden="true" /> {t('medications.detail.genericLink')}</Link>
                    </div>
                )}

                <div className="border border-slate-200 bg-white rounded-xl p-5">
                    <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-1"><DollarSign size={18} aria-hidden="true" /> {t('medications.detail.discountTitle')}</h3>
                    <p className="text-slate-700 text-sm">{t('medications.detail.discountText')}</p>
                    <Link to="/medications" className="inline-flex items-center gap-1 text-slate-700 font-semibold text-sm mt-2 hover:underline">{t('medications.detail.discountLink', { name: nameDisplay })}<ArrowRight size={14} aria-hidden="true" /></Link>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-6 md:p-8 text-center">
                <h2 className="text-2xl font-extrabold mb-2">{t('medications.detail.ctaTitle', { name: nameDisplay })}</h2>
                <p className="text-emerald-50 mb-5">{t('medications.detail.ctaText')}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/wizard" className="px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 inline-flex items-center justify-center gap-2">{t('medications.detail.ctaQuiz')}<ArrowRight size={18} aria-hidden="true" /></Link>
                    <Link to="/medications" className="px-6 py-3 bg-emerald-800/40 border border-white/40 text-white font-bold rounded-xl hover:bg-emerald-800/60 inline-flex items-center justify-center gap-2"><Search size={18} aria-hidden="true" /> {t('medications.detail.ctaSearch')}</Link>
                </div>
            </section>

            {/* FAQ */}
            {faqs.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">{t('medications.detail.faqTitle', { name: nameDisplay })}</h2>
                    <div className="space-y-3">
                        {faqs.map((f) => (
                            <div key={f.q} className="border border-slate-200 rounded-xl p-5">
                                <h3 className="font-bold text-slate-900 mb-1">{f.q}</h3>
                                <p className="text-slate-700 text-sm leading-relaxed">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Related medications (internal linking) */}
            {related.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-3">{t('medications.detail.relatedPre')}{med.category && t(`medications.categories.${med.category}`, { defaultValue: med.category }).toLowerCase()}{t('medications.detail.relatedPost')}</h2>
                    <div className="flex flex-wrap gap-2">
                        {related.map((m) => (
                            // A generic record's name carries a "(generic)"
                            // label; shown as a separate translated tag so
                            // the chip never mixes an English drug name with
                            // a Spanish qualifier ("... (genérico)").
                            <Link key={m.id} to={`/medications/${m.id}`} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-full">
                                {isGenericRecord(m) ? stripGenericTag(m.brandName) : localizeMedName(m.brandName)}
                                {isGenericRecord(m) && (
                                    <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">{t('medications.detail.genericTag')}</span>
                                )}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <p className="flex items-start gap-2 text-xs text-slate-500 border-t border-slate-100 pt-5">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
                {t('medications.detail.disclaimer')}
            </p>
        </article>
    );
};

export default MedicationDetail;
