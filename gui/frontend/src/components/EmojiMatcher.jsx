import { useState, useMemo } from "react";
import { DumpEmoji, LoadEmojiDump, SaveEmojiMapping } from "../../wailsjs/go/main/App";
import { ClipboardSetText } from "../../wailsjs/runtime/runtime";
import Field from "./ui/Field";

const ACCENT = "#A855F7";

const s = {
  hint: {
    fontSize: 12,
    color: "var(--text-tertiary)",
    marginBottom: 10,
    lineHeight: 1.5
  },
  actions: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap"
  },
  btn: {
    height: 30,
    padding: "0 14px",
    border: "none",
    borderRadius: 9,
    color: "white",
    fontSize: 12,
    fontWeight: 500,
    background: "#566995",
    transition: "opacity 0.15s",
    flexShrink: 0
  },
  btnGhost: {
    height: 30,
    padding: "0 14px",
    border: "0.5px solid var(--border-default)",
    borderRadius: 9,
    color: "var(--text-secondary)",
    fontSize: 12,
    background: "var(--bg-secondary)",
    flexShrink: 0
  },
  status: {
    fontSize: 12,
    marginBottom: 12
  },
  sectionTitle: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    fontWeight: 500,
    color: "var(--text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: "4px 0 8px"
  },
  pool: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    padding: 8,
    background: "var(--bg-secondary)",
    border: "0.5px solid var(--border-default)",
    borderRadius: 10,
    maxHeight: 150,
    overflowY: "auto",
    marginBottom: 14
  },
  tile: {
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    border: "0.5px solid var(--border-subtle)",
    background: "var(--bg-primary)",
    cursor: "grab",
    transition: "all 0.12s"
  },
  rows: {
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 8px",
    border: "0.5px solid var(--border-default)",
    borderRadius: 10,
    background: "var(--bg-primary)"
  },
  arrow: {
    fontSize: 12,
    color: "var(--text-tertiary)"
  },
  drop: {
    flex: 1,
    minWidth: 0,
    height: 40,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 8px",
    borderRadius: 8,
    border: "1px dashed var(--border-strong)",
    fontSize: 12,
    color: "var(--text-tertiary)",
    cursor: "pointer",
    transition: "all 0.12s"
  },
  dropName: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-secondary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  clear: {
    border: "none",
    background: "transparent",
    color: "var(--text-tertiary)",
    fontSize: 14,
    padding: "0 4px"
  },
  check: {
    width: 16,
    height: 16,
    accentColor: "#22C55E",
    cursor: "pointer",
    flexShrink: 0
  },
  img: {
    objectFit: "contain",
    pointerEvents: "none",
    flexShrink: 0
  },
  empty: {
    fontSize: 12,
    color: "var(--text-tertiary)",
    padding: "4px 0"
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 24
  },
  modal: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "80vh",
    background: "var(--bg-primary)",
    border: "0.5px solid var(--border-default)",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 18px",
    borderBottom: "0.5px solid var(--border-subtle)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--text-primary)"
  },
  pre: {
    flex: 1,
    overflow: "auto",
    padding: "12px 18px",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-secondary)",
    whiteSpace: "pre"
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    padding: "10px 14px",
    borderTop: "0.5px solid var(--border-subtle)"
  },
};

const highlight = {
  borderColor: ACCENT,
  background: "rgba(168, 85, 247, 0.08)"
};

const parseResult = (result) => {
  const [type, ...parts] = result.split(":");
  return { type, message: parts.join(":") };
};

const discordTag = (e) => `<${e.animated ? "a" : ""}:${e.name}:${e.id}>`;

function TelegramPreview({ emoji, size = 28 }) {
  const src = `data:${emoji.mime};base64,${emoji.data}`;

  if (emoji.mime?.startsWith("image/")) {
    return <img src={src} width={size} height={size} style={s.img} alt={emoji.emoji} />;
  }
  if (emoji.mime === "video/webm") {
    return <video src={src} width={size} height={size} style={s.img} autoPlay loop muted playsInline />;
  }
  // .tgs браузер не отрисует — показываем обычный эмодзи-фолбэк
  return (
    <span style={{ fontSize: size * 0.8, width: size, textAlign: "center" }} title="Анимация .tgs">
      {emoji.emoji}
    </span>
  );
}

export default function EmojiMatcher({ form, set }) {
  const [dump,     setDump]     = useState(null);
  const [pairs,    setPairs]    = useState({}); // { tgId: { discordId, confirmed } }
  const [status,   setStatus]   = useState({ type: "", message: "" });
  const [loading,  setLoading]  = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showJson, setShowJson] = useState(false);

  const discordById = useMemo(
    () => Object.fromEntries((dump?.discord || []).map((e) => [e.id, e])),
    [dump]
  );

  const telegramEmojis = useMemo(
    () => (dump?.telegram || []).filter((e) => e.id),
    [dump]
  );

  const mapping = useMemo(() => {
    const result = {};
    for (const tg of telegramEmojis) {
      const pair = pairs[tg.id];
      const d = pair && discordById[pair.discordId];
      if (pair?.confirmed && d) result[tg.id] = discordTag(d);
    }
    return result;
  }, [pairs, telegramEmojis, discordById]);

  const json = JSON.stringify(mapping, null, 2);
  const confirmedCount = Object.keys(mapping).length;

  const loadDump = async () => {
    try {
      const data = await LoadEmojiDump();
      setDump(data);
      setPairs({});
      setStatus({ type: "ok", message: `Discord: ${data.discord?.length || 0}, Telegram: ${data.telegram?.length || 0}` });
    } catch (err) {
      setStatus({ type: "error", message: `Не удалось прочитать emoji_dump.yaml: ${err}` });
    }
  };

  const handleDump = async () => {
    if (!form.telegramEmojiPack?.trim()) {
      setStatus({ type: "error", message: "Укажи название пака" });
      return;
    }
    setLoading(true);
    setStatus({ type: "loading", message: "Сгружаем эмодзи..." });
    const result = parseResult(await DumpEmoji({ ...form }));
    setStatus(result);
    if (result.type === "ok") await loadDump();
    setLoading(false);
  };

  const assign = (tgId, discordId) => {
    setPairs((p) => ({ ...p, [tgId]: { discordId, confirmed: false } }));
    setSelected(null);
  };

  const clear = (tgId) => {
    setPairs((p) => {
      const next = { ...p };
      delete next[tgId];
      return next;
    });
  };

  const toggleConfirm = (tgId) => {
    setPairs((p) => ({ ...p, [tgId]: { ...p[tgId], confirmed: !p[tgId]?.confirmed } }));
  };

  const handleSave = async () => {
    const result = await SaveEmojiMapping(json);
    if (result) setStatus(parseResult(result));
  };

  const statusColor = status.type === "ok" ? "#22C55E" : status.type === "error" ? "#E24B4A" : "#566995";

  return <>
    <div style={s.hint}>
      Название пака — часть ссылки после <b>t.me/addemoji/</b>. После сгрузки перетащи эмодзи Discord
      на нужный эмодзи Telegram (или кликни по эмодзи Discord, а затем по строке) и подтверди пару галочкой.
    </div>

    <Field label="Telegram emoji pack" value={form.telegramEmojiPack} onChange={set("telegramEmojiPack")} mono placeholder="MyPackName" />

    <div style={s.actions}>
      <button className="run-btn" style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} onClick={handleDump} disabled={loading}>
        {loading ? "Сгружаем..." : "⬇ Сгрузить эмодзи"}
      </button>
      <button style={s.btnGhost} onClick={loadDump} disabled={loading}>
        Открыть последний дамп
      </button>
      {dump && (
        <button
          className="run-btn"
          style={{ ...s.btn, background: ACCENT, opacity: confirmedCount ? 1 : 0.5 }}
          onClick={() => setShowJson(true)}
          disabled={!confirmedCount}
        >
          {"{ } JSON"} ({confirmedCount})
        </button>
      )}
    </div>

    {status.message && <div style={{ ...s.status, color: statusColor }}>{status.message}</div>}

    {dump && <>
      <div style={s.sectionTitle}>
        <span>Discord</span>
        <span>{dump.discord?.length || 0}</span>
      </div>
      <div style={s.pool}>
        {(dump.discord || []).length === 0 && <div style={s.empty}>На сервере нет эмодзи</div>}
        {(dump.discord || []).map((d) => (
          <div
            key={d.id}
            draggable
            title={`:${d.name}:`}
            style={{ ...s.tile, ...(selected === d.id ? highlight : {}) }}
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", d.id);
              e.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => setSelected(selected === d.id ? null : d.id)}
          >
            <img src={d.url} width={28} height={28} style={s.img} alt={d.name} draggable={false} />
          </div>
        ))}
      </div>

      <div style={s.sectionTitle}>
        <span>Telegram → Discord</span>
        <span>{confirmedCount} / {telegramEmojis.length}</span>
      </div>
      <div style={s.rows}>
        {telegramEmojis.length === 0 && <div style={s.empty}>В паке нет кастомных эмодзи</div>}
        {telegramEmojis.map((tg) => {
          const pair = pairs[tg.id];
          const d = pair && discordById[pair.discordId];
          return (
            <div key={tg.id} style={{ ...s.row, ...(pair?.confirmed ? { borderColor: "#22C55E" } : {}) }}>
              <TelegramPreview emoji={tg} />
              <span style={s.arrow}>→</span>

              <div
                style={{ ...s.drop, ...(dragOver === tg.id || (selected && !d) ? highlight : {}) }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(tg.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(null);
                  assign(tg.id, e.dataTransfer.getData("text/plain"));
                }}
                onClick={() => selected && assign(tg.id, selected)}
              >
                {d
                  ? <>
                      <img src={d.url} width={24} height={24} style={s.img} alt={d.name} />
                      <span style={s.dropName}>{discordTag(d)}</span>
                    </>
                  : "Перетащи эмодзи сюда"}
              </div>

              {d && <button style={s.clear} onClick={() => clear(tg.id)} title="Убрать">✕</button>}
              <input
                type="checkbox"
                style={s.check}
                checked={!!pair?.confirmed}
                disabled={!d}
                onChange={() => toggleConfirm(tg.id)}
                title="Подтвердить пару"
              />
            </div>
          );
        })}
      </div>
    </>}

    {showJson && (
      <div style={s.overlay} onClick={() => setShowJson(false)}>
        <div style={s.modal} onClick={(e) => e.stopPropagation()}>
          <div style={s.modalHeader}>
            <span>Соответствия эмодзи</span>
            <button style={s.clear} onClick={() => setShowJson(false)}>✕</button>
          </div>
          <pre style={s.pre}>{json}</pre>
          <div style={s.modalFooter}>
            <button style={s.btnGhost} onClick={() => ClipboardSetText(json)}>Копировать</button>
            <button className="run-btn" style={s.btn} onClick={handleSave}>Сохранить в файл</button>
          </div>
        </div>
      </div>
    )}
  </>;
}