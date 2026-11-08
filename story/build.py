#!/usr/bin/env python3
"""Build story/chapters/*.html and story/index.html from story/src/*.md.

Markdown subset: '# ' h1, '## ' h2, blank-line paragraphs, '* * *' scene break,
'> ' blockquote, *em*, **strong**, '--' em dash, straight quotes -> curly.
Run from anywhere: python3 story/build.py
"""
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "chapters"
STORY_TITLE = "Harry Potter and the Speed of Thought"


def smart_quotes(s: str) -> str:
    # Opening double quote: start, or after whitespace / ( / [ / em dash / open single
    s = re.sub(r'(^|[\s(\[—‘])"', lambda m: m.group(1) + "“", s)
    s = s.replace('"', "”")
    # Opening single quote: start or after whitespace / ( / [ / em dash / open double
    s = re.sub(r"(^|[\s(\[—“])'", lambda m: m.group(1) + "‘", s)
    s = s.replace("'", "’")
    return s


def inline(s: str) -> str:
    s = html.escape(s, quote=False)
    s = s.replace("--", "—")
    s = smart_quotes(s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"\*(.+?)\*", r"<em>\1</em>", s)
    return s


def convert(md: str):
    title = None
    out = []
    para = []

    def flush():
        nonlocal para
        if para:
            out.append("<p>" + inline(" ".join(para)) + "</p>")
            para = []

    for raw in md.splitlines():
        line = raw.rstrip()
        if not line.strip():
            flush()
            continue
        if line.startswith("# "):
            flush()
            title = line[2:].strip()
            out.append("<h1>" + inline(title) + "</h1>")
        elif line.startswith("## "):
            flush()
            out.append("<h2>" + inline(line[3:].strip()) + "</h2>")
        elif line.strip() in ("* * *", "***", "---"):
            flush()
            out.append('<hr class="break">')
        elif line.startswith("> "):
            flush()
            out.append("<blockquote><p>" + inline(line[2:]) + "</p></blockquote>")
        else:
            para.append(line.strip())
    flush()
    return title, "\n".join(out)


PAGE = """<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} &middot; {story}</title>
<link rel="stylesheet" href="../style.css">
</head>
<body>
<nav class="top"><a href="../index.html">{story}</a></nav>
<main>
{body}
</main>
<nav class="bottom">{prev}{next}</nav>
</body>
</html>
"""

INDEX = """<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{story}</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<main class="index">
<h1>{story}</h1>
<p class="note">A work of fan fiction. Harry Potter belongs to J.&nbsp;K. Rowling. Nothing here is for sale.</p>
<ol class="chapters">
{items}
</ol>
<p class="note small">Working notes: <a href="outline/bible.md">story bible</a> &middot; <a href="outline/01-10.md">outline, chapters 1&ndash;10</a> &middot; <a href="outline/11-20.md">outline, chapters 11&ndash;20</a></p>
</main>
</body>
</html>
"""


def main():
    OUT.mkdir(exist_ok=True)
    files = sorted(SRC.glob("*.md"))
    entries = []
    for f in files:
        title, body = convert(f.read_text(encoding="utf-8"))
        entries.append((f.stem, title or f.stem, body))
    for i, (stem, title, body) in enumerate(entries):
        prev_ = entries[i - 1][0] if i > 0 else None
        next_ = entries[i + 1][0] if i + 1 < len(entries) else None
        prev_html = f'<a class="prev" href="{prev_}.html">&larr; Previous</a>' if prev_ else "<span></span>"
        next_html = f'<a class="next" href="{next_}.html">Next &rarr;</a>' if next_ else "<span></span>"
        (OUT / f"{stem}.html").write_text(
            PAGE.format(title=html.escape(title), story=STORY_TITLE, body=body, prev=prev_html, next=next_html),
            encoding="utf-8",
        )
    items = "\n".join(f'<li><a href="chapters/{stem}.html">{inline(title)}</a></li>' for stem, title, _ in entries)
    (ROOT / "index.html").write_text(INDEX.format(story=STORY_TITLE, items=items), encoding="utf-8")
    print(f"built {len(entries)} chapter(s)")


if __name__ == "__main__":
    sys.exit(main())
