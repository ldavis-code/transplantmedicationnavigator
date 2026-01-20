/**
 * Coordination of Benefits (COB) Quiz
 * Helps transplant patients with dual insurance coverage understand
 * which insurance is primary and what assistance programs they qualify for
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, ShieldCheck, ShieldAlert, ArrowRight, ArrowLeft,
  CheckCircle2, XCircle, HelpCircle, AlertCircle, Lightbulb,
  Heart, Building2, Users, CreditCard, Pill, ExternalLink,
  Home, ChevronRight, Info, Gift, FileText
} from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags.js';

// COB Scenarios and their outcomes
const COB_SCENARIOS = {
  medicare_employer_active: {
    label: 'Medicare + Employer Coverage (Working)',
    description: 'I or my spouse currently work and have employer insurance',
    primaryInsurance: 'Commercial (Employer)',
    secondaryInsurance: 'Medicare',
    copayCards: true,
    paps: true,
    explanation: 'When you or your spouse is actively working and has employer coverage, that commercial insurance is PRIMARY. Medicare becomes secondary. This is great news for medication costs!',
    tips: [
      'Copay cards from drug manufacturers can be used with your primary commercial insurance',
      'You may be able to reduce your out-of-pocket costs significantly',
      'Patient Assistance Programs (PAPs) are also available as a backup',
      'Always present your employer insurance card first at the pharmacy'
    ],
    nextSteps: [
      'Search for copay cards for your specific medications',
      'Register for manufacturer savings programs',
      'Ask your pharmacy to bill your employer insurance first',
      'Keep Medicare as backup for services not covered by employer plan'
    ]
  },
  medicare_retiree: {
    label: 'Medicare + Retiree Benefits',
    description: 'I have retiree health benefits from a former employer',
    primaryInsurance: 'Medicare',
    secondaryInsurance: 'Retiree Benefits',
    copayCards: false,
    paps: true,
    explanation: 'When you have retiree benefits (not actively working), Medicare is typically PRIMARY. Manufacturer copay cards cannot be used with Medicare as primary insurance due to federal anti-kickback laws.',
    tips: [
      'Patient Assistance Programs (PAPs) may provide free medications',
      'Your retiree benefits may help cover what Medicare doesn\'t',
      'Medicare Part D may have coverage for your transplant medications',
      'Foundation grants may help with remaining out-of-pocket costs'
    ],
    nextSteps: [
      'Apply for manufacturer Patient Assistance Programs',
      'Check foundation grant availability (NKF, AKF, etc.)',
      'Review your Medicare Part D formulary',
      'Contact your retiree benefits administrator about drug coverage'
    ]
  },
  medicare_medicaid: {
    label: 'Medicare + Medicaid (Dual Eligible)',
    description: 'I qualify for both Medicare and Medicaid',
    primaryInsurance: 'Medicare',
    secondaryInsurance: 'Medicaid',
    copayCards: false,
    paps: true,
    explanation: 'As a "dual eligible" patient, you have comprehensive coverage. Medicare is primary, and Medicaid covers most or all remaining costs. Copay cards cannot be used, but your out-of-pocket costs should already be minimal.',
    tips: [
      'Medicaid typically covers copays that Medicare doesn\'t',
      'You may qualify for Extra Help (Low Income Subsidy) for Part D',
      'Your transplant medications may have $0 copay',
      'PAPs can be a backup if any coverage gaps exist'
    ],
    nextSteps: [
      'Verify your dual eligible status with your state Medicaid office',
      'Apply for Medicare Extra Help if not already enrolled',
      'Confirm your pharmacy knows about both coverages',
      'Contact your transplant social worker for additional resources'
    ]
  },
  commercial_medicare: {
    label: 'Commercial + Medicare (Age 65+)',
    description: 'I turned 65 and have Medicare alongside my commercial plan',
    primaryInsurance: 'Depends on employment status',
    secondaryInsurance: 'Varies',
    copayCards: true, // if commercial is primary
    paps: true,
    explanation: 'If you\'re still actively working (or your spouse is), employer coverage is typically primary and you CAN use copay cards. If you or your spouse has retired, Medicare becomes primary and copay cards cannot be used.',
    tips: [
      'Employment status determines which insurance is primary',
      'If working: commercial is primary, copay cards OK',
      'If retired: Medicare is primary, focus on PAPs',
      'COBRA coverage does NOT count as actively working'
    ],
    nextSteps: [
      'Confirm your employment status affects your coverage order',
      'If working: search for copay cards for your medications',
      'If retired: apply for PAPs and foundation grants',
      'Contact your HR department for clarification if needed'
    ]
  },
  esrd_employer: {
    label: 'ESRD Medicare + Employer Coverage',
    description: 'I have Medicare due to kidney failure (ESRD) and employer coverage',
    primaryInsurance: 'Employer (first 30 months)',
    secondaryInsurance: 'Medicare',
    copayCards: true,
    paps: true,
    explanation: 'For ESRD patients with employer coverage, there\'s a special 30-month "coordination period" where your employer plan is PRIMARY. After 30 months, Medicare becomes primary. During the first 30 months, you CAN use copay cards!',
    tips: [
      'During the first 30 months: employer insurance is primary',
      'Copay cards work during this coordination period',
      'Mark your calendar for when 30 months ends',
      'After 30 months: Medicare becomes primary, switch to PAPs'
    ],
    nextSteps: [
      'Calculate when your 30-month coordination period ends',
      'Use copay cards while employer coverage is primary',
      'Prepare PAP applications for when Medicare becomes primary',
      'Work with your social worker on transition planning'
    ]
  },
  disability_employer: {
    label: 'Disability Medicare + Employer Coverage',
    description: 'I have Medicare due to disability and also have employer coverage',
    primaryInsurance: 'Depends on employer size',
    secondaryInsurance: 'Varies',
    copayCards: true, // if employer is primary
    paps: true,
    explanation: 'For disability-based Medicare with employer coverage, the employer plan is typically primary if the employer has 100+ employees. Smaller employers mean Medicare is usually primary.',
    tips: [
      'Large employers (100+ employees): employer plan is primary',
      'Small employers: Medicare is typically primary',
      'Copay cards work when employer plan is primary',
      'Always verify with both insurance companies'
    ],
    nextSteps: [
      'Confirm your employer size (100+ employees or fewer)',
      'Call both insurers to verify coordination order',
      'If employer is primary: apply for copay cards',
      'If Medicare is primary: focus on PAPs and foundations'
    ]
  },
  other_combination: {
    label: 'Other Combination',
    description: 'My situation is different from the options above',
    primaryInsurance: 'Contact insurers to verify',
    secondaryInsurance: 'Contact insurers to verify',
    copayCards: null, // depends
    paps: true,
    explanation: 'Insurance coordination can be complex. The key factors are: (1) Are you or your spouse actively working? (2) What type of Medicare do you have? (3) What is your employer size? We recommend contacting both insurance companies to confirm which is primary.',
    tips: [
      'Call each insurance company and ask "Am I primary or secondary?"',
      'Your transplant center social worker can help navigate this',
      'The Explanation of Benefits (EOB) shows payment order',
      'Keep records of which insurance processes claims first'
    ],
    nextSteps: [
      'Contact your transplant center social worker',
      'Call Medicare at 1-800-MEDICARE',
      'Call your other insurance customer service',
      'Document the coordination order in writing'
    ]
  }
};

// Quiz steps
const QUIZ_STEPS = {
  INTRO: 'intro',
  HAS_DUAL_COVERAGE: 'has_dual_coverage',
  INSURANCE_COMBINATION: 'insurance_combination',
  RESULTS: 'results'
};

const COBQuiz = () => {
  useMetaTags({
    title: 'Coordination of Benefits Quiz | Understand Your Dual Insurance Coverage',
    description: 'Learn which insurance is primary when you have dual coverage. Essential for transplant patients with Medicare and employer insurance.',
    keywords: 'coordination of benefits, dual insurance, Medicare, primary insurance, secondary insurance, transplant'
  });

  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(QUIZ_STEPS.INTRO);
  const [hasDualCoverage, setHasDualCoverage] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [showEducation, setShowEducation] = useState(false);

  // Get the scenario data
  const scenarioData = selectedScenario ? COB_SCENARIOS[selectedScenario] : null;

  const handleStartQuiz = () => {
    setCurrentStep(QUIZ_STEPS.HAS_DUAL_COVERAGE);
  };

  const handleDualCoverageAnswer = (answer) => {
    setHasDualCoverage(answer);
    if (answer) {
      setCurrentStep(QUIZ_STEPS.INSURANCE_COMBINATION);
    } else {
      // No dual coverage - redirect to main quiz
      navigate('/wizard');
    }
  };

  const handleScenarioSelect = (scenarioKey) => {
    setSelectedScenario(scenarioKey);
    setCurrentStep(QUIZ_STEPS.RESULTS);
  };

  const handleStartOver = () => {
    setCurrentStep(QUIZ_STEPS.INTRO);
    setHasDualCoverage(null);
    setSelectedScenario(null);
    setShowEducation(false);
  };

  const renderIntro = () => (
    <div className="max-w-2xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-4">
          <Shield size={40} className="text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Coordination of Benefits Quiz
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          Do you have multiple health insurance plans? Learn which is primary and what assistance programs you qualify for.
        </p>
      </div>

      {/* Why This Matters for Transplant Patients */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Heart size={24} className="text-blue-600" />
            </div>
          </div>
          <div>
            <h2 className="font-bold text-blue-900 text-lg mb-2">
              Why Dual Coverage is Common for Transplant Patients
            </h2>
            <p className="text-blue-800 mb-4">
              Unlike the general population, transplant patients often have dual coverage due to unique circumstances:
            </p>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <span><strong>ESRD Medicare</strong> - Kidney patients qualify regardless of age</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <span><strong>Disability Medicare</strong> - After 24 months on SSDI</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <span><strong>Working past 65</strong> - Employer coverage + Medicare</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <span><strong>Spouse's coverage</strong> - Your spouse's employer plan + Medicare</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Key Question Preview */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <HelpCircle size={20} className="text-emerald-600" />
          Why Does This Matter?
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={18} className="text-emerald-600" />
              <span className="font-semibold text-emerald-800">Copay Cards</span>
            </div>
            <p className="text-sm text-emerald-700">
              Can save you hundreds per month, but only work with commercial insurance as primary
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift size={18} className="text-purple-600" />
              <span className="font-semibold text-purple-800">Patient Assistance</span>
            </div>
            <p className="text-sm text-purple-700">
              PAPs provide free medications regardless of which insurance is primary
            </p>
          </div>
        </div>
      </div>

      {/* What You'll Learn */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
        <h3 className="font-semibold text-slate-700 mb-3">This quiz will tell you:</h3>
        <ul className="space-y-2 text-slate-600">
          <li className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            Which of your insurance plans is primary
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            Whether you can use manufacturer copay cards
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            What assistance programs you qualify for
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            Your recommended next steps
          </li>
        </ul>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStartQuiz}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl text-lg"
      >
        Start the COB Quiz
        <ArrowRight size={20} />
      </button>

      <p className="text-center text-sm text-slate-500 mt-4">
        Takes about 1 minute
      </p>
    </div>
  );

  const renderDualCoverageQuestion = () => (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
          <span>Question 1 of 2</span>
          <span>50%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full">
          <div className="h-2 bg-emerald-500 rounded-full w-1/2 transition-all duration-300" />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            1
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Do you have more than one type of health insurance?
            </h2>
            <p className="text-slate-600">
              For example: Medicare AND employer insurance, or Medicaid AND Medicare
            </p>
          </div>
        </div>
      </div>

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => handleDualCoverageAnswer(true)}
          className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-7 h-7 rounded-full border-2 border-slate-300 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-transparent" />
            </div>
            <div>
              <div className="font-semibold text-lg text-slate-900">Yes, I have dual coverage</div>
              <div className="text-slate-600">I have two or more insurance plans</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleDualCoverageAnswer(false)}
          className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-7 h-7 rounded-full border-2 border-slate-300 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-transparent" />
            </div>
            <div>
              <div className="font-semibold text-lg text-slate-900">No, I have one insurance plan</div>
              <div className="text-slate-600">Continue to My Path Quiz</div>
            </div>
          </div>
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <strong>Not sure?</strong> Common dual coverage situations include having Medicare (from age, disability, or ESRD)
            along with coverage from your job, your spouse's job, or a retiree plan.
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsuranceCombination = () => (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
          <span>Question 2 of 2</span>
          <span>100%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full">
          <div className="h-2 bg-emerald-500 rounded-full w-full transition-all duration-300" />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            2
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Which of the following best describes your situation?
            </h2>
            <p className="text-slate-600">
              Select the option that matches your insurance combination
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Options */}
      <div className="space-y-3 mb-6">
        {Object.entries(COB_SCENARIOS).map(([key, scenario]) => (
          <button
            key={key}
            onClick={() => handleScenarioSelect(key)}
            className="w-full text-left p-5 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-7 h-7 rounded-full border-2 border-slate-300 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={16} className="text-transparent" />
                </div>
                <div>
                  <div className="font-semibold text-lg text-slate-900">{scenario.label}</div>
                  <div className="text-slate-600 text-sm">{scenario.description}</div>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-400 flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>

      {/* Back Button */}
      <button
        onClick={() => setCurrentStep(QUIZ_STEPS.HAS_DUAL_COVERAGE)}
        className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 font-medium"
      >
        <ArrowLeft size={18} />
        Back to previous question
      </button>
    </div>
  );

  const renderResults = () => {
    if (!scenarioData) return null;

    return (
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-4">
            <ShieldCheck size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Your Coordination of Benefits Results
          </h1>
          <p className="text-slate-600">
            Based on: <span className="font-medium text-emerald-700">{scenarioData.label}</span>
          </p>
        </div>

        {/* Primary/Secondary Insurance Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
              <span className="font-bold text-emerald-800">Primary Insurance</span>
            </div>
            <p className="text-xl font-semibold text-emerald-900">{scenarioData.primaryInsurance}</p>
            <p className="text-sm text-emerald-700 mt-1">Bills here first</p>
          </div>
          <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
              <span className="font-bold text-slate-700">Secondary Insurance</span>
            </div>
            <p className="text-xl font-semibold text-slate-800">{scenarioData.secondaryInsurance}</p>
            <p className="text-sm text-slate-600 mt-1">Covers remaining costs</p>
          </div>
        </div>

        {/* Eligibility Summary */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden mb-6">
          <div className="bg-slate-100 px-5 py-3 border-b border-slate-200">
            <h2 className="font-bold text-slate-800">Your Eligibility Summary</h2>
          </div>
          <div className="p-5">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Copay Cards */}
              <div className={`rounded-xl p-4 ${scenarioData.copayCards ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-3">
                  {scenarioData.copayCards ? (
                    <CheckCircle2 size={28} className="text-green-600" />
                  ) : scenarioData.copayCards === false ? (
                    <XCircle size={28} className="text-red-500" />
                  ) : (
                    <HelpCircle size={28} className="text-amber-500" />
                  )}
                  <div>
                    <div className="font-bold text-slate-800">Copay Cards</div>
                    <div className={`text-sm ${scenarioData.copayCards ? 'text-green-700' : scenarioData.copayCards === false ? 'text-red-600' : 'text-amber-600'}`}>
                      {scenarioData.copayCards ? 'Eligible - Can use!' : scenarioData.copayCards === false ? 'Not eligible' : 'Depends on your situation'}
                    </div>
                  </div>
                </div>
              </div>

              {/* PAPs */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={28} className="text-green-600" />
                  <div>
                    <div className="font-bold text-slate-800">Patient Assistance Programs</div>
                    <div className="text-sm text-green-700">
                      Eligible - Can apply!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Lightbulb size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Why This Matters</h3>
              <p className="text-blue-800">{scenarioData.explanation}</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5 mb-6">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Info size={18} className="text-emerald-600" />
            Important Tips for Your Situation
          </h3>
          <ul className="space-y-2">
            {scenarioData.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 size={16} className="text-emerald-500 mt-1 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5 mb-8">
          <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
            <ArrowRight size={18} className="text-emerald-600" />
            Your Recommended Next Steps
          </h3>
          <ol className="space-y-2">
            {scenarioData.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-3 text-emerald-800">
                <span className="flex-shrink-0 w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Quick Reference Table */}
        <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden mb-8">
          <div className="bg-slate-100 px-5 py-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">Quick Reference: All Dual Coverage Scenarios</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Scenario</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Primary</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Copay Cards?</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">PAPs?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className={selectedScenario === 'medicare_employer_active' ? 'bg-emerald-50' : ''}>
                  <td className="py-3 px-4 text-slate-800">Medicare + Employer (Working)</td>
                  <td className="py-3 px-4 text-slate-600">Commercial</td>
                  <td className="py-3 px-4 text-center"><CheckCircle2 size={18} className="text-green-500 inline" /></td>
                  <td className="py-3 px-4 text-center"><CheckCircle2 size={18} className="text-green-500 inline" /></td>
                </tr>
                <tr className={selectedScenario === 'medicare_retiree' ? 'bg-emerald-50' : ''}>
                  <td className="py-3 px-4 text-slate-800">Medicare + Retiree Coverage</td>
                  <td className="py-3 px-4 text-slate-600">Medicare</td>
                  <td className="py-3 px-4 text-center"><XCircle size={18} className="text-red-400 inline" /></td>
                  <td className="py-3 px-4 text-center"><CheckCircle2 size={18} className="text-green-500 inline" /></td>
                </tr>
                <tr className={selectedScenario === 'medicare_medicaid' ? 'bg-emerald-50' : ''}>
                  <td className="py-3 px-4 text-slate-800">Medicare + Medicaid</td>
                  <td className="py-3 px-4 text-slate-600">Medicare/Medicaid</td>
                  <td className="py-3 px-4 text-center"><XCircle size={18} className="text-red-400 inline" /></td>
                  <td className="py-3 px-4 text-center"><CheckCircle2 size={18} className="text-green-500 inline" /></td>
                </tr>
                <tr className={selectedScenario === 'esrd_employer' ? 'bg-emerald-50' : ''}>
                  <td className="py-3 px-4 text-slate-800">ESRD Medicare + Employer</td>
                  <td className="py-3 px-4 text-slate-600">Employer (30 mo)</td>
                  <td className="py-3 px-4 text-center"><CheckCircle2 size={18} className="text-green-500 inline" /></td>
                  <td className="py-3 px-4 text-center"><CheckCircle2 size={18} className="text-green-500 inline" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/wizard"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <Pill size={20} />
            Find Assistance Programs for My Medications
          </Link>

          <Link
            to="/medications"
            className="w-full bg-white border-2 border-emerald-200 hover:border-emerald-400 text-emerald-700 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Search size={18} />
            Search All Medications
          </Link>

          <button
            onClick={handleStartOver}
            className="w-full text-slate-600 hover:text-emerald-700 font-medium py-2 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Start Over
          </button>
        </div>
      </div>
    );
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case QUIZ_STEPS.INTRO:
        return renderIntro();
      case QUIZ_STEPS.HAS_DUAL_COVERAGE:
        return renderDualCoverageQuestion();
      case QUIZ_STEPS.INSURANCE_COMBINATION:
        return renderInsuranceCombination();
      case QUIZ_STEPS.RESULTS:
        return renderResults();
      default:
        return renderIntro();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors">
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Shield size={16} className="text-emerald-600" />
            <span>Insurance Tools</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {renderStep()}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12 py-6 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-slate-500">
          <p className="mb-2">
            This quiz provides general guidance. Always verify your specific coverage with your insurance companies.
          </p>
          <p>
            Need help? Contact your transplant center social worker or call Medicare at 1-800-MEDICARE.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default COBQuiz;
