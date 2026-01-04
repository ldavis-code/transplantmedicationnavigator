import { useState } from 'react';
import {
  Building2,
  Pill,
  Package,
  ClipboardList,
  HeartHandshake,
  Phone,
  Heart,
  ChevronLeft
} from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags';
import { seoMetadata } from '../data/seo-metadata';

// Transplant Medication Journey Survey
// Captures transplant-specific failure points in medication access
// HIPAA-free: All user self-reported, no PHI collected

export default function TransplantMedicationSurvey() {
  useMetaTags(seoMetadata.surveyTransplant);

  const [activeTab, setActiveTab] = useState(null);
  const [responses, setResponses] = useState({});
  const [completedSections, setCompletedSections] = useState(new Set());

  const updateResponse = (field, value) => {
    setResponses(prev => ({ ...prev, [field]: value }));
  };

  const sections = [
    {
      id: 'discharge',
      title: "Leaving the Hospital",
      shortTitle: "Discharge",
      icon: Building2,
      description: "What happened when you went home after your transplant",
      questions: [
        { id: 'meds_in_hand_at_discharge', label: 'Did you leave the hospital with all your medicines?', type: 'yesno' },
        { id: 'discharge_med_education', label: 'How well did the hospital teach you about your medicines?', type: 'select',
          options: ['Great - I felt ready', 'Good - I had most info I needed', 'OK - There were gaps', 'Poor - I felt unprepared', 'None - I figured it out myself'] },
        { id: 'knew_costs_before_discharge', label: 'Did you know what your medicines would cost before you left?', type: 'yesno' },
        { id: 'social_worker_met', label: 'Did a social worker talk to you about medicine costs?', type: 'yesno' },
        { id: 'first_refill_gap', label: 'Did you run out of medicine before your first refill?', type: 'yesno' },
      ]
    },
    {
      id: 'immunosuppressants',
      title: "Anti-Rejection Drugs",
      shortTitle: "Anti-Rejection",
      icon: Pill,
      description: "Problems with your anti-rejection medicines",
      questions: [
        { id: 'generic_switch_forced', label: 'Were you ever switched to a different brand without being asked?', type: 'yesno' },
        { id: 'generic_switch_problems', label: 'If switched, did you have problems with blood levels or side effects?', type: 'yesno_na' },
        { id: 'trough_timing_issues', label: 'Have you had trouble timing your blood tests with your medicine?', type: 'yesno' },
        { id: 'dose_change_delay', label: 'After your dose changed, how long until you got the new prescription?', type: 'select',
          options: ['Same day', '1-2 days', '3-5 days', 'More than 5 days', 'Had to use old dose while waiting'] },
        { id: 'ever_missed_immunosuppressant', label: 'Have you ever missed a dose because you could not get your medicine (not because you forgot)?', type: 'yesno' },
        { id: 'missed_reason', label: 'If yes, what was the main reason?', type: 'select',
          options: ['Cost', 'Pharmacy delay', 'Insurance approval needed', 'Out of stock', 'Shipping issue', 'Insurance said no', 'Does not apply'] },
      ]
    },
    {
      id: 'specialty',
      title: "Specialty Pharmacy",
      shortTitle: "Specialty Pharmacy",
      icon: Package,
      description: "Your experience with mail-order or specialty pharmacies",
      questions: [
        { id: 'uses_specialty_pharmacy', label: 'Do you get any transplant drugs from a specialty pharmacy?', type: 'yesno' },
        { id: 'specialty_choice', label: 'Did you get to pick your specialty pharmacy?', type: 'select',
          options: ['Yes, I chose', 'No, insurance picked it', 'No, transplant center picked it', 'Not sure', 'I do not use one'] },
        { id: 'specialty_shipping_issues', label: 'Have you had problems with shipping delays or drugs arriving too hot or cold?', type: 'yesno_na' },
        { id: 'specialty_refill_calls', label: 'How many calls does it take to refill your medicine?', type: 'select',
          options: ['None - it is automatic', '1 call', '2-3 calls', '4+ calls', 'I do not use one'] },
        { id: 'specialty_coordinator_helpful', label: 'If you have a pharmacy helper, how helpful are they?', type: 'select',
          options: ['Very helpful', 'Somewhat helpful', 'Not helpful', 'Never talked to one', 'I do not have one'] },
      ]
    },
    {
      id: 'insurance',
      title: "Insurance & Coverage",
      shortTitle: "Insurance",
      icon: ClipboardList,
      description: "Insurance problems after your transplant",
      questions: [
        { id: 'insurance_changed_post_tx', label: 'Has your insurance changed since your transplant?', type: 'yesno' },
        { id: 'coverage_gap_experienced', label: 'Have you had a time with no insurance after your transplant?', type: 'yesno' },
        { id: 'medicare_36_month_aware', label: 'Did you know that Medicare used to stop covering anti-rejection drugs after 36 months?', type: 'select',
          options: ['Yes, it affected me', 'Yes, but did not affect me', 'No, I did not know', 'I am not on Medicare'] },
        { id: 'prior_auth_immunosuppressants', label: 'Has your insurance ever made you get approval before filling your anti-rejection drugs?', type: 'yesno' },
        { id: 'step_therapy_post_tx', label: 'Has insurance ever made you try a different drug than what your doctor wanted?', type: 'yesno' },
        { id: 'annual_oop_range', label: 'About how much do you pay each year for transplant drugs (out of your pocket)?', type: 'select',
          options: ['Under $500', '$500-$1,000', '$1,000-$2,500', '$2,500-$5,000', '$5,000-$10,000', 'Over $10,000'] },
      ]
    },
    {
      id: 'center',
      title: "Transplant Center Help",
      shortTitle: "Center Help",
      icon: Building2,
      description: "Help you get from your transplant team",
      questions: [
        { id: 'center_has_pharmacy', label: 'Does your transplant center have its own pharmacy?', type: 'select',
          options: ['Yes, and I use it', 'Yes, but I do not use it', 'No', 'Not sure'] },
        { id: 'coordinator_helps_with_meds', label: 'Does your transplant coordinator help you get your medicine?', type: 'select',
          options: ['Yes, a lot', 'Sometimes', 'Rarely', 'Never', 'I do not have a coordinator'] },
        { id: 'center_told_about_assistance', label: 'Did your transplant center tell you about programs that help pay for drugs?', type: 'yesno' },
        { id: 'center_helped_apply', label: 'Did someone at your center help you apply for help programs?', type: 'yesno' },
        { id: 'knows_who_to_call', label: 'Do you know who to call at your center if you have a medicine problem?', type: 'select',
          options: ['Yes, a specific person', 'Yes, a general number', 'Not sure who to call', 'No one to call'] },
      ]
    },
    {
      id: 'pap',
      title: "Help Programs",
      shortTitle: "Help Programs",
      icon: HeartHandshake,
      description: "Programs that help pay for your medicine",
      questions: [
        { id: 'uses_pap', label: 'Do you use any programs that help pay for your transplant drugs?', type: 'yesno' },
        { id: 'pap_types_used', label: 'Which types have you used? (Pick all that apply)', type: 'multiselect',
          options: ['Drug company copay card', 'Foundation grant', 'State program', 'Hospital charity', 'Pharmacy discount card', 'None'] },
        { id: 'pap_found_how', label: 'How did you first hear about help programs?', type: 'select',
          options: ['Transplant center', 'Social worker', 'Support group', 'Found online', 'Pharmacy', 'Just found out now'] },
        { id: 'pap_gap_experienced', label: 'Have you ever run out of help because a program ended before you could renew?', type: 'yesno' },
        { id: 'pap_application_burden', label: 'How hard is it to apply for and keep your help programs?', type: 'select',
          options: ['Easy', 'Some work', 'Hard - takes a lot of time', 'Very hard - almost gave up', 'Have not applied'] },
      ]
    },
    {
      id: 'communication',
      title: "Communication",
      shortTitle: "Communication",
      icon: Phone,
      description: "How well people keep you informed",
      questions: [
        { id: 'pharmacy_center_communicate', label: 'Do your pharmacy and transplant center talk to each other well?', type: 'select',
          options: ['Yes, very well', 'Usually', 'Sometimes', 'Rarely', 'I have to be the go-between'] },
        { id: 'notified_of_changes', label: 'Do you get warned ahead of time when your drug costs or coverage will change?', type: 'select',
          options: ['Always', 'Usually', 'Sometimes', 'Rarely', 'Never'] },
        { id: 'understood_all_meds', label: 'Do you know what each of your medicines does?', type: 'select',
          options: ['Yes, completely', 'Mostly', 'Somewhat', 'Not really', 'No'] },
        { id: 'feels_like_burden', label: 'How often does managing your medicines feel like a second job?', type: 'select',
          options: ['Never', 'Sometimes', 'Often', 'Always'] },
      ]
    },
    {
      id: 'about',
      title: "About You",
      shortTitle: "About You",
      icon: Heart,
      description: "Optional - helps us understand who is taking this survey",
      questions: [
        { id: 'organ_type', label: 'What kind of transplant did you get?', type: 'select',
          options: ['Kidney', 'Liver', 'Heart', 'Lung', 'Pancreas', 'More than one organ', 'Other', 'Prefer not to say'] },
        { id: 'years_post_transplant', label: 'How long ago was your transplant?', type: 'select',
          options: ['Less than 1 year', '1-2 years', '3-5 years', '5-10 years', '10+ years', 'Still waiting'] },
        { id: 'num_medications', label: 'About how many medicines do you take each day?', type: 'select',
          options: ['1-5', '6-10', '11-15', '16-20', 'More than 20'] },
        { id: 'insurance_type', label: 'What is your main insurance?', type: 'select',
          options: ['From my job', 'Marketplace (ACA)', 'Medicare only', 'Medicaid only', 'Medicare + Medicaid', 'Medicare + extra plan', 'VA', 'No insurance', 'Other'] },
        { id: 'region', label: 'Where do you live?', type: 'select',
          options: ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast', 'Outside US'] },
      ]
    }
  ];

  const handleSubmitSection = (sectionId) => {
    setCompletedSections(prev => new Set([...prev, sectionId]));
    setActiveTab(null);
  };

  const getSectionResponseCount = (section) => {
    return section.questions.filter(q => responses[q.id] !== undefined).length;
  };

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

  const activeSection = sections.find(s => s.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Transplant Medication Journey Survey
          </h1>
          <p className="text-slate-600">
            Choose the topics that matter most to you. Each section can be submitted independently.
          </p>
          {completedSections.size > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600">
              <span className="font-medium">{completedSections.size} of {sections.length} sections completed</span>
              <span className="text-emerald-400">- Thank you for sharing your experience!</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Topic Selection View */}
        {!activeTab && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {sections.map((section) => {
                const isCompleted = completedSections.has(section.id);
                const responseCount = getSectionResponseCount(section);
                const hasResponses = responseCount > 0;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`text-left p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                      isCompleted
                        ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
                        : hasResponses
                        ? 'bg-amber-50 border-amber-200 hover:border-amber-300'
                        : 'bg-white border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCompleted ? 'bg-emerald-100' : 'bg-slate-100'
                      }`}>
                        <section.icon className={`w-6 h-6 ${isCompleted ? 'text-emerald-600' : 'text-slate-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800">{section.title}</h3>
                          {isCompleted && (
                            <span className="text-emerald-600 text-sm">✓ Submitted</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{section.description}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {section.questions.length} questions
                          {hasResponses && !isCompleted && (
                            <span className="text-amber-600 ml-2">({responseCount} answered)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Privacy Notice */}
            <div className="mt-10 text-center">
              <div className="inline-block bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <p className="text-sm text-slate-500">
                  <strong>Your privacy is protected:</strong> No names, dates, or medical record numbers are collected.<br/>
                  All responses are anonymous and help us advocate for better medication access.
                </p>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Powered by TransplantMedicationNavigator.com — By patients, for patients
              </p>
            </div>
          </>
        )}

        {/* Active Section View */}
        {activeTab && activeSection && (
          <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-8">
            <div className="flex items-start gap-4 mb-6">
              <button
                onClick={() => setActiveTab(null)}
                className="mt-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <activeSection.icon className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{activeSection.title}</h2>
                <p className="text-sm text-slate-500">{activeSection.description}</p>
              </div>
            </div>

            <div className="space-y-7">
              {activeSection.questions.map((q) => (
                <div key={q.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                  <p className="text-slate-700 font-medium leading-relaxed">{q.label}</p>
                  {renderQuestion(q)}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={() => setActiveTab(null)}
                className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-all"
              >
                ← Back to Topics
              </button>
              <button
                onClick={() => handleSubmitSection(activeSection.id)}
                className={`px-8 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg ${
                  completedSections.has(activeSection.id)
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                }`}
              >
                {completedSections.has(activeSection.id) ? 'Update Responses ✓' : 'Submit This Section ✓'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
