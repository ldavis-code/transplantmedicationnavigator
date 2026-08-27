import {
  Building2,
  Pill,
  Package,
  ClipboardList,
  HeartHandshake,
  Phone,
  Heart
} from 'lucide-react';
import { useMetaTags } from '../hooks/useMetaTags';
import { seoMetadata } from '../data/seo-metadata';
import MedicationSurveyPage from '../components/MedicationSurveyPage.jsx';

// Transplant Medication Journey Survey
// Captures transplant-specific failure points in medication access.
// Labels and options live in the locale files (survey.transplant.*);
// this file only defines the structure.

const SECTION_DEFS = [
  {
    id: 'discharge',
    icon: Building2,
    questions: [
      ['meds_in_hand_at_discharge', 'yesno'],
      ['discharge_med_education', 'select'],
      ['knew_costs_before_discharge', 'yesno'],
      ['social_worker_met', 'yesno'],
      ['first_refill_gap', 'yesno'],
    ]
  },
  {
    id: 'immunosuppressants',
    icon: Pill,
    questions: [
      ['generic_switch_forced', 'yesno'],
      ['generic_switch_problems', 'yesno_na'],
      ['trough_timing_issues', 'yesno'],
      ['dose_change_delay', 'select'],
      ['ever_missed_immunosuppressant', 'yesno'],
      ['missed_reason', 'select'],
    ]
  },
  {
    id: 'specialty',
    icon: Package,
    questions: [
      ['uses_specialty_pharmacy', 'yesno'],
      ['specialty_choice', 'select'],
      ['specialty_shipping_issues', 'yesno_na'],
      ['specialty_refill_calls', 'select'],
      ['specialty_coordinator_helpful', 'select'],
    ]
  },
  {
    id: 'insurance',
    icon: ClipboardList,
    questions: [
      ['insurance_changed_post_tx', 'yesno'],
      ['coverage_gap_experienced', 'yesno'],
      ['medicare_36_month_aware', 'select'],
      ['prior_auth_immunosuppressants', 'yesno'],
      ['step_therapy_post_tx', 'yesno'],
      ['annual_oop_range', 'select'],
    ]
  },
  {
    id: 'center',
    icon: Building2,
    questions: [
      ['center_has_pharmacy', 'select'],
      ['coordinator_helps_with_meds', 'select'],
      ['center_told_about_assistance', 'yesno'],
      ['center_helped_apply', 'yesno'],
      ['knows_who_to_call', 'select'],
    ]
  },
  {
    id: 'pap',
    icon: HeartHandshake,
    questions: [
      ['uses_pap', 'yesno'],
      ['pap_types_used', 'multiselect'],
      ['pap_found_how', 'select'],
      ['pap_gap_experienced', 'yesno'],
      ['pap_application_burden', 'select'],
    ]
  },
  {
    id: 'communication',
    icon: Phone,
    questions: [
      ['pharmacy_center_communicate', 'select'],
      ['notified_of_changes', 'select'],
      ['understood_all_meds', 'select'],
      ['feels_like_burden', 'select'],
    ]
  },
  {
    id: 'about',
    icon: Heart,
    questions: [
      ['organ_type', 'select'],
      ['years_post_transplant', 'select'],
      ['num_medications', 'select'],
      ['insurance_type', 'select'],
      ['region', 'select'],
    ]
  }
];

const THEME = {
  pageBg: 'bg-gradient-to-br from-emerald-50 via-white to-teal-50',
  headerBorder: 'border-emerald-100',
  cardBorder: 'border-emerald-100',
  iconBg: 'bg-emerald-100',
  iconColor: 'text-emerald-600',
  submitButton: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700',
};

export default function TransplantMedicationSurvey() {
  useMetaTags(seoMetadata.surveyTransplant);
  return <MedicationSurveyPage surveyKey="transplant" sectionDefs={SECTION_DEFS} theme={THEME} />;
}
