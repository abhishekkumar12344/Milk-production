import { useState, useEffect } from "react";
import { getStyles } from "./styles/getStyles.js";
import Sidebar from "./components/layout/Sidebar.jsx";
import Topbar from "./components/layout/Topbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DistributorsPage from "./pages/DistributorsPage.jsx";
import MilkCollectionPage from "./pages/MilkCollectionPage.jsx";
import PaymentsPage from "./pages/PaymentsPage.jsx";
import ProfitLossPage from "./pages/ProfitLossPage.jsx";
import InventoryPage from "./pages/InventoryPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import ClientsPage from "./pages/ClientsPage.jsx";
import SalesPage from "./pages/SalesPage.jsx";
import ProductionPage from "./pages/ProductionPage.jsx";

export default function App() {
  const [dark, setDark] = useState(false);
  const [page, setPage] = useState("home");
  const [activePage, setActivePage] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;

  const handleLogin = (form) => {
    setUser({ name: "Admin User", email: form.email, role: form.role });
    setPage("app");
    setSidebarOpen(false);
  };
  const handleLogout = () => { setUser(null); setPage("home"); setSidebarOpen(false); };

  // Close sidebar when page changes on mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [activePage, isMobile]);

  const s = getStyles(dark, isMobile, isTablet);

  if (page === "home") return <HomePage onLogin={() => setPage("login")} />;
  if (page === "login") return <LoginPage onLogin={handleLogin} dark={dark} />;

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":    return <Dashboard dark={dark} />;
      case "distributors": return <DistributorsPage dark={dark} />;
      case "milk":         return <MilkCollectionPage dark={dark} />;
      case "clients":      return <ClientsPage dark={dark} />;
      case "sales":        return <SalesPage dark={dark} />;
      case "production":   return <ProductionPage dark={dark} />;
      case "payments":     return <PaymentsPage dark={dark} />;
      case "profit":       return <ProfitLossPage dark={dark} />;
      case "inventory":    return <InventoryPage dark={dark} />;
      case "analytics":    return <AnalyticsPage dark={dark} />;
      case "settings":     return <SettingsPage dark={dark} toggleDark={() => setDark(d => !d)} />;
      default:             return <Dashboard dark={dark} />;
    }
  };

  return (
    <div style={s.app}>
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 98,
            top: 64,
          }}
        />
      )}

      {/* Sidebar - hide on mobile by default */}
      {!isMobile && (
        <Sidebar
          dark={dark}
          activePage={activePage}
          setActivePage={setActivePage}
          user={user}
          onLogout={handleLogout}
          isMobile={isMobile}
        />
      )}

      {/* Mobile Sidebar - show only when open */}
      {isMobile && sidebarOpen && (
        <Sidebar
          dark={dark}
          activePage={activePage}
          setActivePage={setActivePage}
          user={user}
          onLogout={handleLogout}
          isMobile={isMobile}
        />
      )}

      <div style={s.mainContent}>
        <Topbar
          dark={dark}
          toggleDark={() => setDark(d => !d)}
          activePage={activePage}
          user={user}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <div style={s.pageContent}>
          {renderPage()}
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        tr:hover td { background: ${dark ? "rgba(255,255,255,0.02)" : "rgba(26,86,219,0.02)"}; }
        @media (max-width: 767px) {
          * { font-size: 14px; }
        }
      `}</style>
    </div>
  );
}
