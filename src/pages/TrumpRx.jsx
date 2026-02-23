import { Link } from 'react-router-dom';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';
import { ArrowRight, ExternalLink } from 'lucide-react';

const TrumpRx = () => {
    useMetaTags(seoMetadata.trumprx || {
        title: 'TrumpRx.gov Guide for Transplant Patients | Transplant Medication Navigator\u2122',
        description: 'Everything transplant patients need to know about TrumpRx.gov \u2014 which of the 43 discounted drugs are relevant before and after transplant, Medicare/Medicaid restrictions, and how it compares to copay cards and PAPs.',
        canonical: 'https://transplantmedicationnavigator.com/trumprx',
        breadcrumbName: 'TrumpRx Guide',
    });

    return (
        <article>
            {/* Page Hero */}
            <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 text-white rounded-2xl p-8 md:p-12 mb-8 relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-20%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_70%)] rounded-full" aria-hidden="true"></div>
                <div className="max-w-3xl relative z-10">
                    <div className="text-sm opacity-70 mb-4">
                        <Link to="/" className="text-white hover:underline">Home</Link> / <Link to="/education" className="text-white hover:underline">Resources</Link> / TrumpRx.gov Guide
                    </div>
                    <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        New Savings Resource &mdash; February 2026
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
                        TrumpRx.gov: What Transplant Patients Need to Know
                    </h1>
                    <p className="text-base md:text-lg opacity-90 max-w-2xl leading-relaxed">
                        The government launched a new drug discount website with 43 medications. We reviewed every single one to tell you which matter for transplant patients, what the limitations are, and how it fits alongside your existing options.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-5 text-sm opacity-80">
                        <span className="flex items-center gap-1.5">Launched: February 5, 2026</span>
                        <span className="flex items-center gap-1.5">43 Medications Listed</span>
                        <span className="flex items-center gap-1.5">22 Relevant to Transplant</span>
                    </div>
                </div>
            </section>

            <div className="max-w-3xl mx-auto space-y-8">
                {/* Quick Navigation */}
                <nav className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">On This Page</div>
                    <div className="flex flex-wrap gap-2">
                        {[
                            ['#what-is', 'What Is TrumpRx?'],
                            ['#transplant-alert', 'Transplant Alerts'],
                            ['#faq', 'Full FAQ'],
                            ['#drugs', 'Transplant Drug List'],
                            ['#compare', 'How It Compares'],
                        ].map(([href, label]) => (
                            <a key={href} href={href} className="inline-block px-3.5 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition">
                                {label}
                            </a>
                        ))}
                    </div>
                </nav>

                {/* Visit TrumpRx Box */}
                <a href="https://trumprx.gov" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white border-2 border-emerald-600 rounded-xl p-5 hover:bg-emerald-50 hover:shadow-lg transition group">
                    <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 text-white">
                        <ExternalLink size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-lg text-emerald-700">Visit TrumpRx.gov</div>
                        <div className="text-sm text-slate-500 mt-0.5">Browse all 43 medications, see discounted prices, and access coupons</div>
                    </div>
                    <span className="text-2xl text-emerald-600 font-bold hidden sm:block group-hover:translate-x-1 transition-transform">&rarr;</span>
                </a>

                {/* What Is TrumpRx */}
                <section id="what-is">
                    <div className="border-b-2 border-slate-200 pb-3 mb-5">
                        <h2 className="text-2xl font-extrabold text-slate-900">What Is TrumpRx.gov?</h2>
                        <p className="text-sm text-slate-500 mt-1">The basics &mdash; in plain language</p>
                    </div>
                    <p className="text-base text-slate-600 leading-relaxed">
                        TrumpRx.gov is a government website that lists discounted cash prices on 43 brand-name medications. It was launched on February 5, 2026, as part of President Trump&rsquo;s &ldquo;Most-Favored-Nation&rdquo; drug pricing initiative. The site doesn&rsquo;t sell drugs directly &mdash; it provides coupons you take to a pharmacy or links you to manufacturer websites where you can purchase at the discounted price. Currently, 5 pharmaceutical companies are participating (AstraZeneca, Eli Lilly, EMD Serono, Novo Nordisk, and Pfizer), with more expected soon.
                    </p>
                </section>

                {/* Critical Information for Transplant Patients */}
                <section id="transplant-alert">
                    <div className="border-b-2 border-slate-200 pb-3 mb-5">
                        <h2 className="text-2xl font-extrabold text-slate-900">Critical Information for Transplant Patients</h2>
                        <p className="text-sm text-slate-500 mt-1">Read these before using TrumpRx</p>
                    </div>

                    {/* Medicare/Medicaid Alert */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-4 mb-5">
                        <div className="w-9 h-9 bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">!</div>
                        <div>
                            <h3 className="font-bold text-red-900 mb-1.5">Medicare &amp; Medicaid Patients: Restrictions Apply</h3>
                            <p className="text-sm text-red-800 leading-relaxed">
                                Some TrumpRx discounts require you to <strong>certify that you are NOT enrolled in a government insurance program</strong> (Medicare, Medicaid, VA, TRICARE). If you are a transplant recipient on Medicare, you may not be able to use certain coupons. Some discounts also cannot be applied toward your deductible or out-of-pocket maximum. <strong>Always check your plan&rsquo;s copay before using TrumpRx.</strong>
                            </p>
                        </div>
                    </div>

                    {/* No Immunosuppressants Alert */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4 mb-5">
                        <div className="w-9 h-9 bg-amber-500 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">!</div>
                        <div>
                            <h3 className="font-bold text-amber-900 mb-1.5">No Transplant Immunosuppressants Listed (Yet)</h3>
                            <p className="text-sm text-amber-800 leading-relaxed">
                                TrumpRx does <strong>NOT</strong> currently include core transplant medications like <strong>tacrolimus (Prograf/Envarsus), mycophenolate (CellCept/Myfortic), sirolimus (Rapamune), cyclosporine (Neoral/Gengraf), or belatacept (Nulojix)</strong>. For these medications, continue using manufacturer copay cards and patient assistance programs through our Navigator. More drugs are expected to be added &mdash; we&rsquo;ll update this page when transplant-relevant additions appear.
                            </p>
                        </div>
                    </div>

                    {/* Pre-Transplant Opportunity */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-4">
                        <div className="w-9 h-9 bg-emerald-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">&#9733;</div>
                        <div>
                            <h3 className="font-bold text-emerald-900 mb-1.5">Pre-Transplant Opportunity: GLP-1 Weight Loss Medications</h3>
                            <p className="text-sm text-emerald-800 leading-relaxed">
                                Many transplant centers require patients to meet <strong>BMI thresholds</strong> before listing. GLP-1 medications like <strong>Wegovy ($149&ndash;$199/mo)</strong> and <strong>Zepbound ($299/mo)</strong> are on TrumpRx and are often NOT covered by insurance for weight loss. For patients working to qualify for transplant, this could be a significant savings opportunity. <strong>Always discuss with your transplant team before starting any new medication.</strong>
                            </p>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq">
                    <div className="border-b-2 border-slate-200 pb-3 mb-5">
                        <h2 className="text-2xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
                        <p className="text-sm text-slate-500 mt-1">Official TrumpRx FAQs + transplant-specific context from our team</p>
                    </div>

                    {/* For Patients */}
                    <div className="mb-7">
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span> For Patients
                        </div>

                        <FAQItem question="What is TrumpRx?">
                            <p>TrumpRx is a government website that lists discounted drug prices from manufacturers that have agreed to Most Favored Nation (MFN) pricing. Americans can use TrumpRx to purchase drugs with cash (outside of their insurance). These drugs can be obtained at participating pharmacies using coupon cards displayed on TrumpRx or directly through manufacturers&rsquo; websites. Not all drugs are currently listed but many more are coming soon.</p>
                            <div className="bg-emerald-50 border-l-3 border-emerald-600 pl-4 py-3 pr-4 rounded-r-lg mt-3 text-sm text-emerald-800">
                                <strong className="text-emerald-900">Transplant Context:</strong> Think of TrumpRx as another tool alongside GoodRx, Cost Plus Drugs, and manufacturer copay cards. It&rsquo;s one more place to compare prices &mdash; but it currently covers only 43 brand-name drugs and none of the core immunosuppressants transplant patients depend on.
                            </div>
                        </FAQItem>

                        <FAQItem question="Which drugs are listed on the website?">
                            <p>Currently 43 brand-name medications from 5 manufacturers: AstraZeneca, Eli Lilly, EMD Serono, Novo Nordisk, and Pfizer. Categories include weight loss/diabetes (Wegovy, Ozempic, Zepbound), fertility (Gonal-F, Cetrotide, Ovidrel), respiratory (Airsupra, Bevespi), cardiovascular, antifungal, and more. A total of 16 manufacturers have signed agreements, so additional drugs will be added over time.</p>
                            <div className="bg-emerald-50 border-l-3 border-emerald-600 pl-4 py-3 pr-4 rounded-r-lg mt-3 text-sm text-emerald-800">
                                <strong className="text-emerald-900">Transplant Context:</strong> We identified 22 of the 43 drugs as relevant to transplant patients &mdash; see our <a href="#drugs" className="text-emerald-700 font-semibold underline">complete transplant drug list below</a>. This includes pre-transplant weight loss drugs, post-transplant antifungals and steroids, diabetes medications for NODAT (new-onset diabetes after transplant), and cholesterol drugs commonly needed due to immunosuppressant side effects.
                            </div>
                        </FAQItem>

                        <FAQItem question="Do I need to create an account or register?">
                            <p>No. TrumpRx does not require registration or account creation. You can browse medications and access coupons without signing up. You will need a valid prescription from your doctor to actually purchase any medication.</p>
                        </FAQItem>

                        <FAQItem question="Can I use my insurance to buy drugs listed on TrumpRx?">
                            <p><strong>No. TrumpRx discounted pricing is only available for cash-paying patients.</strong> You cannot use health insurance, and your TrumpRx purchases will typically NOT count toward your deductible or out-of-pocket maximum.</p>
                            <div className="bg-amber-50 border-l-3 border-amber-500 pl-4 py-3 pr-4 rounded-r-lg mt-3 text-sm text-amber-900">
                                <strong>Transplant Warning:</strong> This is especially important for transplant patients. If you have commercial insurance or Medicare, your copay may already be lower than the TrumpRx cash price. Using TrumpRx instead of your insurance means those dollars don&rsquo;t count toward your deductible &mdash; and you could end up paying MORE over the course of the year. <strong>Always compare your insurance copay first.</strong>
                            </div>
                        </FAQItem>

                        <FAQItem question="Can I get TrumpRx prices at my local pharmacy?">
                            <p>It depends on the medication. Some drugs provide a coupon you can print or download to your phone and present at participating pharmacies (CVS, Walgreens, Walmart, Kroger, Costco, and many independents). Other drugs require you to purchase directly through the manufacturer&rsquo;s website (like LillyDirect for Zepbound or AstraZeneca Direct for Airsupra). The TrumpRx listing for each drug will tell you which option applies.</p>
                            <div className="bg-emerald-50 border-l-3 border-emerald-600 pl-4 py-3 pr-4 rounded-r-lg mt-3 text-sm text-emerald-800">
                                <strong className="text-emerald-900">Transplant Context:</strong> If you use a specialty pharmacy for your transplant medications, check whether that pharmacy participates in TrumpRx coupons. Some transplant medications are only dispensed through specialty pharmacies, which may have different pricing structures.
                            </div>
                        </FAQItem>

                        <FAQItem question="How does my doctor send prescriptions to TrumpRx?">
                            <p>Your doctor does not send prescriptions to TrumpRx directly. TrumpRx is not a pharmacy. You get a coupon from TrumpRx and bring it to your pharmacy along with your existing prescription, OR you go to the manufacturer&rsquo;s website and follow their process for filling your prescription. Some manufacturer sites may require your doctor to send a prescription to their designated pharmacy.</p>
                        </FAQItem>

                        <FAQItem question="Does TrumpRx cost anything?">
                            <p>No. Using TrumpRx is free. The site is a government-operated portal. You only pay for the medications themselves at the discounted cash price.</p>
                        </FAQItem>

                        <FAQItem question="Are there generic alternatives that might be cheaper?">
                            <p>TrumpRx only lists brand-name drugs. For some medications on TrumpRx, generic versions are available at significantly lower prices through other sources.</p>
                            <div className="bg-amber-50 border-l-3 border-amber-500 pl-4 py-3 pr-4 rounded-r-lg mt-3 text-sm text-amber-900">
                                <strong>Example:</strong> Protonix (pantoprazole) is listed on TrumpRx at $200.10. The generic version costs approximately $30 with a GoodRx coupon or through Cost Plus Drugs. <strong>Always check if a generic exists before paying the TrumpRx price.</strong> Our Navigator can help you compare options.
                            </div>
                        </FAQItem>

                        <FAQItem question="What if I'm on Medicare or Medicaid?">
                            <p>Some TrumpRx discounts are <strong>not available</strong> to people enrolled in government insurance programs including Medicare, Medicaid, VA, TRICARE, or other federally or state-funded programs. For certain drugs, you may be required to click a button certifying that you are not enrolled in these programs and won&rsquo;t seek insurance reimbursement.</p>
                            <div className="bg-amber-50 border-l-3 border-amber-500 pl-4 py-3 pr-4 rounded-r-lg mt-3 text-sm text-amber-900">
                                <strong>Transplant Warning:</strong> Many transplant patients are on Medicare (especially kidney transplant recipients who qualify for Medicare coverage of immunosuppressants). If you&rsquo;re on Medicare Part D, your drug copays through your plan will likely be lower than TrumpRx cash prices for most medications. Check with your plan or use our Navigator to find Medicare-compatible assistance programs instead.
                            </div>
                        </FAQItem>
                    </div>

                    {/* For Prescribers & Pharmacies */}
                    <div className="mb-7">
                        <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span> For Prescribers &amp; Pharmacies
                        </div>

                        <FAQItem question="Where do I send prescriptions for TrumpRx medications?">
                            <p>It depends on the drug. Some medications allow coupon-based dispensing at any participating retail pharmacy. Others (like Zepbound, Airsupra, and Xigduo XR) must be purchased through manufacturer-direct websites that have their own pharmacy fulfillment process. The TrumpRx listing for each drug specifies where prescriptions should be directed.</p>
                        </FAQItem>

                        <FAQItem question="How will a pharmacist process a TrumpRx claim?">
                            <p>For coupon-based drugs, the patient presents a printed or digital coupon at the pharmacy counter. The pharmacist processes the coupon similarly to a GoodRx or manufacturer copay card. GoodRx is the integrated pricing partner for many TrumpRx drugs (including Pfizer&rsquo;s 30+ medications), so pharmacies already familiar with GoodRx processing should find the workflow similar.</p>
                        </FAQItem>

                        <FAQItem question="How will pharmacies get paid for TrumpRx prescriptions?">
                            <p>Payment processes vary by manufacturer. For GoodRx-integrated coupons, the standard GoodRx pharmacy reimbursement process applies. For manufacturer-direct purchases, the pharmacy may not be involved at all (e.g., LillyDirect ships directly to patients). This is still an evolving area &mdash; the National Community Pharmacists Association (NCPA) has been working with the administration to address pharmacy reimbursement concerns.</p>
                        </FAQItem>

                        <FAQItem question="Is a pharmacy required to dispense a TrumpRx drug if reimbursement is below cost?">
                            <p>No. Pharmacies are not required to dispense medications at a loss. If the TrumpRx coupon reimbursement is below a pharmacy&rsquo;s acquisition cost, the pharmacy can decline to fill at that price. Patients may need to use the manufacturer-direct option or find a different participating pharmacy.</p>
                        </FAQItem>
                    </div>
                </section>

                {/* Drug Table */}
                <section id="drugs">
                    <div className="border-b-2 border-slate-200 pb-3 mb-5">
                        <h2 className="text-2xl font-extrabold text-slate-900">TrumpRx Medications Relevant to Transplant Patients</h2>
                        <p className="text-sm text-slate-500 mt-1">22 of 43 drugs that matter for our community &mdash; organized by when you might need them</p>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white mb-7">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-slate-500 border-b-2 border-slate-200">Medication</th>
                                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-slate-500 border-b-2 border-slate-200">Category</th>
                                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-slate-500 border-b-2 border-slate-200">TrumpRx Price</th>
                                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-slate-500 border-b-2 border-slate-200">Savings</th>
                                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-slate-500 border-b-2 border-slate-200">Notes for Transplant Patients</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DRUG_DATA.map((drug, i) => (
                                    <tr key={i} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                                        <td className="px-4 py-3 align-top">
                                            <div className="font-semibold text-slate-900">{drug.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{drug.generic}</div>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap ${CATEGORY_STYLES[drug.category]}`}>
                                                {drug.categoryLabel}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 align-top font-bold text-emerald-700 whitespace-nowrap">
                                            {drug.price}<br />
                                            <span className="text-xs text-slate-400 font-normal line-through">{drug.originalPrice}</span>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap">{drug.discount}</span>
                                        </td>
                                        <td className="px-4 py-3 align-top text-xs text-slate-500 italic">{drug.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* How It Compares */}
                <section id="compare">
                    <div className="border-b-2 border-slate-200 pb-3 mb-5">
                        <h2 className="text-2xl font-extrabold text-slate-900">How TrumpRx Compares to Your Other Options</h2>
                        <p className="text-sm text-slate-500 mt-1">TrumpRx is one tool &mdash; here&rsquo;s how it fits in your medication savings toolkit</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-7">
                        {COMPARE_DATA.map((card, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
                                <h4 className="font-bold text-base mb-3 flex items-center gap-2">{card.icon} {card.title}</h4>
                                <ul className="text-sm text-slate-600 space-y-1.5">
                                    {card.items.map((item, j) => (
                                        <li key={j} className="flex items-baseline gap-2 pb-1.5 border-b border-slate-50 last:border-b-0">
                                            <span className={item.check ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{item.check ? '\u2713' : '\u2717'}</span>
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-7 text-center">
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-3">TrumpRx Is One More Tool &mdash; But We Cover What It Doesn&rsquo;t</h3>
                    <p className="text-base text-emerald-800 max-w-xl mx-auto mb-4">
                        For your immunosuppressants, antiviral prophylaxis, and the full range of transplant medications, our Navigator matches you to copay cards and patient assistance programs based on YOUR insurance type.
                    </p>
                    <div className="flex justify-center gap-8 flex-wrap mb-5">
                        <div className="text-center">
                            <div className="text-3xl font-extrabold text-emerald-700">184</div>
                            <div className="text-xs text-slate-500 mt-1">Transplant Medications</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-extrabold text-emerald-700">65+</div>
                            <div className="text-xs text-slate-500 mt-1">Copay Cards</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-extrabold text-emerald-700">60+</div>
                            <div className="text-xs text-slate-500 mt-1">Patient Assistance Programs</div>
                        </div>
                    </div>
                    <Link to="/" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg hover:shadow-xl">
                        Search Your Medications <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                </section>

                {/* Last Updated */}
                <div className="text-center text-xs text-slate-400 mt-6 pt-5 border-t border-slate-200">
                    Last updated: February 23, 2026 &middot; Source: <a href="https://trumprx.gov" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">TrumpRx.gov</a>, <a href="https://www.whitehouse.gov/fact-sheets/2026/02/fact-sheet-president-donald-j-trump-launches-trumprx-gov-to-bring-lower-drug-prices-to-american-patients/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">White House Fact Sheet</a> &middot; We will update this page as new drugs are added.
                </div>
            </div>
        </article>
    );
};

/* ============================================
   FAQ Accordion Item
   ============================================ */
const FAQItem = ({ question, children }) => (
    <details className="bg-white border border-slate-200 rounded-xl mb-2 overflow-hidden group hover:border-emerald-200 transition [&[open]]:border-emerald-600 [&[open]]:shadow-md">
        <summary className="px-5 py-4 font-semibold text-base cursor-pointer select-none flex justify-between items-center text-slate-900 list-none [&::-webkit-details-marker]:hidden">
            {question}
            <span className="text-xl font-light text-emerald-600 ml-3 flex-shrink-0 group-open:hidden">+</span>
            <span className="text-xl font-light text-emerald-600 ml-3 flex-shrink-0 hidden group-open:inline">&minus;</span>
        </summary>
        <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed space-y-2.5">
            {children}
        </div>
    </details>
);

/* ============================================
   Drug Table Data
   ============================================ */
const CATEGORY_STYLES = {
    pretx: 'bg-amber-100 text-amber-800',
    posttx: 'bg-emerald-100 text-emerald-800',
    diabetes: 'bg-indigo-100 text-indigo-700',
    other: 'bg-pink-100 text-pink-700',
};

const DRUG_DATA = [
    { name: 'Wegovy\u00AE Pill', generic: 'semaglutide oral', category: 'pretx', categoryLabel: 'Pre-TX', price: '$149/mo', originalPrice: '$1,349', discount: '89% off', note: 'GLP-1 for weight loss \u2014 can help patients meet BMI listing requirements' },
    { name: 'Wegovy\u00AE Pen', generic: 'semaglutide injection', category: 'pretx', categoryLabel: 'Pre-TX', price: '$199/mo', originalPrice: '$1,349', discount: 'Up to 85% off', note: 'Injectable version; dose varies by price tier' },
    { name: 'Zepbound\u00AE', generic: 'tirzepatide', category: 'pretx', categoryLabel: 'Pre-TX', price: '$299/mo', originalPrice: '$1,087', discount: '72% off', note: 'Weight loss + sleep apnea; purchased via LillyDirect' },
    { name: 'Ozempic\u00AE Pen', generic: 'semaglutide injection', category: 'pretx', categoryLabel: 'Pre-TX', price: '$199/mo', originalPrice: '$1,028', discount: 'Up to 81% off', note: 'Diabetes + weight management; also relevant post-TX for NODAT' },
    { name: 'Chantix\u00AE', generic: 'varenicline', category: 'pretx', categoryLabel: 'Pre-TX', price: '$106.20', originalPrice: '~$212', discount: '~50% off', note: 'Smoking cessation \u2014 many centers require 6 months smoke-free to list' },
    { name: 'Diflucan\u00AE', generic: 'fluconazole', category: 'posttx', categoryLabel: 'Post-TX', price: '$14.06', originalPrice: '~$35', discount: '~60% off', note: 'Antifungal \u2014 commonly prescribed post-transplant; generic may be cheaper' },
    { name: 'Vfend\u00AE', generic: 'voriconazole', category: 'posttx', categoryLabel: 'Post-TX', price: '$306.98', originalPrice: '~$614', discount: '~50% off', note: 'Serious fungal infections in immunocompromised patients' },
    { name: 'Zyvox\u00AE', generic: 'linezolid', category: 'posttx', categoryLabel: 'Post-TX', price: '$122.74', originalPrice: '~$307', discount: '~60% off', note: 'Antibiotic for resistant infections \u2014 used when standard antibiotics fail' },
    { name: 'Cleocin\u00AE', generic: 'clindamycin', category: 'posttx', categoryLabel: 'Post-TX', price: '$94.35', originalPrice: '~$189', discount: '~50% off', note: 'Antibiotic; generic widely available and may be cheaper' },
    { name: 'Medrol\u00AE', generic: 'methylprednisolone', category: 'posttx', categoryLabel: 'Post-TX', price: '$3.15', originalPrice: '~$8', discount: '~60% off', note: 'Steroid \u2014 used in rejection treatment protocols' },
    { name: 'Cortef\u00AE', generic: 'hydrocortisone', category: 'posttx', categoryLabel: 'Post-TX', price: '$45.00', originalPrice: '~$90', discount: '~50% off', note: 'Adrenal support \u2014 some transplant patients need this long-term' },
    { name: 'Protonix\u00AE', generic: 'pantoprazole', category: 'posttx', categoryLabel: 'Post-TX', price: '$200.10', originalPrice: '~$400', discount: '~50% off', note: 'Generic is ~$30 on GoodRx/CostPlus! Check generic first' },
    { name: 'Insulin Lispro', generic: 'rapid-acting insulin', category: 'diabetes', categoryLabel: 'Diabetes', price: '$25.00', originalPrice: '~$71', discount: '~65% off', note: 'Post-transplant diabetes (NODAT) is very common' },
    { name: 'Farxiga\u00AE', generic: 'dapagliflozin', category: 'diabetes', categoryLabel: 'Diabetes', price: '$181.59', originalPrice: '~$600', discount: '70% off', note: 'Diabetes + kidney & heart protection \u2014 increasingly used post-transplant' },
    { name: 'Xigduo\u00AE XR', generic: 'dapagliflozin/metformin', category: 'diabetes', categoryLabel: 'Diabetes', price: '$181.59', originalPrice: '~$600', discount: '70% off', note: 'Combo diabetes med; purchased via AstraZeneca Direct' },
    { name: 'Tikosyn\u00AE', generic: 'dofetilide', category: 'diabetes', categoryLabel: 'Cardio', price: '$336.00', originalPrice: '~$560', discount: '~40% off', note: 'Heart rhythm \u2014 relevant for heart transplant patients' },
    { name: 'Colestid\u00AE', generic: 'colestipol', category: 'diabetes', categoryLabel: 'Cholesterol', price: '$127.91', originalPrice: '~$256', discount: '~50% off', note: 'Cholesterol management \u2014 immunosuppressants can raise cholesterol' },
    { name: 'Lopid\u00AE', generic: 'gemfibrozil', category: 'diabetes', categoryLabel: 'Cholesterol', price: '$39.60', originalPrice: '~$88', discount: '~55% off', note: 'Triglycerides/cholesterol; generic available \u2014 compare prices' },
    { name: 'Pristiq\u00AE', generic: 'desvenlafaxine', category: 'other', categoryLabel: 'Mental Health', price: '$200.10', originalPrice: '~$364', discount: '~45% off', note: 'Antidepressant \u2014 mental health support is critical for transplant patients' },
    { name: 'Cytomel\u00AE', generic: 'liothyronine', category: 'other', categoryLabel: 'Thyroid', price: '$6.00', originalPrice: '~$15', discount: '~60% off', note: 'Thyroid \u2014 thyroid issues can develop post-transplant' },
    { name: 'Levoxyl\u00AE', generic: 'levothyroxine', category: 'other', categoryLabel: 'Thyroid', price: '$35.10', originalPrice: '~$70', discount: '~50% off', note: 'Hypothyroidism; generic widely available' },
    { name: 'Xeljanz\u00AE', generic: 'tofacitinib', category: 'other', categoryLabel: 'Autoimmune', price: '$1,518', originalPrice: '~$2,267', discount: '33% off', note: 'JAK inhibitor \u2014 studied in transplant immunosuppression research' },
];

/* ============================================
   Comparison Data
   ============================================ */
const COMPARE_DATA = [
    {
        icon: '\uD83C\uDFDB\uFE0F', title: 'TrumpRx.gov',
        items: [
            { check: true, text: '43 brand-name drugs' },
            { check: true, text: 'Government-negotiated prices' },
            { check: true, text: 'Free to use' },
            { check: false, text: 'Cash-pay only, no insurance' },
            { check: false, text: 'No generics' },
            { check: false, text: 'No immunosuppressants' },
            { check: false, text: 'Some exclude Medicare/Medicaid' },
        ],
    },
    {
        icon: '\uD83D\uDC8A', title: 'Our Navigator',
        items: [
            { check: true, text: '184 transplant medications' },
            { check: true, text: '65+ copay cards' },
            { check: true, text: '60+ patient assistance programs' },
            { check: true, text: 'Insurance-smart routing' },
            { check: true, text: 'Works with ALL insurance types' },
            { check: true, text: 'Immunosuppressants covered' },
            { check: true, text: 'Step-by-step how to apply' },
        ],
    },
    {
        icon: '\uD83D\uDCB0', title: 'GoodRx',
        items: [
            { check: true, text: '6,000+ medications' },
            { check: true, text: 'Generics included' },
            { check: true, text: 'Local pharmacy price compare' },
            { check: true, text: 'Partners with TrumpRx' },
            { check: false, text: 'Not transplant-specific' },
            { check: false, text: 'No insurance-smart routing' },
        ],
    },
    {
        icon: '\uD83C\uDFEA', title: 'Cost Plus Drugs',
        items: [
            { check: true, text: 'Transparent cost-plus pricing' },
            { check: true, text: 'Generics often cheapest' },
            { check: true, text: 'Mail-order delivery' },
            { check: false, text: 'Limited brand-name options' },
            { check: false, text: 'Not all transplant meds' },
            { check: false, text: 'No insurance accepted' },
        ],
    },
];

export default TrumpRx;
