import { getStyles } from "../../styles/getStyles.js";
import { NAV_SECTIONS } from "../../constants/index.js";

export default function Sidebar({ dark, activePage, setActivePage, user, onLogout, isMobile }) {
  const s = getStyles(dark, isMobile);
  return (
    <div style={s.sidebar}>
      {isMobile && (
        <div style={s.sidebarBrand}>
          <div style={{ ...s.sidebarLogo, justifyContent: "center" }}>
            <div style={s.logoIcon}>🥛</div>
          </div>
        </div>
      )}
      
      {!isMobile && (
        <div style={s.sidebarBrand}>
          <div style={s.sidebarLogo}>
            <div style={s.logoIcon}>🥛</div>
            <div>
              <div style={s.logoText}>DairyFlow</div>
              <div style={s.logoSub}>SMART DAIRY MGMT</div>
            </div>
          </div>
        </div>
      )}

      <div style={s.navSection}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div style={s.navLabel}>{section.label}</div>
            {section.items.map((item) => (
              <div
                key={item.id}
                style={s.navItem(activePage === item.id)}
                onClick={() => setActivePage(item.id)}
              >
                <span style={s.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={s.sidebarFooter}>
        <div style={s.userCard}>
          <div style={s.avatar}>{user?.name?.[0] || "A"}</div>
          <div style={s.userInfo}>
            <div style={s.userName}>{user?.name || "Admin"}</div>
            <div style={s.userRole}>{user?.role || "Administrator"}</div>
          </div>
          <button
            onClick={onLogout}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "rgba(255,255,255,0.6)" }}
            title="Logout"
          >
            🚪
          </button>
        </div>
      </div>
    </div>
  );
}
