/**
 * SEO metadata configuration for all pages
 * Each page has unique title, description, and social media tags
 */

const BASE_URL = 'https://transplantmedicationnavigator.com';
const SITE_NAME = 'Transplant Medication Navigator™';

export const seoMetadata = {
  home: {
    title: 'Transplant Medication Navigator™ - Free Medication Assistance Guide for Transplant Patients',
    description: 'Find free medication assistance programs for transplant patients. Search Patient Assistance Programs, compare copay foundations, and get help paying for immunosuppressants.',
    canonical: `${BASE_URL}/`,
    ogTitle: 'Transplant Medication Navigator™ - Free Medication Assistance',
    ogDescription: 'Free guide helping transplant patients find medication assistance programs, Patient Assistance Programs (PAPs), and copay support for immunosuppressants.',
    twitterTitle: 'Transplant Medication Navigator™',
    twitterDescription: 'Find free medication assistance programs for transplant patients. Search PAPs, copay foundations, and get help paying for immunosuppressants.',
  },

  wizard: {
    title: 'Personalized Medication Path | Transplant Medication Navigator™',
    description: 'Take our free personalized quiz to discover the best medication assistance programs for your transplant needs. Get tailored recommendations in minutes.',
    canonical: `${BASE_URL}/wizard`,
    ogTitle: 'Find Your Medication Assistance Path',
    ogDescription: 'Answer a few questions to get personalized recommendations for Patient Assistance Programs and copay support tailored to your transplant journey.',
    twitterTitle: 'Personalized Medication Assistance Quiz',
    twitterDescription: 'Take our free quiz to discover the best medication assistance programs for your transplant needs. Get tailored recommendations in minutes.',
  },

  medications: {
    title: 'Search Medications & Assistance Programs | Transplant Medication Navigator™',
    description: 'Search and compare transplant medications, prices, and Patient Assistance Programs. Find help paying for tacrolimus, mycophenolate, prednisone, and more.',
    canonical: `${BASE_URL}/medications`,
    ogTitle: 'Search Transplant Medications & Assistance',
    ogDescription: 'Comprehensive database of transplant medications with pricing, manufacturer PAPs, and copay foundation eligibility. Find help paying for your medications.',
    twitterTitle: 'Search Transplant Medications',
    twitterDescription: 'Search transplant medications, compare prices, and find Patient Assistance Programs. Get help paying for tacrolimus, mycophenolate, and more.',
  },

  education: {
    title: 'Resources & Education | Transplant Medication Navigator™',
    description: 'Learn about insurance coverage, copay foundations, specialty pharmacies, and medication assistance options for transplant patients. Expert guidance and resources.',
    canonical: `${BASE_URL}/education`,
    ogTitle: 'Transplant Medication Education & Resources',
    ogDescription: 'Comprehensive guides on insurance, Medicare, Medicaid, copay foundations, specialty pharmacies, and financial assistance for transplant medications.',
    twitterTitle: 'Transplant Medication Resources',
    twitterDescription: 'Learn about insurance, copay foundations, specialty pharmacies, and medication assistance options for transplant patients.',
  },

  applicationHelp: {
    title: 'How to Apply for Medication Assistance | Transplant Medication Navigator™',
    description: 'Step-by-step guide to applying for Patient Assistance Programs. Learn what documents you need, how to complete applications, and get approval faster.',
    canonical: `${BASE_URL}/application-help`,
    ogTitle: 'Apply for Patient Assistance Programs',
    ogDescription: 'Complete guide to applying for medication assistance. Get templates, checklists, and step-by-step instructions for Patient Assistance Program applications.',
    twitterTitle: 'Patient Assistance Program Grants & Foundations',
    twitterDescription: 'Step-by-step guide to applying for Patient Assistance Programs. Learn what documents you need and how to get approval faster.',
  },

  faq: {
    title: 'Frequently Asked Questions | Transplant Medication Navigator™',
    description: 'Find answers to common questions about Patient Assistance Programs, copay foundations, medication costs, and financial help for transplant patients.',
    canonical: `${BASE_URL}/faq`,
    ogTitle: 'Transplant Medication Assistance FAQs',
    ogDescription: 'Get answers to common questions about medication assistance, Patient Assistance Programs, copay support, and financial help for transplant patients.',
    twitterTitle: 'Medication Assistance FAQs',
    twitterDescription: 'Answers to common questions about Patient Assistance Programs, copay foundations, and financial help for transplant patients.',
  },

  notFound: {
    title: 'Page Not Found | Transplant Medication Navigator™',
    description: 'The page you are looking for could not be found. Visit our homepage to find medication assistance programs and resources for transplant patients.',
    canonical: `${BASE_URL}/`,
    ogTitle: 'Page Not Found',
    ogDescription: 'This page could not be found. Visit Transplant Medication Navigator™ to find medication assistance programs for transplant patients.',
    twitterTitle: 'Page Not Found',
    twitterDescription: 'This page could not be found. Visit our homepage to find medication assistance programs for transplant patients.',
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
