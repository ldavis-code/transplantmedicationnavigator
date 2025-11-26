import { useState, useEffect } from 'react';
import { AlertTriangle, Phone, Check } from 'lucide-react';

const STORAGE_KEY = 'disclaimer_accepted';

/**
 * DisclaimerModal Component
 *
 * Shows a medical disclaimer on first visit that must be acknowledged
 * with a checkbox before accessing the site. Stores acceptance in localStorage.
 */
const DisclaimerModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Check if user has already accepted the disclaimer
    const hasAccepted = localStorage.getItem(STORAGE_KEY);
    if (!hasAccepted) {
      setShowModal(true);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleAccept = () => {
    if (!isChecked) return;
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowModal(false);
    document.body.style.overflow = '';
  };

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      aria-describedby="disclaimer-description"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-amber-100 p-4 rounded-full">
            <AlertTriangle size={40} className="text-amber-600" aria-hidden="true" />
          </div>
        </div>

        {/* Title */}
        <h2
          id="disclaimer-title"
          className="text-2xl font-bold text-slate-900 text-center mb-4"
        >
          Before You Enter
        </h2>

        {/* Disclaimer Text */}
        <div
          id="disclaimer-description"
          className="text-slate-700 mb-6 leading-relaxed"
        >
          <p className="mb-4 text-center">
            This navigator provides <strong className="text-slate-900">general information</strong> about medication assistance programs.
          </p>
          <ul className="text-sm space-y-2 bg-slate-50 rounded-lg p-4">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span>This is <strong>not</strong> medical, financial, or legal advice</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span>Program eligibility and pricing change frequently</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span>Always verify directly with manufacturers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span>Consult your transplant team before making care decisions</span>
            </li>
          </ul>
        </div>

        {/* 988 Crisis Hotline */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 text-white font-bold text-lg mb-1">
            <Phone size={20} aria-hidden="true" />
            <span>Need Support? Call or Text 988</span>
          </div>
          <p className="text-blue-100 text-sm">
            24/7 Suicide & Crisis Lifeline — You are not alone
          </p>
        </div>

        {/* Checkbox */}
        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <button
              type="button"
              onClick={() => setIsChecked(!isChecked)}
              className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded border-2 flex items-center justify-center transition-colors ${
                isChecked
                  ? 'bg-emerald-600 border-emerald-600'
                  : 'bg-white border-slate-400 group-hover:border-emerald-500'
              }`}
              aria-checked={isChecked}
              role="checkbox"
            >
              {isChecked && <Check size={16} className="text-white" aria-hidden="true" />}
            </button>
            <span className="text-slate-700 font-medium">
              I understand this is an <strong className="text-slate-900">educational resource only</strong> and will consult my healthcare team for medical decisions
            </span>
          </label>
        </div>

        {/* Enter Button */}
        <button
          onClick={handleAccept}
          disabled={!isChecked}
          className={`w-full py-4 font-bold text-lg rounded-xl transition shadow-lg focus:outline-none focus:ring-4 ${
            isChecked
              ? 'bg-emerald-700 hover:bg-emerald-800 text-white hover:shadow-xl focus:ring-emerald-500/50'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Enter Site
        </button>

        {!isChecked && (
          <p className="text-center text-sm text-slate-500 mt-3">
            Please check the box above to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default DisclaimerModal;
