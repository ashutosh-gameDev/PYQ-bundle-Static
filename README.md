# PYQ Bundle – pre-launch landing page

Static one-page site: plain HTML/CSS/JS, no build step and no npm packages.

```
index.html          page content & SEO tags
site-data.json      ← numbers & settings you update
css/styles.css      all styles (light + dark)
js/main.js          stats loading, animations, form UI
js/register.js      ← where form submissions are sent
supabase-setup.sql  table + security for Supabase
favicon.svg, robots.txt, sitemap.xml
```

## Updating stats: `site-data.json`

```json
{ "key": "questions", "value": 2000, "suffix": "+", "label": "PYQs" }
```

- Change `2000` → `3500` and the page shows **3,500+ PYQs**.
- Add another object to `stats` to add a new card, e.g.
  `{ "key": "exams", "value": 3, "suffix": "+", "label": "Exams" }`
- `key: "papers"` powers the "50+ papers today" line; keep that key.
- `exams` fills the form dropdown. `early_access.enabled: false` hides the tester program.
- JSON has no comments. Keep quotes and commas valid (check at jsonlint.com if unsure).
  If the file fails to load, the page still works and shows "Continuously Growing".

## Running locally

`fetch()` does not work from `file://`, so serve the folder:

```
python -m http.server 8080      # or:  npx serve .
```

Then open http://localhost:8080

## Connecting the form

Registrations go to a **Google Sheet** (`mode: 'sheets'` in `js/register.js`).

1. Create a Google Sheet (e.g. "PYQ Bundle Pre-Registrations").
2. In the Sheet: Extensions → Apps Script. Delete the sample code and paste all of `google-apps-script.gs`. Save.
3. Deploy → New deployment → ⚙️ Web app. Execute as: **Me**. Who has access: **Anyone**. Deploy, then allow access.
4. Copy the Web app URL (ends in `/exec`) into `BACKEND.sheets.url` in `js/register.js`.
5. Test: submit the form once. A "Registrations" tab appears with your row.

After changing the Apps Script later: Deploy → Manage deployments → ✏️ → Version: New version → Deploy.

Other modes are still available: `'local'` (saves nothing), `'supabase'` (see `supabase-setup.sql`), `'endpoint'`.

## Before going live

- Replace `https://pyqbundle.com/` with your real domain in `index.html`, `robots.txt`, `sitemap.xml`.
- Add `og-image.png` (1200×630) to the root for link previews.
- Screenshots: in `index.html` (Product Preview), swap a `<div class="phone">…</div>` for
  `<img class="phone-img" src="images/practice.webp" alt="…" loading="lazy">`.
  Only use screens that show public features.

## Analytics (Google Analytics 4)

Paste your Measurement ID into `GA_ID` at the top of `js/main.js`. It is disabled while empty
and never loads on localhost.

Events sent (no personal data):

| Event | When | Params |
|---|---|---|
| `page_view` | automatic | – |
| `cta_click` | a Pre-Register / Early Tester button is clicked | `cta` |
| `pre_register` | registration saved | `early_tester`, `exam`, `duplicate` |
| `form_error` | submission failed | `reason` |

In GA: Admin → Events → mark `pre_register` as a **Key event**. To see the `exam` / `early_tester`
breakdown in reports, add them under Admin → Custom definitions → Custom dimensions (event scope).
