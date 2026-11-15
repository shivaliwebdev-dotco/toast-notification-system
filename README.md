# Toastly — Accessible Toast Notification System

A responsive, dependency-free toast notification component built with HTML, CSS and vanilla JavaScript. It includes success, error, information and warning states, automatic dismissal, a pauseable progress indicator, manual dismissal, queue management and screen-reader announcements.

## Run it

1. Download or clone this folder.
2. Open `index.html` in a modern browser. No build step or package installation is required.
3. On the demo page, select a toast type or choose **Show stacked toasts**.

For local development, you can also run `python -m http.server 8000` from this folder and visit `http://localhost:8000`.

## Public API

```js
// Show a notification (type defaults to "info").
const toastId = showToast('Your profile was saved.', 'success');

// Optional third argument controls duration in milliseconds (minimum 1000 ms).
const longerToastId = showToast('Still working…', 'info', 8000);

// Dismiss a toast by the id returned from showToast().
dismissToast(toastId);
```

Supported types: `success`, `error`, `info`, `warning`. Unknown types safely fall back to `info`. The message is inserted as text, not HTML.

## Behaviour and implementation notes

- **Queue and stacking:** up to three notifications are visible at once. Additional notifications enter a FIFO queue and appear as soon as a visible toast is dismissed.
- **Auto-dismiss:** each toast has its own timeout and progress bar. The progress bar uses a CSS transform (`scaleX`) rather than repeatedly changing layout dimensions.
- **Pause and resume:** hovering or moving keyboard focus into a toast stores the remaining time and pauses its timer/progress. Leaving resumes from the remaining duration.
- **Manual dismissal:** the close button and `dismissToast(id)` remove a notification. The queue is then advanced.
- **Accessibility:** a separate `role="status"` / `aria-live="polite"` / `aria-atomic="false"` region announces each new message without moving focus. Decorative icons and progress bars are hidden from assistive technology. Toasts are not focus-trapped.
- **Motion:** toasts enter with a short slide-and-fade animation and leave with a smaller slide-and-fade. `prefers-reduced-motion: reduce` minimizes animation and transition durations.
- **Responsive design:** the notification stack is fixed to the bottom-right on larger screens and adapts to the viewport width on mobile.

## Files

- `index.html` — demo page, controls and live region.
- `style.css` — responsive visual design, toast variants and animations.
- `app.js` — public API, timers, queue, pause/resume and dismissal logic.
- `screenshots/` — desktop toast examples, stacked queue and mobile layout evidence.

## Evidence capture

The screenshots in `screenshots/` were captured from the running page at desktop and mobile viewport sizes. Query parameters are used only as repeatable demo shortcuts: `?demo=success`, `?demo=error`, `?demo=info`, `?demo=warning`, `?demo=stack` and `?demo=all`.
