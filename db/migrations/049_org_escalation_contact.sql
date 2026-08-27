-- Same-Day Escalation Contact for Enterprise Centers
-- The emergency guidance page (/education?topic=EMERGENCY) shows a
-- center-branded "call your center now" step when an organization has
-- configured one. escalation_phone is the number patients dial;
-- escalation_contact describes who answers and when (e.g. "Transplant
-- pharmacy, Mon-Fri 8am-6pm"). Both are optional: NULL hides the step,
-- so the public site and unconfigured tenants are unchanged.
-- Editable in the admin dashboard under Organization Settings.

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS escalation_phone TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS escalation_contact TEXT;
