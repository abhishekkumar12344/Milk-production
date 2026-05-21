import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { COLORS } from "../constants/index.js";
import { MONTHLY_DATA, EXPENSES } from "../data/mockData.js";
import { formatCurrency } from "../utils/formatters.js";
import { getStyles } from "../styles/getStyles.js";
import StatCard from "../components/ui/StatCard.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";

export default function ProfitLossPage({ dark }) {
  const s = getStyles(dark);
  const revenue = 372000, purchase = 248000, expenses = 63100;
  const profit = revenue - purchase - expenses;
  const margin = ((profit / revenue) * 100).toFixed(1);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon="💰" label="Total Revenue" value={formatCurrency(revenue)} delta="↑ 7% MoM" positive={true} color={COLORS.accent} dark={dark} />
        <StatCard icon="🛒" label="Milk Purchase Cost" value={formatCurrency(purchase)} color={COLORS.danger} dark={dark} />
        <StatCard icon="📦" label="Total Expenses" value={formatCurrency(expenses)} color={COLORS.warning} dark={dark} />
        <StatCard icon="📈" label="Net Profit" value={formatCurrency(profit)} delta={`${margin}% margin`} positive={true} color={COLORS.primary} dark={dark} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={s.card}>
          <SectionHeader title="Monthly P&L Comparison" dark={dark} />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={MONTHLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1e3a5f" : "#f1f5f9"} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: dark ? "#94a3b8" : "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: dark ? "#94a3b8" : "#64748b" }} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: dark ? "#1e293b" : "white", border: "none", borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expenses" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Profit" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={s.card}>
          <SectionHeader title="Expense Categories" dark={dark} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {EXPENSES.map(e => (
              <div key={e.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{e.category}</span>
                  <span style={{ fontWeight: 700, color: COLORS.danger }}>{formatCurrency(e.amount)}</span>
                </div>
                <div style={{ height: 6, background: dark ? "rgba(255,255,255,0.06)" : "#e2e8f0", borderRadius: 4 }}>
                  <div style={s.progressBar((e.amount / 35000) * 100, COLORS.primary)} />
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{e.note}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: "14px 16px", background: COLORS.primary + "10", borderRadius: 12, border: `1.5px solid ${COLORS.primary}20` }}>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>TOTAL EXPENSES</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.primary }}>{formatCurrency(expenses)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          ["Daily Report", "Jan 15, 2025", `Revenue: ${formatCurrency(12989)}`, `Profit: ${formatCurrency(2200)}`],
          ["Weekly Report", "Jan 08-15, 2025", `Revenue: ${formatCurrency(84500)}`, `Profit: ${formatCurrency(15600)}`],
          ["Monthly Report", "January 2025", `Revenue: ${formatCurrency(372000)}`, `Profit: ${formatCurrency(profit)}`],
        ].map(([title, period, r, p]) => (
          <div key={title} style={s.card}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>{period}</div>
            <div style={{ fontSize: 14, color: COLORS.accent, fontWeight: 600 }}>{r}</div>
            <div style={{ fontSize: 14, color: COLORS.primary, fontWeight: 600 }}>{p}</div>
            <button style={{ ...s.btn(COLORS.primary, true), marginTop: 12, fontSize: 12, padding: "6px 12px" }}>📄 Download PDF</button>
          </div>
        ))}
      </div>
    </div>
  );
}
