import { neon } from '@neondatabase/serverless';
import Anthropic from '@anthropic-ai/sdk';

// Lazy initialization for Neon client
let sql = null;
const getDb = () => {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
};

// Lazy initialization for Anthropic client
let anthropic = null;
const getAnthropic = () => {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
};

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

**Cost Plus Drugs Logic:**
- When a medication IS available on Cost Plus Drugs, ALWAYS mention it FIRST as a price check option
- Cost Plus pricing: Cost + 15% markup + $5 pharmacy fee + $5 shipping
- No insurance needed - anyone can use it
- When a medication is NOT on Cost Plus, acknowledge this and move to other options

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
    const db = getDb();
    const medications = await db`
      SELECT id, brand_name, generic_name, category, manufacturer, stage, cost_plus_available
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
    const db = getDb();
    let programs;

    if (medicationId) {
      // Get programs for specific medication OR general programs
      programs = await db`
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
      programs = await db`
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

    // Filter by insurance eligibility - BUT always include discount_pharmacy and discount_card
    // because they are cash-pay options available to everyone regardless of insurance
    const filteredPrograms = programs.filter(p => {
      // Always include discount pharmacies (Cost Plus Drugs, etc) and discount cards
      if (p.program_type === 'discount_pharmacy' || p.program_type === 'discount_card') {
        return true;
      }
      // For other program types, check insurance eligibility
      return p[eligibilityColumn] === true;
    });

    return filteredPrograms;
  } catch (error) {
    console.error('Error fetching savings programs:', error);
    return [];
  }
};

// Get medication details including cost_plus_available
const getMedicationDetails = async (medicationId) => {
  try {
    const db = getDb();
    const [medication] = await db`
      SELECT * FROM medications WHERE id = ${medicationId}
    `;
    return medication;
  } catch (error) {
    console.error('Error fetching medication:', error);
    return null;
  }
};

// Format programs for display - ordered by insurance type
// Now accepts costPlusAvailable from the medications table
const formatProgramsForContext = (programs, insuranceType, costPlusAvailable = false) => {
  if (!programs || programs.length === 0) {
    // Still show Cost Plus info even if no programs in database
    let context = '';
    if (costPlusAvailable) {
      context += '\n**✓ COST PLUS DRUGS - THIS MEDICATION IS AVAILABLE:**\n';
      context += '- Mark Cuban Cost Plus Drugs\n';
      context += '  Price: Cost + 15% markup + $5 pharmacy fee + $5 shipping\n';
      context += '  URL: https://costplusdrugs.com\n';
      context += '  (No insurance needed, transparent pricing - check this price first!)\n\n';
    } else {
      context += '\n**ℹ️ Cost Plus Drugs:** This medication is NOT currently available on Cost Plus Drugs.\n\n';
    }
    context += 'NO OTHER PROGRAMS FOUND in the database for this medication/insurance combination. Provide general guidance only.';
    return context;
  }

  let context = '';

  // Group by program type
  const copayCards = programs.filter(p => p.program_type === 'copay_card');
  const discountCards = programs.filter(p => p.program_type === 'discount_card');
  const discountPharmacies = programs.filter(p => p.program_type === 'discount_pharmacy');
  const foundations = programs.filter(p => p.program_type === 'foundation');
  const paps = programs.filter(p => p.program_type === 'pap');

  // FIRST: Check Cost Plus Drugs availability from medication table (not savings_programs)
  if (costPlusAvailable) {
    context += '\n**✓ COST PLUS DRUGS - THIS MEDICATION IS AVAILABLE:**\n';
    context += '- Mark Cuban Cost Plus Drugs\n';
    context += '  Price: Cost + 15% markup + $5 pharmacy fee + $5 shipping\n';
    context += '  URL: https://costplusdrugs.com\n';
    context += '  (No insurance needed, transparent pricing - check this price first!)\n';
    context += '  **ALWAYS mention this option first and recommend the patient compare this price to their copay.**\n';
  } else {
    context += '\n**ℹ️ Cost Plus Drugs:** This medication is NOT currently available on Cost Plus Drugs.\n';
  }

  // Order depends on insurance type
  if (insuranceType === 'commercial') {
    // Commercial: Copay cards FIRST, then discount cards, then foundations, then PAPs
    if (copayCards.length > 0) {
      context += '\n**🥇 BEST OPTION - COPAY CARDS (for Commercial Insurance):**\n';
      copayCards.forEach(p => {
        context += `- ${p.program_name}\n`;
        context += `  Savings: ${p.max_benefit || 'Up to $0 copay'}\n`;
        context += `  URL: ${p.application_url || 'Contact manufacturer'}\n`;
        if (p.steps && p.steps.length > 0) {
          context += '  Steps to apply:\n';
          p.steps.forEach(s => {
            context += `    ${s.step_number}. ${s.step_title}: ${s.step_detail}\n`;
            if (s.tip) context += `       Tip: ${s.tip}\n`;
          });
        }
      });
    }
    // Then discount cards
    if (discountCards.length > 0) {
      context += '\n**DISCOUNT CARDS (compare prices):**\n';
      discountCards.forEach(p => {
        context += `- ${p.program_name}: ${p.max_benefit || 'Savings vary'}\n`;
        context += `  URL: ${p.application_url || 'N/A'}\n`;
      });
    }
  } else if (insuranceType === 'medicare') {
    // Medicare: NO copay cards allowed! Foundations first, then PAPs, then discount cards
    context += '\n**⚠️ IMPORTANT: Medicare patients CANNOT use manufacturer copay cards (Anti-Kickback Statute)**\n';

    if (foundations.length > 0) {
      context += '\n**🥇 BEST OPTION - COPAY ASSISTANCE FOUNDATIONS:**\n';
      foundations.forEach(p => {
        context += `- ${p.program_name}\n`;
        context += `  Income Limit: ${p.income_limit || 'Varies'}\n`;
        context += `  Benefit: ${p.max_benefit || 'Copay assistance'}\n`;
        context += `  URL: ${p.application_url || 'N/A'}\n`;
        if (p.fund_status_note) context += `  Fund Status: ${p.fund_status_note}\n`;
      });
    }
    if (paps.length > 0) {
      context += '\n**PATIENT ASSISTANCE PROGRAMS (free medication if eligible):**\n';
      paps.forEach(p => {
        context += `- ${p.program_name}\n`;
        context += `  Income Limit: ${p.income_limit || 'Varies'}\n`;
        context += `  URL: ${p.application_url || 'N/A'}\n`;
      });
    }
    if (discountCards.length > 0) {
      context += '\n**DISCOUNT CARDS (may beat Part D prices):**\n';
      discountCards.forEach(p => {
        context += `- ${p.program_name}: ${p.max_benefit || 'Savings vary'}\n`;
        context += `  URL: ${p.application_url || 'N/A'}\n`;
      });
    }
  } else if (insuranceType === 'uninsured') {
    // Uninsured: PAPs first (FREE meds), then discount pharmacies, then discount cards
    if (paps.length > 0) {
      context += '\n**🥇 BEST OPTION - PATIENT ASSISTANCE PROGRAMS (FREE medication):**\n';
      paps.forEach(p => {
        context += `- ${p.program_name}\n`;
        context += `  Income Limit: ${p.income_limit || 'Usually 400% FPL'}\n`;
        context += `  Benefit: ${p.max_benefit || 'FREE medication'}\n`;
        context += `  URL: ${p.application_url || 'N/A'}\n`;
        if (p.steps && p.steps.length > 0) {
          context += '  How to apply:\n';
          p.steps.forEach(s => {
            context += `    ${s.step_number}. ${s.step_title}\n`;
          });
        }
      });
    }
    if (discountCards.length > 0 || discountPharmacies.length > 0) {
      context += '\n**DISCOUNT OPTIONS (while PAP processes):**\n';
      [...discountPharmacies, ...discountCards].forEach(p => {
        context += `- ${p.program_name}: ${p.max_benefit || 'Savings vary'}\n`;
        context += `  URL: ${p.application_url || 'N/A'}\n`;
      });
    }
  } else {
    // Medicaid, TRICARE/VA, IHS - show what's available
    if (discountCards.length > 0) {
      context += '\n**DISCOUNT CARDS (if needed):**\n';
      discountCards.forEach(p => {
        context += `- ${p.program_name}: ${p.max_benefit || 'Savings vary'}\n`;
        context += `  URL: ${p.application_url || 'N/A'}\n`;
      });
    }
    if (paps.length > 0) {
      context += '\n**PATIENT ASSISTANCE PROGRAMS:**\n';
      paps.forEach(p => {
        context += `- ${p.program_name}\n`;
        context += `  URL: ${p.application_url || 'N/A'}\n`;
      });
    }
  }

  return context;
};

// Generate response using Claude
// Now accepts costPlusAvailable parameter
const generateClaudeResponse = async (userContext, programs, costPlusAvailable = false, previousMessages = []) => {
  try {
    const programContext = formatProgramsForContext(programs, userContext.insurance_type, costPlusAvailable);
    const programCount = programs ? programs.length : 0;

    const userMessage = `
**Patient Profile:**
- Role: ${userContext.role || 'Patient'}
- Transplant Stage: ${userContext.transplant_stage || 'Not specified'}
- Organ Type: ${userContext.organ_type || 'Not specified'}
- Insurance: ${userContext.insurance_type || 'Not specified'}
- Medication: ${userContext.medication_name || 'Not specified'}
- Cost Burden: ${userContext.cost_burden || 'Not specified'}
- Cost Plus Drugs Available: ${costPlusAvailable ? 'YES - mention this first!' : 'NO - not available on Cost Plus'}

**SPECIFIC PROGRAMS FROM DATABASE (${programCount} programs found):**
${programContext}

**INSTRUCTIONS:**
1. ${costPlusAvailable ? 'START by mentioning Cost Plus Drugs is available for this medication and recommend checking the price at costplusdrugs.com' : 'Note that this medication is NOT available on Cost Plus Drugs, then proceed to other options'}
2. ONLY recommend the specific programs listed above from the database - do NOT make up programs or give generic advice
3. Present programs in the order shown above (they are already sorted by priority for this insurance type)
4. Include the specific URLs and application steps from the database
5. If the patient indicated "crisis" or "unaffordable" cost burden, emphasize urgency and immediate steps
6. If NO programs were found, then and only then provide general guidance about where to look

Be specific and actionable. Reference the exact program names and URLs from the database.`;

    const response = await getAnthropic().messages.create({
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
    case 'test': {
      // Test database connection
      try {
        const db = getDb();
        const result = await db`
          SELECT m.generic_name, m.brand_name, m.cost_plus_available, sp.program_name
          FROM medications m
          LEFT JOIN savings_programs sp ON m.id = sp.medication_id
          WHERE m.cost_plus_available = true
          LIMIT 5
        `;
        return {
          success: true,
          message: 'Database connection successful!',
          sampleData: result,
          medicationCount: result.length,
          note: 'Showing medications with Cost Plus availability'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          hint: 'Check DATABASE_URL environment variable'
        };
      }
    }

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

      // Handle medication - could be a single ID, array of IDs, typed name, or "general"
      let medicationDetailsList = [];
      let medicationNames = [];
      let anyCostPlusAvailable = false;

      // Structure to hold programs grouped by medication
      let medicationPrograms = [];

      // Normalize medication input to array
      const medicationIds = Array.isArray(medication) ? medication : (medication && medication !== 'general' ? [medication] : []);

      if (medicationIds.length > 0) {
        // Get details and programs for each medication separately
        for (const medId of medicationIds) {
          const details = await getMedicationDetails(medId);
          if (details) {
            medicationDetailsList.push(details);
            medicationNames.push(`${details.brand_name} (${details.generic_name})`);

            // Get programs for this specific medication
            const medPrograms = await getSavingsPrograms(medId, insurance_type);

            // Build medication entry with its programs
            const medEntry = {
              medication_id: medId,
              medication_name: details.brand_name,
              generic_name: details.generic_name,
              cost_plus_available: details.cost_plus_available || false,
              programs: []
            };

            // Add Cost Plus Drugs first if available for this medication
            if (details.cost_plus_available) {
              anyCostPlusAvailable = true;
              medEntry.programs.push({
                id: 'cost-plus-drugs-' + medId,
                program_name: 'Mark Cuban Cost Plus Drugs',
                program_type: 'discount_pharmacy',
                max_benefit: 'Cost + 15% markup + $5 pharmacy fee + $5 shipping',
                application_url: 'https://costplusdrugs.com',
                description: 'Transparent, low-cost pricing. No insurance needed.',
                eligibility_summary: 'Available to everyone',
              });
            }

            // Add medication-specific programs (filter out duplicates and unwanted universal programs)
            const filteredPrograms = medPrograms.filter(p =>
              !p.program_name?.toLowerCase().includes('cost plus') &&
              !p.program_name?.toLowerCase().includes('costplus') &&
              !p.program_name?.toLowerCase().includes('needymeds') &&
              !p.program_name?.toLowerCase().includes('american transplant foundation') &&
              !p.program_name?.toLowerCase().includes('medicare extra help') &&
              !p.program_name?.toLowerCase().includes('rxassist')
            );
            medEntry.programs.push(...filteredPrograms);

            medicationPrograms.push(medEntry);
          } else {
            // User typed a medication name not in DB
            medicationNames.push(medId);
            medicationPrograms.push({
              medication_id: medId,
              medication_name: medId,
              generic_name: 'Custom entry',
              cost_plus_available: false,
              programs: []
            });
          }
        }
      }

      // If no valid medications found, get general programs
      if (medicationDetailsList.length === 0) {
        const generalPrograms = await getSavingsPrograms(null, insurance_type);
        // Filter out unwanted universal programs
        const filteredGeneralPrograms = generalPrograms.filter(p =>
          !p.program_name?.toLowerCase().includes('cost plus') &&
          !p.program_name?.toLowerCase().includes('costplus') &&
          !p.program_name?.toLowerCase().includes('needymeds') &&
          !p.program_name?.toLowerCase().includes('american transplant foundation') &&
          !p.program_name?.toLowerCase().includes('medicare extra help') &&
          !p.program_name?.toLowerCase().includes('rxassist')
        );
        medicationPrograms.push({
          medication_id: 'general',
          medication_name: 'General Assistance',
          generic_name: 'All transplant medications',
          cost_plus_available: false,
          programs: filteredGeneralPrograms
        });
      }

      // If no valid medications found, use general
      const medicationName = medicationNames.length > 0
        ? medicationNames.join(', ')
        : 'General transplant medications';

      // Build context for Claude
      const userContext = {
        role,
        transplant_stage,
        organ_type,
        insurance_type,
        medication_ids: medicationIds,
        medication_name: medicationName,
        cost_burden,
        cost_plus_available: anyCostPlusAvailable,
        cost_plus_medications: medicationDetailsList.filter(m => m.cost_plus_available).map(m => m.brand_name),
      };

      // Flatten programs for Claude context
      const allPrograms = medicationPrograms.flatMap(m => m.programs);

      // Generate personalized response with Claude
      let message;
      try {
        message = await generateClaudeResponse(userContext, allPrograms, anyCostPlusAvailable);
      } catch (error) {
        // Fallback message if Claude fails
        message = generateFallbackMessage(allPrograms, insurance_type, cost_burden, anyCostPlusAvailable);
      }

      return {
        message,
        medicationPrograms, // Programs grouped by medication
        programs: allPrograms.slice(0, 8), // Flat list for backward compatibility
        costPlusAvailable: anyCostPlusAvailable,
      };
    }

    case 'freeText': {
      const { message: userMessage, answers } = body;

      // For free text, use Claude to respond
      try {
        const response = await getAnthropic().messages.create({
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

// Fallback message if Claude API fails - now includes costPlusAvailable
const generateFallbackMessage = (programs, insuranceType, costBurden, costPlusAvailable = false) => {
  let message = "Based on your profile, here are your assistance options:\n\n";

  // Always mention Cost Plus status first
  if (costPlusAvailable) {
    message += "**✓ Good news! This medication is available on Cost Plus Drugs.**\n";
    message += "Check the price at https://costplusdrugs.com - their transparent pricing (cost + 15% + $5 pharmacy fee + $5 shipping) may be cheaper than your copay.\n\n";
  } else {
    message += "**Note:** This medication is not currently available on Cost Plus Drugs.\n\n";
  }

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

  // Handle GET requests - for testing in browser
  if (event.httpMethod === 'GET') {
    // Check for test action in query params
    const params = event.queryStringParameters || {};
    if (params.action === 'test') {
      try {
        const result = await handleAction('test', {});
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        };
      } catch (error) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: error.message }),
        };
      }
    }
    // Return info for GET without action
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'ok',
        message: 'Chat API is running. Use POST with {"action": "test"} to test database, or GET with ?action=test',
        endpoints: {
          test: 'GET /api/chat?action=test or POST {"action": "test"}',
          start: 'POST {"action": "start"}',
          searchMedications: 'POST {"action": "searchMedications", "query": "tacrolimus"}',
        }
      }),
    };
  }

  // Handle POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use GET or POST.' }),
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
