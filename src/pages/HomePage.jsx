import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS } from "../constants/index.js";
import { MONTHLY_DATA } from "../data/mockData.js";
import { formatNum } from "../utils/formatters.js";

export default function HomePage({ onLogin }) {
  const [scrolled, setScrolled] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  const features = [
    { icon: "🥛", title: "Milk Collection", desc: "Real-time milk entry with fat-based auto-pricing for morning & evening shifts." },
    { icon: "👨‍🌾", title: "Distributor Mgmt", desc: "Manage all farmer/distributor profiles, payment history and milk records." },
    { icon: "💳", title: "Payment System", desc: "Track payments via UPI, Cash or Bank. Generate instant receipts and invoices." },
    { icon: "📊", title: "Analytics & Reports", desc: "Visual dashboards with profit/loss, trends, and monthly comparisons." },
    { icon: "🏪", title: "Inventory Control", desc: "Monitor cold storage, expiry alerts and real-time stock levels." },
    { icon: "📄", title: "PDF & Excel Reports", desc: "Generate professional reports for accountants and business records." },
  ];

  const testimonials = [
    { name: "Rajesh Gupta", role: "Dairy Owner, Madhya Pradesh", text: "DairyFlow doubled our efficiency. Payments are now tracked perfectly!", avatar: "R" },
    { name: "Anita Patel", role: "Collection Manager, Gujarat", text: "The fat-based pricing system is exactly what we needed. Brilliant tool!", avatar: "A" },
    { name: "Sunil Verma", role: "Farmer Cooperative, UP", text: "Our distributors trust us more now. Every payment is transparent.", avatar: "S" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f0f6ff", minHeight: "100vh" }}>
      {/* NAVBAR */}
      <nav style={{ position: "sticky", top: 0, background: scrolled ? "rgba(255,255,255,0.95)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", padding: isMobile ? "12px 16px" : isTablet ? "14px 32px" : "14px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 100, transition: "all 0.3s", boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.08)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, background: COLORS.primary, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 16 : 18 }}>🥛</div>
          <span style={{ fontWeight: 800, fontSize: isMobile ? 16 : 18, color: "#1a56db" }}>DairyFlow</span>
        </div>
        <div style={{ display: isMobile ? "none" : "flex", gap: isTablet ? 16 : 32, fontSize: 14, fontWeight: 500 }}>
          {["Features", "Analytics", "Pricing", "Contact"].map(t => <a key={t} href="#" style={{ color: "#334155", textDecoration: "none" }}>{t}</a>)}
        </div>
        {/* <button onClick={onLogin} style={{ padding: isMobile ? "10px 14px" : "10px 24px", background: COLORS.primary, color: "white", border: "none", borderRadius: 10, fontSize: isMobile ? 13 : 14, fontWeight: 700, cursor: "pointer", minHeight: isMobile ? "44px" : "auto", minWidth: isMobile ? "80px" : "auto", whiteSpace: "nowrap" }}>
          {isMobile ? "Launch" : "Launch App →"}
        </button> */}
      </nav>

      {/* HERO */}
      <section style={{ padding: isMobile ? "40px 16px 32px" : isTablet ? "60px 32px 48px" : "80px 48px 60px", textAlign: "center", background: "linear-gradient(135deg, #eef2ff 0%, #f0fdf4 100%)" }}>
        <div style={{ display: "inline-block", padding: "6px 16px", background: "#dbeafe", borderRadius: 20, color: "#1a56db", fontSize: isMobile ? 10 : 12, fontWeight: 700, marginBottom: isMobile ? 12 : 20, letterSpacing: "0.05em" }}>🆕 SMART DAIRY MANAGEMENT</div>
        <h1 style={{ fontSize: isMobile ? 32 : isTablet ? 42 : 56, fontWeight: 900, color: "#0f172a", lineHeight: 1.1, margin: "0 auto 20px", maxWidth: 720 }}>
          Manage Your Dairy Business <span style={{ color: COLORS.primary }}>Digitally</span>
        </h1>
        <p style={{ fontSize: isMobile ? 14 : isTablet ? 16 : 18, color: "#64748b", maxWidth: 580, margin: "0 auto 36px", lineHeight: 1.7 }}>
          DairyFlow helps village dairy owners digitize milk collection, manage distributors, track payments, and grow business — all from one dashboard.
        </p>
        <div style={{ display: "flex", gap: isMobile ? 10 : 14, justifyContent: "center", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>
          <button onClick={onLogin} style={{ padding: isMobile ? "12px 20px" : "14px 32px", background: COLORS.primary, color: "white", border: "none", borderRadius: 12, fontSize: isMobile ? 14 : 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(26,86,219,0.35)", minHeight: isMobile ? "44px" : "auto", width: isMobile ? "100%" : "auto" }}>
            Start Free Trial 🚀
          </button>
          <button style={{ padding: isMobile ? "12px 20px" : "14px 32px", background: "white", color: COLORS.primary, border: `2px solid ${COLORS.primary}`, borderRadius: 12, fontSize: isMobile ? 14 : 16, fontWeight: 700, cursor: "pointer", minHeight: isMobile ? "44px" : "auto", width: isMobile ? "100%" : "auto" }}>
            Watch Demo ▶
          </button>
        </div>
        <div style={{ display: "flex", gap: isMobile ? 20 : isTablet ? 24 : 40, justifyContent: "center", marginTop: isMobile ? 32 : isTablet ? 40 : 56, flexWrap: "wrap" }}>
          {[["500+", "Dairy Centers"], ["50K+", "Distributors Managed"], ["₹10Cr+", "Payments Processed"], ["99.9%", "Uptime"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: isMobile ? 20 : isTablet ? 24 : 28, fontWeight: 900, color: COLORS.primary }}>{v}</div>
              <div style={{ fontSize: isMobile ? 10 : isTablet ? 11 : 12, color: "#64748b", fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: isMobile ? "40px 16px" : isTablet ? "56px 32px" : "72px 48px", background: "white" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : isTablet ? 40 : 48 }}>
          <h2 style={{ fontSize: isMobile ? 26 : isTablet ? 30 : 36, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>Everything You Need</h2>
          <p style={{ color: "#64748b", fontSize: isMobile ? 14 : 16 }}>A complete system built for village dairy business operations</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(280px, 1fr))", gap: isMobile ? 16 : 24, maxWidth: 1100, margin: "0 auto" }}>
          {features.map((f) => (
            <div key={f.title} style={{ padding: isMobile ? 16 : 28, border: "1.5px solid #e2e8f0", borderRadius: 16, transition: "all 0.2s" }}>
              <div style={{ fontSize: isMobile ? 28 : 36, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>{f.title}</h3>
              <p style={{ fontSize: isMobile ? 13 : 14, color: "#64748b", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ANALYTICS PREVIEW */}
      <section style={{ padding: isMobile ? "40px 16px" : isTablet ? "56px 32px" : "72px 48px", background: "#f8fafc" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 24 : 40 }}>
          <h2 style={{ fontSize: isMobile ? 26 : isTablet ? 30 : 36, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>Powerful Analytics</h2>
          <p style={{ color: "#64748b", fontSize: isMobile ? 14 : 16 }}>Visual insights to grow your dairy business</p>
        </div>
        <div style={{ background: "white", borderRadius: 20, padding: isMobile ? 16 : 28, maxWidth: 900, margin: "0 auto", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <div style={{ marginBottom: 16, fontWeight: 700, color: "#1e293b", fontSize: isMobile ? 13 : 14 }}>Monthly Milk Collection & Revenue (Liters)</div>
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: isMobile ? 10 : 12 }} />
              <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
              <Tooltip formatter={(v, n) => [formatNum(v), n === "collected" ? "Liters" : "₹"]} />
              <Area type="monotone" dataKey="collected" stroke={COLORS.primary} fill="url(#cGrad)" strokeWidth={2.5} name="collected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: isMobile ? "40px 16px" : isTablet ? "56px 32px" : "72px 48px", background: "white" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : isTablet ? 40 : 48 }}>
          <h2 style={{ fontSize: isMobile ? 26 : isTablet ? 30 : 36, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>Trusted by Dairy Owners</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(280px, 1fr))", gap: isMobile ? 16 : 24, maxWidth: 960, margin: "0 auto" }}>
          {testimonials.map((t) => (
            <div key={t.name} style={{ padding: isMobile ? 16 : 28, border: "1.5px solid #e2e8f0", borderRadius: 16 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⭐⭐⭐⭐⭐</div>
              <p style={{ fontSize: isMobile ? 13 : 15, color: "#334155", lineHeight: 1.7, margin: "0 0 16px" }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: COLORS.primary, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: isMobile ? 12 : 14, color: "#1e293b" }}>{t.name}</div>
                  <div style={{ fontSize: isMobile ? 11 : 12, color: "#64748b" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: isMobile ? "40px 16px" : isTablet ? "56px 32px" : "72px 48px", background: "linear-gradient(135deg, #1a56db, #10b981)", textAlign: "center" }}>
        <h2 style={{ fontSize: isMobile ? 24 : isTablet ? 32 : 40, fontWeight: 900, color: "white", margin: "0 0 16px" }}>Ready to Digitize Your Dairy?</h2>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: isMobile ? 14 : isTablet ? 15 : 17, marginBottom: 32 }}>Join hundreds of dairy owners already saving time with DairyFlow</p>
        <button onClick={onLogin} style={{ padding: isMobile ? "12px 28px" : "14px 40px", background: "white", color: COLORS.primary, border: "none", borderRadius: 12, fontSize: isMobile ? 14 : 16, fontWeight: 800, cursor: "pointer", minHeight: isMobile ? "44px" : "auto" }}>
          Get Started Free →
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0f172a", padding: isMobile ? "24px 16px" : "36px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ color: "white", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>🥛 DairyFlow</div>
          <div style={{ color: "#64748b", fontSize: 13 }}>Smart Dairy Management System</div>
        </div>
        <div style={{ color: "#64748b", fontSize: 13 }}>© 2025 DairyFlow. Built with ❤️ for dairy farmers.</div>
      </footer>
    </div>
  );
}
