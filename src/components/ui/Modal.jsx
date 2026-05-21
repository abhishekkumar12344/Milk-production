import { getStyles } from "../../styles/getStyles.js";

export default function Modal({ open, onClose, title, dark, children }) {
  const s = getStyles(dark);
  if (!open) return null;
  return (
    <div style={s.modal} onClick={onClose}>
      <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: dark ? "#94a3b8" : "#64748b" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
