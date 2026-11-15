(() => {
  'use strict';

  const container = document.getElementById('toast-container');
  const announcer = document.getElementById('toast-announcer');
  const MAX_VISIBLE = 3;
  const DEFAULT_DURATION = 5000;
  const TYPES = {
    success: { label: 'Success', icon: '✓', message: 'Your changes have been saved successfully.' },
    error: { label: 'Error', icon: '×', message: 'Something went wrong. Please try again.' },
    info: { label: 'Information', icon: 'i', message: 'A new update is available for your workspace.' },
    warning: { label: 'Warning', icon: '!', message: 'Your session will expire in 5 minutes.' }
  };

  const queue = [];
  const active = new Map();
  let nextId = 1;

  /** Show a toast. Returns its id so callers can dismiss it programmatically. */
  function showToast(message, type = 'info', duration = DEFAULT_DURATION) {
    const safeType = Object.prototype.hasOwnProperty.call(TYPES, type) ? type : 'info';
    const id = nextId++;
    const item = { id, message: String(message), type: safeType, duration: Math.max(1000, Number(duration) || DEFAULT_DURATION) };
    if (active.size < MAX_VISIBLE) mountToast(item);
    else queue.push(item);
    announce(item);
    return id;
  }

  function announce(item) {
    // Clearing first makes repeated identical messages announce reliably.
    announcer.textContent = '';
    window.setTimeout(() => {
      announcer.textContent = `${TYPES[item.type].label}: ${item.message}`;
    }, 30);
  }

  function mountToast(item) {
    const meta = TYPES[item.type];
    const toast = document.createElement('article');
    toast.className = 'toast';
    toast.dataset.type = item.type;
    toast.dataset.id = String(item.id);
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true"><span>${meta.icon}</span></span>
      <div class="toast-content"><span class="toast-label">${meta.label}</span><div class="toast-message"></div></div>
      <button class="toast-close" type="button" aria-label="Dismiss ${meta.label.toLowerCase()} notification">×</button>
      <div class="toast-progress" aria-hidden="true"><div class="toast-progress-fill"></div></div>`;
    // Use textContent for user-provided content to prevent HTML injection.
    toast.querySelector('.toast-message').textContent = item.message;
    container.appendChild(toast);

    const record = { ...item, element: toast, remaining: item.duration, startedAt: Date.now(), timer: null, paused: false };
    active.set(item.id, record);
    startTimer(record);

    toast.querySelector('.toast-close').addEventListener('click', () => dismissToast(item.id));
    toast.addEventListener('mouseenter', () => pauseTimer(record));
    toast.addEventListener('mouseleave', () => resumeTimer(record));
    toast.addEventListener('focusin', () => pauseTimer(record));
    toast.addEventListener('focusout', event => {
      if (!toast.contains(event.relatedTarget)) resumeTimer(record);
    });
  }

  function startTimer(record) {
    if (record.paused || !active.has(record.id)) return;
    record.startedAt = Date.now();
    const fill = record.element.querySelector('.toast-progress-fill');
    fill.style.transition = 'none';
    fill.style.transform = `scaleX(${record.remaining / record.duration})`;
    // Force layout before starting the progress animation.
    void fill.offsetWidth;
    fill.style.transition = `transform ${record.remaining}ms linear`;
    fill.style.transform = 'scaleX(0)';
    record.timer = window.setTimeout(() => dismissToast(record.id), record.remaining);
  }

  function pauseTimer(record) {
    if (record.paused || !active.has(record.id)) return;
    record.paused = true;
    record.remaining = Math.max(0, record.remaining - (Date.now() - record.startedAt));
    window.clearTimeout(record.timer);
    record.element.classList.add('is-paused');
    const fill = record.element.querySelector('.toast-progress-fill');
    fill.style.transition = 'none';
    fill.style.transform = `scaleX(${record.remaining / record.duration})`;
  }

  function resumeTimer(record) {
    if (!record.paused || !active.has(record.id)) return;
    record.paused = false;
    record.element.classList.remove('is-paused');
    startTimer(record);
  }

  function dismissToast(id) {
    const record = active.get(id);
    if (!record) {
      const index = queue.findIndex(item => item.id === id);
      if (index !== -1) queue.splice(index, 1);
      return;
    }
    window.clearTimeout(record.timer);
    active.delete(id);
    record.element.classList.add('is-leaving');
    const remove = () => {
      record.element.removeEventListener('animationend', remove);
      record.element.remove();
      showNext();
    };
    record.element.addEventListener('animationend', remove, { once: true });
    // Reduced-motion styles can make animationend timing inconsistent.
    window.setTimeout(() => { if (record.element.isConnected) remove(); }, 300);
  }

  function showNext() {
    while (queue.length && active.size < MAX_VISIBLE) mountToast(queue.shift());
  }

  document.querySelectorAll('[data-demo]').forEach(button => {
    button.addEventListener('click', () => {
      const type = button.dataset.demo;
      showToast(TYPES[type].message, type);
    });
  });
  document.getElementById('stack-demo').addEventListener('click', () => {
    showToast('Your profile has been updated.', 'success');
    showToast('We could not sync one item.', 'error');
    showToast('A new version is ready to install.', 'info');
    showToast('Your storage is almost full.', 'warning');
    showToast('Five notifications? The queue has you covered.', 'info');
  });

  // Demo-only query hooks make repeatable evidence screenshots easy to capture.
  const params = new URLSearchParams(window.location.search);
  const demo = params.get('demo');
  if (demo === 'stack') document.getElementById('stack-demo').click();
  else if (TYPES[demo]) showToast(TYPES[demo].message, demo);
  else if (demo === 'all') Object.keys(TYPES).forEach(type => showToast(TYPES[type].message, type));

  // Expose a small reusable public API.
  window.showToast = showToast;
  window.dismissToast = dismissToast;
})();
