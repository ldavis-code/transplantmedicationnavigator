import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, BarChart3, CheckCircle, ArrowRight, Users, Mail, FileCheck, Server, HeartPulse, ClipboardCheck, DollarSign, BookOpen, AlertTriangle, TrendingUp, Activity, Lock } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';

const ForHospitalAdmin = () => {
    useMetaTags(seoMetadata.forHospitalAdmin);

    // The full research case lives on /evidence — this page carries just the
    // headline numbers and links out, so the pitch stays scannable.
    const evidenceStats = [
        {
            stat: '23.3%',
            label: 'of liver transplant candidates face high financial burden before listing (Hepatology Communications, 2026)'
        },
        {
            stat: '~40%',
            label: 'of recipients missed a medication fill in the past year because of cost (AST patient survey, AJT 2025)'
        },
        {
            stat: '−$2K / +$15K',
            label: 'per kidney transplant: IOTA Performance Year 2 downside risk went live July 1, 2026, with graft survival as the entire quality domain'
        }
    ];

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
            title: 'Privacy-First by Design',
            description: 'Patients use the tool without accounts or personal information. Health details they enter stay in their own browser, no PHI is stored on our servers, and analytics are anonymous and aggregate-only — minimal compliance burden for your IT and legal teams.'
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

    const complianceItems = [
        'No PHI stored on our servers — health details stay in the patient\'s browser',
        'MyChart imports are patient-directed, encrypted in transit, never retained',
        'Anonymous patient access, no accounts needed',
        'Aggregate-only analytics reporting',
        'Supports CMS Conditions of Participation documentation',
        'Section 504 compliant (Rehabilitation Act)',
        'Designed to WCAG 2.1 AA accessibility standards',
        'Verified links to official manufacturer programs only'
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
                    A medication-assistance and education platform built by a liver transplant recipient who serves as Vice Chair of the OPTN Patient Affairs Committee — designed to close a documented, systemic gap in transplant medication access.
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

            {/* Backed by the Evidence */}
            <section className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-8 md:p-10 shadow-md" aria-labelledby="evidence-heading">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <BookOpen size={24} />
                    </div>
                    <h2 id="evidence-heading" className="text-xl md:text-2xl font-extrabold text-slate-900">Backed by the Evidence — and Timed to the Policy</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {evidenceStats.map((item, index) => (
                        <div key={index} className="bg-white rounded-xl border border-amber-200 p-5 text-center">
                            <div className="text-2xl md:text-3xl font-extrabold text-amber-700 mb-2 whitespace-nowrap">{item.stat}</div>
                            <p className="text-slate-700 text-sm leading-relaxed">{item.label}</p>
                        </div>
                    ))}
                </div>
                <p className="text-slate-800 leading-relaxed mb-6">
                    Two national peer-reviewed studies now document financial burden across the entire transplant journey, and their authors conclude that routine screening should be paired with <strong className="text-slate-900">targeted strategies to mitigate its impact</strong>. With IOTA tying payment to graft survival, patient education on medication affordability is the fastest lever your program controls this performance year — and screening without an operational answer is documenting risk, not managing it.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link
                        to="/evidence"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        Read the Full Evidence
                        <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                    <a
                        href="mailto:info@transplantmedicationnavigator.com?subject=IOTA%20Strategy%20Call"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-sm border-2 border-slate-200 hover:border-slate-300 transition"
                    >
                        <Mail size={18} aria-hidden="true" />
                        Book an IOTA Strategy Call
                    </a>
                </div>
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

            {/* How the Pilot Works */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">How the Pilot Works</h2>
                <div className="grid md:grid-cols-4 gap-6 mb-10">
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
                <div className="border-t border-slate-200 pt-8">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 size={20} className="text-emerald-600" aria-hidden="true" />
                        <h3 className="font-bold text-slate-900">What your pilot reporting covers</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                        {outcomesData.map((outcome, index) => (
                            <div key={index} className="flex items-center gap-3 bg-slate-50 p-4 rounded-lg">
                                <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
                                <span className="text-slate-700">{outcome}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Financial Case */}
            <section className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-8 md:p-10">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">The Financial Case</h2>
                <p className="text-emerald-200 text-center mb-8 max-w-2xl mx-auto">
                    Financial barriers drive non-adherence, graft loss, and costly readmissions. The data makes the case for intervention.
                </p>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {costImpact.map((item, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                            <div className="text-3xl md:text-4xl font-extrabold text-white mb-2">{item.stat}</div>
                            <p className="text-emerald-100 text-sm leading-relaxed">{item.label}</p>
                        </div>
                    ))}
                </div>
                <p className="text-emerald-100 leading-relaxed max-w-3xl mx-auto text-center mb-6">
                    A single graft loss costs the healthcare system over $150,000 in incremental annual costs from dialysis and re-transplant workup (Samoylova ML et al., Transplant International, 2022), and readmissions for rejection episodes driven by non-adherence cost $20,000–$50,000 per event. Connecting even a fraction of at-risk patients to programs that cut monthly out-of-pocket costs from $624 to about $10 generates measurable ROI in reduced readmissions, preserved grafts, and improved SRTR performance.
                </p>
                <p className="text-emerald-300 text-xs text-center">
                    Sources: Dew MA et al., Transplantation 2007 (PMID: 17460556); Chisholm-Burns MA et al., Clinical Transplantation 2008 (PMID: 18673373); Samoylova ML et al., Transplant International 2022 (DOI: 10.3389/ti.2022.10422); Milliman Report: 2025 U.S. Organ and Tissue Transplants (February 2025); Manufacturer copay card programs; SRTR Annual Data Report
                </p>
            </section>

            {/* Compliance & Security */}
            <section className="bg-slate-900 rounded-2xl p-8 md:p-10 text-white">
                <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck size={24} className="text-emerald-400" aria-hidden="true" />
                    <h2 className="text-2xl font-bold">Compliance & Security</h2>
                </div>
                <ul className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                    {complianceItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-slate-300 text-sm">
                            <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            {item}
                        </li>
                    ))}
                </ul>
                <p className="text-slate-400 text-sm mt-6">
                    Full privacy, security, and regulatory documentation is available in the RFI package for your IT and legal teams.
                </p>
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

            {/* Founder */}
            <section className="bg-white border-2 border-emerald-200 rounded-2xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center flex-shrink-0 mx-auto md:mx-0" aria-hidden="true">
                        <HeartPulse size={24} />
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <h2 className="text-xl font-bold text-emerald-900 mb-2">Leadership Built for Institutional Scale</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Founder Lorrinda Gray-Davis brings 20 years of enterprise operations experience, serves as Vice Chair of the OPTN Patient Affairs Committee, advises HRSA on national transplant safety standards — and is a liver transplant recipient herself. When you deploy this platform, you partner with a founder who has operated at institutional scale and lived the patient problem it solves.
                        </p>
                    </div>
                    <Link
                        to="/about"
                        className="inline-flex items-center justify-center gap-2 text-emerald-700 font-bold hover:underline flex-shrink-0"
                    >
                        Meet the founder
                        <ArrowRight size={16} aria-hidden="true" />
                    </Link>
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
