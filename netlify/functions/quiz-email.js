/**
 * Quiz Email Lead API
 * Handles email collection from quiz users before showing results
 * Stores data in Supabase quiz_email_leads table
 * Sends personalized results email via Resend
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

// Build privacy-conscious email HTML (no sensitive health data)
function buildQuizResultsEmail(email, quizAnswers, medicationIds, marketingOptIn) {
  const medicationCount = medicationIds?.length || 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="background: #ccfbf1; width: 64px; height: 64px; border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 32px;">✓</span>
          </div>
          <h1 style="color: #0f766e; margin: 0 0 8px; font-size: 24px;">Your Results Are Ready</h1>
          <p style="color: #64748b; margin: 0; font-size: 16px;">Thank you for completing the medication assistance quiz</p>
        </div>

        <!-- Summary Box -->
        <div style="background: #f0fdfa; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #14b8a6;">
          <p style="margin: 0; font-size: 16px; color: #1e293b;">
            We've analyzed your responses and found personalized assistance options${medicationCount > 0 ? ` for your ${medicationCount} medication${medicationCount > 1 ? 's' : ''}` : ''}.
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="https://transplantmedicationnavigator.com" style="display: inline-block; background: #0d9488; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Your Full Results</a>
        </div>

        <!-- What You'll Find -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-bottom: 24px;">
          <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 12px;">What You'll Find</h2>
          <ul style="margin: 0; padding-left: 20px; color: #475569;">
            <li style="margin-bottom: 8px;">Assistance programs matched to your situation</li>
            <li style="margin-bottom: 8px;">Step-by-step application guidance</li>
            <li style="margin-bottom: 8px;">Cost-saving tips for your coverage type</li>
            <li style="margin-bottom: 8px;">Links to manufacturer support programs</li>
          </ul>
        </div>

        ${marketingOptIn ? `
        <div style="background: #ecfdf5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; color: #065f46; font-size: 14px;">✓ <strong>You're signed up for updates!</strong> We'll notify you about new assistance programs and important deadlines.</p>
        </div>
        ` : ''}

        <!-- Privacy Note -->
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; color: #64748b; font-size: 13px;">
            <strong>Your privacy matters.</strong> For your security, specific health details are not included in this email. View your complete personalized results securely on our website.
          </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; color: #64748b;">
          <p style="margin: 0 0 8px;"><strong>Questions?</strong> Reply to this email—we're here to help.</p>
          <p style="margin: 0 0 16px;">Transplant Medication Navigator</p>
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            You received this because you completed our medication assistance quiz.
            <a href="https://transplantmedicationnavigator.com/unsubscribe?email=${encodeURIComponent(email)}" style="color: #94a3b8;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
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

    // Send personalized results email
    let emailSent = false;
    let emailWarning = null;
    let emailErrorDetails = null;

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('EMAIL CONFIG ERROR: RESEND_API_KEY environment variable is not set');
      emailWarning = 'Email service not configured';
      emailErrorDetails = 'RESEND_API_KEY not set';
    } else {
      try {
        console.log('Attempting to send email to:', email.toLowerCase().trim());
        console.log('RESEND_API_KEY is set:', process.env.RESEND_API_KEY ? 'Yes (length: ' + process.env.RESEND_API_KEY.length + ')' : 'No');

        const emailHtml = buildQuizResultsEmail(
          email.toLowerCase().trim(),
          quizAnswers,
          selectedMedications,
          marketingOptIn
        );

        const { data: emailData, error: emailError } = await resend.emails.send({
          from: 'Transplant Medication Navigator <info@transplantmedicationnavigator.com>',
          to: email.toLowerCase().trim(),
          subject: 'Your Personalized Medication Assistance Plan',
          html: emailHtml,
        });

        if (emailError) {
          console.error('Resend API error:', JSON.stringify(emailError, null, 2));
          console.error('Error name:', emailError.name);
          console.error('Error message:', emailError.message);
          emailWarning = 'Results saved but email delivery pending';
          emailErrorDetails = emailError.message || 'Unknown Resend error';
        } else {
          console.log('Email sent successfully! Resend ID:', emailData?.id);
          emailSent = true;
        }
      } catch (emailErr) {
        console.error('Email send exception:', emailErr);
        console.error('Exception type:', emailErr.constructor.name);
        console.error('Exception message:', emailErr.message);
        console.error('Exception stack:', emailErr.stack);
        emailWarning = 'Results saved but email delivery failed';
        emailErrorDetails = emailErr.message || 'Unknown error';
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: emailSent ? 'Email saved and results sent' : 'Email saved successfully',
        id: data.id,
        emailSent,
        ...(emailWarning && { warning: emailWarning }),
        ...(emailErrorDetails && { errorDetails: emailErrorDetails })
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
