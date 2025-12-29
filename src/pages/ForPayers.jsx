import { Link } from 'react-router-dom';
import { Building, DollarSign, Users, Shield, CheckCircle, ArrowRight, BarChart3, Lock, Mail } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';

const ForPayers = () => {
    useMetaTags(seoMetadata.forPayers);

    const valueProps = [
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

    const outcomes = [
        'Members find copay help from drug makers',
        'Members find free drug programs',
        'Members pay less for their drugs',
        'Lower claims from free drug programs',
        'Members are happier with their plan',
        'Helpful info on how insurance works'
    ];

    return (
        <article className="max-w-5xl mx-auto space-y-12 pb-12">
            {/* Hero Section */}
            <header className="text-center py-8 md:py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                    <Building size={32} className="text-purple-700" aria-hidden="true" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                    Help Members Find Drug Help Programs
                </h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                    Lower costs for transplant drugs. Help members find free programs and grants from drug makers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="mailto:info@transplantmedicationnavigator.com?subject=Payer%20Demo%20Request"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
                    >
                        <Mail size={20} aria-hidden="true" />
                        Request Demo
                    </a>
                </div>
            </header>

            {/* Value Props */}
            <section className="grid md:grid-cols-2 gap-6">
                {valueProps.map((prop, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-100 transition">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
                            <prop.icon size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">{prop.title}</h2>
                        <p className="text-slate-600">{prop.description}</p>
                    </div>
                ))}
            </section>

            {/* Outcomes */}
            <section className="bg-slate-50 rounded-2xl p-8 md:p-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Member Outcomes</h2>
                <div className="grid md:grid-cols-2 gap-3">
                    {outcomes.map((outcome, index) => (
                        <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg">
                            <CheckCircle size={20} className="text-purple-600 flex-shrink-0" aria-hidden="true" />
                            <span className="text-slate-700">{outcome}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-purple-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">1</div>
                        <h3 className="font-bold text-slate-900 mb-2">Add the Link</h3>
                        <p className="text-slate-600 text-sm">Add the link to your member website or mailings</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-purple-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">2</div>
                        <h3 className="font-bold text-slate-900 mb-2">Members Search</h3>
                        <p className="text-slate-600 text-sm">Members search for their drugs and find help programs on their own</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-purple-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">3</div>
                        <h3 className="font-bold text-slate-900 mb-2">See the Results</h3>
                        <p className="text-slate-600 text-sm">Get reports that show how members use the tool and which programs they find</p>
                    </div>
                </div>
            </section>

            {/* Compliance Note */}
            <section className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                    <Shield size={24} className="text-purple-700" aria-hidden="true" />
                    <h2 className="text-xl font-bold text-slate-900">Privacy & Safety</h2>
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
                    <h2 className="text-xl font-bold text-purple-900">What Members See</h2>
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

            {/* CTA */}
            <section className="text-center py-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to Support Your Members?</h2>
                <p className="text-slate-600 mb-6 max-w-xl mx-auto">
                    Email us to see a demo and learn how we can help your members pay less for their drugs.
                </p>
                <a
                    href="mailto:info@transplantmedicationnavigator.com?subject=Payer%20Demo%20Request"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
                >
                    <Mail size={20} aria-hidden="true" />
                    Contact Us
                </a>
            </section>
        </article>
    );
};

export default ForPayers;
