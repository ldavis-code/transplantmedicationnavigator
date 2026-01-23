# Transplant Medication Navigator - Product Roadmap

## Vision
Transform the Transplant Medication Navigator from a free informational tool into a SaaS platform for transplant centers, enabling them to help patients find affordable medications while maintaining HIPAA compliance.

---

## Phase 1: Foundation (Current)
*Free informational tool for transplant patients*

- [x] Medication database with assistance programs
- [x] Copay card and PAP information
- [x] User accounts (subscriber system)
- [x] AI chatbot for medication guidance
- [x] PWA support for mobile access
- [x] Basic security headers (HSTS, CSP, Permissions-Policy)
- [x] SEO optimization and sitemap
- [x] Outbound link tracking for programs

---

## Phase 2: SaaS Foundation
*Multi-tenant architecture for transplant centers*

### Infrastructure
- [ ] Multi-tenant database schema (center isolation)
- [ ] Center onboarding workflow
- [ ] Tenant-aware API endpoints
- [ ] Environment separation (staging/production)

### Transplant Center Dashboard
- [ ] Center admin portal
- [ ] Patient roster management
- [ ] Medication tracking per patient
- [ ] Program enrollment status tracking
- [ ] Reporting and analytics
- [ ] Staff user management (roles: admin, coordinator, viewer)

### Billing & Subscriptions
- [ ] Stripe subscription tiers for centers
- [ ] Usage-based pricing model
- [ ] Invoice generation
- [ ] Billing dashboard for center admins

### Patient Features
- [ ] Center-branded patient portal
- [ ] Medication reminders
- [ ] Renewal date alerts
- [ ] Secure messaging with center staff

---

## Phase 3: HIPAA Compliance
*Required before handling PHI in production*

### Vendor Agreements (BAAs)
- [ ] Netlify Enterprise plan + BAA
- [ ] Anthropic BAA (for AI chatbot with PHI)
- [ ] Neon Database HIPAA tier + BAA
- [ ] Supabase Pro/Enterprise + BAA

### Authentication & Access Control
- [ ] Replace custom JWT with proven auth library (Auth0/Clerk)
- [ ] Implement httpOnly cookies (remove localStorage tokens)
- [ ] Add rate limiting to all auth endpoints
- [ ] Password complexity requirements (12+ chars, mixed case, special)
- [ ] Multi-factor authentication (MFA)
- [ ] Session timeout and automatic logoff
- [ ] Role-based access control (RBAC)

### Data Security
- [ ] Remove all PHI from localStorage
- [ ] Field-level encryption for sensitive data
- [ ] Encryption at rest verification
- [ ] Secure key management
- [ ] Data retention policies

### Audit & Logging
- [ ] Comprehensive audit logging system
- [ ] Log all PHI access (who, what, when, where)
- [ ] Log authentication attempts (success/failure)
- [ ] Log data modifications
- [ ] Audit log retention (6+ years)
- [ ] Audit log export capability

### API Security
- [ ] Replace CORS `*` with specific domain allowlist
- [ ] API rate limiting
- [ ] Request validation and sanitization
- [ ] Timing-safe password comparisons

### AI Chatbot Compliance
- [ ] Strip PHI from chatbot requests (or sign Anthropic BAA)
- [ ] Implement conversation data retention limits
- [ ] Add PHI detection and redaction
- [ ] User consent for AI interactions

### Documentation & Policies
- [ ] Privacy Policy update
- [ ] Terms of Service update
- [ ] HIPAA Security Policy documentation
- [ ] Incident Response Plan
- [ ] Business Continuity Plan
- [ ] Employee training materials

---

## Phase 4: Enterprise Features
*Advanced features for larger transplant programs*

### Analytics & Insights
- [ ] Program success rate tracking
- [ ] Cost savings reports per patient/center
- [ ] Medication adherence analytics
- [ ] Population health dashboards

### Integrations
- [ ] EHR/EMR integration (Epic, Cerner)
- [ ] Pharmacy benefit manager (PBM) data feeds
- [ ] Manufacturer program API integrations
- [ ] SSO/SAML for enterprise centers

### Advanced Features
- [ ] Automated program eligibility checking
- [ ] Document upload and storage (secure)
- [ ] E-signature for program applications
- [ ] Bulk patient import
- [ ] API access for centers
- [ ] White-label options

---

## Technical Debt & Maintenance

### Code Quality
- [ ] Add comprehensive test coverage
- [ ] Implement CI/CD pipeline with security scanning
- [ ] Code review process documentation
- [ ] Dependency update automation

### Performance
- [ ] Database query optimization
- [ ] CDN optimization
- [ ] Load testing for multi-tenant scale

---

## Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| Phase 1 Complete | - | In Progress |
| Phase 2: MVP Dashboard | TBD | Not Started |
| Phase 3: HIPAA Ready | TBD | Not Started |
| Phase 4: Enterprise Launch | TBD | Not Started |

---

## Notes

- HIPAA compliance is **required** before any transplant center can use the platform with real patient data
- BAAs must be signed with ALL vendors who may access PHI
- Consider starting with a pilot transplant center for Phase 2 testing
- Budget for Netlify Enterprise (~$1,000+/month) and compliant database tiers

---

*Last updated: January 2026*
