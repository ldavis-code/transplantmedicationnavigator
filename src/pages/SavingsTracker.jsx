import { useState, useEffect, useCallback } from 'react';
import { Calculator, TrendingUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SavingsCalculator from '../components/SavingsCalculator';
import LogSavingsForm from '../components/LogSavingsForm';
import SavingsDashboard from '../components/SavingsDashboard';
import PaywallModal from '../components/PaywallModal';
import { syncPendingEntries } from '../lib/savingsApi';
import { useMedications } from '../context/MedicationsContext';
import { useChatQuiz } from '../context/ChatQuizContext';
import { useMetaTags } from '../hooks/useMetaTags';
import { seoMetadata } from '../data/seo-metadata';

// Check localStorage for subscription status and promo code access
function useLocalSubscription(feature = null) {
    const [isPro, setIsPro] = useState(false);
    const [hasPromoAccess, setHasPromoAccess] = useState(false);

    const checkAccess = useCallback(() => {
        let proStatus = false;
        let promoStatus = false;

        try {
            const cached = localStorage.getItem('tmn_subscription');
            if (cached) {
                const { data } = JSON.parse(cached);
                proStatus = data?.plan === 'pro' && data?.subscription_status === 'active';
            }
        } catch (e) {
            // Ignore errors, default to free
        }

        // Check promo code access for specific feature
        if (feature) {
            try {
                const promoCodes = localStorage.getItem('tmn_promo_codes');
                if (promoCodes) {
                    const redeemed = JSON.parse(promoCodes);
                    promoStatus = redeemed.some(r => r.features && r.features.includes(feature));
                }
            } catch (e) {
                // Ignore errors
            }
        }

        setIsPro(proStatus);
        setHasPromoAccess(promoStatus);
    }, [feature]);

    useEffect(() => {
        checkAccess();
    }, [checkAccess]);

    return { isPro, hasPromoAccess, hasAccess: isPro || hasPromoAccess, refreshAccess: checkAccess };
}

export default function SavingsTracker() {
    useMetaTags(seoMetadata.savingsTracker);

    const [activeTab, setActiveTab] = useState('calculator');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [syncMessage, setSyncMessage] = useState(null);
    const [showPaywall, setShowPaywall] = useState(false);
    const { medications } = useMedications();
    const { isPro, hasAccess, refreshAccess } = useLocalSubscription('calculator');
    const {
        incrementCalculatorUses,
        isCalculatorLimitReached,
        remainingCalculatorUses
    } = useChatQuiz();

    // Handler for successful promo code redemption
    const handlePromoSuccess = () => {
        refreshAccess();
        setShowPaywall(false);
    };

    // Try to sync any pending local entries on mount
    useEffect(() => {
        async function trySync() {
            try {
                const result = await syncPendingEntries();
                if (result.synced > 0) {
                    setSyncMessage(`Synced ${result.synced} pending entries`);
                    setRefreshTrigger(prev => prev + 1);
                    setTimeout(() => setSyncMessage(null), 3000);
                }
            } catch (error) {
                console.error('Sync error:', error);
            }
        }
        trySync();
    }, []);

    // Show paywall immediately for non-Pro users without promo access (calculator is Pro-only feature)
    useEffect(() => {
        if (!hasAccess && isCalculatorLimitReached && activeTab === 'calculator') {
            setShowPaywall(true);
        }
    }, [hasAccess, isCalculatorLimitReached, activeTab]);

    const handleSavingsLogged = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleUpgrade = () => {
        window.location.href = '/pricing';
    };

    // Handler for when user attempts to calculate savings
    const handleCalculate = () => {
        // Pro users and promo code users always have access
        if (hasAccess) {
            return true;
        }
        // Check if free tier limit is reached
        if (isCalculatorLimitReached) {
            setShowPaywall(true);
            return false;
        }
        // Increment calculator uses count
        incrementCalculatorUses();
        return true;
    };

    return (
        <>
        <PaywallModal
            isOpen={showPaywall}
            onClose={() => setShowPaywall(false)}
            featureType="calculator"
            onPromoSuccess={handlePromoSuccess}
        />
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                    <Link
                        to="/my-medications"
                        className="text-white/80 hover:text-white flex items-center gap-1 text-sm min-h-[44px] min-w-[44px]"
                        aria-label="Go back to My Medications page"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        My Medications
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <Calculator size={32} aria-hidden="true" />
                    <div>
                        <h1 className="text-2xl font-bold">Savings Calculator</h1>
                        <p className="text-emerald-100">
                            See how much you could save with assistance programs
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl" role="tablist" aria-label="Savings options">
                <button
                    onClick={() => setActiveTab('calculator')}
                    role="tab"
                    id="tab-calculator"
                    aria-selected={activeTab === 'calculator'}
                    aria-controls="tabpanel-calculator"
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors min-h-[44px] ${
                        activeTab === 'calculator'
                            ? 'bg-white text-emerald-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Calculator size={18} aria-hidden="true" />
                    Estimate Savings
                </button>
                <button
                    onClick={() => setActiveTab('tracker')}
                    role="tab"
                    id="tab-tracker"
                    aria-selected={activeTab === 'tracker'}
                    aria-controls="tabpanel-tracker"
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors min-h-[44px] ${
                        activeTab === 'tracker'
                            ? 'bg-white text-emerald-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <TrendingUp size={18} aria-hidden="true" />
                    Track Actual Savings
                </button>
            </div>

            {/* Sync Message */}
            {syncMessage && (
                <div role="status" aria-live="polite" className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg mb-6 text-sm">
                    {syncMessage}
                </div>
            )}

            {/* Calculator Tab */}
            <div
                role="tabpanel"
                id="tabpanel-calculator"
                aria-labelledby="tab-calculator"
                hidden={activeTab !== 'calculator'}
            >
            {activeTab === 'calculator' && (
                <>
                    <SavingsCalculator
                        medications={medications || []}
                        isPro={hasAccess}
                        onUpgrade={handleUpgrade}
                        onCalculate={handleCalculate}
                        remainingCalculations={remainingCalculatorUses}
                    />
                </>
            )}
            </div>

            {/* Tracker Tab */}
            <div
                role="tabpanel"
                id="tabpanel-tracker"
                aria-labelledby="tab-tracker"
                hidden={activeTab !== 'tracker'}
            >
            {activeTab === 'tracker' && (
                <>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column: Log Form */}
                        <div>
                            <LogSavingsForm
                                onSuccess={handleSavingsLogged}
                                medications={medications || []}
                            />

                            {/* Tips */}
                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <h4 className="font-semibold text-blue-900 mb-2">Tips for Tracking</h4>
                                <ul className="text-sm text-blue-800 space-y-2">
                                    <li>• Log each prescription fill as you pick it up</li>
                                    <li>• Include what you would have paid without assistance</li>
                                    <li>• Check your pharmacy receipt for the "You Saved" amount</li>
                                    <li>• Track different program types to see which save you most</li>
                                </ul>
                            </div>
                        </div>

                        {/* Right Column: Dashboard */}
                        <div>
                            <SavingsDashboard refreshTrigger={refreshTrigger} />
                        </div>
                    </div>

                    {/* Call to Action for Programs */}
                    <div className="mt-8 bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
                        <h3 className="font-bold text-purple-900 mb-2">Want to save more?</h3>
                        <p className="text-purple-700 mb-4">
                            Use our medication search to find Patient Assistance Programs, foundation grants,
                            and copay cards for your specific medications.
                        </p>
                        <Link
                            to="/medications"
                            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                            Search Medications
                        </Link>
                    </div>
                </>
            )}
            </div>
        </div>
        </>
    );
}
