import { useRef, useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, CheckCircle, X, Tag, Loader2, ShieldCheck } from 'lucide-react';
import { redeemPromoCode } from '../lib/promoCodes';

/**
 * PaywallModal Component
 *
 * Shows when users reach their free tier limits (1 quiz or 1 calculator use).
 * Prompts them to sign up for a Pro subscription to continue.
 *
 * Accessibility features:
 * - Focus trap to keep keyboard focus within modal
 * - Auto-focus on primary CTA
 * - ARIA attributes for screen readers
 * - Escape key to close
 */
const PaywallModal = ({ isOpen, onClose, featureType = 'quiz', onPromoSuccess }) => {
  const modalRef = useRef(null);
  const primaryButtonRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Promo code state
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Feature-specific content
  const content = {
    quiz: {
      title: "You've used your free quiz",
      description: "Upgrade to Pro to keep using My Path Quizzes and unlock all features.",
      icon: '🎯',
    },
    calculator: {
      title: "You've used your free calculation",
      description: "Upgrade to Pro for unlimited Savings Calculator estimates and unlock all premium features.",
      icon: '💰',
    },
  };

  const currentContent = content[featureType] || content.quiz;

  const proFeatures = [
    'Unlimited My Path Quizzes — update anytime',
    'Unlimited Savings Calculator estimates',
    'Savings Dashboard — see how much you\'ve saved',
    'Track Your Actual Savings — prove ROI',
    'Copay Card Renewal Reminders',
    'Medication Calendar for PAP renewals',
    'Save medication lists on your device',
  ];

  // Reset promo state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowPromoInput(false);
      setPromoCode('');
      setPromoError('');
      setPromoSuccess('');
    }
  }, [isOpen]);

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

  const handleRedeemPromo = async () => {
    setPromoError('');
    setPromoSuccess('');
    setIsRedeeming(true);

    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));

    const result = redeemPromoCode(promoCode);
    setIsRedeeming(false);

    if (result.success) {
      // Check if this code grants access to the current feature
      if (result.features && result.features.includes(featureType)) {
        setPromoSuccess(result.message || 'Code redeemed! You now have access.');
        // Notify parent and close after short delay
        setTimeout(() => {
          if (onPromoSuccess) {
            onPromoSuccess(result.features);
          }
          handleClose();
        }, 1500);
      } else {
        setPromoError(`This code doesn't include ${featureType === 'quiz' ? 'Quiz' : 'Calculator'} access.`);
      }
    } else {
      setPromoError(result.error || 'Invalid promo code');
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
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto"
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
        <div className="text-center mb-4">
          <span className="text-2xl font-bold text-slate-900">$8.99</span>
          <span className="text-slate-500">/month</span>
          <span className="text-slate-400 mx-2">or</span>
          <span className="text-lg font-semibold text-purple-600">$79.99/year</span>
          <span className="text-xs text-purple-600 ml-1">(save 26%)</span>
        </div>

        {/* Money Back Guarantee */}
        <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <ShieldCheck size={20} className="text-green-600 flex-shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold text-green-800">30-Day Money Back Guarantee</span>
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

          {/* Promo Code Section */}
          <div className="pt-2 border-t border-slate-200">
            {!showPromoInput ? (
              <button
                onClick={() => setShowPromoInput(true)}
                className="w-full py-2 text-purple-600 hover:text-purple-700 text-sm font-medium transition flex items-center justify-center gap-2"
              >
                <Tag size={16} />
                Have a promo code?
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && promoCode.trim()) {
                        handleRedeemPromo();
                      }
                    }}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm uppercase"
                    disabled={isRedeeming}
                    autoFocus
                  />
                  <button
                    onClick={handleRedeemPromo}
                    disabled={!promoCode.trim() || isRedeeming}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-medium rounded-lg transition disabled:cursor-not-allowed min-w-[80px] flex items-center justify-center"
                  >
                    {isRedeeming ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
                {promoError && (
                  <p className="text-sm text-red-600 text-center">{promoError}</p>
                )}
                {promoSuccess && (
                  <p className="text-sm text-emerald-600 text-center font-medium">{promoSuccess}</p>
                )}
              </div>
            )}
          </div>

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
