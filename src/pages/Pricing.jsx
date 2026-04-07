import { CheckCircle, Mail, Building2, CreditCard } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';

const Pricing = () => {

    useMetaTags(seoMetadata.pricing);

    const tiers = [
        {
            name: 'Enterprise',
            description: 'For hospitals & healthcare organizations',
            price: 'Custom',
            priceSubtext: 'pricing',
            color: 'indigo',
            icon: Building2,
            features: [
                'Epic MyChart integration with SMART on FHIR R4',
                'Branded patient portal with the center\'s logo and colors',
                'Patient engagement and adherence dashboard',
                'Copay card and PAP matching for full transplant medication formulary',
                'CMS/IOTA-ready compliance documentation and reporting',
                'Implementation support and transplant coordinator training',
                'Multi-organ program support (kidney, liver, heart, lung)'
            ],
            cta: 'Contact Us',
            ctaLink: 'mailto:info@transplantmedicationnavigator.com?subject=Enterprise%20Pricing%20Inquiry',
            highlighted: false
        }
    ];

    const colorClasses = {
        indigo: {
            bg: 'bg-indigo-50',
            border: 'border-indigo-200',
            icon: 'bg-indigo-100 text-indigo-600',
            button: 'bg-indigo-700 hover:bg-indigo-800',
            check: 'text-indigo-600'
        }
    };

    return (
        <article className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Hero Section */}
            <header className="text-center py-8 md:py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                    <CreditCard size={32} className="text-emerald-700" aria-hidden="true" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                    Pricing
                </h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                    Enterprise solutions for hospitals and healthcare organizations.
                </p>
            </header>

            {/* Pricing Content */}
            <div className="space-y-12">
                <>
                        {/* Pricing Tiers */}
                        <section className="max-w-lg mx-auto">
                            {tiers.map((tier, index) => {
                                const colors = colorClasses[tier.color];
                                return (
                                    <div
                                        key={index}
                                        className="relative bg-white rounded-2xl shadow-sm border-2 border-slate-200 p-6 flex flex-col"
                                    >
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
                                        <a
                                            href={tier.ctaLink}
                                            className={`${colors.button} text-white font-bold py-3 px-6 rounded-xl text-center transition flex items-center justify-center gap-2`}
                                        >
                                            <Mail size={18} aria-hidden="true" />
                                            {tier.cta}
                                        </a>
                                    </div>
                                );
                            })}
                        </section>

                        {/* Medical Disclaimer */}
                        <p className="text-center text-sm text-slate-500 max-w-2xl mx-auto">
                            This tool is designed to help you organize and understand your medications. It does not replace medical advice. Always review medication changes with your transplant team.
                        </p>

                        {/* FAQ Section */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Common Questions</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">What does Enterprise include?</h3>
                                    <p className="text-slate-600">
                                        Enterprise plans include Epic MyChart integration with SMART on FHIR R4, a branded patient portal with your center's logo and colors, patient engagement and adherence dashboards, copay card and PAP matching for your full transplant medication formulary, CMS/IOTA-ready compliance documentation and reporting, implementation support with transplant coordinator training, and multi-organ program support. Contact us to learn more.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">Is medication data private?</h3>
                                    <p className="text-slate-600">
                                        Yes. Transplant Medication Navigator does not store or access medication lists. Data stays on the device.
                                    </p>
                                </div>
                            </div>
                        </section>
                </>
            </div>

            {/* CTA */}
            <section className="text-center py-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Questions?</h2>
                <p className="text-slate-600 mb-6 max-w-xl mx-auto">
                    We're happy to help you find the right plan.
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
