/**
 * Stripe Customer Portal Session Creator
 * Creates a Stripe Customer Portal session for subscription management
 *
 * Environment variables required:
 * - STRIPE_SECRET_KEY: Your Stripe secret key
 * - SITE_URL: Your site URL (e.g., https://transplantmedicationnavigator.com)
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_KEY: Supabase service role key
 */

import Stripe from 'stripe';
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

  // Check for Stripe key
  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Stripe is not configured' }),
    };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Initialize Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL || 'https://lhvemrazkwlmdaljrcln.supabase.co',
    process.env.SUPABASE_SERVICE_KEY
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

    // Get user's Stripe customer ID from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('email', email)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No subscription found for this account' }),
      };
    }

    const siteUrl = process.env.SITE_URL || 'https://transplantmedicationnavigator.com';

    // Create a portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${siteUrl}/account`,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: portalSession.url }),
    };
  } catch (error) {
    console.error('Portal session error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
