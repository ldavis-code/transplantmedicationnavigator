import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Pill, DollarSign, Trash2, RefreshCw, Share2, Award } from 'lucide-react';
import { fetchSavingsSummary, fetchSavingsEntries, deleteSavingsEntry, programTypeLabels } from '../lib/savingsApi';
import { useConfirmDialog } from './ConfirmDialog';

export default function SavingsDashboard({ refreshTrigger }) {
    const [summary, setSummary] = useState(null);
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEntries, setShowEntries] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const { showConfirm, showAlert, DialogComponent } = useConfirmDialog();

    useEffect(() => {
        loadData();
    }, [refreshTrigger]);

    async function loadData() {
        setIsLoading(true);
        setError(null);
        try {
            const [summaryData, entriesData] = await Promise.all([
                fetchSavingsSummary(),
                fetchSavingsEntries(20)
            ]);
            setSummary(summaryData);
            setEntries(entriesData.entries || []);
        } catch (err) {
            console.error('Error loading savings data:', err);
            setError('Having trouble loading right now. Try again in a moment.');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(entryId) {
        const confirmed = await showConfirm({
            title: 'Delete Entry',
            message: 'Are you sure you want to delete this savings entry? This cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'confirm'
        });
        if (!confirmed) return;

        setDeleteLoading(entryId);
        try {
            await deleteSavingsEntry(entryId);
            setEntries(prev => prev.filter(e => e.id !== entryId));
            loadData(); // Refresh totals
        } catch (error) {
            await showAlert({
                title: 'Error',
                message: 'Failed to delete entry. Please try again.',
                type: 'error'
            });
        } finally {
            setDeleteLoading(null);
        }
    }

    async function handleShare() {
        const total = summary?.summary?.total_saved || 0;
        const text = `I've saved $${parseFloat(total).toFixed(2)} on my medications with Transplant Med Navigator! Track your savings too: transplantmednavigator.com`;

        if (navigator.share) {
            navigator.share({ text });
        } else {
            navigator.clipboard.writeText(text);
            await showAlert({
                title: 'Copied!',
                message: 'Your savings summary has been copied to clipboard.',
                type: 'success',
                confirmText: 'OK'
            });
        }
    }

    if (isLoading && !summary) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-24 bg-slate-100 rounded"></div>
            </div>
        );
    }

    if (error && !summary) {
        return (
            <div className="bg-red-50 rounded-xl border border-red-200 p-6" role="alert">
                <div className="flex flex-col items-center text-center">
                    <RefreshCw className="text-red-400 mb-3" size={32} aria-hidden="true" />
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors min-h-[44px] flex items-center gap-2"
                    >
                        <RefreshCw size={16} aria-hidden="true" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const totalSaved = parseFloat(summary?.summary?.total_saved) || 0;
    const totalEntries = parseInt(summary?.summary?.total_entries) || 0;
    const avgPerFill = parseFloat(summary?.summary?.avg_savings_per_fill) || 0;
    const uniqueMeds = parseInt(summary?.summary?.unique_medications) || 0;

    // Milestone badges
    const milestones = [
        { amount: 100, label: 'First $100', emoji: '🌱' },
        { amount: 500, label: '$500 Club', emoji: '🌟' },
        { amount: 1000, label: '$1K Saved', emoji: '🎉' },
        { amount: 2500, label: '$2.5K Hero', emoji: '🏆' },
        { amount: 5000, label: '$5K Legend', emoji: '👑' },
        { amount: 10000, label: '$10K Champion', emoji: '💎' }
    ];
    const achievedMilestones = milestones.filter(m => totalSaved >= m.amount);
    const nextMilestone = milestones.find(m => totalSaved < m.amount);

    return (
        <>
            {DialogComponent}
            <div className="space-y-6">
            {/* Error Banner (shown when refresh fails but data exists) */}
            {error && summary && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between" role="alert">
                    <p className="text-red-700 text-sm">{error}</p>
                    <button
                        onClick={loadData}
                        className="text-red-600 hover:text-red-800 text-sm font-medium underline ml-4"
                    >
                        Retry
                    </button>
                </div>
            )}
            {/* Main Stats Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="text-emerald-600" size={24} aria-hidden="true" />
                        <h3 className="text-lg font-bold text-emerald-900">Your Total Savings</h3>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadData}
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label="Refresh savings data"
                            title="Refresh"
                        >
                            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
                            {isLoading && <span className="sr-only">Loading...</span>}
                        </button>
                        {totalSaved > 0 && (
                            <button
                                onClick={handleShare}
                                className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label="Share your savings on social media"
                                title="Share your savings"
                            >
                                <Share2 size={18} aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="text-center py-4">
                    <div className="text-5xl font-bold text-emerald-600 mb-2">
                        ${totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-emerald-700">
                        across {totalEntries} {totalEntries === 1 ? 'fill' : 'fills'}
                    </p>
                </div>

                {/* Progress to next milestone */}
                {nextMilestone && (
                    <div className="mt-4 bg-white/50 rounded-lg p-3">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-emerald-700">Progress to {nextMilestone.label}</span>
                            <span className="text-emerald-800 font-medium">
                                ${totalSaved.toFixed(0)} / ${nextMilestone.amount}
                            </span>
                        </div>
                        <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (totalSaved / nextMilestone.amount) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Achieved Milestones */}
                {achievedMilestones.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        {achievedMilestones.map(m => (
                            <span key={m.amount} className="bg-white px-3 py-1 rounded-full text-sm font-medium text-emerald-800 border border-emerald-200">
                                {m.emoji} {m.label}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Stats Grid */}
            {totalEntries > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                        <DollarSign className="mx-auto text-blue-500 mb-2" size={24} aria-hidden="true" />
                        <div className="text-2xl font-bold text-slate-900">${avgPerFill.toFixed(0)}</div>
                        <div className="text-sm text-slate-500">Avg per fill</div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                        <Pill className="mx-auto text-purple-500 mb-2" size={24} aria-hidden="true" />
                        <div className="text-2xl font-bold text-slate-900">{uniqueMeds}</div>
                        <div className="text-sm text-slate-500">Medications</div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                        <Calendar className="mx-auto text-amber-500 mb-2" size={24} aria-hidden="true" />
                        <div className="text-2xl font-bold text-slate-900">{totalEntries}</div>
                        <div className="text-sm text-slate-500">Total fills</div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                        <Award className="mx-auto text-emerald-500 mb-2" size={24} aria-hidden="true" />
                        <div className="text-2xl font-bold text-slate-900">{achievedMilestones.length}</div>
                        <div className="text-sm text-slate-500">Milestones</div>
                    </div>
                </div>
            )}

            {/* Monthly Breakdown */}
            {summary?.monthly?.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h4 className="font-bold text-slate-900 mb-4">Monthly Savings</h4>
                    <div className="space-y-3">
                        {summary.monthly.slice(0, 6).map((month, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-slate-600">
                                    {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </span>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full"
                                            style={{
                                                width: `${Math.min(100, (parseFloat(month.monthly_saved) / Math.max(...summary.monthly.map(m => parseFloat(m.monthly_saved)))) * 100)}%`
                                            }}
                                        />
                                    </div>
                                    <span className="font-medium text-emerald-700 w-20 text-right">
                                        ${parseFloat(month.monthly_saved).toFixed(0)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Savings by Program Type */}
            {summary?.byProgram?.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h4 className="font-bold text-slate-900 mb-4">Savings by Program Type</h4>
                    <div className="space-y-3">
                        {summary.byProgram.map((program, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-slate-600">
                                    {programTypeLabels[program.program_type] || program.program_type}
                                </span>
                                <span className="font-medium text-slate-900">
                                    ${parseFloat(program.total_saved).toFixed(2)}
                                    <span className="text-slate-600 text-sm ml-1">({program.count} fills)</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Entries */}
            {entries.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-900">Recent Savings</h4>
                        <button
                            onClick={() => setShowEntries(!showEntries)}
                            className="text-sm text-emerald-600 hover:text-emerald-700 min-h-[44px] px-3 flex items-center"
                            aria-expanded={showEntries}
                        >
                            {showEntries ? 'Hide entries' : `Show all (${entries.length})`}
                        </button>
                    </div>
                    <div className="space-y-3">
                        {(showEntries ? entries : entries.slice(0, 3)).map(entry => (
                            <div key={entry.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                <div>
                                    <div className="font-medium text-slate-900">{entry.medication_name}</div>
                                    <div className="text-sm text-slate-500">
                                        {entry.program_name && <span>{entry.program_name} • </span>}
                                        {entry.fill_date && new Date(entry.fill_date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-emerald-600">
                                        +${parseFloat(entry.amount_saved).toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        disabled={deleteLoading === entry.id}
                                        className="p-2 text-slate-500 hover:text-red-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                                        aria-label={`Delete savings entry for ${entry.medication_name}`}
                                    >
                                        <Trash2 size={16} className={deleteLoading === entry.id ? 'animate-spin' : ''} aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {totalEntries === 0 && !isLoading && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center">
                    <DollarSign className="mx-auto text-slate-500 mb-4" size={48} aria-hidden="true" />
                    <h4 className="font-bold text-slate-900 mb-2">No savings logged yet</h4>
                    <p className="text-slate-600 text-sm">
                        Use the form above to log your first medication savings and start tracking your progress!
                    </p>
                </div>
            )}
            </div>
        </>
    );
}
