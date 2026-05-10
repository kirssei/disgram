import { useState, useEffect, useRef } from "react";
import { SaveAndRun, StopBot, IsRunning, GetLogs, LoadConfig } from "../wailsjs/go/main/App";
import { injectStyles } from "./styles/vars";
import { TABS } from "./components/Sidebar";
import Sidebar from "./components/Sidebar";
import FormPanel from "./components/FormPanel";
import LogPanel from "./components/LogPanel";
import Footer from "./components/Footer";

injectStyles();

const s = {
  root: { 
    display: "flex", 
    height: "100vh", 
    padding: 10, 
    gap: 8, 
    background: "var(--bg-tertiary)", 
    overflow: "hidden" 
  },
  panel: { 
    flex: 1, 
    background: "var(--bg-primary)", 
    border: "0.5px solid var(--border-default)", 
    borderRadius: 16, 
    display: "flex", 
    flexDirection: "column", 
    overflow: "hidden" 
  },
  panelHeader: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: "12px 18px", 
    borderBottom: "0.5px solid var(--border-subtle)", 
    flexShrink: 0 
  },
  panelTitle: { 
    fontSize: 14, 
    fontWeight: 500 
  },
  statusPill: { 
    display: "flex", 
    alignItems: "center", 
    gap: 6, 
    fontSize: 12, 
    color: "var(--text-tertiary)", 
    background: "var(--bg-secondary)", 
    padding: "3px 10px", 
    borderRadius: 20, 
    border: "0.5px solid var(--border-subtle)" 
  },
  statusDot: { 
    width: 6, 
    height: 6, 
    borderRadius: "50%", 
    flexShrink: 0 
  },
  body: { 
    flex: 1, 
    display: "flex", 
    overflow: "hidden" 
  },
};

export default function App() {
  const [form, setForm] = useState({
    telegramToken: "", telegramChannelId: "",
    discordToken: "", discordChannelId: "",
    useThread: true, threadName: "Комментарии",
    useRole: false, rolesPing: "",
    emojiMapRaw: "", stopWordsRaw: "",
  });
  const [running,   setRunning]   = useState(false);
  const [status,    setStatus]    = useState({ type: "", message: "" });
  const [logs,      setLogs]      = useState([]);
  const [activeTab, setActiveTab] = useState("telegram");
  const logOffsetRef = useRef(0);

  useEffect(() => {
    LoadConfig().then((cfg) => { if (cfg) setForm(cfg); }).catch(() => {});
  }, []);

  useEffect(() => {
    const tick = setInterval(async () => {
      setRunning(await IsRunning());
      const newLines = await GetLogs(logOffsetRef.current);
      if (newLines?.length > 0) {
        logOffsetRef.current += newLines.length;
        setLogs((prev) => [...prev, ...newLines].slice(-500));
      }
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const set = (key) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };
  const toggle = (key) => () => setForm((f) => ({ ...f, [key]: !f[key] }));

  const handleRun = async () => {
    setStatus({ type: "loading", message: "Запускаем..." });
    const result = await SaveAndRun({
      ...form,
    });
    const [type, ...parts] = result.split(":");
    setStatus({ type, message: parts.join(":") });
  };

  const handleStop = async () => {
    const result = await StopBot();
    const [type, ...parts] = result.split(":");
    setStatus({ type, message: parts.join(":") });
  };

  const activeColor = TABS.find((t) => t.id === activeTab)?.color;

  return (
    <div style={s.root}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div style={s.panel}>
        <div style={s.panelHeader}>
          <span style={{ ...s.panelTitle, color: activeColor }}>
            {TABS.find((t) => t.id === activeTab)?.label}
          </span>
          <div style={s.statusPill}>
            <span style={{ ...s.statusDot, background: running ? "#22C55E" : "#EF4444" }} />
            {running ? "Работает" : "Остановлен"}
          </div>
        </div>

        <div style={s.body}>
          <FormPanel activeTab={activeTab} form={form} set={set} toggle={toggle} />
          <LogPanel logs={logs} />
        </div>

        <Footer running={running} status={status} onRun={handleRun} onStop={handleStop} />
      </div>
    </div>
  );
}