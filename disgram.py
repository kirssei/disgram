import sys
import asyncio

import discord

from aiogram.types import Message
from aiogram import Bot, Dispatcher
from aiogram.client.session.aiohttp import AiohttpSession


from modules import logger
from modules import settings
from modules.utils import (
    html_replacement,
    emoji_replacement,
    dump_emoji_all,
    save_emoji_dump,
)
from modules.media import extract_media


class Disgram:
    def __init__(self):

        # Telegram
        # Session for proxy
        if settings.TELEGRAM_PROXY:
            session = AiohttpSession(proxy=settings.TELEGRAM_PROXY)
        else:
            session = None

        self.bot = Bot(settings.TELEGRAM_TOKEN, session=session)
        self.dp = Dispatcher()
        logger.info("Telegram Bot started & connected! 🚀")

        # Discord
        intents = discord.Intents.default()
        self.discord_client = discord.Client(intents=intents)
        self.discord_channel: discord.TextChannel | None = None

        logger.info("Discord Bot started & connected! 🚀")

        # register handlers
        self._register_handlers()

    def _register_handlers(self):
        @self.discord_client.event
        async def on_ready():
            self.discord_channel = self.discord_client.get_channel(
                settings.DISCORD_CHANNEL_ID
            )
            logger.info(f"Disgram to Discord Channel: {self.discord_channel}")

        @self.dp.channel_post()
        async def channel_post(message: Message):
            await self.handle_channel_post(message)

    async def _send_to_discord(self, content: str, file, filename: str | None):
        if file:
            return await self.discord_channel.send(
                content=content, file=discord.File(fp=file, filename=filename)
            )
        return await self.discord_channel.send(content)

    async def dump_emoji(self):
        await self.discord_client.login(settings.DISCORD_TOKEN)
        try:
            channel = await self.discord_client.fetch_channel(settings.DISCORD_CHANNEL_ID)
            guild = await self.discord_client.fetch_guild(channel.guild.id)

            discord_emoji, telegram_emoji = await dump_emoji_all(
                telegram_bot=self.bot,
                discord_server=guild,
                telegram_pack_name=settings.TELEGRAM_EMOJI_PACK,
            )
            save_emoji_dump(settings.EMOJI_DUMP_PATH, discord_emoji, telegram_emoji)
        finally:
            await self.discord_client.close()
            await self.bot.session.close()

    async def handle_channel_post(self, message: Message):
        if message.chat.id != settings.TELEGRAM_CHANNEL_ID:
            return

        if not self.discord_channel:
            return

        content = message.html_text or " "

        logger.info(
            "Get message from Telegram Channel: "
            f"Message ID: {message.message_id}; Content: {content}"
        )

        can_send = True
        for word in settings.STOP_WORDS:
            if word in content.lower():
                can_send = False
                logger.warning(f"Message blocked by stop word: {word}")
                break

        if can_send:
            if settings.EMOJI_MAP:
                content = emoji_replacement(
                    content=content, emoji_map=settings.EMOJI_MAP
                )

            content = html_replacement(content=content)

            if settings.DISCORD_USE_ROLE:
                content = settings.DISCORD_ROLES_PING + "\n\n" + content

            file, filename = await extract_media(
                bot=self.bot, message=message
            )

            dc_message = await self._send_to_discord(
                content=content, file=file, filename=filename
            )

            if settings.DISCORD_USE_THREAD:
                await dc_message.create_thread(
                    name=settings.DISCORD_THREAD_NAME, auto_archive_duration=1440
                )

            logger.info(
                "Send message in Discord channel: "
                f"Messaged ID: {dc_message.id}; Content: {content};"
            )

    async def run(self):
        await asyncio.gather(
            self.dp.start_polling(self.bot),
            self.discord_client.start(settings.DISCORD_TOKEN),
        )

if __name__ == "__main__":
    bridge = Disgram()
    if len(sys.argv) > 1 and sys.argv[1] == "dump_emoji":
        asyncio.run(bridge.dump_emoji())
    else:
        asyncio.run(bridge.run())
