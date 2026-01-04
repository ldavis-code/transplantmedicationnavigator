import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SavingsCalculator from '../components/SavingsCalculator';
import LogSavingsForm from '../components/LogSavingsForm';
import SavingsDashboard from '../components/SavingsDashboard';
import { syncPendingEntries } from '../lib/savingsApi';
import { useMedications } from '../context/MedicationsContext';

// Check localStorage for subscription status (set by Account page)
function useLocalSubscription() {
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        try {
            const cached = localStorage.getItem('tmn_subscription');
            if (cached) {
                const { data } = JSON.parse(cached);
                setIsPro(data?.plan === 'pro' && data?.subscription_status === 'active');
            }
        } catch (e) {
            // Ignore errors, default to free
        }
    }, []);

    return { isPro };
}

export default function SavingsTracker() {
    const [activeTab, setActiveTab] = useState('calculator');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [syncMessage, setSyncMessage] = useState(null);
    const { medications } = useMedications();
    const { isPro } = useLocalSubscription();

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

    const handleSavingsLogged = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleUpgrade = () => {
        window.location.href = '/pricing';
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                    <Link
                        to="/my-medications"
                        className="text-white/80 hover:text-white flex items-center gap-1 text-sm"
                    >
                        <ArrowLeft size={16} />
                        My Medications
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <Calculator size={32} />
                    <div>
                        <h1 className="text-2xl font-bold">Savings Calculator</h1>
                        <p className="text-emerald-100">
                            See how much you could save with assistance programs
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
                <button
                    onClick={() => setActiveTab('calculator')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                        activeTab === 'calculator'
                            ? 'bg-white text-emerald-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Calculator size={18} />
                    Estimate Savings
                </button>
                <button
                    onClick={() => setActiveTab('tracker')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                        activeTab === 'tracker'
                            ? 'bg-white text-emerald-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <TrendingUp size={18} />
                    Track Actual Savings
                </button>
            </div>

            {/* Sync Message */}
            {syncMessage && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg mb-6 text-sm">
                    {syncMessage}
                </div>
            )}

            {/* Calculator Tab */}
            {activeTab === 'calculator' && (
                <SavingsCalculator
                    medications={medications || []}
                    isPro={isPro}
                    onUpgrade={handleUpgrade}
                />
            )}

            {/* Tracker Tab */}
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
    );
}
