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
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    await saveCheck(sql, "baa_docs", "Supabase BAA Documents", "warn", "SUPABASE_URL or SUPABASE_SERVICE_KEY not configured");
    return;
  }
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/baa_documents?select=vendor_name,signed_date`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" }
    });
    const docs = await res.json();
    const required = ["Supabase","Neon PostgreSQL","Netlify","Epic (App Orchard)","Email Provider"];
    const uploaded = docs.map(d => d.vendor_name);
    const missing  = required.filter(v => !uploaded.includes(v));
    await saveCheck(sql, "baa_docs", "Vendor BAA Documents",
      missing.length === 0 ? "pass" : "warn",
      missing.length === 0 ? `All ${required.length} required BAA docs uploaded` : `Missing BAA docs for: ${missing.join(", ")}`
    );
  } catch (e) {
    await saveCheck(sql, "baa_docs", "Vendor BAA Documents", "fail", e.message);
  }
}
exports.handler = async (event) => {
  const sql = neon(process.env.DATABASE_URL);
  await Promise.allSettled([checkNetlifyDeploy(sql), checkHTTPS(sql), checkEpicFHIR(sql), checkBAAdocs(sql)]);
  const results = await sql`
    SELECT DISTINCT ON (check_name) check_type, check_name, status, detail, checked_at
    FROM compliance_auto_checks ORDER BY check_name, checked_at DESC
  `;
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ checked_at: new Date().toISOString(), results }) };
};
