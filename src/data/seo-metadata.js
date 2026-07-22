/**
 * SEO metadata configuration for all pages
 * Each page has unique title, description, and social media tags
 */

const BASE_URL = 'https://transplantmedicationnavigator.com';
const SITE_NAME = 'Transplant Medication Navigator™';

export const seoMetadata = {
  home: {
    title: 'Transplant Medication Navigator™',
    description: 'Get FREE transplant medications through Patient Assistance Programs. Find help paying for tacrolimus, mycophenolate, immunosuppressants. Compare prices, copay foundations & grants for kidney, liver, heart transplant patients. Created by a transplant recipient.',
    canonical: `${BASE_URL}/`,
    ogTitle: 'Free Transplant Medication Help | Transplant Medication Navigator™',
    ogDescription: 'Find FREE medications for transplant patients through Patient Assistance Programs. Get tacrolimus, mycophenolate & immunosuppressants at no cost. Compare prices, find copay foundations & grants. Created by a transplant recipient.',
    twitterTitle: 'Free Transplant Medication Help | Medication Navigator',
    twitterDescription: 'Find FREE medications through Patient Assistance Programs. Compare prices, find copay foundations & grants for transplant patients.',
    breadcrumbName: 'Home',
    es: {
      title: 'Transplant Medication Navigator™',
      description: 'Consiga medicamentos de trasplante GRATIS con los Programas de Asistencia al Paciente. Encuentre ayuda para pagar tacrolimus, micofenolato e inmunosupresores. Compare precios y encuentre fundaciones de copago y ayudas para pacientes de trasplante de riñón, hígado y corazón.',
      breadcrumbName: 'Inicio',
    },
  },

  wizard: {
    title: 'My Path Quiz - Find Free Medication Help | Transplant Medication Navigator™',
    description: 'Take our free 2-minute quiz to find Patient Assistance Programs for your transplant medications. Get personalized recommendations for free tacrolimus, mycophenolate, and copay help based on your insurance and income.',
    canonical: `${BASE_URL}/wizard`,
    ogTitle: 'Find Your Path to Free Transplant Medications',
    ogDescription: 'Answer a few questions to get personalized recommendations for FREE medications through Patient Assistance Programs. Takes 2 minutes.',
    twitterTitle: 'My Path Quiz - Free Medication Finder',
    twitterDescription: 'Take our free quiz to discover Patient Assistance Programs for your transplant medications. Personalized recommendations in 2 minutes.',
    breadcrumbName: 'My Path Quiz',
    es: {
      title: 'Cuestionario Mi Camino: encuentre ayuda gratis con sus medicamentos | Transplant Medication Navigator™',
      description: 'Haga nuestro cuestionario gratuito de 2 minutos para encontrar Programas de Asistencia al Paciente para sus medicamentos de trasplante. Reciba recomendaciones personalizadas según su seguro y sus ingresos.',
      breadcrumbName: 'Cuestionario Mi Camino',
    },
  },

  medications: {
    title: 'Search Transplant Medications & Prices | Transplant Medication Navigator™',
    description: 'Compare estimated transplant medication prices and find FREE assistance programs. Search tacrolimus (Prograf), mycophenolate (CellCept), prednisone, sirolimus (Rapamune), and more. Find copay cards, PAPs, and foundation grants.',
    canonical: `${BASE_URL}/medications`,
    ogTitle: 'Search Transplant Medications - Compare Estimated Prices & Find Free Help',
    ogDescription: 'Search transplant medications, compare estimated prices, and find Patient Assistance Programs offering FREE medications. Tacrolimus, mycophenolate, sirolimus, and more.',
    twitterTitle: 'Search Transplant Medications & Find Free Help',
    twitterDescription: 'Compare estimated prices and find FREE medication assistance for tacrolimus, mycophenolate, prednisone, and other transplant drugs.',
    breadcrumbName: 'Medications',
    es: {
      title: 'Busque medicamentos de trasplante y precios | Transplant Medication Navigator™',
      description: 'Compare precios estimados de medicamentos de trasplante y encuentre programas de asistencia GRATIS. Busque tacrolimus (Prograf), micofenolato (CellCept), prednisona y más. Encuentre tarjetas de copago, PAP y ayudas de fundaciones.',
      breadcrumbName: 'Medicamentos',
    },
  },

  education: {
    title: 'Education & Resources for Transplant Patients | Transplant Medication Navigator™',
    description: 'Educational guides on transplant medication coverage: Medicare Part D, Medicaid, insurance appeals, specialty pharmacies, the deductible trap, and copay foundation eligibility. Learn before you apply.',
    canonical: `${BASE_URL}/education`,
    ogTitle: 'Transplant Medication Education & Resources',
    ogDescription: 'Learn about Medicare, Medicaid, insurance coverage, specialty pharmacies, and how to avoid the deductible trap. Educational guides for transplant patients.',
    twitterTitle: 'Transplant Medication Education Resources',
    twitterDescription: 'Educational guides on Medicare, insurance, specialty pharmacies and medication coverage for transplant patients.',
    breadcrumbName: 'Education & Resources',
    es: {
      title: 'Educación y recursos para pacientes de trasplante | Transplant Medication Navigator™',
      description: 'Guías educativas sobre la cobertura de medicamentos de trasplante: Medicare Parte D, Medicaid, apelaciones, farmacias de especialidad, la trampa del deducible y las fundaciones de copago.',
      breadcrumbName: 'Educación y recursos',
    },
  },

  applicationHelp: {
    title: 'How to Apply for Medication Assistance | Transplant Medication Navigator™',
    description: 'Step-by-step guide to applying for Patient Assistance Programs. Learn what documents you need, how to complete applications, and get approval faster.',
    canonical: `${BASE_URL}/application-help`,
    ogTitle: 'Apply for Patient Assistance Programs',
    ogDescription: 'Complete guide to applying for medication assistance. Get templates, checklists, and step-by-step instructions for Patient Assistance Program applications.',
    twitterTitle: 'Patient Assistance Program Grants & Foundations',
    twitterDescription: 'Step-by-step guide to applying for Patient Assistance Programs. Learn what documents you need and how to get approval faster.',
    breadcrumbName: 'Grants & Foundations',
    es: {
      title: 'Cómo solicitar asistencia con medicamentos | Transplant Medication Navigator™',
      description: 'Guía paso a paso para solicitar Programas de Asistencia al Paciente. Sepa qué documentos necesita, cómo completar las solicitudes y cómo conseguir la aprobación más rápido.',
      breadcrumbName: 'Ayudas y fundaciones',
    },
  },

  faq: {
    title: 'Frequently Asked Questions | Transplant Medication Navigator™',
    description: 'Find answers to common questions about Patient Assistance Programs, copay foundations, medication costs, and financial help for transplant patients.',
    canonical: `${BASE_URL}/faq`,
    ogTitle: 'Transplant Medication Assistance FAQs',
    ogDescription: 'Get answers to common questions about medication assistance, Patient Assistance Programs, copay support, and financial help for transplant patients.',
    twitterTitle: 'Medication Assistance FAQs',
    twitterDescription: 'Answers to common questions about Patient Assistance Programs, copay foundations, and financial help for transplant patients.',
    breadcrumbName: 'FAQ',
    es: {
      title: 'Preguntas frecuentes | Transplant Medication Navigator™',
      description: 'Respuestas a las preguntas más comunes sobre los Programas de Asistencia al Paciente, las fundaciones de copago, los costos de los medicamentos y la ayuda económica para pacientes de trasplante.',
      breadcrumbName: 'Preguntas frecuentes',
    },
  },

  notFound: {
    title: 'Page Not Found | Transplant Medication Navigator™',
    description: 'The page you are looking for could not be found. Visit our homepage to find medication assistance programs and resources for transplant patients.',
    canonical: `${BASE_URL}/`,
    ogTitle: 'Page Not Found',
    ogDescription: 'This page could not be found. Visit Transplant Medication Navigator™ to find medication assistance programs for transplant patients.',
    twitterTitle: 'Page Not Found',
    twitterDescription: 'This page could not be found. Visit our homepage to find medication assistance programs for transplant patients.',
    breadcrumbName: 'Page Not Found',
    es: {
      title: 'Página no encontrada | Transplant Medication Navigator™',
      description: 'No pudimos encontrar la página que busca. Visite nuestra página de inicio para encontrar programas de asistencia con medicamentos y recursos para pacientes de trasplante.',
      breadcrumbName: 'Página no encontrada',
    },
  },

  forTransplantPrograms: {
    title: 'For Transplant Programs | Transplant Medication Navigator™',
    description: 'Help transplant patients find affordable medications with our privacy-safe resource. Reduce financial barriers to adherence with verified help programs.',
    canonical: `${BASE_URL}/for-transplant-programs`,
    ogTitle: 'Transplant Program Partnerships',
    ogDescription: 'Partner with Transplant Medication Navigator to help your patients find medication assistance programs. Privacy-safe, no PHI collected.',
    twitterTitle: 'For Transplant Programs',
    twitterDescription: 'Help your transplant patients find affordable medications with free educational resources and verified help programs.',
    breadcrumbName: 'For Transplant Programs',
  },

  forEmployers: {
    title: 'For Employers | Transplant Medication Navigator™',
    description: 'Reduce specialty drug costs for transplant employees. Connect your workforce to copay cards, manufacturer assistance, and foundation support.',
    canonical: `${BASE_URL}/for-employers`,
    ogTitle: 'Employer Benefits for Transplant Employees',
    ogDescription: 'Help transplant employees find medication assistance programs. Complement existing pharmacy benefits with free educational resources.',
    twitterTitle: 'For Employers',
    twitterDescription: 'Reduce specialty drug costs for transplant employees with our medication assistance resource and free educational content.',
    breadcrumbName: 'For Employers',
  },

  forHospitalAdmin: {
    title: 'For Hospital Administrators: IOTA & Graft Survival | Transplant Medication Navigator\u2122',
    description: 'IOTA downside risk went live July 1, 2026. Graft survival is 20% of your score, and medication non-adherence is its leading modifiable threat. Privacy-first patient education with Epic integration — no PHI stored.',
    canonical: `${BASE_URL}/for-hospitals`,
    ogTitle: 'IOTA Performance Year 2 Is Here: Patient Education Is Your Fastest Lever',
    ogDescription: 'CMS IOTA downside risk began July 1, 2026. Protect your composite graft survival score by removing medication cost barriers. Privacy-first, Epic-integrated, deployable in a 90-day pilot.',
    twitterTitle: 'IOTA PY2 Is Live: Protect Graft Survival',
    twitterDescription: 'IOTA downside risk began July 1, 2026. Privacy-first patient medication education for transplant programs, with Epic integration and aggregate reporting.',
    ogImage: `${BASE_URL}/og-image-hospitals.png`,
    twitterImage: `${BASE_URL}/og-image-hospitals.png`,
    breadcrumbName: 'Hospitals',
  },

  evidence: {
    title: 'The Evidence: Why Medication & Financial Navigation Matters | Transplant Medication Navigator™',
    description: 'Peer-reviewed research: 23% of liver transplant candidates face high financial burden, and nearly 40% of recipients miss medication fills due to cost. See why financial navigation is the targeted strategy the research calls for.',
    canonical: `${BASE_URL}/evidence`,
    ogTitle: 'The Evidence: Cost Is a Clinical Problem in Transplantation',
    ogDescription: 'Two national peer-reviewed studies document financial burden across the transplant journey — before transplant it threatens candidacy, after transplant it threatens the graft. TMN is the targeted strategy the researchers call for.',
    twitterTitle: 'The Evidence for Medication & Financial Navigation',
    twitterDescription: 'Peer-reviewed research: financial burden threatens transplant candidacy and graft survival. See the data behind medication and financial navigation.',
    breadcrumbName: 'Evidence',
    es: {
      title: 'La evidencia: por qué importa la navegación de medicamentos y finanzas | Transplant Medication Navigator™',
      description: 'Investigación revisada por expertos: el 23% de los candidatos a trasplante de hígado enfrenta una alta carga financiera, y casi el 40% de los receptores deja de surtir medicamentos por el costo.',
      breadcrumbName: 'La evidencia',
    },
  },

  forPayers: {
    title: 'For Payers | Transplant Medication Navigator™',
    description: 'Help members access manufacturer assistance programs for transplant medications. Reduce plan spend on high-cost drugs with our privacy-safe resource.',
    canonical: `${BASE_URL}/for-payers`,
    ogTitle: 'Payer Partnerships for Medication Assistance',
    ogDescription: 'Help members find manufacturer copay assistance and PAPs for transplant medications. Privacy-safe engagement tracking.',
    twitterTitle: 'For Payers',
    twitterDescription: 'Help members access manufacturer assistance programs for transplant medications.',
    breadcrumbName: 'For Payers',
  },

  pricing: {
    title: 'Pricing | Transplant Medication Navigator™',
    description: 'Free access to education, subscription options for patients, and partnership options for organizations. View our clear pricing.',
    canonical: `${BASE_URL}/pricing`,
    ogTitle: 'Clear Pricing',
    ogDescription: 'Free educational resources for all. Subscription and partnership options for patients and healthcare organizations.',
    twitterTitle: 'Pricing',
    twitterDescription: 'Free access to education, partnership options for organizations. View our clear pricing.',
    breadcrumbName: 'Pricing & Partners',
  },

  pilot: {
    title: 'Partner Pilot Program | Transplant Medication Navigator™',
    description: 'Welcome to the pilot program. Find medication assistance programs, search transplant medications, and access verified financial resources.',
    canonical: `${BASE_URL}/pilot`,
    ogTitle: 'Partner Pilot Program',
    ogDescription: 'Your healthcare provider has partnered with us to help you find medication assistance programs for transplant medications.',
    twitterTitle: 'Partner Pilot Program',
    twitterDescription: 'Find medication assistance programs through your healthcare provider partnership.',
    breadcrumbName: 'Pilot Program',
    es: {
      title: 'Programa piloto para socios | Transplant Medication Navigator™',
      description: 'Bienvenido al programa piloto. Encuentre programas de asistencia, busque medicamentos de trasplante y acceda a recursos financieros verificados.',
      breadcrumbName: 'Programa piloto',
    },
  },

  termsAndConditions: {
    title: 'Terms and Conditions | Transplant Medication Navigator™',
    description: 'Read the Terms and Conditions for using the Transplant Medication Navigator website. Understand your rights, responsibilities, and our disclaimer about medical advice.',
    canonical: `${BASE_URL}/terms-and-conditions`,
    ogTitle: 'Terms and Conditions - Transplant Medication Navigator™',
    ogDescription: 'Terms and Conditions governing the use of Transplant Medication Navigator, an educational resource for transplant patients and caregivers.',
    twitterTitle: 'Terms and Conditions',
    twitterDescription: 'Terms and Conditions for using Transplant Medication Navigator, an educational resource for transplant patients.',
    breadcrumbName: 'Terms and Conditions',
    es: {
      title: 'Términos y condiciones | Transplant Medication Navigator™',
      description: 'Lea los términos y condiciones para usar el sitio de Transplant Medication Navigator. Conozca sus derechos, sus responsabilidades y nuestro aviso sobre consejo médico.',
      breadcrumbName: 'Términos y condiciones',
    },
  },

  privacyPolicy: {
    title: 'Privacy Policy | Transplant Medication Navigator™',
    description: 'Read our Privacy Policy to understand how Transplant Medication Navigator collects, uses, and protects your personal information.',
    canonical: `${BASE_URL}/privacy`,
    ogTitle: 'Privacy Policy - Transplant Medication Navigator™',
    ogDescription: 'Learn how Transplant Medication Navigator collects, uses, and safeguards your personal information.',
    twitterTitle: 'Privacy Policy',
    twitterDescription: 'Privacy Policy for Transplant Medication Navigator - how we collect, use, and protect your data.',
    breadcrumbName: 'Privacy Policy',
    es: {
      title: 'Política de privacidad | Transplant Medication Navigator™',
      description: 'Lea nuestra política de privacidad para saber cómo Transplant Medication Navigator recopila, usa y protege su información personal.',
      breadcrumbName: 'Política de privacidad',
    },
  },

  survey: {
    title: 'Share Your Journey | Transplant Medication Navigator™',
    description: 'Share your medication experience to help improve access for all patients. Anonymous surveys for transplant recipients and anyone managing chronic conditions.',
    canonical: `${BASE_URL}/survey`,
    ogTitle: 'Share Your Medication Journey',
    ogDescription: 'Your experience can change the system. Take our anonymous survey to help improve medication access for patients everywhere.',
    twitterTitle: 'Share Your Journey',
    twitterDescription: 'Share your medication experience to help improve access for all patients. Anonymous surveys available.',
    breadcrumbName: 'Survey',
    es: {
      title: 'Comparta su experiencia | Transplant Medication Navigator™',
      description: 'Comparta su experiencia con los medicamentos para ayudar a mejorar el acceso para todos los pacientes. Encuestas anónimas para receptores de trasplante y personas con enfermedades crónicas.',
      breadcrumbName: 'Encuesta',
    },
  },

  surveyTransplant: {
    title: 'Transplant Medication Survey | Transplant Medication Navigator™',
    description: 'Share your transplant medication journey. Help us understand challenges with anti-rejection drugs, pharmacies, insurance, and assistance programs.',
    canonical: `${BASE_URL}/survey/transplant`,
    ogTitle: 'Transplant Medication Journey Survey',
    ogDescription: 'Share your experience with transplant medications. Your anonymous feedback helps improve access for all transplant patients.',
    twitterTitle: 'Transplant Medication Survey',
    twitterDescription: 'Share your transplant medication journey to help improve access for all patients.',
    breadcrumbName: 'Transplant Survey',
    es: {
      title: 'Encuesta sobre medicamentos de trasplante | Transplant Medication Navigator™',
      description: 'Comparta su experiencia con los medicamentos de trasplante. Ayúdenos a entender los retos con los medicamentos antirrechazo, las farmacias, el seguro y los programas de asistencia.',
      breadcrumbName: 'Encuesta de trasplante',
    },
  },

  surveyGeneral: {
    title: 'General Medication Survey | Transplant Medication Navigator™',
    description: 'Share your experience managing medications for chronic conditions. Help us advocate for better medication access and affordability.',
    canonical: `${BASE_URL}/survey/general`,
    ogTitle: 'General Medication Survey',
    ogDescription: 'Share your medication experience. Your anonymous feedback helps advocate for better access and affordability.',
    twitterTitle: 'General Medication Survey',
    twitterDescription: 'Share your experience managing medications for chronic conditions.',
    breadcrumbName: 'General Survey',
    es: {
      title: 'Encuesta general sobre medicamentos | Transplant Medication Navigator™',
      description: 'Comparta su experiencia manejando medicamentos para enfermedades crónicas. Ayúdenos a abogar por mejor acceso y precios más justos.',
      breadcrumbName: 'Encuesta general',
    },
  },

  myMedications: {
    title: 'My Medications | Transplant Medication Navigator™',
    description: 'Track your transplant medications, renewal dates, and costs. Manage your medication list privately on your device with export and import options.',
    canonical: `${BASE_URL}/my-medications`,
    ogTitle: 'My Medications - Track Your Prescriptions',
    ogDescription: 'Track your transplant medications, renewal dates, and costs. Manage your medication list privately on your device.',
    twitterTitle: 'My Medications',
    twitterDescription: 'Track your transplant medications, renewal dates, and costs privately.',
    breadcrumbName: 'My Medications',
    es: {
      title: 'Mis medicamentos | Transplant Medication Navigator™',
      description: 'Lleve el control de sus medicamentos de trasplante, fechas de renovación y costos. Su lista se guarda de forma privada en su dispositivo.',
      breadcrumbName: 'Mis medicamentos',
    },
    noindex: true, // Private user feature - do not index in search engines
  },

  savingsTracker: {
    title: 'Savings Calculator | Transplant Medication Navigator™',
    description: 'Calculate how much you could save on transplant medications with assistance programs. Track actual savings and see your total benefits over time.',
    canonical: `${BASE_URL}/savings-tracker`,
    ogTitle: 'Medication Savings Calculator',
    ogDescription: 'See how much you could save on transplant medications with assistance programs. Calculate and track your actual savings.',
    twitterTitle: 'Savings Calculator',
    twitterDescription: 'Calculate how much you could save on transplant medications with assistance programs.',
    breadcrumbName: 'Savings Calculator',
    es: {
      title: 'Calculadora de ahorros | Transplant Medication Navigator™',
      description: 'Calcule cuánto podría ahorrar en sus medicamentos de trasplante con los programas de asistencia. Registre sus ahorros reales y vea el total con el tiempo.',
      breadcrumbName: 'Calculadora de ahorros',
    },
  },

  copayReminders: {
    title: 'Copay Card Reminders | Transplant Medication Navigator™',
    description: 'Never miss a copay card renewal. Track expiration dates for manufacturer copay cards and patient assistance programs. Get reminders before your cards expire.',
    canonical: `${BASE_URL}/copay-reminders`,
    ogTitle: 'Copay Card Reminders - Never Miss a Renewal',
    ogDescription: 'Track copay card expiration dates and get reminders before they expire. Keep your medication assistance programs active.',
    twitterTitle: 'Copay Card Reminders',
    twitterDescription: 'Never miss a copay card renewal. Track expiration dates and get reminders.',
    breadcrumbName: 'Copay Reminders',
    es: {
      title: 'Recordatorios de tarjetas de copago | Transplant Medication Navigator™',
      description: 'No deje vencer su tarjeta de copago. Controle las fechas de vencimiento de las tarjetas del fabricante y de los programas de asistencia, y reciba recordatorios.',
      breadcrumbName: 'Recordatorios de copago',
    },
  },

  accessibility: {
    title: 'Accessibility & Section 504 Compliance | Transplant Medication Navigator™',
    description: 'HHS Section 504 compliance, WCAG 2.1 Level AA conformance, non-discrimination notice, and grievance procedure for Transplant Medication Navigator. Our commitment to accessibility for all users.',
    canonical: `${BASE_URL}/accessibility`,
    ogTitle: 'Accessibility & Section 504 Compliance - Transplant Medication Navigator™',
    ogDescription: 'Section 504 non-discrimination notice, accessibility features, WCAG 2.1 AA conformance, and grievance procedure for Transplant Medication Navigator.',
    twitterTitle: 'Accessibility & Section 504 Compliance',
    twitterDescription: 'Section 504 compliance, WCAG 2.1 AA conformance, and accessibility features for Transplant Medication Navigator.',
    breadcrumbName: 'Accessibility & Section 504',
    es: {
      title: 'Accesibilidad y Sección 504 | Transplant Medication Navigator™',
      description: 'Cumplimiento de la Sección 504 del HHS, conformidad con WCAG 2.1 nivel AA, aviso de no discriminación y procedimiento de quejas.',
      breadcrumbName: 'Accesibilidad y Sección 504',
    },
  },
};

/**
 * Helper function to get metadata for a specific page
 * @param {string} page - Page key (home, wizard, medications, etc.)
 * @returns {Object} Meta tag configuration
 */
export function getPageMetadata(page) {
  return seoMetadata[page] || seoMetadata.home;
}
