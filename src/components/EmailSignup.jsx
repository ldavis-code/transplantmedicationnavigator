/**
 * EmailSignup Component
 * Reusable email collection component that reads medications from localStorage
 * and sends confirmation email via subscribe-alerts function
 */

import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// localStorage key for medications (matches MyMedications page)
const MEDICATIONS_STORAGE_KEY = 'tmn_my_medications';

/**
 * Get medications from localStorage
 * @returns {Array} Array of medication objects
 */
function getMedicationsFromStorage() {
    try {
        const stored = localStorage.getItem(MEDICATIONS_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error reading medications from localStorage:', e);
    }
    return [];
}

/**
 * EmailSignup - Collects user email and sends medication assistance plan
 *
 * @param {Object} props
 * @param {string} [props.title] - Optional title override
 * @param {string} [props.description] - Optional description override
 * @param {Function} [props.onSuccess] - Callback when signup succeeds
 * @param {Function} [props.onError] - Callback when signup fails
 * @param {Array} [props.medications] - Optional medications array (defaults to localStorage)
 * @param {string} [props.className] - Additional CSS classes
 */
export default function EmailSignup({
    title = 'Get Your Medication Assistance Plan',
    description = 'Enter your email to receive personalized savings strategies for your medications.',
    onSuccess,
    onError,
    medications: propMedications,
    className = ''
}) {
    const [email, setEmail] = useState('');
    const [wantsUpdates, setWantsUpdates] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Email validation
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }
        if (!isValidEmail(email.trim())) {
            setError('Please enter a valid email address');
            return;
        }

        setError('');
        setIsSubmitting(true);

        // Use provided medications or fetch from localStorage
        const medications = propMedications || getMedicationsFromStorage();

        try {
            const response = await fetch('/.netlify/functions/subscribe-alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    medications,
                    wantsUpdates
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to subscribe');
            }

            setSuccess(true);
            setEmail('');
            setWantsUpdates(false);
            onSuccess?.(data);
        } catch (err) {
            console.error('Error subscribing:', err);
            setError(err.message || 'Something went wrong. Please try again.');
            onError?.(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success state
    if (success) {
        return (
            <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Check Your Inbox!</h3>
                    <p className="text-slate-600 mb-4">
                        We've sent your personalized medication assistance plan to your email.
                    </p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="text-teal-600 hover:text-teal-700 font-medium underline"
                    >
                        Sign up another email
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                </div>
            </div>

            <p className="text-slate-600 mb-4">{description}</p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700 mb-1">
                        Email Address
                    </label>
                    <input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError('');
                        }}
                        placeholder="your.email@example.com"
                        className={`w-full px-4 py-3 rounded-lg border ${
                            error ? 'border-red-400 focus:ring-red-100' : 'border-slate-300 focus:ring-teal-100'
                        } focus:border-teal-500 focus:ring-2 outline-none transition`}
                        disabled={isSubmitting}
                    />
                    {error && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </p>
                    )}
                </div>

                {/* Updates Opt-in */}
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={wantsUpdates}
                        onChange={(e) => setWantsUpdates(e.target.checked)}
                        className="mt-1 w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                        disabled={isSubmitting}
                    />
                    <span className="text-sm text-slate-600">
                        Notify me when new assistance programs become available
                    </span>
                </label>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Sending...</span>
                        </>
                    ) : (
                        <span>Send My Plan</span>
                    )}
                </button>
            </form>

            {/* Privacy Note */}
            <p className="text-xs text-slate-500 mt-4 text-center">
                We respect your privacy. Unsubscribe anytime.
            </p>
        </div>
    );
}
