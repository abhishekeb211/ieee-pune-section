/**
 * IEEE Blockchain Pune Section - Metric Counter Engine
 * Uses IntersectionObserver to smoothly trigger numeric counters when scrolled into view
 */

document.addEventListener('DOMContentLoaded', () => {
  initGlanceCounters();
});

function initGlanceCounters() {
  const counterElements = document.querySelectorAll('.glance-number');
  if (!counterElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.25
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  counterElements.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10) || 0;
  const prefix = el.getAttribute('data-prefix') || '';
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2000; // ms
  const frameRate = 1000 / 60; // 60fps
  const totalFrames = Math.round(duration / frameRate);
  let frame = 0;

  const easeOutQuad = t => t * (2 - t);

  const counterInterval = setInterval(() => {
    frame++;
    const progress = easeOutQuad(frame / totalFrames);
    const currentVal = Math.round(target * progress);

    // Format with Indian numbering system or standard commas if > 999
    el.textContent = `${prefix}${currentVal.toLocaleString('en-IN')}${suffix}`;

    if (frame >= totalFrames) {
      clearInterval(counterInterval);
      el.textContent = `${prefix}${target.toLocaleString('en-IN')}${suffix}`;
    }
  }, frameRate);
}
