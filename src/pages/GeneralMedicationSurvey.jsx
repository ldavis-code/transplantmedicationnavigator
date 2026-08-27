import {
  DollarSign,
  Building2,
  Pill,
  ClipboardList,
  HeartHandshake
} from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags';
import { seoMetadata } from '../data/seo-metadata';
import MedicationSurveyPage from '../components/MedicationSurveyPage.jsx';

// General Medication Survey
// For anyone managing chronic conditions.
// Labels and options live in the locale files (survey.general.*);
// this file only defines the structure.

const SECTION_DEFS = [
  {
    id: 'affordability',
    icon: DollarSign,
    questions: [
      ['cost_barrier', 'yesno'],
      ['cost_frequency', 'select'],
      ['rationing', 'yesno'],
      ['monthly_spend', 'select'],
      ['financial_stress', 'select'],
    ]
  },
  {
    id: 'pharmacy',
    icon: Building2,
    questions: [
      ['pharmacy_type', 'select'],
      ['stockout_frequency', 'select'],
      ['refill_difficulty', 'select'],
      ['pharmacist_helpful', 'select'],
      ['auto_refill', 'yesno'],
    ]
  },
  {
    id: 'insurance',
    icon: ClipboardList,
    questions: [
      ['has_insurance', 'yesno'],
      ['insurance_type', 'select'],
      ['prior_auth_experienced', 'yesno'],
      ['prior_auth_delayed', 'yesno_na'],
      ['formulary_switch', 'yesno'],
      ['coverage_denial', 'yesno'],
    ]
  },
  {
    id: 'assistance',
    icon: HeartHandshake,
    questions: [
      ['knows_about_pap', 'yesno'],
      ['uses_assistance', 'yesno'],
      ['assistance_types', 'multiselect'],
      ['assistance_found_how', 'select'],
      ['assistance_difficulty', 'select'],
    ]
  },
  {
    id: 'management',
    icon: Pill,
    questions: [
      ['num_medications', 'select'],
      ['adherence_difficulty', 'select'],
      ['missed_doses', 'select'],
      ['understands_meds', 'select'],
      ['condition_type', 'multiselect'],
    ]
  }
];

const THEME = {
  pageBg: 'bg-gradient-to-br from-slate-50 via-white to-slate-100',
  headerBorder: 'border-slate-200',
  cardBorder: 'border-slate-200',
  iconBg: 'bg-slate-100',
  iconColor: 'text-slate-600',
  submitButton: 'bg-slate-700 text-white hover:bg-slate-800',
};

export default function GeneralMedicationSurvey() {
  useMetaTags(seoMetadata.surveyGeneral);
  return <MedicationSurveyPage surveyKey="general" sectionDefs={SECTION_DEFS} theme={THEME} />;
}
