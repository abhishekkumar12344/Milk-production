import { useState } from "react";
import { COLORS } from "../constants/index.js";
import { getStyles } from "../styles/getStyles.js";

export default function LoginPage({ onLogin, dark }) {
  const s = getStyles(dark);
  const [form, setForm] = useState({ email: "admin@dairy.com", password: "admin123", role: "Admin" });
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(form); }, 1200);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #eef2ff 0%, #f0fdf4 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: 24, padding: 40, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: COLORS.primary, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>🥛</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Welcome to DairyFlow</h2>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Sign in to your account</p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["Admin", "Staff", "Distributor"].map(r => (
            <button key={r} onClick={() => setForm({ ...form, role: r })}
              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: `1.5px solid ${form.role === r ? COLORS.primary : "#e2e8f0"}`, background: form.role === r ? "#dbeafe" : "transparent", color: form.role === r ? COLORS.primary : "#64748b", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              {r}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={s.label}>Email Address</label>
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ ...s.input, marginBottom: 0 }} placeholder="admin@dairy.com" />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={s.label}>Password</label>
          <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} type="password" style={{ ...s.input, marginBottom: 0 }} placeholder="••••••••" />
        </div>

        <button onClick={handleLogin} disabled={loading}
          style={{ ...s.btn(COLORS.primary), width: "100%", justifyContent: "center", padding: "12px 0", fontSize: 15, opacity: loading ? 0.8 : 1 }}>
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <div style={{ width: "100%", height: 1, background: "#e2e8f0", margin: "16px 0" }} />
          <button style={{ width: "100%", padding: "11px 0", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "white", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span>G</span> Continue with Google
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#64748b" }}>
          Don't have an account? <span style={{ color: COLORS.primary, cursor: "pointer", fontWeight: 600 }}>Contact Admin</span>
        </p>
      </div>
    </div>
  );
}
