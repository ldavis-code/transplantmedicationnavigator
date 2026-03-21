const { neon } = require("@neondatabase/serverless");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
async function verifyAdmin(event) {
  const token = (event.headers["authorization"] || "").replace("Bearer ", "");
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const isAdmin = user.user_metadata?.role === "admin" || user.app_metadata?.role === "admin";
  return isAdmin ? user : null;
}
async function getData(sql, table, params) {
  switch (table) {
    case "controls":
      const framework = params.get("framework");
      if (framework) return await sql`SELECT * FROM compliance_controls WHERE framework = ${framework} ORDER BY id`;
      return await sql`SELECT * FROM compliance_controls ORDER BY framework, id`;
    case "vendors":   return await sql`SELECT * FROM compliance_vendors ORDER BY name`;
    case "policies":  return await sql`SELECT * FROM compliance_policies ORDER BY name`;
    case "risks":     return await sql`SELECT * FROM compliance_risks ORDER BY status, id`;
    case "incidents": return await sql`SELECT * FROM compliance_incidents ORDER BY incident_date DESC`;
    case "auto_checks":
      return await sql`SELECT DISTINCT ON (check_name) check_type, check_name, status, detail, checked_at FROM compliance_auto_checks ORDER BY check_name, checked_at DESC`;
    case "summary":
      const [controls, vendors, risks, incidents, checks] = await Promise.all([
        sql`SELECT status, COUNT(*) FROM compliance_controls GROUP BY status`,
        sql`SELECT baa_status, COUNT(*) FROM compliance_vendors GROUP BY baa_status`,
        sql`SELECT status, COUNT(*) FROM compliance_risks GROUP BY status`,
        sql`SELECT status, COUNT(*) FROM compliance_incidents GROUP BY status`,
        sql`SELECT DISTINCT ON (check_name) check_type, check_name, status, checked_at FROM compliance_auto_checks ORDER BY check_name, checked_at DESC`
      ]);
      return { controls, vendors, risks, incidents, auto_checks: checks };
    default: throw new Error(`Unknown table: ${table}`);
  }
}
async function postData(sql, body) {
  const { table, action, data } = body;
  if (action === "update_control") {
    const { id, status, evidence, due_date, owner } = data;
    await sql`UPDATE compliance_controls SET status=${status}, evidence=${evidence}, due_date=${due_date||null}, owner=${owner}, updated_at=NOW() WHERE id=${id}`;
    return { success: true };
  }
  if (action === "update_vendor") {
    const { id, baa_status, baa_date, notes } = data;
    await sql`UPDATE compliance_vendors SET baa_status=${baa_status}, baa_date=${baa_date||null}, notes=${notes}, updated_at=NOW() WHERE id=${id}`;
    return { success: true };
  }
  if (action === "upsert_risk") {
    const { id, description, likelihood, impact, mitigation, status } = data;
    await sql`INSERT INTO compliance_risks (id,description,likelihood,impact,mitigation,status) VALUES (${id},${description},${likelihood},${impact},${mitigation},${status}) ON CONFLICT (id) DO UPDATE SET description=EXCLUDED.description, likelihood=EXCLUDED.likelihood, impact=EXCLUDED.impact, mitigation=EXCLUDED.mitigation, status=EXCLUDED.status, updated_at=NOW()`;
    return { success: true };
  }
  if (action === "upsert_incident") {
    const { id, incident_date, description, severity, status, resolution, hhs_notified, notified_date } = data;
    await sql`INSERT INTO compliance_incidents (id,incident_date,description,severity,status,resolution,hhs_notified,notified_date) VALUES (${id},${incident_date},${description},${severity},${status},${resolution},${hhs_notified||false},${notified_date||null}) ON CONFLICT (id) DO UPDATE SET description=EXCLUDED.description, severity=EXCLUDED.severity, status=EXCLUDED.status, resolution=EXCLUDED.resolution, hhs_notified=EXCLUDED.hhs_notified, notified_date=EXCLUDED.notified_date, updated_at=NOW()`;
    return { success: true };
  }
  if (action === "update_policy") {
    const { id, status, last_reviewed, next_review, file_link } = data;
    await sql`UPDATE compliance_policies SET status=${status}, last_reviewed=${last_reviewed||null}, next_review=${next_review||null}, file_link=${file_link}, updated_at=NOW() WHERE id=${id}`;
    return { success: true };
  }
  throw new Error(`Unknown action: ${action}`);
}
exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": process.env.TMN_PROD_URL || "*", "Access-Control-Allow-Headers": "Authorization, Content-Type" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  const user = await verifyAdmin(event);
  if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  const sql = neon(process.env.DATABASE_URL);
  try {
    if (event.httpMethod === "GET") {
      const params = new URLSearchParams(event.queryStringParameters || {});
      const table = params.get("table");
      if (!table) return { statusCode: 400, headers, body: JSON.stringify({ error: "table param required" }) };
      const data = await getData(sql, table, params);
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const result = await postData(sql, body);
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (e) {
    console.error("compliance-state error:", e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
