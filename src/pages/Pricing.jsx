import { Link } from 'react-router-dom';
import { CreditCard, Users, CheckCircle, ArrowRight, Mail } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';

const Pricing = () => {

    useMetaTags(seoMetadata.pricing);

    const tiers = [
        {
            name: '2 Free Quizzes',
            description: 'For individual patients',
            price: '$0',
            priceSubtext: '— always free',
            color: 'emerald',
            icon: Users,
            features: [
                'Access to all educational resources and assistance program links',
                'No login required',
                'Your work is not saved'
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
                'Unlimited My Path Quizzes',
                'Unlimited medication searches',
                'Unlimited Savings Calculator estimates',
                'Save your medication lists and quiz results on your device',
                'Track your actual medication savings locally',
                'Personal copay card reminders stored on your device'
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
                'Unlimited My Path Quizzes',
                'Unlimited medication searches',
                'Unlimited Savings Calculator estimates',
                'Save your medication lists and quiz results on your device',
                'Track your actual medication savings locally',
                'Personal copay card reminders stored on your device'
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
                    Free access to education. Pro features for power users.
                </p>
            </header>

            {/* Pricing Content */}
            <div className="space-y-12">
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
                            This tool is designed to help you organize and understand your medications. It does not replace medical advice. Always review medication changes with your transplant team.
                        </p>

                        {/* Educational Mission Section */}
                        <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8">
                            <h2 className="text-2xl font-bold text-emerald-900 mb-4">Our Educational Mission & Your Premium Tools</h2>
                            <p className="text-emerald-800 leading-relaxed">
                                We are committed to providing free, accessible, and health-literate educational content to every transplant patient. Our core resources, guides, and assistance program information will always be available at no cost. The optional Pro subscription funds our mission and unlocks a powerful set of convenience tools designed to help you organize, track, and manage your medication journey more effectively. Your data is always stored locally on your own device for complete privacy.
                            </p>
                        </section>

                        {/* FAQ Section */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Common Questions</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">What's included in the Free plan?</h3>
                                    <p className="text-slate-600">
                                        The Free plan includes access to all educational resources and assistance program links. No login is required. Your work is not saved in the free plan.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">Why upgrade to Pro?</h3>
                                    <p className="text-slate-600">
                                        Pro gives you unlimited My Path Quizzes, unlimited medication searches, unlimited Savings Calculator estimates, the ability to save your medication lists and quiz results on your device, track your actual medication savings locally, and personal copay card reminders—all stored locally on your device. Choose Monthly at $8.99/month or save 26% with Yearly at $79.99/year.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">Is my medication data private?</h3>
                                    <p className="text-slate-600">
                                        Yes. With Pro, your medications are stored only on your device (in your browser), not on our servers. Transplant Medication Navigator does not store or access your medication list.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">Can I cancel my subscription?</h3>
                                    <p className="text-slate-600">
                                        Yes, you can cancel your subscription at any time. Your Pro features will remain active until the end of your billing period, and you'll still have full access to the Free plan.
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
