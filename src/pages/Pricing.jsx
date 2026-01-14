import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Users, CheckCircle, ArrowRight, Mail, ShieldCheck, Building2 } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';

const Pricing = () => {

    useMetaTags(seoMetadata.pricing);
    const [billingPeriod, setBillingPeriod] = useState('yearly');

    const tiers = [
        {
            name: 'Free',
            description: 'For individual patients',
            price: '$0',
            priceSubtext: '— always free',
            color: 'emerald',
            icon: Users,
            features: [
                '1 Free Quiz',
                '1 Free Savings Calculator use',
                'Access to all educational resources and assistance program links',
                'No login required',
                'Your work is not saved'
            ],
            cta: 'Start Searching',
            ctaLink: '/wizard',
            highlighted: false
        },
        {
            name: 'Pro',
            description: billingPeriod === 'yearly' ? 'Pro subscription - Save 26%' : 'Pro subscription',
            price: billingPeriod === 'yearly' ? '$79.99' : '$8.99',
            priceSubtext: billingPeriod === 'yearly' ? 'per year' : 'per month',
            color: 'blue',
            icon: CreditCard,
            features: [
                'Unlimited My Path Quizzes — update anytime when your situation changes',
                'Unlimited medication searches',
                'Unlimited Savings Calculator estimates',
                'Savings Dashboard — visual proof of how much you\'ve saved',
                'Track Your Actual Savings — document monthly savings to prove ROI',
                'Copay Card Renewal Reminders — never miss an annual expiration',
                'Medication Calendar — track when PAP applications need renewal',
                'Save your medication lists and quiz results on your device'
            ],
            importantNote: 'Your medication information stays on your device. Transplant Medication Navigator does not store or access your medication list.',
            moneyBackGuarantee: true,
            cta: billingPeriod === 'yearly' ? 'Subscribe Yearly' : 'Subscribe Monthly',
            ctaLink: billingPeriod === 'yearly' ? '/subscribe?plan=yearly' : '/subscribe?plan=monthly',
            highlighted: true,
            hasBillingToggle: true
        },
        {
            name: 'Enterprise',
            description: 'For hospitals & healthcare organizations',
            price: 'Custom',
            priceSubtext: 'pricing',
            color: 'indigo',
            icon: Building2,
            features: [
                'Volume licensing for your organization',
                'Dedicated account manager',
                'Custom onboarding and training',
                'Priority support',
                'Analytics and reporting dashboard',
                'HIPAA-compliant deployment options',
                'Integration with existing systems',
                'Custom branding options'
            ],
            cta: 'Contact Sales',
            ctaLink: 'mailto:enterprise@transplantmedicationnavigator.com?subject=Enterprise%20Pricing%20Inquiry',
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
                                        {tier.hasBillingToggle && (
                                            <div className="flex items-center justify-center gap-2 mb-4 p-1 bg-slate-100 rounded-lg">
                                                <button
                                                    onClick={() => setBillingPeriod('monthly')}
                                                    className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                                                        billingPeriod === 'monthly'
                                                            ? 'bg-white text-slate-900 shadow-sm'
                                                            : 'text-slate-600 hover:text-slate-900'
                                                    }`}
                                                >
                                                    Monthly
                                                </button>
                                                <button
                                                    onClick={() => setBillingPeriod('yearly')}
                                                    className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                                                        billingPeriod === 'yearly'
                                                            ? 'bg-white text-slate-900 shadow-sm'
                                                            : 'text-slate-600 hover:text-slate-900'
                                                    }`}
                                                >
                                                    Yearly
                                                </button>
                                            </div>
                                        )}
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
                                            <p className="text-xs text-slate-500 mb-4 italic">
                                                {tier.importantNote}
                                            </p>
                                        )}
                                        {tier.moneyBackGuarantee && (
                                            <div className="flex items-center gap-2 mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <ShieldCheck size={20} className="text-green-600 flex-shrink-0" aria-hidden="true" />
                                                <span className="text-sm font-semibold text-green-800">30-Day Money Back Guarantee</span>
                                            </div>
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

                        {/* Guarantee Section */}
                        <section className="bg-green-50 border border-green-200 rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheck size={28} className="text-green-600" aria-hidden="true" />
                                <h2 className="text-2xl font-bold text-green-900">Our Guarantee: You Save Money, Or You Don't Pay</h2>
                            </div>
                            <p className="text-green-800 leading-relaxed mb-4">
                                We're so confident this tool will save you money that we offer a full 30-day money-back guarantee on a monthly subscription.
                            </p>
                            <p className="text-green-800 leading-relaxed mb-4">
                                <strong>Here's how it works:</strong> If you subscribe to our annual plan and don't save at least $79.99 on your medications within the first 90 days, we'll provide a full refund. No questions asked.
                            </p>
                            <p className="text-green-800 leading-relaxed mb-4">
                                Simply email us at <a href="mailto:info@transplantmedicationnavigator.com" className="text-green-700 underline hover:text-green-900">info@transplantmedicationnavigator.com</a> with a brief explanation, and we'll process your refund immediately.
                            </p>
                            <p className="text-green-800 leading-relaxed italic">
                                <strong>Why we offer this:</strong> We're transplant patients helping transplant patients. We built this tool because we know how expensive medications are, and we're confident it will help you find savings. If it doesn't, you shouldn't have to pay.
                            </p>
                        </section>

                        {/* FAQ Section */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Common Questions</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">What's included in the Free plan?</h3>
                                    <p className="text-slate-600">
                                        The Free plan includes 1 free quiz, 1 free Savings Calculator use, access to all educational resources, and assistance program links. No login is required. Your work is not saved in the free plan.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">Why upgrade to Pro?</h3>
                                    <p className="text-slate-600">
                                        Pro gives you unlimited My Path Quizzes (update anytime when your situation changes), unlimited medication searches, unlimited Savings Calculator estimates, a Savings Dashboard to visualize your savings, the ability to track and document your actual monthly savings to prove ROI, copay card renewal reminders so you never miss an annual expiration, a medication calendar to track PAP application renewals, and the ability to save your medication lists and quiz results—all stored locally on your device. Choose Monthly at $8.99/month or save 26% with Yearly at $79.99/year.
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
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">What is the money back guarantee?</h3>
                                    <p className="text-slate-600">
                                        We offer a 30-day money back guarantee on all Pro subscriptions. If you're not satisfied with your Pro subscription for any reason within the first 30 days, contact us for a full refund—no questions asked.
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
