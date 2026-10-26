/* =========================================================
   PYQ Bundle – careers application form (careers.html)
   Sends to the same Google Sheet as before via js/register.js;
   the Apps Script puts these rows in the "Careers" tab.
   ========================================================= */
(function () {
  'use strict';

  const ROLE = 'Data Entry Freelancer';
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const track = (name, params) => { if (window.pyqbTrack) window.pyqbTrack(name, params); };

  const form = $('#career-form');
  if (!form) return;

  const f = {
    name: $('#c-name'), email: $('#c-email'), phone: $('#c-phone'), city: $('#c-city'),
    hours: $('#c-hours'), experience: $('#c-experience'), link: $('#c-link'),
    consent: $('#c-consent'), company: $('#c-company'),
  };
  const ERROR_FOR = { name: 'name', email: 'email', phone: 'phone', city: 'city', hours: 'hours', link: 'link', consent: 'consent' };
  const alertBox = $('#form-alert');
  const submitBtn = $('#submit-btn');
  const submitLabel = $('.btn-text', submitBtn).textContent;
  const successEl = $('#career-success');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const cleanPhone = (v) => v.replace(/[\s\-()]/g, '');
  const checked = (name) => $$(`input[name="${name}"]:checked`, form).map((i) => i.value);
  let busy = false;

  function validate() {
    const errors = {};
    if (f.name.value.trim().length < 2) errors.name = 'Please enter your full name.';
    const email = f.email.value.trim();
    if (!email) errors.email = 'Please enter your email.';
    else if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';
    const phone = cleanPhone(f.phone.value.trim());
    if (!phone) errors.phone = 'Please enter your phone or WhatsApp number.';
    else if (!/^\+?\d{10,13}$/.test(phone)) errors.phone = 'Please enter a valid phone number.';
    if (f.city.value.trim().length < 2) errors.city = 'Please enter your city and state.';
    if (!checked('languages').length) errors.languages = 'Choose at least one language you can read.';
    if (!f.hours.value) errors.hours = 'Please choose your weekly availability.';
    const link = f.link.value.trim();
    if (link && !/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(link)) errors.link = 'Please enter a valid link, or leave it empty.';
    if (!f.consent.checked) errors.consent = 'Please confirm we can contact you about this role.';
    return errors;
  }

  function setError(key, msg) {
    const err = $('#e-' + key);
    if (err) err.textContent = msg || '';
    const input = f[key];
    if (!input) return;
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  Object.keys(ERROR_FOR).forEach((key) => {
    const clear = () => setError(key, '');
    f[key].addEventListener('input', clear);
    f[key].addEventListener('change', clear);
  });
  $$('input[name="languages"]', form).forEach((i) => i.addEventListener('change', () => setError('languages', '')));

  let slowTimer;
  function setLoading(on) {
    busy = on;
    submitBtn.disabled = on;
    submitBtn.classList.toggle('is-loading', on);
    const label = $('.btn-text', submitBtn);
    label.textContent = on ? 'Sending…' : submitLabel;
    clearTimeout(slowTimer);
    if (on) slowTimer = setTimeout(() => { label.textContent = 'Still sending, please wait…'; }, 5000);
  }

  function showAlert(msg) {
    alertBox.textContent = msg;
    alertBox.hidden = !msg;
  }

  function showSuccess(duplicate) {
    form.hidden = true;
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
    if (f.company.value) { showSuccess(false); return; }

    const errors = validate();
    ['name', 'email', 'phone', 'city', 'languages', 'hours', 'link', 'consent'].forEach((k) => setError(k, errors[k]));
    const first = Object.keys(errors)[0];
    if (first) {
      const el = f[first] || $(`input[name="${first}"]`, form);
      if (el) el.focus();
      return;
    }

    const languages = checked('languages');
    const exams = checked('exams');
    const data = {
      type: 'career',
      role: ROLE,
      name: f.name.value.trim(),
      email: f.email.value.trim().toLowerCase(),
      phone: cleanPhone(f.phone.value.trim()),
      city: f.city.value.trim(),
      languages,
      exams,
      hours: f.hours.value,
      experience: f.experience.value.trim() || null,
      link: f.link.value.trim() || null,
      source: 'careers',
      // Readable fallback if the Sheet still runs the older script (lands in "Registrations")
      exam: 'CAREER – ' + ROLE,
      early_tester: false,
      message: `${f.city.value.trim()} | ${languages.join('/')} | ${f.hours.value} | exams: ${exams.join(', ') || '-'}`,
    };

    setLoading(true);
    try {
      const result = await window.submitPreRegistration(data);
      const duplicate = !!(result && result.duplicate);
      track('career_apply', { role: ROLE, duplicate }); // no personal data sent to analytics
      showSuccess(duplicate);
    } catch (err) {
      track('form_error', { reason: 'career_submit_failed' });
      console.error('[PYQ Bundle] Application failed:', err);
      showAlert(err && err.name === 'AbortError'
        ? 'This is taking longer than usual. Please try again. If your application was already saved, we’ll recognise your email.'
        : 'Something went wrong and we couldn’t send your application. Please check your connection and try again, or email pyqbundle@gmail.com.');
    } finally {
      setLoading(false);
    }
  });
})();
