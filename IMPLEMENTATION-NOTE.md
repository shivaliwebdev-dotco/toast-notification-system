# Short implementation note

I built a reusable toast component using semantic HTML, CSS and vanilla JavaScript. The `showToast(message, type)` function creates a notification, assigns one of four visual states and returns an ID that can be used to dismiss it later. Each toast has a clear text label and a distinct icon treatment, accent colour and shape so meaning is not communicated by colour alone.

A FIFO queue controls the stack: only three notifications can be visible at a time, while later messages wait until a slot becomes available. Every toast owns its timer and progress bar. Hovering or focusing a toast pauses the timer and records the remaining time; leaving resumes it. The close button dismisses a toast immediately and advances the queue.

For accessibility, a dedicated polite live region announces new notifications without stealing keyboard focus. Decorative elements are hidden from screen readers, controls have accessible labels, and reduced-motion preferences are respected. The layout is mobile-first, with the notification stack constrained to the viewport width.
