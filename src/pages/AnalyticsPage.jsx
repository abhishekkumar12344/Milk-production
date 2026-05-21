import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { COLORS } from "../constants/index.js";
import { MOCK_DISTRIBUTORS, MONTHLY_DATA, DAILY_DATA } from "../data/mockData.js";
import { formatCurrency, formatNum } from "../utils/formatters.js";
import { getStyles } from "../styles/getStyles.js";
import SectionHeader from "../components/ui/SectionHeader.jsx";

export default function AnalyticsPage({ dark }) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const s = getStyles(dark, isMobile, isTablet);
  const distPerformance = MOCK_DISTRIBUTORS.filter(d => d.status === "Active").map(d => ({
    name: d.name.split(" ")[0], liters: d.totalLiters, amount: d.totalAmount,
  }));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={s.card}>
          <SectionHeader title="Distributor Performance (Liters)" dark={dark} />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={distPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1e3a5f" : "#f1f5f9"} />
              <XAxis type="number" tick={{ fontSize: 10, fill: dark ? "#94a3b8" : "#64748b" }} />
              <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 11, fill: dark ? "#94a3b8" : "#64748b" }} />
              <Tooltip formatter={(v) => `${formatNum(v)} L`} contentStyle={{ background: dark ? "#1e293b" : "white", border: "none", borderRadius: 8 }} />
              <Bar dataKey="liters" fill={COLORS.primary} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={s.card}>
          <SectionHeader title="Revenue Growth Trend" dark={dark} />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={MONTHLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1e3a5f" : "#f1f5f9"} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: dark ? "#94a3b8" : "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: dark ? "#94a3b8" : "#64748b" }} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: dark ? "#1e293b" : "white", border: "none", borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke={COLORS.accent} strokeWidth={2.5} dot={{ fill: COLORS.accent, r: 4 }} name="Revenue" />
              <Line type="monotone" dataKey="profit" stroke={COLORS.primary} strokeWidth={2.5} dot={{ fill: COLORS.primary, r: 4 }} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <div style={s.card}>
          <SectionHeader title="Daily Collection Pattern (This Week)" dark={dark} />
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={DAILY_DATA}>
              <defs>
                <linearGradient id="am" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1e3a5f" : "#f1f5f9"} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: dark ? "#1e293b" : "white", border: "none", borderRadius: 8 }} />
              <Legend />
              <Area type="monotone" dataKey="morning" name="Morning" stroke={COLORS.warning} fill="url(#am)" strokeWidth={2} />
              <Area type="monotone" dataKey="evening" name="Evening" stroke={COLORS.purple} fill="url(#ev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={s.card}>
          <SectionHeader title="🏆 Best Distributors" dark={dark} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MOCK_DISTRIBUTORS.filter(d => d.status === "Active").sort((a, b) => b.totalLiters - a.totalLiters).slice(0, 5).map((d, i) => {
              const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
              return (
                <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: i < 3 ? (COLORS.primary + "10") : "transparent", borderRadius: 10, border: i < 3 ? `1px solid ${COLORS.primary}20` : "none" }}>
                  <span style={{ fontSize: 20 }}>{medals[i]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{d.village}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: COLORS.primary, fontSize: 14 }}>{formatNum(d.totalLiters)} L</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{formatCurrency(d.totalAmount)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
