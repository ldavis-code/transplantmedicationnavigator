import { Link } from 'react-router-dom';
import { CreditCard, Users, Building2, Briefcase, CheckCircle, Heart, ArrowRight, Mail } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';

const Pricing = () => {
    useMetaTags(seoMetadata.pricing);

    const tiers = [
        {
            name: 'Free',
            description: 'For individual patients',
            price: '$0',
            priceSubtext: 'Always free',
            color: 'emerald',
            icon: Users,
            features: [
                'Full access to medication search',
                'All assistance program links',
                'Educational resources',
                'My Path Quiz',
                'No login required',
                'No data collected'
            ],
            cta: 'Start Searching',
            ctaLink: '/medications',
            highlighted: false
        },
        {
            name: 'Pilot Partnership',
            description: 'For transplant programs & employers',
            price: 'Contact Us',
            priceSubtext: 'for pilot pricing',
            color: 'blue',
            icon: Building2,
            features: [
                'Branded pilot landing page',
                '90-day engagement report',
                'Partner-tagged analytics',
                'Email support',
                'All patient features included',
                'Privacy-safe tracking'
            ],
            cta: 'Request a Pilot',
            ctaLink: 'mailto:partners@transplantmedicationnavigator.com?subject=Pilot%20Partnership%20Inquiry',
            highlighted: true
        },
        {
            name: 'Enterprise',
            description: 'For payers & health systems',
            price: 'Contact Us',
            priceSubtext: 'for enterprise pricing',
            color: 'purple',
            icon: Briefcase,
            features: [
                'Custom integration options',
                'API access (future)',
                'Dedicated support',
                'Custom reporting',
                'White-label options',
                'SLA agreement'
            ],
            cta: 'Contact Us',
            ctaLink: 'mailto:partners@transplantmedicationnavigator.com?subject=Enterprise%20Inquiry',
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

    return (
        <article className="max-w-6xl mx-auto space-y-12 pb-12">
            {/* Hero Section */}
            <header className="text-center py-8 md:py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                    <CreditCard size={32} className="text-emerald-700" aria-hidden="true" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                    Free for patients. Partnership options for organizations.
                </p>
            </header>

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
                            <ul className="space-y-3 mb-8 flex-grow">
                                {tier.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-start gap-2">
                                        <CheckCircle size={18} className={`${colors.check} flex-shrink-0 mt-0.5`} aria-hidden="true" />
                                        <span className="text-slate-700 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
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

            {/* Patient Promise */}
            <section className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Heart size={24} className="text-emerald-700" aria-hidden="true" />
                    <h2 className="text-xl font-bold text-emerald-900">Our Promise to Patients</h2>
                </div>
                <p className="text-emerald-800 text-lg max-w-3xl mx-auto">
                    We never charge patients. Our B2B partnerships keep the service free for those who need it most.
                </p>
            </section>

            {/* FAQ Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Common Questions</h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-slate-900 mb-2">Why is it free for patients?</h3>
                        <p className="text-slate-600">
                            Our mission is to help transplant patients access medications. We fund operations through B2B partnerships with healthcare organizations, not by charging patients or selling data.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 mb-2">What's included in a Pilot Partnership?</h3>
                        <p className="text-slate-600">
                            You get a branded landing page for your patients (e.g., /pilot/your-program), 90-day engagement analytics, and email support. Patients get the full site experience.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 mb-2">Do you collect patient data?</h3>
                        <p className="text-slate-600">
                            No. We don't require logins, and we don't collect personal health information. Our analytics track aggregate engagement (clicks, page views) without identifying individual users.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 mb-2">What's the difference between Pilot and Enterprise?</h3>
                        <p className="text-slate-600">
                            Pilot partnerships are designed for a 90-day proof of concept. Enterprise includes custom integrations, dedicated support, and options for larger deployments or API access.
                        </p>
                    </div>
                </div>
            </section>

            {/* Partner Pages Links */}
            <section className="grid md:grid-cols-3 gap-6">
                <Link
                    to="/for-transplant-programs"
                    className="bg-white p-6 rounded-xl border border-slate-200 hover:border-emerald-200 transition group"
                >
                    <Building2 size={24} className="text-emerald-600 mb-3" aria-hidden="true" />
                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-emerald-700">For Transplant Programs</h3>
                    <p className="text-slate-600 text-sm">Help patients navigate medication costs</p>
                </Link>
                <Link
                    to="/for-employers"
                    className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-200 transition group"
                >
                    <Briefcase size={24} className="text-blue-600 mb-3" aria-hidden="true" />
                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-700">For Employers</h3>
                    <p className="text-slate-600 text-sm">Reduce specialty drug costs for employees</p>
                </Link>
                <Link
                    to="/for-payers"
                    className="bg-white p-6 rounded-xl border border-slate-200 hover:border-purple-200 transition group"
                >
                    <Building2 size={24} className="text-purple-600 mb-3" aria-hidden="true" />
                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-purple-700">For Payers</h3>
                    <p className="text-slate-600 text-sm">Help members access manufacturer assistance</p>
                </Link>
            </section>

            {/* CTA */}
            <section className="text-center py-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Questions About Pricing?</h2>
                <p className="text-slate-600 mb-6 max-w-xl mx-auto">
                    We're happy to discuss options that work for your organization.
                </p>
                <a
                    href="mailto:partners@transplantmedicationnavigator.com?subject=Pricing%20Question"
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
