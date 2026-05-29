import { useState, useEffect } from "react";
import { COLORS } from "../constants/index.js";
import { formatCurrency, formatNum } from "../utils/formatters.js";
import { getStyles } from "../styles/getStyles.js";
import { clientAPI } from "../utils/api.js";
import StatCard from "../components/ui/StatCard.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import SearchBar from "../components/ui/SearchBar.jsx";
import Modal from "../components/ui/Modal.jsx";

export default function ClientsPage({ dark }) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const s = getStyles(dark, isMobile, isTablet);
  
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "Retail Shop",
    phone: "",
    email: "",
    address: "",
    city: "",
    contactPerson: "",
    creditLimit: "",
  });

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const result = await clientAPI.getAll();
      setClients(result.data || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
      alert("Error loading clients: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const types = ["All", ...new Set(clients.map(c => c.type))];
  const totalOutstanding = clients.filter(c => c.status === "Active").reduce((a, b) => a + b.outstandingAmount, 0);
  const activeClients = clients.filter(c => c.status === "Active").length;

  const filtered = clients.filter(c =>
    (filterType === "All" || c.type === filterType) &&
    (filterStatus === "All" || c.status === filterStatus) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddClient = async () => {
    if (!form.name || !form.phone || !form.city || !form.creditLimit) {
      alert("Please fill required fields (Name, Phone, City, Credit Limit)");
      return;
    }

    try {
      setSubmitting(true);
      const result = await clientAPI.create({
        name: form.name,
        type: form.type,
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: form.city,
        contactPerson: form.contactPerson,
        creditLimit: Number(form.creditLimit)
      });

      setClients(prev => [result.data, ...prev]);
      setShowAddModal(false);
      setForm({
        name: "",
        type: "Retail Shop",
        phone: "",
        email: "",
        address: "",
        city: "",
        contactPerson: "",
        creditLimit: "",
      });
      alert("✅ Client added successfully!");
    } catch (err) {
      alert("❌ Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateClient = async (id) => {
    if (confirm("Are you sure? This will deactivate the client.")) {
      try {
        setSubmitting(true);
        await clientAPI.update(id, { status: "Inactive" });
        setClients(prev => prev.map(c => c._id === id ? { ...c, status: "Inactive" } : c));
        setSelected(null);
        alert("✅ Client deactivated successfully!");
      } catch (err) {
        alert("❌ Error: " + err.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleReactivateClient = async (id) => {
    if (confirm("Are you sure? This will reactivate the client.")) {
      try {
        setSubmitting(true);
        await clientAPI.update(id, { status: "Active" });
        setClients(prev => prev.map(c => c._id === id ? { ...c, status: "Active" } : c));
        setSelected(null);
        alert("✅ Client reactivated successfully!");
      } catch (err) {
        alert("❌ Error: " + err.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const getCreditUtilization = (client) => {
    if (client.creditLimit === 0) return 0;
    const percent = Math.round((client.outstandingAmount / client.creditLimit) * 100);
    return Math.min(percent, 100);
  };

  return (
    <div>
      {/* Stats Cards */}
      <div style={s.grid(4)}>
        <StatCard icon="🏪" label="Total Clients" value={clients.length} color={COLORS.primary} dark={dark} />
        <StatCard icon="✅" label="Active" value={activeClients} delta={`${clients.length - activeClients} inactive`} positive={true} color={COLORS.accent} dark={dark} />
        <StatCard icon="💰" label="Outstanding Due" value={formatCurrency(totalOutstanding)} color={COLORS.warning} dark={dark} />
        <StatCard icon="📊" label="Avg Credit Used" value={(clients.length > 0 && clients.reduce((a, b) => a + b.creditLimit, 0) > 0 ? (totalOutstanding / clients.reduce((a, b) => a + b.creditLimit, 0) * 100).toFixed(0) : 0) + "%"} color={COLORS.primary} dark={dark} />
      </div>

      {/* Clients Table */}
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1, flexWrap: "wrap" }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search clients..." dark={dark} />
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...s.select, width: 140 }}>
              {types.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...s.select, width: 120 }}>
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <button onClick={() => setShowAddModal(true)} style={s.btn(COLORS.primary)} disabled={loading}>
            + Add Client
          </button>
        </div>

        {loading && <div style={{ textAlign: "center", padding: 40, color: COLORS.primary }}>⏳ Loading clients...</div>}

        {!loading && (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>{["Name", "Type", "Contact", "City", "Credit Limit", "Outstanding", "Credit Used", "Status", "Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map(client => {
                    const creditUsed = getCreditUtilization(client);
                    const creditColor = creditUsed > 90 ? COLORS.danger : creditUsed > 70 ? COLORS.warning : COLORS.accent;
                    return (
                      <tr key={client._id}>
                        <td style={{ ...s.td, fontWeight: 600 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLORS.primary + "20", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: COLORS.primary, fontSize: 13 }}>
                              {client.name[0]}
                            </div>
                            {client.name}
                          </div>
                        </td>
                        <td style={s.td}><span style={s.chip(COLORS.primary)}>{client.type}</span></td>
                        <td style={s.td}>
                          <div style={{ fontSize: 13 }}>{client.contactPerson}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{client.phone}</div>
                        </td>
                        <td style={s.td}>{client.city}</td>
                        <td style={{ ...s.td, fontWeight: 600, color: COLORS.primary }}>{formatCurrency(client.creditLimit)}</td>
                        <td style={{ ...s.td, fontWeight: 600, color: COLORS.warning }}>{formatCurrency(client.outstandingAmount)}</td>
                        <td style={s.td}>
                          <div style={{ height: 6, background: dark ? "rgba(255,255,255,0.06)" : "#e2e8f0", borderRadius: 4, marginBottom: 4 }}>
                            <div style={s.progressBar(creditUsed, creditColor)} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: creditColor }}>{creditUsed}%</span>
                        </td>
                        <td style={s.td}><StatusBadge status={client.status} dark={dark} /></td>
                        <td style={s.td}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => setSelected(client)} style={{ ...s.btn(COLORS.primary, true), padding: "4px 10px", fontSize: 11 }} disabled={submitting}>View</button>
                            {client.status === "Active" ? (
                              <button onClick={() => handleDeactivateClient(client._id)} style={{ ...s.btn(COLORS.warning, true), padding: "4px 10px", fontSize: 11 }} disabled={submitting}>Deact</button>
                            ) : (
                              <button onClick={() => handleReactivateClient(client._id)} style={{ ...s.btn(COLORS.accent, true), padding: "4px 10px", fontSize: 11 }} disabled={submitting}>React</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && !loading && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No clients found</div>}
          </>
        )}
      </div>

      {/* Client Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} dark={dark}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>CLIENT TYPE</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{selected?.type}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>STATUS</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{selected?.status}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>PHONE</div>
            <div style={{ fontSize: 14 }}>{selected?.phone}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>CITY</div>
            <div style={{ fontSize: 14 }}>{selected?.city}</div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>ADDRESS</div>
            <div style={{ fontSize: 14 }}>{selected?.address}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>CREDIT LIMIT</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>{formatCurrency(selected?.creditLimit || 0)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>OUTSTANDING</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.warning }}>{formatCurrency(selected?.outstandingAmount || 0)}</div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>CREDIT AVAILABLE</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.accent }}>
              {formatCurrency((selected?.creditLimit || 0) - (selected?.outstandingAmount || 0))}
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>CONTACT PERSON</div>
            <div style={{ fontSize: 14 }}>{selected?.contactPerson}</div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>JOIN DATE</div>
            <div style={{ fontSize: 14 }}>{selected?.joinDate?.substring(0, 10) || "N/A"}</div>
          </div>
        </div>
      </Modal>

      {/* Add Client Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Client" dark={dark}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={s.label}>Client Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={s.input} placeholder="e.g., Fresh Dairy Shop" disabled={submitting} />
          </div>
          <div>
            <label style={s.label}>Client Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={s.select} disabled={submitting}>
              <option>Retail Shop</option>
              <option>Supermarket</option>
              <option>Cooperative</option>
              <option>Hotel/Restaurant</option>
              <option>Sweet Shop</option>
              <option>Hospital/Clinic</option>
            </select>
          </div>
          <div>
            <label style={s.label}>Phone *</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={s.input} placeholder="9876543210" disabled={submitting} />
          </div>
          <div>
            <label style={s.label}>Email</label>
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={s.input} placeholder="email@example.com" disabled={submitting} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={s.label}>Address</label>
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={s.input} placeholder="Street address" disabled={submitting} />
          </div>
          <div>
            <label style={s.label}>City *</label>
            <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} style={s.input} placeholder="Mumbai" disabled={submitting} />
          </div>
          <div>
            <label style={s.label}>Contact Person</label>
            <input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} style={s.input} placeholder="Name" disabled={submitting} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={s.label}>Credit Limit (₹) *</label>
            <input type="number" value={form.creditLimit} onChange={e => setForm({ ...form, creditLimit: e.target.value })} style={s.input} placeholder="50000" disabled={submitting} />
          </div>
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10 }}>
            <button onClick={handleAddClient} style={{ ...s.btn(COLORS.primary), flex: 1 }} disabled={submitting}>✓ Save Client</button>
            <button onClick={() => setShowAddModal(false)} style={{ ...s.btn(COLORS.primary, true), flex: 1 }} disabled={submitting}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
