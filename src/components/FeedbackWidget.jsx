/**
 * FeedbackWidget Component
 * Collects anonymous user feedback after viewing medication information
 * Three-question flow to understand outcomes and impact
 * Saves to the Neon feedback table via /.netlify/functions/feedback
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { Check, X, DollarSign, HelpCircle, CheckCircle, LifeBuoy, ArrowRight } from 'lucide-react';
import { trackServerEvent } from '../lib/trackServerEvent.js';

// Answers that mean the patient does not have their medication, or went
// without it. Anti-rejection doses are not safely skippable, so these route
// to the emergency guide before the research question rather than after it.
const EMERGENCY_ROUTE = '/education?topic=EMERGENCY';
const isUnfilled = (got) => typeof got === 'string' && got.startsWith('no');
const WENT_WITHOUT = ['skipped_rationed', 'not_filled'];

const FeedbackWidget = ({ medicationName }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState('q1'); // 'q1', 'q2', 'rescue', 'q3', 'submitted'
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateResponse = (key, value) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  // Q1: Did you get your medication today?
  const answerQ1 = (value) => {
    updateResponse('got_medication', value);
    // Record the outcome as a helpful-vote event so it shows in analytics
    // (yes = the tool helped them get their medication).
    trackServerEvent(value === 'yes' ? 'helpful_vote_yes' : 'helpful_vote_no', {
      medication: medicationName || null,
    });
    if (value === 'yes') {
      setStep('q2'); // Ask about savings
    } else {
      // Rescue before research. A patient who just said they don't have
      // their medication needs today's options, not a survey; the research
      // question still follows, it just no longer comes first.
      setStep('rescue');
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
    // Store it, not just post it: the confirmation screen decides whether to
    // carry the emergency guide from this answer.
    updateResponse('without_tool', value);

    const feedbackData = {
      ...responses,
      without_tool: value,
      medication_searched: medicationName || null,
      source: 'widget'
    };

    try {
      await fetch('/.netlify/functions/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
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
      amber: 'bg-amber-700 hover:bg-amber-800',
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

  // The emergency guide, surfaced in the flow itself. Same content the
  // /education?topic=EMERGENCY page carries in full — two actions that work
  // today, then the link. Rendered on the rescue step and again on the
  // confirmation, so leaving the survey never means leaving without it.
  const RescueActions = ({ compact }) => (
    <div className={compact ? '' : 'mt-4'}>
      {!compact && (
        <ul className="text-left text-slate-700 space-y-2 mb-4">
          <li className="flex gap-2">
            <span className="text-rose-600 font-bold" aria-hidden="true">1.</span>
            <span><Trans i18nKey="feedback.rescue.step1" components={{ strong: <strong /> }} /></span>
          </li>
          <li className="flex gap-2">
            <span className="text-rose-600 font-bold" aria-hidden="true">2.</span>
            <span><Trans i18nKey="feedback.rescue.step2" components={{ strong: <strong /> }} /></span>
          </li>
        </ul>
      )}
      <Link
        to={EMERGENCY_ROUTE}
        onClick={() => trackServerEvent('resource_view', { resource: 'emergency-guide', source: 'feedback-rescue' })}
        className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition min-h-[48px]"
      >
        {t('feedback.rescue.cta')} <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </div>
  );

  if (step === 'submitted') {
    // A patient who told us they have no medication, or went without it,
    // gets the way out alongside the thank-you rather than a dead end.
    const needsHelp = isUnfilled(responses.got_medication)
      || WENT_WITHOUT.includes(responses.without_tool);
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold text-lg">
          <CheckCircle size={24} aria-hidden="true" />
          {t('feedback.submitted.title')}
        </div>
        <p className="text-emerald-600 mt-2">{t('widgets.feedbackThanks')}</p>
        {needsHelp && (
          <div className="mt-5 pt-5 border-t border-emerald-200 text-left">
            <p className="font-bold text-slate-900 mb-1">{t('feedback.rescue.stillTitle')}</p>
            <p className="text-slate-700 text-sm mb-3">{t('feedback.rescue.stillText')}</p>
            <RescueActions compact />
          </div>
        )}
      </div>
    );
  }

  if (step === 'rescue') {
    return (
      <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-5 shadow-sm" role="region" aria-labelledby="feedback-rescue-title">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 rounded-full flex-shrink-0" aria-hidden="true">
            <LifeBuoy className="text-rose-700" size={24} />
          </div>
          <div className="flex-grow">
            <p id="feedback-rescue-title" className="font-bold text-slate-900 text-lg">
              {t('feedback.rescue.title')}
            </p>
            <p className="text-slate-700 mt-1 mb-4">{t('feedback.rescue.intro')}</p>
            <RescueActions />
            <button
              onClick={() => setStep('q3')}
              className="mt-3 w-full text-center px-4 py-2 text-slate-600 hover:text-slate-900 underline font-medium min-h-[44px]"
            >
              {t('feedback.rescue.continue')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'q3') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="font-semibold text-slate-800 text-lg mb-4">
          {t('feedback.q3.title')}
        </p>
        <OptionButton onClick={() => answerQ3('paid_full')} color="blue" disabled={isSubmitting}>
          {t('feedback.q3.paid_full')}
        </OptionButton>
        <OptionButton onClick={() => answerQ3('skipped_rationed')} color="red" disabled={isSubmitting}>
          {t('feedback.q3.skipped_rationed')}
        </OptionButton>
        <OptionButton onClick={() => answerQ3('called_coordinator')} color="amber" disabled={isSubmitting}>
          {t('feedback.q3.called_coordinator')}
        </OptionButton>
        <OptionButton onClick={() => answerQ3('not_filled')} color="red" disabled={isSubmitting}>
          {t('feedback.q3.not_filled')}
        </OptionButton>
        <OptionButton onClick={() => answerQ3('other')} color="gray" disabled={isSubmitting}>
          {t('feedback.q3.other')}
        </OptionButton>
      </div>
    );
  }

  if (step === 'q2') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="font-semibold text-slate-800 text-lg mb-4">
          {t('feedback.q2.title')}
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
          {t('feedback.q2.unsure')}
        </OptionButton>
      </div>
    );
  }

  // Q1: Initial question
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
      <p className="font-semibold text-slate-800 text-lg mb-4">
        {t('myMeds.adherenceQuestion')}
      </p>
      <OptionButton onClick={() => answerQ1('yes')} color="green">
        <span className="flex items-center gap-2">
          <Check size={18} aria-hidden="true" /> {t('myMeds.adherenceYes')}
        </span>
      </OptionButton>
      <OptionButton onClick={() => answerQ1('no_too_expensive')} color="red">
        {t('myMeds.adherenceNoExpensive')}
      </OptionButton>
      <OptionButton onClick={() => answerQ1('no_another_pharmacy')} color="amber">
        {t('myMeds.adherenceNoPharmacy')}
      </OptionButton>
      <OptionButton onClick={() => answerQ1('no_other')} color="gray">
        {t('myMeds.adherenceNoOther')}
      </OptionButton>
    </div>
  );
};

export default FeedbackWidget;
