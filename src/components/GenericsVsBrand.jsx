/**
 * Generics vs. Brand-Name — patient education.
 *
 * Consolidates the guidance that was previously scattered across several FAQ
 * entries into one clear, transplant-specific explainer. Reassures patients
 * that generics are safe and money-saving, while making the one rule that
 * matters for narrow-therapeutic-index anti-rejection drugs unmistakable:
 * stay on the same manufacturer and tell your transplant team before switching.
 *
 * Written at ~6th-grade reading level to match the rest of the site.
 */

import { Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, CheckCircle, Pill, FlaskConical, Phone, ArrowRight } from 'lucide-react';

const GenericsVsBrand = () => {
    return (
        <div className="space-y-6">
            <div>
                <span className="text-xs font-bold uppercase tracking-wide text-emerald-700">Medication Safety</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Generics vs. Brand-Name Medicines</h2>
                <p className="text-slate-700 mt-2 md:text-lg">
                    Generics can save you a lot of money — and for most medicines they are a smart, safe choice.
                    For transplant patients, there is just one important rule that keeps them safe. Here is what to know.
                </p>
            </div>

            {/* Generics are real medicine */}
            <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <h3 className="flex items-center gap-2 font-bold text-emerald-900 mb-2">
                    <ShieldCheck size={20} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
                    Generics are real medicine
                </h3>
                <ul className="space-y-1.5 text-slate-700 text-sm md:text-base">
                    <li>• A generic has the <strong>same active ingredient</strong> as the brand name.</li>
                    <li>• The FDA approves it and requires it to work the same way.</li>
                    <li>• It usually costs a lot less.</li>
                    <li>• For most medicines, choosing the generic is a safe way to save money.</li>
                </ul>
            </section>

            {/* Transplant drugs need extra care */}
            <section className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h3 className="flex items-center gap-2 font-bold text-amber-900 mb-2">
                    <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" aria-hidden="true" />
                    Transplant drugs need extra care
                </h3>
                <p className="text-slate-700 text-sm md:text-base mb-2">
                    Anti-rejection drugs — like <strong>tacrolimus (Prograf)</strong>, <strong>cyclosporine</strong>,
                    <strong> sirolimus (Rapamune)</strong>, and <strong>everolimus</strong> — are "narrow therapeutic index" drugs.
                    That means even a small change in how much reaches your blood matters:
                </p>
                <ul className="space-y-1.5 text-slate-700 text-sm md:text-base">
                    <li>• <strong>Too little</strong> → your body could reject the organ.</li>
                    <li>• <strong>Too much</strong> → more side effects and toxicity.</li>
                </ul>
                <p className="text-slate-700 text-sm md:text-base mt-2">
                    Different makers can be absorbed a little differently. So the real risk is not the generic itself —
                    it is <strong>switching</strong> (brand to generic, or one generic maker to another).
                </p>
            </section>

            {/* The safe way to save */}
            <section className="bg-white border-2 border-emerald-300 rounded-xl p-5">
                <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-3">
                    <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
                    The safe way to save with a generic
                </h3>
                <ol className="space-y-2 text-slate-700 text-sm md:text-base list-decimal list-inside">
                    <li>Pick one version and stay on it. A generic is fine — just keep the <strong>same manufacturer</strong> every time you refill.</li>
                    <li>Ask your pharmacy to always give you the same maker, and to call you <strong>before</strong> any switch.</li>
                    <li>Ask your doctor to write the maker on your prescription (or <strong>"Do Not Substitute"</strong> if your team wants brand-name).</li>
                    <li>After <strong>any</strong> change, ask for a blood test within a week.</li>
                    <li>Always tell your transplant team <strong>before</strong> you change anything.</li>
                </ol>
            </section>

            {/* When to ask for brand-name */}
            <section className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h3 className="flex items-center gap-2 font-bold text-blue-900 mb-2">
                    <Pill size={20} className="text-blue-600 flex-shrink-0" aria-hidden="true" />
                    When to ask for brand-name
                </h3>
                <p className="text-slate-700 text-sm md:text-base mb-2">You may want to ask for brand-name if:</p>
                <ul className="space-y-1.5 text-slate-700 text-sm md:text-base">
                    <li>• Your drug levels have been steady on it.</li>
                    <li>• You had problems after a past switch.</li>
                    <li>• Your transplant center requires it.</li>
                </ul>
                <Link to="/education/appeals" className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline mt-3 text-sm">
                    If insurance says no, learn how to appeal <ArrowRight size={14} aria-hidden="true" />
                </Link>
            </section>

            {/* Bottom line */}
            <section className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                    <FlaskConical size={22} className="text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                        <h3 className="font-bold text-slate-900 mb-1">The bottom line</h3>
                        <p className="text-slate-700 text-sm md:text-base">
                            Generics can save you money <strong>and</strong> be safe. The key is staying consistent —
                            the same version every time — and keeping your transplant team in the loop.
                            <strong> Never switch on your own just to save money.</strong>
                        </p>
                    </div>
                </div>
            </section>

            <p className="flex items-center gap-2 text-sm text-slate-500">
                <Phone size={16} className="flex-shrink-0" aria-hidden="true" />
                Have a question about a switch? Call your transplant team before your next refill.
            </p>
        </div>
    );
};

export default GenericsVsBrand;
