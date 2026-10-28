/**
 * GuhyaGyan - Core Application Logic & Spiritual Interactive Features
 */

// Sacred Maha-Mantra Library (User Curated)
const SACRED_SUTRAS = [
  {
    sanskrit: "हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे ।\nहरे राम हरे राम राम राम हरे हरे ॥",
    transliteration: "HARE KRSNA HARE KRSNA KRSNA KRSNA HARE HARE\nHARE RAM HARE RAM RAM RAM HARE HARE",
    english: "O Supreme All-Attractive Lord Krishna, O Supreme Blissful Lord Rama, O Divine Energy of the Lord Hare — please engage my soul in Your eternal, loving transcendental service.",
    source: "Kali-Santarana Upanishad • Agni Purana"
  }
];

// Initialize Background Celestial Particle Animation
function initCelestialCanvas() {
  const canvas = document.getElementById('celestial-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const starsCount = Math.floor((width * height) / 10000);
  const stars = [];

  for (let i = 0; i < starsCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      velocity: Math.random() * 0.2 + 0.05,
      color: Math.random() > 0.4 ? '#fbe69b' : (Math.random() > 0.5 ? '#a855f7' : '#5eead4')
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let star of stars) {
      star.y -= star.velocity;
      if (star.y < 0) {
        star.y = height;
        star.x = Math.random() * width;
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.globalAlpha = star.alpha * (0.6 + Math.sin(Date.now() * 0.002 + star.x) * 0.4);
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  render();
}

// Global Toast Notification Helper
window.showToast = function(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '✨';
  if (type === 'success') icon = '✨';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `
    <span style="font-size: 1.3rem;">${icon}</span>
    <span style="font-size: 0.92rem; line-height: 1.4;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px) scale(0.9)';
    setTimeout(() => toast.remove(), 400);
  }, 4200);
};

// Sacred Maha-Mantra Contemplation Handler
function initSutraOracle() {
  const sutraBox = document.getElementById('daily-sutra-box');
  const shuffleBtn = document.getElementById('shuffle-sutra-btn');
  const copyBtn = document.getElementById('copy-sutra-btn');

  if (!sutraBox) return;

  function renderSutra(index) {
    const sutra = SACRED_SUTRAS[index % SACRED_SUTRAS.length];
    const sanskritEl = document.getElementById('sutra-sanskrit');
    const translitEl = document.getElementById('sutra-transliteration');
    const englishEl = document.getElementById('sutra-english');
    const sourceEl = document.getElementById('sutra-source');

    if (sanskritEl) sanskritEl.innerHTML = sutra.sanskrit.replace(/\n/g, '<br>');
    if (translitEl) translitEl.innerHTML = sutra.transliteration.replace(/\n/g, '<br>');
    if (englishEl) englishEl.textContent = `“${sutra.english}”`;
    if (sourceEl) sourceEl.textContent = sutra.source;
  }

  // Load Maha-Mantra initially
  renderSutra(0);

  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      renderSutra(0);
      sutraBox.classList.add('sutra-chant-pulse');
      setTimeout(() => sutraBox.classList.remove('sutra-chant-pulse'), 1200);
      window.showToast('॥ हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे । हरे राम हरे राम राम राम हरे हरे ॥', 'success');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const sanskrit = "हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे ।\nहरे राम हरे राम राम राम हरे हरे ॥";
      const transliteration = "HARE KRSNA HARE KRSNA KRSNA KRSNA HARE HARE\nHARE RAM HARE RAM RAM RAM HARE HARE";
      const text = `${sanskrit}\n\n${transliteration}\n— Kali-Santarana Upanishad (via GuhyaGyan.org)`;
      
      navigator.clipboard.writeText(text).then(() => {
        window.showToast('Sacred Maha-Mantra copied to clipboard.', 'success');
      }).catch(() => {
        window.showToast('Maha-Mantra revered in heart.', 'info');
      });
    });
  }
}

// Pranayama (Box Breathing 4-4-4-4) Guided Visualizer
let pranayamaInterval = null;
let pranayamaActive = false;

function initPranayama() {
  const triggerBtn = document.getElementById('pranayama-toggle-btn');
  const circle = document.getElementById('breath-sphere');
  const instruction = document.getElementById('breath-action-text');
  const timer = document.getElementById('breath-count-text');

  if (!triggerBtn || !circle) return;

  const phases = [
    { name: 'Inhale Prana', class: 'inhale', seconds: 4 },
    { name: 'Retain / Stillness', class: 'hold', seconds: 4 },
    { name: 'Exhale Surrender', class: 'exhale', seconds: 4 },
    { name: 'Sacred Void / Rest', class: 'hold', seconds: 4 }
  ];

  let currentPhaseIndex = 0;
  let remainingSeconds = phases[0].seconds;

  function updateDisplay() {
    const phase = phases[currentPhaseIndex];
    if (instruction) instruction.textContent = phase.name;
    if (timer) timer.textContent = `${remainingSeconds}s`;

    circle.className = `breath-circle ${phase.class}`;
  }

  function tick() {
    remainingSeconds--;
    if (remainingSeconds <= 0) {
      currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
      remainingSeconds = phases[currentPhaseIndex].seconds;
    }
    updateDisplay();
  }

  triggerBtn.addEventListener('click', () => {
    pranayamaActive = !pranayamaActive;
    if (pranayamaActive) {
      currentPhaseIndex = 0;
      remainingSeconds = phases[0].seconds;
      updateDisplay();
      pranayamaInterval = setInterval(tick, 1000);
      triggerBtn.textContent = 'Pause Breathwork';
      triggerBtn.classList.add('btn-primary');
      triggerBtn.classList.remove('btn-outline');
      window.showToast('Pranayama cycle initiated. Synchronize your breath.', 'info');
    } else {
      clearInterval(pranayamaInterval);
      circle.className = 'breath-circle';
      if (instruction) instruction.textContent = 'Ready to Breathe';
      if (timer) timer.textContent = '4-4-4-4';
      triggerBtn.textContent = 'Begin 4-4-4-4 Pranayama';
      triggerBtn.classList.remove('btn-primary');
      triggerBtn.classList.add('btn-outline');
    }
  });
}

// Header Scroll Effect & Mobile Nav
function initNavigation() {
  const header = document.querySelector('.main-header');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      mobileToggle.innerHTML = isOpen ? '✕' : '☰';
    });

    // Auto-close menu when clicking any nav item on mobile
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.innerHTML = '☰';
      });
    });

    // Close when clicking outside menu
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
        navLinks.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.innerHTML = '☰';
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.innerHTML = '☰';
      }
    });
  }
}

// Dynamic Scroll Intersection Observer for Reveal Animations
function initScrollAnimations() {
  const targets = document.querySelectorAll(
    '.reveal-fade-up, .reveal-scale-in, .sacred-card, .speaker-profile-card, .speaker-bio-container, .speaker-domain-card, .studio-card, .sutra-oracle-box, .section-header, .feature-split, .stat-item'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    targets.forEach((el) => {
      if (!el.classList.contains('reveal-fade-up') && !el.classList.contains('reveal-scale-in')) {
        el.classList.add('reveal-fade-up');
      }

      // Automatically compute cascading stagger delay for items inside a grid or bar
      if (el.parentElement && (
        el.parentElement.classList.contains('cards-grid') ||
        el.parentElement.classList.contains('speaker-domains-grid') ||
        el.parentElement.classList.contains('interactive-studio-grid') ||
        el.parentElement.classList.contains('hero-stats-bar')
      )) {
        const index = Array.from(el.parentElement.children).indexOf(el);
        el.style.transitionDelay = `${(index % 6) * 0.12}s`;
      }

      observer.observe(el);
    });
  } else {
    // Fallback if browser doesn't support IntersectionObserver
    targets.forEach(el => el.classList.add('is-revealed'));
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  initCelestialCanvas();
  initNavigation();
  initSutraOracle();
  initPranayama();
  initScrollAnimations();
});
