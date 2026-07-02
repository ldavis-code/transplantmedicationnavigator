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
function priceRange(med) {
    const o = PRICE_ESTIMATES.medicationOverrides?.[med.id];
    if (!o) return null;
    const src = o.costplus || o.goodrx || o.walmart;
    if (!src || src.min == null || src.max == null) return null;
    const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
    return Math.round(src.min) === Math.round(src.max)
        ? `${money(src.min)}/month`
        : `${money(src.min)} to ${money(src.max)}/month`;
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
    const price = med && priceRange(med);
    const genericDiffers = med && med.genericName && med.brandName &&
        med.genericName.toLowerCase() !== med.brandName.toLowerCase();

    // FAQ content — also emitted as structured data below.
    const faqs = med ? [
        hasCopay && {
            q: `Is there a copay card for ${med.brandName}?`,
            a: `Yes. If you have commercial or employer insurance, the manufacturer copay card for ${med.brandName} can lower your monthly cost, often to as little as $0–$10. Copay cards cannot be used with Medicare, Medicaid, or other government insurance.`,
        },
        {
            q: `How can I get ${med.brandName} for free?`,
            a: `If you are uninsured, underinsured, or on Medicare/Medicaid and meet income limits, a Patient Assistance Program (PAP) may provide ${med.brandName} at no cost. Foundation grants can also cover your share of the cost. Take the free 2-minute quiz to see which programs you qualify for.`,
        },
        med.generic_available && {
            q: `Is there a generic for ${med.brandName}?`,
            a: `Yes, a generic version of ${med.genericName} is available and usually costs much less. For transplant anti-rejection drugs, stay on the same manufacturer and talk to your transplant team before switching, because small changes can affect your drug levels.`,
        },
        price && {
            q: `How much does ${med.brandName} cost?`,
            a: `Cash prices vary by pharmacy, but an estimated discount price is around ${price}. Your actual cost depends on your insurance, and copay cards or assistance programs can reduce it further.`,
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
                <h1 className="text-2xl font-bold text-slate-900 mb-3">Medication not found</h1>
                <p className="text-slate-600 mb-6">We couldn't find that medication. Search our full list to find copay cards and assistance programs.</p>
                <Link to="/medications" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">
                    <Search size={18} aria-hidden="true" /> Search medications
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
            <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
                <Link to="/" className="hover:underline">Home</Link>
                <span className="mx-1.5" aria-hidden="true">/</span>
                <Link to="/medications" className="hover:underline">Medications</Link>
                <span className="mx-1.5" aria-hidden="true">/</span>
                <span className="text-slate-700">{med.brandName}</span>
            </nav>

            {/* Header */}
            <header>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700 mb-2">
                    <Pill size={14} aria-hidden="true" /> {med.category}
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                    How to Afford {med.brandName}
                </h1>
                <p className="text-lg text-slate-600 mt-3">
                    {med.brandName}{genericDiffers ? ` (${med.genericName})` : ''} is {aOrAn(med.category)} {med.category?.toLowerCase()} used by transplant patients{med.commonOrgans?.length ? ` (${med.commonOrgans.join(', ')})` : ''}. Here are the ways to lower what you pay, from copay cards to programs that provide it for free.
                </p>
                {price && (
                    <p className="text-sm text-slate-500 mt-2">Estimated discount cash price: <strong className="text-slate-700">{price}</strong> (varies by pharmacy; your price may be lower with insurance or assistance).</p>
                )}
            </header>

            {/* Ways to save */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Ways to save on {med.brandName}</h2>

                {hasCopay && (
                    <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-5">
                        <h3 className="flex items-center gap-2 font-bold text-emerald-900 mb-1"><CreditCard size={18} aria-hidden="true" /> Manufacturer copay card</h3>
                        <p className="text-slate-700 text-sm">For commercial or employer insurance. Copay cards can bring your cost down to as little as $0–$10 a month. Not valid with Medicare or Medicaid.</p>
                        {copayLink && <a href={copayLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-sm mt-2 hover:underline">Get the copay card <ArrowRight size={14} aria-hidden="true" /></a>}
                    </div>
                )}

                <div className="border border-amber-200 bg-amber-50 rounded-xl p-5">
                    <h3 className="flex items-center gap-2 font-bold text-amber-900 mb-1"><HeartHandshake size={18} aria-hidden="true" /> Patient Assistance Program (free medication)</h3>
                    <p className="text-slate-700 text-sm">If you are uninsured, underinsured, or on Medicare/Medicaid and meet income limits, you may get {med.brandName} at no cost.{hasPap ? '' : ' Ask your transplant team about the manufacturer or foundation options for this medication.'}</p>
                    {hasPap && papLink && <a href={papLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-amber-800 font-semibold text-sm mt-2 hover:underline">Apply for assistance <ArrowRight size={14} aria-hidden="true" /></a>}
                </div>

                <div className="border border-sky-200 bg-sky-50 rounded-xl p-5">
                    <h3 className="flex items-center gap-2 font-bold text-sky-900 mb-1"><HeartHandshake size={18} aria-hidden="true" /> Foundation grants</h3>
                    <p className="text-slate-700 text-sm">Charitable foundations can help cover copays and other costs, based on income and diagnosis.</p>
                    <Link to="/application-help" className="inline-flex items-center gap-1 text-sky-700 font-semibold text-sm mt-2 hover:underline">See grants &amp; how to apply <ArrowRight size={14} aria-hidden="true" /></Link>
                </div>

                {med.generic_available && (
                    <div className="border border-slate-200 bg-white rounded-xl p-5">
                        <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-1"><Tag size={18} aria-hidden="true" /> Generic version</h3>
                        <p className="text-slate-700 text-sm">A generic {med.genericName} is available and usually costs far less. For anti-rejection drugs, stay on the same manufacturer and talk to your transplant team before switching.</p>
                        <Link to="/education?topic=GENERICS" className="inline-flex items-center gap-1 text-slate-700 font-semibold text-sm mt-2 hover:underline"><ShieldCheck size={14} aria-hidden="true" /> Generics vs. brand-name: what to know</Link>
                    </div>
                )}

                <div className="border border-slate-200 bg-white rounded-xl p-5">
                    <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-1"><DollarSign size={18} aria-hidden="true" /> Discount cards &amp; cash prices</h3>
                    <p className="text-slate-700 text-sm">Compare GoodRx, SingleCare, Amazon Pharmacy, and Mark Cuban Cost Plus Drugs. For some medications the cash price beats your insurance copay.</p>
                    <Link to="/medications" className="inline-flex items-center gap-1 text-slate-700 font-semibold text-sm mt-2 hover:underline">Compare prices for {med.brandName} <ArrowRight size={14} aria-hidden="true" /></Link>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-6 md:p-8 text-center">
                <h2 className="text-2xl font-extrabold mb-2">Find out what you could pay for {med.brandName}</h2>
                <p className="text-emerald-50 mb-5">Answer a few questions and we'll match you to the copay cards, assistance programs, and prices you qualify for.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/wizard" className="px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 inline-flex items-center justify-center gap-2">Take the free 2-minute quiz <ArrowRight size={18} aria-hidden="true" /></Link>
                    <Link to="/medications" className="px-6 py-3 bg-emerald-800/40 border border-white/40 text-white font-bold rounded-xl hover:bg-emerald-800/60 inline-flex items-center justify-center gap-2"><Search size={18} aria-hidden="true" /> Search all medications</Link>
                </div>
            </section>

            {/* FAQ */}
            {faqs.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Common questions about {med.brandName}</h2>
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
                    <h2 className="text-xl font-bold text-slate-900 mb-3">Other {med.category?.toLowerCase()} medications</h2>
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
                Educational information only, not medical advice. Prices are estimates and vary by pharmacy and plan. Always talk to your transplant team before changing how or where you fill your medications.
            </p>
        </article>
    );
};

export default MedicationDetail;
