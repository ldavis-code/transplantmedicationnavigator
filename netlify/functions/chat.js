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

// Known medications available on Cost Plus Drugs (fallback if DB not updated)
// Generic names in lowercase for matching
const COST_PLUS_MEDICATIONS = new Set([
  'tacrolimus',        // Prograf
  'mycophenolate',     // CellCept
  'mycophenolate mofetil',
  'mycophenolic acid', // Myfortic
  'sirolimus',         // Rapamune
  'cyclosporine',      // Neoral, Sandimmune
  'prednisone',
  'azathioprine',      // Imuran
  'everolimus',        // Zortress
  'valganciclovir',    // Valcyte
  'acyclovir',
  'valacyclovir',      // Valtrex
  'fluconazole',
  'nystatin',
  'sulfamethoxazole',  // Bactrim
  'trimethoprim',
  'omeprazole',
  'pantoprazole',
  'famotidine',
  'metoprolol',
  'lisinopril',
  'amlodipine',
  'atorvastatin',
  'pravastatin',
  'metformin',
]);

// Check if a medication is available on Cost Plus (using generic name)
const isCostPlusAvailable = (genericName) => {
  if (!genericName) return false;
  const normalized = genericName.toLowerCase().trim();
  // Check exact match or partial match
  for (const med of COST_PLUS_MEDICATIONS) {
    if (normalized.includes(med) || med.includes(normalized)) {
      return true;
    }
  }
  return false;
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
- Medicare: NOT eligible for copay cards (Anti-Kickback Statute), but CAN use foundations (HealthWell, PAN, etc.—funds open throughout the year, so check back if closed), PAPs, and discount cards
- Medicaid: Usually well-covered, but can use discount cards if needed

**2026 Medicare Updates:**
- Part B standard premium: $202.90/month (up from $185.00 in 2025), deductible: $283/year
- Part B-ID premium (kidney transplant immunosuppressant coverage): $121.60/month (up from $110.40 in 2025)
- Part D out-of-pocket cap: $2,100/year (up from $2,000 in 2025)
- 10 negotiated drug prices now in effect (Eliquis, Januvia, Jardiance, Farxiga, Entresto, Xarelto, Stelara, Enbrel, Imbruvica, NovoLog/Fiasp)
- Third negotiation cycle: 15 new drugs announced Jan 27, 2026 for 2028 prices (includes Orencia, Trulicity, Xolair, Anoro Ellipta—all transplant-relevant)
- WISeR prior authorization pilot in AZ, NJ, OH, OK, TX, WA (outpatient procedures only, does NOT affect transplant medications)
- TRICARE/VA: Use VA pharmacy benefits primarily
- Uninsured: Focus on Patient Assistance Programs (PAPs) for FREE medication, plus discount cards for immediate savings

**Response Format:**
- Use **bold** for emphasis
- Use bullet points (not numbered lists) for any lists
- Keep responses concise but complete
- Do NOT use numbered lists - programs are displayed separately in the UI`;

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
      SELECT id, brand_name, generic_name, category, manufacturer, stage
      FROM medications
      WHERE
        LOWER(brand_name) LIKE LOWER(${'%' + query + '%'})
        OR LOWER(generic_name) LIKE LOWER(${'%' + query + '%'})
      ORDER BY brand_name
      LIMIT 10
    `;
    // Add Cost Plus availability using the fallback function
    return medications.map(med => ({
      ...med,
      cost_plus_available: isCostPlusAvailable(med.generic_name)
    }));
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

    // Filter by insurance eligibility
    // Commercial insurance: Only copay cards + PAPs (NO foundations, NO discount cards/pharmacies)
    // All other insurance types: PAPs + Foundations + Discount cards/pharmacies (price estimates)
    const filteredPrograms = programs.filter(p => {
      // For commercial insurance: ONLY copay cards and PAPs
      if (insuranceType === 'commercial') {
        return p.program_type === 'copay_card' || p.program_type === 'pap';
      }

      // For non-commercial: Include PAPs, foundations, discount cards/pharmacies
      // But NOT copay cards (they can't use them anyway)
      if (p.program_type === 'copay_card') {
        return false; // Non-commercial can't use copay cards
      }
      if (p.program_type === 'pap' || p.program_type === 'foundation' ||
          p.program_type === 'discount_pharmacy' || p.program_type === 'discount_card') {
        return true;
      }
      // For other program types, check insurance eligibility
      return p[eligibilityColumn] === true;
    });

    // Re-sort based on insurance type
    // For non-commercial: PAP (manufacturer) first, then foundations, then discount cards
    // For commercial: copay cards first, then PAP (backup), then foundations, then discount cards
    const sortOrder = insuranceType === 'commercial'
      ? { copay_card: 1, pap: 2, foundation: 3, discount_card: 4, discount_pharmacy: 5 }
      : { pap: 1, foundation: 2, copay_card: 3, discount_card: 4, discount_pharmacy: 5 };

    filteredPrograms.sort((a, b) => {
      const orderA = sortOrder[a.program_type] || 6;
      const orderB = sortOrder[b.program_type] || 6;
      return orderA - orderB;
    });

    return filteredPrograms;
  } catch (error) {
    console.error('Error fetching savings programs:', error);
    return [];
  }
};

// Get medication details from database
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
// Cost Plus Drugs is now handled separately in the UI, so we don't include it here
const formatProgramsForContext = (programs, insuranceType, costPlusAvailable = false) => {
  if (!programs || programs.length === 0) {
    return 'NO PROGRAMS FOUND in the database for this medication/insurance combination. Provide general guidance only.';
  }

  let context = '';

  // Group by program type
  const copayCards = programs.filter(p => p.program_type === 'copay_card');
  const discountCards = programs.filter(p => p.program_type === 'discount_card');
  const discountPharmacies = programs.filter(p => p.program_type === 'discount_pharmacy');
  const foundations = programs.filter(p => p.program_type === 'foundation');
  const paps = programs.filter(p => p.program_type === 'pap');

  // Order depends on insurance type
  if (insuranceType === 'commercial') {
    // Commercial: Copay cards FIRST, then PAPs only (NO discount cards, NO foundations)
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
    // Then PAPs as backup option
    if (paps.length > 0) {
      context += '\n**PATIENT ASSISTANCE PROGRAMS (if copay cards not enough):**\n';
      paps.forEach(p => {
        context += `- ${p.program_name}\n`;
        context += `  Income Limit: ${p.income_limit || 'Varies'}\n`;
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

**SPECIFIC PROGRAMS FROM DATABASE (${programCount} programs found):**
${programContext}

**INSTRUCTIONS:**
1. DO NOT mention Cost Plus Drugs - it is displayed separately in the UI
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
          SELECT m.generic_name, m.brand_name, sp.program_name
          FROM medications m
          LEFT JOIN savings_programs sp ON m.id = sp.medication_id
          LIMIT 5
        `;
        // Add Cost Plus availability using the fallback function
        const withCostPlus = result.map(row => ({
          ...row,
          cost_plus_available: isCostPlusAvailable(row.generic_name)
        }));
        return {
          success: true,
          message: 'Database connection successful!',
          sampleData: withCostPlus,
          medicationCount: result.length,
          note: 'Showing sample medications with program data'
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
      let costPlusMedications = []; // Track medications available on Cost Plus

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

            // Check Cost Plus availability - ONLY if generic is available (Cost Plus only carries generics)
            // Use DB value OR fallback to known list, but always require generic_available = true
            const costPlusAvail = details.generic_available === true &&
              (details.cost_plus_available || isCostPlusAvailable(details.generic_name));

            // Track if available on Cost Plus (don't add as individual program)
            if (costPlusAvail) {
              costPlusMedications.push({
                brand_name: details.brand_name,
                generic_name: details.generic_name
              });
            }

            // Get programs for this specific medication
            const medPrograms = await getSavingsPrograms(medId, insurance_type);

            // Build medication entry with its programs
            const medEntry = {
              medication_id: medId,
              medication_name: details.brand_name,
              generic_name: details.generic_name,
              generic_available: details.generic_available === true,
              cost_plus_available: costPlusAvail,
              programs: []
            };

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
            // User typed a medication name not in DB - check if it's on Cost Plus
            const customCostPlusAvail = isCostPlusAvailable(medId);
            medicationNames.push(medId);
            if (customCostPlusAvail) {
              costPlusMedications.push({
                brand_name: medId,
                generic_name: medId
              });
            }
            medicationPrograms.push({
              medication_id: medId,
              medication_name: medId,
              generic_name: medId,
              cost_plus_available: customCostPlusAvail,
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
      const anyCostPlusAvailable = costPlusMedications.length > 0;
      const userContext = {
        role,
        transplant_stage,
        organ_type,
        insurance_type,
        medication_ids: medicationIds,
        medication_name: medicationName,
        cost_burden,
        cost_plus_available: anyCostPlusAvailable,
        cost_plus_medications: costPlusMedications.map(m => m.brand_name),
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
        costPlusMedications, // List of medications available on Cost Plus
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

    case 'getMedicationSuggestions': {
      const { organs, transplant_stage, insurance_type } = body;

      if (!organs || organs.length === 0) {
        return { suggestions: [] };
      }

      try {
        const db = getDb();

        // Query medications that are common for the specified organ types
        const medications = await db`
          SELECT id, brand_name, generic_name, category, stage, common_organs
          FROM medications
          WHERE
            common_organs && ${organs}::text[]
            AND (
              stage = 'Both (Pre & Post)'
              OR stage = ${transplant_stage === 'pre' ? 'Pre-transplant' : 'Post-transplant'}
            )
          ORDER BY
            CASE
              WHEN category = 'Immunosuppressant' THEN 1
              WHEN category = 'Anti-infective' THEN 2
              WHEN category = 'Antibiotic' THEN 3
              ELSE 4
            END,
            brand_name
          LIMIT 20
        `;

        if (medications.length === 0) {
          return { suggestions: [] };
        }

        // Use Claude to create personalized suggestions
        const client = getAnthropic();
        const medicationList = medications.map(m =>
          `- ${m.brand_name} (${m.generic_name}) - ${m.category}`
        ).join('\n');

        const prompt = `You are a transplant medication expert. Based on a ${transplant_stage === 'pre' ? 'pre-transplant' : 'post-transplant'} patient with ${organs.join(', ')} transplant, organize these medications into helpful suggestion categories.

Available medications from our database:
${medicationList}

Create 3-5 suggestion categories with the most relevant medications for this patient. For each category:
- Give a short category name (e.g., "Core Immunosuppressants", "Anti-viral Prophylaxis")
- List 1-3 medication IDs (use the lowercase generic name from the list)
- Give a brief reason why these are important

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "suggestions": [
    {
      "category": "Category Name",
      "medications": ["medication_id1", "medication_id2"],
      "reason": "Brief explanation"
    }
  ]
}`;

        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }],
        });

        // Parse Claude's response
        const responseText = response.content[0].text.trim();
        const parsed = JSON.parse(responseText);

        // Validate medication IDs exist in our database
        const validMedIds = new Set(medications.map(m => m.id));
        const validatedSuggestions = parsed.suggestions.map(suggestion => ({
          ...suggestion,
          medications: suggestion.medications.filter(id => validMedIds.has(id))
        })).filter(s => s.medications.length > 0);

        return {
          suggestions: validatedSuggestions,
          source: 'ai'
        };

      } catch (error) {
        console.error('Error generating AI suggestions:', error);
        // Fallback to basic category-based suggestions
        const db = getDb();
        const medications = await db`
          SELECT id, brand_name, generic_name, category, stage
          FROM medications
          WHERE
            common_organs && ${organs}::text[]
          ORDER BY category, brand_name
          LIMIT 15
        `;

        // Group by category as fallback
        const categories = {};
        for (const med of medications) {
          if (!categories[med.category]) {
            categories[med.category] = {
              category: med.category,
              medications: [],
              reason: `Common ${med.category.toLowerCase()} medications for ${organs.join('/')} transplant`
            };
          }
          if (categories[med.category].medications.length < 3) {
            categories[med.category].medications.push(med.id);
          }
        }

        return {
          suggestions: Object.values(categories).slice(0, 5),
          source: 'fallback'
        };
      }
    }

    default:
      return { error: 'Unknown action' };
  }
};

// Fallback message if Claude API fails
// Cost Plus Drugs is handled separately in the UI
const generateFallbackMessage = (programs, insuranceType, costBurden, costPlusAvailable = false) => {
  let message = "Based on your profile, here are your assistance options:\n\n";

  if (insuranceType === 'commercial') {
    message += "**With Commercial Insurance, you have great options:**\n\n";
    message += "• **Copay Cards** - Your best first step! Manufacturers offer cards that can reduce your copay to $0-$50/month.\n";
    message += "• **Patient Assistance Programs** - If copay cards aren't enough, you may qualify for free medication from manufacturers.\n\n";
  } else if (insuranceType === 'medicare') {
    message += "**Important for Medicare patients:**\n\n";
    message += "You cannot use manufacturer copay cards (it's prohibited), but you have other options:\n\n";
    message += "• **Foundations** - HealthWell, PAN Foundation, and Patient Advocate Foundation offer copay assistance. *Funds open throughout the year—check back if currently closed!*\n";
    message += "• **Patient Assistance Programs** - Apply directly to manufacturers for free medication.\n";
    message += "• **Discount Cards** - Cost Plus Drugs or GoodRx may offer lower prices than your Part D copay.\n\n";
  } else if (insuranceType === 'uninsured') {
    message += "**Without insurance, focus on these options:**\n\n";
    message += "• **Patient Assistance Programs (PAPs)** - FREE medication from manufacturers! Most require income under 400% of poverty level.\n";
    message += "• **Discount Cards** - Cost Plus Drugs often has the lowest generic prices. GoodRx and SingleCare can save 80%+ while your PAP processes.\n\n";
  }

  if (costBurden === 'crisis') {
    message += "⚠️ **Since you're in crisis, please also:**\n";
    message += "- Call your transplant center social worker TODAY\n";
    message += "- Ask your doctor for medication samples\n";
    message += "- Never skip doses—reach out for emergency assistance\n\n";
  }

  if (programs && programs.length > 0) {
    message += "**Specific programs I found for you:**\n";
    programs.slice(0, 3).forEach((p) => {
      message += `• ${p.program_name} - ${p.max_benefit || 'Savings available'}\n`;
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
