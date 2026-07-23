/**
 * FeedbackSurvey Page
 * Collects anonymous patient feedback about their experience with the tool
 * Stores responses in the Neon feedback table via /.netlify/functions/feedback
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

// Q1 options - Did you find a program that helped? (labels come from i18n: feedback.q1.<value>)
const PROGRAM_FOUND_OPTIONS = [
  { value: 'found_copay_card', color: 'emerald' },
  { value: 'found_pap', color: 'emerald' },
  { value: 'found_not_tried', color: 'amber' },
  { value: 'no_didnt_qualify', color: 'rose' },
  { value: 'no_not_listed', color: 'slate' },
];

// Q2 options - How much did this save you? (dollar ranges are language-neutral)
const SAVINGS_OPTIONS = [
  { value: '0-50', label: '$0 - $50' },
  { value: '50-100', label: '$50 - $100' },
  { value: '100-250', label: '$100 - $250' },
  { value: '250-500', label: '$250 - $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000+', label: '$1,000+' },
  { value: 'unsure', labelKey: 'feedback.q2.unsure' },
];

// Q3 options - What would you have done without this tool? (labels: feedback.q3.<value>)
const WITHOUT_TOOL_OPTIONS = [
  { value: 'paid_full', color: 'blue' },
  { value: 'skipped_rationed', color: 'rose' },
  { value: 'called_coordinator', color: 'amber' },
  { value: 'not_filled', color: 'rose' },
  { value: 'other', color: 'slate' },
];

export default function FeedbackSurvey() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1); // 1, 2, 3, 4, or 'submitted'
  const [responses, setResponses] = useState({
    program_found: null,
    savings_range: null,
    without_tool: null,
    comment: '',
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
      source: 'feedback_page',
    };

    try {
      await fetch('/.netlify/functions/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
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
      source: 'feedback_page',
    };

    try {
      await fetch('/.netlify/functions/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }

    setIsSubmitting(false);
    setStep('submitted');
  };

  const OptionButton = ({ onClick, color = 'blue', children, disabled, selected }) => {
    const colorClasses = {
      emerald: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800 focus:ring-emerald-300',
      rose: 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-800 focus:ring-rose-300',
      amber: 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800 focus:ring-amber-300',
      slate: 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700 focus:ring-slate-300',
      blue: 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-800 focus:ring-blue-300',
    };

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`w-full text-left px-5 py-4 mb-3 font-medium rounded-xl border-2 transition-all hover:shadow-md focus:outline-none focus:ring-3 focus:ring-offset-2 ${colorClasses[color]} disabled:opacity-50 disabled:cursor-not-allowed ${selected ? 'ring-3 ring-offset-2' : ''}`}
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
              {t('feedback.submitted.title')}
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              {t('feedback.submitted.text')}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-100 border-2 border-emerald-400 text-emerald-800 font-medium rounded-xl hover:bg-emerald-200 transition-colors"
            >
              <Home className="w-5 h-5" />
              {t('feedback.submitted.backHome')}
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
            {t('feedback.header.title')}
          </h1>
          <p className="text-lg text-slate-600">
            {t('feedback.header.subtitle')}
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
                  {t('feedback.q1.title')}
                </h2>
              </div>
              <div className="space-y-1">
                {PROGRAM_FOUND_OPTIONS.map((option) => (
                  <OptionButton
                    key={option.value}
                    onClick={() => handleQ1Answer(option.value)}
                    color={option.color}
                  >
                    {t(`feedback.q1.${option.value}`)}
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
                  {t('feedback.q2.title')}
                </h2>
              </div>
              <p className="text-slate-600 mb-6">
                {t('feedback.q2.subtitle')}
              </p>
              <div className="space-y-1">
                {SAVINGS_OPTIONS.map((option) => (
                  <OptionButton
                    key={option.value}
                    onClick={() => handleQ2Answer(option.value)}
                    color="blue"
                  >
                    {option.labelKey ? t(option.labelKey) : option.label}
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
                  {t('feedback.q3.title')}
                </h2>
              </div>
              <div className="space-y-1">
                {WITHOUT_TOOL_OPTIONS.map((option) => (
                  <OptionButton
                    key={option.value}
                    onClick={() => handleQ3Answer(option.value)}
                    color={option.color}
                  >
                    {t(`feedback.q3.${option.value}`)}
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
                  {t('feedback.q4.title')}
                </h2>
              </div>
              <p className="text-slate-600 mb-6">
                {t('feedback.q4.subtitle')}
              </p>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    {t('feedback.q4.commentLabel')}
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={responses.comment}
                    onChange={(e) => updateResponse('comment', e.target.value)}
                    placeholder={t('feedback.q4.commentPlaceholder')}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-100 border-2 border-emerald-400 text-emerald-800 font-medium rounded-xl hover:bg-emerald-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t('feedback.q4.submitting') : t('feedback.q4.submit')}
                  {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={handleSkipOptional}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-slate-50 border-2 border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  {t('feedback.q4.skip')}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm">
            <Shield className="w-4 h-4" />
            <span><strong>{t('feedback.privacyBold')}</strong> {t('feedback.privacyText')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
