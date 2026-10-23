/**
 * GuhyaGyan - Core Application Logic & Spiritual Interactive Features
 */

// Daily Sacred Sutras Library
const SACRED_SUTRAS = [
  {
    sanskrit: "अयमात्मा ब्रह्म ॥",
    transliteration: "Ayam Ātmā Brahma",
    english: "This inner individual Self is none other than the Infinite Conscious Reality (Brahman).",
    source: "Mandukya Upanishad — 1.2"
  },
  {
    sanskrit: "तत्त्वमसि श्वेताकेतो ॥",
    transliteration: "Tat Tvam Asi, Shvetaketo",
    english: "That Boundless Mystery which permeates all existence — That Thou Art, O Seeker.",
    source: "Chandogya Upanishad — 6.8.7"
  },
  {
    sanskrit: "चित्तमेव हि संसारम् तत्प्रयत्नेन शोधयेत् ॥",
    transliteration: "Chittameva hi samsāram tat prayatnena shodhayet",
    english: "One's own state of mind is the universe itself; let the wise seeker purify mind with reverent diligence.",
    source: "Maitri Upanishad — 4.3"
  },
  {
    sanskrit: "यदा सर्वे प्रमुच्यन्ते कामा येऽस्य हृदि श्रिताः । अथ मर्त्योऽमृतो भवत्यत्र ब्रह्म समश्नुते ॥",
    transliteration: "Yadā sarve pramucyante kāmā ye'sya hṛdi śritāḥ...",
    english: "When all desires clinging to the heart dissolve completely, then the mortal becomes immortal, tasting the Eternal here in this life.",
    source: "Katha Upanishad — 2.3.14"
  },
  {
    sanskrit: "चैतन्यमात्मा ॥",
    transliteration: "Chaitanyam Ātmā",
    english: "Pure, supreme Consciousness alone is the Self.",
    source: "Shiva Sutras — 1.1 (Kashmir Shaivism)"
  },
  {
    sanskrit: "मुक्तिमिच्छसि चेत्तात विषयान् विषवत्त्यज । क्षमार्जवदयातोषसत्यं पीयूषवद्भज ॥",
    transliteration: "Muktim icchasi chet tāta vishayān vishavat tyaja...",
    english: "If you seek true liberation, my friend, cast aside worldly compulsions like poison, and drink compassion, truth, forgiveness, and stillness like nectar.",
    source: "Ashtavakra Gita — 1.2"
  },
  {
    sanskrit: "अहं निर्विकल्पो निराकार रूपो विभुत्वाच्च सर्वत्र सर्वेन्द्रियाणाम् ॥",
    transliteration: "Aham nirvikalpo nirākāra rūpo...",
    english: "I am devoid of concepts, free of physical form; I pervade all sensations throughout the cosmos as boundless bliss and awareness.",
    source: "Nirvana Shatkam — Adi Shankaracharya"
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

// Daily Sutra Contemplation Handler
function initSutraOracle() {
  const sutraBox = document.getElementById('daily-sutra-box');
  const shuffleBtn = document.getElementById('shuffle-sutra-btn');
  const copyBtn = document.getElementById('copy-sutra-btn');

  if (!sutraBox) return;

  function renderSutra(index) {
    const sutra = SACRED_SUTRAS[index % SACRED_SUTRAS.length];
    const sanskritEl = document.getElementById('sutra-sanskrit');
    const englishEl = document.getElementById('sutra-english');
    const sourceEl = document.getElementById('sutra-source');

    if (sanskritEl) sanskritEl.textContent = sutra.sanskrit;
    if (englishEl) englishEl.textContent = `“${sutra.english}”`;
    if (sourceEl) sourceEl.textContent = sutra.source;
  }

  // Load verse based on day of month
  const todayIndex = new Date().getDate();
  renderSutra(todayIndex);

  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      const randomIndex = Math.floor(Math.random() * SACRED_SUTRAS.length);
      renderSutra(randomIndex);
      window.showToast('Another sacred contemplation has revealed itself.', 'success');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const sanskrit = document.getElementById('sutra-sanskrit')?.textContent || '';
      const english = document.getElementById('sutra-english')?.textContent || '';
      const source = document.getElementById('sutra-source')?.textContent || '';
      const text = `${sanskrit}\n${english}\n— ${source}\n(via GuhyaGyan.org)`;
      
      navigator.clipboard.writeText(text).then(() => {
        window.showToast('Sacred Sutra copied to clipboard.', 'success');
      }).catch(() => {
        window.showToast('Copied verse to contemplation memory.', 'info');
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
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
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
