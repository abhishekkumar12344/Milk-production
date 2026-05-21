import { getStyles } from "../../styles/getStyles.js";

export default function StatCard({ icon, label, value, delta, positive, color, dark }) {
  const s = getStyles(dark);
  return (
    <div style={s.statCard(color)}>
      <div style={{ position: "absolute", right: -10, top: -10, width: 80, height: 80, borderRadius: "50%", background: color + "08" }} />
      <div style={s.statIcon(color)}>{icon}</div>
      <div style={s.statLabel}>{label}</div>
      <div style={s.statValue}>{value}</div>
      {delta && <div style={s.statDelta(positive)}>{positive ? "▲" : "▼"} {delta}</div>}
    </div>
  );
}
