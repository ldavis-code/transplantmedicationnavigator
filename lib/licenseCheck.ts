import sql from './db';

export type LicenseStatus =
  | { licensed: true;  org: { id: string; name: string; tier: string } }
  | { licensed: false; reason: string };

export async function checkLicense(epicOrgId: string): Promise<LicenseStatus> {
  if (!epicOrgId) {
    return { licensed: false, reason: 'no_org_id' };
  }

  const rows = await sql`
    SELECT epic_org_id, org_name, tier, contract_end, active
    FROM licensed_organizations
    WHERE epic_org_id = ${epicOrgId}
    LIMIT 1
  `;

  // Not in the table at all
  if (rows.length === 0) {
    await logAccess(epicOrgId, '', false, 'not_licensed');
    return { licensed: false, reason: 'not_licensed' };
  }

  const org = rows[0];

  // Manually deactivated
  if (!org.active) {
    await logAccess(epicOrgId, org.org_name, false, 'deactivated');
    return { licensed: false, reason: 'deactivated' };
  }

  // Contract expired
  if (org.contract_end && new Date(org.contract_end) < new Date()) {
    await logAccess(epicOrgId, org.org_name, false, 'expired');
    return { licensed: false, reason: 'expired' };
  }

  // All good
  await logAccess(epicOrgId, org.org_name, true, 'licensed');
  return {
    licensed: true,
    org: { id: org.epic_org_id, name: org.org_name, tier: org.tier }
  };
}

async function logAccess(
  epicOrgId: string,
  orgName: string,
  granted: boolean,
  reason: string
) {
  await sql`
    INSERT INTO access_log (epic_org_id, org_name, granted, reason)
    VALUES (${epicOrgId}, ${orgName}, ${granted}, ${reason})
  `;
}
