/**
 * Evidence page: peer-reviewed research making the case for medication and
 * financial navigation across the transplant journey. B2B/credibility page
 * (English-only, like ForHospitalAdmin) — cited by the For Hospitals page,
 * About page, and footer.
 */

import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, AlertTriangle, Pill, ClipboardCheck, CheckCircle, ArrowRight, Mail, Building2, HeartPulse, Scale, FileSearch } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';

const Evidence = () => {
    useMetaTags(seoMetadata.evidence);

    const burdenStats = [
        {
            stat: '23.3%',
            label: 'reported high financial burden — out-of-pocket medical costs of 10% or more of household income'
        },
        {
            stat: '27.6%',
            label: 'were still employed at the time of transplant evaluation'
        },
        {
            stat: '66.4%',
            label: 'of high-burden patients delayed or went without medical care (vs. 33.5% of low-burden patients)'
        },
        {
            stat: '29%',
            label: 'could not pay for basic necessities like food, heat, or rent (vs. 11.3%)'
        },
        {
            stat: '72.9%',
            label: 'lost savings or assets'
        },
        {
            stat: '38.3%',
            label: 'faced medical debt or bankruptcy'
        }
    ];

    const oddsRatios = [
        { outcome: 'Problems paying medical bills', odds: '6.1×' },
        { outcome: 'Loss of savings or assets', odds: '4.8×' },
        { outcome: 'Unable to pay for basic necessities', odds: '4.8×' },
        { outcome: 'Any material financial distress', odds: '4.7×' },
        { outcome: 'Any psychological financial distress', odds: '4.6×' },
        { outcome: 'Any behavioral financial distress (delaying or skipping care)', odds: '4.0×' },
        { outcome: 'Medical debt or bankruptcy', odds: '2.9×' }
    ];

    const tmnStrategies = [
        {
            icon: Building2,
            title: 'Integrated where care happens',
            description: 'TMN is a SMART on FHIR application listed on the Epic Connection Hub, with 500+ organizational downloads, so navigation can live inside the transplant center\'s own workflow.'
        },
        {
            icon: Scale,
            title: 'Insurance-aware routing',
            description: 'The right program depends on coverage. TMN routes commercially insured patients toward pharmaceutical copay cards and Medicare patients toward patient assistance programs (PAPs) and charitable foundations — two distinct pathways that patients routinely confuse, at real cost.'
        },
        {
            icon: ClipboardCheck,
            title: 'Beyond medications',
            description: 'Because the research shows the burden extends to premiums, bills, travel, and basic necessities, TMN also connects patients to copay foundations, case-management services, and low-cost pharmacy options such as Cost Plus Drugs.'
        },
        {
            icon: HeartPulse,
            title: 'Built from lived experience',
            description: 'Created by a liver transplant recipient and national patient advocate — designed around how patients actually encounter these barriers, not how the system assumes they do.'
        }
    ];

    return (
        <article className="max-w-5xl mx-auto space-y-12 pb-12">
            {/* Hero */}
            <header className="text-center py-8 md:py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                    <BookOpen size={32} className="text-emerald-700" aria-hidden="true" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                    The Evidence: Why Medication &amp; Financial Navigation Matters
                </h1>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                    New peer-reviewed research confirms what transplant patients have always known — the cost of survival is a clinical problem, not just a personal one. Two national studies now document it across the entire transplant journey: before transplant, financial burden threatens candidacy; after transplant, medication costs threaten the graft itself.
                </p>
            </header>

            {/* Study 1: Financial burden in liver transplant candidates */}
            <section className="bg-white border-2 border-slate-200 rounded-2xl p-8 md:p-10 shadow-sm" aria-labelledby="burden-heading">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <AlertTriangle size={24} />
                    </div>
                    <h2 id="burden-heading" className="text-xl md:text-2xl font-extrabold text-slate-900">
                        1 in 4 Liver Transplant Candidates Faces High Financial Burden
                    </h2>
                </div>
                <p className="text-slate-700 leading-relaxed mb-8">
                    A 2026 multicenter U.S. study published in <em>Hepatology Communications</em> — spanning more than a dozen transplant centers including Massachusetts General Hospital, University of Minnesota, USC, Duke, and Montefiore Einstein — surveyed 453 adults undergoing liver transplant evaluation. The findings were stark:
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {burdenStats.map((item, index) => (
                        <div key={index} className="bg-rose-50 border border-rose-100 rounded-xl p-5 text-center">
                            <div className="text-3xl font-extrabold text-rose-700 mb-2">{item.stat}</div>
                            <p className="text-slate-700 text-sm leading-relaxed">{item.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Adjusted odds table */}
            <section className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl p-8 md:p-10" aria-labelledby="odds-heading">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <TrendingUp size={24} />
                    </div>
                    <h2 id="odds-heading" className="text-xl md:text-2xl font-extrabold text-slate-900">
                        Financial Burden Predicts Distress Across Every Dimension
                    </h2>
                </div>
                <p className="text-slate-700 leading-relaxed mb-6">
                    Financial burden is not a side issue. After adjusting for age, income, insurance, disease severity, and other factors, patients with high financial burden had dramatically higher odds of harm:
                </p>
                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                    <table className="w-full text-left">
                        <caption className="sr-only">Adjusted odds of financial distress outcomes for high-burden vs. low-burden liver transplant candidates</caption>
                        <thead>
                            <tr className="border-b-2 border-slate-200 bg-slate-50">
                                <th scope="col" className="px-5 py-3 text-sm font-bold text-slate-700 uppercase tracking-wide">Outcome</th>
                                <th scope="col" className="px-5 py-3 text-sm font-bold text-slate-700 uppercase tracking-wide text-right whitespace-nowrap">Adjusted Odds<span className="hidden sm:inline"> (high vs. low burden)</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {oddsRatios.map((row, index) => (
                                <tr key={index} className={index < oddsRatios.length - 1 ? 'border-b border-slate-100' : ''}>
                                    <td className="px-5 py-3 text-slate-700">{row.outcome}</td>
                                    <td className="px-5 py-3 text-right font-extrabold text-rose-700 text-lg whitespace-nowrap">{row.odds}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-slate-700 leading-relaxed mt-6">
                    Financial burden also reached the workplace: employed patients with high financial burden missed twice as much work as their low-burden peers (34.1% vs. 16.9% absenteeism). For transplant candidates, employment is not incidental — it is often the source of the insurance and income that candidacy depends on.
                </p>
            </section>

            {/* Study 2: AST survey — post-transplant cost nonadherence */}
            <section className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-8 md:p-10 shadow-md" aria-labelledby="graft-heading">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Pill size={24} />
                    </div>
                    <h2 id="graft-heading" className="text-xl md:text-2xl font-extrabold text-slate-900">
                        After Transplant, the Burden Doesn't End — It Threatens the Graft
                    </h2>
                </div>
                <p className="text-slate-800 leading-relaxed mb-6">
                    The largest patient survey ever commissioned by the American Society of Transplantation, published in the <em>American Journal of Transplantation</em> in 2025, gathered 10,091 responses from transplant recipients across 232 U.S. transplant centers — spanning every organ, all ages, and every insurance type, at an average of 6.6 years post-transplant. Its cost findings should alarm every transplant program:
                </p>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-xl border border-amber-200 p-6 text-center">
                        <div className="text-4xl font-extrabold text-amber-700 mb-2">~40%</div>
                        <p className="text-slate-700 leading-relaxed">of recipients missed a medication fill or refill in the past year because of cost</p>
                    </div>
                    <div className="bg-white rounded-xl border border-amber-200 p-6 text-center">
                        <div className="text-4xl font-extrabold text-amber-700 mb-2">1 in 4</div>
                        <p className="text-slate-700 leading-relaxed">skipped or reduced immunosuppressant doses due to cost "sometimes" or "often"</p>
                    </div>
                </div>
                <p className="text-slate-800 leading-relaxed mb-4">
                    For transplant recipients, these are not ordinary adherence lapses. Missed immunosuppressant doses are among the strongest known drivers of rejection, graft loss, and return to the waitlist — outcomes that carry enormous human and financial cost for patients, programs, and payers alike.
                </p>
                <p className="text-slate-800 leading-relaxed font-medium">
                    Read together, the two studies describe a single continuum: financial burden that surfaces during transplant evaluation does not resolve after surgery — it converts into cost-related nonadherence that puts the transplanted organ at risk, years down the road.
                </p>
            </section>

            {/* The gap: screening without a strategy */}
            <section className="bg-white border-2 border-slate-200 rounded-2xl p-8 md:p-10" aria-labelledby="gap-heading">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <FileSearch size={24} />
                    </div>
                    <h2 id="gap-heading" className="text-xl md:text-2xl font-extrabold text-slate-900">
                        What the Researchers Recommend — and Where the System Falls Short
                    </h2>
                </div>
                <blockquote className="border-l-4 border-blue-300 pl-6 py-2 mb-5">
                    <p className="text-slate-800 text-lg leading-relaxed italic">
                        The study's authors conclude that <strong className="text-slate-900">routine screening for financial burden is critical in liver transplant candidates and should be paired with targeted strategies to mitigate its impact.</strong>
                    </p>
                </blockquote>
                <p className="text-slate-700 leading-relaxed">
                    That second half is the gap. Screening tells a transplant program <em>which</em> patients are drowning. It does not throw them a rope. A patient identified as high-burden still faces a fragmented maze of manufacturer programs, foundations, insurance rules, and paperwork — the same maze that caused 66% of high-burden patients to delay or forgo care in the first place.
                </p>
            </section>

            {/* TMN as the targeted strategy */}
            <section className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-8 md:p-10" aria-labelledby="tmn-heading">
                <h2 id="tmn-heading" className="text-2xl font-bold text-white mb-2 text-center">
                    Transplant Medication Navigator Is the Targeted Strategy
                </h2>
                <p className="text-emerald-200 text-center mb-8 max-w-2xl mx-auto">
                    TMN was built to be the intervention that the research calls for — the step between identifying financial burden and resolving it.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    {tmnStrategies.map((item, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="flex items-center gap-3 mb-3">
                                <item.icon size={22} className="text-emerald-300 flex-shrink-0" aria-hidden="true" />
                                <h3 className="font-bold text-white">{item.title}</h3>
                            </div>
                            <p className="text-emerald-100 text-sm leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why now: IOTA and value-based accountability */}
            <section className="bg-gradient-to-br from-rose-50 to-red-50 border-2 border-rose-300 rounded-2xl p-8 md:p-10 shadow-md" aria-labelledby="whynow-heading">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Building2 size={24} />
                    </div>
                    <h2 id="whynow-heading" className="text-xl md:text-2xl font-extrabold text-slate-900">
                        Why This Matters to Transplant Programs Now
                    </h2>
                </div>
                <p className="text-slate-800 leading-relaxed mb-4">
                    Value-based accountability is arriving in transplantation. CMS's IOTA model now ties kidney transplant program payment to transplant volume and post-transplant outcomes — and the direction of travel is clear across all organs. This research shows that financial burden drives delayed care, missed work, and psychological distress: precisely the forces that erode candidacy, adherence, and graft survival.
                </p>
                <p className="text-slate-800 leading-relaxed font-semibold mb-6">
                    Programs that screen for financial burden without an operational answer are documenting risk, not managing it.
                </p>
                <div className="bg-white rounded-xl border border-rose-200 p-5 mb-6">
                    <p className="text-slate-600 text-sm leading-relaxed">
                        <strong className="text-slate-700">A note on scope:</strong> the financial burden study examined liver transplant candidates specifically, so its exact figures should not be assumed identical for other organs. The AST survey, however, spanned all solid organ types — and its finding that cost drives missed fills and skipped doses in roughly 4 in 10 recipients confirms the problem is transplant-wide, not organ-specific.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link
                        to="/for-hospitals"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        See the Solution for Transplant Programs
                        <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                    <a
                        href="mailto:info@transplantmedicationnavigator.com?subject=Evidence%20Briefing%20Request"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-sm border-2 border-slate-200 hover:border-slate-300 transition"
                    >
                        <Mail size={18} aria-hidden="true" />
                        Request an Evidence Briefing
                    </a>
                </div>
            </section>

            {/* Patient cross-link */}
            <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 md:p-8 text-center" aria-labelledby="patient-heading">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <CheckCircle size={22} className="text-emerald-700" aria-hidden="true" />
                    <h2 id="patient-heading" className="text-lg font-bold text-emerald-900">Facing these costs yourself?</h2>
                </div>
                <p className="text-emerald-800 mb-2 max-w-2xl mx-auto">
                    You don't have to navigate the maze alone. Take the free 2-minute quiz to find copay cards, patient assistance programs, and foundation grants for your medications.
                </p>
                <p className="text-emerald-800 mb-4 max-w-2xl mx-auto">
                    And if you lost your job or insurance during evaluation — like nearly 3 in 4 candidates in the study — you may qualify for programs you didn't know existed.
                </p>
                <Link
                    to="/wizard"
                    className="inline-flex items-center gap-2 text-emerald-700 font-bold hover:underline"
                >
                    Find your path to affordable medications
                    <ArrowRight size={16} aria-hidden="true" />
                </Link>
            </section>

            {/* Sources */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8" aria-labelledby="sources-heading">
                <h2 id="sources-heading" className="text-lg font-bold text-slate-900 mb-4">Sources</h2>
                <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 leading-relaxed">
                    <li>
                        Aby ES, Hundt M, Rice J, et al. Financial burden among liver transplant candidates is associated with financial distress and work impairment: A U.S. multicenter study. <em>Hepatology Communications.</em> 2026;10:e0985.{' '}
                        <a
                            href="https://doi.org/10.1097/HC9.0000000000000985"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 underline font-medium"
                        >
                            doi:10.1097/HC9.0000000000000985
                        </a>{' '}
                        (open access)
                    </li>
                    <li>
                        Taber DJ, Gordon EJ, Myaskovsky L, et al. Therapeutic needs in solid organ transplant recipients: The American Society of Transplantation patient survey. <em>American Journal of Transplantation.</em> 2025;25:2565–2577.{' '}
                        <a
                            href="https://doi.org/10.1016/j.ajt.2025.07.2474"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 underline font-medium"
                        >
                            doi:10.1016/j.ajt.2025.07.2474
                        </a>{' '}
                        (PMID: 40744428)
                    </li>
                </ol>
                <p className="text-slate-400 text-xs mt-6 italic">
                    This page summarizes independently conducted, peer-reviewed research. Transplant Medication Navigator was not involved in the studies. This content is educational and is not medical, legal, or financial advice.
                </p>
            </section>
        </article>
    );
};

export default Evidence;
