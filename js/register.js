/* =========================================================
   PYQ Bundle – pre-registration backend adapter
   ---------------------------------------------------------
   The page calls  submitPreRegistration(data)  and expects it to:
     • resolve { ok: true }                   → saved
     • resolve { ok: true, duplicate: true }  → email already registered
     • throw an Error                         → form shows the error state

   Pick where submissions go by editing BACKEND below.

   ⚠️ This file is PUBLIC. Only ever put the Supabase *anon* (public) key
      here – NEVER the service_role key. Protect the table with RLS
      (see supabase-setup.sql).
   ========================================================= */

const BACKEND = {
  // 'sheets'   → Google Sheet via Apps Script (see google-apps-script.gs)
  // 'local'    → nothing is sent anywhere (for development / preview)
  // 'supabase' → inserts into a Supabase table via the REST API
  // 'endpoint' → POSTs JSON to any URL you control
  mode: 'sheets',

  sheets: {
    url: 'https://script.google.com/macros/s/AKfycbwbWLncVrOOvzmEk82AlKL2Bb9QpFfoRJluwT9gvI1LUaX6JZFACNOfm1dGeET_FWnZlQ/exec' // Apps Script Web app URL, e.g. 'https://script.google.com/macros/s/AKfy…/exec'
  },

  supabase: {
    url: '',            // e.g. 'https://abcdxyz.supabase.co'
    anonKey: '',        // public anon key
    table: 'pre_registrations'
  },

  endpoint: {
    url: ''             // e.g. 'https://api.example.com/pre-register'
  },

  timeoutMs: 45000 // Apps Script can take 10–20 s when it has been idle
};

(function () {
  'use strict';

  console.info('[PYQ Bundle] register.js v5 – sending registrations to:', BACKEND.mode);

  const SEEN_KEY = 'pyqb-registered-v2'; // bump to forget emails remembered by older versions

  // Remembers emails already submitted from this browser, so a double-click
  // or a second visit doesn't create a duplicate row.
  function seenEmails() {
    try { return JSON.parse(localStorage.getItem(SEEN_KEY)) || []; } catch (e) { return []; }
  }
  function rememberEmail(email) {
    try {
      const list = seenEmails();
      if (!list.includes(email)) list.push(email);
      localStorage.setItem(SEEN_KEY, JSON.stringify(list.slice(-20)));
    } catch (e) { /* storage unavailable – ignore */ }
  }

  async function postJSON(url, body, headers) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), BACKEND.timeoutMs);
    try {
      return await fetch(url, {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
        body: JSON.stringify(body),
        signal: ctrl.signal
      });
    } finally {
      clearTimeout(timer);
    }
  }

  const senders = {
    async local(data) {
      console.info('[PYQ Bundle] Local mode – registration NOT sent anywhere:', data);
      await new Promise((r) => setTimeout(r, 700));
      return { ok: true };
    },

    async sheets(data) {
      const { url } = BACKEND.sheets;
      if (!url) throw new Error('Google Sheets URL is not configured in js/register.js (BACKEND.sheets.url)');
      const body = JSON.stringify(data); // text/plain on purpose: Apps Script can't answer CORS preflight
      const send = async (opts) => {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), BACKEND.timeoutMs);
        try {
          return await fetch(url, Object.assign({ method: 'POST', body, signal: ctrl.signal }, opts));
        } finally {
          clearTimeout(timer);
        }
      };

      // 1) Normal request – lets us read the reply (duplicate / invalid).
      let out;
      try {
        const res = await send();
        if (!res.ok) throw new Error(`Sheets reply HTTP ${res.status}`);
        out = await res.json();
      } catch (err) {
        if (err.name === 'AbortError') throw err;
        // 2) Apps Script runs the script first, then redirects to a googleusercontent.com
        //    "echo" URL for the reply. Some browsers/extensions/networks break that second
        //    step (404 / CORS) even though the row was saved. Re-send without reading the
        //    reply; the script ignores duplicate emails, so this can't create a second row.
        console.warn('[PYQ Bundle] Could not read Sheets reply, re-sending in no-cors mode:', err);
        await send({ mode: 'no-cors' });
        return { ok: true };
      }
      if (!out.ok) throw new Error(`Sheets rejected submission: ${out.error}`);
      return { ok: true, duplicate: !!out.duplicate };
    },

    async supabase(data) {
      const { url, anonKey, table } = BACKEND.supabase;
      if (!url || !anonKey) throw new Error('Supabase is not configured in js/register.js');
      const res = await postJSON(`${url.replace(/\/$/, '')}/rest/v1/${table}`, data, {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Prefer: 'return=minimal'
      });
      if (res.status === 409) return { ok: true, duplicate: true }; // unique email violation
      if (!res.ok) throw new Error(`Supabase error ${res.status}`);
      return { ok: true };
    },

    async endpoint(data) {
      if (!BACKEND.endpoint.url) throw new Error('Endpoint URL is not configured in js/register.js');
      const res = await postJSON(BACKEND.endpoint.url, data);
      if (res.status === 409) return { ok: true, duplicate: true };
      if (!res.ok) throw new Error(`Endpoint error ${res.status}`);
      return { ok: true };
    }
  };

  /**
   * @param {{name:string,email:string,phone:string|null,exam:string,
   *          early_tester:boolean,message:string|null,source:string}} data
   */
  window.submitPreRegistration = async function submitPreRegistration(data) {
    if (seenEmails().includes(data.email)) return { ok: true, duplicate: true };

    const send = senders[BACKEND.mode];
    if (!send) throw new Error(`Unknown BACKEND.mode "${BACKEND.mode}"`);

    const result = await send(data);
    if (BACKEND.mode !== 'local') rememberEmail(data.email); // test mode saves nothing, so don't block a real submit later
    return result;
  };
})();
