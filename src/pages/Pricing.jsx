import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Users, Building2, Briefcase, CheckCircle, ArrowRight, Mail, DollarSign, HeartHandshake, Shield, TrendingUp, ShieldCheck, BarChart3, Lock, Building } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';

const Pricing = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Determine initial tab from URL hash or default to 'pricing'
    const getInitialTab = () => {
        const hash = location.hash.replace('#', '');
        if (['pricing', 'transplant-programs', 'employers', 'payers'].includes(hash)) {
            return hash;
        }
        return 'pricing';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);

    // Update tab when URL hash changes
    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (['pricing', 'transplant-programs', 'employers', 'payers'].includes(hash)) {
            setActiveTab(hash);
        }
    }, [location.hash]);

    // Update URL hash when tab changes
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        navigate(`/pricing#${tabId}`, { replace: true });
    };

    useMetaTags(seoMetadata.pricing);

    const tiers = [
        {
            name: 'Free',
            description: 'For individual patients',
            price: '$0',
            priceSubtext: '— always free',
            color: 'emerald',
            icon: Users,
            features: [
                '4 My Path Quizzes',
                'All assistance program links',
                'Educational resources',
                'No login required',
                'Medication lists are not saved'
            ],
            cta: 'Start Searching',
            ctaLink: '/wizard',
            highlighted: false
        },
        {
            name: 'Monthly',
            description: 'Pro subscription',
            price: '$8.99',
            priceSubtext: 'per month',
            color: 'blue',
            icon: CreditCard,
            features: [
                'Unlimited My Path Quiz',
                'Save medications on your device',
                'Export or print your medication list',
                'Unlimited medications in Search Meds',
                'Personal copay card reminders stored on your device',
                'Track your estimated medication savings locally'
            ],
            importantNote: 'Your medication information stays on your device. Transplant Medication Navigator does not store or access your medication list.',
            cta: 'Subscribe Monthly',
            ctaLink: '/subscribe?plan=monthly',
            highlighted: true
        },
        {
            name: 'Yearly',
            description: 'Pro subscription - Save 26%',
            price: '$79.99',
            priceSubtext: 'per year',
            color: 'purple',
            icon: CreditCard,
            features: [
                'Unlimited My Path Quiz',
                'Save medications on your device',
                'Export or print your medication list',
                'Unlimited medications in Search Meds',
                'Personal copay card reminders stored on your device',
                'Track your estimated medication savings locally'
            ],
            importantNote: 'Your medication information stays on your device. Transplant Medication Navigator does not store or access your medication list.',
            cta: 'Subscribe Yearly',
            ctaLink: '/subscribe?plan=yearly',
            highlighted: false
        }
    ];

    const colorClasses = {
        emerald: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            icon: 'bg-emerald-100 text-emerald-600',
            button: 'bg-emerald-700 hover:bg-emerald-800',
            check: 'text-emerald-600'
        },
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-300',
            icon: 'bg-blue-100 text-blue-600',
            button: 'bg-blue-700 hover:bg-blue-800',
            check: 'text-blue-600'
        },
        purple: {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            icon: 'bg-purple-100 text-purple-600',
            button: 'bg-purple-700 hover:bg-purple-800',
            check: 'text-purple-600'
        }
    };

    const tabs = [
        { id: 'pricing', label: 'Pricing', icon: CreditCard },
        { id: 'transplant-programs', label: 'Transplant Programs', icon: Building2 },
        { id: 'employers', label: 'Employers', icon: Briefcase },
        { id: 'payers', label: 'Payers', icon: Building }
    ];

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => handleTabChange(id)}
            role="tab"
            id={`${id}-tab`}
            aria-selected={activeTab === id}
            aria-controls={`${id}-panel`}
            tabIndex={activeTab === id ? 0 : -1}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-sm md:text-base transition-all border-b-4 min-h-[44px] whitespace-nowrap
                ${activeTab === id
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                    : 'border-transparent text-slate-700 hover:text-emerald-600 hover:bg-slate-50'
                }`}
        >
            <Icon size={18} aria-hidden="true" />
            <span className="hidden md:inline">{label}</span>
            <span className="md:hidden">{label.split(' ')[0]}</span>
        </button>
    );

    // Partner page data
    const transplantProgramsValueProps = [
        {
            icon: TrendingUp,
            title: 'Help Patients Afford Their Medicine',
            description: 'Help patients find free medicine programs, copay cards, and grants before cost makes them skip doses.'
        },
        {
            icon: ShieldCheck,
            title: 'Real Programs, Not Scams',
            description: 'Every program is checked. We link to real company and foundation sites only. No scams.'
        },
        {
            icon: BarChart3,
            title: 'See How Patients Use It',
            description: 'Track which programs patients click on. No private health info is collected. See what works.'
        },
        {
            icon: Lock,
            title: 'No Patient Data Stored',
            description: 'Patients do not need to log in or give private health info. No extra work for your team.'
        }
    ];

    const trackingCapabilities = [
        'Page views by pilot partner tag',
        'Clicks to medication search',
        'Clicks to assistance program links',
        'Applications initiated (outbound clicks)',
        'Program types most accessed',
        'Engagement over 90-day pilot period'
    ];

    const employerValueProps = [
        {
            icon: DollarSign,
            title: 'Lower Drug Costs',
            description: 'Help workers find copay cards and free drug programs. This cuts what they pay for costly transplant drugs.'
        },
        {
            icon: HeartHandshake,
            title: 'Find Copay Cards & Grants',
            description: 'Help workers get real help programs. These can pay for copays or even full drug costs.'
        },
        {
            icon: Shield,
            title: 'Works With Your Current Plan',
            description: 'This works with your drug plan. We help workers find extra savings. We do not replace your benefits.'
        },
        {
            icon: Lock,
            title: 'No Login Needed',
            description: 'Workers get help right away. No accounts, no apps, no private info asked. Easy to use.'
        }
    ];

    const employerBenefits = [
        'Workers pay less for their drugs',
        'Lower drug costs through free programs',
        'Workers take their drugs as they should',
        'No worker health data is stored',
        'No setup needed with your current plan',
        'Easy to share through HR or your benefits site'
    ];

    const payerValueProps = [
        {
            icon: DollarSign,
            title: 'Lower Drug Costs for Members',
            description: 'Help members find free drug programs. This can lower what they pay and cut claims for costly drugs.'
        },
        {
            icon: Users,
            title: 'Easy for Members to Use',
            description: 'Members can get help without an app, an account, or a phone call. Just open the website.'
        },
        {
            icon: BarChart3,
            title: 'See How Members Use It',
            description: 'Track how members use the tool. No private health info is stored. Get reports on usage.'
        },
        {
            icon: Lock,
            title: 'No App Needed',
            description: 'Works on any phone or computer. Members get help fast. No downloads needed.'
        }
    ];

    const payerOutcomes = [
        'Members find copay help from drug makers',
        'Members find free drug programs',
        'Members pay less for their drugs',
        'Lower claims from free drug programs',
        'Members are happier with their plan',
        'Helpful info on how insurance works'
    ];

    return (
        <article className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Hero Section */}
            <header className="text-center py-8 md:py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                    <CreditCard size={32} className="text-emerald-700" aria-hidden="true" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                    Pricing & Partners
                </h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                    Free access to education. Partnership options for organizations.
                </p>
            </header>

            {/* Tab Navigation */}
            <nav className="bg-white rounded-xl shadow-sm border border-slate-200 p-2" role="tablist" aria-label="Pricing and partner sections">
                <div className="flex overflow-x-auto gap-1">
                    {tabs.map((tab) => (
                        <TabButton key={tab.id} id={tab.id} label={tab.label} icon={tab.icon} />
                    ))}
                </div>
            </nav>

            {/* Tab Content */}
            <div role="tabpanel" id={`${activeTab}-panel`} aria-labelledby={`${activeTab}-tab`} className="space-y-12">
                {/* Pricing Tab */}
                {activeTab === 'pricing' && (
                    <>
                        {/* Pricing Tiers */}
                        <section className="grid md:grid-cols-3 gap-6">
                            {tiers.map((tier, index) => {
                                const colors = colorClasses[tier.color];
                                return (
                                    <div
                                        key={index}
                                        className={`relative bg-white rounded-2xl shadow-sm border-2 ${tier.highlighted ? colors.border + ' ring-2 ring-blue-200' : 'border-slate-200'} p-6 flex flex-col`}
                                    >
                                        {tier.highlighted && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                Most Popular
                                            </div>
                                        )}
                                        <div className={`w-12 h-12 ${colors.icon} rounded-full flex items-center justify-center mb-4`} aria-hidden="true">
                                            <tier.icon size={24} />
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-1">{tier.name}</h2>
                                        <p className="text-slate-600 text-sm mb-4">{tier.description}</p>
                                        <div className="mb-6">
                                            <span className="text-3xl font-bold text-slate-900">{tier.price}</span>
                                            <span className="text-slate-500 text-sm ml-2">{tier.priceSubtext}</span>
                                        </div>
                                        <ul className="space-y-3 mb-6 flex-grow">
                                            {tier.features.map((feature, fIndex) => (
                                                <li key={fIndex} className="flex items-start gap-2">
                                                    <CheckCircle size={18} className={`${colors.check} flex-shrink-0 mt-0.5`} aria-hidden="true" />
                                                    <span className="text-slate-700 text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {tier.importantNote && (
                                            <p className="text-xs text-slate-500 mb-6 italic">
                                                {tier.importantNote}
                                            </p>
                                        )}
                                        {tier.ctaLink.startsWith('mailto:') ? (
                                            <a
                                                href={tier.ctaLink}
                                                className={`${colors.button} text-white font-bold py-3 px-6 rounded-xl text-center transition flex items-center justify-center gap-2`}
                                            >
                                                <Mail size={18} aria-hidden="true" />
                                                {tier.cta}
                                            </a>
                                        ) : (
                                            <Link
                                                to={tier.ctaLink}
                                                className={`${colors.button} text-white font-bold py-3 px-6 rounded-xl text-center transition flex items-center justify-center gap-2`}
                                            >
                                                {tier.cta}
                                                <ArrowRight size={18} aria-hidden="true" />
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </section>

                        {/* Medical Disclaimer */}
                        <p className="text-center text-sm text-slate-500 max-w-2xl mx-auto">
                            This tool helps you find and track your drugs. It does not replace your doctor. Always talk to your transplant team about drug changes.
                        </p>

                        {/* FAQ Section */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Common Questions</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">What do I get for free?</h3>
                                    <p className="text-slate-600">
                                        Free gives you 4 My Path Quizzes, all help program links, and things to read and learn. No login needed. Drug lists are not saved.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">Why pay for Pro?</h3>
                                    <p className="text-slate-600">
                                        Pro gives you unlimited quizzes. You can save your drug list on your phone or computer. You can print or export your list. You get reminders for copay cards and can track your savings. Pick Monthly at $8.99/month or save 26% with Yearly at $79.99/year.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">Is my drug info private?</h3>
                                    <p className="text-slate-600">
                                        Yes. With Pro, your drugs are saved only on your device, not on our servers. We do not store or see your drug list.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">Can I cancel?</h3>
                                    <p className="text-slate-600">
                                        Yes, you can cancel any time. You keep Pro features until your paid time ends. Then you still have full access to the Free plan.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {/* Transplant Programs Tab */}
                {activeTab === 'transplant-programs' && (
                    <>
                        {/* Hero */}
                        <section className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                                <Building2 size={32} className="text-emerald-700" aria-hidden="true" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">
                                Help Your Patients Pay for Medicine
                            </h2>
                            <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-8">
                                Give transplant patients a free, trusted tool to find help programs. Make it easier for them to afford their drugs.
                            </p>
                            <a
                                href="mailto:info@transplantmedicationnavigator.com?subject=Pilot%20Program%20Request"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
                            >
                                <Mail size={20} aria-hidden="true" />
                                Request a Pilot
                            </a>
                        </section>

                        {/* Value Props */}
                        <section className="grid md:grid-cols-2 gap-6">
                            {transplantProgramsValueProps.map((prop, index) => (
                                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-100 transition">
                                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
                                        <prop.icon size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{prop.title}</h3>
                                    <p className="text-slate-600">{prop.description}</p>
                                </div>
                            ))}
                        </section>

                        {/* What You Can Track */}
                        <section className="bg-slate-50 rounded-2xl p-8 md:p-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-emerald-100 p-2 rounded-lg" aria-hidden="true">
                                    <BarChart3 size={24} className="text-emerald-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">What You Can Report</h3>
                            </div>
                            <p className="text-slate-600 mb-6">
                                With a pilot partnership, you receive a 90-day engagement report showing:
                            </p>
                            <div className="grid md:grid-cols-2 gap-3">
                                {trackingCapabilities.map((capability, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                                        <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
                                        <span className="text-slate-700">{capability}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* How It Works */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10">
                            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">How the Pilot Works</h3>
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">1</div>
                                    <h4 className="font-bold text-slate-900 mb-2">Get Your Pilot URL</h4>
                                    <p className="text-slate-600 text-sm">We create a branded landing page for your program (e.g., /pilot/your-program)</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">2</div>
                                    <h4 className="font-bold text-slate-900 mb-2">Share With Patients</h4>
                                    <p className="text-slate-600 text-sm">Give patients the link via discharge materials, patient portals, or social workers</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">3</div>
                                    <h4 className="font-bold text-slate-900 mb-2">Review Engagement</h4>
                                    <p className="text-slate-600 text-sm">After 90 days, receive a detailed report on patient engagement with resources</p>
                                </div>
                            </div>
                        </section>

                        {/* For Patients Callout */}
                        <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Users size={24} className="text-emerald-700" aria-hidden="true" />
                                <h3 className="text-xl font-bold text-emerald-900">What Patients See</h3>
                            </div>
                            <p className="text-emerald-800 mb-6 max-w-2xl mx-auto">
                                Patients can search for drugs, find help programs, and learn for free. No login needed.
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-emerald-700 font-medium hover:underline"
                            >
                                Preview the patient experience
                                <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                        </section>
                    </>
                )}

                {/* Employers Tab */}
                {activeTab === 'employers' && (
                    <>
                        {/* Hero */}
                        <section className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                                <Briefcase size={32} className="text-blue-700" aria-hidden="true" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">
                                Help Workers Pay Less for Transplant Drugs
                            </h2>
                            <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-8">
                                Help workers find copay cards, free drug programs, and grants. This works with your current drug plan.
                            </p>
                            <a
                                href="mailto:info@transplantmedicationnavigator.com?subject=Employer%20Partnership%20Inquiry"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
                            >
                                <Mail size={20} aria-hidden="true" />
                                Learn More
                            </a>
                        </section>

                        {/* Value Props */}
                        <section className="grid md:grid-cols-2 gap-6">
                            {employerValueProps.map((prop, index) => (
                                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-100 transition">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
                                        <prop.icon size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{prop.title}</h3>
                                    <p className="text-slate-600">{prop.description}</p>
                                </div>
                            ))}
                        </section>

                        {/* Benefits List */}
                        <section className="bg-slate-50 rounded-2xl p-8 md:p-10">
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Employer Benefits</h3>
                            <div className="grid md:grid-cols-2 gap-3">
                                {employerBenefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg">
                                        <CheckCircle size={20} className="text-blue-600 flex-shrink-0" aria-hidden="true" />
                                        <span className="text-slate-700">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* How It Works */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10">
                            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">How It Works</h3>
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">1</div>
                                    <h4 className="font-bold text-slate-900 mb-2">Share the Resource</h4>
                                    <p className="text-slate-600 text-sm">Add the link to your benefits website or HR emails</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">2</div>
                                    <h4 className="font-bold text-slate-900 mb-2">Employees Search</h4>
                                    <p className="text-slate-600 text-sm">Workers search for their drugs and find help programs</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">3</div>
                                    <h4 className="font-bold text-slate-900 mb-2">Lower Costs</h4>
                                    <p className="text-slate-600 text-sm">Workers apply for copay cards and free programs. This lowers costs for them and for you.</p>
                                </div>
                            </div>
                        </section>

                        {/* Use Case */}
                        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Real Help for Transplant Workers</h3>
                            <p className="text-slate-700 leading-relaxed mb-4">
                                Transplant patients take 3-5 drugs every day for life. These drugs can cost hundreds or thousands per month. Even with good insurance, copays add up fast.
                            </p>
                            <p className="text-slate-700 leading-relaxed">
                                By helping workers find copay cards and free drug programs, you help them save money. This also lowers costs for your company. Everyone wins.
                            </p>
                        </section>

                        {/* For Employees Callout */}
                        <section className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Users size={24} className="text-blue-700" aria-hidden="true" />
                                <h3 className="text-xl font-bold text-blue-900">What Employees See</h3>
                            </div>
                            <p className="text-blue-800 mb-6 max-w-2xl mx-auto">
                                Workers can search for drugs, find help programs, and learn for free. No login needed.
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-blue-700 font-medium hover:underline"
                            >
                                Preview the employee experience
                                <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                        </section>
                    </>
                )}

                {/* Payers Tab */}
                {activeTab === 'payers' && (
                    <>
                        {/* Hero */}
                        <section className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                                <Building size={32} className="text-purple-700" aria-hidden="true" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">
                                Help Members Find Drug Help Programs
                            </h2>
                            <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-8">
                                Lower costs for transplant drugs. Help members find free programs and grants from drug makers.
                            </p>
                            <a
                                href="mailto:info@transplantmedicationnavigator.com?subject=Payer%20Demo%20Request"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
                            >
                                <Mail size={20} aria-hidden="true" />
                                Request Demo
                            </a>
                        </section>

                        {/* Value Props */}
                        <section className="grid md:grid-cols-2 gap-6">
                            {payerValueProps.map((prop, index) => (
                                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-100 transition">
                                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
                                        <prop.icon size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{prop.title}</h3>
                                    <p className="text-slate-600">{prop.description}</p>
                                </div>
                            ))}
                        </section>

                        {/* Outcomes */}
                        <section className="bg-slate-50 rounded-2xl p-8 md:p-10">
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Member Outcomes</h3>
                            <div className="grid md:grid-cols-2 gap-3">
                                {payerOutcomes.map((outcome, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg">
                                        <CheckCircle size={20} className="text-purple-600 flex-shrink-0" aria-hidden="true" />
                                        <span className="text-slate-700">{outcome}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* How It Works */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10">
                            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">How It Works</h3>
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">1</div>
                                    <h4 className="font-bold text-slate-900 mb-2">Add the Link</h4>
                                    <p className="text-slate-600 text-sm">Add the link to your member website or mailings</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">2</div>
                                    <h4 className="font-bold text-slate-900 mb-2">Members Search</h4>
                                    <p className="text-slate-600 text-sm">Members search for their drugs and find help programs on their own</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">3</div>
                                    <h4 className="font-bold text-slate-900 mb-2">See the Results</h4>
                                    <p className="text-slate-600 text-sm">Get reports that show how members use the tool and which programs they find</p>
                                </div>
                            </div>
                        </section>

                        {/* Compliance Note */}
                        <section className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield size={24} className="text-purple-700" aria-hidden="true" />
                                <h3 className="text-xl font-bold text-slate-900">Privacy & Safety</h3>
                            </div>
                            <p className="text-slate-700 leading-relaxed mb-4">
                                We do not store any private health info. Members use the tool without making an account. No personal info is needed.
                            </p>
                            <p className="text-slate-700 leading-relaxed">
                                The tool gives helpful info and links to real drug maker programs. Members apply with drug makers, not through us.
                            </p>
                        </section>

                        {/* For Members Callout */}
                        <section className="bg-purple-50 border border-purple-200 rounded-2xl p-8 text-center">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Users size={24} className="text-purple-700" aria-hidden="true" />
                                <h3 className="text-xl font-bold text-purple-900">What Members See</h3>
                            </div>
                            <p className="text-purple-800 mb-6 max-w-2xl mx-auto">
                                Members can search for drugs, find help programs, and learn for free. No login needed.
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-purple-700 font-medium hover:underline"
                            >
                                Preview the member experience
                                <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                        </section>
                    </>
                )}
            </div>

            {/* CTA - Always Visible */}
            <section className="text-center py-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Questions?</h2>
                <p className="text-slate-600 mb-6 max-w-xl mx-auto">
                    We're happy to discuss options that work for your organization.
                </p>
                <a
                    href="mailto:info@transplantmedicationnavigator.com?subject=Pricing%20Question"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
                >
                    <Mail size={20} aria-hidden="true" />
                    Contact Us
                </a>
            </section>
        </article>
    );
};

export default Pricing;
