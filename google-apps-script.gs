/**
 * PYQ Bundle – website forms → Google Sheet
 * ------------------------------------------------
 * Paste this whole file into: your Google Sheet → Extensions → Apps Script
 * Then: Deploy → New deployment → Web app
 *       Execute as: Me   |   Who has access: Anyone
 * Copy the Web app URL (ends in /exec) into js/register.js → BACKEND.sheets.url
 *
 * ⚠️ After editing this script, redeploy: Deploy → Manage deployments → ✏️ →
 *    Version: "New version" → Deploy. (The URL stays the same.)
 *
 * Tabs:
 *   "Careers"        – job applications from careers.html   (data.type === "career")
 *   "Registrations"  – older pre-registration / tester sign-ups (kept as they are)
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FORMS = {
  career: {
    sheet: 'Careers',
    headers: ['Timestamp', 'Name', 'Email', 'Phone', 'City / State', 'Role', 'Exams', 'Languages',
              'Typing speed', 'Hours per week', 'Experience', 'Link', 'Source'],
    validate: (d) => d.name.length >= 2 && EMAIL_RE.test(d.email) && d.phone && d.role,
    row: (d, raw) => [
      new Date(), d.name, d.email, d.phone, clean(raw.city, 80), d.role,
      list(raw.exams), list(raw.languages), clean(raw.typing_speed, 30), clean(raw.hours, 30),
      clean(raw.experience, 1500), clean(raw.link, 300), clean(raw.source, 40),
    ],
  },
  registration: {
    sheet: 'Registrations',
    headers: ['Timestamp', 'Name', 'Email', 'Phone', 'Exam', 'Early Tester', 'Message', 'Source'],
    validate: (d) => d.name.length >= 2 && EMAIL_RE.test(d.email) && d.exam,
    row: (d, raw) => [
      new Date(), d.name, d.email, d.phone, d.exam, raw.early_tester === true ? 'Yes' : 'No',
      clean(raw.message, 1000), clean(raw.source, 40),
    ],
  },
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // one write at a time → no duplicate rows from double clicks

    const raw = JSON.parse(e.postData.contents);
    const form = FORMS[raw.type === 'career' ? 'career' : 'registration'];
    const d = {
      name: clean(raw.name, 100),
      email: clean(raw.email, 254).toLowerCase(),
      phone: clean(raw.phone, 20),
      exam: clean(raw.exam, 80),
      role: clean(raw.role, 80),
    };
    if (!form.validate(d)) return json({ ok: false, error: 'invalid' });

    const sheet = getSheet(form.sheet, form.headers);

    // One entry per email in each tab (case-insensitive match on the Email column)
    const found = sheet.getRange('C:C')
      .createTextFinder(d.email)
      .matchEntireCell(true)
      .matchCase(false)
      .findNext();
    if (found) return json({ ok: true, duplicate: true });

    sheet.appendRow(form.row(d, raw).map(safe));
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }
}

// Opening the /exec URL in a browser shows this – handy to check the deployment works.
function doGet() {
  return json({ ok: true, service: 'PYQ Bundle forms', forms: Object.keys(FORMS) });
}

function getSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function clean(value, max) {
  return value == null ? '' : String(value).trim().slice(0, max);
}

function list(value) {
  return Array.isArray(value) ? value.map((v) => clean(v, 60)).filter(String).join(', ').slice(0, 500) : clean(value, 500);
}

// Stop values like "=HYPERLINK(...)" or "+91..." being treated as formulas.
function safe(value) {
  return typeof value === 'string' && /^[=+\-@]/.test(value) ? "'" + value : value;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
