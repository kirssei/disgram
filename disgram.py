import os
import re
import json
import asyncio
from pathlib import Path
from dotenv import load_dotenv

from aiogram import Bot, Dispatcher
from aiogram.types import Message

import discord


class Disgram:
    def __init__(self):
        self._load_env()

        # Telegram
        self.bot = Bot(self.TELEGRAM_TOKEN)
        self.dp = Dispatcher()

        # Discord
        intents = discord.Intents.default()
        self.discord_client = discord.Client(intents=intents)
        self.discord_channel: discord.TextChannel | None = None

        # register handlers
        self._register_handlers()

    def _load_env(self):
        base_dir = Path(__file__).resolve().parent
        load_dotenv(base_dir / ".env")

        self.TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
        self.DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")

        self.TELEGRAM_CHANNEL_ID = int(os.getenv("TELEGRAM_CHANNEL_ID"))
        self.DISCORD_CHANNEL_ID = int(os.getenv("DISCORD_CHANNEL_ID"))

        self.DISCORD_THREAD_NAME = os.getenv("DISCORD_THREAD_NAME") or "Comments"

        str_emoji_map = os.getenv("EMOJI_MAP")
        self.EMOJI_MAP = json.loads(str_emoji_map) if str_emoji_map else None

    def _register_handlers(self):
        @self.discord_client.event
        async def on_ready():
            self.discord_channel = self.discord_client.get_channel(
                self.DISCORD_CHANNEL_ID
            )
            print(f"[Discord] Ready: {self.discord_channel}")

        @self.dp.channel_post()
        async def channel_post(message: Message):
            await self.handle_channel_post(message)

    def _emoji_replacement(self, content: str) -> str:
        pattern = r'<tg-emoji emoji-id="(\d+)">.*?</tg-emoji>'
        def replacer(match):
            emoji_id = match.group(1)
            return self.EMOJI_MAP.get(emoji_id, "")
        return re.sub(pattern, replacer, content)

    def _html_replacement(self, content: str):
        tag_map = {
            "b": "**",
            "i": "*",
            "u": "__",
            "s": "~~"
        }

        for tag, md in tag_map.items():
            pattern = fr"<{tag}>(.*?)</{tag}>"
            content = re.sub(pattern, lambda m: f"{md}{m.group(1)}{md}", content, flags=re.DOTALL)
        
        return content

    async def handle_channel_post(self, message: Message):
        if message.chat.id != self.TELEGRAM_CHANNEL_ID:
            return

        if not self.discord_channel:
            return

        content = message.html_text or " "

        if self.EMOJI_MAP:
            content = self._emoji_replacement(
                content=content
            )
        
        content = self._html_replacement(
            content=content
        )

        file, filename = await self._extract_media(message)

        dc_message = await self._send_to_discord(
            content=content,
            file=file,
            filename=filename
        )

        await dc_message.create_thread(
            name=self.DISCORD_THREAD_NAME,
            auto_archive_duration=1440
        )

    async def _extract_media(self, message: Message):
        if message.photo:
            tg_file = await self.bot.get_file(message.photo[-1].file_id)
            return (
                await self.bot.download_file(tg_file.file_path),
                "photo.jpg"
            )

        if message.video:
            tg_file = await self.bot.get_file(message.video.file_id)
            return (
                await self.bot.download_file(tg_file.file_path),
                "video.mp4"
            )

        if message.animation:
            tg_file = await self.bot.get_file(message.animation.file_id)
            return (
                await self.bot.download_file(tg_file.file_path),
                "animation.gif"
            )

        if message.document:
            tg_file = await self.bot.get_file(message.document.file_id)
            return (
                await self.bot.download_file(tg_file.file_path),
                message.document.file_name
            )

        return None, None

    async def _send_to_discord(self, content: str, file, filename: str | None):
        if file:
            return await self.discord_channel.send(
                content=content,
                file=discord.File(fp=file, filename=filename)
            )
        return await self.discord_channel.send(content)

    async def run(self):
        await asyncio.gather(
            self.dp.start_polling(self.bot),
            self.discord_client.start(self.DISCORD_TOKEN)
        )


if __name__ == "__main__":
    bridge = Disgram()
    asyncio.run(bridge.run())
