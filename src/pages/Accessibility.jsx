import { Link } from 'react-router-dom';
import { Accessibility as AccessibilityIcon, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';
import { seoMetadata } from '../data/seo-metadata.js';

const Accessibility = () => {
    useMetaTags(seoMetadata.accessibility);

    return (
        <article className="max-w-4xl mx-auto space-y-8 pb-12">
            <header className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                    <AccessibilityIcon size={32} className="text-emerald-700" aria-hidden="true" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Accessibility Statement</h1>
                <p className="text-slate-600">Last Updated: January 5, 2026</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
                <section>
                    <p className="text-slate-700 leading-relaxed">
                        TransplantNav LLC is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        We believe that all transplant patients deserve equal access to medication assistance information, regardless of ability. Our goal is to make the Transplant Medication Navigator website accessible to as many people as possible.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        Conformance Status
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        We strive to conform to the{' '}
                        <a
                            href="https://www.w3.org/WAI/WCAG21/quickref/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 underline"
                        >
                            Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
                        </a>
                        . These guidelines explain how to make web content more accessible for people with disabilities, and user-friendly for everyone.
                    </p>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} aria-hidden="true" />
                        <p className="text-emerald-800">
                            This website is conformant with WCAG 2.1 Level AA. We continuously work to maintain and improve accessibility across all features.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        Accessibility Features
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        We have implemented the following accessibility features:
                    </p>
                    <div className="space-y-4">
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Keyboard Navigation</h3>
                            <p className="text-slate-700">
                                All interactive elements are accessible via keyboard. You can use Tab to navigate, Enter or Space to activate buttons, and Escape to close dialogs.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Screen Reader Support</h3>
                            <p className="text-slate-700">
                                We use proper semantic HTML and ARIA attributes to ensure compatibility with screen readers like JAWS, NVDA, VoiceOver, and TalkBack.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Skip Navigation</h3>
                            <p className="text-slate-700">
                                A "Skip to main content" link is available at the top of each page, allowing keyboard users to bypass repetitive navigation.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Color Contrast</h3>
                            <p className="text-slate-700">
                                Text and interactive elements meet WCAG AA contrast ratio requirements (4.5:1 for normal text, 3:1 for large text and UI components).
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Focus Indicators</h3>
                            <p className="text-slate-700">
                                Visible focus indicators are provided for all interactive elements to help keyboard users track their location on the page.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Reduced Motion</h3>
                            <p className="text-slate-700">
                                We respect the "prefers-reduced-motion" setting. If you have reduced motion enabled in your operating system, animations and transitions are minimized.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Form Accessibility</h3>
                            <p className="text-slate-700">
                                All form inputs have associated labels, error messages are announced to screen readers, and required fields are clearly indicated.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Touch Targets</h3>
                            <p className="text-slate-700">
                                Interactive elements have minimum touch target sizes of 44x44 pixels to accommodate users with motor impairments.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        Compatibility
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        This website is designed to be compatible with the following assistive technologies:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                        <li>Screen readers (JAWS, NVDA, VoiceOver, TalkBack)</li>
                        <li>Screen magnification software</li>
                        <li>Speech recognition software</li>
                        <li>Keyboard-only navigation</li>
                        <li>Browser zoom up to 200%</li>
                    </ul>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        We recommend using the latest versions of Chrome, Firefox, Safari, or Edge for the best accessibility experience.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        Limitations
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        Despite our best efforts, some parts of this website may not be fully accessible. Known limitations include:
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} aria-hidden="true" />
                        <div className="text-amber-800">
                            <p className="font-medium mb-2">Known Issues:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Some older PDF documents may not be fully accessible</li>
                                <li>Third-party embedded content may have accessibility limitations</li>
                                <li>Some complex data visualizations may be difficult to interpret with screen readers</li>
                            </ul>
                        </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        We are actively working to address these limitations. If you encounter any barriers, please contact us.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        Feedback
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        We welcome your feedback on the accessibility of this website. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:
                    </p>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                        <p className="text-slate-700">
                            <strong>Email:</strong>{' '}
                            <a
                                href="mailto:info@transplantmedicationnavigator.com?subject=Accessibility%20Feedback"
                                className="text-emerald-600 hover:text-emerald-700 underline inline-flex items-center gap-1"
                            >
                                <Mail size={16} aria-hidden="true" />
                                info@transplantmedicationnavigator.com
                            </a>
                        </p>
                        <p className="text-slate-700">
                            <strong>Subject Line:</strong> "Accessibility Feedback"
                        </p>
                    </div>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        When reporting accessibility issues, please include:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 mt-2">
                        <li>The web page URL where you encountered the issue</li>
                        <li>A description of the problem</li>
                        <li>The assistive technology you were using (if any)</li>
                        <li>Your browser and operating system</li>
                    </ul>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        We will respond to accessibility feedback within 5 business days and work to address valid concerns.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        Assessment Approach
                    </h2>
                    <p className="text-slate-700 leading-relaxed">
                        We assess the accessibility of this website through the following methods:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 mt-4">
                        <li>Self-evaluation using WCAG 2.1 Level AA criteria</li>
                        <li>Automated testing tools (Lighthouse, axe-core)</li>
                        <li>Manual testing with keyboard and screen readers</li>
                        <li>User feedback and accessibility reports</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        Continuous Improvement
                    </h2>
                    <p className="text-slate-700 leading-relaxed">
                        We are committed to ongoing accessibility improvements. Our accessibility efforts include:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 mt-4">
                        <li>Regular accessibility audits and testing</li>
                        <li>Incorporating accessibility into our development process</li>
                        <li>Training our team on accessibility best practices</li>
                        <li>Promptly addressing reported accessibility issues</li>
                    </ul>
                </section>
            </div>

            <aside className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 md:p-8 text-center">
                <h2 className="text-xl font-bold text-emerald-900 mb-3">Need Assistance?</h2>
                <p className="text-emerald-800 mb-6">
                    If you need help accessing any content on this website or have accessibility concerns, we're here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="mailto:info@transplantmedicationnavigator.com?subject=Accessibility%20Assistance"
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition inline-flex items-center justify-center gap-2 min-h-[44px]"
                    >
                        <Mail size={18} aria-hidden="true" />
                        Contact Us
                    </a>
                    <Link
                        to="/"
                        className="px-6 py-3 bg-white hover:bg-slate-50 text-emerald-700 font-bold rounded-lg shadow-md border border-emerald-200 transition min-h-[44px]"
                    >
                        Back to Home
                    </Link>
                </div>
            </aside>
        </article>
    );
};

export default Accessibility;
