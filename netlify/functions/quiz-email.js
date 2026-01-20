/**
 * Quiz Email Lead API
 * Handles email collection from quiz users before showing results
 * Stores data in Supabase quiz_email_leads table
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role key for insert access
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

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

// Simple email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { email, marketingOptIn, quizAnswers, selectedMedications, source } = body;

    // Validate email
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    if (!isValidEmail(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' }),
      };
    }

    // Insert into quiz_email_leads table
    const { data, error } = await supabase
      .from('quiz_email_leads')
      .insert({
        email: email.toLowerCase().trim(),
        marketing_opt_in: marketingOptIn || false,
        quiz_answers: quizAnswers || {},
        selected_medications: selectedMedications || [],
        source: source || 'quiz',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving quiz email lead:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to save email' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Email saved successfully',
        id: data.id
      }),
    };

  } catch (error) {
    console.error('Quiz email error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
