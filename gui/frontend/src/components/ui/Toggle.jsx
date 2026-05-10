const s = {
  row: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: "9px 0", 
    cursor: "pointer", 
    borderTop: "0.5px solid var(--border-subtle)", 
    marginTop: 2 
  },
  label: { 
    fontSize: 13, 
    color: "var(--text-primary)" 
  },
  track: { 
    width: 32, 
    height: 18, 
    borderRadius: 9,
    position: "relative", 
    transition: "background 0.2s", 
    flexShrink: 0 
  },
  thumb: { 
    position: "absolute", 
    width: 14, 
    height: 14, 
    background: "white", 
    borderRadius: "50%", 
    top: 2, 
    left: 2, 
    transition: "transform 0.18s" 
  },
};

export default function Toggle({ label, value, onToggle }) {
  return (
    <div style={s.row} onClick={onToggle}>
      <span style={s.label}>{label}</span>
      <div style={{ ...s.track, background: value ? "#7F77DD" : "var(--border-strong)" }}>
        <div style={{ ...s.thumb, transform: value ? "translateX(14px)" : "translateX(0)" }} />
      </div>
    </div>
  );
}