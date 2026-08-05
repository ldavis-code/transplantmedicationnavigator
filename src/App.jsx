import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
// Lazy loaded page components for code splitting
const LazyFAQ = lazy(() => import('./pages/FAQ.jsx'));
const LazyHome = lazy(() => import('./pages/main/Home.jsx'));
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
// First-visit disclaimer modal
import DisclaimerModal from './components/DisclaimerModal.jsx';
// Paywall modal for free tier limits
// AI Medication Assistant Chat Widget
// Lazy: the chat widget is a floating helper, not first-paint content, and
// its code + print styles are heavy enough to earn their own chunk.
const MedicationAssistantChat = lazy(() => import('./components/MedicationAssistantChat.jsx'));
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
import { LAST_UPDATED, TransplantStatus } from './data/constants.js';
import MEDICATIONS_DATA from './data/medications.json';
// Sparse Spanish overlay for patient-facing program text (maxBenefit/notes)
// Spanish overlay for the wizard's organ medication guides (titles,
// descriptions, class display names, per-med notes)
import ASSISTANT_KNOWLEDGE_BASE_DATA from './data/knowledge-base.json';
import QUICK_ACTIONS_DATA from './data/quick-actions.json';
import { ORGAN_MEDICATIONS, PRE_TRANSPLANT_MEDICATIONS } from './data/organMedications.js';
// Initialize data from imported JSON files - MEDICATIONS_DATA is used as fallback
// Medications will be fetched from the database API when available
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

// Applies ?lang= on every navigation, not only on the initial page load
// (which i18n.js handles at module init). This covers in-app navigations to
// links that carry ?lang=es and any load path where the initial detection
// was missed — e.g. an app shell restored by an out-of-date service worker.
const LanguageParamSync = () => {
    const { search } = useLocation();
    const { i18n } = useTranslation();
    useEffect(() => {
        const param = new URLSearchParams(search).get('lang');
        if ((param === 'en' || param === 'es') && i18n.resolvedLanguage !== param) {
            i18n.changeLanguage(param);
        }
    }, [search, i18n]);
    return null;
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

    // B2B pages (hospital sales, plan pricing) are English-only offerings —
    // they are hidden from the Spanish patient experience.
    const isSpanish = i18n.resolvedLanguage === 'es';
    const B2B_PATHS = ['/for-hospitals', '/pricing'];

    const navLinks = [
        { path: '/', label: t('layout.nav.links.home.label'), ariaLabel: t('layout.nav.links.home.ariaLabel') },
        { path: '/wizard', label: t('layout.nav.links.wizard.label'), ariaLabel: t('layout.nav.links.wizard.ariaLabel') },
        { path: '/education', label: t('layout.nav.links.education.label'), ariaLabel: t('layout.nav.links.education.ariaLabel') },
        { path: '/application-help', label: t('layout.nav.links.applicationHelp.label'), ariaLabel: t('layout.nav.links.applicationHelp.ariaLabel') },
        { path: '/savings-tracker', label: t('layout.nav.links.savingsTracker.label'), ariaLabel: t('layout.nav.links.savingsTracker.ariaLabel') },
        { path: '/for-hospitals', label: t('layout.nav.links.hospitals.label'), ariaLabel: t('layout.nav.links.hospitals.ariaLabel') },
        { path: '/pricing', label: t('layout.nav.links.pricing.label'), ariaLabel: t('layout.nav.links.pricing.ariaLabel') },
        { path: '/faq', label: t('layout.nav.links.faq.label'), ariaLabel: t('layout.nav.links.faq.ariaLabel') },
        { path: '/feedback', label: t('layout.nav.links.feedback.label'), ariaLabel: t('layout.nav.links.feedback.ariaLabel') },
    ].filter((link) => !isSpanish || !B2B_PATHS.includes(link.path));

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
            {/* Safety Banner */}
            <div className="bg-emerald-800 text-white px-4 py-3 text-base text-center font-medium no-print" role="alert">
                <span className="inline-flex items-center justify-center gap-2">
                    <ShieldAlert size={18} className="text-emerald-100" aria-hidden="true" />
                    {t('layout.banner.text')}
                </span>
            </div>

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
                    <Link to="/" className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition" aria-label={t('layout.nav.brandAriaLabel')}>
                        <img src="/photos/logo.png" alt="" width={32} height={32} aria-hidden="true" className="flex-shrink-0" />
                        <span className="font-bold text-lg md:text-xl leading-tight">
                            {t('layout.nav.brandLine1')}<br className="md:hidden"/>{t('layout.nav.brandLine2')}<sup className="text-xs">{t('layout.nav.brandTm')}</sup>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-4" aria-label={t('layout.nav.mainAriaLabel')}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                aria-label={link.ariaLabel}
                                className={`text-base font-medium transition-colors px-3 py-2 rounded-lg min-h-[44px] flex items-center ${
                                    location.pathname === link.path
                                        ? 'text-emerald-700 font-bold bg-emerald-50 border-b-2 border-emerald-600'
                                        : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <button
                            onClick={toggleSimpleView}
                            aria-pressed={isSimpleView}
                            className={`ml-2 px-3 py-2 rounded-lg text-base font-medium min-h-[44px] flex items-center gap-2 border-2 transition-colors ${
                                isSimpleView
                                    ? 'bg-emerald-700 text-white border-emerald-700'
                                    : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-600 hover:text-emerald-700'
                            }`}
                        >
                            {isSimpleView ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                            {t('layout.nav.simpleView')}
                        </button>
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? t('layout.nav.closeMenu') : t('layout.nav.openMenu')}
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Nav */}
                {isMobileMenuOpen && (
                    <nav className="md:hidden bg-white border-b border-slate-100 shadow-lg absolute w-full" aria-label={t('layout.nav.mobileAriaLabel')}>
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
                                className={`px-4 py-3 rounded-lg text-lg font-medium min-h-[48px] flex items-center gap-2 border-2 transition-colors ${
                                    isSimpleView
                                        ? 'bg-emerald-700 text-white border-emerald-700'
                                        : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                                }`}
                            >
                                {isSimpleView ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                                {t('layout.nav.simpleView')}
                            </button>
                        </div>
                    </nav>
                )}
            </header>

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
                        {t('layout.footer.lastUpdated', { date: LAST_UPDATED })}
                    </p>
                    <p>{t('layout.footer.copyright')}</p>
                    <p className="mt-4 text-slate-300 text-sm">{t('layout.footer.createdBy')}</p>
                    <p className="mt-2 text-slate-400 text-sm">
                        <a href="mailto:info@transplantmedicationnavigator.com" className="text-emerald-400 hover:text-emerald-300 underline">info@transplantmedicationnavigator.com</a>
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
                            </>
                        )}
                        <span className="text-slate-600" aria-hidden="true">|</span>
                        <Link to="/evidence" className="text-slate-400 hover:text-emerald-400 underline transition">{t('layout.footer.links.evidence')}</Link>
                        <span className="text-slate-600" aria-hidden="true">|</span>
                        <Link to="/admin/login" className="text-slate-400 hover:text-emerald-400 underline transition">{t('layout.footer.links.admin')}</Link>
                    </div>
                </div>
            </footer>

            {/* AI Medication Assistant Chat Widget */}
            <Suspense fallback={null}>
                <MedicationAssistantChat />
            </Suspense>
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

// The /es path convention maps to the real language mechanism: Netlify
// redirects /es/* to /:splat?lang=es server-side, but an installed service
// worker can serve the app shell before the request reaches the server, so
// the router needs its own handler or these URLs land on the 404 page.
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
                <Route path="/" element={<LazyHome />} />
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
        <>
            <DisclaimerModal />
            <MainSiteRoutes />
        </>
    );
};

// App Component
const App = () => {
    return (
        <SimpleViewProvider>
            <MedicationsProvider>
                <ChatQuizProvider>
                    <BrowserRouter>
                        <DemoModeProvider>
                            <DemoBanner />
                            <ConsentBanner />
                            <GoogleAnalytics />
                            <ScrollToTop />
                            <LanguageParamSync />
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
