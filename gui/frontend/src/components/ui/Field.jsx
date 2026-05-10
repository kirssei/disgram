const s = {
  label: { 
    fontSize: 12, 
    color: "var(--text-secondary)", 
    marginBottom: 4 
  },
  input: {
    width: "100%", 
    height: 33, 
    padding: "0 10px", 
    fontSize: 13,
    background: "var(--bg-secondary)", 
    border: "0.5px solid var(--border-default)",
    borderRadius: 9, 
    color: "var(--text-primary)", 
    outline: "none", 
    boxSizing: "border-box",
  },
};

export default function Field({ label, value, onChange, placeholder, mono }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <div style={s.label}>{label}</div>}
      <input
        style={{ ...s.input, ...(mono ? { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)" } : {}) }}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type="text"
      />
    </div>
  );
}