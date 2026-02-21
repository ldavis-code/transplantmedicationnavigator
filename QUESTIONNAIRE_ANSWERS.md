# App Privacy Questionnaire Answers

**App:** Transplant Medication Navigator
**Organization:** TransplantNav LLC
**Date:** 2026-02-21

---

## 1. Which option best describes the company offering the app to users/patients?

**Answer: For-profit organization.**

_Rationale: TransplantNav LLC is a limited liability company, which is a for-profit business entity._

---

## 2. How is this app funded? (Select all that apply.)

**Answer:**
- [x] This app is funded by purchases, subscriptions, or donations.

_Rationale: The app offers paid Pro subscriptions (monthly and yearly plans) via Stripe. There is no advertising, no data sales, no grant funding, no healthcare provider funding, and no evidence of venture capital or volunteer/open-source production model in the codebase._

---

## 3. Where does this app store user data? (Select all that apply.)

**Answer:**
- [x] This app can store user data locally on the user's device.
- [x] This app stores data in locations outside of the user's control.

_Rationale:_
- _**Local storage:** The app uses browser localStorage to store authentication tokens (`tmn_subscriber_token`, `tmn_subscriber_user`) and can function with local-only data for free-tier users._
- _**External storage:** User account data (profiles, quiz responses, medication lists, email signups) is stored in Supabase (cloud database). Analytics/event data is stored in Neon PostgreSQL. Google Analytics (GA4, measurement ID G-MRRECSDQWC) collects usage data externally. Payment data is processed and stored by Stripe._

---

## 4. Other than the user, who has access to user data? (Select all that apply.)

**Answer:**
- [x] Your staff.
- [x] Others: Third-party service providers (Stripe for payment processing, Google Analytics for usage analytics, Resend for email delivery, Anthropic for AI chatbot queries).

_Rationale:_
- _**Staff:** The app has an admin authentication system with role-based access (super_admin, org_admin, editor, viewer) that provides staff access to user data via the Supabase backend._
- _**Service providers:** Per the privacy policy, data is shared with third-party vendors including Stripe (payments), analytics providers (Google Analytics), Resend (email), and Anthropic (AI chatbot). These providers process user data as part of delivering their services._
- _**Legal disclosure:** The privacy policy states data may be disclosed if required by law, though this is reactive rather than routine access._

---

## 5. Does the app developer allow users to obtain a complete record of the data that have been collected about them?

**Answer: Yes, the app developer allows users to obtain a complete record of the data that have been stored about them.**

_Rationale: The privacy policy (Section 7 - Your Privacy Rights) states: "You may request access to the personal information we hold about you." This is a request-based process (contact info@transplantmedicationnavigator.com) rather than an automated self-service export feature, but the policy commits to providing access to all personal information held._

---

## 6. Does the app developer use data about a user for reasons other than providing direct services to the user?

**Answer:**
- [x] The app developer may use data about users to improve its services in the future.

_Rationale: The privacy policy states data is used "To analyze usage trends and optimize our services." The app collects analytics events (page views, quiz completions, resource views, helpful votes) via Google Analytics and a custom event logging API to Neon PostgreSQL. The privacy policy explicitly states "We do not sell your personal information to third parties." There is no advertising, no third-party data sharing for advertising, and no evidence of research use._

---

## 7. What other individuals from the user's health record does the app use data about beyond providing direct services? (Select all that apply)

**Answer:**
- [x] No one.

_Rationale: While the Epic FHIR integration can pull MedicationRequest data that includes prescriber information, this metadata is used solely to display the user's own medication information. The app does not independently use data about other individuals (care team, family, etc.) from the user's health record for purposes beyond direct service to the user._

---

## 8. Does this app allow users to obtain a complete record of who has accessed data about them?

**Answer: No, this app does not allow users to obtain a record of who has accessed data about them.**

_Rationale: The codebase contains no audit logging visible to users and no feature for users to view access records. While the admin system has role-based access controls, there is no user-facing audit trail or access log functionality._

---

## 9. Is user data retained after a user deletes the app and closes their account?

**Answer: Yes.**

_Rationale: The privacy policy (Section 6 - Data Retention) states: "We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies." Additionally:_
- _There is no automated account deletion feature in the codebase._
- _Analytics data in Google Analytics and Neon PostgreSQL would persist independently._
- _Deletion is available only by manual request per Section 7, "subject to certain exceptions."_
- _Stripe payment records are retained by Stripe per their own policies._
