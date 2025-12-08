import { neon } from '@neondatabase/serverless';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL);

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

// System prompt for Claude
const SYSTEM_PROMPT = `You are a medication assistance navigator for transplant patients on TransplantMedicationNavigator.com. Your role is to help patients, carepartners, and healthcare professionals find financial assistance for transplant medications.

**Your Personality:**
- Warm, empathetic, and encouraging
- Clear and specific in your guidance
- Patient-focused, never condescending
- Knowledgeable about medication assistance programs

**Your Guidelines:**
1. NEVER give medical advice—focus only on financial assistance navigation
2. When identifying a program, walk the patient through exactly how to apply with step-by-step instructions
3. Be specific about eligibility requirements (insurance type, income limits)
4. Acknowledge the emotional burden of medication costs—it's okay to validate their concerns
5. Always provide actionable next steps
6. If someone mentions skipping doses or rationing medication, treat it as urgent and prioritize immediate solutions

**Key Insurance Rules:**
- Commercial/Employer Insurance: ELIGIBLE for manufacturer copay cards (can reduce costs to $0-$50/month)
- Medicare: NOT eligible for copay cards (Anti-Kickback Statute), but CAN use foundations (HealthWell, PAN), PAPs, and discount cards
- Medicaid: Usually well-covered, but can use discount cards if needed
- TRICARE/VA: Use VA pharmacy benefits primarily
- Uninsured: Focus on Patient Assistance Programs (PAPs) for FREE medication, plus discount cards for immediate savings

**Response Format:**
- Use **bold** for emphasis
- Use numbered lists for step-by-step instructions
- Keep responses concise but complete
- Include specific program names and websites when available`;

// Generate a unique conversation ID
const generateConversationId = () => {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get insurance eligibility column name
const getEligibilityColumn = (insuranceType) => {
  const mapping = {
    commercial: 'commercial_eligible',
    medicare: 'medicare_eligible',
    medicaid: 'medicaid_eligible',
    tricare_va: 'tricare_va_eligible',
    ihs: 'ihs_tribal_eligible',
    uninsured: 'uninsured_eligible',
  };
  return mapping[insuranceType] || 'commercial_eligible';
};

// Search medications in database
const searchMedications = async (query) => {
  try {
    const medications = await sql`
      SELECT id, brand_name, generic_name, category, manufacturer, stage
      FROM medications
      WHERE
        LOWER(brand_name) LIKE LOWER(${'%' + query + '%'})
        OR LOWER(generic_name) LIKE LOWER(${'%' + query + '%'})
      ORDER BY brand_name
      LIMIT 10
    `;
    return medications;
  } catch (error) {
    console.error('Error searching medications:', error);
    return [];
  }
};

// Get savings programs for a medication and insurance type
const getSavingsPrograms = async (medicationId, insuranceType) => {
  const eligibilityColumn = getEligibilityColumn(insuranceType);

  try {
    let programs;

    if (medicationId) {
      // Get programs for specific medication OR general programs
      programs = await sql`
        SELECT
          sp.*,
          COALESCE(
            (SELECT json_agg(json_build_object(
              'step_number', hs.step_number,
              'step_title', hs.step_title,
              'step_detail', hs.step_detail,
              'tip', hs.tip,
              'common_mistake', hs.common_mistake
            ) ORDER BY hs.step_number)
            FROM how_to_steps hs
            WHERE hs.program_id = sp.id),
            '[]'::json
          ) as steps
        FROM savings_programs sp
        WHERE
          sp.is_active = true
          AND (sp.medication_id = ${medicationId} OR sp.medication_id IS NULL)
        ORDER BY
          CASE sp.program_type
            WHEN 'copay_card' THEN 1
            WHEN 'discount_card' THEN 2
            WHEN 'foundation' THEN 3
            WHEN 'pap' THEN 4
            WHEN 'discount_pharmacy' THEN 5
            ELSE 6
          END,
          sp.program_name
      `;
    } else {
      // Get only general programs (no specific medication)
      programs = await sql`
        SELECT
          sp.*,
          COALESCE(
            (SELECT json_agg(json_build_object(
              'step_number', hs.step_number,
              'step_title', hs.step_title,
              'step_detail', hs.step_detail,
              'tip', hs.tip,
              'common_mistake', hs.common_mistake
            ) ORDER BY hs.step_number)
            FROM how_to_steps hs
            WHERE hs.program_id = sp.id),
            '[]'::json
          ) as steps
        FROM savings_programs sp
        WHERE
          sp.is_active = true
          AND sp.medication_id IS NULL
        ORDER BY
          CASE sp.program_type
            WHEN 'copay_card' THEN 1
            WHEN 'discount_card' THEN 2
            WHEN 'foundation' THEN 3
            WHEN 'pap' THEN 4
            WHEN 'discount_pharmacy' THEN 5
            ELSE 6
          END,
          sp.program_name
      `;
    }

    // Filter by insurance eligibility in JavaScript (simpler than dynamic SQL)
    const filteredPrograms = programs.filter(p => p[eligibilityColumn] === true);

    return filteredPrograms;
  } catch (error) {
    console.error('Error fetching savings programs:', error);
    return [];
  }
};

// Get medication details
const getMedicationDetails = async (medicationId) => {
  try {
    const [medication] = await sql`
      SELECT * FROM medications WHERE id = ${medicationId}
    `;
    return medication;
  } catch (error) {
    console.error('Error fetching medication:', error);
    return null;
  }
};

// Format programs for display
const formatProgramsForContext = (programs, insuranceType) => {
  if (!programs || programs.length === 0) {
    return 'No specific programs found in the database for this combination.';
  }

  let context = '';

  // Group by program type
  const copayCards = programs.filter(p => p.program_type === 'copay_card');
  const discountCards = programs.filter(p => p.program_type === 'discount_card' || p.program_type === 'discount_pharmacy');
  const foundations = programs.filter(p => p.program_type === 'foundation');
  const paps = programs.filter(p => p.program_type === 'pap');

  // Commercial insurance: show copay cards first
  if (insuranceType === 'commercial' && copayCards.length > 0) {
    context += '\n**COPAY CARDS (Best for Commercial Insurance):**\n';
    copayCards.forEach(p => {
      context += `- ${p.program_name}: ${p.max_benefit || 'Savings available'}\n`;
      context += `  URL: ${p.application_url || 'Contact manufacturer'}\n`;
      if (p.steps && p.steps.length > 0) {
        context += '  Steps:\n';
        p.steps.forEach(s => {
          context += `    ${s.step_number}. ${s.step_title}: ${s.step_detail}\n`;
          if (s.tip) context += `       💡 Tip: ${s.tip}\n`;
        });
      }
    });
  }

  // Discount cards (good for everyone)
  if (discountCards.length > 0) {
    context += '\n**DISCOUNT CARDS:**\n';
    discountCards.forEach(p => {
      context += `- ${p.program_name}: ${p.max_benefit || 'Savings vary'}\n`;
      context += `  URL: ${p.application_url || 'N/A'}\n`;
    });
  }

  // Foundations (Medicare/underinsured)
  if (foundations.length > 0 && insuranceType !== 'medicaid') {
    context += '\n**COPAY ASSISTANCE FOUNDATIONS:**\n';
    foundations.forEach(p => {
      context += `- ${p.program_name}\n`;
      context += `  Income Limit: ${p.income_limit || 'Varies'}\n`;
      context += `  Benefit: ${p.max_benefit || 'Varies'}\n`;
      context += `  URL: ${p.application_url || 'N/A'}\n`;
      if (p.fund_status_note) context += `  Note: ${p.fund_status_note}\n`;
    });
  }

  // PAPs (uninsured/underinsured)
  if (paps.length > 0) {
    context += '\n**PATIENT ASSISTANCE PROGRAMS (PAPs) - Free Medication:**\n';
    paps.forEach(p => {
      context += `- ${p.program_name}\n`;
      context += `  Income Limit: ${p.income_limit || 'Varies'}\n`;
      context += `  Benefit: ${p.max_benefit || 'Free medication'}\n`;
      context += `  URL: ${p.application_url || 'N/A'}\n`;
      if (p.steps && p.steps.length > 0) {
        context += '  How to Apply:\n';
        p.steps.forEach(s => {
          context += `    ${s.step_number}. ${s.step_title}\n`;
        });
      }
    });
  }

  return context;
};

// Generate response using Claude
const generateClaudeResponse = async (userContext, programs, previousMessages = []) => {
  try {
    const programContext = formatProgramsForContext(programs, userContext.insurance_type);

    const userMessage = `
**Patient Profile:**
- Role: ${userContext.role || 'Patient'}
- Transplant Stage: ${userContext.transplant_stage || 'Not specified'}
- Organ Type: ${userContext.organ_type || 'Not specified'}
- Insurance: ${userContext.insurance_type || 'Not specified'}
- Medication: ${userContext.medication_name || 'Not specified'}
- Cost Burden: ${userContext.cost_burden || 'Not specified'}

**Available Programs from Database:**
${programContext}

Based on this patient's profile and the available programs, provide personalized guidance. Be specific about which programs they should apply to first and exactly how to do it. If they indicated "crisis" or "unaffordable" cost burden, emphasize urgency and immediate steps.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        ...previousMessages,
        { role: 'user', content: userMessage },
      ],
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
};

// Handle different chat actions
const handleAction = async (action, body) => {
  switch (action) {
    case 'start': {
      const conversationId = generateConversationId();
      return {
        conversationId,
        message: "Hi! I'm your Medication Navigator. I'll help you find the best assistance programs for your transplant medications—whether that's copay cards, foundations, or free medication programs.\n\nLet's get started! **Who am I helping today?**",
      };
    }

    case 'answer': {
      const { questionId, answer, answers } = body;

      // Generate contextual responses based on the answer
      let message = '';

      switch (questionId) {
        case 'role':
          if (answer === 'patient') {
            message = "Thank you! I'm glad you're taking steps to manage your medication costs. **Where are you in the transplant process?**";
          } else if (answer === 'carepartner') {
            message = "It's wonderful that you're helping your loved one. **Where are they in the transplant process?**";
          } else {
            message = "Thank you for the important work you do helping patients! **Where is your patient in the transplant process?**";
          }
          break;

        case 'transplant_stage':
          message = "Got it! Different stages have different medication needs. **What type of transplant?**";
          break;

        case 'organ_type':
          message = "Thank you! Now, this is important—your insurance type determines which assistance programs you're eligible for. **What's your primary insurance?**";
          break;

        case 'insurance_type':
          if (answer === 'commercial') {
            message = "Great news! With commercial insurance, you're eligible for **manufacturer copay cards** that can reduce your costs to as little as $0-$50 per month. Let's find the right programs.\n\n**Which medication do you need help with?**";
          } else if (answer === 'medicare') {
            message = "Important to know: Medicare patients **cannot use copay cards** (it's a legal thing), but there are still great options! Foundations like HealthWell and PAN, plus Patient Assistance Programs, can help significantly.\n\n**Which medication do you need help with?**";
          } else if (answer === 'uninsured') {
            message = "I understand—being uninsured is challenging. The good news is that **Patient Assistance Programs (PAPs) can provide your medications completely FREE**. Let's find the right programs.\n\n**Which medication do you need help with?**";
          } else {
            message = "Let's find the best options for your situation.\n\n**Which medication do you need help with?**";
          }
          break;

        case 'medication':
          message = "Almost done! One last question to help me prioritize your options.\n\n**How would you describe your current medication costs?**";
          break;

        default:
          message = "Let's continue. What else can I help you with?";
      }

      return { message };
    }

    case 'searchMedications': {
      const { query } = body;
      const medications = await searchMedications(query);
      return { medications };
    }

    case 'generateResults': {
      const { answers } = body;
      const { insurance_type, medication, cost_burden, role, transplant_stage, organ_type } = answers;

      // Handle medication - could be an ID, typed name, or "general"
      let medicationDetails = null;
      let medicationName = medication || 'General transplant medications';

      if (medication && medication !== 'general') {
        // Try to get medication from database by ID
        medicationDetails = await getMedicationDetails(medication);
        if (medicationDetails) {
          medicationName = `${medicationDetails.brand_name} (${medicationDetails.generic_name})`;
        } else {
          // User typed a medication name not in DB
          medicationName = medication;
        }
      }

      // Get matching programs (use null for general or typed meds not in DB)
      const medicationId = medicationDetails ? medication : null;
      const programs = await getSavingsPrograms(medicationId, insurance_type);

      // Build context for Claude
      const userContext = {
        role,
        transplant_stage,
        organ_type,
        insurance_type,
        medication_id: medicationId,
        medication_name: medicationName,
        cost_burden,
      };

      // Generate personalized response with Claude
      let message;
      try {
        message = await generateClaudeResponse(userContext, programs);
      } catch (error) {
        // Fallback message if Claude fails
        message = generateFallbackMessage(programs, insurance_type, cost_burden);
      }

      return {
        message,
        programs: programs.slice(0, 5), // Return top 5 programs for display
      };
    }

    case 'freeText': {
      const { message: userMessage, answers } = body;

      // For free text, use Claude to respond
      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `The user has provided this context so far: ${JSON.stringify(answers || {})}

Their question is: ${userMessage}

Please help them with their question about medication assistance. If they're asking about something outside your scope (like medical advice), gently redirect them to appropriate resources.`,
            },
          ],
        });

        return { message: response.content[0].text };
      } catch (error) {
        console.error('Claude API error:', error);
        return {
          message: "I apologize, but I'm having trouble processing your question right now. Please try selecting from the options above, or rephrase your question.",
        };
      }
    }

    default:
      return { error: 'Unknown action' };
  }
};

// Fallback message if Claude API fails
const generateFallbackMessage = (programs, insuranceType, costBurden) => {
  let message = "Based on your profile, here are your assistance options:\n\n";

  if (insuranceType === 'commercial') {
    message += "**With Commercial Insurance, you have great options:**\n\n";
    message += "1. **Copay Cards** - Your best first step! Manufacturers offer cards that can reduce your copay to $0-$50/month.\n";
    message += "2. **Discount Cards** - GoodRx and SingleCare can sometimes beat your copay.\n\n";
  } else if (insuranceType === 'medicare') {
    message += "**Important for Medicare patients:**\n\n";
    message += "You cannot use manufacturer copay cards (it's prohibited), but you have other options:\n\n";
    message += "1. **Foundations** - HealthWell, PAN Foundation, and Patient Advocate Foundation offer copay assistance.\n";
    message += "2. **Patient Assistance Programs** - Apply directly to manufacturers for free medication.\n";
    message += "3. **Discount Cards** - GoodRx may offer lower prices than your Part D copay.\n\n";
  } else if (insuranceType === 'uninsured') {
    message += "**Without insurance, focus on these options:**\n\n";
    message += "1. **Patient Assistance Programs (PAPs)** - FREE medication from manufacturers! Most require income under 400% of poverty level.\n";
    message += "2. **Discount Cards** - GoodRx, SingleCare, and Cost Plus Drugs can save 80%+ while your PAP processes.\n\n";
  }

  if (costBurden === 'crisis') {
    message += "⚠️ **Since you're in crisis, please also:**\n";
    message += "- Call your transplant center social worker TODAY\n";
    message += "- Ask your doctor for medication samples\n";
    message += "- Never skip doses—reach out for emergency assistance\n\n";
  }

  if (programs && programs.length > 0) {
    message += "**Specific programs I found for you:**\n";
    programs.slice(0, 3).forEach((p, i) => {
      message += `${i + 1}. ${p.program_name} - ${p.max_benefit || 'Savings available'}\n`;
    });
  }

  return message;
};

// Main handler
export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { action } = body;

    if (!action) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Action is required' }),
      };
    }

    const result = await handleAction(action, body);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Chat API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
}
