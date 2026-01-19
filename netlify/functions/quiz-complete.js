// netlify/functions/quiz-complete.js
// Triggered when user completes quiz and provides email

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Your site URL for the results page link
const SITE_URL = process.env.URL || 'https://transplantmedicationnavigator.com';

export async function handler(event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, transplantType, insuranceType, medications } = JSON.parse(event.body);

    // Validate required fields
    if (!email || !transplantType || !insuranceType || !medications?.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const primaryMedication = medications[0];

    // Save to Supabase
    const { data: submission, error: dbError } = await supabase
      .from('quiz_submissions')
      .insert({
        email,
        transplant_type: transplantType,
        insurance_type: insuranceType,
        medications,
        primary_medication: primaryMedication
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save submission' })
      };
    }

    // Generate unique results link
    const resultsLink = `${SITE_URL}/results/${submission.results_token}`;

    // TODO: Re-enable email sending once Resend is configured
    // Email sending temporarily disabled - data is saved to Supabase
    /*
    const { error: emailError } = await resend.emails.send({
      from: 'Lorrinda @ Transplant Medication Navigator <hello@transplantmedicationnavigator.com>',
      to: email,
      subject: 'Your Personalized Medication Assistance Plan from Transplant Medication Navigator',
      html: generateEmail1HTML({
        email,
        transplantType,
        insuranceType,
        primaryMedication,
        resultsLink
      })
    });

    if (emailError) {
      console.error('Email error:', emailError);
    } else {
      await supabase
        .from('quiz_submissions')
        .update({ email_1_sent_at: new Date().toISOString() })
        .eq('id', submission.id);
    }
    */

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        resultsToken: submission.results_token,
        resultsLink
      })
    };

  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}

// Email 1 HTML Template
function generateEmail1HTML({ email, transplantType, insuranceType, primaryMedication, resultsLink }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Personalized Medication Plan</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <p>Hi there,</p>

  <p>Thank you for using the Transplant Medication Navigator to find ways to save on your medication costs. I know how overwhelming this process can be, and my goal is to make it simpler and safer for you.</p>

  <p>Based on your quiz inputs (for a <strong>${transplantType}</strong> transplant with <strong>${insuranceType}</strong> coverage, taking medications like <strong>${primaryMedication}</strong>), here is your personalized strategy to reduce your medication burden:</p>

  <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">Your 3-Step Medication Strategy</h2>

  <p><strong>1. Check Manufacturer PAPs:</strong> Your first step should be to visit the manufacturer's website for your brand-name medications. If you are eligible for their Patient Assistance Program (PAP), you could get your medication for free.</p>

  <p><strong>2. Apply to Foundations:</strong> Next, look into foundations like HealthWell or the PAN Foundation. These organizations often have specific funds to help pay for copays related to your transplant.</p>

  <p><strong>3. Compare vs. Cash Price:</strong> Sometimes, the cash price from a pharmacy like Cost Plus Drugs can be cheaper than using your insurance copay. It's always worth comparing.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${resultsLink}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View My Full Medication Plan</a>
  </div>

  <p>Remember, you are not alone in this journey. Please use these resources, and always discuss any changes with your transplant team.</p>

  <p>Stay strong,</p>

  <p><strong>Lorrinda Gray-Davis</strong><br>
  Founder, Transplant Medication Navigator<br>
  <em>Liver Transplant Recipient</em></p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

  <p style="font-size: 12px; color: #6b7280;">
    You are receiving this email because you requested your personalized medication assistance plan from the Transplant Medication Navigator™.<br><br>
    Transplant Medication Navigator™<br>
    Copyright © 2026 Transplant Medication Navigator™. All Rights Reserved.<br><br>
    <a href="${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #6b7280;">Unsubscribe</a> | <a href="${SITE_URL}/privacy" style="color: #6b7280;">Privacy Policy</a>
  </p>

</body>
</html>
  `;
}
