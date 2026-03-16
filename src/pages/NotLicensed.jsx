import { ShieldAlert, Mail, Building2 } from 'lucide-react';

/**
 * NotLicensed Page
 *
 * Shown when an Epic EHR launch comes from a transplant center
 * that hasn't activated their TMN license yet.
 * The epic-ehr-callback sets short-lived cookies (tmn_org_id, tmn_iss)
 * so this page could read them if needed in the future.
 */
const NotLicensed = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center">
        {/* Logo / Icon */}
        <div className="text-5xl mb-4" aria-hidden="true">💊</div>

        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Transplant Medication Navigator
        </h1>

        <p className="text-slate-500 mb-6 leading-relaxed">
          Your transplant center hasn't activated TMN yet.
          Contact us to get your center set up — it takes less than a week
          and integrates directly into Epic.
        </p>

        {/* Info box for Epic teams */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start gap-2">
            <Building2 size={18} className="text-green-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-green-800 leading-relaxed">
              <strong>For your transplant center's Epic team:</strong><br />
              Ask about activating TransplantMedicationNavigator.com —
              listed in Epic Connection Hub, FHIR R4 compliant,
              zero PHI stored.
            </p>
          </div>
        </div>

        {/* CTA */}
        <a
          href="mailto:lorrinda@transplantmedicationnavigator.com?subject=Epic Activation Request"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-md hover:shadow-lg min-h-[48px]"
        >
          <Mail size={18} aria-hidden="true" />
          Contact Us to Activate
        </a>

        <p className="mt-4 text-xs text-slate-400">
          Already activated? Your Epic system administrator may need
          to complete the connection setup.
        </p>
      </div>
    </div>
  );
};

export default NotLicensed;
