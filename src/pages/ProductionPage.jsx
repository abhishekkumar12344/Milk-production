import { useState } from "react";
import { COLORS } from "../constants/index.js";
import { PRODUCTION_LOG, INVENTORY } from "../data/mockData.js";
import { formatCurrency } from "../utils/formatters.js";
import { getStyles } from "../styles/getStyles.js";
import StatCard from "../components/ui/StatCard.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Modal from "../components/ui/Modal.jsx";

export default function ProductionPage({ dark }) {
  const s = getStyles(dark);
  const [production, setProduction] = useState(PRODUCTION_LOG);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    process: "Pasteurization",
    inputQty: "",
    inputUnit: "L",
    outputQty: "",
    outputUnit: "L",
    laborCost: "",
    energyCost: "",
    notes: ""
  });

  const processes = ["Pasteurization", "Paneer Making", "Ghee Preparation", "Butter Churning", "Yogurt Making", "Other"];
  
  // Calculate metrics
  const totalProcessed = production.reduce((a, b) => a + b.inputQty, 0);
  const totalOutput = production.reduce((a, b) => a + b.outputQty, 0);
  const avgLoss = production.length > 0 ? (production.reduce((a, b) => a + b.lossPercent, 0) / production.length).toFixed(1) : 0;
  const totalLaborCost = production.reduce((a, b) => a + b.laborCost, 0);
  const totalEnergyCost = production.reduce((a, b) => a + b.energyCost, 0);
  const totalProductionCost = totalLaborCost + totalEnergyCost;

  const handleAddProduction = () => {
    if (!form.inputQty || !form.outputQty) {
      alert("Please fill required fields");
      return;
    }

    const inputQty = Number(form.inputQty);
    const outputQty = Number(form.outputQty);
    const lossPercent = ((inputQty - outputQty) / inputQty * 100).toFixed(1);

    setProduction(prev => [{
      id: Date.now(),
      date: form.date,
      process: form.process,
      inputQty: inputQty,
      inputUnit: form.inputUnit,
      outputQty: outputQty,
      outputUnit: form.outputUnit,
      lossPercent: Number(lossPercent),
      laborCost: Number(form.laborCost),
      energyCost: Number(form.energyCost),
      notes: form.notes
    }, ...prev]);

    setShowAddModal(false);
    setForm({
      date: new Date().toISOString().split("T")[0],
      process: "Pasteurization",
      inputQty: "",
      inputUnit: "L",
      outputQty: "",
      outputUnit: "L",
      laborCost: "",
      energyCost: "",
      notes: ""
    });
  };

  // Group by process
  const processSummary = {};
  production.forEach(p => {
    if (!processSummary[p.process]) {
      processSummary[p.process] = { count: 0, input: 0, output: 0, cost: 0, loss: [] };
    }
    processSummary[p.process].count += 1;
    processSummary[p.process].input += p.inputQty;
    processSummary[p.process].output += p.outputQty;
    processSummary[p.process].cost += p.laborCost + p.energyCost;
    processSummary[p.process].loss.push(p.lossPercent);
  });

  return (
    <div>
      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon="🏭" label="Total Input" value={`${totalProcessed} L`} color={COLORS.primary} dark={dark} />
        <StatCard icon="📦" label="Total Output" value={`${totalOutput} L`} color={COLORS.accent} dark={dark} />
        <StatCard icon="📉" label="Avg Loss %" value={`${avgLoss}%`} color={COLORS.warning} dark={dark} />
        <StatCard icon="💰" label="Production Cost" value={formatCurrency(totalProductionCost)} delta={`Labor: ${formatCurrency(totalLaborCost)} | Energy: ${formatCurrency(totalEnergyCost)}`} color={COLORS.primary} dark={dark} />
      </div>

      {/* Process Summary Cards */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ ...s.card, marginBottom: 0 }}>
          <SectionHeader title="Process Overview" dark={dark} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
            {Object.entries(processSummary).map(([process, data]) => {
              const avgLoss = (data.loss.reduce((a, b) => a + b, 0) / data.loss.length).toFixed(1);
              const costPerUnit = data.output > 0 ? (data.cost / data.output).toFixed(2) : 0;
              return (
                <div key={process} style={{ padding: "14px", background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc", borderRadius: 12, border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}` }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{process}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                    <div>
                      <div style={{ color: "#94a3b8", fontSize: 11 }}>Batches</div>
                      <div style={{ fontWeight: 600, color: COLORS.primary }}>{data.count}</div>
                    </div>
                    <div>
                      <div style={{ color: "#94a3b8", fontSize: 11 }}>Avg Loss</div>
                      <div style={{ fontWeight: 600, color: COLORS.warning }}>{avgLoss}%</div>
                    </div>
                    <div>
                      <div style={{ color: "#94a3b8", fontSize: 11 }}>Total Input</div>
                      <div style={{ fontWeight: 600 }}>{data.input} L</div>
                    </div>
                    <div>
                      <div style={{ color: "#94a3b8", fontSize: 11 }}>Cost/Unit</div>
                      <div style={{ fontWeight: 600, color: COLORS.accent }}>₹{costPerUnit}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Production Log Table */}
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <SectionHeader title="Production Log" dark={dark} />
          <button onClick={() => setShowAddModal(true)} style={s.btn(COLORS.primary)}>+ New Process</button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={s.table}>
            <thead>
              <tr>{["Date", "Process", "Input", "Output", "Loss %", "Labor Cost", "Energy Cost", "Total Cost", "Notes", "Action"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {production.map(log => {
                const totalCost = log.laborCost + log.energyCost;
                return (
                  <tr key={log.id}>
                    <td style={s.td}>{log.date}</td>
                    <td style={{ ...s.td, fontWeight: 600 }}>{log.process}</td>
                    <td style={{ ...s.td, fontWeight: 600, color: COLORS.primary }}>
                      {log.inputQty} {log.inputUnit}
                    </td>
                    <td style={{ ...s.td, fontWeight: 600, color: COLORS.accent }}>
                      {log.outputQty} {log.outputUnit}
                    </td>
                    <td style={{ ...s.td, fontWeight: 600, color: log.lossPercent > 15 ? COLORS.danger : COLORS.warning }}>
                      {log.lossPercent}%
                    </td>
                    <td style={s.td}>{formatCurrency(log.laborCost)}</td>
                    <td style={s.td}>{formatCurrency(log.energyCost)}</td>
                    <td style={{ ...s.td, fontWeight: 700, color: COLORS.primary }}>{formatCurrency(totalCost)}</td>
                    <td style={{ ...s.td, fontSize: 12, color: "#94a3b8" }}>{log.notes || "-"}</td>
                    <td style={s.td}>
                      <button onClick={() => setSelectedProcess(log)} style={{ ...s.btn(COLORS.primary, true), padding: "4px 10px", fontSize: 11 }}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {production.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No production logs</div>}
      </div>

      {/* Production Detail Modal */}
      <Modal open={!!selectedProcess} onClose={() => setSelectedProcess(null)} title={selectedProcess?.process} dark={dark}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>DATE</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedProcess?.date}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>PROCESS</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedProcess?.process}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>INPUT QUANTITY</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>
              {selectedProcess?.inputQty} {selectedProcess?.inputUnit}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>OUTPUT QUANTITY</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.accent }}>
              {selectedProcess?.outputQty} {selectedProcess?.outputUnit}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>LOSS PERCENTAGE</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.warning }}>{selectedProcess?.lossPercent}%</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>LABOR COST</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{formatCurrency(selectedProcess?.laborCost || 0)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>ENERGY COST</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{formatCurrency(selectedProcess?.energyCost || 0)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>TOTAL COST</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>
              {formatCurrency((selectedProcess?.laborCost || 0) + (selectedProcess?.energyCost || 0))}
            </div>
          </div>
          {selectedProcess?.notes && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>NOTES</div>
              <div style={{ fontSize: 14 }}>{selectedProcess?.notes}</div>
            </div>
          )}
        </div>
      </Modal>

      {/* Add Production Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Production Process" dark={dark}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={s.label}>Date</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={s.input} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={s.label}>Process Type</label>
            <select value={form.process} onChange={e => setForm({ ...form, process: e.target.value })} style={s.select}>
              {processes.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label style={s.label}>Input Quantity *</label>
            <input type="number" value={form.inputQty} onChange={e => setForm({ ...form, inputQty: e.target.value })} style={s.input} placeholder="0" />
          </div>
          <div>
            <label style={s.label}>Input Unit</label>
            <select value={form.inputUnit} onChange={e => setForm({ ...form, inputUnit: e.target.value })} style={s.select}>
              <option>L</option>
              <option>KG</option>
            </select>
          </div>

          <div>
            <label style={s.label}>Output Quantity *</label>
            <input type="number" value={form.outputQty} onChange={e => setForm({ ...form, outputQty: e.target.value })} style={s.input} placeholder="0" />
          </div>
          <div>
            <label style={s.label}>Output Unit</label>
            <select value={form.outputUnit} onChange={e => setForm({ ...form, outputUnit: e.target.value })} style={s.select}>
              <option>L</option>
              <option>KG</option>
              <option>Liters</option>
            </select>
          </div>

          <div>
            <label style={s.label}>Labor Cost (₹)</label>
            <input type="number" value={form.laborCost} onChange={e => setForm({ ...form, laborCost: e.target.value })} style={s.input} placeholder="0" />
          </div>
          <div>
            <label style={s.label}>Energy Cost (₹)</label>
            <input type="number" value={form.energyCost} onChange={e => setForm({ ...form, energyCost: e.target.value })} style={s.input} placeholder="0" />
          </div>

          {form.inputQty && form.outputQty && (
            <div style={{ gridColumn: "1 / -1", padding: "12px 14px", background: COLORS.warning + "15", borderRadius: 8, border: `1px solid ${COLORS.warning}30` }}>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>LOSS ANALYSIS</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.warning }}>
                {((Number(form.inputQty) - Number(form.outputQty)) / Number(form.inputQty) * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                {Number(form.inputQty) - Number(form.outputQty)} {form.inputUnit} lost in production
              </div>
            </div>
          )}

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={s.label}>Notes</label>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={s.input} placeholder="Optional notes..." />
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10 }}>
            <button onClick={handleAddProduction} style={{ ...s.btn(COLORS.primary), flex: 1 }}>✓ Add Process</button>
            <button onClick={() => setShowAddModal(false)} style={{ ...s.btn(COLORS.primary, true), flex: 1 }}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
