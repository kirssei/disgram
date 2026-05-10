export const injectStyles = () => {
  if (document.getElementById("disgram-vars")) return;
  const style = document.createElement("style");
  style.id = "disgram-vars";
  style.textContent = `
    :root {
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      --font-mono: "SF Mono", "Fira Code", "Cascadia Code", monospace;
      --bg-primary:   #fcf7fd;
      --bg-secondary: #eff2f5;
      --bg-tertiary:  #7a9eec;
      --text-primary:   #1a1a1a;
      --text-secondary: #55534e;
      --text-tertiary:  #9a9890;
      --border-subtle:  rgba(0,0,0,0.08);
      --border-default: rgba(0,0,0,0.13);
      --border-strong:  rgba(0,0,0,0.20);
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg-primary:   #1e1e1e;
        --bg-secondary: #272727;
        --bg-tertiary:  #151515;
        --text-primary:   #efefef;
        --text-secondary: #a0a09a;
        --text-tertiary:  #606060;
        --border-subtle:  rgba(255,255,255,0.06);
        --border-default: rgba(255,255,255,0.11);
        --border-strong:  rgba(255,255,255,0.18);
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; }
    body { background: var(--bg-tertiary); font-family: var(--font-sans); }
    button { font-family: var(--font-sans); cursor: pointer; }
    input, textarea { font-family: var(--font-sans); }
    input::placeholder, textarea::placeholder { color: var(--text-tertiary); }
    a { color: var(--text-tertiary); text-decoration: none; }
    a:hover { color: var(--text-secondary); }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
    .nav-btn:hover { background: var(--bg-secondary) !important; color: var(--text-primary) !important; }
    .link-item:hover { color: var(--text-secondary) !important; }
    .run-btn:hover { opacity: 0.88; }
    .run-btn:active { transform: scale(0.98); }
  `;
  document.head.appendChild(style);
};