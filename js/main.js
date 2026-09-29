/* =========================================================
   PYQ Bundle – landing page behaviour
   Content that changes often lives in /site-data.json
   ========================================================= */
(function () {
  'use strict';

  const DATA_URL = 'site-data.json';
  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Analytics (Google Analytics 4) ----------
     Paste your Measurement ID below (GA → Admin → Data streams → Web).
     Leave empty to disable. Not loaded on localhost, so testing doesn't skew numbers. */
  const GA_ID = ''; // e.g. 'G-ABC123XYZ9'

  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname);
  const analyticsOn = /^G-[A-Z0-9]+$/.test(GA_ID) && !isLocal;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  if (analyticsOn) {
    gtag('js', new Date());
    gtag('config', GA_ID);
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.append(s);
  }
  // Single place to send events – swap the body to change provider.
  const track = (name, params) => { if (analyticsOn) gtag('event', name, params || {}); };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-cta]');
    if (el) track('cta_click', { cta: el.dataset.cta });
  });

  /* ---------- Theme toggle ---------- */
  const toggle = $('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') ||
        (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('pyqb-theme', next); } catch (e) { /* ignore */ }
    });
  }

  /* ---------- Navbar border on scroll ---------- */
  const nav = $('#nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- "Join Early Access" pre-ticks the tester checkbox ---------- */
  $$('[data-tester]').forEach((el) =>
    el.addEventListener('click', () => { const cb = $('#f-tester'); if (cb) cb.checked = true; })
  );

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* =========================================================
     Site data (site-data.json)
     ========================================================= */
  const fmt = (n) => Number(n).toLocaleString('en-IN');
  const statText = (s) => (s.prefix || '') + fmt(s.value) + (s.suffix || '');

  async function loadSiteData() {
    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      console.warn('[PYQ Bundle] Could not load ' + DATA_URL + ' – showing fallback content.', err);
      return null;
    }
  }

  function renderStats(stats) {
    const grid = $('#stats-grid');
    if (!grid) return;
    $$('.skeleton', grid).forEach((el) => el.remove());
    const growing = $('.stat-growing', grid);
    stats.forEach((s, i) => {
      const li = document.createElement('li');
      li.className = 'stat-card stat-in';
      li.style.setProperty('--d', i);
      const value = document.createElement('span');
      value.className = 'stat-value';
      value.textContent = statText(s);
      const label = document.createElement('span');
      label.className = 'stat-label';
      label.textContent = s.label;
      li.append(value, label);
      grid.insertBefore(li, growing);
    });
  }

  function renderGrowing(stats) {
    const list = $('#grow-list');
    if (list) {
      list.textContent = '';
      if (!stats.length) {
        const li = document.createElement('li');
        li.className = 'empty';
        li.textContent = 'New papers, questions and subjects are being added continuously.';
        list.append(li);
      }
      stats.forEach((s) => {
        const li = document.createElement('li');
        li.innerHTML = '<span class="v"></span><span class="l"></span>';
        li.children[0].textContent = statText(s);
        li.children[1].textContent = s.label;
        list.append(li);
      });
    }

    // Inline numbers such as <span data-stat="papers">, keyed by "key" in site-data.json
    const byKey = {};
    stats.forEach((s) => { if (s.key) byKey[s.key] = s; });
    $$('[data-stat]').forEach((el) => {
      const s = byKey[el.dataset.stat];
      if (s) el.textContent = statText(s);
    });
    $$('[data-needs]').forEach((el) => {
      const ok = el.dataset.needs.split(',').every((k) => byKey[k.trim()]);
      el.hidden = !ok;
      if (ok) $$('[data-fallback]', el.parentElement).forEach((f) => { f.hidden = true; });
    });
  }

  function renderExams(exams) {
    const select = $('#f-exam');
    if (!select) return;
    const list = exams.map(String).filter(Boolean);
    if (!list.includes('Other')) list.push('Other');
    $$('option', select).slice(1).forEach((o) => o.remove()); // keep placeholder
    list.forEach((name) => select.add(new Option(name, name)));
  }

  function applySiteData(data) {
    const stats = data && Array.isArray(data.stats)
      ? data.stats.filter((s) => s && s.label && isFinite(s.value))
      : [];
    renderStats(stats);
    renderGrowing(stats);
    if (!data) return;

    const setText = (sel, text) => $$(sel).forEach((el) => { el.textContent = text; });
    if (data.product && data.product.status) setText('[data-status]', data.product.status);

    const ea = data.early_access || {};
    if (ea.premium_reward) setText('[data-reward]', ea.premium_reward);
    if (ea.enabled === false) $$('[data-ea]').forEach((el) => { el.hidden = true; });

    if (Array.isArray(data.exams) && data.exams.length) renderExams(data.exams);
  }

  loadSiteData().then(applySiteData);

  /* =========================================================
     Pre-registration form
     ========================================================= */
  const form = $('#register-form');
  if (!form) return;

  const f = {
    name: $('#f-name'),
    email: $('#f-email'),
    phone: $('#f-phone'),
    exam: $('#f-exam'),
    examOther: $('#f-exam-other'),
    tester: $('#f-tester'),
    message: $('#f-message'),
    company: $('#f-company')
  };
  const alertBox = $('#form-alert');
  const submitBtn = $('#submit-btn');
  const successEl = $('#register-success');
  const otherField = $('#exam-other-field');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  let busy = false;

  f.exam.addEventListener('change', () => { otherField.hidden = f.exam.value !== 'Other'; });

  const cleanPhone = (v) => v.replace(/[\s\-()]/g, '');

  function validate() {
    const errors = {};
    const name = f.name.value.trim();
    const email = f.email.value.trim();
    const phone = cleanPhone(f.phone.value.trim());

    if (name.length < 2) errors.name = 'Please enter your name.';
    if (!email) errors.email = 'Please enter your email.';
    else if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';
    if (phone && !/^\+?\d{10,13}$/.test(phone)) errors.phone = 'Please enter a valid phone number, or leave it empty.';
    if (!f.exam.value) errors.exam = 'Please choose the exam you are preparing for.';
    return errors;
  }

  function setError(field, msg) {
    const input = f[field];
    const err = $('#e-' + field);
    if (!input || !err) return;
    err.textContent = msg || '';
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  ['name', 'email', 'phone', 'exam'].forEach((key) => {
    const clear = () => { if (f[key].getAttribute('aria-invalid')) setError(key, ''); };
    f[key].addEventListener('input', clear);
    f[key].addEventListener('change', clear);
  });

  let slowTimer;
  function setLoading(on) {
    busy = on;
    submitBtn.disabled = on;
    submitBtn.classList.toggle('is-loading', on);
    const label = $('.btn-text', submitBtn);
    label.textContent = on ? 'Registering…' : 'Pre-Register Free';
    clearTimeout(slowTimer);
    if (on) slowTimer = setTimeout(() => { label.textContent = 'Still saving, please wait…'; }, 5000);
  }

  function showAlert(msg) {
    alertBox.textContent = msg;
    alertBox.hidden = !msg;
  }

  function showSuccess(isTester, duplicate) {
    form.hidden = true;
    $('#success-tester').hidden = !isTester;
    $('#success-duplicate').hidden = !duplicate;
    successEl.hidden = false;
    successEl.focus({ preventScroll: true });
    successEl.closest('.form-card').scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    showAlert('');

    // Bots fill the hidden field – pretend it worked and send nothing.
    if (f.company.value) { showSuccess(false, false); return; }

    const errors = validate();
    ['name', 'email', 'phone', 'exam'].forEach((k) => setError(k, errors[k]));
    const firstInvalid = ['name', 'email', 'phone', 'exam'].find((k) => errors[k]);
    if (firstInvalid) { f[firstInvalid].focus(); return; }

    const examOther = f.examOther.value.trim();
    const data = {
      name: f.name.value.trim(),
      email: f.email.value.trim().toLowerCase(),
      phone: cleanPhone(f.phone.value.trim()) || null,
      exam: f.exam.value === 'Other' && examOther ? 'Other: ' + examOther : f.exam.value,
      early_tester: !!(f.tester && f.tester.checked),
      message: f.message.value.trim() || null,
      source: 'landing'
    };

    setLoading(true);
    try {
      const result = await window.submitPreRegistration(data);
      const duplicate = !!(result && result.duplicate);
      // No name/email/phone is ever sent to analytics.
      track('pre_register', { early_tester: data.early_tester, exam: f.exam.value, duplicate });
      showSuccess(data.early_tester, duplicate);
    } catch (err) {
      track('form_error', { reason: 'submit_failed' });
      console.error('[PYQ Bundle] Pre-registration failed:', err);
      showAlert(err && err.name === 'AbortError'
        ? 'This is taking longer than usual. Please try again. If your details were already saved, we’ll recognise your email.'
        : 'Something went wrong and we couldn’t save your registration. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  });
})();
