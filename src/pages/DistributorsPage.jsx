import { useState, useEffect } from "react";
import { COLORS } from "../constants/index.js";
import { formatCurrency, formatNum } from "../utils/formatters.js";
import { getStyles } from "../styles/getStyles.js";
import StatCard from "../components/ui/StatCard.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import SearchBar from "../components/ui/SearchBar.jsx";
import Modal from "../components/ui/Modal.jsx";
import { distributorAPI } from "../utils/api.js";

export default function DistributorsPage({ dark }) {
  const s = getStyles(dark);
  const [search, setSearch] = useState("");
  const [filterVillage, setFilterVillage] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", village: "", phone: "", address: "", aadhaar: "", bank: "", milkType: "Cow" });

  // Fetch distributors on mount
  useEffect(() => {
    fetchDistributors();
  }, []);

  const fetchDistributors = async () => {
    try {
      setLoading(true);
      const result = await distributorAPI.getAll();
      setDistributors(result.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching distributors:", err);
      setError(err.message || "Failed to load distributors");
    } finally {
      setLoading(false);
    }
  };

  const villages = ["All", ...new Set(distributors.map(d => d.village))];
  const filtered = distributors.filter(d =>
    (filterVillage === "All" || d.village === filterVillage) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.village.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!form.name || !form.village || !form.phone) {
      alert("Please fill required fields (Name, Village, Phone)");
      return;
    }

    try {
      setSubmitting(true);
      const result = await distributorAPI.create({
        ...form,
        milkType: form.milkType,
        joinDate: new Date().toISOString().split("T")[0],
      });
      
      setDistributors(prev => [result.data, ...prev]);
      setShowAdd(false);
      setForm({ name: "", village: "", phone: "", address: "", aadhaar: "", bank: "", milkType: "Cow" });
      alert("✅ Distributor added successfully!");
    } catch (err) {
      alert("❌ Error adding distributor: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    
    try {
      await distributorAPI.delete(id);
      setDistributors(prev => prev.filter(d => d._id !== id));
      alert("✅ Distributor deleted successfully!");
    } catch (err) {
      alert("❌ Error deleting distributor: " + err.message);
    }
  };

  return (
    <div>
      <div style={s.grid(4)}>
        {[
          { icon: "👥", label: "Total Distributors", value: distributors.length, color: COLORS.primary },
          { icon: "✅", label: "Active", value: distributors.filter(d => d.status === "Active").length, color: COLORS.accent },
          { icon: "🥛", label: "Avg Daily (L)", value: Math.round(distributors.reduce((a, b) => a + (b.totalLiters || 0), 0) / (distributors.length || 1) / 30), color: COLORS.purple },
          { icon: "💰", label: "Total Amount", value: formatCurrency(distributors.reduce((a, b) => a + (b.totalAmount || 0), 0)), color: COLORS.warning },
        ].map(stat => <StatCard key={stat.label} {...stat} dark={dark} />)}
      </div>

      <div style={s.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search distributor..." dark={dark} />
            <select value={filterVillage} onChange={e => setFilterVillage(e.target.value)} style={{ ...s.select, width: 150 }}>
              {villages.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setShowAdd(true)} style={s.btn(COLORS.primary)} disabled={loading}>+ Add Distributor</button>
        </div>

        {loading && <div style={{ textAlign: "center", padding: 40, color: COLORS.primary }}>⏳ Loading...</div>}
        {error && <div style={{ textAlign: "center", padding: 40, color: COLORS.danger }}>❌ {error}</div>}

        {!loading && !error && (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>{["Name", "Village", "Phone", "Milk Type", "Join Date", "Total Liters", "Status", "Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d._id} style={{ cursor: "pointer" }} onClick={() => setSelected(d)}>
                      <td style={{ ...s.td, fontWeight: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLORS.primary + "20", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: COLORS.primary, fontSize: 13 }}>{d.name[0]}</div>
                          {d.name}
                        </div>
                      </td>
                      <td style={s.td}>{d.village}</td>
                      <td style={s.td}>{d.phone}</td>
                      <td style={s.td}><span style={s.chip(d.milkType === "Cow" ? COLORS.accent : COLORS.purple)}>{d.milkType === "Cow" ? "🐄" : "🐃"} {d.milkType}</span></td>
                      <td style={s.td}>{d.joinDate?.substring(0, 10)}</td>
                      <td style={{ ...s.td, fontWeight: 700, color: COLORS.primary }}>{formatNum(d.totalLiters || 0)} L</td>
                      <td style={s.td}><StatusBadge status={d.status} dark={dark} /></td>
                      <td style={s.td} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setSelected(d)} style={{ ...s.btn(COLORS.primary, true), padding: "4px 10px", fontSize: 11 }}>View</button>
                          <button onClick={() => handleDelete(d._id)} style={{ ...s.btn(COLORS.danger, true), padding: "4px 10px", fontSize: 11 }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No distributors found</div>}
          </>
        )}
      </div>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Distributor" dark={dark}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[["name", "Full Name"], ["village", "Village"], ["phone", "Phone Number"], ["address", "Address"], ["aadhaar", "Aadhaar / ID"], ["bank", "Bank Details"]].map(([k, l]) => (
            <div key={k} style={{ gridColumn: k === "address" ? "1 / -1" : "auto" }}>
              <label style={s.label}>{l}</label>
              <input value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} style={s.input} placeholder={l} disabled={submitting} />
            </div>
          ))}
          <div>
            <label style={s.label}>Milk Type</label>
            <select value={form.milkType} onChange={e => setForm({ ...form, milkType: e.target.value })} style={s.select} disabled={submitting}>
              <option>Cow</option><option>Buffalo</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={() => setShowAdd(false)} style={s.btn("#64748b", true)} disabled={submitting}>Cancel</button>
          <button onClick={handleAdd} style={s.btn(COLORS.primary)} disabled={submitting}>{submitting ? "Adding..." : "Add Distributor"}</button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Distributor Profile" dark={dark}>
        {selected && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: 16, background: COLORS.primary + "10", borderRadius: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: COLORS.primary, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 }}>{selected.name[0]}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{selected.name}</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>{selected.village} • {selected.phone}</div>
                <StatusBadge status={selected.status} dark={dark} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[["Address", selected.address || "N/A"], ["Aadhaar", selected.aadhaar || "N/A"], ["Bank", selected.bank || "N/A"], ["Milk Type", selected.milkType], ["Join Date", selected.joinDate?.substring(0, 10) || "N/A"], ["Total Liters", `${formatNum(selected.totalLiters || 0)} L`], ["Total Amount", formatCurrency(selected.totalAmount || 0)], ["Avg/Month", `${Math.round((selected.totalLiters || 0) / 12)} L`]].map(([k, v]) => (
                <div key={k} style={{ padding: "10px 14px", background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
