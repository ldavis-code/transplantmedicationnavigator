import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';

// Shared renderer for the transplant and general medication surveys.
// Section structure (ids, icons, question types) lives in the page files;
// every label and option comes from the locale files under
// survey.<surveyKey>.sections.<sectionId>.q.<questionId>, so both surveys
// render fully translated (the July 2026 Spanish-experience review flagged
// these pages as English-only).
// HIPAA-free: All user self-reported, no PHI collected.

export default function MedicationSurveyPage({ surveyKey, sectionDefs, theme }) {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState(null);
  const [responses, setResponses] = useState({});
  const [completedSections, setCompletedSections] = useState(new Set());

  const updateResponse = (field, value) => {
    setResponses(prev => ({ ...prev, [field]: value }));
  };

  const sections = sectionDefs.map((def) => ({
    ...def,
    title: t(`survey.${surveyKey}.sections.${def.id}.title`),
    description: t(`survey.${surveyKey}.sections.${def.id}.description`),
    questions: def.questions.map(([qid, type]) => ({
      id: qid,
      type,
      label: t(`survey.${surveyKey}.sections.${def.id}.q.${qid}.label`),
      options: (type === 'select' || type === 'multiselect')
        ? t(`survey.${surveyKey}.sections.${def.id}.q.${qid}.options`, { returnObjects: true })
        : null,
    })),
  }));

  const handleSubmitSection = (sectionId) => {
    setCompletedSections(prev => new Set([...prev, sectionId]));
    setActiveTab(null);
  };

  const getSectionResponseCount = (section) => {
    return section.questions.filter(q => responses[q.id] !== undefined).length;
  };

  const renderQuestion = (q) => {
    if (q.type === 'yesno' || q.type === 'yesno_na') {
      const opts = q.type === 'yesno'
        ? [t('survey.common.yes'), t('survey.common.no')]
        : [t('survey.common.yes'), t('survey.common.no'), t('survey.common.na')];
      return (
        <div className="flex gap-3 mt-2 flex-wrap">
          {opts.map(opt => (
            <button
              key={opt}
              onClick={() => updateResponse(q.id, opt)}
              aria-pressed={responses[q.id] === opt}
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
              aria-pressed={responses[q.id] === opt}
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
              aria-pressed={selected.includes(opt)}
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
    <div className={`min-h-screen ${theme.pageBg}`}>
      {/* Header */}
      <div className={`bg-white/80 backdrop-blur-sm border-b ${theme.headerBorder}`}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {t(`survey.${surveyKey}.title`)}
          </h1>
          <p className="text-slate-600">
            {t('survey.common.intro')}
          </p>
          {completedSections.size > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600">
              <span className="font-medium">{t('survey.common.completedCount', { completed: completedSections.size, total: sections.length })}</span>
              <span className="text-emerald-400">{t('survey.common.thankYou')}</span>
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
                        <section.icon className={`w-6 h-6 ${isCompleted ? 'text-emerald-600' : 'text-slate-600'}`} aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800">{section.title}</h3>
                          {isCompleted && (
                            <span className="text-emerald-600 text-sm">{t('survey.common.submitted')}</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{section.description}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {t('survey.common.questionCount', { count: section.questions.length })}
                          {hasResponses && !isCompleted && (
                            <span className="text-amber-600 ml-2">{t('survey.common.answeredCount', { count: responseCount })}</span>
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
                  <strong>{t('survey.common.privacyTitle')}</strong> {t('survey.common.privacyLine1')}<br/>
                  {t('survey.common.privacyLine2')}
                </p>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                {t('survey.common.poweredBy')}
              </p>
            </div>
          </>
        )}

        {/* Active Section View */}
        {activeTab && activeSection && (
          <div className={`bg-white rounded-3xl shadow-lg border ${theme.cardBorder} p-8`}>
            <div className="flex items-start gap-4 mb-6">
              <button
                onClick={() => setActiveTab(null)}
                className="mt-1 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={t('survey.common.backToTopicsAria')}
              >
                <ChevronLeft className="w-6 h-6" aria-hidden="true" />
              </button>
              <div className={`w-14 h-14 ${theme.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                <activeSection.icon className={`w-7 h-7 ${theme.iconColor}`} aria-hidden="true" />
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
                {t('survey.common.backToTopics')}
              </button>
              <button
                onClick={() => handleSubmitSection(activeSection.id)}
                className={`px-8 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg ${
                  completedSections.has(activeSection.id)
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : theme.submitButton
                }`}
              >
                {completedSections.has(activeSection.id) ? t('survey.common.update') : t('survey.common.submitSection')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
