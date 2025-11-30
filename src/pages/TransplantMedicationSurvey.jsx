import { useState } from 'react';

// Transplant Medication Journey Survey
// Captures transplant-specific failure points in medication access
// HIPAA-free: All user self-reported, no PHI collected

export default function TransplantMedicationSurvey() {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const updateResponse = (field, value) => {
    setResponses(prev => ({ ...prev, [field]: value }));
  };

  const sections = [
    {
      title: "Discharge & Transition",
      icon: "🏥",
      description: "Your experience leaving the hospital after transplant",
      questions: [
        { id: 'meds_in_hand_at_discharge', label: 'Did you leave the hospital with all your medications in hand?', type: 'yesno' },
        { id: 'discharge_med_education', label: 'How would you rate the medication education you received before discharge?', type: 'select',
          options: ['Excellent - felt fully prepared', 'Good - had most info I needed', 'Fair - had significant gaps', 'Poor - felt unprepared', 'None - figured it out myself'] },
        { id: 'knew_costs_before_discharge', label: 'Did you know what your medications would cost before you left the hospital?', type: 'yesno' },
        { id: 'social_worker_met', label: 'Did a social worker or financial counselor meet with you about medication costs?', type: 'yesno' },
        { id: 'first_refill_gap', label: 'Did you experience a gap in medication when it was time for your first refill?', type: 'yesno' },
      ]
    },
    {
      title: "Immunosuppressant Experience",
      icon: "💊",
      description: "Challenges specific to your anti-rejection medications",
      questions: [
        { id: 'generic_switch_forced', label: 'Have you ever been switched from brand to generic (or vice versa) without your input?', type: 'yesno' },
        { id: 'generic_switch_problems', label: 'If switched, did you experience level fluctuations or side effects?', type: 'yesno_na' },
        { id: 'trough_timing_issues', label: 'Have you had difficulty coordinating lab timing with medication doses?', type: 'yesno' },
        { id: 'dose_change_delay', label: 'After a dose adjustment, how long until you received the new prescription?', type: 'select',
          options: ['Same day', '1-2 days', '3-5 days', 'More than 5 days', 'Had to use old dose while waiting'] },
        { id: 'ever_missed_immunosuppressant', label: 'Have you ever missed a dose of anti-rejection medication due to access issues (not forgetfulness)?', type: 'yesno' },
        { id: 'missed_reason', label: 'If yes, what was the primary reason?', type: 'select',
          options: ['Cost', 'Pharmacy delay', 'Prior authorization', 'Out of stock', 'Shipping issue', 'Insurance denial', 'Not applicable'] },
      ]
    },
    {
      title: "Specialty Pharmacy",
      icon: "📦",
      description: "Your experience with specialty pharmacy services",
      questions: [
        { id: 'uses_specialty_pharmacy', label: 'Are any of your transplant medications filled through a specialty pharmacy?', type: 'yesno' },
        { id: 'specialty_choice', label: 'Did you get to choose your specialty pharmacy?', type: 'select',
          options: ['Yes, I chose', 'No, insurance mandated one', 'No, transplant center assigned one', 'Not sure', 'Don\'t use specialty pharmacy'] },
        { id: 'specialty_shipping_issues', label: 'Have you experienced shipping delays or temperature concerns with specialty deliveries?', type: 'yesno_na' },
        { id: 'specialty_refill_calls', label: 'How many calls does it typically take to complete a specialty refill?', type: 'select',
          options: ['None - it\'s automatic', '1 call', '2-3 calls', '4+ calls', 'Don\'t use specialty pharmacy'] },
        { id: 'specialty_coordinator_helpful', label: 'If you have a specialty pharmacy coordinator, how helpful are they?', type: 'select',
          options: ['Very helpful', 'Somewhat helpful', 'Not helpful', 'Never talked to one', 'Don\'t have one'] },
      ]
    },
    {
      title: "Insurance & Coverage",
      icon: "📋",
      description: "Insurance challenges post-transplant",
      questions: [
        { id: 'insurance_changed_post_tx', label: 'Has your insurance changed since your transplant?', type: 'yesno' },
        { id: 'coverage_gap_experienced', label: 'Have you experienced a gap in insurance coverage post-transplant?', type: 'yesno' },
        { id: 'medicare_36_month_aware', label: 'Are you aware that Medicare coverage for immunosuppressants was limited to 36 months (before the 2020 change)?', type: 'select',
          options: ['Yes, it affected me', 'Yes, but didn\'t affect me', 'No, wasn\'t aware', 'Not on Medicare'] },
        { id: 'prior_auth_immunosuppressants', label: 'Have you needed prior authorization for immunosuppressant medications?', type: 'yesno' },
        { id: 'step_therapy_post_tx', label: 'Has insurance ever required you to try a different immunosuppressant than what your transplant center prescribed?', type: 'yesno' },
        { id: 'annual_oop_range', label: 'What is your approximate annual out-of-pocket cost for transplant medications?', type: 'select',
          options: ['Under $500', '$500-$1,000', '$1,000-$2,500', '$2,500-$5,000', '$5,000-$10,000', 'Over $10,000'] },
      ]
    },
    {
      title: "Transplant Center Support",
      icon: "🏛️",
      description: "Support from your transplant team",
      questions: [
        { id: 'center_has_pharmacy', label: 'Does your transplant center have an in-house or affiliated pharmacy?', type: 'select',
          options: ['Yes, and I use it', 'Yes, but I don\'t use it', 'No', 'Not sure'] },
        { id: 'coordinator_helps_with_meds', label: 'Does your transplant coordinator help resolve medication access issues?', type: 'select',
          options: ['Yes, very involved', 'Sometimes', 'Rarely', 'Never', 'Don\'t have a coordinator'] },
        { id: 'center_told_about_assistance', label: 'Did your transplant center inform you about patient assistance programs?', type: 'yesno' },
        { id: 'center_helped_apply', label: 'Did someone at your center help you apply for assistance programs?', type: 'yesno' },
        { id: 'knows_who_to_call', label: 'Do you know who to call at your center when you have a medication problem?', type: 'select',
          options: ['Yes, specific person', 'Yes, general number', 'Not sure who to call', 'No one to call'] },
      ]
    },
    {
      title: "Patient Assistance Programs",
      icon: "🤝",
      description: "Your experience with financial assistance",
      questions: [
        { id: 'uses_pap', label: 'Do you currently use any patient assistance programs for transplant medications?', type: 'yesno' },
        { id: 'pap_types_used', label: 'Which types have you used? (Select all that apply)', type: 'multiselect',
          options: ['Manufacturer copay card', 'Foundation grant (NTF, AAKP, etc.)', 'State program', 'Hospital charity care', 'Pharmacy discount program', 'None'] },
        { id: 'pap_found_how', label: 'How did you first learn about assistance programs?', type: 'select',
          options: ['Transplant center', 'Social worker', 'Peer/support group', 'Found online myself', 'Pharmacy', 'Never learned - found out now'] },
        { id: 'pap_gap_experienced', label: 'Have you ever had a gap between assistance program renewals that affected your access?', type: 'yesno' },
        { id: 'pap_application_burden', label: 'How would you describe the burden of applying for and maintaining assistance?', type: 'select',
          options: ['Easy - minimal effort', 'Moderate - some paperwork', 'Difficult - significant time', 'Overwhelming - nearly gave up', 'Haven\'t applied'] },
      ]
    },
    {
      title: "Communication & Coordination",
      icon: "📞",
      description: "How well the system communicates with you",
      questions: [
        { id: 'pharmacy_center_communicate', label: 'Do your pharmacy and transplant center communicate well with each other?', type: 'select',
          options: ['Yes, seamlessly', 'Usually', 'Sometimes', 'Rarely', 'I\'m the middleman'] },
        { id: 'notified_of_changes', label: 'Are you notified in advance when your medication coverage or cost will change?', type: 'select',
          options: ['Always', 'Usually', 'Sometimes', 'Rarely', 'Never'] },
        { id: 'understood_all_meds', label: 'Do you feel you fully understand what each of your medications does?', type: 'select',
          options: ['Yes, completely', 'Mostly', 'Somewhat', 'Not really', 'No'] },
        { id: 'feels_like_burden', label: 'How often do you feel like managing medications is a second job?', type: 'select',
          options: ['Never', 'Occasionally', 'Often', 'Always'] },
      ]
    },
    {
      title: "About Your Transplant Journey",
      icon: "💚",
      description: "Optional background (helps us segment the data)",
      questions: [
        { id: 'organ_type', label: 'What type of transplant did you receive?', type: 'select',
          options: ['Kidney', 'Liver', 'Heart', 'Lung', 'Pancreas', 'Multi-organ', 'Other', 'Prefer not to say'] },
        { id: 'years_post_transplant', label: 'How long ago was your transplant?', type: 'select',
          options: ['Less than 1 year', '1-2 years', '3-5 years', '5-10 years', '10+ years', 'Waiting for transplant'] },
        { id: 'num_medications', label: 'Approximately how many medications do you take daily?', type: 'select',
          options: ['1-5', '6-10', '11-15', '16-20', 'More than 20'] },
        { id: 'insurance_type', label: 'What is your primary insurance?', type: 'select',
          options: ['Employer', 'ACA Marketplace', 'Medicare only', 'Medicaid only', 'Medicare + Medicaid', 'Medicare + Supplement', 'VA', 'Uninsured', 'Other'] },
        { id: 'region', label: 'What region are you in?', type: 'select',
          options: ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast', 'Outside US'] },
      ]
    }
  ];

  const renderQuestion = (q) => {
    if (q.type === 'yesno') {
      return (
        <div className="flex gap-3 mt-2">
          {['Yes', 'No'].map(opt => (
            <button
              key={opt}
              onClick={() => updateResponse(q.id, opt)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                responses[q.id] === opt
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }
    if (q.type === 'yesno_na') {
      return (
        <div className="flex gap-3 mt-2 flex-wrap">
          {['Yes', 'No', 'N/A'].map(opt => (
            <button
              key={opt}
              onClick={() => updateResponse(q.id, opt)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                responses[q.id] === opt
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }
    if (q.type === 'select') {
      return (
        <div className="flex flex-wrap gap-2 mt-3">
          {q.options.map(opt => (
            <button
              key={opt}
              onClick={() => updateResponse(q.id, opt)}
              className={`px-4 py-2.5 rounded-lg text-sm transition-all ${
                responses[q.id] === opt
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }
    if (q.type === 'multiselect') {
      const selected = responses[q.id] || [];
      return (
        <div className="flex flex-wrap gap-2 mt-3">
          {q.options.map(opt => (
            <button
              key={opt}
              onClick={() => {
                const current = responses[q.id] || [];
                if (current.includes(opt)) {
                  updateResponse(q.id, current.filter(x => x !== opt));
                } else {
                  updateResponse(q.id, [...current, opt]);
                }
              }}
              className={`px-4 py-2.5 rounded-lg text-sm transition-all ${
                selected.includes(opt)
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {selected.includes(opt) && '✓ '}{opt}
            </button>
          ))}
        </div>
      );
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg text-center border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">💚</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Thank You, Fellow Transplant Recipient</h2>
          <p className="text-slate-600 mb-6">
            Your experience will help us advocate for better medication access for every transplant patient.
            Together, we're building the evidence to change the system.
          </p>
          <div className="text-sm text-slate-500 bg-emerald-50 p-4 rounded-xl">
            <strong>Your privacy is protected:</strong> No names, dates, or medical record numbers were collected.
            Your responses are combined with others to identify patterns in the system.
          </div>
          <p className="text-xs text-slate-400 mt-6">
            Powered by TransplantMedicationNavigator.com — By patients, for patients
          </p>
        </div>
      </div>
    );
  }

  const section = sections[currentSection];
  const progress = ((currentSection + 1) / sections.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                Transplant Medication Journey Survey
              </h1>
              <p className="text-xs text-slate-500">Help us identify where the system is failing patients</p>
            </div>
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {currentSection + 1} / {sections.length}
            </span>
          </div>
          <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-8 mb-6">
          <div className="flex items-start gap-4 mb-2">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">{section.icon}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{section.title}</h2>
              <p className="text-sm text-slate-500">{section.description}</p>
            </div>
          </div>

          <div className="space-y-7 mt-8">
            {section.questions.map((q) => (
              <div key={q.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                <p className="text-slate-700 font-medium leading-relaxed">{q.label}</p>
                {renderQuestion(q)}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
            disabled={currentSection === 0}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              currentSection === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-white hover:shadow-md'
            }`}
          >
            ← Back
          </button>

          <div className="flex gap-1">
            {sections.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSection(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSection ? 'bg-emerald-500 w-6' : 'bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>

          {currentSection < sections.length - 1 ? (
            <button
              onClick={() => setCurrentSection(prev => prev + 1)}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
            >
              Submit Survey ✓
            </button>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="mt-10 text-center">
          <p className="text-xs text-slate-400">
            This survey is conducted by TransplantMedicationNavigator.com, a patient-led initiative.<br/>
            No protected health information (PHI) is collected. All responses are anonymous.
          </p>
        </div>
      </div>
    </div>
  );
}
