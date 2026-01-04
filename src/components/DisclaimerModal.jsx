import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, Phone } from 'lucide-react';

const STORAGE_KEY = 'disclaimer_accepted';

/**
 * DisclaimerModal Component
 *
 * Shows a medical disclaimer on first visit that must be acknowledged
 * before using the site. Stores acceptance in localStorage.
 *
 * Accessibility features:
 * - Focus trap to keep keyboard focus within modal
 * - Auto-focus on accept button
 * - ARIA attributes for screen readers
 * - Escape key does NOT close (intentional - must explicitly accept)
 */
const DisclaimerModal = () => {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);
  const acceptButtonRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    // Check if user has already accepted the disclaimer
    const hasAccepted = localStorage.getItem(STORAGE_KEY);
    if (!hasAccepted) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement;
      setShowModal(true);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
  }, []);

  // Focus the accept button when modal opens
  useEffect(() => {
    if (showModal && acceptButtonRef.current) {
      // Small delay for animation
      setTimeout(() => {
        acceptButtonRef.current?.focus();
      }, 100);
    }
  }, [showModal]);

  // Focus trap handler
  const handleKeyDown = useCallback((e) => {
    if (!showModal || !modalRef.current) return;

    // Focus trap - keep focus within modal
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    // Note: We intentionally do NOT allow Escape to close this modal
    // User must explicitly click "I Agree" to acknowledge the disclaimer
  }, [showModal]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowModal(false);
    document.body.style.overflow = '';

    // Restore focus to previously focused element
    if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  };

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      aria-describedby="disclaimer-description"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 animate-in zoom-in-95 duration-200"
      >
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
          Important Notice
        </h2>

        {/* Disclaimer Text */}
        <p
          id="disclaimer-description"
          className="text-slate-700 text-center mb-6 leading-relaxed"
        >
          This tool provides educational information to help you navigate medication assistance options. It is not a substitute for professional medical advice. Always consult your transplant team or healthcare provider with any questions about your medical condition or treatment.
        </p>

        {/* Emergency Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-red-800 font-bold">
            <Phone size={20} aria-hidden="true" />
            <span>In an emergency, call 911</span>
          </div>
        </div>

        {/* Accept Button */}
        <button
          ref={acceptButtonRef}
          onClick={handleAccept}
          className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-lg rounded-xl transition shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/50 min-h-[52px]"
        >
          I Agree
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;
