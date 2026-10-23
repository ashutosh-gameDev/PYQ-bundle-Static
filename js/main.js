/* =========================================================
   PYQ Bundle – landing page behaviour
   Content that changes often lives in /site-data.json
   ========================================================= */
(function () {
  'use strict';

  const DATA_URL = new URL('../site-data.json', document.currentScript ? document.currentScript.src : location.href).href;
  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Analytics (Google Analytics 4) ----------
     Paste your Measurement ID below (GA → Admin → Data streams → Web).
     Leave empty to disable. Not loaded on localhost, so testing doesn't skew numbers. */
  const GA_ID = 'G-BJ2V7227ES';

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
  // "display" (e.g. "1.5 Lakh+") overrides the formatted number when present
  const statText = (s) => s.display || ((s.prefix || '') + fmt(s.value) + (s.suffix || ''));
  const isHttpsUrl = (u) => typeof u === 'string' && /^https:\/\//.test(u);

  async function loadSiteData() {
    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      console.warn('[PYQ Bundle] Could not load ' + DATA_URL + ' – showing default content.', err);
      return null;
    }
  }

  function renderStats(stats) {
    const grid = $('#stats-grid');
    if (!grid) return;
    $$('.skeleton', grid).forEach((el) => el.remove());
    if (!stats.length) { grid.closest('section').hidden = true; return; }
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
      grid.append(li);
    });
    // Inline numbers such as <span data-stat="papers">, keyed by "key" in site-data.json
    const byKey = {};
    stats.forEach((s) => { if (s.key) byKey[s.key] = s; });
    $$('[data-stat]').forEach((el) => { const s = byKey[el.dataset.stat]; if (s) el.textContent = statText(s); });
  }

  function renderExams(exams) {
    const select = $('#f-exam');
    if (!select) return;
    const list = exams.map(String).filter(Boolean);
    if (!list.includes('Other')) list.push('Other');
    $$('option', select).slice(1).forEach((o) => o.remove()); // keep placeholder
    list.forEach((name) => select.add(new Option(name, name)));
  }

  /* ---------- Links: web app + Google Play ---------- */
  function applyLinks(links) {
    if (isHttpsUrl(links.web_app)) {
      $$('[data-link="web_app"]').forEach((a) => { a.href = links.web_app; });
    }
    const play = links.play_store;
    if (!isHttpsUrl(play) || !/^https:\/\/play\.google\.com\//.test(play)) return; // stays "coming soon"

    $$('[data-play]').forEach((a) => {
      a.href = play;
      a.rel = 'noopener';
      a.classList.remove('is-soon');
      a.removeAttribute('aria-disabled');
      const label = $('[data-play-label]', a); if (label) label.textContent = 'Download for Android';
      const sub = $('[data-play-sub]', a); if (sub) sub.textContent = 'Get it on Google Play';
    });
    $$('[data-play-badge]').forEach((a) => { a.href = play; a.hidden = false; });
    $$('[data-play-href]').forEach((a) => { a.href = play; });
    $$('[data-play-soon]').forEach((el) => { el.hidden = true; });
    $$('[data-play-live]').forEach((el) => { el.hidden = false; });
    renderQr(play);
  }

  // The QR library (~20 KB) loads only when a Play URL exists, after the page has loaded.
  function renderQr(url) {
    const card = $('#qr-card');
    const box = $('#qr');
    if (!card || !box) return;
    const draw = () => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
      s.async = true;
      s.onload = () => {
        try {
          const qr = window.qrcode(0, 'M');
          qr.addData(url);
          qr.make();
          box.innerHTML = qr.createSvgTag(4, 2);
          card.hidden = false;
        } catch (e) { console.warn('[PYQ Bundle] QR code failed', e); }
      };
      document.head.append(s);
    };
    if (document.readyState === 'complete') draw();
    else window.addEventListener('load', draw, { once: true });
  }

  /* ---------- Screenshots (real app screenshots listed in site-data.json) ---------- */
  function phoneWithImage(shot, eager) {
    const phone = document.createElement('div');
    phone.className = 'phone';
    const img = document.createElement('img');
    img.className = 'phone-img';
    img.src = new URL(shot.src, DATA_URL).href;
    img.alt = shot.alt || ('PYQ Bundle ' + (shot.label || 'app') + ' screen');
    img.width = 270; img.height = 555;
    img.decoding = 'async';
    if (!eager) img.loading = 'lazy';
    phone.append(img);
    return phone;
  }

  function renderScreenshots(shots) {
    const valid = shots.filter((s) => s && typeof s.src === 'string' && s.src);
    const hero = valid.find((s) => s.hero);
    const device = $('#hero-device');
    if (hero && device) {
      const phone = phoneWithImage(hero, true);
      phone.classList.add('phone-hero');
      device.replaceChildren(phone);
    }
    const wrap = $('#shots');
    if (!wrap || !valid.length) return;
    valid.forEach((s) => {
      const fig = document.createElement('figure');
      fig.className = 'shot';
      fig.append(phoneWithImage(s, false));
      const cap = document.createElement('figcaption');
      const strong = document.createElement('strong');
      strong.textContent = s.label || '';
      cap.append(strong);
      if (s.caption) { const span = document.createElement('span'); span.textContent = s.caption; cap.append(span); }
      fig.append(cap);
      wrap.append(fig);
    });
    $('#preview').hidden = false;
  }

  /* ---------- Feature status: "coming_soon" adds a tag, "hidden" removes the card ---------- */
  function applyFeatures(features) {
    Object.keys(features).forEach((key) => {
      const card = $('[data-feature="' + key + '"]');
      if (!card) return;
      if (features[key] === 'hidden') card.hidden = true;
      if (features[key] === 'coming_soon' && !$('.soon-tag', card)) {
        const tag = document.createElement('span');
        tag.className = 'soon-tag';
        tag.textContent = 'Coming soon';
        $('h3', card).append(tag);
      }
    });
  }

  function applySiteData(data) {
    const stats = data && Array.isArray(data.stats)
      ? data.stats.filter((s) => s && s.label && isFinite(s.value))
      : [];
    renderStats(stats);
    if (!data) return;

    const setText = (sel, text) => $$(sel).forEach((el) => { el.textContent = text; });
    if (data.product && data.product.status) setText('[data-status]', data.product.status);

    applyLinks(data.links || {});
    if (Array.isArray(data.screenshots)) renderScreenshots(data.screenshots);
    if (data.features && typeof data.features === 'object') applyFeatures(data.features);

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
  const submitLabel = $('.btn-text', $('#submit-btn')).textContent;

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
    label.textContent = on ? 'Saving…' : submitLabel;
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
    const updates = $('#success-updates');
    if (updates) updates.hidden = isTester;
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
      source: 'website'
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
