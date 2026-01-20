/**
 * Subscribe Alerts API
 * Handles email signups for medication assistance alerts
 * Stores data in Supabase email_signups table and sends confirmation via Resend
 */

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase with service role key for insert access
const supabase = createClient(
  process.env.SUPABASE_URL,
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

// Email validation regex (matches quiz-email.js pattern)
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// HTML escape to prevent XSS in email content
function escapeHtml(text) {
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(text).replace(/[&<>"']/g, char => htmlEntities[char]);
}

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, medications, wantsUpdates } = JSON.parse(event.body || '{}');

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    if (!isValidEmail(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    const { data, error: dbError } = await supabase
      .from('email_signups')
      .upsert(
        {
          email: email.toLowerCase().trim(),
          medications: medications || [],
          wants_updates: wantsUpdates || false
        },
        { onConflict: 'email' }
      )
      .select();

    if (dbError) {
      console.error('Supabase error:', dbError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to save signup' })
      };
    }

    // Build medication list with XSS protection
    const medList = medications && medications.length > 0
      ? medications.map(med => `<li>${escapeHtml(med.name || med)}</li>`).join('')
      : '<li>No medications selected</li>';

    const { error: emailError } = await resend.emails.send({
      from: 'Transplant Medication Navigator <info@transplantmedicationnavigator.com>',
      to: email,
      subject: 'Your Personalized Medication Assistance Plan',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">Your Medication Assistance Plan</h1>
            <p style="color: #666; font-size: 16px;">Personalized savings strategies just for you</p>
          </div>
          <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #1e40af; font-size: 18px; margin-top: 0;">Your Medications</h2>
            <ul style="margin: 0; padding-left: 20px;">${medList}</ul>
          </div>
          <div style="margin-bottom: 25px;">
            <h2 style="color: #1e40af; font-size: 18px;">What's Next?</h2>
            <p>Visit <a href="https://transplantmedicationnavigator.com" style="color: #2563eb;">TransplantMedicationNavigator.com</a> to:</p>
            <ul style="padding-left: 20px;">
              <li>View assistance programs for each of your medications</li>
              <li>Compare copay cards and patient assistance programs</li>
              <li>Find manufacturer discounts and foundation grants</li>
            </ul>
          </div>
          ${wantsUpdates ? `<div style="background: #ecfdf5; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #065f46; font-size: 16px; margin-top: 0;">✓ You're signed up for updates!</h3>
            <p style="margin-bottom: 0; color: #047857;">We'll notify you when new assistance programs become available for your medications or when renewal deadlines approach.</p>
          </div>` : ''}
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #666;">
            <p><strong>Questions?</strong> Reply to this email—we're here to help.</p>
            <p style="margin-bottom: 5px;">Transplant Medication Navigator</p>
            <p style="font-size: 12px; color: #999;">
              You received this because you requested your medication assistance plan.
              <a href="https://transplantmedicationnavigator.com/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999;">Unsubscribe</a>
            </p>
          </div>
        </body>
        </html>
      `
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, warning: 'Saved but email delivery pending' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
