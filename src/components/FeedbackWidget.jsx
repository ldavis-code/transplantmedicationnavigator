/**
 * FeedbackWidget Component
 * Collects user feedback after viewing medication information
 * Saves to Supabase feedback table
 */

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ThumbsUp, ThumbsDown, Send, CheckCircle } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  'https://lhvemrazkwlmdaljrcln.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxodmVtcmF6a3dsbWRhbGpyY2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MDMyOTIsImV4cCI6MjA4MjE3OTI5Mn0.20dRGKemeN3-5J30cEJhMshkB0nBWSs92GfIylJW7QU'
);

const FeedbackWidget = ({ medicationName }) => {
  const [step, setStep] = useState('initial'); // 'initial', 'details', 'submitted'
  const [wasHelpful, setWasHelpful] = useState(null);
  const [savingsRange, setSavingsRange] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleYes = () => {
    setWasHelpful(true);
    setStep('details');
  };

  const handleNo = () => {
    setWasHelpful(false);
    setStep('details');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await supabase.from('feedback').insert([{
        helpful: wasHelpful,
        savings_range: savingsRange || null,
        comment: comment || null,
        medication_searched: medicationName || null,
        created_at: new Date().toISOString()
      }]);

      setStep('submitted');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Still show success to user - don't block their experience
      setStep('submitted');
    }

    setIsSubmitting(false);
  };

  if (step === 'submitted') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
        <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold">
          <CheckCircle size={20} aria-hidden="true" />
          Thank you! Your feedback helps us improve.
        </div>
      </div>
    );
  }

  if (step === 'details') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <p className="font-semibold text-slate-800 text-center mb-4">
          {wasHelpful
            ? "Great! How much did you save?"
            : "Sorry to hear that. What were you looking for?"}
        </p>

        {wasHelpful && (
          <select
            value={savingsRange}
            onChange={(e) => setSavingsRange(e.target.value)}
            className="w-full p-3 text-base rounded-lg border border-slate-300 mb-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            aria-label="Select estimated savings"
          >
            <option value="">Select estimated savings</option>
            <option value="0-50">$0 - $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-250">$100 - $250</option>
            <option value="250-500">$250 - $500</option>
            <option value="500+">$500+</option>
            <option value="unsure">Not sure yet</option>
          </select>
        )}

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={wasHelpful ? "Any other feedback? (optional)" : "Tell us what you needed..."}
          className="w-full p-3 text-base rounded-lg border border-slate-300 mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          rows={3}
          aria-label={wasHelpful ? "Additional feedback" : "What were you looking for"}
        />

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Send size={18} aria-hidden="true" />
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    );
  }

  // Initial step
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
      <p className="font-semibold text-slate-800 mb-4">Did you find what you needed?</p>
      <div className="flex justify-center gap-3">
        <button
          onClick={handleYes}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
          aria-label="Yes, I found what I needed"
        >
          <ThumbsUp size={18} aria-hidden="true" />
          Yes
        </button>
        <button
          onClick={handleNo}
          className="flex items-center gap-2 px-5 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition"
          aria-label="No, I did not find what I needed"
        >
          <ThumbsDown size={18} aria-hidden="true" />
          No
        </button>
      </div>
    </div>
  );
};

export default FeedbackWidget;
