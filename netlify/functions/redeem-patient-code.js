/**
 * Patient Code Redemption API
 * Allows patients to redeem a special code for free Pro access
 * Administered by clinic staff for patients in financial need
 */

import { createClient } from '@supabase/supabase-js';

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

// Valid patient codes - administered by clinic staff
const VALID_PATIENT_CODES = {
  'Liver 2025': {
    description: 'Patient assistance program 2025',
    active: true
  }
};

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

  try {
    const { code, email } = JSON.parse(event.body);

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Patient code is required' }),
      };
    }

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Please create an account first to redeem a patient code' }),
      };
    }

    // Validate the patient code
    const codeConfig = VALID_PATIENT_CODES[code];
    if (!codeConfig || !codeConfig.active) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid patient code. Please check with your healthcare provider.' }),
      };
    }

    // Find the user by email
    const { data: user, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, email, plan, subscription_status')
      .eq('email', email.toLowerCase())
      .single();

    if (fetchError || !user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Account not found. Please create an account first.' }),
      };
    }

    // Check if user already has Pro access
    if (user.plan === 'pro' && user.subscription_status === 'active') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Your account already has Pro access!' }),
      };
    }

    // Update the user's plan to Pro with 'granted' status
    const { data: updated, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        plan: 'pro',
        subscription_status: 'active',
        subscription_plan: 'granted',
        patient_code_redeemed: code,
        patient_code_redeemed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('id, email, plan, subscription_status, subscription_plan')
      .single();

    if (updateError) {
      console.error('Error updating user plan:', updateError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to redeem code. Please try again.' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Code redeemed successfully! You now have Pro access.',
        user: {
          id: updated.id,
          email: updated.email,
          plan: updated.plan,
          subscription_status: updated.subscription_status,
          subscription_plan: updated.subscription_plan,
        },
      }),
    };
  } catch (error) {
    console.error('Patient code redemption error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
