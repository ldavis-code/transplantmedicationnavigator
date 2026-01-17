/**
 * Promo Code System
 * Handles validation and storage of promotional codes for free feature access
 */

// Valid promo codes - can be expanded or moved to backend later
// Format: { code: { features: ['quiz', 'calculator'], expires: Date or null, maxUses: number or null } }
const VALID_PROMO_CODES = {
  'FREEQUIZ': {
    features: ['quiz'],
    expires: null, // Never expires
    description: 'Free My Path Quiz access',
  },
  'FREECALC': {
    features: ['calculator'],
    expires: null,
    description: 'Free Savings Calculator access',
  },
  'FREEACCESS': {
    features: ['quiz', 'calculator'],
    expires: null,
    description: 'Free access to Quiz and Calculator',
  },
  'TRANSPLANT2024': {
    features: ['quiz', 'calculator'],
    expires: null,
    description: 'Transplant community access',
  },
  'LOUE!!A2749': {
    features: ['quiz', 'calculator'],
    expires: null,
    description: 'Free plan access',
  },
};

const STORAGE_KEY = 'tmn_promo_codes';

/**
 * Get all redeemed promo codes from localStorage
 */
export function getRedeemedCodes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load promo codes:', e);
  }
  return [];
}

/**
 * Check if a promo code is valid
 * @param {string} code - The promo code to validate
 * @returns {{ valid: boolean, error?: string, features?: string[], description?: string }}
 */
export function validatePromoCode(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Please enter a promo code' };
  }

  const normalizedCode = code.trim().toUpperCase();

  if (normalizedCode.length < 3) {
    return { valid: false, error: 'Invalid promo code' };
  }

  const promoData = VALID_PROMO_CODES[normalizedCode];

  if (!promoData) {
    return { valid: false, error: 'Invalid promo code' };
  }

  // Check expiration
  if (promoData.expires && new Date() > new Date(promoData.expires)) {
    return { valid: false, error: 'This promo code has expired' };
  }

  return {
    valid: true,
    code: normalizedCode,
    features: promoData.features,
    description: promoData.description,
  };
}

/**
 * Redeem a promo code and store it
 * @param {string} code - The promo code to redeem
 * @returns {{ success: boolean, error?: string, features?: string[] }}
 */
export function redeemPromoCode(code) {
  const validation = validatePromoCode(code);

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const redeemed = getRedeemedCodes();

    // Check if already redeemed
    if (redeemed.some(r => r.code === validation.code)) {
      return {
        success: true,
        features: validation.features,
        message: 'Code already redeemed',
      };
    }

    // Add to redeemed list
    redeemed.push({
      code: validation.code,
      features: validation.features,
      redeemedAt: new Date().toISOString(),
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(redeemed));

    return {
      success: true,
      features: validation.features,
      message: validation.description || 'Code redeemed successfully',
    };
  } catch (e) {
    console.error('Failed to redeem promo code:', e);
    return { success: false, error: 'Failed to save promo code' };
  }
}

/**
 * Check if user has promo access to a specific feature
 * @param {string} feature - 'quiz' or 'calculator'
 * @returns {boolean}
 */
export function hasPromoAccess(feature) {
  const redeemed = getRedeemedCodes();
  return redeemed.some(r => r.features && r.features.includes(feature));
}

/**
 * Check if user has any promo access
 * @returns {boolean}
 */
export function hasAnyPromoAccess() {
  const redeemed = getRedeemedCodes();
  return redeemed.length > 0;
}

/**
 * Clear all redeemed promo codes (for testing/admin)
 */
export function clearPromoCodes() {
  localStorage.removeItem(STORAGE_KEY);
}
