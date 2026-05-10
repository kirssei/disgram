import { BrowserOpenURL } from "../../wailsjs/runtime/runtime";

const TABS = [
  { id: "telegram", label: "Telegram",  color: "#2AABEE" },
  { id: "discord",  label: "Discord",   color: "#5865F2" },
  { id: "emoji",    label: "Emoji map", color: "#F59E0B" },
  { id: "filters",  label: "Фильтры",  color: "#EF4444" },
];

const LINKS = [
  { label: "GitHub",            url: "https://github.com/kirssei/disgram" },
  { label: "Telegram Bot API",  url: "https://core.telegram.org/bots/api" },
  { label: "Discord Developer", url: "https://discord.com/developers" },
  { label: "Сообщить о баге",  url: "https://github.com/kirssei/disgram/issues" },
  { divider: true },
  { label: "Discord сервер",   url: "https://discord.gg/bXWjaCp3Rd" },
  { label: "Telegram канал", url: "https://t.me/kirsseich"}
];

export { TABS };

const s = {
  sidebar: { 
    width: 188, 
    minWidth: 188, 
    background: "var(--bg-primary)", 
    border: "0.5px solid var(--border-default)", 
    borderRadius: 16, display: "flex", 
    flexDirection: "column", 
    padding: 10, overflow: 
    "hidden" 
  },
  logo: { 
    display: "flex", 
    alignItems: "center", 
    gap: 10, 
    padding: "4px 4px 14px", 
    borderBottom: "0.5px solid var(--border-subtle)", 
    marginBottom: 10 
  },
  logoMark: { 
    width: 30, 
    height: 30, 
    borderRadius: 9, 
    background: "#566995", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    fontSize: 14, 
    flexShrink: 0 
  },
  logoName: { 
    fontSize: 14, 
    fontWeight: 500, 
    color: "var(--text-primary)" 
  },
  logoVer:  { 
    fontSize: 11, 
    color: "var(--text-tertiary)" 
  },
  nav: { 
    display: "flex", 
    flexDirection: "column", 
    gap: 2 
  },
  navBtn: { 
    display: "flex", 
    alignItems: "center", 
    gap: 8, 
    width: "100%", 
    padding: "7px 8px", 
    borderRadius: 10, 
    border: "0.5px solid transparent", 
    borderLeft: "2.5px solid transparent", 
    background: "transparent", 
    fontSize: 13, 
    color: "var(--text-secondary)", 
    textAlign: "left", 
    transition: "all 0.12s" 
  },
  navDot: { 
    width: 6, 
    height: 6, 
    borderRadius: "50%", 
    flexShrink: 0 
  },
  linksBlock: { 
    borderTop: "0.5px solid var(--border-subtle)", 
    paddingTop: 8, 
    display: "flex", 
    flexDirection: "column", 
    gap: 1 
  },
  linkItem: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: "5px 6px", 
    fontSize: 12, 
    color: "var(--text-tertiary)", 
    borderRadius: 8, 
    transition: "color 0.12s" 
  },
};

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <div style={s.sidebar}>
      <div style={s.logo}>
        <div style={s.logoMark}>🚀</div>
        <div>
          <div style={s.logoName}>Disgram</div>
          <div style={s.logoVer}>v0.0.1</div>
        </div>
      </div>

      <nav style={s.nav}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className="nav-btn"
            style={{
              ...s.navBtn,
              ...(activeTab === tab.id ? {
                background: "var(--bg-secondary)", color: "var(--text-primary)",
                fontWeight: 500, borderColor: "var(--border-default)", borderLeftColor: tab.color,
              } : {}),
            }}
            onClick={() => onTabChange(tab.id)}
          >
            <span style={{ ...s.navDot, background: tab.color }} />
            {tab.label}
          </button>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <div style={s.linksBlock}>
        {LINKS.map((l, i) =>
          l.divider
            ? <div key={i} style={{ height: 6 }} />
            : <span
                key={l.label}
                className="link-item"
                style={{ ...s.linkItem, cursor: "pointer" }}
                onClick={() => BrowserOpenURL(l.url)}
              >
                {l.label}
                <span style={{ fontSize: 10 }}>↗</span>
              </span>
        )}
      </div>
    </div>
  );
}