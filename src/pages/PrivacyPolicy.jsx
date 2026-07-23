import { Link } from 'react-router-dom';
import { Shield, Mail } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';
import EnglishOnlyNotice from '../components/EnglishOnlyNotice.jsx';

const PrivacyPolicy = () => {
    useMetaTags(seoMetadata.privacyPolicy);

    return (
        <article className="max-w-4xl mx-auto space-y-8 pb-12">
            <EnglishOnlyNotice />
            <header className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                    <Shield size={32} className="text-emerald-700" aria-hidden="true" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Privacy Policy</h1>
                <p className="text-slate-600">Last Updated: July 6, 2026</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
                <section>
                    <p className="text-slate-700 leading-relaxed">
                        TransplantNav LLC ("we," "us," or "our") operates the Transplant Medication Navigator website (the "Website"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our Website.
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        Please read this Privacy Policy carefully. By using the Website, you agree to the collection and use of information in accordance with this policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        1. Information We Collect
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        We designed the Website so that information about your health stays with you. Here is exactly what is collected and where it goes:
                    </p>
                    <div className="space-y-4">
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Information that stays on your device</h3>
                            <p className="text-slate-700">
                                Your My Path Quiz answers, saved medication lists, savings entries, and progress are stored only in your own browser (local storage). They are not sent to our servers. We do not require an account, and we do not collect your name, email address, or payment information.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Anonymous usage data</h3>
                            <p className="text-slate-700">
                                We count events like page views, quiz starts and completions, medication searches, and clicks on assistance-program links, along with anonymous answer counts (for example, how many visitors selected each insurance type). These counts contain no name, email, IP address, or other identifier, and our collection endpoint actively rejects any request containing identifying fields.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Feedback, surveys, and price reports</h3>
                            <p className="text-slate-700">
                                If you answer our feedback questions, surveys, or submit a community price report (medication, price paid, and pharmacy location), your responses are stored anonymously. We do not collect names, dates of birth, medical record numbers, or contact information with them, and we ask you not to include identifying details in free-text comments.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Health record import (Epic / MyChart)</h3>
                            <p className="text-slate-700">
                                If you choose to connect your health system account, your health system sends your active medication list through our secure server directly to your browser. We do not store your medication list, your record identifiers, or your access credentials on our servers. We record only that a login was completed at a given health system, with no information about who logged in.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">AI chat assistant</h3>
                            <p className="text-slate-700">
                                If you use the chat assistant, the messages you type and the quiz answers you have provided (such as organ type, insurance type, and medication names) are processed by our artificial-intelligence provider, Anthropic, to generate a response. We do not store chat conversations in our database. Please do not include your name or contact information in chat messages.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Optional analytics cookies</h3>
                            <p className="text-slate-700">
                                Google Analytics runs only if you accept it in our consent banner. If you decline, or if your browser sends a Global Privacy Control signal, no Google Analytics script loads and no analytics cookies are set. You can change your choice anytime using the "Privacy Choices" link in the footer.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        2. How We Use Your Information
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        We use the information we collect in the following ways:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                        <li>To provide, operate, and maintain the Website</li>
                        <li>To improve the Website and understand which resources help patients most</li>
                        <li>To share aggregate, anonymous statistics (never individual data) with transplant centers and partners who use the tool</li>
                        <li>To comply with legal obligations</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        3. Disclosure of Your Information
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        We may share your information in the following situations:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                        <li><strong>Service Providers:</strong> The Website runs on the following providers, who process data on our behalf: <strong>Netlify</strong> (website hosting and serverless functions), <strong>Neon</strong> (database for anonymous usage data, feedback, and price reports), <strong>Anthropic</strong> (AI processing for the chat assistant), and <strong>Google Analytics</strong> (only if you accept analytics cookies). If you connect a health record, your own health system (for example, via Epic MyChart) is also involved in that exchange.</li>
                        <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid requests by public authorities.</li>
                        <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, information may be transferred as part of that transaction.</li>
                    </ul>
                    <p className="text-slate-700 leading-relaxed mt-4 font-semibold bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        We do not sell your personal information, and we do not share it for advertising.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        4. Cookies and Tracking Technologies
                    </h2>
                    <p className="text-slate-700 leading-relaxed">
                        The only tracking cookies we use are the optional Google Analytics cookies described above, and they are off until you accept them in the consent banner. We honor the Global Privacy Control browser signal as a decline. The Website also uses your browser's local storage to save your own quiz progress and medication lists on your device; that information never leaves your browser and you can clear it at any time through your browser settings. You can change your analytics choice anytime via the "Privacy Choices" link in the footer.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        5. Data Security
                    </h2>
                    <p className="text-slate-700 leading-relaxed">
                        We use administrative, technical, and physical security measures to protect your personal information. While we have taken reasonable steps to secure the information you provide to us, please be aware that no security measures are perfect or impenetrable, and we cannot guarantee that your information will not be accessed, disclosed, altered, or destroyed.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        6. Data Retention
                    </h2>
                    <p className="text-slate-700 leading-relaxed">
                        Anonymous usage events, feedback responses, and community price reports are retained for up to 24 months, after which they are deleted or kept only as aggregate totals. Chat conversations are not stored in our systems. Information saved in your browser's local storage stays on your device until you clear it. We may retain information longer where necessary to comply with legal obligations or resolve disputes.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        7. Your Privacy Rights
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        Depending on where you live, state privacy laws (such as the California Consumer Privacy Act or Washington's My Health My Data Act) may give you rights over your personal information and consumer health data, including:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                        <li><strong>Access:</strong> You may request access to the personal information we hold about you.</li>
                        <li><strong>Correction:</strong> You may request that we correct inaccurate or incomplete information.</li>
                        <li><strong>Deletion:</strong> You may request that we delete your personal information, subject to certain exceptions.</li>
                        <li><strong>Opt-out of analytics:</strong> Decline or withdraw analytics consent anytime via the "Privacy Choices" link in the footer, or by using a browser that sends the Global Privacy Control signal.</li>
                    </ul>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        Because we do not store your name, contact information, or account data, in most cases we hold nothing that can be linked to you. To exercise any of these rights or ask what we hold, contact us using the information below and we will respond within the time required by applicable law. You may also authorize an agent to submit a request for you, and we will not discriminate against you for exercising your rights.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        8. Health Information and HIPAA
                    </h2>
                    <p className="text-slate-700 leading-relaxed">
                        We are not a healthcare provider, health plan, or healthcare clearinghouse, so we are not a "covered entity" under HIPAA, and information you enter on this Website is not protected by HIPAA. Instead, it is protected by this Privacy Policy, by the design choices described above (health-related information stays on your device or is collected without identifiers), and by consumer-protection laws including the FTC Act and the FTC Health Breach Notification Rule. Your medical records at your hospital or clinic remain protected by HIPAA at those organizations; connecting your health record here is your choice and copies only your active medication list into your own browser.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        9. Third-Party Websites
                    </h2>
                    <p className="text-slate-700 leading-relaxed">
                        The Website may contain links to third-party websites and services that are not owned or controlled by us. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party sites you visit.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        10. Children's Privacy
                    </h2>
                    <p className="text-slate-700 leading-relaxed">
                        The Website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so that we can delete such information.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        11. Changes to This Privacy Policy
                    </h2>
                    <p className="text-slate-700 leading-relaxed">
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        12. Contact Us
                    </h2>
                    <p className="text-slate-700 leading-relaxed">
                        If you have any questions about this Privacy Policy or our privacy practices, please contact us at{' '}
                        <a
                            href="mailto:info@transplantmedicationnavigator.com"
                            className="text-emerald-600 hover:text-emerald-700 underline inline-flex items-center gap-1"
                        >
                            <Mail size={16} aria-hidden="true" />
                            info@transplantmedicationnavigator.com
                        </a>
                    </p>
                </section>
            </div>

            <aside className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 md:p-8 text-center">
                <h2 className="text-xl font-bold text-emerald-900 mb-3">Have Questions?</h2>
                <p className="text-emerald-800 mb-6">
                    If you have any questions about our privacy practices or how we handle your data, we're here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/terms-and-conditions"
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition"
                    >
                        View Terms & Conditions
                    </Link>
                    <Link
                        to="/"
                        className="px-6 py-3 bg-white hover:bg-slate-50 text-emerald-700 font-bold rounded-lg shadow-md border border-emerald-200 transition"
                    >
                        Back to Home
                    </Link>
                </div>
            </aside>
        </article>
    );
};

export default PrivacyPolicy;
