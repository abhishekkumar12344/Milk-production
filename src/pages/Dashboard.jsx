import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { COLORS } from "../constants/index.js";
import { MILK_COLLECTIONS, PAYMENTS, MOCK_DISTRIBUTORS, MONTHLY_DATA, DAILY_DATA, NOTIFICATIONS, EXPENSE_PIE } from "../data/mockData.js";
import { formatCurrency, formatNum } from "../utils/formatters.js";
import { getStyles } from "../styles/getStyles.js";
import StatCard from "../components/ui/StatCard.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { PieChart, Pie, Cell } from "recharts";

export default function Dashboard({ dark }) {
  const s = getStyles(dark);
  const todayTotal = MILK_COLLECTIONS.filter(m => m.date === "2025-01-15").reduce((a, b) => a + b.quantity, 0);
  const todayRevenue = MILK_COLLECTIONS.filter(m => m.date === "2025-01-15").reduce((a, b) => a + b.total, 0);
  const pendingAmt = PAYMENTS.filter(p => p.status === "Pending").reduce((a, b) => a + b.amount, 0);

  const stats = [
    { icon: "🥛", label: "Today's Collection", value: `${todayTotal} L`, delta: "↑ 8% from yesterday", positive: true, color: COLORS.primary },
    { icon: "💰", label: "Today's Revenue", value: formatCurrency(todayRevenue), delta: "↑ 12% from yesterday", positive: true, color: COLORS.accent },
    { icon: "👨‍🌾", label: "Active Distributors", value: MOCK_DISTRIBUTORS.filter(d => d.status === "Active").length, delta: "+2 this month", positive: true, color: COLORS.purple },
    { icon: "⏳", label: "Pending Payments", value: formatCurrency(pendingAmt), delta: "2 distributors", positive: false, color: COLORS.warning },
    { icon: "📈", label: "Monthly Revenue", value: formatCurrency(372000), delta: "↑ 7% from Dec", positive: true, color: "#06b6d4" },
    { icon: "📉", label: "Net Profit", value: formatCurrency(81000), delta: "↑ 12.5% margin", positive: true, color: COLORS.accent },
    { icon: "🏪", label: "Inventory", value: "2070 L", delta: "85% capacity", positive: false, color: "#f43f5e" },
    { icon: "🚛", label: "Monthly Expenses", value: formatCurrency(63100), delta: "Within budget", positive: true, color: "#8b5cf6" },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map(stat => <StatCard key={stat.label} {...stat} dark={dark} />)}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={s.card}>
          <SectionHeader title="Monthly Collection & Revenue Trend" dark={dark} />
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={MONTHLY_DATA}>
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
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: dark ? "#94a3b8" : "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: dark ? "#94a3b8" : "#64748b" }} />
              <Tooltip contentStyle={{ background: dark ? "#1e293b" : "white", border: "none", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} />
              <Legend />
              <Area type="monotone" dataKey="collected" name="Liters" stroke={COLORS.primary} fill="url(#g1)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="profit" name="Profit(₹/100)" stroke={COLORS.accent} fill="url(#g2)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={s.card}>
          <SectionHeader title="Expense Breakdown" dark={dark} />
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={EXPENSE_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {EXPENSE_PIE.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: dark ? "#1e293b" : "white", border: "none", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {EXPENSE_PIE.map(e => (
              <div key={e.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={s.card}>
          <SectionHeader title="This Week's Collection (L)" dark={dark} />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DAILY_DATA} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1e3a5f" : "#f1f5f9"} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: dark ? "#94a3b8" : "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: dark ? "#94a3b8" : "#64748b" }} />
              <Tooltip contentStyle={{ background: dark ? "#1e293b" : "white", border: "none", borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="morning" name="Morning" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="evening" name="Evening" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={s.card}>
          <SectionHeader title="Notifications" dark={dark} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {NOTIFICATIONS.slice(0, 4).map(n => {
              const colors = { warning: "#f59e0b", danger: "#ef4444", info: COLORS.primary, success: "#10b981" };
              return (
                <div key={n.id} style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 10, background: n.read ? "transparent" : (colors[n.type] + "10"), border: `1px solid ${colors[n.type]}20` }}>
                  <span style={{ fontSize: 14 }}>{n.type === "warning" ? "⚠️" : n.type === "danger" ? "🚨" : n.type === "success" ? "✅" : "ℹ️"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: dark ? "#e2e8f0" : "#334155", fontWeight: n.read ? 400 : 600 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{n.time}</div>
                  </div>
                  {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors[n.type], marginTop: 4 }} />}
                </div>
              );
            })}
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
              {MILK_COLLECTIONS.slice(0, 5).map(m => (
                <tr key={m.id}>
                  <td style={{ ...s.td, fontWeight: 600 }}>{m.distributorName}</td>
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
    </div>
  );
}
