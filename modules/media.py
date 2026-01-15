from aiogram import Bot
from aiogram.types import Message


async def extract_media(bot: Bot, message: Message):
    if message.photo:
        tg_file = await bot.get_file(message.photo[-1].file_id)
        return (await bot.download_file(tg_file.file_path), "photo.jpg")

    if message.video:
        tg_file = await bot.get_file(message.video.file_id)
        return (await bot.download_file(tg_file.file_path), "video.mp4")

    if message.animation:
        tg_file = await bot.get_file(message.animation.file_id)
        return (await bot.download_file(tg_file.file_path), "animation.gif")

    if message.document:
        tg_file = await bot.get_file(message.document.file_id)
        return (
            await bot.download_file(tg_file.file_path),
            message.document.file_name,
        )

    return None, None