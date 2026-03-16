/**
 * License / Subscription Check Module
 * Centralizes subscription validation logic used by Netlify functions
 * and can be imported by front-end code via the constants it exports.
 */

import { getSupabaseClient } from './db';

// ---------- Plan constants ----------

export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
} as const;

export type Plan = (typeof PLANS)[keyof typeof PLANS];

export const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUSES)[keyof typeof SUBSCRIPTION_STATUSES];

// ---------- Feature limits for free tier ----------

export const FREE_TIER_LIMITS = {
  quizzes: 1,
  calculatorUses: 1,
} as const;

// ---------- Types ----------

export interface SubscriptionInfo {
  plan: Plan;
  subscription_status: SubscriptionStatus | null;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
  has_subscription: boolean;
}

// ---------- Server-side helpers (Netlify functions) ----------

/**
 * Fetch the subscription record for a given email from Supabase.
 * Returns a normalised SubscriptionInfo object (defaults to free).
 */
export async function getSubscriptionByEmail(
  email: string
): Promise<SubscriptionInfo> {
  const supabase = getSupabaseClient();

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select(
      'plan, subscription_status, subscription_plan, subscription_expires_at, stripe_customer_id'
    )
    .eq('email', email)
    .single();

  if (error || !profile) {
    return {
      plan: PLANS.FREE,
      subscription_status: null,
      subscription_plan: null,
      subscription_expires_at: null,
      has_subscription: false,
    };
  }

  return {
    plan: (profile.plan as Plan) || PLANS.FREE,
    subscription_status: profile.subscription_status as SubscriptionStatus | null,
    subscription_plan: profile.subscription_plan,
    subscription_expires_at: profile.subscription_expires_at,
    has_subscription: !!profile.stripe_customer_id,
  };
}

/**
 * Returns true when the user has an active Pro subscription.
 */
export function isProActive(sub: SubscriptionInfo): boolean {
  return (
    sub.plan === PLANS.PRO &&
    sub.subscription_status === SUBSCRIPTION_STATUSES.ACTIVE
  );
}

/**
 * Check whether a user (by email) is allowed to use a gated feature.
 * - Pro users: always allowed.
 * - Free users: allowed only if they haven't exceeded the free-tier limit
 *   (caller supplies current usage count).
 */
export async function canAccessFeature(
  email: string | null,
  featureKey: keyof typeof FREE_TIER_LIMITS,
  currentUsageCount: number
): Promise<{ allowed: boolean; reason?: string }> {
  if (!email) {
    // Anonymous users get the free tier limit
    if (currentUsageCount < FREE_TIER_LIMITS[featureKey]) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'free_limit_reached' };
  }

  const sub = await getSubscriptionByEmail(email);

  if (isProActive(sub)) {
    return { allowed: true };
  }

  if (currentUsageCount < FREE_TIER_LIMITS[featureKey]) {
    return { allowed: true };
  }

  return { allowed: false, reason: 'free_limit_reached' };
}
