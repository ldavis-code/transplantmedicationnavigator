// Client helpers for the admin compliance dashboard (/admin/compliance-overview).
// Uses the same Neon-backed admin token as the rest of the /admin area
// (issued by auth.js on /admin/login, stored by AuthContext).
const API_BASE = "/.netlify/functions/compliance-state";

// Must match AUTH_TOKEN_KEY in src/context/AuthContext.jsx
const AUTH_TOKEN_KEY = "tmn_auth_token";

function authHeaders() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY) || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}
export async function updateControl(id, { status, evidence, due_date, owner }) {
  const res = await fetch(API_BASE, { method:"POST", headers: authHeaders(), body: JSON.stringify({ table:"controls", action:"update_control", data:{ id, status, evidence, due_date, owner } }) });
  if (!res.ok) throw new Error(`Failed to update control: ${res.status}`);
  return res.json();
}
export async function updateVendor(id, { baa_status, baa_date, notes }) {
  const res = await fetch(API_BASE, { method:"POST", headers: authHeaders(), body: JSON.stringify({ table:"vendors", action:"update_vendor", data:{ id, baa_status, baa_date, notes } }) });
  if (!res.ok) throw new Error(`Failed to update vendor: ${res.status}`);
  return res.json();
}
export async function upsertRisk(risk) {
  const res = await fetch(API_BASE, { method:"POST", headers: authHeaders(), body: JSON.stringify({ table:"risks", action:"upsert_risk", data: risk }) });
  if (!res.ok) throw new Error(`Failed to save risk: ${res.status}`);
  return res.json();
}
export async function upsertIncident(incident) {
  const res = await fetch(API_BASE, { method:"POST", headers: authHeaders(), body: JSON.stringify({ table:"incidents", action:"upsert_incident", data: incident }) });
  if (!res.ok) throw new Error(`Failed to save incident: ${res.status}`);
  return res.json();
}
export async function updatePolicy(id, { status, last_reviewed, next_review, file_link }) {
  const res = await fetch(API_BASE, { method:"POST", headers: authHeaders(), body: JSON.stringify({ table:"policies", action:"update_policy", data:{ id, status, last_reviewed, next_review, file_link } }) });
  if (!res.ok) throw new Error(`Failed to update policy: ${res.status}`);
  return res.json();
}
