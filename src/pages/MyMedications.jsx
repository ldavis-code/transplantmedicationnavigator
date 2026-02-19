import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, AlertTriangle, Download, Upload, Calculator, Bell, ShieldCheck, ExternalLink, CreditCard, Heart, ClipboardCheck } from 'lucide-react';
import { useConfirmDialog } from '../components/ConfirmDialog';
import { useMetaTags } from '../hooks/useMetaTags';
import { seoMetadata } from '../data/seo-metadata';
import programsData from '../data/programs.json';

const STORAGE_KEY = 'tmn_my_medications';
const INSURANCE_STORAGE_KEY = 'tmn_has_commercial_insurance';
const ADHERENCE_STORAGE_KEY = 'tmn_adherence_answer';

/**
 * Find matching copay card programs for a medication name.
 * Matches against both the medication name and brand name entered by the user.
 */
function findMatchingCopayPrograms(medName, brandName) {
  const searchTerms = [
    medName?.toLowerCase().trim(),
    brandName?.toLowerCase().trim(),
  ].filter(Boolean);

  if (searchTerms.length === 0) return [];

  const matches = [];
  const { copayPrograms } = programsData;

  for (const [, program] of Object.entries(copayPrograms)) {
    const programMeds = program.medications.map(m => m.toLowerCase());
    const programName = program.name.toLowerCase();

    for (const term of searchTerms) {
      const hasMatch = programMeds.some(pm =>
        pm.includes(term) || term.includes(pm)
      ) || programName.includes(term) || term.includes(program.programId.replace('-copay', ''));

      if (hasMatch) {
        matches.push(program);
        break;
      }
    }
  }

  return matches;
}

/**
 * Find matching PAP programs for a medication name.
 */
function findMatchingPapPrograms(medName, brandName) {
  const searchTerms = [
    medName?.toLowerCase().trim(),
    brandName?.toLowerCase().trim(),
  ].filter(Boolean);

  if (searchTerms.length === 0) return [];

  const matches = [];
  const { papPrograms } = programsData;

  for (const [, program] of Object.entries(papPrograms)) {
    const programMeds = program.medications.map(m => m.toLowerCase());

    for (const term of searchTerms) {
      const hasMatch = programMeds.some(pm =>
        pm.includes(term) || term.includes(pm)
      ) || term.includes(program.programId.replace('-pap', ''));

      if (hasMatch) {
        matches.push(program);
        break;
      }
    }
  }

  return matches;
}

// Generate a simple unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function MyMedications() {
  useMetaTags(seoMetadata.myMedications);

  const [medications, setMedications] = useState([]);
  const [medMessage, setMedMessage] = useState({ text: '', type: '' });
  // null = not answered yet, 'yes' or 'no'
  const [hasCommercialInsurance, setHasCommercialInsurance] = useState(null);
  const [newMed, setNewMed] = useState({
    name: '',
    brand: '',
    dosage: '',
    cost: '',
    renewal: '',
    renewalType: ''
  });
  const [adherenceAnswer, setAdherenceAnswer] = useState(null);
  const { showConfirm, DialogComponent } = useConfirmDialog();

  const renewalTypeLabels = {
    'calendar_year': 'Calendar year',
    'enrollment_anniversary': 'Enrollment anniversary',
    'after_max_reached': 'After max reached'
  };

  // Load medications and insurance preference from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMedications(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading medications:', e);
    }
    try {
      const insuranceStored = localStorage.getItem(INSURANCE_STORAGE_KEY);
      if (insuranceStored) {
        setHasCommercialInsurance(insuranceStored);
      }
    } catch (e) {
      console.error('Error loading insurance preference:', e);
    }
    try {
      const adherenceStored = localStorage.getItem(ADHERENCE_STORAGE_KEY);
      if (adherenceStored) {
        const parsed = JSON.parse(adherenceStored);
        // Only restore if answered today
        if (parsed.date === new Date().toISOString().slice(0, 10)) {
          setAdherenceAnswer(parsed.answer);
        }
      }
    } catch (e) {
      console.error('Error loading adherence answer:', e);
    }
  }, []);

  // Save medications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(medications));
    } catch (e) {
      console.error('Error saving medications:', e);
    }
  }, [medications]);

  // Save insurance preference to localStorage whenever it changes
  useEffect(() => {
    if (hasCommercialInsurance !== null) {
      try {
        localStorage.setItem(INSURANCE_STORAGE_KEY, hasCommercialInsurance);
      } catch (e) {
        console.error('Error saving insurance preference:', e);
      }
    }
  }, [hasCommercialInsurance]);

  // Compute matching programs for each medication
  const medicationPrograms = useMemo(() => {
    if (!hasCommercialInsurance || medications.length === 0) return {};

    const programMap = {};
    for (const med of medications) {
      if (hasCommercialInsurance === 'yes') {
        programMap[med.id] = {
          copayCards: findMatchingCopayPrograms(med.medication_name, med.brand_name),
          papPrograms: findMatchingPapPrograms(med.medication_name, med.brand_name),
        };
      } else {
        programMap[med.id] = {
          copayCards: [],
          papPrograms: findMatchingPapPrograms(med.medication_name, med.brand_name),
        };
      }
    }
    return programMap;
  }, [medications, hasCommercialInsurance]);

  function handleAddMedication(e) {
    e.preventDefault();
    if (!newMed.name.trim()) {
      setMedMessage({ text: 'Please enter a medication name', type: 'error' });
      return;
    }

    const medication = {
      id: generateId(),
      medication_name: newMed.name.trim(),
      brand_name: newMed.brand.trim() || null,
      dosage: newMed.dosage.trim() || null,
      monthly_cost: newMed.cost ? parseFloat(newMed.cost) : null,
      renewal_date: newMed.renewal || null,
      renewal_type: newMed.renewalType || null,
      added_at: new Date().toISOString()
    };

    setMedications(prev => [medication, ...prev]);
    setMedMessage({ text: 'Medication saved!', type: 'success' });
    setNewMed({ name: '', brand: '', dosage: '', cost: '', renewal: '', renewalType: '' });

    // Clear success message after 3 seconds
    setTimeout(() => setMedMessage({ text: '', type: '' }), 3000);
  }

  async function handleDeleteMedication(id) {
    const confirmed = await showConfirm({
      title: 'Delete Medication',
      message: 'Are you sure you want to delete this medication from your list?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'confirm'
    });
    if (!confirmed) return;
    setMedications(prev => prev.filter(med => med.id !== id));
  }

  function handleAdherenceAnswer(answer) {
    setAdherenceAnswer(answer);
    try {
      localStorage.setItem(ADHERENCE_STORAGE_KEY, JSON.stringify({
        answer,
        date: new Date().toISOString().slice(0, 10)
      }));
    } catch (e) {
      console.error('Error saving adherence answer:', e);
    }
  }

  function handleExport() {
    const dataStr = JSON.stringify(medications, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-medications.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          // Add IDs to any medications that don't have them
          const withIds = imported.map(med => ({
            ...med,
            id: med.id || generateId()
          }));
          setMedications(prev => [...withIds, ...prev]);
          setMedMessage({ text: `Imported ${imported.length} medication(s)`, type: 'success' });
        } else {
          setMedMessage({ text: 'Invalid file format', type: 'error' });
        }
      } catch (err) {
        setMedMessage({ text: 'Error reading file', type: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  }

  return (
    <>
      {DialogComponent}
      <div className="max-w-2xl mx-auto">
      {/* Privacy Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6" role="alert">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-amber-800 font-medium">Your data stays on this device</p>
            <p className="text-amber-700 text-sm mt-1">
              Medications are stored in your browser only. They are not sent to any server.
              Clearing your browser data will remove this list. Use Export to save a backup.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Savings Calculator CTA */}
        <Link
          to="/savings-tracker"
          className="block bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 text-white hover:from-emerald-700 hover:to-teal-700 transition-all"
        >
          <div className="flex items-center gap-3">
            <Calculator size={24} />
            <div>
              <div className="font-semibold">Savings Calculator</div>
              <div className="text-emerald-100 text-sm">See how much you could save</div>
            </div>
          </div>
        </Link>

        {/* Copay Card Reminders CTA */}
        <Link
          to="/copay-reminders"
          className="block bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white hover:from-amber-600 hover:to-orange-600 transition-all"
        >
          <div className="flex items-center gap-3">
            <Bell size={24} />
            <div>
              <div className="font-semibold">Copay Card Reminders</div>
              <div className="text-amber-100 text-sm">Never miss a renewal</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Header with Export/Import */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-slate-900">My Medications</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={medications.length === 0}
              className="flex items-center gap-1 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export medications"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <label className="flex items-center gap-1 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer">
              <Upload className="w-4 h-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <p className="text-slate-600 text-sm">
          Track your transplant medications and renewal dates
        </p>
      </div>

      {/* Add Medication Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
        <h2 id="add-medication-heading" className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          Add a Medication
        </h2>

        {/* Form status message for screen readers */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          id="form-status"
          className={medMessage.text ? `mb-4 p-3 rounded-lg text-center ${medMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}` : 'sr-only'}
        >
          {medMessage.text || 'Form ready'}
        </div>

        <form onSubmit={handleAddMedication} className="space-y-4" aria-labelledby="add-medication-heading" aria-describedby="form-status">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="med-name" className="block text-sm font-medium text-slate-700 mb-1">
                Medication name <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <input
                id="med-name"
                type="text"
                value={newMed.name}
                onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                placeholder="e.g., Tacrolimus"
                aria-required="true"
                aria-describedby="med-name-hint"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p id="med-name-hint" className="sr-only">Enter the generic or brand name of your medication</p>
            </div>
            <div>
              <label htmlFor="med-brand" className="block text-sm font-medium text-slate-700 mb-1">
                Brand name <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="med-brand"
                type="text"
                value={newMed.brand}
                onChange={(e) => setNewMed({ ...newMed, brand: e.target.value })}
                placeholder="e.g., Prograf"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="med-dosage" className="block text-sm font-medium text-slate-700 mb-1">
                Dosage <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="med-dosage"
                type="text"
                value={newMed.dosage}
                onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                placeholder="e.g., 1mg twice daily"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="med-cost" className="block text-sm font-medium text-slate-700 mb-1">
                Monthly cost ($) <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="med-cost"
                type="number"
                step="0.01"
                min="0"
                value={newMed.cost}
                onChange={(e) => setNewMed({ ...newMed, cost: e.target.value })}
                placeholder="e.g., 150.00"
                aria-describedby="med-cost-hint"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p id="med-cost-hint" className="sr-only">Enter the amount in US dollars</p>
            </div>
            <div>
              <label htmlFor="med-renewal" className="block text-sm font-medium text-slate-700 mb-1">
                Renewal date <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="med-renewal"
                type="date"
                value={newMed.renewal}
                onChange={(e) => setNewMed({ ...newMed, renewal: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="med-renewal-type" className="block text-sm font-medium text-slate-700 mb-1">
                Renewal type <span className="text-slate-400">(optional)</span>
              </label>
              <select
                id="med-renewal-type"
                value={newMed.renewalType}
                onChange={(e) => setNewMed({ ...newMed, renewalType: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">-- Select --</option>
                <option value="calendar_year">Calendar year (Jan 1)</option>
                <option value="enrollment_anniversary">Enrollment anniversary</option>
                <option value="after_max_reached">After max benefit reached</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 flex items-center justify-center gap-2 min-h-[44px] focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            Save Medication
          </button>
        </form>
      </div>

      {/* Commercial Insurance Question - shown before medication cards */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
        <fieldset>
          <legend className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" aria-hidden="true" />
            Do you have commercial insurance?
          </legend>
          <p className="text-slate-600 text-sm mb-4">
            This helps us find the right savings programs for your medications.
            Copay cards are only available with commercial (employer/marketplace) insurance.
          </p>
          <div className="flex gap-4" role="radiogroup" aria-label="Commercial insurance status">
            <button
              type="button"
              onClick={() => setHasCommercialInsurance('yes')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-center transition min-h-[44px] focus:outline-none focus:ring-4 focus:ring-blue-500/50 ${
                hasCommercialInsurance === 'yes'
                  ? 'bg-blue-600 text-white ring-2 ring-blue-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
              role="radio"
              aria-checked={hasCommercialInsurance === 'yes'}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setHasCommercialInsurance('no')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-center transition min-h-[44px] focus:outline-none focus:ring-4 focus:ring-blue-500/50 ${
                hasCommercialInsurance === 'no'
                  ? 'bg-blue-600 text-white ring-2 ring-blue-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
              role="radio"
              aria-checked={hasCommercialInsurance === 'no'}
            >
              No
            </button>
          </div>
          {hasCommercialInsurance === 'yes' && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Copay cards can help!</strong> With commercial insurance, manufacturer copay cards can lower your cost to $0-$50/month for many transplant medications.
              </p>
            </div>
          )}
          {hasCommercialInsurance === 'no' && (
            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-purple-800 text-sm">
                <strong>Patient Assistance Programs (PAPs) may help.</strong> Drug manufacturers offer free medication programs for patients who qualify based on income. Foundations may also help with copays.
              </p>
            </div>
          )}
        </fieldset>
      </div>

      {/* Medications List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Your Medications {medications.length > 0 && <span className="text-slate-500 font-normal">({medications.length})</span>}
        </h2>

        {/* Prompt to answer insurance question if not yet answered and has medications */}
        {hasCommercialInsurance === null && medications.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-blue-800 text-sm">
              Answer the insurance question above to see savings programs for your medications.
            </p>
          </div>
        )}

        {medications.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No medications saved yet.</p>
        ) : (
          <div className="space-y-4">
            {medications.map((med) => {
              const programs = medicationPrograms[med.id];
              const copayCards = programs?.copayCards || [];
              const papPrograms = programs?.papPrograms || [];

              return (
                <div key={med.id} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{med.medication_name}</h3>
                      {med.brand_name && <p className="text-slate-600">Brand: {med.brand_name}</p>}
                      {med.dosage && <p className="text-slate-600">Dosage: {med.dosage}</p>}
                      {med.monthly_cost && <p className="text-slate-600">Monthly cost: ${med.monthly_cost}</p>}
                      {med.renewal_date && <p className="text-slate-600">Renewal: {new Date(med.renewal_date).toLocaleDateString()}</p>}
                      {med.renewal_type && <p className="text-slate-600">Type: {renewalTypeLabels[med.renewal_type] || med.renewal_type}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteMedication(med.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      aria-label={`Delete ${med.medication_name}`}
                    >
                      <Trash2 className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Copay Card Programs (Commercial Insurance) */}
                  {hasCommercialInsurance === 'yes' && copayCards.length > 0 && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <h4 className="text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4" aria-hidden="true" />
                        Copay Card Programs Available
                      </h4>
                      <div className="space-y-2">
                        {copayCards.map((program) => (
                          <div key={program.programId} className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-emerald-900 text-sm">{program.name}</p>
                                <p className="text-emerald-700 text-xs mt-0.5">{program.maxBenefit}</p>
                                {program.phone && (
                                  <p className="text-emerald-700 text-xs mt-0.5">Phone: {program.phone}</p>
                                )}
                              </div>
                              {program.url && (
                                <a
                                  href={program.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition flex-shrink-0 min-h-[32px]"
                                >
                                  Apply
                                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                                </a>
                              )}
                            </div>
                            <p className="text-emerald-600 text-xs mt-1">{program.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PAP Programs (Non-commercial Insurance or additional) */}
                  {hasCommercialInsurance === 'no' && papPrograms.length > 0 && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
                        <Heart className="w-4 h-4" aria-hidden="true" />
                        Patient Assistance Programs Available
                      </h4>
                      <div className="space-y-2">
                        {papPrograms.map((program) => (
                          <div key={program.programId} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-purple-900 text-sm">{program.name}</p>
                                <p className="text-purple-700 text-xs mt-0.5">{program.maxBenefit}</p>
                                {program.incomeLimit && (
                                  <p className="text-purple-700 text-xs mt-0.5">Income limit: {program.incomeLimit}</p>
                                )}
                                {program.phone && (
                                  <p className="text-purple-700 text-xs mt-0.5">Phone: {program.phone}</p>
                                )}
                              </div>
                              {program.url && (
                                <a
                                  href={program.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition flex-shrink-0 min-h-[32px]"
                                >
                                  Apply
                                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                                </a>
                              )}
                            </div>
                            <p className="text-purple-600 text-xs mt-1">{program.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Foundation Programs - shown for non-commercial insurance */}
                  {hasCommercialInsurance === 'no' && papPrograms.length === 0 && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
                        <Heart className="w-4 h-4" aria-hidden="true" />
                        Assistance Programs
                      </h4>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-purple-800 text-sm">
                          No specific manufacturer PAP found for this medication. Check these foundations that may help:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-purple-700">
                          <li>
                            <a href="https://www.healthwellfoundation.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-900">
                              HealthWell Foundation
                            </a>
                            {' '}- copay and premium assistance
                          </li>
                          <li>
                            <a href="https://www.panfoundation.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-900">
                              PAN Foundation
                            </a>
                            {' '}- medication and insurance help
                          </li>
                          <li>
                            <a href="https://www.patientadvocate.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-900">
                              Patient Advocate Foundation
                            </a>
                            {' '}- copay relief programs
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Prompt for commercial insurance users with no copay match */}
                  {hasCommercialInsurance === 'yes' && copayCards.length === 0 && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4" aria-hidden="true" />
                        Copay Cards
                      </h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-800 text-sm">
                          No specific copay card found for this medication name. Try searching with the exact brand name, or visit{' '}
                          <a href="https://www.medicineassistancetool.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900 font-medium">
                            PhRMA Medicine Assistance Tool
                          </a>
                          {' '}to search for available programs.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Medication Adherence Check-In - shown when user has medications */}
      {medications.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mt-6">
          <fieldset>
            <legend className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              Did you get your medication today?
            </legend>
            <div className="space-y-2 mt-4" role="radiogroup" aria-label="Medication adherence check-in">
              {[
                { value: 'yes', label: 'Yes' },
                { value: 'no_expensive', label: 'No \u2013 still too expensive' },
                { value: 'no_another_pharmacy', label: 'No \u2013 will try another pharmacy' },
                { value: 'no_other', label: 'No \u2013 other reason' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleAdherenceAnswer(option.value)}
                  className={`w-full text-left py-3 px-4 rounded-lg font-medium transition min-h-[44px] focus:outline-none focus:ring-4 focus:ring-emerald-500/50 ${
                    adherenceAnswer === option.value
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                  role="radio"
                  aria-checked={adherenceAnswer === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {adherenceAnswer === 'yes' && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-emerald-800 text-sm font-medium">
                  Great! Staying on track with your medications is one of the most important things you can do for your transplant health.
                </p>
              </div>
            )}
            {adherenceAnswer && adherenceAnswer !== 'yes' && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm font-medium">
                  Missing doses can put your transplant at risk. If cost is a barrier, check the assistance programs listed with your medications above or talk to your transplant team.
                </p>
              </div>
            )}
          </fieldset>
        </div>
      )}
      </div>
    </>
  );
}
