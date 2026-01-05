/**
 * Get Subscription Status
 * Returns the subscription status for a user
 *
 * Environment variables required:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_KEY: Supabase service role key
 */

import { createClient } from '@supabase/supabase-js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Initialize Supabase with service role key for admin access
  const supabase = createClient(
    process.env.SUPABASE_URL || 'https://lhvemrazkwlmdaljrcln.supabase.co',
    process.env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    // Get user's subscription info from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('plan, subscription_status, subscription_plan, subscription_expires_at, stripe_customer_id')
      .eq('email', email)
      .single();

    if (profileError) {
      // User doesn't have a profile yet - return free plan
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          plan: 'free',
          subscription_status: null,
          subscription_plan: null,
          subscription_expires_at: null,
          has_subscription: false,
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        plan: profile.plan || 'free',
        subscription_status: profile.subscription_status,
        subscription_plan: profile.subscription_plan,
        subscription_expires_at: profile.subscription_expires_at,
        has_subscription: !!profile.stripe_customer_id,
      }),
    };
  } catch (error) {
    console.error('Get subscription error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
