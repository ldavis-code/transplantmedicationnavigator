-- Migration 030: Seed admin user
-- Creates an initial super_admin user for the "public" organization.
--
-- IMPORTANT: After running this migration, log in at /admin/login with:
--   Email: ldavis@transplantmedicationnavigator.com
--   Password: change-me-immediately
--
-- Then change your password via the admin settings page.
--
-- The password hash below is for "change-me-immediately" using PBKDF2-SHA512
-- with 10000 iterations (matching auth.js hashPassword).
-- If you want a different initial password, generate it with:
--   node -e "const c=require('crypto'); const s=c.randomBytes(16).toString('hex'); const h=c.pbkdf2Sync('YOUR_PASSWORD',s,10000,64,'sha512').toString('hex'); console.log(h+':'+s)"

-- Get the public org ID
DO $$
DECLARE
  public_org_id INTEGER;
BEGIN
  SELECT id INTO public_org_id FROM organizations WHERE slug = 'public' LIMIT 1;

  -- Only insert if admin doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'ldavis@transplantmedicationnavigator.com') THEN
    INSERT INTO users (org_id, email, password_hash, name, role, is_active, email_verified)
    VALUES (
      public_org_id,
      'ldavis@transplantmedicationnavigator.com',
      -- This is "change-me-immediately" hashed with PBKDF2-SHA512 (10000 iterations).
      -- CHANGE THIS PASSWORD after first login.
      '0430ae864fffba462ac141e480470cafa4637223a8b313947ff07d64cd7ea6ae7f77c1452199e65c47d3240f0630a9fb525af42344e8fab7829713805e1b44e2:7600e7434dadfbb0e0929dabb0344f92',
      'TMN Admin',
      'super_admin',
      true,
      true
    );
  END IF;
END $$;
