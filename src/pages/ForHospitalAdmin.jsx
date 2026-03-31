import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, BarChart3, Lock, CheckCircle, ArrowRight, Users, TrendingUp, Mail, Activity, FileCheck, Server, HeartPulse, ClipboardCheck, DollarSign } from 'lucide-react';
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
            description: 'No PHI is collected, stored, or transmitted. Patients use the tool without accounts or personal information. Zero BAA required for educational use—no compliance burden for your IT or legal teams.'
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
            description: 'Hospital administrators get a dedicated dashboard with engagement analytics, patient resource utilization, and pilot reporting—all aggregate, all privacy-safe.'
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
            stat: '25-35%',
            label: 'Non-adherence rate among transplant recipients citing cost as primary barrier (Milliman, 2023)'
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
                    Protect Graft Survival by Removing Medication Cost Barriers
                </h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                    A HIPAA-compliant, Epic-integrated medication assistance tool that supports SRTR outcomes, reduces readmissions, and strengthens CMS compliance documentation.
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
                    Sources: Milliman Research Report (2023); manufacturer copay card programs; SRTR Annual Data Report
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
                    Milliman actuarial analysis estimates that targeted financial navigation for transplant recipients can reduce total cost of care by helping sustain medication adherence during the critical first year post-transplant.
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
                                Anonymous patient access—no accounts needed
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
                    Patients get a simple, accessible interface to search 184+ transplant medications, find copay cards and assistance programs, and access educational content—no login required.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-emerald-700 font-medium hover:underline"
                >
                    Preview the patient experience
                    <ArrowRight size={16} aria-hidden="true" />
                </Link>
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
