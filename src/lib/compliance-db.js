import { supabase } from "./supabase";
const API_BASE   = "/.netlify/functions/compliance-state";
const CHECKS_URL = "/.netlify/functions/compliance-checks";
async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token || ""}` };
}
export async function fetchControls(framework) {
  const headers = await authHeaders();
  const params  = framework ? `?table=controls&framework=${framework}` : "?table=controls";
  const res     = await fetch(`${API_BASE}${params}`, { headers });
  if (!res.ok) throw new Error(`Failed to load controls: ${res.status}`);
  return res.json();
}
export async function fetchVendors() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}?table=vendors`, { headers });
  if (!res.ok) throw new Error(`Failed to load vendors: ${res.status}`);
  return res.json();
}
export async function fetchPolicies() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}?table=policies`, { headers });
  if (!res.ok) throw new Error(`Failed to load policies: ${res.status}`);
  return res.json();
}
export async function fetchRisks() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}?table=risks`, { headers });
  if (!res.ok) throw new Error(`Failed to load risks: ${res.status}`);
  return res.json();
}
export async function fetchIncidents() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}?table=incidents`, { headers });
  if (!res.ok) throw new Error(`Failed to load incidents: ${res.status}`);
  return res.json();
}
export async function fetchSummary() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}?table=summary`, { headers });
  if (!res.ok) throw new Error(`Failed to load summary: ${res.status}`);
  return res.json();
}
export async function fetchAutoChecks() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}?table=auto_checks`, { headers });
  if (!res.ok) throw new Error(`Failed to load auto checks: ${res.status}`);
  return res.json();
}
export async function updateControl(id, { status, evidence, due_date, owner }) {
  const headers = await authHeaders();
  const res = await fetch(API_BASE, { method:"POST", headers, body: JSON.stringify({ table:"controls", action:"update_control", data:{ id, status, evidence, due_date, owner } }) });
  if (!res.ok) throw new Error(`Failed to update control: ${res.status}`);
  return res.json();
}
export async function updateVendor(id, { baa_status, baa_date, notes }) {
  const headers = await authHeaders();
  const res = await fetch(API_BASE, { method:"POST", headers, body: JSON.stringify({ table:"vendors", action:"update_vendor", data:{ id, baa_status, baa_date, notes } }) });
  if (!res.ok) throw new Error(`Failed to update vendor: ${res.status}`);
  return res.json();
}
export async function upsertRisk(risk) {
  const headers = await authHeaders();
  const res = await fetch(API_BASE, { method:"POST", headers, body: JSON.stringify({ table:"risks", action:"upsert_risk", data: risk }) });
  if (!res.ok) throw new Error(`Failed to save risk: ${res.status}`);
  return res.json();
}
export async function upsertIncident(incident) {
  const headers = await authHeaders();
  const res = await fetch(API_BASE, { method:"POST", headers, body: JSON.stringify({ table:"incidents", action:"upsert_incident", data: incident }) });
  if (!res.ok) throw new Error(`Failed to save incident: ${res.status}`);
  return res.json();
}
export async function updatePolicy(id, { status, last_reviewed, next_review, file_link }) {
  const headers = await authHeaders();
  const res = await fetch(API_BASE, { method:"POST", headers, body: JSON.stringify({ table:"policies", action:"update_policy", data:{ id, status, last_reviewed, next_review, file_link } }) });
  if (!res.ok) throw new Error(`Failed to update policy: ${res.status}`);
  return res.json();
}
export async function runComplianceChecks() {
  const headers = await authHeaders();
  const res = await fetch(CHECKS_URL, { method:"POST", headers });
  if (!res.ok) throw new Error(`Checks failed: ${res.status}`);
  return res.json();
}
export async function uploadBAADoc(vendorId, vendorName, file, signedDate) {
  const path = `baa-docs/${vendorId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from("baa-documents").upload(path, file);
  if (error) throw error;
  const { error: dbError } = await supabase.from("baa_documents").insert({
    vendor_id: vendorId, vendor_name: vendorName, file_name: file.name,
    storage_path: path, file_size: file.size, signed_date: signedDate || null, uploaded_by: "admin"
  });
  if (dbError) throw dbError;
  return data;
}
export async function getBAADocURL(storagePath) {
  const { data, error } = await supabase.storage.from("baa-documents").createSignedUrl(storagePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}
