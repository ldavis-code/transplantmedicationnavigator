/**
 * Chatbot Guidance Logic
 * Generates personalized medication assistance guidance based on user answers
 */

import { InsuranceType, FinancialStatus, TransplantStatus } from '../data/constants.js';

/**
 * Get eligibility flags based on insurance type
 */
export const getEligibilityFlags = (insuranceType) => {
  const flags = {
    copayCards: false,
    manufacturerPAPs: true,
    foundations: true,
    discountCards: true,
    medicarePartBID: false,
    stateFormulary: false,
    vaPrograms: false,
    ihsResources: false,
  };

  switch (insuranceType) {
    case InsuranceType.COMMERCIAL:
    case InsuranceType.MARKETPLACE:
      flags.copayCards = true;
      break;
    case InsuranceType.MEDICARE:
      flags.copayCards = false; // Medicare patients cannot use copay cards
      flags.medicarePartBID = true;
      break;
    case InsuranceType.MEDICAID:
      flags.stateFormulary = true;
      flags.discountCards = false; // Usually fully covered
      break;
    case InsuranceType.TRICARE_VA:
      flags.vaPrograms = true;
      flags.copayCards = false;
      break;
    case InsuranceType.IHS:
      flags.ihsResources = true;
      flags.copayCards = false;
      break;
    case InsuranceType.UNINSURED:
      flags.copayCards = false;
      flags.manufacturerPAPs = true; // Primary option
      flags.discountCards = true; // Important for uninsured
      break;
    default:
      break;
  }

  return flags;
};

/**
 * Get priority order for assistance programs based on insurance
 */
export const getPriorityOrder = (insuranceType, financialStatus) => {
  const isUrgent = financialStatus === FinancialStatus.CRISIS ||
                   financialStatus === FinancialStatus.UNAFFORDABLE;

  switch (insuranceType) {
    case InsuranceType.COMMERCIAL:
    case InsuranceType.MARKETPLACE:
      return isUrgent
        ? ['copayCards', 'foundations', 'manufacturerPAPs', 'discountCards']
        : ['copayCards', 'discountCards', 'foundations', 'manufacturerPAPs'];

    case InsuranceType.MEDICARE:
      return isUrgent
        ? ['manufacturerPAPs', 'foundations', 'discountCards', 'medicarePartBID']
        : ['foundations', 'discountCards', 'manufacturerPAPs', 'medicarePartBID'];

    case InsuranceType.MEDICAID:
      return ['stateFormulary', 'manufacturerPAPs'];

    case InsuranceType.TRICARE_VA:
      return ['vaPrograms', 'manufacturerPAPs'];

    case InsuranceType.IHS:
      return ['ihsResources', 'manufacturerPAPs'];

    case InsuranceType.UNINSURED:
      return isUrgent
        ? ['manufacturerPAPs', 'discountCards', 'foundations']
        : ['discountCards', 'manufacturerPAPs', 'foundations'];

    default:
      return ['manufacturerPAPs', 'foundations', 'discountCards'];
  }
};

/**
 * Generate guidance for a specific medication
 */
export const getMedicationGuidance = (medication, eligibilityFlags, insuranceType) => {
  const guidance = {
    medicationName: medication.brandName,
    genericName: medication.genericName,
    manufacturer: medication.manufacturer,
    costTier: medication.cost_tier,
    hasGeneric: medication.generic_available,
    actions: [],
  };

  // Copay card guidance (Commercial only)
  if (eligibilityFlags.copayCards && medication.manufacturer !== 'Generic') {
    guidance.actions.push({
      type: 'copayCard',
      priority: 1,
      title: `${medication.brandName} Copay Card`,
      description: `Check if ${medication.manufacturer} has a savings card. It can lower what you pay to $0-$50/month.`,
      link: medication.copayUrl || null,
      steps: [
        `Go to the ${medication.manufacturer} website`,
        'Look for "Copay Card" or "Savings Program"',
        'Sign up with your prescription info',
        'Show the card at your pharmacy',
      ],
    });
  }

  // Manufacturer PAP guidance
  if (eligibilityFlags.manufacturerPAPs && medication.papUrl) {
    guidance.actions.push({
      type: 'pap',
      priority: insuranceType === InsuranceType.UNINSURED ? 1 : 2,
      title: `${medication.manufacturer} Free Medicine Program`,
      description: `Apply for free medicine from the drug company. They look at your income to see if you qualify.`,
      link: medication.papUrl,
      steps: [
        'Go to the program website and download the form',
        'Fill out your part of the form',
        'Have your doctor fill out their part',
        'Attach proof of income (tax return or pay stubs)',
        'Send it in and wait 2-4 weeks',
      ],
    });
  }

  // Generic alternative guidance
  if (medication.generic_available && !medication.genericName.toLowerCase().includes(medication.brandName.toLowerCase())) {
    guidance.actions.push({
      type: 'generic',
      priority: 3,
      title: 'Generic Version Available',
      description: `${medication.genericName} has a generic version that often costs less. Ask your doctor if you can use the generic safely.`,
      steps: [
        'Ask your transplant doctor if the generic is OK for you',
        'Check if your insurance covers the generic (it often costs less)',
        'Get blood tests after any medicine change',
      ],
    });
  }

  // Discount card guidance - Cost Plus first for generics (often lowest price)
  if (eligibilityFlags.discountCards) {
    // Build links array with Cost Plus first for generic medications
    const discountLinks = medication.generic_available
      ? [
          { name: 'Cost Plus Drugs', url: 'https://costplusdrugs.com/' },
          { name: 'GoodRx', url: 'https://www.goodrx.com/' },
          { name: 'SingleCare', url: 'https://www.singlecare.com/' },
        ]
      : [
          { name: 'GoodRx', url: 'https://www.goodrx.com/' },
          { name: 'SingleCare', url: 'https://www.singlecare.com/' },
        ];

    guidance.actions.push({
      type: 'discountCard',
      priority: insuranceType === InsuranceType.UNINSURED ? 2 : 4,
      title: 'Compare Discount Card Prices',
      description: medication.generic_available
        ? 'Cost Plus Drugs, GoodRx, and SingleCare can save you money on generics.'
        : 'GoodRx and SingleCare can help you find savings.',
      links: discountLinks,
      steps: [
        'Compare prices on all sites',
        'Check if your pharmacy takes the discount card',
        'Compare the discount price to what your insurance charges',
        'Use whichever is cheaper!',
      ],
    });
  }

  return guidance;
};

/**
 * Generate overall guidance summary based on profile
 */
export const generateGuidanceSummary = (answers, medications) => {
  const { insurance, financialStatus, status, organs } = answers;
  const eligibility = getEligibilityFlags(insurance);
  const priority = getPriorityOrder(insurance, financialStatus);

  const summary = {
    profile: {
      insuranceType: insurance,
      financialStatus,
      transplantStatus: status,
      organs,
    },
    eligibility,
    priorityOrder: priority,
    keyMessages: [],
    medicationGuidance: [],
    resources: [],
    urgentActions: [],
  };

  // Generate key messages based on insurance
  switch (insurance) {
    case InsuranceType.COMMERCIAL:
    case InsuranceType.MARKETPLACE:
      summary.keyMessages.push({
        type: 'success',
        title: 'Copay Cards Can Help',
        message: 'With private insurance, you can use drug company copay cards to lower your costs. Start here!',
      });
      summary.keyMessages.push({
        type: 'warning',
        title: 'Use the Right Pharmacy',
        message: 'Most plans make you use a specific specialty pharmacy for transplant drugs. Using the wrong one can cost you full price!',
      });
      break;

    case InsuranceType.MEDICARE:
      summary.keyMessages.push({
        type: 'warning',
        title: 'Copay Cards Not Allowed',
        message: 'Medicare patients cannot use drug company copay cards. But you can use foundations and free medicine programs instead.',
      });
      if (organs?.includes('Kidney')) {
        summary.keyMessages.push({
          type: 'info',
          title: 'Special Kidney Coverage',
          message: 'Kidney transplant patients may qualify for Medicare Part B-ID, which covers anti-rejection drugs.',
        });
      }
      break;

    case InsuranceType.MEDICAID:
      summary.keyMessages.push({
        type: 'success',
        title: 'Good Coverage',
        message: 'Medicaid usually covers transplant drugs with low or no copay. Check which drugs your state covers.',
      });
      break;

    case InsuranceType.UNINSURED:
      summary.keyMessages.push({
        type: 'urgent',
        title: 'Apply for Free Medicine',
        message: 'Without insurance, free medicine programs from drug companies are your best option. Apply right away!',
      });
      summary.keyMessages.push({
        type: 'info',
        title: 'Discount Cards Can Save Money',
        message: 'For generics, Cost Plus Drugs often has the lowest prices. GoodRx and SingleCare can save 80-90% while you wait for your free medicine application.',
      });
      break;

    case InsuranceType.TRICARE_VA:
      summary.keyMessages.push({
        type: 'info',
        title: 'VA Pharmacy Help',
        message: 'VA pharmacies often fill transplant drugs at very low cost. Call your VA pharmacy team.',
      });
      break;

    case InsuranceType.IHS:
      summary.keyMessages.push({
        type: 'info',
        title: 'IHS Can Help',
        message: 'Indian Health Service may provide transplant drugs. Call your IHS pharmacy.',
      });
      break;
  }

  // Add financial-status-specific messages
  if (financialStatus === FinancialStatus.CRISIS) {
    summary.urgentActions.push({
      title: 'Do This Now',
      actions: [
        'Call your transplant center social worker TODAY',
        'Ask about emergency medicine supplies',
        'Apply for free medicine programs right away (many can help fast)',
        'Call HealthWell Foundation or PAN Foundation for emergency help',
      ],
    });
  }

  // Generate medication-specific guidance
  if (answers.medications && answers.medications.length > 0) {
    summary.medicationGuidance = answers.medications.map(medId => {
      const med = medications.find(m => m.id === medId);
      if (!med) return null;
      return getMedicationGuidance(med, eligibility, insurance);
    }).filter(Boolean);
  }

  // Add relevant resources based on insurance type
  summary.resources = getRelevantResources(insurance, organs);

  return summary;
};

/**
 * Get relevant resources based on insurance and organs
 */
export const getRelevantResources = (insuranceType, organs = []) => {
  const resources = [];

  // Universal resources
  resources.push({
    name: 'HealthWell Foundation',
    url: 'https://www.healthwellfoundation.org/',
    description: 'Disease-specific funds for copay assistance',
    category: 'Foundation',
  });

  resources.push({
    name: 'PAN Foundation',
    url: 'https://www.panfoundation.org/',
    description: 'Copay assistance for chronic conditions',
    category: 'Foundation',
  });

  resources.push({
    name: 'Patient Advocate Foundation',
    url: 'https://www.patientadvocate.org/',
    description: 'Free case management and financial assistance',
    category: 'Advocacy',
  });

  // Kidney-specific
  if (organs?.includes('Kidney')) {
    resources.push({
      name: 'American Kidney Fund',
      url: 'https://www.kidneyfund.org/',
      description: 'Financial assistance for kidney patients',
      category: 'Kidney',
    });
  }

  // Medicare-specific
  if (insuranceType === InsuranceType.MEDICARE) {
    resources.push({
      name: 'Medicare.gov',
      url: 'https://www.medicare.gov/',
      description: 'Compare Part D plans and check eligibility',
      category: 'Government',
    });

    if (organs?.includes('Kidney')) {
      resources.push({
        name: 'Medicare Part B-ID Information',
        url: 'https://www.medicare.gov/coverage/immunosuppressive-drugs',
        description: 'Information on Part B immunosuppressive drug coverage',
        category: 'Government',
      });
    }
  }

  // Discount cards - Cost Plus first (often lowest for generics)
  resources.push({
    name: 'Cost Plus Drugs',
    url: 'https://costplusdrugs.com/',
    description: 'Low-cost online pharmacy for generics',
    category: 'Discount',
  });

  resources.push({
    name: 'GoodRx',
    url: 'https://www.goodrx.com/',
    description: 'Compare pharmacy prices and get free coupons',
    category: 'Discount',
  });

  // Support groups
  resources.push({
    name: 'TRIO - Transplant Recipients International',
    url: 'https://www.trioweb.org/',
    description: 'Peer support and advocacy',
    category: 'Support',
  });

  return resources;
};

/**
 * Format guidance as chat messages
 */
export const formatGuidanceAsMessages = (summary) => {
  const messages = [];

  // Main summary message
  let mainMessage = `Based on your profile, here's your personalized medication assistance guide:\n\n`;

  // Add key messages
  summary.keyMessages.forEach(msg => {
    const emoji = msg.type === 'success' ? '✅' :
                  msg.type === 'warning' ? '⚠️' :
                  msg.type === 'urgent' ? '🚨' : 'ℹ️';
    mainMessage += `${emoji} **${msg.title}**\n${msg.message}\n\n`;
  });

  messages.push({
    type: 'assistant',
    text: mainMessage,
  });

  // Add urgent actions if any
  if (summary.urgentActions.length > 0) {
    let urgentMessage = `🚨 **${summary.urgentActions[0].title}:**\n\n`;
    summary.urgentActions[0].actions.forEach((action, i) => {
      urgentMessage += `${i + 1}. ${action}\n`;
    });
    messages.push({
      type: 'assistant',
      text: urgentMessage,
    });
  }

  // Add medication-specific guidance
  if (summary.medicationGuidance.length > 0) {
    let medMessage = `**Your Medication Assistance Options:**\n\n`;

    summary.medicationGuidance.forEach(med => {
      medMessage += `**${med.medicationName}** (${med.genericName})\n`;

      // Sort actions by priority and show top 2
      const sortedActions = med.actions.sort((a, b) => a.priority - b.priority).slice(0, 2);
      sortedActions.forEach(action => {
        medMessage += `• ${action.title}: ${action.description}\n`;
        if (action.link) {
          medMessage += `  → [Apply Here](${action.link})\n`;
        }
      });
      medMessage += '\n';
    });

    messages.push({
      type: 'assistant',
      text: medMessage,
    });
  }

  // Add resources
  let resourceMessage = `**Helpful Resources:**\n\n`;
  const topResources = summary.resources.slice(0, 5);
  topResources.forEach(resource => {
    resourceMessage += `• **${resource.name}**: ${resource.description}\n`;
  });
  resourceMessage += `\nWould you like more detailed steps for any of these options?`;

  messages.push({
    type: 'assistant',
    text: resourceMessage,
  });

  return messages;
};

/**
 * Get chatbot conversation questions
 */
export const getChatQuestions = () => [
  {
    id: 1,
    key: 'role',
    question: "Who are you?",
    type: 'single',
    options: [
      { value: 'Patient', label: 'Patient', icon: '🙋' },
      { value: 'Carepartner / Family', label: 'Family or Caregiver', icon: '👨‍👩‍👧' },
      { value: 'Social Worker / Coordinator', label: 'Social Worker or Coordinator', icon: '👩‍⚕️' },
    ],
  },
  {
    id: 2,
    key: 'status',
    question: "Where are you in the transplant process?",
    type: 'single',
    options: [
      { value: 'Pre-transplant (Evaluation/Waitlist)', label: 'Before transplant (waiting)', icon: '📋' },
      { value: 'Post-transplant (Within 1st year)', label: 'After transplant (first year)', icon: '🏥' },
      { value: 'Post-transplant (1+ years)', label: 'After transplant (1+ years)', icon: '🏠' },
    ],
  },
  {
    id: 3,
    key: 'organs',
    question: "What kind of transplant?",
    subtitle: "Pick all that apply",
    type: 'multi',
    options: [
      { value: 'Kidney', label: 'Kidney', icon: '🫘' },
      { value: 'Liver', label: 'Liver', icon: '🫀' },
      { value: 'Heart', label: 'Heart', icon: '❤️' },
      { value: 'Lung', label: 'Lung', icon: '🫁' },
      { value: 'Pancreas', label: 'Pancreas', icon: '🥞' },
      { value: 'Multi-organ', label: 'More than one', icon: '🔄' },
      { value: 'Other', label: 'Other', icon: '➕' },
    ],
  },
  {
    id: 4,
    key: 'insurance',
    question: "What is your insurance?",
    type: 'single',
    helpText: "This helps us find the right programs for you.",
    options: [
      { value: 'Commercial / Employer', label: 'From my job', icon: '🏢', hint: 'Copay cards can help!' },
      { value: 'Medicare', label: 'Medicare', icon: '🏛️', hint: 'Foundations and free programs can help' },
      { value: 'Medicaid (State)', label: 'Medicaid', icon: '🏥', hint: 'Usually good coverage' },
      { value: 'TRICARE / VA', label: 'TRICARE / VA', icon: '🎖️', hint: 'VA pharmacy can help' },
      { value: 'Indian Health Service / Tribal', label: 'Indian Health Service', icon: '🪶', hint: 'IHS can help' },
      { value: 'Uninsured / Self-pay', label: 'No insurance', icon: '💳', hint: 'Free medicine programs can help' },
    ],
  },
  {
    id: 5,
    key: 'medications',
    question: "Which medicine do you need help with?",
    subtitle: "Pick all that apply, or search by name",
    type: 'medication-select',
    searchable: true,
  },
  {
    id: 6,
    key: 'financialStatus',
    question: "How are you doing with medicine costs?",
    type: 'single',
    options: [
      { value: 'Manageable', label: 'OK', icon: '✅', description: 'I can afford my medicine' },
      { value: 'Challenging', label: 'Tight', icon: '😓', description: 'It is hard, but I manage' },
      { value: 'Unaffordable', label: 'Too much', icon: '😰', description: 'I have trouble paying' },
      { value: 'Crisis', label: 'Urgent', icon: '🆘', description: 'I have skipped doses to save money' },
    ],
  },
];
