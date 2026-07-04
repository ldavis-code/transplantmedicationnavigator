import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, BarChart3, Lock, CheckCircle, ArrowRight, Users, TrendingUp, Mail, Activity, FileCheck, Server, HeartPulse, ClipboardCheck, DollarSign, BookOpen, AlertTriangle, GraduationCap } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';

const ForHospitalAdmin = () => {
    useMetaTags(seoMetadata.forHospitalAdmin);

    const valueProps = [
        {
            icon: TrendingUp,
            title: 'Improve SRTR Outcomes Metrics',
            description: 'Medication non-adherence is the leading modifiable cause of graft loss. Connecting patients to assistance programs before cost becomes a barrier directly supports graft survival and your program\'s SRTR performance.'
        },
        {
            icon: Activity,
            title: 'Reduce Preventable Readmissions',
            description: 'Patients who can\'t afford immunosuppressants end up back in the hospital. Financial navigation at discharge reduces cost-driven non-adherence and the readmissions that follow.'
        },
        {
            icon: FileCheck,
            title: 'Strengthen CMS Documentation Compliance',
            description: 'CMS Conditions of Participation require transplant programs to document patient education and financial planning. This tool provides a trackable, standardized resource that supports your compliance documentation.'
        },
        {
            icon: Lock,
            title: 'HIPAA-Compliant by Design',
            description: 'No PHI is collected, stored, or transmitted. Patients use the tool without accounts or personal information. Zero BAA required for educational use, no compliance burden for your IT or legal teams.'
        }
    ];

    const integrationFeatures = [
        {
            icon: Server,
            title: 'Epic MyChart Integration',
            description: 'Available through Epic Connection Hub. Patients can access medication assistance directly from MyChart, meeting them where they already manage their health.'
        },
        {
            icon: HeartPulse,
            title: 'Discharge Workflow Integration',
            description: 'Provide a branded URL or QR code for discharge packets. Social workers and transplant coordinators can share the resource during the discharge education process.'
        },
        {
            icon: ClipboardCheck,
            title: 'White-Label Admin Dashboard',
            description: 'Hospital administrators get a dedicated dashboard with engagement analytics, patient resource utilization, and pilot reporting, all aggregate, all privacy-safe.'
        }
    ];

    const outcomesData = [
        'Graft survival support through medication access',
        'Reduced cost-driven non-adherence post-transplant',
        'Trackable patient education for CMS documentation',
        'Aggregate engagement data for quality improvement',
        'Social worker and coordinator workflow support',
        'No IT integration required for basic deployment'
    ];

    const costImpact = [
        {
            stat: '$624',
            label: 'Average monthly out-of-pocket cost for immunosuppressants without assistance'
        },
        {
            stat: '$10',
            label: 'Typical monthly cost with copay card enrollment'
        },
        {
            stat: '~36%',
            label: 'of graft losses are associated with immunosuppressant non-adherence, the leading modifiable cause of transplant failure (Dew MA et al., Transplantation, 2007)'
        }
    ];

    return (
        <article className="max-w-5xl mx-auto space-y-12 pb-12">
            {/* Hero Section */}
            <header className="text-center py-8 md:py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                    <Building2 size={32} className="text-emerald-700" aria-hidden="true" />
                </div>
                <p className="text-emerald-700 font-semibold text-lg mb-2">For Hospital Administrators & Transplant Coordinators</p>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                    Built at the Intersection of Patient Experience and Health Policy
                </h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                    This platform was developed by a liver transplant recipient who serves as Vice Chair of the OPTN Patient Affairs Committee and holds a seat at the national table where transplant policy is made. TransplantMedicationNavigator isn't a software product, it's a policy intervention, built to address a documented, systemic gap in post-transplant care and CMS-recognized medication access barriers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="mailto:info@transplantmedicationnavigator.com?subject=Hospital%20Partnership%20Inquiry"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
                    >
                        <Mail size={20} aria-hidden="true" />
                        Schedule a Demo
                    </a>
                    <Link
                        to="/pilot"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-emerald-700 font-bold rounded-xl shadow-sm border-2 border-emerald-200 hover:border-emerald-300 transition"
                    >
                        View Pilot Program
                        <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                </div>
            </header>

            {/* IOTA PY2 Urgency Banner */}
            <section className="bg-gradient-to-br from-rose-50 to-red-50 border-2 border-rose-300 rounded-2xl p-8 md:p-10 shadow-md" aria-labelledby="iota-heading">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <AlertTriangle size={24} />
                    </div>
                    <h2 id="iota-heading" className="text-xl md:text-2xl font-extrabold text-slate-900">IOTA Performance Year 2 Is Here. Downside Risk Is Now Live.</h2>
                </div>
                <p className="text-slate-800 leading-relaxed mb-4">
                    On July 1, 2026, the CMS Increasing Organ Transplant Access (IOTA) Model entered Performance Year 2, and the upside-only year ended. Participating kidney transplant hospitals that score 40 or below now owe CMS up to $2,000 per kidney transplant, while programs scoring 60 or above can earn up to $15,000 per transplant. The June 2026 final rule also expanded downside payments to include Medicare Advantage beneficiaries, so more of your transplant volume now counts toward that exposure.
                </p>
                <p className="text-slate-800 leading-relaxed mb-6">
                    Composite graft survival is the model's entire quality domain, worth up to 20 of 100 points and scored against peer percentiles. Medication non-adherence is the leading modifiable cause of graft loss, which makes patient education on medication affordability the fastest lever your program controls this performance year.
                </p>
                <div className="bg-white rounded-xl border border-rose-200 p-6 mb-6">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <GraduationCap size={20} className="text-rose-700" aria-hidden="true" />
                        How patient education moves your IOTA score, starting this quarter
                    </h3>
                    <ul className="space-y-3 text-slate-700">
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <span><strong>At discharge:</strong> put medication cost education in every discharge packet with a branded URL or QR code, so no patient leaves without a clear path to affording their immunosuppressants.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <span><strong>In clinic:</strong> give coordinators and social workers one standardized tool to connect patients to copay cards, patient assistance programs, and foundation grants before a missed refill becomes a rejection episode.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <span><strong>At the quality table:</strong> bring aggregate engagement reporting to QAPI and IOTA strategy reviews as documented evidence that your program is actively removing the cost barrier to adherence.</span>
                        </li>
                    </ul>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <a
                        href="mailto:info@transplantmedicationnavigator.com?subject=IOTA%20Strategy%20Call"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        <Mail size={18} aria-hidden="true" />
                        Book an IOTA Strategy Call
                    </a>
                    <p className="text-slate-500 text-xs leading-relaxed">
                        Sources:{' '}
                        <a href="https://www.cms.gov/priorities/innovation/innovation-models/iota" target="_blank" rel="noopener noreferrer" className="text-rose-700 hover:text-rose-900 underline">CMS IOTA Model</a>
                        {' '}and the{' '}
                        <a href="https://www.cms.gov/priorities/innovation/increasing-organ-transplant-access-performance-year-2-model-update-quick-reference" target="_blank" rel="noopener noreferrer" className="text-rose-700 hover:text-rose-900 underline">IOTA PY2 Model Update Quick Reference</a>
                        {' '}(June 2026 final rule).
                    </p>
                </div>
            </section>

            {/* AST Study Citation Banner */}
            <section className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-8 md:p-10 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <BookOpen size={24} />
                    </div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">Landmark Study: The Urgent Need for New Treatments</h2>
                </div>
                <blockquote className="border-l-4 border-amber-400 pl-6 py-2 mb-5">
                    <p className="text-slate-800 text-lg leading-relaxed italic">
                        "The AST Therapeutic Needs Study (Taber et al., 2025), the largest patient survey of its kind, representing 10,091 transplant recipients across 232 centers, concluded that immunosuppression <strong className="text-slate-900">'induces a heavy toll on transplant recipients'</strong> and that there is <strong className="text-slate-900">'an urgent need for new treatments to address these unmet needs.'</strong> With <strong className="text-slate-900">40% of recipients skipping doses due to cost.</strong>"
                    </p>
                </blockquote>
                <p className="text-slate-600 text-sm leading-relaxed">
                    <span className="font-semibold text-slate-700">Citation:</span> Taber DJ, Gordon EJ, Myaskovsky L, et al. Therapeutic needs in solid organ transplant recipients: The American Society of Transplantation patient survey. <em>American Journal of Transplantation.</em> 2025;25:2565–2577.{' '}
                    <a
                        href="https://doi.org/10.1016/j.ajt.2025.07.2474"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-700 hover:text-amber-900 underline font-medium"
                    >
                        https://doi.org/10.1016/j.ajt.2025.07.2474
                    </a>
                </p>
            </section>

            {/* Cost Impact Stats */}
            <section className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-8 md:p-10">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">The Cost of Medication Non-Adherence</h2>
                <p className="text-emerald-200 text-center mb-8 max-w-2xl mx-auto">
                    Financial barriers drive non-adherence, graft loss, and costly readmissions. The data makes the case for intervention.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                    {costImpact.map((item, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                            <div className="text-3xl md:text-4xl font-extrabold text-white mb-2">{item.stat}</div>
                            <p className="text-emerald-100 text-sm leading-relaxed">{item.label}</p>
                        </div>
                    ))}
                </div>
                <p className="text-emerald-300 text-xs text-center mt-6">
                    Sources: Dew MA et al., Transplantation 2007 (PMID: 17460556); Chisholm-Burns MA et al., Clinical Transplantation 2008 (PMID: 18673373); Samoylova ML et al., Transplant International 2022 (DOI: 10.3389/ti.2022.10422); Milliman Report: 2025 U.S. Organ and Tissue Transplants (February 2025); Manufacturer copay card programs; SRTR Annual Data Report
                </p>
            </section>

            {/* Value Props */}
            <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">How This Supports Your Program</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {valueProps.map((prop, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-100 transition">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
                                <prop.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{prop.title}</h3>
                            <p className="text-slate-600">{prop.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Integration & Deployment */}
            <section className="bg-slate-50 rounded-2xl p-8 md:p-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Integration & Deployment</h2>
                <p className="text-slate-600 text-center mb-8 max-w-2xl mx-auto">
                    Designed to fit into existing hospital workflows with minimal IT burden.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                    {integrationFeatures.map((feature, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl border border-slate-200">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                                <feature.icon size={20} />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                            <p className="text-slate-600 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Measurable Outcomes */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-100 p-2 rounded-lg" aria-hidden="true">
                        <BarChart3 size={24} className="text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Measurable Outcomes</h2>
                </div>
                <p className="text-slate-600 mb-6">
                    With a pilot partnership, your program receives engagement reporting that maps to quality metrics:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                    {outcomesData.map((outcome, index) => (
                        <div key={index} className="flex items-center gap-3 bg-slate-50 p-4 rounded-lg">
                            <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
                            <span className="text-slate-700">{outcome}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ROI Case */}
            <section className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                    <DollarSign size={24} className="text-emerald-700" aria-hidden="true" />
                    <h2 className="text-xl font-bold text-slate-900">The Financial Case</h2>
                </div>
                <p className="text-slate-700 leading-relaxed mb-4">
                    A single graft loss costs the healthcare system $100,000-$250,000+ in dialysis, re-listing, and re-transplantation. Readmissions for rejection episodes driven by non-adherence cost $20,000-$50,000 per event. CMS penalties for excess readmissions compound these costs further.
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                    Connecting even a fraction of at-risk patients to manufacturer assistance programs that eliminate the cost barrier to adherence generates measurable ROI in reduced readmissions, preserved grafts, and improved SRTR performance.
                </p>
                <p className="text-slate-700 leading-relaxed">
                    A single graft loss costs the healthcare system over $150,000 in incremental annual costs from dialysis and re-transplant workup (Samoylova ML et al., Transplant International, 2022). Connecting even a fraction of at-risk patients to manufacturer assistance programs, which can reduce monthly out-of-pocket costs from $624 to under $15, represents a compelling return on investment for any transplant program.
                </p>
            </section>

            {/* How the Pilot Works */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">How the Pilot Works</h2>
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">1</div>
                        <h3 className="font-bold text-slate-900 mb-2">Discovery Call</h3>
                        <p className="text-slate-600 text-sm">We assess your program's needs, patient population, and existing workflows</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">2</div>
                        <h3 className="font-bold text-slate-900 mb-2">Branded Deployment</h3>
                        <p className="text-slate-600 text-sm">Your program gets a custom-branded landing page and admin dashboard</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">3</div>
                        <h3 className="font-bold text-slate-900 mb-2">90-Day Pilot</h3>
                        <p className="text-slate-600 text-sm">Share with patients via discharge materials, social workers, or Epic MyChart</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">4</div>
                        <h3 className="font-bold text-slate-900 mb-2">Outcomes Report</h3>
                        <p className="text-slate-600 text-sm">Receive a detailed engagement report with quality metrics alignment</p>
                    </div>
                </div>
            </section>

            {/* Compliance & Security */}
            <section className="bg-slate-900 rounded-2xl p-8 md:p-10 text-white">
                <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck size={24} className="text-emerald-400" aria-hidden="true" />
                    <h2 className="text-2xl font-bold">Compliance & Security</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-bold text-emerald-400 mb-2">HIPAA Compliance</h3>
                        <ul className="space-y-2 text-slate-300 text-sm">
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                No PHI collected, stored, or transmitted
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                No BAA required for educational use
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                Anonymous patient access, no accounts needed
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                Aggregate-only analytics reporting
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-emerald-400 mb-2">CMS & Regulatory</h3>
                        <ul className="space-y-2 text-slate-300 text-sm">
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                Supports CMS Conditions of Participation documentation
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                Section 504 compliant (Rehabilitation Act)
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                WCAG 2.1 AAA accessibility standards
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                Verified links to official manufacturer programs only
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Patient Experience Preview */}
            <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Users size={24} className="text-emerald-700" aria-hidden="true" />
                    <h2 className="text-xl font-bold text-emerald-900">What Your Patients See</h2>
                </div>
                <p className="text-emerald-800 mb-6 max-w-2xl mx-auto">
                    Patients get a simple, accessible interface to search 200+ transplant medications, find copay cards and assistance programs, and access educational content, no login required.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-emerald-700 font-medium hover:underline"
                >
                    Preview the patient experience
                    <ArrowRight size={16} aria-hidden="true" />
                </Link>
            </section>

            {/* Founder Leadership */}
            <section className="bg-white border-2 border-emerald-200 rounded-2xl p-8 md:p-10">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <HeartPulse size={24} className="text-emerald-700" aria-hidden="true" />
                    <h2 className="text-xl font-bold text-emerald-900">Leadership Built for Institutional Scale</h2>
                </div>
                <div className="max-w-3xl mx-auto space-y-4">
                    <p className="text-slate-700 leading-relaxed">
                        Before founding Transplant Medication Navigator, Lorrinda Gray-Davis spent 20 years in enterprise operations as Executive Director of Diversity for Perini Building Company, directing more than $1 billion to diverse contractors across $8.6B and $4.5B capital programs — work ranked among the top 25 programs in the country, reporting directly to CEOs, and recognized by Congress.
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                        Today she serves as Vice Chair of the OPTN Patient Affairs Committee and advises HRSA on national transplant safety standards — seats at the national tables where transplant policy is made. Her own liver transplant is the origin of this platform, not the credential: since March 2020 she has led a daily peer support program for transplant patients and caregivers — every day, without missing a single one — supporting more than 540 people, more than 190 of whom have gone on to receive transplants, with results published in peer-reviewed medical journals.
                    </p>
                    <p className="text-slate-700 leading-relaxed font-medium">
                        When you deploy this platform, you are partnering with a founder who has operated at institutional scale and lived the patient problem it solves.
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="text-center py-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to Improve Outcomes for Your Program?</h2>
                <p className="text-slate-600 mb-6 max-w-xl mx-auto">
                    Contact us to schedule a demo and discuss how we can support your transplant program's quality metrics and patient outcomes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="mailto:info@transplantmedicationnavigator.com?subject=Hospital%20Administrator%20Demo%20Request"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
                    >
                        <Mail size={20} aria-hidden="true" />
                        Schedule a Demo
                    </a>
                    <a
                        href="mailto:info@transplantmedicationnavigator.com?subject=Hospital%20Pilot%20RFI"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-sm border-2 border-slate-200 hover:border-slate-300 transition"
                    >
                        Request RFI Package
                    </a>
                </div>
            </section>
        </article>
    );
};

export default ForHospitalAdmin;
