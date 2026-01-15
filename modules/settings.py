import yaml

from pathlib import Path


class Settings:

    def __init__(self):
        base_dir = Path(__file__).resolve().parent.parent
        config_path = base_dir / "config.yaml"

        with open(config_path, "r", encoding="utf-8") as f:
            cfg = yaml.safe_load(f)

        self.TELEGRAM_TOKEN = cfg["telegram"]["token"]
        self.TELEGRAM_CHANNEL_ID = cfg["telegram"]["channel_id"]

        self.DISCORD_TOKEN = cfg["discord"]["token"]
        self.DISCORD_CHANNEL_ID = cfg["discord"]["channel_id"]
        self.DISCORD_THREAD_NAME = cfg["discord"]["thread_name"]

        self.EMOJI_MAP = cfg["emoji_map"]

        self.STOP_WORDS = cfg["filters"]["stop_words"]

settings = Settings()