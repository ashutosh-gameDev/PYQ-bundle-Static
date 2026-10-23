"""Refresh data/syllabus.json from the live PYQ Bundle API (public endpoints, no login).

    python tools/sync_syllabus.py
    python tools/build_pages.py

Only subjects that have at least one topic are kept, so the website never lists
an empty subject.
"""
import json
import pathlib
import sys
import urllib.request

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from exam_content import EXAMS  # noqa: E402

API = "https://preppath-backend-o5n8.onrender.com/api/courses"
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "syllabus.json"


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "pyqbundle-site-sync"})
    with urllib.request.urlopen(req, timeout=90) as res:  # Render may cold-start
        return json.load(res)


def main():
    published = {c["slug"]: c for c in fetch(API) if c.get("is_published")}
    out = {}
    for exam in EXAMS:
        slug = exam["slug"]
        if slug not in published:
            print(f"!! {slug}: not published in the app - page will not be built")
            continue
        tree = fetch(f"{API}/{slug}")
        subjects = [
            {"name": s["name"], "topics": [t["name"] for t in (s.get("topics") or [])]}
            for s in tree.get("subjects", [])
            if s.get("topics")
        ]
        out[slug] = {"name": tree["name"], "subjects": subjects}
        print(f"{slug}: {len(subjects)} subjects, {sum(len(s['topics']) for s in subjects)} topics")

    missing = sorted(set(published) - {e["slug"] for e in EXAMS})
    if missing:
        print("Published in the app but not on the website yet (add to exam_content.py):", ", ".join(missing))

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Wrote", OUT.relative_to(ROOT))


if __name__ == "__main__":
    main()
