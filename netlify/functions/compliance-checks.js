const { neon } = require("@neondatabase/serverless");
async function saveCheck(sql, checkType, checkName, status, detail) {
  try {
    await sql`
      INSERT INTO compliance_auto_checks (check_type, check_name, status, detail)
      VALUES (${checkType}, ${checkName}, ${status}, ${detail})
    `;
  } catch (e) {
    console.error("Failed to save check:", e.message);
  }
}
async function checkNetlifyDeploy(sql) {
  const siteId = process.env.NETLIFY_SITE_ID;
  const token  = process.env.NETLIFY_API_TOKEN;
  if (!siteId || !token) {
    await saveCheck(sql, "netlify_deploy", "Netlify Deploy Status", "warn", "NETLIFY_SITE_ID or NETLIFY_API_TOKEN not configured");
    return;
  }
  try {
    const res = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys?per_page=1`,
      { headers: { Authorization: `Bearer ${token}` } });
    const [latest] = await res.json();
    if (!latest) { await saveCheck(sql, "netlify_deploy", "Netlify Deploy Status", "warn", "No deploys found"); return; }
    await saveCheck(sql, "netlify_deploy", "Netlify Latest Deploy",
      latest.state === "ready" ? "pass" : "fail",
      `State: ${latest.state} | Branch: ${latest.branch} | Context: ${latest.context} | Deployed: ${latest.created_at}`
    );
    const siteRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`,
      { headers: { Authorization: `Bearer ${token}` } });
    const site = await siteRes.json();
    const sslReady = site.ssl === "ready" || site.force_ssl;
    await saveCheck(sql, "https", "HTTPS / SSL Certificate",
      sslReady ? "pass" : "fail",
      sslReady ? "SSL active on Netlify" : `SSL state: ${site.ssl}`
    );
  } catch (e) {
    await saveCheck(sql, "netlify_deploy", "Netlify Deploy Status", "fail", e.message);
  }
}
async function checkHTTPS(sql) {
  const url = process.env.TMN_PROD_URL || "https://transplantmedicationnavigator.com";
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    const isHTTPS = res.url.startsWith("https://");
    await saveCheck(sql, "https", "Production HTTPS Check",
      isHTTPS && res.ok ? "pass" : "fail",
      `URL: ${res.url} | Status: ${res.status} | HTTPS: ${isHTTPS}`
    );
    const hsts = res.headers.get("strict-transport-security");
    await saveCheck(sql, "https", "HSTS Header Present",
      hsts ? "pass" : "warn",
      hsts ? `HSTS configured: ${hsts}` : "Strict-Transport-Security header missing — add in Netlify headers config"
    );
  } catch (e) {
    await saveCheck(sql, "https", "Production HTTPS Check", "fail", e.message);
  }
}
async function checkEpicFHIR(sql) {
  const fhirBase = process.env.EPIC_FHIR_BASE_URL || "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4";
  const metadataUrl = `${fhirBase}/metadata`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(metadataUrl, { signal: controller.signal, headers: { Accept: "application/fhir+json" } });
    clearTimeout(timeout);
    if (res.ok) {
      const meta = await res.json();
      await saveCheck(sql, "epic_fhir", "Epic FHIR Metadata Endpoint", "pass",
        `Reachable | FHIR version: ${meta.fhirVersion || "unknown"} | Software: ${meta.software?.name || "Epic FHIR"}`
      );
      const smartRes = await fetch(`${fhirBase}/.well-known/smart-configuration`, { headers: { Accept: "application/json" } });
      if (smartRes.ok) {
        const smart = await smartRes.json();
        await saveCheck(sql, "epic_fhir", "Epic SMART on FHIR Configuration", "pass",
          `Auth endpoint: ${smart.authorization_endpoint || "n/a"} | EHR launch: ${smart.capabilities?.includes("launch-ehr") || false}`
        );
      } else {
        await saveCheck(sql, "epic_fhir", "Epic SMART on FHIR Configuration", "warn", `SMART config returned ${smartRes.status}`);
      }
    } else {
      await saveCheck(sql, "epic_fhir", "Epic FHIR Metadata Endpoint", "warn", `HTTP ${res.status} — may require authentication`);
    }
  } catch (e) {
    await saveCheck(sql, "epic_fhir", "Epic FHIR Metadata Endpoint",
      e.name === "AbortError" ? "warn" : "fail",
      e.name === "AbortError" ? "Request timed out (8s)" : e.message
    );
  }
}
async function checkBAAdocs(sql) {
  // Data-driven: warn on any vendor in the compliance vendor tracker (Neon)
  // whose BAA is not marked signed. Vendors are managed on
  // /admin/compliance-overview.
  try {
    const vendors = await sql`SELECT name, baa_status FROM compliance_vendors ORDER BY name`;
    if (!vendors.length) {
      await saveCheck(sql, "baa_docs", "Vendor BAA Status", "warn", "No vendors in the compliance vendor tracker yet");
      return;
    }
    const unsigned = vendors.filter(v => v.baa_status !== "signed").map(v => v.name);
    await saveCheck(sql, "baa_docs", "Vendor BAA Status",
      unsigned.length === 0 ? "pass" : "warn",
      unsigned.length === 0 ? `All ${vendors.length} tracked vendors have signed BAAs` : `BAA not signed for: ${unsigned.join(", ")}`
    );
  } catch (e) {
    await saveCheck(sql, "baa_docs", "Vendor BAA Status", "fail", e.message);
  }
}

// Auth: allow Netlify scheduled invocations (body carries next_run) or a
// valid admin token — never anonymous HTTP callers, so internal posture
// details are not publicly readable.
const crypto = require("crypto");
const JWT_SECRET = process.env.JWT_SECRET;
const LEGACY_TOKEN_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD;
function verifyToken(token, secret, check) {
  try {
    const [data, signature] = token.split(".");
    const expected = crypto.createHmac("sha256", secret).update(data).digest("hex");
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, "base64").toString());
    if (payload.exp < Date.now()) return null;
    return check(payload) ? payload : null;
  } catch {
    return null;
  }
}
function isAuthorized(event) {
  const authHeader = event.headers?.["authorization"] || event.headers?.["Authorization"] || "";
  if (!authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.substring(7);
  return !!(
    verifyToken(token, JWT_SECRET, p => p.role === "super_admin" || p.role === "org_admin") ||
    verifyToken(token, LEGACY_TOKEN_SECRET, p => p.type === "admin")
  );
}
function isScheduledInvocation(event) {
  try {
    return !!JSON.parse(event.body || "{}").next_run;
  } catch {
    return false;
  }
}
exports.handler = async (event) => {
  const scheduled = isScheduledInvocation(event);
  if (!scheduled && !isAuthorized(event)) {
    return { statusCode: 401, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Unauthorized" }) };
  }
  const sql = neon(process.env.DATABASE_URL);
  await Promise.allSettled([checkNetlifyDeploy(sql), checkHTTPS(sql), checkEpicFHIR(sql), checkBAAdocs(sql)]);
  if (scheduled) {
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ checked_at: new Date().toISOString() }) };
  }
  const results = await sql`
    SELECT DISTINCT ON (check_name) check_type, check_name, status, detail, checked_at
    FROM compliance_auto_checks ORDER BY check_name, checked_at DESC
  `;
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ checked_at: new Date().toISOString(), results }) };
};
