import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { isSpanishPath, LANG_STORAGE_KEY, ES_OFFER_DISMISS_KEY } from './i18n.js';
// Lazy loaded page components for code splitting
const LazyFAQ = lazy(() => import('./pages/FAQ.jsx'));
const LazyWizard = lazy(() => import('./pages/main/Wizard.jsx'));
const LazyMedicationSearch = lazy(() => import('./pages/main/MedicationSearch.jsx'));
const LazyEducation = lazy(() => import('./pages/main/Education.jsx'));
const LazyApplicationHelp = lazy(() => import('./pages/main/ApplicationHelp.jsx'));
const LazyAbout = lazy(() => import('./pages/About.jsx'));
const LazyNotFound = lazy(() => import('./pages/NotFound.jsx'));
const LazySurveyLanding = lazy(() => import('./pages/SurveyLanding.jsx'));
const LazyTransplantMedicationSurvey = lazy(() => import('./pages/TransplantMedicationSurvey.jsx'));
const LazyGeneralMedicationSurvey = lazy(() => import('./pages/GeneralMedicationSurvey.jsx'));
const LazyForTransplantPrograms = lazy(() => import('./pages/ForTransplantPrograms.jsx'));
const LazyForEmployers = lazy(() => import('./pages/ForEmployers.jsx'));
const LazyForPayers = lazy(() => import('./pages/ForPayers.jsx'));
const LazyForHospitalAdmin = lazy(() => import('./pages/ForHospitalAdmin.jsx'));
const LazyEvidence = lazy(() => import('./pages/Evidence.jsx'));
const LazyPricing = lazy(() => import('./pages/Pricing.jsx'));
const LazyPilot = lazy(() => import('./pages/Pilot.jsx'));
const LazyDemo = lazy(() => import('./pages/Demo.jsx'));
const LazyMyMedications = lazy(() => import('./pages/MyMedications.jsx'));
const LazyMedicationDetail = lazy(() => import('./pages/MedicationDetail.jsx'));
const LazySavingsTracker = lazy(() => import('./pages/SavingsTracker.jsx'));
const LazyCopayCardReminders = lazy(() => import('./pages/CopayCardReminders.jsx'));
const LazyTermsAndConditions = lazy(() => import('./pages/TermsAndConditions.jsx'));
const LazyPrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const LazyAccessibility = lazy(() => import('./pages/Accessibility.jsx'));
const LazyAppeals = lazy(() => import('./pages/Appeals.jsx'));
const LazyFeedbackSurvey = lazy(() => import('./pages/FeedbackSurvey.jsx'));
const LazyEpicCallback = lazy(() => import('./pages/EpicCallback.jsx'));
const LazyNotLicensed = lazy(() => import('./pages/NotLicensed.jsx'));

// Admin pages (lazy loaded)
const LazyAdminLogin = lazy(() => import('./pages/admin/Login.jsx'));
const LazyAdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const LazyOrganizationSettings = lazy(() => import('./pages/admin/OrganizationSettings.jsx'));
const LazyAnalytics = lazy(() => import('./pages/admin/Analytics.jsx'));
const LazyUserManagement = lazy(() => import('./pages/admin/UserManagement.jsx'));
const LazyMedicationConfig = lazy(() => import('./pages/admin/MedicationConfig.jsx'));
const LazyFeatureSettings = lazy(() => import('./pages/admin/FeatureSettings.jsx'));
const LazyImpactReport = lazy(() => import('./pages/admin/ImpactReport.jsx'));
const LazyInsights = lazy(() => import('./pages/admin/Insights.jsx'));
const LazyComplianceOverview = lazy(() => import('./pages/admin/ComplianceOverview.jsx'));
const LazyCenterLogins = lazy(() => import('./pages/admin/CenterLogins.jsx'));

// Subscriber auth pages (lazy loaded)

// Reporting admin pages (lazy loaded)
const LazyReportingLogin = lazy(() => import('./pages/reporting/ReportingLogin.jsx'));
const LazyReportingDashboard = lazy(() => import('./pages/reporting/ReportingDashboard.jsx'));
const LazyReportingPartners = lazy(() => import('./pages/reporting/ReportingPartners.jsx'));
const LazyReportingPrograms = lazy(() => import('./pages/reporting/ReportingPrograms.jsx'));
const LazyReportingFunnel = lazy(() => import('./pages/reporting/ReportingFunnel.jsx'));
const LazyReportingEvents = lazy(() => import('./pages/reporting/ReportingEvents.jsx'));
const LazyReportingPartnerReport = lazy(() => import('./pages/reporting/ReportingPartnerReport.jsx'));

// Google Analytics 4 integration
import GoogleAnalytics from './components/GoogleAnalytics.jsx';
// Home is imported statically on purpose: index.html paints static hero
// content before hydration, and a lazy Home would replace it with the route
// Suspense fallback for a network round trip before repainting — a visible
// flash and an LCP regression (measured on the deploy preview). Its graph is
// small; the other route pages stay lazy.
import Home from './pages/main/Home.jsx';
// First-visit disclaimer modal
import DisclaimerModal from './components/DisclaimerModal.jsx';
// Paywall modal for free tier limits
// AI Medication Assistant Chat Widget: retired from the layout — the floating
// bubble competed with the page's own task flow. The component is kept in the
// tree in case it returns as an opt-in surface.
// Term Tooltip for inline definitions
// Chat Quiz Context Provider
import { ChatQuizProvider } from './context/ChatQuizContext.jsx';
// Subscriber Auth Provider
// Demo Mode Provider
import { DemoModeProvider } from './context/DemoModeContext.jsx';
// Simple View Provider
import { SimpleViewProvider, useSimpleView } from './context/SimpleViewContext.jsx';
// Demo Banner Component
import DemoBanner from './components/DemoBanner.jsx';
import LanguageToggle from './components/LanguageToggle.jsx';
import ConsentBanner from './components/ConsentBanner.jsx';
import { openConsentBanner } from './lib/consent.js';
// Feedback Widget for medication results
// Read Aloud Button for accessibility
// Route change announcer for screen readers (Section 504 / WCAG 2.1 AA)
import RouteAnnouncer from './components/RouteAnnouncer.jsx';
// Epic MyChart FHIR integration - imports medications from patient's EHR
// Language switcher shown on pages that have a Spanish translation
// Medications Context Provider - fetches from database with JSON fallback
import { MedicationsProvider } from './context/MedicationsContext.jsx';
// Reporting Admin Auth Provider
import { ReportingAuthProvider } from './context/ReportingAuthContext.jsx';
// Hospital Admin Auth + Tenant Providers
import { AuthProvider } from './context/AuthContext.jsx';
import { TenantProvider } from './context/TenantContext.jsx';
import { Map, Search, Menu, X, ShieldAlert, HeartHandshake, Shield, Check, ClipboardList, MessageCircle, Send, Clock, Loader2, Eye, EyeOff } from 'lucide-react';
// --- CONSTANTS & DATA ---
import { LAST_UPDATED_ISO, TransplantStatus } from './data/constants.js';
import ASSISTANT_KNOWLEDGE_BASE_DATA from './data/knowledge-base.json';
import QUICK_ACTIONS_DATA from './data/quick-actions.json';
// Shared with the wizard route: powers the chat widget's med suggestions here
import { ORGAN_MEDICATIONS, PRE_TRANSPLANT_MEDICATIONS } from './data/organMedications.js';
const ASSISTANT_KNOWLEDGE_BASE = ASSISTANT_KNOWLEDGE_BASE_DATA;

// Icon mapping for quick actions
const iconMap = {
    Map,
    Search,
    HeartHandshake,
    Shield,
    ClipboardList
};

// Map quick actions to include actual icon components
const QUICK_ACTIONS = QUICK_ACTIONS_DATA.map(action => ({
    ...action,
    icon: iconMap[action.icon]
}));

// Helper function to get price estimates for a medication
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

// Keeps the URL and the active language in sync. Spanish lives at the /es/
// path prefix, served statically by Netlify; the router runs with
// basename="/es" there (set in App below), so in-app navigation keeps the
// prefix automatically and this component only handles the boundaries:
//
// Inside /es/: the path IS the language — force Spanish if a stale state
// slipped through, and honor an explicit ?lang=en by doing a full
// navigation to the unprefixed (English) page.
//
// Outside /es/: honor an explicit ?lang=en (legacy links; also how an old
// cached app shell switches). Move to the real /es/ page only when Spanish
// was EXPLICITLY asked for: a legacy ?lang=es link, an /es path served by
// a stale shell (SpanishPathRedirect switches the language before landing
// here), or an installed-app launch whose saved preference is Spanish —
// the only ways detectInitialLanguage resolves 'es' outside /es/. A plain
// English URL never redirects on the saved preference alone: the address
// bar wins, so a shared /education link stays English whatever this
// browser last viewed.
const LanguageUrlSync = () => {
    const location = useLocation(); // basename-stripped inside /es/
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const param = params.get('lang');
        params.delete('lang');
        const qs = params.toString();
        const suffix = location.pathname + (qs ? `?${qs}` : '') + location.hash;
        if (IN_ES_PATH) {
            if (param === 'en') {
                try { localStorage.setItem(LANG_STORAGE_KEY, 'en'); } catch { /* still switches */ }
                window.location.replace(suffix);
                return;
            }
            if (i18n.resolvedLanguage !== 'es') i18n.changeLanguage('es');
            if (param === 'es') {
                // Netlify forwards the query string on the legacy ?lang=es
                // 301s, so the parameter can arrive here redundantly — shed
                // it (router replace keeps the /es basename).
                navigate(suffix, { replace: true });
            }
            return;
        }
        if (param === 'en') {
            if (i18n.resolvedLanguage !== 'en') i18n.changeLanguage('en');
            return;
        }
        if (param === 'es' || i18n.resolvedLanguage === 'es') {
            window.location.replace('/es' + suffix);
        }
    }, [location, navigate, i18n, i18n.resolvedLanguage]);
    return null;
};

// Whether this page load lives in the Spanish URL space. Computed once at
// module load: a full page load is the only way to cross the boundary (the
// server serves different static shells for /es/... and /...), so the
// router's basename below is fixed for the lifetime of the page.
const IN_ES_PATH = typeof window !== 'undefined' && isSpanishPath(window.location.pathname);

// "¿Prefiere español?" offer bar, shown on English pages when the browser
// itself prefers Spanish. An offer, never a redirect: in many households
// the patient is Spanish-dominant while the person holding the phone is
// English-dominant, so the English page must stay put — this bar is what
// gets the phone handed over. Strings are deliberately not in the locale
// files: they render Spanish ON the English page, same rationale as
// LanguageToggle's SWITCH_LABELS.
const ES_OFFER = {
    question: '¿Prefiere español?',
    link: 'Vea este sitio en español',
    dismissAria: 'Cerrar este aviso',
    regionAria: 'Este sitio está disponible en español',
};

const browserPrefersSpanish = () => {
    if (typeof navigator === 'undefined') return false;
    const langs = (navigator.languages && navigator.languages.length)
        ? navigator.languages
        : [navigator.language];
    return (langs || []).some((l) => (l || '').toLowerCase().startsWith('es'));
};

const SpanishOfferBar = () => {
    const location = useLocation();
    const { i18n } = useTranslation();
    const [dismissed, setDismissed] = useState(() => {
        try {
            return localStorage.getItem(ES_OFFER_DISMISS_KEY) === '1';
        } catch {
            // No storage means the dismissal couldn't persist — showing the
            // bar anyway would nag on every page load, so keep it hidden.
            return true;
        }
    });

    if (dismissed || IN_ES_PATH || (i18n.resolvedLanguage || '').startsWith('es') || !browserPrefersSpanish()) {
        return null;
    }

    // Offer this page's own Spanish version, not just the homepage.
    const params = new URLSearchParams(location.search);
    params.delete('lang');
    const qs = params.toString();
    const href = '/es' + location.pathname + (qs ? `?${qs}` : '') + location.hash;

    const dismiss = () => {
        setDismissed(true);
        try {
            localStorage.setItem(ES_OFFER_DISMISS_KEY, '1');
        } catch { /* dismissal lasts this visit only */ }
    };

    return (
        <div lang="es" role="region" aria-label={ES_OFFER.regionAria} className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 no-print flex items-center justify-center gap-2 text-center">
            <p className="text-sm sm:text-base text-slate-800">
                <span className="font-semibold">{ES_OFFER.question}</span>{' '}
                <a href={href} className="font-bold text-emerald-800 underline hover:text-emerald-900">
                    {ES_OFFER.link} →
                </a>
            </p>
            <button
                onClick={dismiss}
                aria-label={ES_OFFER.dismissAria}
                className="text-slate-500 hover:text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
            >
                <X size={18} aria-hidden="true" />
            </button>
        </div>
    );
};

// --- RULE-BASED ASSISTANT SYSTEM ---

// Rule-based response generator
const getAssistantResponse = (userMessage, context = {}) => {
    const lowerMessage = userMessage.toLowerCase();

    // Check for matches in knowledge base
    for (const [key, entry] of Object.entries(ASSISTANT_KNOWLEDGE_BASE)) {
        if (entry.keywords.some(keyword => lowerMessage.includes(keyword))) {
            return entry.response;
        }
    }

    // Context-aware responses based on wizard state
    if (context.wizardStep) {
        if (context.wizardStep === 5) {
            return "**Selecting Medications:**\n\nChoose all medications you currently take or expect to take. Don't worry if you're not sure - you can always update this later.\n\n💡 **Tip:** If you select medications, we'll show you direct links to their manufacturer assistance programs in your results.";
        }
        if (context.wizardStep === 6) {
            return ASSISTANT_KNOWLEDGE_BASE.specialtyPharmacy.response;
        }
        if (context.wizardStep === 7) {
            return "**Financial Status:**\n\nBe honest about your situation - this helps us prioritize the best programs for you:\n\n• **Manageable**: Focus on copay cards and savings\n• **Challenging**: PAPs + foundations recommended\n• **Unaffordable/Crisis**: Immediate PAP applications + Medicaid check\n\nYour answer is anonymous. We never ask for your name and never link it to you.";
        }
    }

    // Default helpful response
    return "I'm here to help! Here are some things I can assist with:\n\n• **Insurance questions** - Medicare, Medicaid, commercial coverage\n• **Patient Assistance Programs (PAPs)** - How to get free medication\n• **Copay foundations** - Organizations that help pay for medications\n• **Application help** - Step-by-step guidance\n• **Medication information** - Pricing and assistance programs\n\nTry asking about any of these topics, or use the Quick Actions below!";
};

// Smart medication suggestions based on organ-specific medication guides
const getMedicationSuggestions = (answers) => {
    if (!answers.organs || answers.organs.length === 0) {
        return [];
    }

    const isPreTransplant = answers.status === TransplantStatus.PRE_EVAL;
    const medicationData = isPreTransplant ? PRE_TRANSPLANT_MEDICATIONS : ORGAN_MEDICATIONS;

    // Collect all medications for the selected organs (no duplicates)
    const medications = [];
    const seenIds = new Set();

    for (const organ of answers.organs) {
        const organData = medicationData[organ];
        if (!organData || !organData.medications) continue;

        for (const med of organData.medications) {
            // Post-transplant rows carry a single id; pre-transplant rows carry
            // a class with several example medication ids. Handle both shapes.
            const rowIds = med.examples ? med.examples.map(e => e.id) : [med.id];
            for (const medId of rowIds) {
                if (medId && !seenIds.has(medId)) {
                    seenIds.add(medId);
                    medications.push(medId);
                }
            }
        }
    }

    if (medications.length === 0) return [];

    // Return all medications in one group
    return [{
        medications: medications,
        reason: isPreTransplant
            ? 'Common medications while awaiting transplant'
            : 'Common medications after transplant'
    }];
};

// Chat Widget Component
const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'assistant',
            text: "👋 Hi! I'm your Transplant Medication Navigator™ assistant. I can help you find medication assistance, understand insurance, and use our tools.\n\nWhat can I help you with today?",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [wizardContext, setWizardContext] = useState({});
    const messagesEndRef = useCallback(node => {
        if (node) {
            node.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        // Add user message
        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            text: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);

        // Get assistant response
        const response = getAssistantResponse(inputValue, wizardContext);
        const assistantMessage = {
            id: messages.length + 2,
            type: 'assistant',
            text: response,
            timestamp: new Date()
        };

        setTimeout(() => {
            setMessages(prev => [...prev, assistantMessage]);
        }, 500);

        setInputValue('');
    };

    const handleQuickAction = (action) => {
        if (action.link) {
            window.location.href = action.link;
        } else if (action.topic) {
            const response = ASSISTANT_KNOWLEDGE_BASE[action.topic]?.response || '';
            const assistantMessage = {
                id: messages.length + 1,
                type: 'assistant',
                text: response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
        }
    };

    // Handle Escape key to close chat
    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    return (
        <div className="fixed bottom-6 right-6 z-50 no-print">
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-full p-4 shadow-lg transition-all duration-300 flex items-center gap-2 group min-h-[44px]"
                    aria-label="Open assistant chat"
                >
                    <MessageCircle size={24} aria-hidden="true" />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
                        Need help?
                    </span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="bg-white rounded-2xl shadow-2xl w-[calc(100vw-2rem)] sm:w-96 h-[80vh] sm:h-[600px] max-h-[600px] flex flex-col border border-slate-200 animate-in slide-in-from-bottom-5"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="chat-widget-title"
                >
                    {/* Header */}
                    <div className="bg-emerald-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-2 rounded-lg" aria-hidden="true">
                                <HeartHandshake size={20} />
                            </div>
                            <div>
                                <h3 id="chat-widget-title" className="font-bold">Medication Navigator</h3>
                                <p className="text-xs text-emerald-100">Always here to help</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 p-2 rounded-lg transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                            aria-label="Close chat"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" role="log" aria-live="polite" aria-label="Chat messages">
                        {messages.map((message, index) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl p-3 ${
                                        message.type === 'user'
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-white border border-slate-200 text-slate-800'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div className="border-t border-slate-200 p-3 bg-white">
                        <p className="text-sm text-slate-800 mb-2 font-semibold">Quick Actions:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {QUICK_ACTIONS.slice(0, 4).map(action => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.id}
                                        onClick={() => handleQuickAction(action)}
                                        className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 transition text-left min-h-[48px]"
                                        title={action.description}
                                    >
                                        <Icon size={18} className="text-emerald-700 flex-shrink-0" />
                                        <span className="text-sm text-slate-800 truncate">{action.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="border-t border-slate-200 p-4 bg-white rounded-b-2xl">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask a question..."
                                className="flex-1 px-4 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base min-h-[44px]"
                                aria-label="Type your message"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim()}
                                className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white p-3 rounded-full transition disabled:cursor-not-allowed min-h-[48px] min-w-[48px] flex items-center justify-center"
                                aria-label="Send message"
                            >
                                <Send size={22} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Layout Component
const Layout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { isSimpleView, toggleSimpleView } = useSimpleView();
    const { t, i18n } = useTranslation();

    // B2B pages (hospital sales, plan pricing) are not patient concerns, so
    // they live in the footer's English-only B2B group rather than the
    // patient-facing top nav. isSpanish gates that footer group.
    const isSpanish = i18n.resolvedLanguage === 'es';

    // One-time "Need bigger text?" prompt, remembered per device.
    const [showSimplePrompt, setShowSimplePrompt] = useState(() => {
        try {
            return localStorage.getItem('tmn_simple_prompt_seen') !== 'true';
        } catch {
            return false;
        }
    });
    const dismissSimplePrompt = () => {
        setShowSimplePrompt(false);
        try { localStorage.setItem('tmn_simple_prompt_seen', 'true'); } catch { /* ignore */ }
    };

    const navLinks = [
        { path: '/', label: t('layout.nav.links.home.label'), ariaLabel: t('layout.nav.links.home.ariaLabel') },
        { path: '/wizard', label: t('layout.nav.links.wizard.label'), ariaLabel: t('layout.nav.links.wizard.ariaLabel') },
        { path: '/education', label: t('layout.nav.links.education.label'), ariaLabel: t('layout.nav.links.education.ariaLabel') },
        // "Get help paying" absorbs the old Grants and Savings items — the
        // savings tracker stays reachable from within the grants pages.
        { path: '/application-help', label: t('layout.nav.links.applicationHelp.label'), ariaLabel: t('layout.nav.links.applicationHelp.ariaLabel') },
        { path: '/faq', label: t('layout.nav.links.faq.label'), ariaLabel: t('layout.nav.links.faq.ariaLabel') },
        { path: '/feedback', label: t('layout.nav.links.feedback.label'), ariaLabel: t('layout.nav.links.feedback.ariaLabel') },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
            {/* Urgent-help Banner — the person who needs it most may never
                scroll, so the crisis path owns the first slot on every page. */}
            <Link
                to="/education?topic=EMERGENCY"
                className="block bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-3 text-base text-center font-medium no-print transition-colors"
            >
                <span className="inline-flex items-center justify-center gap-2">
                    <ShieldAlert size={18} className="text-emerald-100 flex-shrink-0" aria-hidden="true" />
                    <span>
                        {t('layout.banner.urgentText')} <span className="underline font-bold whitespace-nowrap">{t('layout.banner.urgentLink')} →</span>
                    </span>
                </span>
            </Link>

            {/* Skip to Main Content Link - Accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-1/2 focus:-translate-x-1/2 focus:z-[100] focus:bg-emerald-700 focus:text-white focus:px-6 focus:py-3 focus:rounded-b-lg focus:font-semibold focus:shadow-lg"
            >
                {t('layout.skipLink')}
            </a>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200 no-print" role="banner">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition flex-shrink-0" aria-label={t('layout.nav.brandAriaLabel')}>
                        <img src="/photos/logo.png" alt="" width={32} height={32} aria-hidden="true" className="flex-shrink-0" />
                        <span className="font-bold text-base sm:text-lg leading-tight">
                            {t('layout.nav.brandLine1')}<br/>{t('layout.nav.brandLine2')}<sup className="text-xs">{t('layout.nav.brandTm')}</sup>
                        </span>
                    </Link>

                    {/* Desktop nav — the page links only. They collapse into
                        the menu below 2xl, and in larger-text mode at every
                        width: that mode sets a 20px root font size, which
                        widens the label set past the container (Spanish worst
                        case needs ~1570px), and a nav that overflows drags
                        the controls after it off the right edge. Keeping the
                        controls outside this element means the language
                        switch and the larger-text toggle are never the thing
                        that gets clipped; min-w-0/overflow-x-auto is the
                        belt-and-braces for label sets we haven't measured. */}
                    <nav
                        className={`${isSimpleView ? 'hidden' : 'hidden 2xl:flex'} items-center gap-1 min-w-0 overflow-x-auto`}
                        aria-label={t('layout.nav.mainAriaLabel')}
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                aria-label={link.ariaLabel}
                                className={`text-sm font-medium transition-colors px-2 py-2 rounded-lg min-h-[44px] flex items-center whitespace-nowrap ${
                                    location.pathname === link.path
                                        ? 'text-emerald-700 font-bold bg-emerald-50 border-b-2 border-emerald-600'
                                        : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Controls that stay in the bar at every width: the
                        larger-text toggle, the language switch (buried below
                        the hero or behind the menu, a Spanish speaker who
                        scrolls first would never find it), and the menu
                        button whenever the links are collapsed. The toggle
                        names the state it is in — "Larger text: on" — rather
                        than the way out of it, so nobody has to recognize a
                        mode they never chose to know they're in it. Below md
                        the bar has no room for it and it lives in the menu. */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            onClick={toggleSimpleView}
                            aria-pressed={isSimpleView}
                            className={`hidden md:flex px-2 sm:px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] items-center gap-2 border-2 transition-colors whitespace-nowrap ${
                                isSimpleView
                                    ? 'bg-emerald-700 text-white border-emerald-700'
                                    : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-600 hover:text-emerald-700'
                            }`}
                        >
                            {isSimpleView ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                            {isSimpleView ? t('layout.nav.simpleViewExit') : t('layout.nav.simpleView')}
                        </button>
                        <LanguageToggle compact />
                        <button
                            className={`${isSimpleView ? '' : '2xl:hidden'} p-2 text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? t('layout.nav.closeMenu') : t('layout.nav.openMenu')}
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Collapsed menu — carries the page links at every width
                    where the top bar doesn't show them, and the larger-text
                    toggle for the narrow widths where the bar has no room. */}
                {isMobileMenuOpen && (
                    <nav className={`${isSimpleView ? '' : '2xl:hidden'} bg-white border-b border-slate-100 shadow-lg absolute w-full`} aria-label={t('layout.nav.mobileAriaLabel')}>
                        <div className="flex flex-col p-4 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    aria-label={link.ariaLabel}
                                    className={`px-4 py-3 rounded-lg text-lg font-medium min-h-[48px] flex items-center ${
                                        location.pathname === link.path
                                            ? 'bg-emerald-100 text-emerald-800 font-bold'
                                            : 'text-slate-800 hover:bg-slate-100'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <button
                                onClick={toggleSimpleView}
                                aria-pressed={isSimpleView}
                                className={`md:hidden px-4 py-3 rounded-lg text-lg font-medium min-h-[48px] flex items-center gap-2 border-2 transition-colors ${
                                    isSimpleView
                                        ? 'bg-emerald-700 text-white border-emerald-700'
                                        : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                                }`}
                            >
                                {isSimpleView ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                                {isSimpleView ? t('layout.nav.simpleViewExit') : t('layout.nav.simpleView')}
                            </button>
                        </div>
                    </nav>
                )}
            </header>

            {/* Spanish offer for browsers that prefer Spanish — an invitation,
                never a redirect (see SpanishOfferBar). */}
            <SpanishOfferBar />

            {/* One-time larger-text offer: shown until dismissed or accepted,
                remembered per device. Larger text is a real accessibility
                asset (bigger type, higher contrast) that the header toggle
                alone doesn't surface to the people who need it. */}
            {showSimplePrompt && !isSimpleView && (
                <div className="bg-sky-50 border-b border-sky-200 px-4 py-2.5 no-print" role="region" aria-label={t('layout.nav.simplePrompt.ariaLabel')}>
                    <div className="container mx-auto flex items-center justify-center gap-x-4 gap-y-1 text-sm flex-wrap">
                        <span className="text-slate-800 font-medium">{t('layout.nav.simplePrompt.text')}</span>
                        <button
                            onClick={() => { toggleSimpleView(); dismissSimplePrompt(); }}
                            className="text-sky-800 font-bold underline hover:text-sky-900 min-h-[44px]"
                        >
                            {t('layout.nav.simplePrompt.tryIt')}
                        </button>
                        <button
                            onClick={dismissSimplePrompt}
                            className="text-slate-500 hover:text-slate-700 p-2"
                            aria-label={t('layout.nav.simplePrompt.dismissAria')}
                        >
                            <X size={16} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main id="main-content" className="flex-grow container mx-auto px-4 py-6 md:py-10">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-200 py-8 text-base no-print" role="contentinfo">
                <div className="container mx-auto px-4 text-center">
                    <p className="mb-4">
                        <Trans i18nKey="layout.footer.disclaimer" />
                    </p>
                    <p className="mb-4 text-slate-300 text-sm max-w-3xl mx-auto">
                        {t('layout.footer.nlm')}
                    </p>
                    <p className="mb-2 text-emerald-400 font-medium">
                        <Clock className="inline-block w-4 h-4 mr-1 -mt-0.5" aria-hidden="true" />
                        {t('layout.footer.lastUpdated', { date: new Date(LAST_UPDATED_ISO + 'T00:00:00').toLocaleDateString(i18n.resolvedLanguage?.startsWith('es') ? 'es' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) })}
                    </p>
                    <p>{t('layout.footer.copyright')}</p>
                    <p className="mt-4 text-slate-300 text-sm">{t('layout.footer.createdBy')}</p>
                    <p className="mt-2 text-slate-400 text-sm">
                        <a href="mailto:Ldavis@transplantmedicationnavigator.com" className="text-emerald-400 hover:text-emerald-300 underline break-all">Ldavis@transplantmedicationnavigator.com</a>
                    </p>
                    {/* Non-Discrimination Notice - Section 504 Compliance */}
                    <div className="mt-6 max-w-3xl mx-auto bg-slate-800 rounded-lg px-4 py-3 text-sm">
                        <p className="text-slate-300">
                            <strong className="text-slate-200">{t('layout.footer.nondiscrimination.label')}</strong>{t('layout.footer.nondiscrimination.text')}{' '}
                            <Link to="/accessibility#section-504" className="text-emerald-400 hover:text-emerald-300 underline transition">
                                {t('layout.footer.nondiscrimination.link')}
                            </Link>
                        </p>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
                        <Link to="/terms-and-conditions" className="text-slate-400 hover:text-emerald-400 underline transition">{t('layout.footer.links.terms')}</Link>
                        <span className="text-slate-600" aria-hidden="true">|</span>
                        <Link to="/privacy" className="text-slate-400 hover:text-emerald-400 underline transition">{t('layout.footer.links.privacy')}</Link>
                        <span className="text-slate-600" aria-hidden="true">|</span>
                        <Link to="/accessibility" className="text-slate-400 hover:text-emerald-400 underline transition">{t('layout.footer.links.accessibility')}</Link>
                        <span className="text-slate-600" aria-hidden="true">|</span>
                        <Link to="/feedback" className="text-slate-400 hover:text-emerald-400 underline transition">{t('layout.footer.links.feedback')}</Link>
                        <span className="text-slate-600" aria-hidden="true">|</span>
                        <button type="button" onClick={openConsentBanner} className="text-slate-400 hover:text-emerald-400 underline transition">{t('layout.footer.links.privacyChoices')}</button>
                        {!isSpanish && (
                            <>
                                <span className="text-slate-600" aria-hidden="true">|</span>
                                <Link to="/for-hospitals" className="text-slate-400 hover:text-emerald-400 underline transition">{t('layout.footer.links.hospitals')}</Link>
                                <span className="text-slate-600" aria-hidden="true">|</span>
                                <Link to="/pricing" className="text-slate-400 hover:text-emerald-400 underline transition">{t('layout.footer.links.pricing')}</Link>
                            </>
                        )}
                        <span className="text-slate-600" aria-hidden="true">|</span>
                        <Link to="/evidence" className="text-slate-400 hover:text-emerald-400 underline transition">{t('layout.footer.links.evidence')}</Link>
                        <span className="text-slate-600" aria-hidden="true">|</span>
                        <Link to="/admin/login" className="text-slate-400 hover:text-emerald-400 underline transition">{t('layout.footer.links.admin')}</Link>
                    </div>
                </div>
            </footer>

        </div>
    );
};

const PageLoadingFallback = () => (
    <div className="flex items-center justify-center min-h-[120px]">
        <div className="text-center">
            <Loader2 size={40} className="animate-spin text-emerald-600 mx-auto mb-4" aria-hidden="true" />
            <p className="text-slate-600 font-medium">Loading...</p>
        </div>
    </div>
);

// Safety net for /es/... paths reaching the router itself. Normally the
// /es prefix is absorbed by the router basename (set from the URL at page
// load), so these routes never match; they can only fire when a stale app
// shell state leaves the router on basename "/" while the path carries the
// prefix (e.g. an out-of-date service worker shell). Strip the prefix and
// switch to Spanish; LanguageUrlSync then moves the address back to the
// real /es/ URL.
const SpanishPathRedirect = () => {
    const location = useLocation();
    const { i18n } = useTranslation();
    useEffect(() => {
        if (i18n.language !== 'es') i18n.changeLanguage('es');
    }, [i18n]);
    const pathname = location.pathname.replace(/^\/es(?=\/|$)/, '') || '/';
    return <Navigate to={{ pathname, search: location.search, hash: location.hash }} replace />;
};

// Wrapper component for main site layout
const MainSiteRoutes = () => (
    <Layout>
        <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/es" element={<SpanishPathRedirect />} />
                <Route path="/es/*" element={<SpanishPathRedirect />} />
                <Route path="/about" element={<LazyAbout />} />
                <Route path="/wizard" element={<LazyWizard />} />
                <Route path="/my-path-quiz" element={<Navigate to="/wizard" replace />} />
                <Route path="/my-path" element={<Navigate to="/wizard" replace />} />
                <Route path="/quiz" element={<Navigate to="/wizard" replace />} />
                <Route path="/medications" element={<LazyMedicationSearch />} />
                <Route path="/medications/:slug" element={<LazyMedicationDetail />} />
                <Route path="/education" element={<LazyEducation />} />
                <Route path="/resources" element={<Navigate to="/education" replace />} />
                <Route path="/education/appeals" element={<LazyAppeals />} />
                <Route path="/application-help" element={<LazyApplicationHelp />} />
                <Route path="/grants-foundations" element={<Navigate to="/application-help" replace />} />
                <Route path="/grants" element={<Navigate to="/application-help" replace />} />
                <Route path="/faq" element={<LazyFAQ />} />
                <Route path="/my-medications" element={<LazyMyMedications />} />
                <Route path="/copay-reminders" element={<LazyCopayCardReminders />} />
                <Route path="/savings-tracker" element={<LazySavingsTracker />} />
                <Route path="/savings-calculator" element={<Navigate to="/savings-tracker" replace />} />
                <Route path="/calculator" element={<Navigate to="/savings-tracker" replace />} />
                <Route path="/survey" element={<LazySurveyLanding />} />
                <Route path="/survey/transplant" element={<LazyTransplantMedicationSurvey />} />
                <Route path="/survey/general" element={<LazyGeneralMedicationSurvey />} />
                <Route path="/feedback" element={<LazyFeedbackSurvey />} />
                <Route path="/for-hospitals" element={<LazyForHospitalAdmin />} />
                <Route path="/evidence" element={<LazyEvidence />} />
                <Route path="/research" element={<Navigate to="/evidence" replace />} />
                <Route path="/for-transplant-programs" element={<Navigate to="/pricing#transplant-programs" replace />} />
                <Route path="/for-employers" element={<Navigate to="/pricing#employers" replace />} />
                <Route path="/for-payers" element={<Navigate to="/pricing#payers" replace />} />
                <Route path="/pricing" element={<LazyPricing />} />
                <Route path="/terms-and-conditions" element={<LazyTermsAndConditions />} />
                <Route path="/terms" element={<Navigate to="/terms-and-conditions" replace />} />
                <Route path="/privacy" element={<LazyPrivacyPolicy />} />
                <Route path="/accessibility" element={<LazyAccessibility />} />
                <Route path="/pilot" element={<LazyPilot />} />
                <Route path="/pilot/:partner" element={<LazyPilot />} />
                <Route path="/demo" element={<LazyDemo />} />
                <Route path="/demo/:demoType" element={<LazyDemo />} />
                <Route path="/auth/epic/callback" element={<LazyEpicCallback />} />
                <Route path="/not-licensed" element={<LazyNotLicensed />} />
                <Route path="*" element={<LazyNotFound />} />
            </Routes>
        </Suspense>
    </Layout>
);

// Wrapper component for reporting admin routes (no main site layout)
const ReportingRoutes = () => {
    const location = useLocation();
    const isReportingRoute = location.pathname.startsWith('/reporting');

    if (!isReportingRoute) return null;

    return (
        <ReportingAuthProvider>
            <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                    <Route path="/reporting/login" element={<LazyReportingLogin />} />
                    <Route path="/reporting" element={<LazyReportingDashboard />} />
                    <Route path="/reporting/partners" element={<LazyReportingPartners />} />
                    <Route path="/reporting/programs" element={<LazyReportingPrograms />} />
                    <Route path="/reporting/funnel" element={<LazyReportingFunnel />} />
                    <Route path="/reporting/events" element={<LazyReportingEvents />} />
                    <Route path="/reporting/report/:partner" element={<LazyReportingPartnerReport />} />
                </Routes>
            </Suspense>
        </ReportingAuthProvider>
    );
};

// Wrapper component for hospital admin routes (no main site layout)
const AdminRoutes = () => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    if (!isAdminRoute) return null;

    return (
        <TenantProvider>
            <AuthProvider>
                <Suspense fallback={<PageLoadingFallback />}>
                    <Routes>
                        <Route path="/admin/login" element={<LazyAdminLogin />} />
                        <Route path="/admin" element={<LazyAdminDashboard />} />
                        <Route path="/admin/settings" element={<LazyOrganizationSettings />} />
                        <Route path="/admin/analytics" element={<LazyAnalytics />} />
                        <Route path="/admin/users" element={<LazyUserManagement />} />
                        <Route path="/admin/medications" element={<LazyMedicationConfig />} />
                        <Route path="/admin/features" element={<LazyFeatureSettings />} />
                        <Route path="/admin/impact" element={<LazyImpactReport />} />
                        <Route path="/admin/insights" element={<LazyInsights />} />
                        <Route path="/admin/compliance-overview" element={<LazyComplianceOverview />} />
                        <Route path="/admin/center-logins" element={<LazyCenterLogins />} />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </TenantProvider>
    );
};

// Route switcher component
const AppRoutes = () => {
    const location = useLocation();
    const isReportingRoute = location.pathname.startsWith('/reporting');
    const isAdminRoute = location.pathname.startsWith('/admin');

    if (isReportingRoute) {
        return <ReportingRoutes />;
    }

    if (isAdminRoute) {
        return <AdminRoutes />;
    }

    return (
        // TenantProvider so patient pages can read the center's config (the
        // emergency page shows a center's same-day escalation contact when
        // one is set). On the public site the slug resolves to 'public' and
        // the provider does no network work.
        <TenantProvider>
            <DisclaimerModal />
            <MainSiteRoutes />
        </TenantProvider>
    );
};

// App Component
const App = () => {
    return (
        <SimpleViewProvider>
            <MedicationsProvider>
                <ChatQuizProvider>
                    {/* Under /es/ the router runs with basename="/es": routes
                        and <Link>s stay unprefixed while every URL keeps the
                        Spanish prefix. Crossing the language boundary is a
                        full navigation (LanguageToggle, LanguageUrlSync). */}
                    <BrowserRouter basename={IN_ES_PATH ? '/es' : undefined}>
                        <DemoModeProvider>
                            <DemoBanner />
                            <ConsentBanner />
                            <GoogleAnalytics />
                            <ScrollToTop />
                            <LanguageUrlSync />
                            <RouteAnnouncer />
                            <AppRoutes />
                        </DemoModeProvider>
                    </BrowserRouter>
                </ChatQuizProvider>
            </MedicationsProvider>
        </SimpleViewProvider>
    );
};

export default App;
