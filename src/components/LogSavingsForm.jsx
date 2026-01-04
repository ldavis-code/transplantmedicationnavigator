import { useState } from 'react';
import { DollarSign, Check, AlertCircle, Loader2 } from 'lucide-react';
import { logSavings, programTypeLabels } from '../lib/savingsApi';

export default function LogSavingsForm({ onSuccess, medications = [] }) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [formData, setFormData] = useState({
        medicationName: '',
        medicationId: '',
        programName: '',
        programType: '',
        originalPrice: '',
        paidPrice: '',
        fillDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-populate medication ID if selecting from list
        if (name === 'medicationName' && medications.length > 0) {
            const found = medications.find(m =>
                m.brandName?.toLowerCase() === value.toLowerCase() ||
                m.genericName?.toLowerCase() === value.toLowerCase()
            );
            if (found) {
                setFormData(prev => ({ ...prev, medicationId: found.id }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        // Validation
        if (!formData.medicationName.trim()) {
            setMessage({ text: 'Please enter a medication name', type: 'error' });
            return;
        }
        if (!formData.originalPrice || parseFloat(formData.originalPrice) <= 0) {
            setMessage({ text: 'Please enter the original price', type: 'error' });
            return;
        }
        if (formData.paidPrice === '' || parseFloat(formData.paidPrice) < 0) {
            setMessage({ text: 'Please enter what you paid (can be $0)', type: 'error' });
            return;
        }
        if (parseFloat(formData.paidPrice) > parseFloat(formData.originalPrice)) {
            setMessage({ text: 'Paid price cannot exceed original price', type: 'error' });
            return;
        }

        setIsLoading(true);

        try {
            const result = await logSavings({
                medicationId: formData.medicationId || null,
                medicationName: formData.medicationName.trim(),
                programName: formData.programName.trim() || null,
                programType: formData.programType || null,
                originalPrice: parseFloat(formData.originalPrice),
                paidPrice: parseFloat(formData.paidPrice),
                fillDate: formData.fillDate || null,
                notes: formData.notes.trim() || null
            });

            setMessage({
                text: `Saved $${result.amountSaved.toFixed(2)}! Total savings: $${parseFloat(result.totalSaved).toFixed(2)}`,
                type: 'success'
            });

            // Reset form
            setFormData({
                medicationName: '',
                medicationId: '',
                programName: '',
                programType: '',
                originalPrice: '',
                paidPrice: '',
                fillDate: new Date().toISOString().split('T')[0],
                notes: ''
            });

            // Notify parent component
            if (onSuccess) {
                onSuccess(result);
            }

        } catch (error) {
            setMessage({
                text: 'Failed to save. Entry stored locally and will sync later.',
                type: 'warning'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const savingsPreview = formData.originalPrice && formData.paidPrice !== ''
        ? Math.max(0, parseFloat(formData.originalPrice) - parseFloat(formData.paidPrice))
        : null;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
                <DollarSign className="text-emerald-600" size={24} aria-hidden="true" />
                <h3 className="text-lg font-bold text-slate-900">Log Your Savings</h3>
            </div>

            <p className="text-sm text-slate-600 mb-4">
                Did you just fill a prescription using an assistance program? Log it here to track your savings!
            </p>
            <p className="text-xs text-slate-500 mb-6">
                <strong>Anonymous tracking:</strong> Your data is stored locally on your device only.
            </p>

            {/* Status message with aria-live for screen reader announcements */}
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                id="form-message"
                className={message.text ? `mb-4 p-3 rounded-lg flex items-center gap-2 ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    message.type === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                    'bg-red-50 text-red-800 border border-red-200'
                }` : 'sr-only'}
            >
                {message.text && (
                    <>
                        {message.type === 'success' ? <Check size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}
                        <span className="text-sm">{message.text}</span>
                    </>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" aria-describedby={message.type === 'error' ? 'form-message' : undefined}>
                {/* Medication Name */}
                <div>
                    <label htmlFor="medicationName" className="block text-sm font-medium text-slate-700 mb-1">
                        Medication Name <span aria-hidden="true">*</span>
                        <span className="sr-only">(required)</span>
                    </label>
                    <input
                        type="text"
                        id="medicationName"
                        name="medicationName"
                        value={formData.medicationName}
                        onChange={handleChange}
                        placeholder="e.g., Tacrolimus, Eliquis"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        list="medication-suggestions"
                        required
                        aria-required="true"
                        aria-invalid={message.type === 'error' && message.text.includes('medication') ? 'true' : undefined}
                        aria-describedby={message.type === 'error' && message.text.includes('medication') ? 'form-message' : undefined}
                    />
                    {medications.length > 0 && (
                        <datalist id="medication-suggestions">
                            {medications.map(med => (
                                <option key={med.id} value={med.brandName || med.genericName} />
                            ))}
                        </datalist>
                    )}
                </div>

                {/* Program Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="programName" className="block text-sm font-medium text-slate-700 mb-1">
                            Program Used
                        </label>
                        <input
                            type="text"
                            id="programName"
                            name="programName"
                            value={formData.programName}
                            onChange={handleChange}
                            placeholder="e.g., HealthWell Foundation"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="programType" className="block text-sm font-medium text-slate-700 mb-1">
                            Program Type
                        </label>
                        <select
                            id="programType"
                            name="programType"
                            value={formData.programType}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="">Select type...</option>
                            {Object.entries(programTypeLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="originalPrice" className="block text-sm font-medium text-slate-700 mb-1">
                            Original Price <span aria-hidden="true">*</span> <span className="text-slate-600 font-normal">(without assistance)</span>
                            <span className="sr-only">(required)</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" aria-hidden="true">$</span>
                            <input
                                type="number"
                                id="originalPrice"
                                name="originalPrice"
                                value={formData.originalPrice}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                required
                                aria-required="true"
                                aria-invalid={message.type === 'error' && message.text.includes('original') ? 'true' : undefined}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="paidPrice" className="block text-sm font-medium text-slate-700 mb-1">
                            What You Paid <span aria-hidden="true">*</span> <span className="text-slate-600 font-normal">(after assistance)</span>
                            <span className="sr-only">(required)</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" aria-hidden="true">$</span>
                            <input
                                type="number"
                                id="paidPrice"
                                name="paidPrice"
                                value={formData.paidPrice}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                required
                                aria-required="true"
                                aria-invalid={message.type === 'error' && message.text.includes('paid') ? 'true' : undefined}
                            />
                        </div>
                    </div>
                </div>

                {/* Savings Preview */}
                {savingsPreview !== null && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                        <span className="text-sm text-emerald-700">You saved</span>
                        <div className="text-3xl font-bold text-emerald-600">
                            ${savingsPreview.toFixed(2)}
                        </div>
                    </div>
                )}

                {/* Fill Date */}
                <div>
                    <label htmlFor="fillDate" className="block text-sm font-medium text-slate-700 mb-1">
                        Fill Date
                    </label>
                    <input
                        type="date"
                        id="fillDate"
                        name="fillDate"
                        value={formData.fillDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>

                {/* Notes */}
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
                        Notes <span className="text-slate-600 font-normal">(optional)</span>
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Any additional details..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} aria-hidden="true" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Check size={20} aria-hidden="true" />
                            Log Savings
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
