import { useState, useEffect } from "react";
import { COLORS } from "../constants/index.js";
import { formatCurrency } from "../utils/formatters.js";
import { getStyles } from "../styles/getStyles.js";
import StatCard from "../components/ui/StatCard.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import SearchBar from "../components/ui/SearchBar.jsx";
import { milkCollectionAPI, distributorAPI } from "../utils/api.js";

export default function MilkCollectionPage({ dark }) {
  const s = getStyles(dark);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [collections, setCollections] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);

  const [form, setForm] = useState({
    distributorId: "",
    date: new Date().toISOString().split("T")[0],
    shift: "Morning",
    quantity: "",
    fat: "",
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [collResult, distResult] = await Promise.all([
        milkCollectionAPI.getAll(),
        distributorAPI.getAll()
      ]);
      setCollections(collResult.data || []);
      setDistributors(distResult.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fatPrice = (fat) => {
    if (fat < 3.5) return 45;
    if (fat < 4) return 50;
    if (fat < 5) return 55;
    if (fat < 6) return 60;
    return 65;
  };

  const handleFatChange = (val) => {
    const price = fatPrice(Number(val));
    setForm(prev => ({ ...prev, fat: val, pricePerLiter: price }));
  };

  const handleAdd = async () => {
    if (!form.distributorId || !form.quantity || !form.fat) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const result = await milkCollectionAPI.create({
        distributorId: form.distributorId,
        date: form.date,
        shift: form.shift,
        quantity: Number(form.quantity),
        fat: Number(form.fat),
        status: "Pending"
      });

      setCollections(prev => [result.data, ...prev]);
      setForm({ distributorId: "", date: new Date().toISOString().split("T")[0], shift: "Morning", quantity: "", fat: "" });
      alert("✅ Collection added successfully!");
    } catch (err) {
      alert("❌ Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = collections.filter(c =>
    c.date === filterDate &&
    (c.distributorName?.toLowerCase().includes(search.toLowerCase()) || search === "")
  );

  const todayTotal = filtered.reduce((a, b) => a + (b.quantity || 0), 0);
  const todayRevenue = filtered.reduce((a, b) => a + (b.total || 0), 0);

  return (
    <div>
      <div style={s.grid(4)}>
        <StatCard icon="🥛" label="Day Collection" value={`${todayTotal.toFixed(1)} L`} color={COLORS.primary} dark={dark} />
        <StatCard icon="💰" label="Day Revenue" value={formatCurrency(todayRevenue)} color={COLORS.accent} dark={dark} />
        <StatCard icon="🌅" label="Morning" value={filtered.filter(m => m.shift === "Morning").length} color={COLORS.warning} dark={dark} />
        <StatCard icon="🌙" label="Evening" value={filtered.filter(m => m.shift === "Evening").length} color={COLORS.purple} dark={dark} />
      </div>

      <div style={s.grid(isMobile ? 1 : 2)}>
        <div style={s.card}>
          <SectionHeader title="New Milk Entry" dark={dark} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={s.label}>Distributor</label>
              <select value={form.distributorId} onChange={e => setForm({...form, distributorId: e.target.value})} style={s.select} disabled={submitting || loading}>
                <option value="">Select Distributor</option>
                {distributors.map(d => <option key={d._id} value={d._id}>{d.name} ({d.village})</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={s.label}>Date</label>
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={s.input} disabled={submitting} />
              </div>
              <div>
                <label style={s.label}>Shift</label>
                <select value={form.shift} onChange={e => setForm({...form, shift: e.target.value})} style={s.select} disabled={submitting}>
                  <option>Morning</option>
                  <option>Evening</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={s.label}>Quantity (L)</label>
                <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} style={s.input} placeholder="45" disabled={submitting} />
              </div>
              <div>
                <label style={s.label}>Fat %</label>
                <input type="number" value={form.fat} onChange={e => handleFatChange(e.target.value)} style={s.input} placeholder="3.8" step="0.1" disabled={submitting} />
              </div>
            </div>

            {form.fat && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ padding: "10px 12px", background: COLORS.primary + "20", borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>Price/Liter</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>₹{form.pricePerLiter || 0}</div>
                </div>
                <div style={{ padding: "10px 12px", background: COLORS.accent + "20", borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>Total</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.accent }}>{formatCurrency((form.quantity || 0) * (form.pricePerLiter || 0))}</div>
                </div>
              </div>
            )}

            <button onClick={handleAdd} style={s.btn(COLORS.primary)} disabled={submitting || loading}>
              {submitting ? "Adding..." : "➕ Add Entry"}
            </button>
          </div>
        </div>

        <div style={s.card}>
          <SectionHeader title="Filter & Search" dark={dark} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={s.label}>Date</label>
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={s.input} />
            </div>
            <SearchBar value={search} onChange={setSearch} placeholder="Search distributor..." dark={dark} />
            <div style={{ padding: "12px", background: dark ? "#1e293b" : "#f8fafc", borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Total for {filterDate}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary, marginTop: 4 }}>{todayTotal.toFixed(1)} L</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.accent, marginTop: 4 }}>{formatCurrency(todayRevenue)}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={s.card}>
        <SectionHeader title="Today's Collections" dark={dark} />
        {loading && <div style={{ textAlign: "center", padding: 40 }}>⏳ Loading...</div>}
        {!loading && filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No collections for this date</div>}
        {!loading && filtered.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>{["Distributor", "Shift", "Qty (L)", "Fat %", "Rate/L", "Total", "Status"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m._id}>
                    <td style={{ ...s.td, fontWeight: 600 }}>{m.distributorName}</td>
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
        )}
      </div>
    </div>
  );
}
