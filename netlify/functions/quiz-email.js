/**
 * Quiz Email Lead API
 * Handles email collection from quiz users before showing results
 * Stores data in Supabase quiz_email_leads table
 * Sends personalized results email via Resend
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load programs data
let programsData = { copayPrograms: {}, papPrograms: {}, foundationPrograms: {} };
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const programsPath = join(__dirname, '../../src/data/programs.json');
  programsData = JSON.parse(readFileSync(programsPath, 'utf-8'));
} catch (e) {
  console.error('Could not load programs.json:', e.message);
}

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

// Find assistance programs for selected medications
function findProgramsForMedications(medicationIds) {
  const results = {
    copayCards: [],
    paps: [],
    foundations: Object.values(programsData.foundationPrograms || {})
  };

  if (!medicationIds || medicationIds.length === 0) {
    return results;
  }

  // Normalize medication IDs to lowercase for matching
  const normalizedIds = medicationIds.map(id =>
    (typeof id === 'string' ? id : id.id || id.name || '').toLowerCase()
  );

  // Find copay cards that match selected medications
  for (const program of Object.values(programsData.copayPrograms || {})) {
    if (program.medications) {
      const hasMatch = program.medications.some(med =>
        normalizedIds.some(id => id.includes(med.toLowerCase()) || med.toLowerCase().includes(id))
      );
      if (hasMatch) {
        results.copayCards.push(program);
      }
    }
  }

  // Find PAPs that match selected medications
  for (const program of Object.values(programsData.papPrograms || {})) {
    if (program.medications) {
      const hasMatch = program.medications.some(med =>
        normalizedIds.some(id => id.includes(med.toLowerCase()) || med.toLowerCase().includes(id))
      );
      if (hasMatch) {
        results.paps.push(program);
      }
    }
  }

  return results;
}

// HTML escape to prevent XSS
function escapeHtml(text) {
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(text || '').replace(/[&<>"']/g, char => htmlEntities[char]);
}

// Build program card HTML
function buildProgramCard(program, type) {
  const bgColor = type === 'copay' ? '#eff6ff' : type === 'pap' ? '#f0fdf4' : '#faf5ff';
  const borderColor = type === 'copay' ? '#3b82f6' : type === 'pap' ? '#22c55e' : '#a855f7';
  const labelColor = type === 'copay' ? '#1d4ed8' : type === 'pap' ? '#15803d' : '#7e22ce';
  const label = type === 'copay' ? 'Copay Card' : type === 'pap' ? 'Patient Assistance' : 'Foundation';

  return `
    <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <strong style="color: #1e293b; font-size: 15px;">${escapeHtml(program.name)}</strong>
        <span style="background: ${borderColor}; color: white; font-size: 11px; padding: 2px 8px; border-radius: 4px;">${label}</span>
      </div>
      ${program.maxBenefit ? `<p style="margin: 0 0 8px; color: #475569; font-size: 14px;"><strong>Benefit:</strong> ${escapeHtml(program.maxBenefit)}</p>` : ''}
      ${program.incomeLimit ? `<p style="margin: 0 0 8px; color: #475569; font-size: 14px;"><strong>Income Limit:</strong> ${escapeHtml(program.incomeLimit)}</p>` : ''}
      ${program.phone ? `<p style="margin: 0 0 8px; color: #475569; font-size: 14px;"><strong>Phone:</strong> ${escapeHtml(program.phone)}</p>` : ''}
      ${program.url ? `<p style="margin: 0;"><a href="${escapeHtml(program.url)}" style="color: ${labelColor}; font-weight: 600; text-decoration: none;">Apply Now →</a></p>` : ''}
    </div>
  `;
}

// Build email HTML with full assistance program details
function buildQuizResultsEmail(email, quizAnswers, medicationIds, marketingOptIn) {
  const programs = findProgramsForMedications(medicationIds);
  const medicationCount = medicationIds?.length || 0;
  const hasPrograms = programs.copayCards.length > 0 || programs.paps.length > 0;

  // Build medication list
  const medicationNames = (medicationIds || []).map(med => {
    if (typeof med === 'string') return med;
    return med.name || med.id || 'Unknown';
  });

  const medListHtml = medicationNames.length > 0
    ? medicationNames.map(name => `<li style="margin-bottom: 4px;">${escapeHtml(name)}</li>`).join('')
    : '<li>No medications specified</li>';

  // Build copay cards section
  const copayCardsHtml = programs.copayCards.length > 0
    ? `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #1d4ed8; font-size: 18px; margin: 0 0 12px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Manufacturer Copay Cards</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0 0 12px;">For patients with commercial/employer insurance. Can reduce your copay to as little as $0.</p>
        ${programs.copayCards.map(p => buildProgramCard(p, 'copay')).join('')}
      </div>
    `
    : '';

  // Build PAPs section
  const papsHtml = programs.paps.length > 0
    ? `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #15803d; font-size: 18px; margin: 0 0 12px; border-bottom: 2px solid #22c55e; padding-bottom: 8px;">Patient Assistance Programs</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0 0 12px;">For uninsured patients or those on Medicare. May provide free medication if you meet income requirements.</p>
        ${programs.paps.map(p => buildProgramCard(p, 'pap')).join('')}
      </div>
    `
    : '';

  // Build foundations section (show top 3)
  const topFoundations = programs.foundations.slice(0, 3);
  const foundationsHtml = topFoundations.length > 0
    ? `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #7e22ce; font-size: 18px; margin: 0 0 12px; border-bottom: 2px solid #a855f7; padding-bottom: 8px;">Charitable Foundations</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0 0 12px;">Non-profit organizations that help with copays. Funds open and close based on availability.</p>
        ${topFoundations.map(p => buildProgramCard(p, 'foundation')).join('')}
      </div>
    `
    : '';

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
          <h1 style="color: #0f766e; margin: 0 0 8px; font-size: 24px;">Your Medication Assistance Results</h1>
          <p style="color: #64748b; margin: 0; font-size: 16px;">You requested this information from Transplant Medication Navigator</p>
        </div>

        <!-- Your Medications -->
        <div style="background: #f0fdfa; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <h2 style="color: #0f766e; font-size: 16px; margin: 0 0 12px;">Your Medications</h2>
          <ul style="margin: 0; padding-left: 20px; color: #1e293b;">
            ${medListHtml}
          </ul>
        </div>

        <!-- Summary -->
        <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>We found ${programs.copayCards.length} copay card${programs.copayCards.length !== 1 ? 's' : ''}, ${programs.paps.length} patient assistance program${programs.paps.length !== 1 ? 's' : ''}, and ${topFoundations.length} foundation${topFoundations.length !== 1 ? 's' : ''}</strong> that may help reduce your medication costs.
          </p>
        </div>

        <!-- Assistance Programs -->
        ${copayCardsHtml}
        ${papsHtml}
        ${foundationsHtml}

        <!-- Tips Section -->
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 12px;">Quick Tips</h3>
          <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px;">
            <li style="margin-bottom: 8px;"><strong>Commercial insurance?</strong> Start with copay cards - they're usually the easiest to use.</li>
            <li style="margin-bottom: 8px;"><strong>Medicare or uninsured?</strong> Apply for Patient Assistance Programs (PAPs) for free medication.</li>
            <li style="margin-bottom: 8px;"><strong>Need extra help?</strong> Foundations can cover copays that other programs don't.</li>
          </ul>
        </div>

        ${marketingOptIn ? `
        <div style="background: #ecfdf5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; color: #065f46; font-size: 14px;">✓ <strong>You're signed up for updates!</strong> We'll notify you about new assistance programs and renewal deadlines.</p>
        </div>
        ` : ''}

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="https://transplantmedicationnavigator.com" style="display: inline-block; background: #0d9488; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Explore More Resources</a>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; color: #64748b;">
          <p style="margin: 0 0 8px;"><strong>Questions?</strong> Reply to this email—we're here to help.</p>
          <p style="margin: 0 0 16px;">Transplant Medication Navigator</p>
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            You received this because you requested assistance information.
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
    // First check if Supabase is configured
    if (!process.env.SUPABASE_SERVICE_KEY) {
      console.error('DATABASE CONFIG ERROR: SUPABASE_SERVICE_KEY environment variable is not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to save email',
          errorDetails: 'SUPABASE_SERVICE_KEY not set'
        }),
      };
    }

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
      console.error('Supabase insert error:', JSON.stringify(error, null, 2));
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to save email',
          errorDetails: error.message || error.code || 'Database error'
        }),
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
          from: 'Transplant Medication Navigator <info@contact.transplantmedicationnavigator.com>',
          replyTo: 'info@transplantmedicationnavigator.com',
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
