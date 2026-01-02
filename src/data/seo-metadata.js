/**
 * SEO metadata configuration for all pages
 * Each page has unique title, description, and social media tags
 */

const BASE_URL = 'https://transplantmedicationnavigator.com';
const SITE_NAME = 'Transplant Medication Navigator™';

export const seoMetadata = {
  home: {
    title: 'Transplant Medication Navigator™ | Free Assistance Guide',
    description: 'Find free medication assistance for transplant patients. Search Patient Assistance Programs, copay foundations, and help paying for immunosuppressants.',
    canonical: `${BASE_URL}/`,
    ogTitle: 'Transplant Medication Navigator™ - Medication Assistance Guide',
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
};

/**
 * Helper function to get metadata for a specific page
 * @param {string} page - Page key (home, wizard, medications, etc.)
 * @returns {Object} Meta tag configuration
 */
export function getPageMetadata(page) {
  return seoMetadata[page] || seoMetadata.home;
}
