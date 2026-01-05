import { useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, CheckCircle, X } from 'lucide-react';

/**
 * PaywallModal Component
 *
 * Shows when users reach their free tier limits (2 quizzes or 4 calculator uses).
 * Prompts them to sign up for a Pro subscription to continue.
 *
 * Accessibility features:
 * - Focus trap to keep keyboard focus within modal
 * - Auto-focus on primary CTA
 * - ARIA attributes for screen readers
 * - Escape key to close
 */
const PaywallModal = ({ isOpen, onClose, featureType = 'quiz' }) => {
  const modalRef = useRef(null);
  const primaryButtonRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Feature-specific content
  const content = {
    quiz: {
      title: "You've used your 2 free quizzes",
      description: "Upgrade to Pro to keep using My Path Quizzes and unlock all features.",
      icon: '🎯',
    },
    calculator: {
      title: "You've used your 2 free calculations",
      description: "Upgrade to Pro for unlimited Savings Calculator estimates and unlock all premium features.",
      icon: '💰',
    },
  };

  const currentContent = content[featureType] || content.quiz;

  const proFeatures = [
    'Unlimited My Path Quizzes',
    'Unlimited Savings Calculator estimates',
    'Unlimited medication searches',
    'Save medication lists on your device',
    'Track actual savings locally',
    'Copay card reminders',
  ];

  // Store previous focus and prevent body scroll
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';

      // Focus primary button after animation
      setTimeout(() => {
        primaryButtonRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap and escape key handler
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || !modalRef.current) return;

    // Escape to close
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    // Focus trap
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleClose = () => {
    onClose();
    // Restore focus
    if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      aria-describedby="paywall-description"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-in zoom-in-95 duration-200 relative"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X size={20} aria-hidden="true" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-4 rounded-full">
            <Lock size={32} className="text-purple-600" aria-hidden="true" />
          </div>
        </div>

        {/* Feature Icon */}
        <div className="text-center text-4xl mb-2" aria-hidden="true">
          {currentContent.icon}
        </div>

        {/* Title */}
        <h2
          id="paywall-title"
          className="text-xl font-bold text-slate-900 text-center mb-2"
        >
          {currentContent.title}
        </h2>

        {/* Description */}
        <p
          id="paywall-description"
          className="text-slate-600 text-center mb-6"
        >
          {currentContent.description}
        </p>

        {/* Pro Features */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-purple-600" aria-hidden="true" />
            <span className="font-semibold text-slate-900">Pro includes:</span>
          </div>
          <ul className="space-y-2">
            {proFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="text-center mb-6">
          <span className="text-2xl font-bold text-slate-900">$8.99</span>
          <span className="text-slate-500">/month</span>
          <span className="text-slate-400 mx-2">or</span>
          <span className="text-lg font-semibold text-purple-600">$79.99/year</span>
          <span className="text-xs text-purple-600 ml-1">(save 26%)</span>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            ref={primaryButtonRef}
            to="/subscribe?plan=monthly"
            className="block w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-center rounded-xl transition shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-500/50 min-h-[48px] flex items-center justify-center"
            onClick={handleClose}
          >
            Upgrade to Pro
          </Link>

          <Link
            to="/pricing"
            className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-center rounded-xl transition min-h-[48px] flex items-center justify-center"
            onClick={handleClose}
          >
            Compare Plans
          </Link>

          <button
            onClick={handleClose}
            className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm transition min-h-[44px]"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
