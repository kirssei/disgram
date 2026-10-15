import re
import yaml
import base64
from pathlib import Path

from aiogram import Bot
from discord import Guild

from modules.constants import *


def emoji_replacement(content: str, emoji_map: dict) -> str:
    pattern = r'<tg-emoji emoji-id="(\d+)">.*?</tg-emoji>'

    def replacer(match):
        emoji_id = match.group(1)
        return emoji_map.get(emoji_id, "")

    return re.sub(pattern, replacer, content)

def html_replacement(content: str) -> str:
    content = re.sub(
        r'<a\s+href="([^"]+)"\s*>(.*?)</a>',
        lambda m: f"[{m.group(2)}]({m.group(1)})",
        content,
        flags=re.DOTALL,
    )

    tag_map = {"b": "**", "i": "*", "u": "__", "s": "~~"}

    for tag, md in tag_map.items():
        pattern = rf"<{tag}>(.*?)</{tag}>"
        content = re.sub(
            pattern, lambda m: f"{md}{m.group(1)}{md}", content, flags=re.DOTALL
        )

    return content

async def dump_emoji_all(
    telegram_bot: Bot,
    discord_server: Guild,
    telegram_pack_name: str,
) -> tuple[list[dict], list[dict]]:
    discord_emoji = [
        {
            "id": str(e.id),
            "name": e.name,
            "animated": e.animated,
            "url": str(e.url),
        }
        for e in discord_server.emojis
    ]

    telegram_emoji = []
    emoji_set = await telegram_bot.get_sticker_set(name=telegram_pack_name)
    for st in emoji_set.stickers:
        file = await telegram_bot.get_file(st.file_id)
        data = await telegram_bot.download_file(file.file_path)
        ext = Path(file.file_path).suffix
        telegram_emoji.append({
            "id": st.custom_emoji_id,
            "emoji": st.emoji,
            "mime": MIME_BY_EXT.get(ext, "application/octet-stream"),
            "data": base64.b64encode(data.read()).decode("ascii"),
        })

    return discord_emoji, telegram_emoji


def save_emoji_dump(path: Path, discord_emoji: list, telegram_emoji: list) -> None:
    with path.open("w", encoding="utf-8") as f:
        yaml.safe_dump(
            {
                "emoji_dump": {
                    "discord_emoji": discord_emoji,
                    "telegram_emoji": telegram_emoji,
                }
            },
            f,
            allow_unicode=True,
            sort_keys=False,
            width=10**9,
        )