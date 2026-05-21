import { useState, useEffect } from "react";
import { COLORS } from "../constants/index.js";
import { PRODUCTION_LOG, INVENTORY } from "../data/mockData.js";
import { formatCurrency } from "../utils/formatters.js";
import { getStyles } from "../styles/getStyles.js";
import StatCard from "../components/ui/StatCard.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Modal from "../components/ui/Modal.jsx";

export default function ProductionPage({ dark }) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const s = getStyles(dark, isMobile, isTablet);
  const [production, setProduction] = useState(PRODUCTION_LOG);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    process: "Pasteurization",
    inputQty: "",
    inputUnit: "L",
    inputPrice: "",
    outputQty: "",
    outputUnit: "L",
    outputPrice: "",
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
  
  // Calculate profit/loss
  const totalInputCost = production.reduce((a, b) => a + (b.inputQty * b.inputPrice), 0);
  const totalOutputRevenue = production.reduce((a, b) => a + (b.outputQty * b.outputPrice), 0);
  const totalProfit = totalOutputRevenue - totalInputCost - totalProductionCost;
  const profitMargin = totalOutputRevenue > 0 ? ((totalProfit / totalOutputRevenue) * 100).toFixed(1) : 0;

  const handleAddProduction = () => {
    if (!form.inputQty || !form.outputQty || !form.inputPrice || !form.outputPrice) {
      alert("Please fill all required fields (Qty & Price)");
      return;
    }

    const inputQty = Number(form.inputQty);
    const outputQty = Number(form.outputQty);
    const inputPrice = Number(form.inputPrice);
    const outputPrice = Number(form.outputPrice);
    const lossPercent = ((inputQty - outputQty) / inputQty * 100).toFixed(1);
    const laborCost = Number(form.laborCost) || 0;
    const energyCost = Number(form.energyCost) || 0;

    setProduction(prev => [{
      id: Date.now(),
      date: form.date,
      process: form.process,
      inputQty: inputQty,
      inputUnit: form.inputUnit,
      inputPrice: inputPrice,
      outputQty: outputQty,
      outputUnit: form.outputUnit,
      outputPrice: outputPrice,
      lossPercent: Number(lossPercent),
      laborCost: laborCost,
      energyCost: energyCost,
      notes: form.notes
    }, ...prev]);

    setShowAddModal(false);
    setForm({
      date: new Date().toISOString().split("T")[0],
      process: "Pasteurization",
      inputQty: "",
      inputUnit: "L",
      inputPrice: "",
      outputQty: "",
      outputUnit: "L",
      outputPrice: "",
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
      {/* Enhanced Stats Cards */}
      <div style={s.grid(4)}>
        <StatCard icon="🏭" label="Total Input" value={`${totalProcessed} L`} color={COLORS.primary} dark={dark} />
        <StatCard icon="📦" label="Total Output" value={`${totalOutput} L`} color={COLORS.accent} dark={dark} />
        <StatCard icon="📉" label="Avg Loss %" value={`${avgLoss}%`} color={COLORS.warning} dark={dark} />
        <StatCard icon="💰" label="Production Cost" value={formatCurrency(totalProductionCost)} delta={`Labor: ${formatCurrency(totalLaborCost)} | Energy: ${formatCurrency(totalEnergyCost)}`} color={COLORS.primary} dark={dark} />
      </div>

      {/* Profit/Loss Analysis Cards */}
      <div style={s.grid(3)}>
        <div style={s.card}>
          <div style={{ fontSize: isMobile ? 11 : 12, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>TOTAL INPUT COST</div>
          <div style={{ fontSize: isMobile ? 20 : 28, fontWeight: 800, color: COLORS.primary, marginBottom: 4 }}>{formatCurrency(totalInputCost)}</div>
          <div style={{ fontSize: isMobile ? 10 : 11, color: "#94a3b8" }}>{totalProcessed} L @ avg price</div>
        </div>

        <div style={s.card}>
          <div style={{ fontSize: isMobile ? 11 : 12, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>TOTAL OUTPUT REVENUE</div>
          <div style={{ fontSize: isMobile ? 20 : 28, fontWeight: 800, color: COLORS.accent, marginBottom: 4 }}>{formatCurrency(totalOutputRevenue)}</div>
          <div style={{ fontSize: isMobile ? 10 : 11, color: "#94a3b8" }}>{totalOutput} L sold</div>
        </div>

        <div style={{ ...s.card, borderTop: `4px solid ${totalProfit >= 0 ? COLORS.accent : COLORS.danger}` }}>
          <div style={{ fontSize: isMobile ? 11 : 12, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>NET PROFIT/LOSS</div>
          <div style={{ fontSize: isMobile ? 20 : 28, fontWeight: 800, color: totalProfit >= 0 ? COLORS.accent : COLORS.danger, marginBottom: 4 }}>
            {formatCurrency(totalProfit)}
          </div>
          <div style={{ fontSize: isMobile ? 10 : 11, color: "#94a3b8" }}>Margin: {profitMargin}%</div>
        </div>
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

      {/* Production Log Table - Responsive */}
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <SectionHeader title="Production Log" dark={dark} />
          <button onClick={() => setShowAddModal(true)} style={s.btn(COLORS.primary)}>+ New Process</button>
        </div>

        {isMobile ? (
          // Mobile Card View
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {production.map(log => {
              const inputCost = log.inputQty * (log.inputPrice || 0);
              const outputRevenue = log.outputQty * (log.outputPrice || 0);
              const totalCost = log.laborCost + log.energyCost;
              const profit = outputRevenue - inputCost - totalCost;
              return (
                <div key={log.id} style={{ padding: 12, background: dark ? "rgba(255,255,255,0.02)" : "#f8fafc", borderRadius: 12, border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{log.process}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{log.date}</div>
                    </div>
                    <button onClick={() => setSelectedProcess(log)} style={{ ...s.btn(COLORS.primary, true), padding: "4px 10px", fontSize: 11 }}>View</button>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10, fontSize: 12 }}>
                    <div>
                      <div style={{ color: "#94a3b8", marginBottom: 2 }}>Input</div>
                      <div style={{ fontWeight: 600, color: COLORS.primary }}>{log.inputQty} {log.inputUnit}</div>
                      {log.inputPrice && <div style={{ fontSize: 10, color: "#94a3b8" }}>₹{log.inputPrice.toFixed(2)}/unit</div>}
                    </div>
                    <div>
                      <div style={{ color: "#94a3b8", marginBottom: 2 }}>Output</div>
                      <div style={{ fontWeight: 600, color: COLORS.accent }}>{log.outputQty} {log.outputUnit}</div>
                      {log.outputPrice && <div style={{ fontSize: 10, color: "#94a3b8" }}>₹{log.outputPrice.toFixed(2)}/unit</div>}
                    </div>
                    <div>
                      <div style={{ color: "#94a3b8", marginBottom: 2 }}>Loss %</div>
                      <div style={{ fontWeight: 600, color: log.lossPercent > 15 ? COLORS.danger : COLORS.warning }}>{log.lossPercent}%</div>
                    </div>
                    <div>
                      <div style={{ color: "#94a3b8", marginBottom: 2 }}>Prod. Cost</div>
                      <div style={{ fontWeight: 600 }}>{formatCurrency(totalCost)}</div>
                    </div>
                  </div>
                  
                  {log.inputPrice && log.outputPrice && (
                    <div style={{ paddingTop: 10, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`, fontSize: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span>Profit/Loss:</span>
                        <span style={{ fontWeight: 700, color: profit >= 0 ? COLORS.accent : COLORS.danger }}>{formatCurrency(profit)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {production.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No production logs</div>}
          </div>
        ) : (
          // Desktop Table View
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>{["Date", "Process", "Input (Qty)", "Input (₹/unit)", "Output (Qty)", "Output (₹/unit)", "Loss %", "Prod.Cost", "Profit/Loss", "Action"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {production.map(log => {
                  const inputCost = log.inputQty * (log.inputPrice || 0);
                  const outputRevenue = log.outputQty * (log.outputPrice || 0);
                  const totalCost = log.laborCost + log.energyCost;
                  const profit = outputRevenue - inputCost - totalCost;
                  return (
                    <tr key={log.id}>
                      <td style={s.td}>{log.date}</td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{log.process}</td>
                      <td style={{ ...s.td, fontWeight: 600, color: COLORS.primary }}>
                        {log.inputQty} {log.inputUnit}
                      </td>
                      <td style={{ ...s.td, fontWeight: 600, color: COLORS.primary }}>
                        ₹{log.inputPrice?.toFixed(2) || "0.00"}
                      </td>
                      <td style={{ ...s.td, fontWeight: 600, color: COLORS.accent }}>
                        {log.outputQty} {log.outputUnit}
                      </td>
                      <td style={{ ...s.td, fontWeight: 600, color: COLORS.accent }}>
                        ₹{log.outputPrice?.toFixed(2) || "0.00"}
                      </td>
                      <td style={{ ...s.td, fontWeight: 600, color: log.lossPercent > 15 ? COLORS.danger : COLORS.warning }}>
                        {log.lossPercent}%
                      </td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{formatCurrency(totalCost)}</td>
                      <td style={{ ...s.td, fontWeight: 700, color: profit >= 0 ? COLORS.accent : COLORS.danger }}>{formatCurrency(profit)}</td>
                      <td style={s.td}>
                        <button onClick={() => setSelectedProcess(log)} style={{ ...s.btn(COLORS.primary, true), padding: "4px 10px", fontSize: 11 }}>View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {production.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No production logs</div>}
          </div>
        )}
      </div>

      {/* Production Detail Modal */}
      <Modal open={!!selectedProcess} onClose={() => setSelectedProcess(null)} title={selectedProcess?.process} dark={dark}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>DATE</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedProcess?.date}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>PROCESS</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedProcess?.process}</div>
          </div>
          
          <div style={{ gridColumn: "1 / -1", padding: 12, background: dark ? "rgba(26, 86, 219, 0.1)" : "rgba(26, 86, 219, 0.05)", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: COLORS.primary, fontWeight: 700, marginBottom: 8 }}>📥 INPUT</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Quantity</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>{selectedProcess?.inputQty} {selectedProcess?.inputUnit}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Price per Unit</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>₹{selectedProcess?.inputPrice?.toFixed(2) || "0.00"}</div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Total Cost</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>{formatCurrency((selectedProcess?.inputQty || 0) * (selectedProcess?.inputPrice || 0))}</div>
              </div>
            </div>
          </div>

          <div style={{ gridColumn: "1 / -1", padding: 12, background: dark ? "rgba(34, 197, 94, 0.1)" : "rgba(34, 197, 94, 0.05)", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, marginBottom: 8 }}>📤 OUTPUT</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Quantity</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.accent }}>{selectedProcess?.outputQty} {selectedProcess?.outputUnit}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Selling Price</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.accent }}>₹{selectedProcess?.outputPrice?.toFixed(2) || "0.00"}</div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Total Revenue</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.accent }}>{formatCurrency((selectedProcess?.outputQty || 0) * (selectedProcess?.outputPrice || 0))}</div>
              </div>
            </div>
          </div>

          <div style={{ gridColumn: "1 / -1", padding: 12, background: dark ? "rgba(245, 158, 11, 0.1)" : "rgba(245, 158, 11, 0.05)", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: COLORS.warning, fontWeight: 700, marginBottom: 8 }}>📉 LOSS & COSTS</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Loss %</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.warning }}>{selectedProcess?.lossPercent}%</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Labor Cost</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{formatCurrency(selectedProcess?.laborCost || 0)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Energy Cost</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{formatCurrency(selectedProcess?.energyCost || 0)}</div>
              </div>
            </div>
          </div>

          {selectedProcess?.inputPrice && selectedProcess?.outputPrice && (
            <div style={{ gridColumn: "1 / -1", padding: 12, background: dark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#10b981", fontWeight: 700, marginBottom: 8 }}>💹 PROFIT/LOSS</div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 12, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Input Cost</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>{formatCurrency((selectedProcess?.inputQty || 0) * (selectedProcess?.inputPrice || 0))}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Production Cost</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.warning }}>{formatCurrency((selectedProcess?.laborCost || 0) + (selectedProcess?.energyCost || 0))}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Total Cost</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#ef4444" }}>{formatCurrency(((selectedProcess?.inputQty || 0) * (selectedProcess?.inputPrice || 0)) + ((selectedProcess?.laborCost || 0) + (selectedProcess?.energyCost || 0)))}</div>
                </div>
              </div>
              <div style={{ paddingTop: 10, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>NET PROFIT/LOSS</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: (((selectedProcess?.outputQty || 0) * (selectedProcess?.outputPrice || 0)) - (((selectedProcess?.inputQty || 0) * (selectedProcess?.inputPrice || 0)) + ((selectedProcess?.laborCost || 0) + (selectedProcess?.energyCost || 0)))) >= 0 ? COLORS.accent : COLORS.danger }}>
                    {formatCurrency((((selectedProcess?.outputQty || 0) * (selectedProcess?.outputPrice || 0)) - (((selectedProcess?.inputQty || 0) * (selectedProcess?.inputPrice || 0)) + ((selectedProcess?.laborCost || 0) + (selectedProcess?.energyCost || 0)))))}
                  </div>
                </div>
              </div>
            </div>
          )}

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
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
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

          {/* Input Section */}
          <div style={{ ...s.card, gridColumn: "1 / -1", background: dark ? "rgba(26, 86, 219, 0.05)" : "rgba(26, 86, 219, 0.02)", border: `1px solid ${COLORS.primary}20` }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: COLORS.primary }}>📥 INPUT DETAILS</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <div>
                <label style={s.label}>Quantity *</label>
                <input type="number" value={form.inputQty} onChange={e => setForm({ ...form, inputQty: e.target.value })} style={s.input} placeholder="0" step="0.1" />
              </div>
              <div>
                <label style={s.label}>Unit</label>
                <select value={form.inputUnit} onChange={e => setForm({ ...form, inputUnit: e.target.value })} style={s.select}>
                  <option>L</option>
                  <option>KG</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={s.label}>Price per {form.inputUnit === "L" ? "Liter" : "KG"} (₹) *</label>
                <input type="number" value={form.inputPrice} onChange={e => setForm({ ...form, inputPrice: e.target.value })} style={s.input} placeholder="0.00" step="0.01" />
              </div>
              {form.inputQty && form.inputPrice && (
                <div style={{ gridColumn: "1 / -1", padding: "10px 12px", background: COLORS.primary + "10", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Total Input Cost</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>{formatCurrency(Number(form.inputQty) * Number(form.inputPrice))}</div>
                </div>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div style={{ ...s.card, gridColumn: "1 / -1", background: dark ? "rgba(34, 197, 94, 0.05)" : "rgba(34, 197, 94, 0.02)", border: `1px solid ${COLORS.accent}20` }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: COLORS.accent }}>📤 OUTPUT DETAILS</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <div>
                <label style={s.label}>Quantity *</label>
                <input type="number" value={form.outputQty} onChange={e => setForm({ ...form, outputQty: e.target.value })} style={s.input} placeholder="0" step="0.1" />
              </div>
              <div>
                <label style={s.label}>Unit</label>
                <select value={form.outputUnit} onChange={e => setForm({ ...form, outputUnit: e.target.value })} style={s.select}>
                  <option>L</option>
                  <option>KG</option>
                  <option>Liters</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={s.label}>Selling Price per {form.outputUnit === "L" ? "Liter" : "KG"} (₹) *</label>
                <input type="number" value={form.outputPrice} onChange={e => setForm({ ...form, outputPrice: e.target.value })} style={s.input} placeholder="0.00" step="0.01" />
              </div>
              {form.outputQty && form.outputPrice && (
                <div style={{ gridColumn: "1 / -1", padding: "10px 12px", background: COLORS.accent + "10", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Total Output Revenue</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.accent }}>{formatCurrency(Number(form.outputQty) * Number(form.outputPrice))}</div>
                </div>
              )}
            </div>
          </div>

          {/* Loss Analysis */}
          {form.inputQty && form.outputQty && (
            <div style={{ ...s.card, gridColumn: "1 / -1", background: dark ? "rgba(245, 158, 11, 0.05)" : "rgba(245, 158, 11, 0.02)", border: `1px solid ${COLORS.warning}20` }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: COLORS.warning }}>📉 LOSS ANALYSIS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Loss %</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.warning }}>
                    {((Number(form.inputQty) - Number(form.outputQty)) / Number(form.inputQty) * 100).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Quantity Lost</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.warning }}>
                    {(Number(form.inputQty) - Number(form.outputQty)).toFixed(2)} {form.inputUnit}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Costs Section */}
          <div>
            <label style={s.label}>Labor Cost (₹)</label>
            <input type="number" value={form.laborCost} onChange={e => setForm({ ...form, laborCost: e.target.value })} style={s.input} placeholder="0" />
          </div>
          <div>
            <label style={s.label}>Energy Cost (₹)</label>
            <input type="number" value={form.energyCost} onChange={e => setForm({ ...form, energyCost: e.target.value })} style={s.input} placeholder="0" />
          </div>

          {/* Profit/Loss Calculation */}
          {form.inputQty && form.outputQty && form.inputPrice && form.outputPrice && (
            <div style={{ ...s.card, gridColumn: "1 / -1", background: dark ? "rgba(16, 185, 129, 0.05)" : "rgba(16, 185, 129, 0.02)", border: `1px solid #10b98120` }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#10b981" }}>💹 PROFIT/LOSS CALCULATION</div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 12, fontSize: 12 }}>
                <div>
                  <div style={{ color: "#94a3b8" }}>Total Input Cost</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>{formatCurrency(Number(form.inputQty) * Number(form.inputPrice))}</div>
                </div>
                <div>
                  <div style={{ color: "#94a3b8" }}>Total Output Revenue</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.accent }}>{formatCurrency(Number(form.outputQty) * Number(form.outputPrice))}</div>
                </div>
                <div>
                  <div style={{ color: "#94a3b8" }}>Total Prod. Cost</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.warning }}>{formatCurrency((Number(form.laborCost) || 0) + (Number(form.energyCost) || 0))}</div>
                </div>
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}` }}>
                <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>NET PROFIT/LOSS</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: ((Number(form.outputQty) * Number(form.outputPrice)) - (Number(form.inputQty) * Number(form.inputPrice)) - ((Number(form.laborCost) || 0) + (Number(form.energyCost) || 0))) >= 0 ? COLORS.accent : COLORS.danger }}>
                  {formatCurrency(((Number(form.outputQty) * Number(form.outputPrice)) - (Number(form.inputQty) * Number(form.inputPrice)) - ((Number(form.laborCost) || 0) + (Number(form.energyCost) || 0))))}
                </div>
              </div>
            </div>
          )}

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={s.label}>Notes</label>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={s.input} placeholder="Optional notes..." />
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
            <button onClick={handleAddProduction} style={{ ...s.btn(COLORS.primary), flex: 1 }}>✓ Add Process</button>
            <button onClick={() => setShowAddModal(false)} style={{ ...s.btn(COLORS.primary, true), flex: 1 }}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
