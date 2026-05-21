import { useState, useEffect } from "react";
import { COLORS } from "../constants/index.js";
import { PAYMENTS, MOCK_DISTRIBUTORS } from "../data/mockData.js";
import { formatCurrency } from "../utils/formatters.js";
import { getStyles } from "../styles/getStyles.js";
import StatCard from "../components/ui/StatCard.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import SearchBar from "../components/ui/SearchBar.jsx";

export default function PaymentsPage({ dark }) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const s = getStyles(dark, isMobile, isTablet);
  const [payments, setPayments] = useState(PAYMENTS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const totalPaid = payments.filter(p => p.status === "Paid").reduce((a, b) => a + b.amount, 0);
  const totalPending = payments.filter(p => p.status === "Pending").reduce((a, b) => a + b.amount, 0);
  const filtered = payments.filter(p =>
    (filter === "All" || p.status === filter) &&
    p.distributorName.toLowerCase().includes(search.toLowerCase())
  );

  const markPaid = (id) => setPayments(prev => prev.map(p => p.id === id ? { ...p, status: "Paid", reference: `UPI${Date.now()}` } : p));

  return (
    <div>
      <div style={s.grid(4)}>
        <StatCard icon="✅" label="Total Paid" value={formatCurrency(totalPaid)} color={COLORS.accent} dark={dark} />
        <StatCard icon="⏳" label="Total Pending" value={formatCurrency(totalPending)} color={COLORS.warning} dark={dark} />
        <StatCard icon="📊" label="Total Transactions" value={payments.length} color={COLORS.primary} dark={dark} />
        <StatCard icon="👥" label="Pending Distributors" value={payments.filter(p => p.status === "Pending").length} color={COLORS.danger} dark={dark} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        <div style={s.card}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search distributor..." dark={dark} />
            <div style={{ display: "flex", gap: 6 }}>
              {["All", "Paid", "Pending"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${filter === f ? COLORS.primary : "#e2e8f0"}`, background: filter === f ? COLORS.primary : "transparent", color: filter === f ? "white" : (dark ? "#94a3b8" : "#64748b"), cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead><tr>{["Distributor", "Amount", "Date", "Method", "Reference", "Status", "Action"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ ...s.td, fontWeight: 600 }}>{p.distributorName}</td>
                    <td style={{ ...s.td, fontWeight: 700, color: p.status === "Paid" ? COLORS.accent : COLORS.warning }}>{formatCurrency(p.amount)}</td>
                    <td style={s.td}>{p.date}</td>
                    <td style={s.td}><span style={s.chip(COLORS.primary)}>{p.method === "UPI" ? "📱" : p.method === "Cash" ? "💵" : "🏦"} {p.method}</span></td>
                    <td style={{ ...s.td, fontFamily: "monospace", fontSize: 11, color: "#94a3b8" }}>{p.reference}</td>
                    <td style={s.td}><StatusBadge status={p.status} dark={dark} /></td>
                    <td style={s.td}>
                      {p.status === "Pending" ? (
                        <button onClick={() => markPaid(p.id)} style={{ ...s.btn(COLORS.accent), padding: "4px 10px", fontSize: 11 }}>Mark Paid</button>
                      ) : (
                        <button style={{ ...s.btn(COLORS.primary, true), padding: "4px 10px", fontSize: 11 }}>Receipt</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={s.card}>
          <SectionHeader title="Distributor-wise Payments" dark={dark} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MOCK_DISTRIBUTORS.filter(d => d.status === "Active").map(d => {
              const paid = payments.filter(p => p.distributorId === d.id && p.status === "Paid").reduce((a, b) => a + b.amount, 0);
              const pending = payments.filter(p => p.distributorId === d.id && p.status === "Pending").reduce((a, b) => a + b.amount, 0);
              return (
                <div key={d.id} style={{ padding: "12px 14px", background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc", borderRadius: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{d.village}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8" }}>
                    <span>✅ Paid: <strong style={{ color: COLORS.accent }}>{formatCurrency(paid)}</strong></span>
                    {pending > 0 && <span>⏳ Due: <strong style={{ color: COLORS.warning }}>{formatCurrency(pending)}</strong></span>}
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
