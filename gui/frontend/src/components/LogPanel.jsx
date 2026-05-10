import { useEffect, useRef } from "react";

const s = {
  col: { 
    flex: 1, 
    display: "flex", 
    flexDirection: "column", 
    overflow: "hidden" 
  },
  header: { 
    fontSize: 11, 
    fontWeight: 500, 
    color: "var(--text-tertiary)", 
    textTransform: "uppercase", 
    letterSpacing: "0.06em", 
    padding: "10px 14px 8px", 
    borderBottom: "0.5px solid var(--border-subtle)", 
    flexShrink: 0 
  },
  scroll: { 
    flex: 1, 
    overflowY: "auto", 
    padding: "8px 14px", 
    fontFamily: "var(--font-mono)", 
    fontSize: 11 
  },
  empty: { 
    color: "var(--text-tertiary)", 
    fontSize: 12, 
    paddingTop: 4 
  },
  line: { 
    padding: "2px 0", 
    lineHeight: 1.6, 
    wordBreak: "break-all" 
  },
};

export default function LogPanel({ logs }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div style={s.col}>
      <div style={s.header}>Логи</div>
      <div style={s.scroll}>
        {logs.length === 0
          ? <div style={s.empty}>Ждём запуска...</div>
          : logs.map((line, i) => {
              const isErr = line.startsWith("err:");
              return (
                <div key={i} style={{ ...s.line, color: isErr ? "#000000" : "var(--text-secondary)" }}>
                  {line.replace(/^(out|err):/, "")}
                </div>
              );
            })
        }
        <div ref={endRef} />
      </div>
    </div>
  );
}