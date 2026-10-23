# PYQ Bundle – website (pyqbundle.com)

Static marketing site on GitHub Pages. Plain HTML/CSS/JS, no build step needed to deploy.
The student app lives separately at https://app.pyqbundle.com (Next.js on Vercel).

```
index.html              home page
exams/                  exam pages (generated – don't edit by hand)
privacy.html terms.html contact.html
site-data.json          ← links, stats, screenshots, toggles
css/styles.css          all styles (light + dark)
js/main.js              config loading, animations, analytics, form UI
js/register.js          where form sign-ups are sent (Google Sheets)
google-apps-script.gs   Apps Script that writes sign-ups into the Sheet
tools/                  exam page generator + link checker
data/syllabus.json      subjects/topics pulled from the live API
images/screenshots/     put real app screenshots here
```

## Everyday settings: `site-data.json`

| Key | What it does |
|---|---|
| `links.web_app` | Target of every "Practice Online" button. |
| `links.play_store` | Leave `""` until the Play listing is live. When set to a `https://play.google.com/...` URL, the "Coming soon" Android button becomes "Download for Android", and the official Google Play badge, a QR code and the FAQ answer switch on automatically. |
| `product.status` | Text in the hero badge. Update it when the Android app launches. |
| `stats` | Stat cards. `exams` and `topics` are refreshed by `tools/build_pages.py`; `questions` and `papers` are set by hand. |
| `screenshots` | Real app screenshots (see below). Empty = Preview section hidden. |
| `features` | Optional: `{ "notes": "coming_soon" }` adds a "Coming soon" tag, `"hidden"` removes a card. Keys: `pyq, practice, notes, study_bite, performance, weak_areas, leaderboard, notifications`. |
| `early_access.enabled` | `false` hides the Early Tester Program everywhere. |
| `exams` | Options in the sign-up form's exam dropdown. |

### Adding screenshots
1. Save phone screenshots (portrait, at least 540 px wide, ideally `.webp`) in `images/screenshots/`.
2. List them in `site-data.json`:
```json
"screenshots": [
  { "src": "images/screenshots/home.webp", "label": "Home", "caption": "Your study dashboard", "hero": true },
  { "src": "images/screenshots/exam.webp", "label": "Exam selection" },
  { "src": "images/screenshots/practice.webp", "label": "Practice" },
  { "src": "images/screenshots/notes.webp", "label": "Notes" },
  { "src": "images/screenshots/performance.webp", "label": "Performance" }
]
```
`"hero": true` replaces the phone mockup at the top of the page with that screenshot.

## Exam pages

Content: `tools/exam_content.py` (overview, stages, pattern, tips).
Subjects/topics: pulled from the live API.

```
python tools/sync_syllabus.py   # refresh data/syllabus.json from the API (public endpoints)
python tools/build_pages.py     # rebuild exams/, home exam cards, footers, sitemap.xml, stats
python tools/check_links.py     # verify every internal link
```
To add an exam: publish it in the app, add an entry to `tools/exam_content.py`, run the three commands.
Bump `ASSET_V` in `tools/build_pages.py` after changing CSS/JS so browsers fetch the new files.

## Running locally

```
python -m http.server 8080
```
Open http://localhost:8080. Analytics is disabled on localhost.

## Form sign-ups (Google Sheets)

`js/register.js` posts to the Apps Script web app set in `BACKEND.sheets.url`. Rows land in the
"Registrations" tab of the Sheet. After editing `google-apps-script.gs` in Apps Script:
Deploy → Manage deployments → ✏️ → New version → Deploy.

## Analytics

Google Analytics 4 (`GA_ID` at the top of `js/main.js`). Events: `cta_click` (with `cta` name),
`pre_register` (Early Tester / updates sign-up), `form_error`.
