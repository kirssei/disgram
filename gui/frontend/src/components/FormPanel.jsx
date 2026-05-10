import Field from "./ui/Field";
import Toggle from "./ui/Toggle";

const s = {
  col: { 
    width: "52%", 
    borderRight: "0.5px solid var(--border-subtle)", 
    display: "flex", 
    flexDirection: "column", 
    overflow: "hidden" 
  },
  scroll: { 
    flex: 1, 
    overflowY: 
    "auto", 
    padding: "16px 18px" 
  },
  hint: { 
    fontSize: 12, 
    color: "var(--text-tertiary)", 
    marginBottom: 10, 
    lineHeight: 1.5 
  },
  code: { 
    fontFamily: "var(--font-mono)", 
    fontSize: 11, 
    background: "var(--bg-secondary)",
    padding: "1px 5px", 
    borderRadius: 5 
  },
  textarea: { 
    width: "100%", 
    padding: "8px 10px", 
    fontSize: 12, 
    fontFamily: "var(--font-mono)", 
    background: "var(--bg-secondary)", 
    border: "0.5px solid var(--border-default)", 
    borderRadius: 9, 
    color: "var(--text-primary)", 
    resize: "vertical", 
    outline: "none", 
    boxSizing: "border-box" 
  },
};

export default function FormPanel({ activeTab, form, set, toggle }) {
  return (
    <div style={s.col}>
      <div style={s.scroll}>

        {activeTab === "telegram" && <>
          <div style={s.hint}>
            Для создания Telegram бота, который будет пересылать ваши посты, воспользуйтесь официальным ботом Telegram - @BotFather.
            Также, вам необходимо добавить своего бота в участники вашего канала и передать ему права админа.
            ID канала можно получить разными способами. Я советую через бота @JsonDumpBot.
          </div>
          <br></br>
          <Field label="Bot token" value={form.telegramToken} onChange={set("telegramToken")} mono placeholder="1234567890:AAH..." />
          <Field label="Channel ID" value={form.telegramChannelId} onChange={set("telegramChannelId")} placeholder="-1001234567890" />
        </>}

        {activeTab === "discord" && <>
          <div style={s.hint}>
            Для создания Discord бота, который будет отправлять посты в канал, вам необходимо перейти на сайт Discord Developer Portal.
            Также, вам необходимо добавить своего бота на сам сервер с правами отправки сообщений в определенный канал.
            Чтобы узнать ID канала - Нажмите правой кнопкой мыши по нужному каналу - Выберете "Копировать ID канала"
          </div>
          <br></br>
          <Field label="Bot token" value={form.discordToken} onChange={set("discordToken")} mono placeholder="MTIzNDU2..." />
          <Field label="Channel ID" value={form.discordChannelId} onChange={set("discordChannelId")} placeholder="987654321098765432" />
          <Toggle label="Создавать треды" value={form.useThread} onToggle={toggle("useThread")} />
          {form.useThread && <Field label="Название треда" value={form.threadName} onChange={set("threadName")} />}
          <Toggle label="Пинговать роли" value={form.useRole} onToggle={toggle("useRole")} />
          {form.useRole && <Field label="Role ping" value={form.rolesPing} onChange={set("rolesPing")} placeholder="<@&123456789>" />}
        </>}

        {activeTab === "emoji" && <>
          <div style={s.hint}>Каждая строка: <code style={s.code}>tg_id:&lt;:discord_emoji:id&gt;</code></div>
          <textarea style={s.textarea} value={form.emojiMapRaw} onChange={set("emojiMapRaw")}
            placeholder={"5432167890:<:emoji_name:1234567890>\n1234567890:<:other:9876543210>"} rows={7} />
        </>}

        {activeTab === "filters" && <>
          <div style={s.hint}>Сообщения содержащие стоп-слова не пересылаются. Перечисли через запятую.</div>
          <Field label="Стоп-слова" value={form.stopWordsRaw} onChange={set("stopWordsRaw")} placeholder="реклама, промо, стоп" />
        </>}

      </div>
    </div>
  );
}