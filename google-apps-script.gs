/**
 * PYQ Bundle – pre-registrations → Google Sheet
 * ------------------------------------------------
 * Paste this whole file into: your Google Sheet → Extensions → Apps Script
 * Then: Deploy → New deployment → Web app
 *       Execute as: Me   |   Who has access: Anyone
 * Copy the Web app URL (ends in /exec) into js/register.js → BACKEND.sheets.url
 *
 * ⚠️ After editing this script, redeploy: Deploy → Manage deployments → ✏️ →
 *    Version: "New version" → Deploy. (The URL stays the same.)
 */

const SHEET_NAME = 'Registrations';
const HEADERS = ['Timestamp', 'Name', 'Email', 'Phone', 'Exam', 'Early Tester', 'Message', 'Source'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // one write at a time → no duplicate rows from double clicks

    const data = JSON.parse(e.postData.contents);
    const name = clean(data.name, 100);
    const email = clean(data.email, 254).toLowerCase();
    const exam = clean(data.exam, 80);

    if (name.length < 2 || !EMAIL_RE.test(email) || !exam) {
      return json({ ok: false, error: 'invalid' });
    }

    const sheet = getSheet();

    // Already registered? (case-insensitive match on the Email column)
    const found = sheet.getRange('C:C')
      .createTextFinder(email)
      .matchEntireCell(true)
      .matchCase(false)
      .findNext();
    if (found) return json({ ok: true, duplicate: true });

    sheet.appendRow([
      new Date(),
      safe(name),
      safe(email),
      safe(clean(data.phone, 20)),
      safe(exam),
      data.early_tester === true ? 'Yes' : 'No',
      safe(clean(data.message, 1000)),
      safe(clean(data.source, 40))
    ]);

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
  return json({ ok: true, service: 'PYQ Bundle pre-registration' });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function clean(value, max) {
  return value == null ? '' : String(value).trim().slice(0, max);
}

// Stop values like "=HYPERLINK(...)" or "+91..." being treated as formulas.
function safe(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
