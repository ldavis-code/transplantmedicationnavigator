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

import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Pill, CreditCard, HeartHandshake, Tag, DollarSign, ArrowRight, Search, ShieldCheck, AlertTriangle } from 'lucide-react';
import MEDICATIONS_DATA from '../data/medications.json';
import PROGRAMS_DATA from '../data/programs.json';
import PRICE_ESTIMATES from '../data/price-estimates.json';
import { useMetaTags } from '../hooks/useMetaTags';

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

// Best-available cash price range for a medication, if we have an estimate.
function priceRange(med, t) {
    const o = PRICE_ESTIMATES.medicationOverrides?.[med.id];
    if (!o) return null;
    const src = o.costplus || o.goodrx || o.walmart;
    if (!src || src.min == null || src.max == null) return null;
    const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
    return Math.round(src.min) === Math.round(src.max)
        ? t('medications.detail.priceRangeSingle', { price: money(src.min) })
        : t('medications.detail.priceRangeBetween', { min: money(src.min), max: money(src.max) });
}

function useStructuredData(schemas) {
    useEffect(() => {
        const el = document.createElement('script');
        el.type = 'application/ld+json';
        el.setAttribute('data-med-detail', 'true');
        el.textContent = JSON.stringify(schemas);
        document.head.appendChild(el);
        return () => { el.remove(); };
    }, [schemas]);
}

const MedicationDetail = () => {
    const { t } = useTranslation();
    const { slug } = useParams();
    const med = MEDICATIONS_DATA.find((m) => m.id === slug);

    // "Brand (Generic)" — but skip the parenthetical when the generic name is
    // already part of the brand name (e.g. brand "Tacrolimus (generic)").
    const nameWithGeneric = med
        ? (med.genericName && !med.brandName.toLowerCase().includes(med.genericName.toLowerCase())
            ? `${med.brandName} (${med.genericName})`
            : med.brandName)
        : '';

    // Not found — keep it out of the index and point back to search.
    useMetaTags(med ? {
        title: `How to Afford ${nameWithGeneric}: Copay Cards & Assistance | Transplant Medication Navigator™`,
        description: `Find copay cards, patient assistance programs, and foundation grants for ${nameWithGeneric}. See ways to lower the cost of your transplant medication.`,
        canonical: `${BASE_URL}/medications/${med.id}`,
        breadcrumbName: med.brandName,
    } : {
        title: 'Medication Not Found | Transplant Medication Navigator™',
        description: 'This medication page could not be found. Search our full list of transplant medications and assistance programs.',
        canonical: `${BASE_URL}/medications`,
        noindex: true,
    });

    const hasCopay = !!(med && (med.copayUrl || med.copayProgramId));
    const hasPap = !!(med && (med.papUrl || med.papProgramId));
    const copayLink = med && (med.copayUrl || findProgram(med.copayProgramId)?.url);
    const papLink = med && (med.papUrl || findProgram(med.papProgramId)?.url);
    const price = med && priceRange(med, t);
    const genericDiffers = med && med.genericName && med.brandName &&
        med.genericName.toLowerCase() !== med.brandName.toLowerCase();

    // FAQ content — also emitted as structured data below.
    const faqs = med ? [
        hasCopay && {
            q: t('medications.detail.faq.copayQ', { name: med.brandName }),
            a: t('medications.detail.faq.copayA', { name: med.brandName }),
        },
        {
            q: t('medications.detail.faq.freeQ', { name: med.brandName }),
            a: t('medications.detail.faq.freeA', { name: med.brandName }),
        },
        med.generic_available && {
            q: t('medications.detail.faq.genericQ', { name: med.brandName }),
            a: t('medications.detail.faq.genericA', { generic: med.genericName }),
        },
        price && {
            q: t('medications.detail.faq.costQ', { name: med.brandName }),
            a: t('medications.detail.faq.costA', { price }),
        },
    ].filter(Boolean) : [];

    const structured = med ? [
        {
            '@context': 'https://schema.org',
            '@type': 'Drug',
            name: med.brandName,
            alternateName: med.genericName,
            description: `${med.brandName} (${med.genericName}) is ${aOrAn(med.category)} ${med.category?.toLowerCase() || 'medication'} used by transplant patients. Learn how to lower the cost with copay cards, patient assistance programs, and foundation grants.`,
            drugClass: med.category,
            url: `${BASE_URL}/medications/${med.id}`,
        },
        faqs.length ? {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
        } : null,
    ].filter(Boolean) : [];

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
                <span className="text-slate-700">{med.brandName}</span>
            </nav>

            {/* Header */}
            <header>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700 mb-2">
                    <Pill size={14} aria-hidden="true" /> {t(`medications.categories.${med.category}`, { defaultValue: med.category })}
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                    {t('medications.detail.heading', { name: med.brandName })}
                </h1>
                <p className="text-lg text-slate-600 mt-3">
                    {med.brandName}{genericDiffers ? ` (${med.genericName})` : ''}{t('medications.detail.introIs')}{aOrAn(med.category)} {med.category && t(`medications.categories.${med.category}`, { defaultValue: med.category }).toLowerCase()}{t('medications.detail.introUsedBy')}{med.commonOrgans?.length ? ` (${med.commonOrgans.join(', ')})` : ''}{t('medications.detail.introTail')}
                </p>
                {price && (
                    <p className="text-sm text-slate-500 mt-2">{t('medications.detail.estPricePre')}<strong className="text-slate-700">{price}</strong>{t('medications.detail.estPricePost')}</p>
                )}
            </header>

            {/* Ways to save */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">{t('medications.detail.waysTitle', { name: med.brandName })}</h2>

                {hasCopay && (
                    <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-5">
                        <h3 className="flex items-center gap-2 font-bold text-emerald-900 mb-1"><CreditCard size={18} aria-hidden="true" /> {t('medications.detail.copayTitle')}</h3>
                        <p className="text-slate-700 text-sm">{t('medications.detail.copayText')}</p>
                        {copayLink && <a href={copayLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-sm mt-2 hover:underline">{t('medications.detail.copayLink')}<ArrowRight size={14} aria-hidden="true" /></a>}
                    </div>
                )}

                <div className="border border-amber-200 bg-amber-50 rounded-xl p-5">
                    <h3 className="flex items-center gap-2 font-bold text-amber-900 mb-1"><HeartHandshake size={18} aria-hidden="true" /> {t('medications.detail.papTitle')}</h3>
                    <p className="text-slate-700 text-sm">{t('medications.detail.papText', { name: med.brandName })}{hasPap ? '' : t('medications.detail.papAsk')}</p>
                    {hasPap && papLink && <a href={papLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-amber-800 font-semibold text-sm mt-2 hover:underline">{t('medications.detail.papLink')}<ArrowRight size={14} aria-hidden="true" /></a>}
                </div>

                <div className="border border-sky-200 bg-sky-50 rounded-xl p-5">
                    <h3 className="flex items-center gap-2 font-bold text-sky-900 mb-1"><HeartHandshake size={18} aria-hidden="true" /> {t('medications.detail.grantsTitle')}</h3>
                    <p className="text-slate-700 text-sm">{t('medications.detail.grantsText')}</p>
                    <Link to="/application-help" className="inline-flex items-center gap-1 text-sky-700 font-semibold text-sm mt-2 hover:underline">{t('medications.detail.grantsLink')}<ArrowRight size={14} aria-hidden="true" /></Link>
                </div>

                {med.generic_available && (
                    <div className="border border-slate-200 bg-white rounded-xl p-5">
                        <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-1"><Tag size={18} aria-hidden="true" /> {t('medications.detail.genericTitle')}</h3>
                        <p className="text-slate-700 text-sm">{t('medications.detail.genericText', { generic: med.genericName })}</p>
                        <Link to="/education?topic=GENERICS" className="inline-flex items-center gap-1 text-slate-700 font-semibold text-sm mt-2 hover:underline"><ShieldCheck size={14} aria-hidden="true" /> {t('medications.detail.genericLink')}</Link>
                    </div>
                )}

                <div className="border border-slate-200 bg-white rounded-xl p-5">
                    <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-1"><DollarSign size={18} aria-hidden="true" /> {t('medications.detail.discountTitle')}</h3>
                    <p className="text-slate-700 text-sm">{t('medications.detail.discountText')}</p>
                    <Link to="/medications" className="inline-flex items-center gap-1 text-slate-700 font-semibold text-sm mt-2 hover:underline">{t('medications.detail.discountLink', { name: med.brandName })}<ArrowRight size={14} aria-hidden="true" /></Link>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-6 md:p-8 text-center">
                <h2 className="text-2xl font-extrabold mb-2">{t('medications.detail.ctaTitle', { name: med.brandName })}</h2>
                <p className="text-emerald-50 mb-5">{t('medications.detail.ctaText')}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/wizard" className="px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 inline-flex items-center justify-center gap-2">{t('medications.detail.ctaQuiz')}<ArrowRight size={18} aria-hidden="true" /></Link>
                    <Link to="/medications" className="px-6 py-3 bg-emerald-800/40 border border-white/40 text-white font-bold rounded-xl hover:bg-emerald-800/60 inline-flex items-center justify-center gap-2"><Search size={18} aria-hidden="true" /> {t('medications.detail.ctaSearch')}</Link>
                </div>
            </section>

            {/* FAQ */}
            {faqs.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">{t('medications.detail.faqTitle', { name: med.brandName })}</h2>
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
                            <Link key={m.id} to={`/medications/${m.id}`} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-full">
                                {m.brandName}
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
