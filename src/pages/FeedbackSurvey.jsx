/**
 * FeedbackSurvey Page
 * Collects patient feedback about their experience with the tool
 * Stores responses in Supabase feedback table
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import {
  CheckCircle,
  Heart,
  DollarSign,
  HelpCircle,
  MessageSquare,
  Shield,
  ArrowRight,
  Home
} from 'lucide-react';

// Initialize Supabase client (same as FeedbackWidget)
const supabase = createClient(
  'https://lhvemrazkwlmdaljrcln.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxodmVtcmF6a3dsbWRhbGpyY2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MDMyOTIsImV4cCI6MjA4MjE3OTI5Mn0.20dRGKemeN3-5J30cEJhMshkB0nBWSs92GfIylJW7QU'
);

// Q1 options - Did you find a program that helped?
const PROGRAM_FOUND_OPTIONS = [
  { value: 'found_copay_card', label: 'Yes - found a copay card', color: 'emerald' },
  { value: 'found_pap', label: 'Yes - found a patient assistance program (PAP)', color: 'emerald' },
  { value: 'found_not_tried', label: 'Found options, but haven\'t tried yet', color: 'amber' },
  { value: 'no_didnt_qualify', label: 'No - didn\'t qualify for programs', color: 'rose' },
  { value: 'no_not_listed', label: 'No - my medication wasn\'t listed', color: 'slate' },
];

// Q2 options - How much did this save you?
const SAVINGS_OPTIONS = [
  { value: '0-50', label: '$0 - $50' },
  { value: '50-100', label: '$50 - $100' },
  { value: '100-250', label: '$100 - $250' },
  { value: '250-500', label: '$250 - $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000+', label: '$1,000+' },
  { value: 'unsure', label: 'Not sure yet' },
];

// Q3 options - What would you have done without this tool?
const WITHOUT_TOOL_OPTIONS = [
  { value: 'paid_full', label: 'Paid full price', color: 'blue' },
  { value: 'skipped_rationed', label: 'Skipped or rationed doses', color: 'rose' },
  { value: 'called_coordinator', label: 'Called my transplant coordinator', color: 'amber' },
  { value: 'not_filled', label: 'Not filled the prescription', color: 'rose' },
  { value: 'other', label: 'Other', color: 'slate' },
];

export default function FeedbackSurvey() {
  const [step, setStep] = useState(1); // 1, 2, 3, 4, or 'submitted'
  const [responses, setResponses] = useState({
    program_found: null,
    savings_range: null,
    without_tool: null,
    comment: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const updateResponse = (key, value) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  // Handle Q1 answer
  const handleQ1Answer = (value) => {
    updateResponse('program_found', value);
    // Show Q2 (savings) only if they found a copay card or PAP
    if (value === 'found_copay_card' || value === 'found_pap') {
      setStep(2);
    } else {
      setStep(3); // Skip to Q3
    }
  };

  // Handle Q2 answer
  const handleQ2Answer = (value) => {
    updateResponse('savings_range', value);
    setStep(3);
  };

  // Handle Q3 answer
  const handleQ3Answer = (value) => {
    updateResponse('without_tool', value);
    setStep(4); // Go to optional comment/email
  };

  // Handle final submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const feedbackData = {
      program_found: responses.program_found,
      savings_range: responses.savings_range,
      without_tool: responses.without_tool,
      comment: responses.comment.trim() || null,
      email: responses.email.trim() || null,
      source: 'feedback_page',
      created_at: new Date().toISOString(),
    };

    try {
      const { error: supabaseError } = await supabase
        .from('feedback')
        .insert([feedbackData]);

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        // Still show success - don't block user experience
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      // Still show success - don't block user experience
    }

    setIsSubmitting(false);
    setStep('submitted');
  };

  // Skip the optional step
  const handleSkipOptional = async () => {
    setIsSubmitting(true);

    const feedbackData = {
      program_found: responses.program_found,
      savings_range: responses.savings_range,
      without_tool: responses.without_tool,
      comment: null,
      email: null,
      source: 'feedback_page',
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('feedback').insert([feedbackData]);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }

    setIsSubmitting(false);
    setStep('submitted');
  };

  const OptionButton = ({ onClick, color = 'blue', children, disabled, selected }) => {
    const colorClasses = {
      emerald: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
      rose: 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-400',
      amber: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400',
      slate: 'bg-slate-500 hover:bg-slate-600 focus:ring-slate-400',
      blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    };

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`w-full text-left px-5 py-4 mb-3 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-3 focus:ring-offset-2 ${colorClasses[color]} disabled:opacity-50 disabled:cursor-not-allowed ${selected ? 'ring-3 ring-offset-2' : ''}`}
      >
        {children}
      </button>
    );
  };

  // Progress indicator
  const ProgressDots = () => {
    const totalSteps = responses.program_found === 'found_copay_card' || responses.program_found === 'found_pap' ? 4 : 3;
    const currentStep = typeof step === 'number' ? step : totalSteps;

    return (
      <div className="flex justify-center gap-2 mb-6">
        {[...Array(totalSteps)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i + 1 <= currentStep ? 'bg-emerald-500' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    );
  };

  // Submitted state
  if (step === 'submitted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl border-2 border-emerald-200 p-10 shadow-xl text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Thank You!
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Your feedback helps us improve and helps transplant centers understand patient needs.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100">
        <div className="max-w-2xl mx-auto px-6 py-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Share Your Feedback
          </h1>
          <p className="text-lg text-slate-600">
            Help us understand how this tool is working for patients
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-xl">
          <ProgressDots />

          {/* Q1: Did you find a program that helped? */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Did you find a program that helped?
                </h2>
              </div>
              <div className="space-y-1">
                {PROGRAM_FOUND_OPTIONS.map((option) => (
                  <OptionButton
                    key={option.value}
                    onClick={() => handleQ1Answer(option.value)}
                    color={option.color}
                  >
                    {option.label}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Q2: How much did this save you? */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  How much did this save you?
                </h2>
              </div>
              <p className="text-slate-600 mb-6">
                Estimate your monthly savings from the program you found.
              </p>
              <div className="space-y-1">
                {SAVINGS_OPTIONS.map((option) => (
                  <OptionButton
                    key={option.value}
                    onClick={() => handleQ2Answer(option.value)}
                    color="blue"
                  >
                    {option.label}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Q3: What would you have done without this tool? */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  What would you have done without this tool?
                </h2>
              </div>
              <div className="space-y-1">
                {WITHOUT_TOOL_OPTIONS.map((option) => (
                  <OptionButton
                    key={option.value}
                    onClick={() => handleQ3Answer(option.value)}
                    color={option.color}
                  >
                    {option.label}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Q4: Optional comment and email */}
          {step === 4 && (
            <form onSubmit={handleSubmit}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Share Your Story (Optional)
                </h2>
              </div>
              <p className="text-slate-600 mb-6">
                Your story can help other patients and improve the system. We may use testimonials (with your permission) to advocate for better medication access.
              </p>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Your comment or experience
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={responses.comment}
                    onChange={(e) => updateResponse('comment', e.target.value)}
                    placeholder="Tell us about your experience finding medication assistance..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Email (if you'd like us to follow up)
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={responses.email}
                    onChange={(e) => updateResponse('email', e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    We'll only use this to contact you about your testimonial.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={handleSkipOptional}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Skip & Submit
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm">
            <Shield className="w-4 h-4" />
            <span><strong>Privacy:</strong> Your feedback is anonymous unless you provide an email</span>
          </div>
        </div>
      </div>
    </div>
  );
}
