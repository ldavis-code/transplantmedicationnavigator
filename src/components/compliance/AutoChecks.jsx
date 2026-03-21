import { useState, useEffect } from "react";
import { fetchAutoChecks, runComplianceChecks } from "../../lib/compliance-db";
const STATUS_STYLE = {
  pass:    { color: "#22c55e", icon: "✓", bg: "rgba(34,197,94,0.08)" },
  fail:    { color: "#ef4444", icon: "✗", bg: "rgba(239,68,68,0.08)" },
  warn:    { color: "#f59e0b", icon: "⚠", bg: "rgba(245,158,11,0.08)" },
  unknown: { color: "#4a6080", icon: "?", bg: "rgba(74,96,128,0.08)" },
};
const CHECK_TYPE_LABELS = {
  netlify_deploy: "Netlify Deploy",
  https:          "HTTPS / SSL",
  epic_fhir:      "Epic FHIR",
  baa_docs:       "BAA Documents",
};
function CheckCard({ check }) {
  const s = STATUS_STYLE[check.status] || STATUS_STYLE.unknown;
  return (
    <div style={{ background:s.bg, border:`1px solid ${s.color}30`, borderRadius:8, padding:"12px 16px", display:"flex", gap:12, alignItems:"flex-start" }}>
      <span style={{ fontSize:18, color:s.color, lineHeight:1.2, flexShrink:0 }}>{s.icon}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
          <span style={{ fontWeight:600, color:"#e2ecf8", fontSize:13 }}>{check.check_name}</span>
          <span style={{ fontSize:10, color:"#4a6080", whiteSpace:"nowrap" }}>
            {check.checked_at ? new Date(check.checked_at).toLocaleString() : "Never"}
          </span>
        </div>
        <div style={{ fontSize:12, color:"#8da5c4", marginTop:3, wordBreak:"break-word" }}>{check.detail || "No details"}</div>
      </div>
    </div>
  );
}
export function AutoChecksPanel() {
  const [checks, setChecks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError]     = useState(null);
  async function load() {
    try { const data = await fetchAutoChecks(); setChecks(data); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  async function runChecks() {
    setRunning(true);
    try { await runComplianceChecks(); await load(); }
    catch (e) { setError(e.message); }
    finally { setRunning(false); }
  }
  useEffect(() => { load(); }, []);
  const grouped = checks.reduce((acc, c) => { (acc[c.check_type] = acc[c.check_type] || []).push(c); return acc; }, {});
  return (
    <div style={{ background:"#0f1a2e", border:"1px solid #1e3050", borderRadius:12, padding:"20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h3 style={{ margin:0, color:"#e2ecf8", fontSize:16, fontWeight:700 }}>Live System Checks</h3>
          {checks.length > 0 && (
            <div style={{ fontSize:12, color:"#4a6080", marginTop:4 }}>
              {checks.filter(c=>c.status==="pass").length} passing · {checks.filter(c=>c.status==="fail").length} failing · {checks.filter(c=>c.status==="warn").length} warnings
            </div>
          )}
        </div>
        <button onClick={runChecks} disabled={running}
          style={{ background:running?"#1e3050":"#00c9a7", color:running?"#4a6080":"#000", border:"none", padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:700, cursor:running?"not-allowed":"pointer" }}>
          {running ? "Running..." : "↺ Run Checks"}
        </button>
      </div>
      {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", color:"#ef4444", fontSize:13, marginBottom:16 }}>{error}</div>}
      {loading ? (
        <div style={{ color:"#4a6080", fontSize:13, textAlign:"center", padding:"24px" }}>Loading check results...</div>
      ) : checks.length === 0 ? (
        <div style={{ color:"#4a6080", fontSize:13, textAlign:"center", padding:"24px" }}>No checks run yet. Click "Run Checks" to scan your systems.</div>
      ) : (
        <div style={{ display:"grid", gap:20 }}>
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <div style={{ fontSize:11, fontWeight:700, color:"#4a6080", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>
                {CHECK_TYPE_LABELS[type] || type}
              </div>
              <div style={{ display:"grid", gap:8 }}>
                {items.map(c => <CheckCard key={c.check_name} check={c} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
