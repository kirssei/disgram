import yaml

from pathlib import Path


class Settings:

    def __init__(self):
        self.BASE_DIR = Path(__file__).resolve().parent.parent
        self.CONFIG_PATH = self.BASE_DIR / "config.yaml"
        self.EMOJI_DUMP_PATH = self.BASE_DIR / "emoji_dump.yaml"

        with open(self.CONFIG_PATH, "r", encoding="utf-8") as f:
            cfg = yaml.safe_load(f)

        self.TELEGRAM_TOKEN = cfg["telegram"]["token"]
        self.TELEGRAM_CHANNEL_ID = cfg["telegram"]["channel_id"]
        
        # Additional config of Telegram (NOT REQUIRED)
        self.TELEGRAM_PROXY = cfg["telegram"].get("proxy")
        self.TELEGRAM_EMOJI_PACK = cfg["telegram"].get("emoji_pack")

        self.DISCORD_TOKEN = cfg["discord"]["token"]
        self.DISCORD_CHANNEL_ID = cfg["discord"]["channel_id"]

        # Additional config of Discord (NOT REQUIRED)
        self.DISCORD_USE_THREAD = cfg["discord"].get("use_thread")
        self.DISCORD_THREAD_NAME = cfg["discord"].get("thread_name")
        self.DISCORD_USE_ROLE = cfg["discord"].get("use_role")
        self.DISCORD_ROLES_PING = cfg["discord"].get("roles_ping")

        self.EMOJI_MAP = cfg.get("emoji_map")

        self.STOP_WORDS = cfg["filters"]["stop_words"]

settings = Settings()