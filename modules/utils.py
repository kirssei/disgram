import re


def emoji_replacement(content: str, emoji_map: dict) -> str:
    pattern = r'<tg-emoji emoji-id="(\d+)">.*?</tg-emoji>'

    def replacer(match):
        emoji_id = match.group(1)
        return emoji_map.get(emoji_id, "")

    return re.sub(pattern, replacer, content)

def html_replacement(content: str) -> str:
    tag_map = {"b": "**", "i": "*", "u": "__", "s": "~~"}

    for tag, md in tag_map.items():
        pattern = rf"<{tag}>(.*?)</{tag}>"
        content = re.sub(
            pattern, lambda m: f"{md}{m.group(1)}{md}", content, flags=re.DOTALL
        )

    return content