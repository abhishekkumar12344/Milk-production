import { useState } from "react";
import { getStyles } from "../../styles/getStyles.js";
import { COLORS } from "../../constants/index.js";
// Re-export NOTIFICATIONS from data for convenience
import { NOTIFICATIONS as NOTIF_DATA } from "../../data/mockData.js";

export default function Topbar({ dark, toggleDark, activePage, user, isMobile, sidebarOpen, toggleSidebar }) {
  const s = getStyles(dark, isMobile);
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = NOTIF_DATA.filter((n) => !n.read).length;

  const pageTitle = {
    dashboard: "Dashboard",
    analytics: "Analytics",
    distributors: "Distributors",
    milk: "Milk Collection",
    inventory: "Inventory",
    payments: "Payments",
    profit: "Profit & Loss",
    settings: "Settings",
    clients: "Clients",
    sales: "Sales",
    production: "Production",
  };

  return (
    <div style={s.topbar}>
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 16 }}>
        {isMobile && (
          <button
            onClick={toggleSidebar}
            style={s.hamburger}
            title="Toggle Menu"
          >
            <div style={{...s.hamburgerLine, transform: sidebarOpen ? 'rotate(45deg) translateY(11px)' : 'rotate(0)'}} />
            <div style={{...s.hamburgerLine, opacity: sidebarOpen ? 0 : 1}} />
            <div style={{...s.hamburgerLine, transform: sidebarOpen ? 'rotate(-45deg) translateY(-11px)' : 'rotate(0)'}} />
          </button>
        )}
        <div>
          <div style={s.pageTitle}>{pageTitle[activePage] || "Dashboard"}</div>
          <div style={{ fontSize: isMobile ? 10 : 12, color: "#94a3b8" }}>Tuesday, January 15, 2025</div>
        </div>
      </div>

      <div style={s.topbarRight}>
        <button onClick={toggleDark} style={s.iconBtn} title="Toggle Theme">
          {dark ? "☀️" : "🌙"}
        </button>

        <div style={{ position: "relative" }}>
          <button onClick={() => setNotifOpen((o) => !o)} style={s.iconBtn} title="Notifications">
            🔔
            {unreadCount > 0 && <div style={s.badge}>{unreadCount}</div>}
          </button>

          {notifOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 44,
                width: 320,
                background: dark ? "#1e293b" : "white",
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                zIndex: 200,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #f1f5f9",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Notifications
              </div>
              {NOTIF_DATA.map((n) => {
                const colors = { warning: "#f59e0b", danger: "#ef4444", info: COLORS.primary, success: "#10b981" };
                return (
                  <div
                    key={n.id}
                    style={{
                      padding: "12px 16px",
                      borderBottom: dark ? "1px solid rgba(255,255,255,0.04)" : "1px solid #f8fafc",
                      background: !n.read ? colors[n.type] + "08" : "transparent",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: n.read ? 400 : 600, color: dark ? "#e2e8f0" : "#334155" }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{n.time}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: COLORS.primary,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {user?.name?.[0] || "A"}
        </div>
      </div>
    </div>
  );
}
