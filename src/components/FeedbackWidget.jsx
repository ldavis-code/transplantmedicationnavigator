/**
 * FeedbackWidget Component
 * Collects user feedback after viewing medication information
 * Three-question flow to understand outcomes and impact
 * Saves to Supabase feedback table
 */

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Check, X, DollarSign, HelpCircle, CheckCircle } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  'https://lhvemrazkwlmdaljrcln.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxodmVtcmF6a3dsbWRhbGpyY2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MDMyOTIsImV4cCI6MjA4MjE3OTI5Mn0.20dRGKemeN3-5J30cEJhMshkB0nBWSs92GfIylJW7QU'
);

const FeedbackWidget = ({ medicationName }) => {
  const [step, setStep] = useState('q1'); // 'q1', 'q2', 'q3', 'submitted'
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateResponse = (key, value) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  // Q1: Did you get your medication today?
  const answerQ1 = (value) => {
    updateResponse('got_medication', value);
    if (value === 'yes') {
      setStep('q2'); // Ask about savings
    } else {
      setStep('q3'); // Skip to what would you have done
    }
  };

  // Q2: How much did this save you?
  const answerQ2 = (value) => {
    updateResponse('savings_range', value);
    setStep('q3');
  };

  // Q3: What would you have done without this tool?
  const answerQ3 = async (value) => {
    setIsSubmitting(true);

    const feedbackData = {
      ...responses,
      without_tool: value,
      medication_searched: medicationName || null,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('feedback').insert([feedbackData]);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Still show success - don't block user experience
    }

    setIsSubmitting(false);
    setStep('submitted');
  };

  const OptionButton = ({ onClick, color, children, disabled }) => {
    const colorClasses = {
      green: 'bg-emerald-600 hover:bg-emerald-700',
      red: 'bg-rose-500 hover:bg-rose-600',
      amber: 'bg-amber-500 hover:bg-amber-600',
      gray: 'bg-slate-500 hover:bg-slate-600',
      blue: 'bg-blue-600 hover:bg-blue-700'
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full text-left px-4 py-3 mb-2 text-white font-medium rounded-lg transition ${colorClasses[color]} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {children}
      </button>
    );
  };

  if (step === 'submitted') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold text-lg">
          <CheckCircle size={24} aria-hidden="true" />
          Thank you!
        </div>
        <p className="text-emerald-600 mt-2">Your feedback helps transplant centers understand patient needs.</p>
      </div>
    );
  }

  if (step === 'q3') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="font-semibold text-slate-800 text-lg mb-4">
          What would you have done without this tool?
        </p>
        <OptionButton onClick={() => answerQ3('paid_full')} color="blue" disabled={isSubmitting}>
          Paid full price
        </OptionButton>
        <OptionButton onClick={() => answerQ3('skipped_rationed')} color="red" disabled={isSubmitting}>
          Skipped or rationed doses
        </OptionButton>
        <OptionButton onClick={() => answerQ3('called_coordinator')} color="amber" disabled={isSubmitting}>
          Called my transplant coordinator
        </OptionButton>
        <OptionButton onClick={() => answerQ3('not_filled')} color="red" disabled={isSubmitting}>
          Not filled the prescription
        </OptionButton>
        <OptionButton onClick={() => answerQ3('other')} color="gray" disabled={isSubmitting}>
          Other
        </OptionButton>
      </div>
    );
  }

  if (step === 'q2') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="font-semibold text-slate-800 text-lg mb-4">
          How much did this save you?
        </p>
        <OptionButton onClick={() => answerQ2('0-50')} color="blue">
          $0 – $50
        </OptionButton>
        <OptionButton onClick={() => answerQ2('50-100')} color="blue">
          $50 – $100
        </OptionButton>
        <OptionButton onClick={() => answerQ2('100-250')} color="blue">
          $100 – $250
        </OptionButton>
        <OptionButton onClick={() => answerQ2('250-500')} color="blue">
          $250 – $500
        </OptionButton>
        <OptionButton onClick={() => answerQ2('500+')} color="blue">
          $500+
        </OptionButton>
        <OptionButton onClick={() => answerQ2('unsure')} color="gray">
          Not sure yet
        </OptionButton>
      </div>
    );
  }

  // Q1: Initial question
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
      <p className="font-semibold text-slate-800 text-lg mb-4">
        Did you get your medication today?
      </p>
      <OptionButton onClick={() => answerQ1('yes')} color="green">
        <span className="flex items-center gap-2">
          <Check size={18} aria-hidden="true" /> Yes
        </span>
      </OptionButton>
      <OptionButton onClick={() => answerQ1('no_too_expensive')} color="red">
        No – still too expensive
      </OptionButton>
      <OptionButton onClick={() => answerQ1('no_another_pharmacy')} color="amber">
        No – will try another pharmacy
      </OptionButton>
      <OptionButton onClick={() => answerQ1('no_other')} color="gray">
        No – other reason
      </OptionButton>
    </div>
  );
};

export default FeedbackWidget;
