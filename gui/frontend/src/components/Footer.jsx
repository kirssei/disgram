const s = {
  footer: { 
    display: "flex", 
    alignItems: "center", 
    padding: "10px 14px", 
    borderTop: "0.5px solid var(--border-subtle)", 
    gap: 10, 
    flexShrink: 0 
  },
  status: { 
    flex: 1, 
    fontSize: 12 
  },
  btn: { 
    height: 34, 
    padding: "0 18px", 
    border: "none", 
    borderRadius: 10, 
    color: "white", 
    fontSize: 13, 
    fontWeight: 500, 
    transition: "opacity 0.15s, transform 0.1s", 
    flexShrink: 0 
  },
};

export default function Footer({ running, status, onRun, onStop }) {
  const statusColor = status.type === "ok" ? "#22C55E" : status.type === "error" ? "#E24B4A" : "#566995";
  const icon = status.type === "ok" ? "✓" : status.type === "error" ? "✕" : "…";

  return (
    <div style={s.footer}>
      {status.message && (
        <span style={{ ...s.status, color: statusColor }}>
          {icon} {status.message}
        </span>
      )}
      <button
        className="run-btn"
        style={{ ...s.btn, background: running ? "#E24B4A" : "#566995" }}
        onClick={running ? onStop : onRun}
      >
        {running ? "⏹ Остановить" : "▶ Запустить бота"}
      </button>
    </div>
  );
}