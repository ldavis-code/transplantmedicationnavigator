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

// Core medications lookup for email content
const MEDICATIONS_LOOKUP = {
  tacrolimus: { brandName: 'Prograf / Envarsus XR', genericName: 'Tacrolimus', copayUrl: 'https://www.astellaspharmasupportsolutions.com/', papUrl: 'https://www.astellaspharmasupportsolutions.com/' },
  cyclosporine: { brandName: 'Neoral / Sandimmune', genericName: 'Cyclosporine', copayUrl: 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', papUrl: 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance' },
  mycophenolate: { brandName: 'CellCept', genericName: 'Mycophenolate Mofetil', copayUrl: 'https://www.genentech-access.com/patient.html', papUrl: 'https://www.genentech-access.com/patient.html' },
  myfortic: { brandName: 'Myfortic', genericName: 'Mycophenolic Acid', copayUrl: 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', papUrl: 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance' },
  sirolimus: { brandName: 'Rapamune', genericName: 'Sirolimus', copayUrl: 'https://www.pfizer.com/patient-assistance', papUrl: 'https://www.pfizer.com/patient-assistance' },
  everolimus: { brandName: 'Zortress / Afinitor', genericName: 'Everolimus', copayUrl: 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', papUrl: 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance' },
  prednisone: { brandName: 'Prednisone', genericName: 'Prednisone', copayUrl: null, papUrl: null },
  azathioprine: { brandName: 'Imuran', genericName: 'Azathioprine', copayUrl: null, papUrl: null },
  belatacept: { brandName: 'Nulojix', genericName: 'Belatacept', copayUrl: 'https://www.bms.com/patient-and-caregiver/get-help-paying-for-your-medicines.html', papUrl: 'https://www.bms.com/patient-and-caregiver/get-help-paying-for-your-medicines.html' },
  basiliximab: { brandName: 'Simulect', genericName: 'Basiliximab', copayUrl: 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance', papUrl: 'https://www.novartis.com/us-en/patients-and-caregivers/patient-assistance' },
  atgam: { brandName: 'Atgam', genericName: 'Lymphocyte Immune Globulin', copayUrl: 'https://www.pfizer.com/patient-assistance', papUrl: 'https://www.pfizer.com/patient-assistance' },
  thymoglobulin: { brandName: 'Thymoglobulin', genericName: 'Anti-thymocyte Globulin', copayUrl: 'https://www.sanofi.us/en/patients-and-caregivers/patient-assistance-connection', papUrl: 'https://www.sanofi.us/en/patients-and-caregivers/patient-assistance-connection' },
  valganciclovir: { brandName: 'Valcyte', genericName: 'Valganciclovir', copayUrl: 'https://www.genentech-access.com/patient.html', papUrl: 'https://www.genentech-access.com/patient.html' },
  acyclovir: { brandName: 'Zovirax', genericName: 'Acyclovir', copayUrl: null, papUrl: null },
  valacyclovir: { brandName: 'Valtrex', genericName: 'Valacyclovir', copayUrl: null, papUrl: null },
  trimethoprim: { brandName: 'Bactrim / Septra', genericName: 'Trimethoprim-Sulfamethoxazole', copayUrl: null, papUrl: null },
  nystatin: { brandName: 'Nystatin', genericName: 'Nystatin', copayUrl: null, papUrl: null },
  fluconazole: { brandName: 'Diflucan', genericName: 'Fluconazole', copayUrl: null, papUrl: null },
};

// Insurance type labels for display
const INSURANCE_LABELS = {
  'Commercial / Employer': 'Commercial Insurance',
  'Marketplace / Self-purchased': 'Marketplace Insurance',
  'Medicare': 'Medicare',
  'Medicaid (State)': 'Medicaid',
  'TRICARE / VA': 'TRICARE/VA',
  'Indian Health Service / Tribal': 'Indian Health Service',
  'Uninsured / Self-pay': 'Uninsured',
  'Other / Not Sure': 'Other Insurance',
};

// Get personalized tips based on insurance type
function getInsuranceTips(insuranceType) {
  const tips = {
    'Commercial / Employer': [
      'You may qualify for manufacturer copay cards that can reduce costs to $0-$25/month',
      'Check if your plan has a specialty pharmacy with better pricing',
      'Ask about step therapy exemptions for transplant medications',
    ],
    'Marketplace / Self-purchased': [
      'Manufacturer copay cards can significantly reduce your out-of-pocket costs',
      'Review your plan during open enrollment to compare drug coverage',
      'Contact manufacturers directly for patient support programs',
    ],
    'Medicare': [
      'The Medicare Part D $2,000 cap (2025) limits your annual drug spending',
      'Extra Help/LIS can reduce costs if you have limited income',
      'Some manufacturers offer Medicare-specific assistance programs',
      'Kidney transplant patients: Medicare coverage extends 36+ months post-transplant',
    ],
    'Medicaid (State)': [
      'Your medications should have low or no copays under Medicaid',
      'Ensure your pharmacy is Medicaid-enrolled for best coverage',
      'Contact your state Medicaid office about any coverage gaps',
    ],
    'TRICARE / VA': [
      'Use military/VA pharmacies for lowest costs when possible',
      'TRICARE covers most transplant medications with low copays',
      'Contact your VA transplant coordinator for medication assistance',
    ],
    'Indian Health Service / Tribal': [
      'IHS pharmacies can provide medications at no cost',
      'Work with your IHS facility for medication coordination',
      'You may also qualify for state Medicaid alongside IHS',
    ],
    'Uninsured / Self-pay': [
      'Patient Assistance Programs (PAPs) can provide free medications',
      'Foundation grants may cover costs while applications process',
      'Generic immunosuppressants can reduce costs significantly',
      'Apply for Medicaid or marketplace coverage during open enrollment',
    ],
  };
  return tips[insuranceType] || tips['Other / Not Sure'] || [
    'Contact medication manufacturers about patient assistance programs',
    'Ask your transplant center social worker about financial resources',
  ];
}

// Build medication list HTML for email
function buildMedicationListHtml(medicationIds, insuranceType) {
  if (!medicationIds || medicationIds.length === 0) {
    return '<p style="color: #64748b;">No medications selected</p>';
  }

  const isCommercial = insuranceType?.includes('Commercial') || insuranceType?.includes('Marketplace');
  const isUninsured = insuranceType?.includes('Uninsured');

  return medicationIds.map(medId => {
    const med = MEDICATIONS_LOOKUP[medId];
    if (!med) {
      return `<li style="margin-bottom: 12px;"><strong>${escapeHtml(medId)}</strong></li>`;
    }

    let programLink = '';
    if (isCommercial && med.copayUrl) {
      programLink = `<br><a href="${escapeHtml(med.copayUrl)}" style="color: #0d9488; font-size: 14px;">→ Copay assistance program</a>`;
    } else if ((isUninsured || insuranceType?.includes('Medicare')) && med.papUrl) {
      programLink = `<br><a href="${escapeHtml(med.papUrl)}" style="color: #0d9488; font-size: 14px;">→ Patient assistance program</a>`;
    } else if (med.papUrl) {
      programLink = `<br><a href="${escapeHtml(med.papUrl)}" style="color: #0d9488; font-size: 14px;">→ Assistance program</a>`;
    }

    return `<li style="margin-bottom: 12px;"><strong>${escapeHtml(med.brandName)}</strong> <span style="color: #64748b;">(${escapeHtml(med.genericName)})</span>${programLink}</li>`;
  }).join('');
}

// Build personalized email HTML
function buildQuizResultsEmail(email, quizAnswers, medicationIds, marketingOptIn) {
  const insuranceType = quizAnswers?.insurance || 'Other / Not Sure';
  const insuranceLabel = INSURANCE_LABELS[insuranceType] || insuranceType;
  const tips = getInsuranceTips(insuranceType);
  const medicationListHtml = buildMedicationListHtml(medicationIds, insuranceType);
  const tipsHtml = tips.map(tip => `<li style="margin-bottom: 8px;">${escapeHtml(tip)}</li>`).join('');

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
            <span style="font-size: 32px;">💊</span>
          </div>
          <h1 style="color: #0f766e; margin: 0 0 8px; font-size: 24px;">Your Medication Assistance Plan</h1>
          <p style="color: #64748b; margin: 0; font-size: 16px;">Personalized strategies based on your quiz answers</p>
        </div>

        <!-- Insurance Summary -->
        <div style="background: #f0fdfa; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #14b8a6;">
          <h2 style="color: #0f766e; font-size: 16px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Your Coverage</h2>
          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">${escapeHtml(insuranceLabel)}</p>
        </div>

        <!-- Medications Section -->
        <div style="margin-bottom: 24px;">
          <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 16px;">Your Medications</h2>
          <ul style="margin: 0; padding-left: 20px; list-style-type: none;">
            ${medicationListHtml}
          </ul>
        </div>

        <!-- Tips Section -->
        <div style="background: #fefce8; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <h2 style="color: #854d0e; font-size: 18px; margin: 0 0 12px;">💡 Tips for ${escapeHtml(insuranceLabel)}</h2>
          <ul style="margin: 0; padding-left: 20px; color: #713f12;">
            ${tipsHtml}
          </ul>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="https://transplantmedicationnavigator.com" style="display: inline-block; background: #0d9488; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Full Results & Programs</a>
        </div>

        <!-- What's Next -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-bottom: 24px;">
          <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 12px;">What's Next?</h2>
          <ul style="margin: 0; padding-left: 20px; color: #475569;">
            <li style="margin-bottom: 8px;">Review detailed assistance programs for each medication</li>
            <li style="margin-bottom: 8px;">Download application forms for programs you qualify for</li>
            <li style="margin-bottom: 8px;">Set up copay card renewal reminders</li>
            <li style="margin-bottom: 8px;">Talk to your transplant coordinator about your options</li>
          </ul>
        </div>

        ${marketingOptIn ? `
        <div style="background: #ecfdf5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; color: #065f46; font-size: 14px;">✓ <strong>You're signed up for updates!</strong> We'll notify you about new assistance programs and renewal reminders.</p>
        </div>
        ` : ''}

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

    try {
      const emailHtml = buildQuizResultsEmail(
        email.toLowerCase().trim(),
        quizAnswers,
        selectedMedications,
        marketingOptIn
      );

      const { error: emailError } = await resend.emails.send({
        from: 'Transplant Medication Navigator <info@transplantmedicationnavigator.com>',
        to: email.toLowerCase().trim(),
        subject: 'Your Personalized Medication Assistance Plan',
        html: emailHtml,
      });

      if (emailError) {
        console.error('Resend error:', emailError);
        emailWarning = 'Results saved but email delivery pending';
      } else {
        emailSent = true;
      }
    } catch (emailErr) {
      console.error('Email send error:', emailErr);
      emailWarning = 'Results saved but email delivery failed';
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: emailSent ? 'Email saved and results sent' : 'Email saved successfully',
        id: data.id,
        emailSent,
        ...(emailWarning && { warning: emailWarning })
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
