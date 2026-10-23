"""Check that every internal href/src and #anchor in the site's HTML resolves.

    python tools/check_links.py
"""
import pathlib
import re
import sys
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKIP = ("http://", "https://", "mailto:", "tel:", "data:", "javascript:")


class Collect(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids = [], set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.add(a["id"])
        for k in ("href", "src"):
            if a.get(k):
                self.links.append(a[k])


def parse(path):
    c = Collect()
    c.feed(path.read_text(encoding="utf-8"))
    return c


def target_file(page, url):
    parts = urlsplit(url)
    p = unquote(parts.path)
    base = page.parent
    t = (ROOT / p.lstrip("/")) if p.startswith("/") else (base / p) if p else page
    if t.is_dir():
        t = t / "index.html"
    return t.resolve(), parts.fragment


pages = [p for p in ROOT.rglob("*.html") if "node_modules" not in p.parts and not p.name.startswith("_")]
cache = {p.resolve(): parse(p) for p in pages}
errors = 0
for page in pages:
    for url in cache[page.resolve()].links:
        if url.startswith(SKIP):
            continue
        t, frag = target_file(page, url)
        if not t.exists():
            print(f"MISSING  {page.relative_to(ROOT)} -> {url}")
            errors += 1
        elif frag and t.suffix == ".html" and frag not in cache.get(t, parse(t)).ids:
            print(f"NO-ANCHOR {page.relative_to(ROOT)} -> {url}")
            errors += 1
print(f"Checked {len(pages)} pages: {errors} problem(s)")
sys.exit(1 if errors else 0)
