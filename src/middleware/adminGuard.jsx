import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
export function AdminGuard({ children, fallback = null }) {
  const [state, setState] = useState("loading");
  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login?redirect=/admin/compliance"; return; }
      const user = session.user;
      const isAdmin = user.user_metadata?.role === "admin" || user.app_metadata?.role === "admin";
      setState(isAdmin ? "admin" : "denied");
    }
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) window.location.href = "/login?redirect=/admin/compliance";
    });
    return () => subscription.unsubscribe();
  }, []);
  if (state === "loading") return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#080e1a", color:"#4a6080", fontFamily:"monospace" }}>
      Verifying access...
    </div>
  );
  if (state === "denied") return fallback || (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", background:"#080e1a", color:"#e2ecf8" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
      <h2 style={{ margin:"0 0 8px" }}>Admin Access Required</h2>
      <p style={{ color:"#4a6080" }}>You don't have permission to view this page.</p>
      <a href="/" style={{ color:"#00c9a7", marginTop:16 }}>Back to TMN</a>
    </div>
  );
  return children;
}
