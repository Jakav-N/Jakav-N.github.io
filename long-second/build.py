#!/usr/bin/env python3
"""Build the Long Second site: src/chNNN.md -> chapters/chNNN.html + index TOC.

Dependency-free. Markdown subset: # h1, ## h2, --- hr, > blockquote,
*em*, **strong**, blank-line paragraphs.
"""
import html
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
OUT = ROOT / "chapters"

PAGE = """<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="Harry Potter and the Long Second — a fan novel. {chapno_label}: {title_plain}.">
<style>
__CSS__
</style>
</head>
<body>
<div class="page">
<div class="crumb"><a href="../index.html">Harry Potter and the Long Second</a></div>
<article class="chapter">
<div class="chapno">{chapno_label}</div>
<h1>{title_h}</h1>
{body}
</article>
<nav class="chnav">
{prev_link}
<span class="spacer"></span>
<a href="../index.html">Contents</a>
<span class="spacer"></span>
{next_link}
</nav>
</div>
</body>
</html>
"""


def inline(s: str) -> str:
    s = html.escape(s, quote=False)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"\*(.+?)\*", r"<em>\1</em>", s)
    return s


def md_to_html(md: str):
    """Return (title, body_html). Title comes from the first # line."""
    title = None
    out = []
    para: list[str] = []
    quote: list[str] = []

    def flush_para():
        if para:
            out.append("<p>" + inline(" ".join(para)) + "</p>")
            para.clear()

    def flush_quote():
        if quote:
            out.append("<blockquote><p>" + inline(" ".join(quote)) + "</p></blockquote>")
            quote.clear()

    for raw in md.splitlines():
        line = raw.rstrip()
        if line.startswith("# ") and title is None:
            flush_para(); flush_quote()
            title = line[2:].strip()
        elif line.startswith("## "):
            flush_para(); flush_quote()
            out.append("<h2>" + inline(line[3:].strip()) + "</h2>")
        elif line.strip() == "---":
            flush_para(); flush_quote()
            out.append("<hr>")
        elif line.startswith(">"):
            flush_para()
            quote.append(line.lstrip(">").strip())
        elif not line.strip():
            flush_para(); flush_quote()
        else:
            flush_quote()
            para.append(line.strip())
    flush_para(); flush_quote()
    return title or "Untitled", "\n".join(out)


def word_count(md: str) -> int:
    text = re.sub(r"[#>*]", "", md)
    return len(text.split())


def main():
    OUT.mkdir(exist_ok=True)
    # Inline the stylesheet so each page renders styled in previewers that
    # do not resolve relative links.
    css = (ROOT / "style.css").read_text(encoding="utf-8").strip()
    files = sorted(SRC.glob("ch*.md"))
    chapters = []
    for f in files:
        md = f.read_text(encoding="utf-8")
        title, body = md_to_html(md)
        n = int(re.search(r"\d+", f.stem).group())
        chapters.append({"n": n, "stem": f.stem, "title": title, "body": body,
                         "words": word_count(md)})

    for i, ch in enumerate(chapters):
        # Title lines look like "Chapter N — Name"; split for display.
        m = re.match(r"Chapter\s+\d+\s*[—–-]\s*(.+)", ch["title"])
        name = m.group(1) if m else ch["title"]
        label = f"Chapter {ch['n']}"
        prev_link = (f'<a href="{chapters[i-1]["stem"]}.html">&larr; {html.escape(prev_name(chapters, i))}</a>'
                     if i > 0 else "<span></span>")
        next_link = (f'<a href="{chapters[i+1]["stem"]}.html">{html.escape(prev_name(chapters, i+2))} &rarr;</a>'
                     if i + 1 < len(chapters) else "<span></span>")
        page = PAGE.format(
            title=f"{label} — {name} · The Long Second",
            title_plain=html.escape(name),
            title_h=inline(name),
            chapno_label=label,
            body=ch["body"],
            prev_link=prev_link,
            next_link=next_link,
        )
        page = page.replace("__CSS__", css)
        (OUT / f"{ch['stem']}.html").write_text(page, encoding="utf-8")

    # Inject TOC into index.html between markers.
    index = ROOT / "index.html"
    toc_items = []
    for ch in chapters:
        m = re.match(r"Chapter\s+\d+\s*[—–-]\s*(.+)", ch["title"])
        name = m.group(1) if m else ch["title"]
        toc_items.append(
            f'<li><a href="chapters/{ch["stem"]}.html">'
            f'<span class="n">Ch. {ch["n"]}</span>'
            f'<span class="t">{html.escape(name)}</span>'
            f'<span class="w">{ch["words"]:,} words</span></a></li>'
        )
    toc = "<ul class=\"toc\">\n" + "\n".join(toc_items) + "\n</ul>"
    src = index.read_text(encoding="utf-8")
    src = re.sub(r"(<!-- TOC START -->).*?(<!-- TOC END -->)",
                 lambda m: m.group(1) + "\n" + toc + "\n" + m.group(2),
                 src, flags=re.S)
    src = re.sub(r"(<!-- CSS START -->).*?(<!-- CSS END -->)",
                 lambda m: m.group(1) + "\n<style>\n" + css + "\n</style>\n" + m.group(2),
                 src, flags=re.S)
    index.write_text(src, encoding="utf-8")
    total = sum(c["words"] for c in chapters)
    print(f"Built {len(chapters)} chapter(s), {total:,} words.")


def prev_name(chapters, i):
    ch = chapters[i - 1]
    m = re.match(r"Chapter\s+\d+\s*[—–-]\s*(.+)", ch["title"])
    return f"Ch. {ch['n']}: {m.group(1) if m else ch['title']}"


if __name__ == "__main__":
    main()
