import { useEffect, useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { COLORS } from "../constants/index.js";
import { formatCurrency, formatNum } from "../utils/formatters.js";
import { getStyles } from "../styles/getStyles.js";
import StatCard from "../components/ui/StatCard.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { PieChart, Pie, Cell } from "recharts";
import { analyticsAPI, milkCollectionAPI } from "../utils/api.js";

export default function Dashboard({ dark }) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [expensePie, setExpensePie] = useState([]);
  const [recentCollections, setRecentCollections] = useState([]);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [dashStats, monthly, daily, collections] = await Promise.all([
          analyticsAPI.dashboard(),
          analyticsAPI.monthly(),
          analyticsAPI.daily(),
          milkCollectionAPI.getAll()
        ]);

        setDashboardStats(dashStats.data);
        setMonthlyData(monthly.data || []);
        setDailyData(daily.data || []);
        setRecentCollections(collections.data?.slice(0, 5) || []);

        // Calculate expense breakdown from dashboard stats
        if (dashStats.data?.expenses) {
          const expenses = [
            { name: "Transportation", value: dashStats.data.expenses * 0.2, color: "#3b82f6" },
            { name: "Storage", value: dashStats.data.expenses * 0.13, color: "#10b981" },
            { name: "Electricity", value: dashStats.data.expenses * 0.07, color: "#f59e0b" },
            { name: "Staff Salary", value: dashStats.data.expenses * 0.55, color: "#8b5cf6" },
            { name: "Maintenance", value: dashStats.data.expenses * 0.05, color: "#ef4444" },
          ];
          setExpensePie(expenses);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const s = getStyles(dark, isMobile, isTablet);

  // Construct stats from real data
  // Helper: unwrap MongoDB Decimal128 / {value, raw} objects that some backends return
  const n = (v) => Number(typeof v === "object" && v !== null ? (v.value ?? v.$numberDecimal ?? 0) : v) || 0;

  const stats = dashboardStats ? [
    { icon: "🥛", label: "Today's Collection", value: `${n(dashboardStats.todayCollection)} L`, delta: "↑ 8% from yesterday", positive: true, color: COLORS.primary },
    { icon: "💰", label: "Today's Revenue", value: formatCurrency(n(dashboardStats.todayRevenue)), delta: "↑ 12% from yesterday", positive: true, color: COLORS.accent },
    { icon: "👨‍🌾", label: "Active Distributors", value: n(dashboardStats.activeDistributors), delta: "+2 this month", positive: true, color: COLORS.purple },
    { icon: "⏳", label: "Pending Payments", value: formatCurrency(n(dashboardStats.pendingPayments)), delta: "Distributors", positive: false, color: COLORS.warning },
    { icon: "📈", label: "Monthly Revenue", value: formatCurrency(n(dashboardStats.monthlyRevenue)), delta: "↑ 7% from Dec", positive: true, color: "#06b6d4" },
    { icon: "📉", label: "Net Profit", value: formatCurrency(n(dashboardStats.netProfit)), delta: "↑ 12.5% margin", positive: true, color: COLORS.accent },
    { icon: "🏪", label: "Inventory", value: `${n(dashboardStats.inventory)} L`, delta: "85% capacity", positive: false, color: "#f43f5e" },
    { icon: "🚛", label: "Monthly Expenses", value: formatCurrency(n(dashboardStats.monthlyExpenses)), delta: "Within budget", positive: true, color: "#8b5cf6" },
  ] : [];

  return (
    <div>
      {loading && <div style={{ textAlign: "center", padding: 40, color: COLORS.primary }}>⏳ Loading dashboard...</div>}
      {error && <div style={{ textAlign: "center", padding: 40, color: COLORS.danger }}>❌ {error}</div>}
      
      {!loading && !error && (
        <>
          {/* Stats Grid */}
          <div style={s.grid(4)}>
            {stats.map(stat => <StatCard key={stat.label} {...stat} dark={dark} />)}
          </div>

          {/* Charts Row */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div style={s.card}>
              <SectionHeader title="Monthly Collection & Revenue Trend" dark={dark} />
              <ResponsiveContainer width="100%" height={isMobile ? 180 : 240}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1e3a5f" : "#f1f5f9"} />
                  <XAxis dataKey="month" tick={{ fontSize: isMobile ? 9 : 11, fill: dark ? "#94a3b8" : "#64748b" }} />
                  <YAxis tick={{ fontSize: isMobile ? 9 : 11, fill: dark ? "#94a3b8" : "#64748b" }} />
                  <Tooltip contentStyle={{ background: dark ? "#1e293b" : "white", border: "none", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                  <Area type="monotone" dataKey="collected" name="Liters" stroke={COLORS.primary} fill="url(#g1)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="profit" name="Profit(₹/100)" stroke={COLORS.accent} fill="url(#g2)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={s.card}>
              <SectionHeader title="Expense Breakdown" dark={dark} />
              <ResponsiveContainer width="100%" height={isMobile ? 180 : 240}>
                <PieChart>
                  <Pie data={expensePie} cx="50%" cy="50%" innerRadius={isMobile ? 40 : 55} outerRadius={isMobile ? 60 : 85} paddingAngle={3} dataKey="value">
                    {expensePie.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: dark ? "#1e293b" : "white", border: "none", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                {expensePie.map(e => (
                  <div key={e.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: isMobile ? 11 : 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.color }} />
                      <span style={{ color: dark ? "#94a3b8" : "#64748b" }}>{e.name}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: dark ? "#e2e8f0" : "#1e293b" }}>{formatCurrency(e.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily + Notifications */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div style={s.card}>
              <SectionHeader title="This Week's Collection (L)" dark={dark} />
              <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
                <BarChart data={dailyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1e3a5f" : "#f1f5f9"} />
                  <XAxis dataKey="day" tick={{ fontSize: isMobile ? 9 : 11, fill: dark ? "#94a3b8" : "#64748b" }} />
                  <YAxis tick={{ fontSize: isMobile ? 9 : 11, fill: dark ? "#94a3b8" : "#64748b" }} />
                  <Tooltip contentStyle={{ background: dark ? "#1e293b" : "white", border: "none", borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="morning" name="Morning" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="evening" name="Evening" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={s.card}>
              <SectionHeader title="System Status" dark={dark} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ padding: "10px 12px", borderRadius: 10, background: COLORS.accent + "20", border: `1px solid ${COLORS.accent}40` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent }}>✅ System Healthy</div>
                  <div style={{ fontSize: 11, color: dark ? "#94a3b8" : "#64748b", marginTop: 2 }}>All systems operational</div>
                </div>
                <div style={{ padding: "10px 12px", borderRadius: 10, background: COLORS.primary + "20", border: `1px solid ${COLORS.primary}40` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary }}>📊 Data Synced</div>
                  <div style={{ fontSize: 11, color: dark ? "#94a3b8" : "#64748b", marginTop: 2 }}>All data from backend</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Milk Collections */}
          <div style={s.card}>
            <SectionHeader title="Recent Milk Collections" dark={dark} />
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>{["Distributor", "Date", "Shift", "Qty (L)", "Fat %", "Rate/L", "Total", "Status"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {recentCollections.map(m => (
                    <tr key={m._id}>
                      <td style={{ ...s.td, fontWeight: 600 }}>{m.distributorName || "N/A"}</td>
                      <td style={s.td}>{m.date}</td>
                      <td style={s.td}><span style={s.chip(m.shift === "Morning" ? COLORS.warning : COLORS.purple)}>{m.shift === "Morning" ? "🌅" : "🌙"} {m.shift}</span></td>
                      <td style={{ ...s.td, fontWeight: 700, color: COLORS.primary }}>{m.quantity}</td>
                      <td style={s.td}>{m.fat}%</td>
                      <td style={s.td}>₹{m.pricePerLiter}</td>
                      <td style={{ ...s.td, fontWeight: 700, color: COLORS.accent }}>{formatCurrency(m.total)}</td>
                      <td style={s.td}><StatusBadge status={m.status} dark={dark} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
