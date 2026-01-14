/**
 * SEO metadata configuration for all pages
 * Each page has unique title, description, and social media tags
 */

const BASE_URL = 'https://transplantmedicationnavigator.com';
const SITE_NAME = 'Transplant Medication Navigator™';

export const seoMetadata = {
  home: {
    title: 'Transplant Medication Navigator™',
    description: 'Find free medication assistance for transplant patients. Search Patient Assistance Programs, copay foundations, and help paying for immunosuppressants.',
    canonical: `${BASE_URL}/`,
    ogTitle: 'Transplant Medication Navigator™ | From Prescription to Possession',
    ogDescription: 'Helping transplant patients find medication assistance programs, Patient Assistance Programs (PAPs), and copay support for immunosuppressants. Free educational resources.',
    twitterTitle: 'Transplant Medication Navigator™',
    twitterDescription: 'Find free medication assistance programs for transplant patients. Search PAPs, copay foundations, and get help paying for immunosuppressants.',
    breadcrumbName: 'Home',
  },

  wizard: {
    title: 'Personalized Medication Path | Transplant Medication Navigator™',
    description: 'Take our free personalized quiz to discover the best medication assistance programs for your transplant needs. Get tailored recommendations in minutes.',
    canonical: `${BASE_URL}/wizard`,
    ogTitle: 'Find Your Medication Assistance Path',
    ogDescription: 'Answer a few questions to get personalized recommendations for Patient Assistance Programs and copay support tailored to your transplant journey.',
    twitterTitle: 'Personalized Medication Assistance Quiz',
    twitterDescription: 'Take our free quiz to discover the best medication assistance programs for your transplant needs. Get tailored recommendations in minutes.',
    breadcrumbName: 'My Path Quiz',
  },

  medications: {
    title: 'Search Medications & Assistance Programs | Transplant Medication Navigator™',
    description: 'Search and compare transplant medications, prices, and Patient Assistance Programs. Find help paying for tacrolimus, mycophenolate, prednisone, and more.',
    canonical: `${BASE_URL}/medications`,
    ogTitle: 'Search Transplant Medications & Assistance',
    ogDescription: 'Comprehensive database of transplant medications with pricing, manufacturer PAPs, and copay foundation eligibility. Find help paying for your medications.',
    twitterTitle: 'Search Transplant Medications',
    twitterDescription: 'Search transplant medications, compare prices, and find Patient Assistance Programs. Get help paying for tacrolimus, mycophenolate, and more.',
    breadcrumbName: 'Medications',
  },

  education: {
    title: 'Resources & Education | Transplant Medication Navigator™',
    description: 'Learn about insurance coverage, copay foundations, specialty pharmacies, and medication assistance options for transplant patients. Expert guidance and resources.',
    canonical: `${BASE_URL}/education`,
    ogTitle: 'Transplant Medication Education & Resources',
    ogDescription: 'Comprehensive guides on insurance, Medicare, Medicaid, copay foundations, specialty pharmacies, and financial assistance for transplant medications.',
    twitterTitle: 'Transplant Medication Resources',
    twitterDescription: 'Learn about insurance, copay foundations, specialty pharmacies, and medication assistance options for transplant patients.',
    breadcrumbName: 'Resources & Education',
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
  },

  account: {
    title: 'My Account | Transplant Medication Navigator™',
    description: 'Manage your Transplant Medication Navigator account, view subscription status, and update billing information.',
    canonical: `${BASE_URL}/account`,
    ogTitle: 'My Account - Transplant Medication Navigator™',
    ogDescription: 'Manage your account and subscription for Transplant Medication Navigator.',
    twitterTitle: 'My Account',
    twitterDescription: 'Manage your Transplant Medication Navigator account and subscription.',
    breadcrumbName: 'My Account',
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
  },

  subscribe: {
    title: 'Subscribe to Pro | Transplant Medication Navigator™',
    description: 'Unlock unlimited features with a Pro subscription. Save medications, track savings, and get personalized assistance recommendations.',
    canonical: `${BASE_URL}/subscribe`,
    ogTitle: 'Subscribe to Pro - Unlock All Features',
    ogDescription: 'Get unlimited access to My Path Quiz, medication tracking, savings calculator, and more with a Pro subscription.',
    twitterTitle: 'Subscribe to Pro',
    twitterDescription: 'Unlock unlimited features with a Transplant Medication Navigator Pro subscription.',
    breadcrumbName: 'Subscribe',
  },

  subscribeSuccess: {
    title: 'Welcome to Pro! | Transplant Medication Navigator™',
    description: 'Your Pro subscription is now active. Enjoy unlimited access to all Transplant Medication Navigator features.',
    canonical: `${BASE_URL}/subscribe/success`,
    ogTitle: 'Welcome to Pro!',
    ogDescription: 'Your subscription is active. Enjoy unlimited access to all Transplant Medication Navigator features.',
    twitterTitle: 'Welcome to Pro!',
    twitterDescription: 'Your Pro subscription is now active. Enjoy all features.',
    breadcrumbName: 'Subscription Success',
  },

  subscribeCancel: {
    title: 'Subscription Cancelled | Transplant Medication Navigator™',
    description: 'Your subscription checkout was cancelled. You can still use all free features of Transplant Medication Navigator.',
    canonical: `${BASE_URL}/subscribe/cancel`,
    ogTitle: 'Subscription Cancelled',
    ogDescription: 'Checkout cancelled. You can still use all free features including medication search and educational resources.',
    twitterTitle: 'Subscription Cancelled',
    twitterDescription: 'Checkout cancelled. Continue using free features anytime.',
    breadcrumbName: 'Subscription Cancelled',
  },

  accessibility: {
    title: 'Accessibility Statement | Transplant Medication Navigator™',
    description: 'Our commitment to making Transplant Medication Navigator accessible to all users, including those with disabilities. Read about our accessibility features and standards.',
    canonical: `${BASE_URL}/accessibility`,
    ogTitle: 'Accessibility Statement - Transplant Medication Navigator™',
    ogDescription: 'Learn about our commitment to accessibility and the features we provide to ensure everyone can use Transplant Medication Navigator.',
    twitterTitle: 'Accessibility Statement',
    twitterDescription: 'Our commitment to making Transplant Medication Navigator accessible to all users.',
    breadcrumbName: 'Accessibility',
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
