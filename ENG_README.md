# Disgram

Discord/Telegram bots for forwarding posts from a Telegram channel to a Discord server channel while preserving visual formatting and custom emojis.

Each post is published as a single message (text + media), and a thread for comments is automatically created under it in Discord.

🌐 **Language:**  
- 🇷🇺 [Русский](README.md)
- 🇬🇧 [English](ENG_README.md)

## ✨ Features
- 🔁 Forward posts from a Telegram channel to a Discord channel
- 😀 1:1 custom emoji mapping from Telegram → Discord
- 🎨 Preserve Markdown formatting
- 🧵 Automatically create a comment thread under each post
- 🚫 Filter posts using stop words

## 📦 **Requirements**
- Python 3.10+
- Poetry 2.1.3+

## 🛠 **Installation**
1. Clone the repository
```bash
git clone https://github.com/kirssei/disgram
cd disgram
```

2. Create a virtual environment and activate it
```bash
python3 -m venv env
. env/bin/activate
```

*If you are on Windows, the virtual environment is activated with the following command: `env\Scripts\activate`*

3. Install dependencies
```bash
poetry install
```

4. Create a `config.yaml` file based on the `config.example.yaml` file and fill in the required variables

| Variable | Description |
|---|---|
| TELEGRAM_TOKEN | Telegram bot token. Can be obtained from @BotFather |
| DISCORD_TOKEN | Discord bot token. Can be obtained at [Discord Dev](https://discord.com/developers/) |
| TELEGRAM_CHANNEL_ID | ID of the Telegram channel from which posts should be forwarded. Can be obtained via the @JsonDumpBot |
| DISCORD_CHANNEL_ID | ID of the Discord channel where posts from the Telegram channel will be sent. Can be obtained by right-clicking on the channel |
| USE_THREAD | Create threads for comments? |
| DISCORD_THREAD_NAME | Name of the thread that will be created for the message |
| USE_ROLE | Use role pings? |
| ROLES_PING | Which roles should be pinged when sending a post to a Discord channel |
| EMOJI_MAP | Mapping of emojis from a Telegram emoji pack to emojis on the Discord server |
| STOP_WORDS | When a word from this list is detected in a Telegram post, it is not sent to the Discord channel. **Words must be entered in lowercase and separated by a comma and a space**|

## 🚀 Running
```bash
python disgram.py
```

> [!WARNING]
> The Discord bot you create must be present on your Discord server. The Telegram bot you create must be a member of the channel from which posts are forwarded (and have administrator rights).