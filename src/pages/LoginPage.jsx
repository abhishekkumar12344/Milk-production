import { useState, useEffect } from "react";
import { COLORS } from "../constants/index.js";
import { getStyles } from "../styles/getStyles.js";
import { authAPI } from "../utils/api.js";

export default function LoginPage({ onLogin, dark }) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const s = getStyles(dark, isMobile, isTablet);
  const [form, setForm] = useState({ email: "admin@dairy.com", password: "admin123", role: "Admin" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      const result = await authAPI.login(form.email, form.password, form.role);
      
      if (result.success) {
        // Call the parent onLogin callback to update app state
        onLogin(result.data.user);
      } else {
        setError(result.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #eef2ff 0%, #f0fdf4 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 12 : 16 }}>
      <div style={{ background: "white", borderRadius: 24, padding: isMobile ? 24 : 40, width: "100%", maxWidth: isMobile ? "95%" : 420, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 24 : 32 }}>
          <div style={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56, background: COLORS.primary, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 24 : 28, margin: "0 auto 16px" }}>🥛</div>
          <h2 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Welcome to DairyFlow</h2>
          <p style={{ color: "#64748b", fontSize: isMobile ? 12 : 14, margin: 0 }}>Sign in to your account</p>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
            ❌ {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["Admin", "Staff", "Distributor"].map(r => (
            <button key={r} onClick={() => setForm({ ...form, role: r })} disabled={loading}
              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: `1.5px solid ${form.role === r ? COLORS.primary : "#e2e8f0"}`, background: form.role === r ? "#dbeafe" : "transparent", color: form.role === r ? COLORS.primary : "#64748b", cursor: loading ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600, opacity: loading ? 0.6 : 1 }}>
              {r}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={s.label}>Email Address</label>
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} onKeyPress={handleKeyPress} style={{ ...s.input, marginBottom: 0 }} placeholder="admin@dairy.com" disabled={loading} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={s.label}>Password</label>
          <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyPress={handleKeyPress} type="password" style={{ ...s.input, marginBottom: 0 }} placeholder="••••••••" disabled={loading} />
        </div>

        <button onClick={handleLogin} disabled={loading}
          style={{ ...s.btn(COLORS.primary), width: "100%", justifyContent: "center", padding: "12px 0", fontSize: 15, opacity: loading ? 0.8 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        <div style={{ marginTop: 16, fontSize: 12, color: "#64748b", padding: "12px 0" }}>
          <strong>Demo Credentials:</strong>
          <div>👤 Admin: admin@dairy.com / admin123</div>
          <div>👨‍💼 Staff: staff@dairy.com / admin123</div>
          <div>🚜 Distributor: distributor@dairy.com / admin123</div>
        </div>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#64748b" }}>
          Need help? <span style={{ color: COLORS.primary, cursor: "pointer", fontWeight: 600 }}>Contact Admin</span>
        </p>
      </div>
    </div>
  );
}
