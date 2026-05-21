import { useState } from "react";
import { COLORS } from "../constants/index.js";
import { MILK_COLLECTIONS, MOCK_DISTRIBUTORS } from "../data/mockData.js";
import { formatCurrency } from "../utils/formatters.js";
import { getStyles } from "../styles/getStyles.js";
import StatCard from "../components/ui/StatCard.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import SearchBar from "../components/ui/SearchBar.jsx";

export default function MilkCollectionPage({ dark }) {
  const s = getStyles(dark);
  const [collections, setCollections] = useState(MILK_COLLECTIONS);
  const [form, setForm] = useState({ distributorName: "", date: "2025-01-15", shift: "Morning", quantity: "", fat: "", pricePerLiter: "" });
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("2025-01-15");

  const total = Number(form.quantity) * Number(form.pricePerLiter || 0);

  const fatPrice = (fat) => {
    if (fat < 3.5) return 45;
    if (fat < 4) return 50;
    if (fat < 5) return 55;
    if (fat < 6) return 60;
    return 65;
  };

  const handleFatChange = (val) => {
    const price = fatPrice(Number(val));
    setForm({ ...form, fat: val, pricePerLiter: price });
  };

  const handleAdd = () => {
    setCollections(prev => [{
      id: Date.now(), ...form, quantity: Number(form.quantity), fat: Number(form.fat),
      pricePerLiter: Number(form.pricePerLiter), total: Number(form.quantity) * Number(form.pricePerLiter), status: "Pending"
    }, ...prev]);
    setForm({ distributorName: "", date: "2025-01-15", shift: "Morning", quantity: "", fat: "", pricePerLiter: "" });
  };

  const filtered = collections.filter(m =>
    (!filterDate || m.date === filterDate) &&
    m.distributorName.toLowerCase().includes(search.toLowerCase())
  );
  const dayTotal = filtered.reduce((a, b) => a + b.quantity, 0);
  const dayAmt = filtered.reduce((a, b) => a + b.total, 0);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon="🥛" label="Day Collection" value={`${dayTotal.toFixed(1)} L`} color={COLORS.primary} dark={dark} />
        <StatCard icon="💰" label="Day Amount" value={formatCurrency(dayAmt)} color={COLORS.accent} dark={dark} />
        <StatCard icon="🌅" label="Morning Entries" value={filtered.filter(m => m.shift === "Morning").length} color={COLORS.warning} dark={dark} />
        <StatCard icon="🌙" label="Evening Entries" value={filtered.filter(m => m.shift === "Evening").length} color={COLORS.purple} dark={dark} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16 }}>
        {/* Entry Form */}
        <div style={s.card}>
          <SectionHeader title="New Milk Entry" dark={dark} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={s.label}>Distributor Name</label>
              <select value={form.distributorName} onChange={e => setForm({ ...form, distributorName: e.target.value })} style={s.select}>
                <option value="">Select Distributor</option>
                {MOCK_DISTRIBUTORS.filter(d => d.status === "Active").map(d => <option key={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={s.label}>Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={s.input} />
              </div>
              <div>
                <label style={s.label}>Shift</label>
                <select value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })} style={s.select}>
                  <option>Morning</option><option>Evening</option>
                </select>
              </div>
            </div>
            <div>
              <label style={s.label}>Quantity (Liters)</label>
              <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} style={s.input} placeholder="0.00" />
            </div>
            <div>
              <label style={s.label}>Fat % <span style={{ color: "#94a3b8", fontSize: 11 }}>(auto-sets price)</span></label>
              <input type="number" value={form.fat} onChange={e => handleFatChange(e.target.value)} style={s.input} placeholder="e.g. 4.2" step="0.1" />
            </div>
            <div>
              <label style={s.label}>Price per Liter (₹)</label>
              <input type="number" value={form.pricePerLiter} onChange={e => setForm({ ...form, pricePerLiter: e.target.value })} style={s.input} placeholder="50" />
            </div>
            {total > 0 && (
              <div style={{ padding: "14px 16px", background: COLORS.accent + "10", border: `1.5px solid ${COLORS.accent}30`, borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>CALCULATED TOTAL</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.accent }}>{formatCurrency(total)}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{form.quantity}L × ₹{form.pricePerLiter}/L</div>
              </div>
            )}
            <div style={{ padding: 12, background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc", borderRadius: 10, fontSize: 12, color: "#64748b" }}>
              <strong>Fat Pricing Guide:</strong><br />
              &lt;3.5% = ₹45 | 3.5-4% = ₹50 | 4-5% = ₹55 | 5-6% = ₹60 | &gt;6% = ₹65
            </div>
            <button onClick={handleAdd} disabled={!form.distributorName || !form.quantity}
              style={{ ...s.btn(COLORS.primary), justifyContent: "center", padding: "11px 0", fontSize: 14, opacity: (!form.distributorName || !form.quantity) ? 0.5 : 1 }}>
              ✓ Save Milk Entry
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={s.card}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search..." dark={dark} />
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ ...s.input, width: 150 }} />
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead><tr>{["Distributor", "Shift", "Qty", "Fat%", "Rate", "Total", "Status"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td style={{ ...s.td, fontWeight: 600 }}>{m.distributorName}</td>
                    <td style={s.td}><span style={s.chip(m.shift === "Morning" ? COLORS.warning : COLORS.purple)}>{m.shift === "Morning" ? "🌅" : "🌙"} {m.shift}</span></td>
                    <td style={{ ...s.td, fontWeight: 700, color: COLORS.primary }}>{m.quantity}L</td>
                    <td style={s.td}>{m.fat}%</td>
                    <td style={s.td}>₹{m.pricePerLiter}</td>
                    <td style={{ ...s.td, fontWeight: 700, color: COLORS.accent }}>{formatCurrency(m.total)}</td>
                    <td style={s.td}><StatusBadge status={m.status} dark={dark} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No entries for selected date</div>}
        </div>
      </div>
    </div>
  );
}
