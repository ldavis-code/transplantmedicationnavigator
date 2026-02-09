import { Link } from 'react-router-dom';
import { Accessibility as AccessibilityIcon, Mail, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
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
                <p className="text-slate-600">Last Updated: February 9, 2026</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">

                {/* Commitment */}
                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        Our Commitment
                    </h2>
                    <p className="text-slate-700 leading-relaxed">
                        TransplantNav LLC is committed to making the Transplant Medication Navigator website accessible to everyone, including people with disabilities. We believe that all transplant patients deserve equal access to medication assistance information, regardless of ability.
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        We work to follow the{' '}
                        <a
                            href="https://www.w3.org/TR/WCAG21/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 underline inline-flex items-center gap-1"
                        >
                            Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
                            <ExternalLink size={14} aria-hidden="true" />
                        </a>
                        . These guidelines help make web content more usable for people with disabilities and better for everyone.
                    </p>
                </section>

                {/* Conformance Status */}
                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        Conformance Status
                    </h2>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3 mb-4">
                        <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} aria-hidden="true" />
                        <p className="text-emerald-800">
                            <strong>Partially conformant</strong> with WCAG 2.1 Level AA. "Partially conformant" means that some parts of the content do not fully meet the standard. We continuously work to maintain and improve accessibility across all features.
                        </p>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                        We performed a self-assessment of this website on February 9, 2026 and found that it meets the majority of WCAG 2.1 Level AA success criteria. A summary of our findings is listed below.
                    </p>
                </section>

                {/* What We Do Well */}
                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        Accessibility Features
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        This website includes the following accessibility features:
                    </p>
                    <div className="space-y-4">
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Keyboard Navigation</h3>
                            <p className="text-slate-700">
                                All interactive elements can be reached and used with a keyboard. Use <kbd>Tab</kbd> to move between items, <kbd>Enter</kbd> or <kbd>Space</kbd> to activate buttons, and <kbd>Escape</kbd> to close dialogs and tooltips.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Screen Reader Support</h3>
                            <p className="text-slate-700">
                                We use semantic HTML and ARIA attributes so screen readers can understand the page structure. We test with JAWS, NVDA, VoiceOver, and TalkBack.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Skip Navigation</h3>
                            <p className="text-slate-700">
                                A "Skip to main content" link appears at the top of each page when you press <kbd>Tab</kbd>. This lets keyboard users skip past the navigation menu.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Color and Contrast</h3>
                            <p className="text-slate-700">
                                Text colors meet WCAG AA contrast requirements (at least 4.5:1 for normal text and 3:1 for large text). We use a custom high-contrast color palette designed for transplant patients who may have vision changes from medications. Color is never the only way to convey information.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Focus Indicators</h3>
                            <p className="text-slate-700">
                                All interactive elements show a visible green outline when focused via keyboard. On dark backgrounds, the outline changes to white for better visibility.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Reduced Motion</h3>
                            <p className="text-slate-700">
                                We respect the "prefers-reduced-motion" system setting. If you have this enabled in your operating system, animations and transitions are turned off.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">High Contrast and Forced Colors</h3>
                            <p className="text-slate-700">
                                We support the "prefers-contrast" media query and Windows High Contrast Mode (forced colors). Focus indicators, buttons, and form inputs adapt to your system theme.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Forms</h3>
                            <p className="text-slate-700">
                                All form fields have visible labels. Required fields are clearly marked. Error messages are announced to screen readers.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Touch Targets</h3>
                            <p className="text-slate-700">
                                Buttons and links have a minimum size of 44 by 44 pixels, meeting WCAG 2.1 requirements. Most are 48 pixels for easier tapping on mobile devices.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Plain Language</h3>
                            <p className="text-slate-700">
                                Content is written at a 5th to 7th grade reading level. Medical terms are explained in plain language using inline tooltips with definitions.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Simple View Mode</h3>
                            <p className="text-slate-700">
                                A "Simple View" toggle in the navigation increases font sizes, raises contrast, hides decorative elements, and simplifies the layout for users who prefer a cleaner interface.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-semibold text-slate-900 mb-2">Read Aloud</h3>
                            <p className="text-slate-700">
                                A "Read Aloud" button is available on key pages, using your browser's text-to-speech feature to read content out loud.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Technical Details */}
                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        Technical Details
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        This website is built with React and uses semantic HTML5 elements. Accessibility features include:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                        <li>Landmark roles: <code className="bg-slate-100 px-1 rounded text-sm">banner</code>, <code className="bg-slate-100 px-1 rounded text-sm">navigation</code>, <code className="bg-slate-100 px-1 rounded text-sm">main</code>, <code className="bg-slate-100 px-1 rounded text-sm">contentinfo</code></li>
                        <li>ARIA attributes for dynamic content (<code className="bg-slate-100 px-1 rounded text-sm">aria-live</code>, <code className="bg-slate-100 px-1 rounded text-sm">aria-expanded</code>, <code className="bg-slate-100 px-1 rounded text-sm">aria-pressed</code>, <code className="bg-slate-100 px-1 rounded text-sm">aria-modal</code>)</li>
                        <li>Focus management and focus trapping in modal dialogs</li>
                        <li>Page titles updated on each route change</li>
                        <li>Minimum 16px base font size, scalable with browser zoom up to 200%</li>
                        <li>Responsive single-column reflow at narrow viewports</li>
                        <li>Print stylesheet optimized for medication and program information</li>
                    </ul>
                </section>

                {/* Compatibility */}
                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        Compatibility
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        This website is designed to work with:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                        <li>Screen readers: JAWS, NVDA, VoiceOver (macOS/iOS), TalkBack (Android)</li>
                        <li>Screen magnification software</li>
                        <li>Speech recognition software</li>
                        <li>Keyboard-only navigation</li>
                        <li>Browser zoom up to 200%</li>
                        <li>Windows High Contrast Mode</li>
                    </ul>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        We recommend using the latest version of Chrome, Firefox, Safari, or Edge for the best experience.
                    </p>
                </section>

                {/* Known Limitations */}
                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        Known Limitations
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        We know about the following accessibility issues and are working to fix them:
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} aria-hidden="true" />
                        <div className="text-amber-800">
                            <ul className="list-disc list-inside space-y-2 text-sm">
                                <li><strong>Infographic images:</strong> Two informational graphics contain text that is not available as HTML. We plan to add long text descriptions.</li>
                                <li><strong>Single-page app navigation:</strong> When pages change, screen readers may not always announce the new page title. We are evaluating solutions for route-change announcements.</li>
                                <li><strong>Third-party content:</strong> Some embedded content from external services may not fully meet accessibility standards.</li>
                                <li><strong>AI chat assistant:</strong> The chat feature uses streaming text responses that may not be announced in real time by all screen readers.</li>
                            </ul>
                        </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        If any of these issues affect your use of the site, please contact us and we will provide the information in an alternative format.
                    </p>
                </section>

                {/* Assessment Approach */}
                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        How We Test
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        We assess accessibility through:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                        <li>Self-evaluation against WCAG 2.1 Level AA success criteria</li>
                        <li>Automated testing with Lighthouse and axe-core</li>
                        <li>Manual keyboard-only navigation testing</li>
                        <li>Screen reader testing with NVDA and VoiceOver</li>
                        <li>Color contrast analysis of all text and interactive elements</li>
                        <li>Reading level checks using Flesch-Kincaid tools</li>
                        <li>Feedback from users, including people with disabilities</li>
                    </ul>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        Our most recent assessment was completed on February 9, 2026.
                    </p>
                </section>

                {/* Feedback */}
                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        Feedback
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        We welcome your feedback on the accessibility of this website. If you find a barrier or have a suggestion, please contact us:
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
                        When reporting an issue, it helps if you include:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 mt-2">
                        <li>The web page address (URL) where the issue happened</li>
                        <li>What you were trying to do</li>
                        <li>What happened instead</li>
                        <li>The assistive technology you use (if any)</li>
                        <li>Your browser and operating system</li>
                    </ul>
                    <p className="text-slate-700 leading-relaxed mt-4">
                        We aim to respond to accessibility feedback within 5 business days and will work to fix valid issues promptly.
                    </p>
                </section>

                {/* Formal Complaint Process */}
                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full" aria-hidden="true"></span>
                        Formal Complaints
                    </h2>
                    <p className="text-slate-700 leading-relaxed">
                        If you are not satisfied with our response to your accessibility feedback, you may file a complaint with the{' '}
                        <a
                            href="https://www.hhs.gov/civil-rights/filing-a-complaint/index.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 underline inline-flex items-center gap-1"
                        >
                            U.S. Department of Health and Human Services, Office for Civil Rights
                            <ExternalLink size={14} aria-hidden="true" />
                        </a>
                        .
                    </p>
                </section>
            </div>

            {/* Help CTA */}
            <aside className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 md:p-8 text-center">
                <h2 className="text-xl font-bold text-emerald-900 mb-3">Need Assistance?</h2>
                <p className="text-emerald-800 mb-6">
                    If you need help accessing any content on this website or have accessibility concerns, we are here to help.
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
                        className="px-6 py-3 bg-white hover:bg-slate-50 text-emerald-700 font-bold rounded-lg shadow-md border border-emerald-200 transition min-h-[44px] inline-flex items-center justify-center"
                    >
                        Back to Home
                    </Link>
                </div>
            </aside>
        </article>
    );
};

export default Accessibility;
