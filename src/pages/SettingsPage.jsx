import { useState, useEffect } from "react";
import { COLORS } from "../constants/index.js";
import { getStyles } from "../styles/getStyles.js";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import { authAPI, getUserData } from "../utils/api.js";

export default function SettingsPage({ dark, toggleDark }) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const isMobile  = screenWidth < 768;
  const isTablet  = screenWidth >= 768 && screenWidth < 1024;
  const s         = getStyles(dark, isMobile, isTablet);
  const currentUser = getUserData();

  /* ── Business details (local only; wire to your /settings API if needed) ─ */
  const [profile, setProfile] = useState({
    businessName: "Shri Ram Dairy",
    ownerName:    "Mohan Lal",
    phone:        "9876543210",
    email:        "admin@shriram.dairy",
    address:      "Village Road, Sundarpur, UP - 226001",
  });

  /* ── Change-password form ─────────────────────────────────────────────── */
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading]   = useState(false);
  const [pwError,   setPwError]     = useState("");
  const [pwSuccess, setPwSuccess]   = useState("");

  const setPwField = (k) => (e) => {
    setPw(f => ({ ...f, [k]: e.target.value }));
    setPwError(""); setPwSuccess("");
  };

  const handleChangePassword = async () => {
    setPwError(""); setPwSuccess("");
    if (!pw.currentPassword || !pw.newPassword || !pw.confirmPassword)
      return setPwError("All three fields are required.");
    if (pw.newPassword !== pw.confirmPassword)
      return setPwError("New passwords do not match.");
    if (pw.newPassword.length < 6)
      return setPwError("New password must be at least 6 characters.");

    setPwLoading(true);
    try {
      const res = await authAPI.changePassword({
        currentPassword: pw.currentPassword,
        newPassword:     pw.newPassword,
        confirmPassword: pw.confirmPassword,
      });
      if (res.success) {
        setPwSuccess("Password updated successfully!");
        setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPwError(res.message || "Failed to update password.");
      }
    } catch (err) {
      setPwError(err.message || "Failed to update password.");
    } finally {
      setPwLoading(false);
    }
  };

  /* ── Shared input style ───────────────────────────────────────────────── */
  const inputStyle = { ...s.input, marginBottom: 0 };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>

        {/* ── Business Details ──────────────────────────────────────────── */}
        <div style={{ ...s.card, gridColumn: "1 / -1" }}>
          <SectionHeader title="Business Details" dark={dark} />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
            {[
              ["businessName", "Business Name"],
              ["ownerName",    "Owner Name"],
              ["phone",        "Phone"],
              ["email",        "Email"],
            ].map(([k, label]) => (
              <div key={k}>
                <label style={s.label}>{label}</label>
                <input
                  value={profile[k]}
                  onChange={e => setProfile({ ...profile, [k]: e.target.value })}
                  style={inputStyle}
                />
              </div>
            ))}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={s.label}>Address</label>
              <input
                value={profile.address}
                onChange={e => setProfile({ ...profile, address: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>
          <button style={{ ...s.btn(COLORS.primary), marginTop: 16 }}>💾 Save Changes</button>
        </div>

        {/* ── Appearance + User Info ────────────────────────────────────── */}
        <div style={s.card}>
          <SectionHeader title="Appearance" dark={dark} />

          {/* Dark mode toggle */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px",
            background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc",
            borderRadius: 12, marginBottom: 14,
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{dark ? "🌙 Dark Mode" : "☀️ Light Mode"}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Toggle theme preference</div>
            </div>
            <div
              onClick={toggleDark}
              style={{
                width: 48, height: 26, borderRadius: 13,
                background: dark ? COLORS.primary : "#e2e8f0",
                cursor: "pointer", position: "relative", transition: "all 0.2s",
              }}
            >
              <div style={{
                position: "absolute", top: 3, left: dark ? 24 : 3,
                width: 20, height: 20, borderRadius: "50%",
                background: "white", transition: "all 0.2s",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }} />
            </div>
          </div>

          {/* Logged-in user chip */}
          {currentUser && (
            <div style={{
              padding: "12px 14px",
              background: dark ? "rgba(255,255,255,0.04)" : "#f0fdf4",
              border: `1px solid ${dark ? "#334155" : "#bbf7d0"}`,
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Logged in as
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: dark ? "#f1f5f9" : "#0f172a" }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{currentUser.email}</div>
              <span style={{
                display: "inline-block", marginTop: 6, padding: "2px 10px",
                background: COLORS.primary + "22", color: COLORS.primary,
                borderRadius: 20, fontSize: 11, fontWeight: 700,
              }}>
                {currentUser.role}
              </span>
            </div>
          )}
        </div>

        {/* ── Change Password ───────────────────────────────────────────── */}
        <div style={s.card}>
          <SectionHeader title="Change Password" dark={dark} />

          {pwError && (
            <div style={{
              background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b",
              padding: "10px 14px", borderRadius: 10, marginBottom: 12, fontSize: 13, fontWeight: 600,
            }}>
              ❌ {pwError}
            </div>
          )}
          {pwSuccess && (
            <div style={{
              background: "#dcfce7", border: "1px solid #bbf7d0", color: "#166534",
              padding: "10px 14px", borderRadius: 10, marginBottom: 12, fontSize: 13, fontWeight: 600,
            }}>
              ✅ {pwSuccess}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["currentPassword", "Current Password",     "current-password"],
              ["newPassword",     "New Password",         "new-password"],
              ["confirmPassword", "Confirm New Password", "new-password"],
            ].map(([k, label, ac]) => (
              <div key={k}>
                <label style={s.label}>{label}</label>
                <input
                  type="password"
                  value={pw[k]}
                  onChange={setPwField(k)}
                  placeholder="••••••••"
                  style={inputStyle}
                  disabled={pwLoading}
                  autoComplete={ac}
                />
              </div>
            ))}

            <button
              onClick={handleChangePassword}
              disabled={pwLoading}
              style={{
                ...s.btn(COLORS.primary),
                opacity: pwLoading ? 0.7 : 1,
                cursor: pwLoading ? "not-allowed" : "pointer",
              }}
            >
              {pwLoading ? "Updating…" : "🔒 Update Password"}
            </button>
          </div>
        </div>

        {/* ── Export & Reports ──────────────────────────────────────────── */}
        <div style={{ ...s.card, gridColumn: "1 / -1" }}>
          <SectionHeader title="Export & Reports" dark={dark} />
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
            gap: 12,
          }}>
            {[
              ["📄 Export Distributors", "PDF",   COLORS.danger],
              ["📊 Export Collections",  "Excel", COLORS.accent],
              ["💰 Payment Report",      "PDF",   COLORS.primary],
              ["📈 P&L Report",          "PDF",   COLORS.warning],
              ["📦 Inventory Report",    "Excel", COLORS.purple],
              ["📅 Annual Report",       "PDF",   "#06b6d4"],
            ].map(([label, type, c]) => (
              <button
                key={label}
                style={{
                  ...s.card, border: `1.5px solid ${c}30`,
                  cursor: "pointer", textAlign: "left",
                  background: dark ? "#1e293b" : "white",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>{label.split(" ")[0]}</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: dark ? "#e2e8f0" : "#1e293b" }}>
                  {label.slice(2)}
                </div>
                <div style={{ fontSize: 11, color: c, fontWeight: 700, marginTop: 4 }}>{type} Format</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
