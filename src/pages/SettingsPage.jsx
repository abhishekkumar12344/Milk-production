import { useState } from "react";
import { COLORS } from "../constants/index.js";
import { getStyles } from "../styles/getStyles.js";
import SectionHeader from "../components/ui/SectionHeader.jsx";

export default function SettingsPage({ dark, toggleDark }) {
  const s = getStyles(dark);
  const [profile, setProfile] = useState({
    businessName: "Shri Ram Dairy",
    ownerName: "Mohan Lal",
    phone: "9876543210",
    email: "admin@shriram.dairy",
    address: "Village Road, Sundarpur, UP - 226001",
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Business Details */}
        <div style={{ ...s.card, gridColumn: "1 / -1" }}>
          <SectionHeader title="Business Details" dark={dark} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[["businessName", "Business Name"], ["ownerName", "Owner Name"], ["phone", "Phone"], ["email", "Email"]].map(([k, l]) => (
              <div key={k}>
                <label style={s.label}>{l}</label>
                <input value={profile[k]} onChange={e => setProfile({ ...profile, [k]: e.target.value })} style={s.input} />
              </div>
            ))}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={s.label}>Address</label>
              <input value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} style={s.input} />
            </div>
          </div>
          <button style={{ ...s.btn(COLORS.primary), marginTop: 16 }}>💾 Save Changes</button>
        </div>

        {/* Appearance */}
        <div style={s.card}>
          <SectionHeader title="Appearance" dark={dark} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc", borderRadius: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{dark ? "🌙 Dark Mode" : "☀️ Light Mode"}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Toggle theme preference</div>
            </div>
            <div onClick={toggleDark} style={{ width: 48, height: 26, borderRadius: 13, background: dark ? COLORS.primary : "#e2e8f0", cursor: "pointer", position: "relative", transition: "all 0.2s" }}>
              <div style={{ position: "absolute", top: 3, left: dark ? 24 : 3, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div style={s.card}>
          <SectionHeader title="Change Password" dark={dark} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {["Current Password", "New Password", "Confirm Password"].map(l => (
              <div key={l}>
                <label style={s.label}>{l}</label>
                <input type="password" placeholder="••••••••" style={s.input} />
              </div>
            ))}
            <button style={s.btn(COLORS.primary)}>🔒 Update Password</button>
          </div>
        </div>

        {/* Export & Reports */}
        <div style={{ ...s.card, gridColumn: "1 / -1" }}>
          <SectionHeader title="Export & Reports" dark={dark} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              ["📄 Export Distributors", "PDF", COLORS.danger],
              ["📊 Export Collections", "Excel", COLORS.accent],
              ["💰 Payment Report", "PDF", COLORS.primary],
              ["📈 P&L Report", "PDF", COLORS.warning],
              ["📦 Inventory Report", "Excel", COLORS.purple],
              ["📅 Annual Report", "PDF", "#06b6d4"],
            ].map(([l, type, c]) => (
              <button key={l} style={{ ...s.card, border: `1.5px solid ${c}30`, cursor: "pointer", textAlign: "left", background: dark ? "#1e293b" : "white" }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{l.split(" ")[0]}</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: dark ? "#e2e8f0" : "#1e293b" }}>{l.slice(2)}</div>
                <div style={{ fontSize: 11, color: c, fontWeight: 700, marginTop: 4 }}>{type} Format</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
