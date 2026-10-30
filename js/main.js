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

    // Dropdown header handling: clicking parent dropdown header never navigates away; toggles menu
    navLinks.querySelectorAll('.dropdown-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const parent = toggle.closest('.nav-item-dropdown');
        if (parent) {
          const wasOpen = parent.classList.contains('open');
          // Close all other dropdowns
          document.querySelectorAll('.nav-item-dropdown.open').forEach(d => {
            if (d !== parent) d.classList.remove('open');
          });
          parent.classList.toggle('open', !wasOpen);
        }
      });
    });

    // Auto-close dropdown & menu when clicking any actual option item
    navLinks.querySelectorAll('a:not(.dropdown-toggle)').forEach(link => {
      link.addEventListener('click', () => {
        document.querySelectorAll('.nav-item-dropdown.open').forEach(d => d.classList.remove('open'));
        if (window.innerWidth <= 992) {
          navLinks.classList.remove('open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileToggle.innerHTML = '☰';
        }
      });
    });

    // Close when clicking outside dropdowns or mobile menu
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-item-dropdown')) {
        document.querySelectorAll('.nav-item-dropdown.open').forEach(d => d.classList.remove('open'));
      }
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

  // Instant Spotlight Search (Ctrl/Cmd + K or Click on Search Button)
  const searchTrigger = document.getElementById('nav-search-trigger');
  
  function openSearchModal() {
    let modal = document.getElementById('spotlight-search-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'spotlight-search-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-dialog" style="max-width: 580px; padding: 1.5rem; background: rgba(18, 8, 4, 0.95); border: 1px solid var(--border-gold); box-shadow: 0 25px 60px rgba(0,0,0,0.9);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.3rem;">🔍</span>
              <h3 style="font-size: 1.15rem; color: #fff; margin: 0; font-family: var(--font-serif);">Search Sacred Wisdom</h3>
            </div>
            <button class="btn btn-ghost" style="padding: 0.2rem 0.6rem; font-size: 1.1rem; border-radius: 8px;" onclick="document.getElementById('spotlight-search-modal').classList.remove('active')">✕</button>
          </div>
          <div class="input-with-icon" style="margin-bottom: 1.25rem;">
            <span class="input-icon">✨</span>
            <input type="text" id="spotlight-search-input" class="form-input" placeholder="Type scriptures, live class, katha, speaker..." autofocus>
          </div>
          <div id="spotlight-search-results" style="max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem;">
            <a href="index.html#harinama-chintamani" class="search-result-item" style="padding: 0.75rem 1rem; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); text-decoration: none; color: #fff; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: var(--gold-light);">🔴 Harinama Chintamani Live Class</strong>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.2rem 0 0;">Mon–Fri 8:30 PM IST with HG Vraj Kishor Das</p>
              </div>
              <span style="color: var(--gold-primary); font-size: 0.85rem;">Jump →</span>
            </a>
            <a href="about-the-speaker.html" class="search-result-item" style="padding: 0.75rem 1rem; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); text-decoration: none; color: #fff; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: var(--gold-light);">About the Speaker — HG Vraj Kishor Das</strong>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.2rem 0 0;">AIR 24 GATE Philosophy • BITS Pilani • Ex-Cisco</p>
              </div>
              <span style="color: var(--gold-primary); font-size: 0.85rem;">Read →</span>
            </a>
            <a href="index.html#sutra-oracle" class="search-result-item" style="padding: 0.75rem 1rem; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); text-decoration: none; color: #fff; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: var(--gold-light);">Daily Maha-Mantra Sutra Oracle</strong>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.2rem 0 0;">Sacred contemplation from Kali-Santarana Upanishad</p>
              </div>
              <span style="color: var(--gold-primary); font-size: 0.85rem;">Chant →</span>
            </a>
            <a href="contact.html" class="search-result-item" style="padding: 0.75rem 1rem; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); text-decoration: none; color: #fff; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: var(--gold-light);">Contact Guhya Gyan Foundation</strong>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.2rem 0 0;">Aligarh, UP • connect@guhyagyan.com • +91 9258139922</p>
              </div>
              <span style="color: var(--gold-primary); font-size: 0.85rem;">Connect →</span>
            </a>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });

      const input = modal.querySelector('#spotlight-search-input');
      input?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        modal.querySelectorAll('.search-result-item').forEach(res => {
          const text = res.textContent.toLowerCase();
          res.style.display = text.includes(query) ? 'flex' : 'none';
        });
      });
    }

    modal.classList.add('active');
    setTimeout(() => {
      document.getElementById('spotlight-search-input')?.focus();
    }, 100);
  }

  if (searchTrigger) {
    searchTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      openSearchModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearchModal();
    }
    if (e.key === 'Escape') {
      const modal = document.getElementById('spotlight-search-modal');
      if (modal && modal.classList.contains('active')) modal.classList.remove('active');
    }
  });
}

// Dynamic Scroll Intersection Observer for Reveal Animations
function initScrollAnimations() {
  const targets = document.querySelectorAll(
    '.reveal-fade-up, .reveal-scale-in, .sacred-card, .experience-card, .speaker-profile-card, .speaker-bio-container, .speaker-domain-card, .studio-card, .sutra-oracle-box, .section-header, .feature-split, .stat-item'
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
        el.parentElement.classList.contains('experience-grid') ||
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

// ==========================================================================
// Harinama Chintamani Ongoing Live Class Features
// Organizer: Brajdhama Bhakti Kendra | Speaker: HG Vraj Kishor Das
// Schedule: Monday to Friday • 8:30 PM - 9:00 PM IST • Online via Zoom
// ==========================================================================

function initLiveClassTimer() {
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');
  const statusBadge = document.getElementById('live-session-status-badge');
  const statusText = document.getElementById('live-status-badge-text');
  const headingText = document.getElementById('countdown-status-text');

  if (!hoursEl || !minutesEl || !secondsEl) return;

  function updateTimer() {
    // Current UTC time converted to IST (UTC + 5:30)
    const nowUtc = new Date().getTime();
    const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
    const nowIst = new Date(nowUtc + istOffsetMs);

    const istDay = nowIst.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
    const istHours = nowIst.getUTCHours();
    const istMinutes = nowIst.getUTCMinutes();
    const istSeconds = nowIst.getUTCSeconds();

    const isWeekday = istDay >= 1 && istDay <= 5;
    const currentMinutesFromMidnight = istHours * 60 + istMinutes;
    const startMinutes = 20 * 60 + 30; // 8:30 PM IST (1230 mins)
    const endMinutes = 21 * 60;        // 9:00 PM IST (1260 mins)

    // Check if class is currently live
    if (isWeekday && currentMinutesFromMidnight >= startMinutes && currentMinutesFromMidnight < endMinutes) {
      if (statusBadge) {
        statusBadge.style.background = 'rgba(239, 68, 68, 0.22)';
        statusBadge.style.borderColor = 'rgba(239, 68, 68, 0.6)';
        statusBadge.style.color = '#fca5a5';
      }
      if (statusText) statusText.innerHTML = '🔴 LIVE RIGHT NOW • Class in Session!';
      if (headingText) headingText.innerHTML = 'Session in progress! Concludes in:';

      const remainingSeconds = (endMinutes * 60) - (currentMinutesFromMidnight * 60 + istSeconds);
      const remMins = Math.floor(remainingSeconds / 60);
      const remSecs = remainingSeconds % 60;

      hoursEl.textContent = '00';
      minutesEl.textContent = String(remMins).padStart(2, '0');
      secondsEl.textContent = String(remSecs).padStart(2, '0');
      return;
    }

    // Otherwise calculate next session
    let targetDay = istDay;
    let daysToAdd = 0;

    if (isWeekday) {
      if (currentMinutesFromMidnight < startMinutes) {
        daysToAdd = 0; // Today
      } else {
        // Today's class finished
        daysToAdd = (istDay === 5) ? 3 : 1; // If Friday, next is Monday (+3)
      }
    } else if (istDay === 6) {
      daysToAdd = 2; // Saturday -> Monday
    } else if (istDay === 0) {
      daysToAdd = 1; // Sunday -> Monday
    }

    const nextTargetIst = new Date(nowIst);
    nextTargetIst.setUTCDate(nextTargetIst.getUTCDate() + daysToAdd);
    nextTargetIst.setUTCHours(20, 30, 0, 0); // 8:30 PM

    const diffMs = nextTargetIst.getTime() - nowIst.getTime();
    if (diffMs > 0) {
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      hoursEl.textContent = String(hours).padStart(2, '0');
      minutesEl.textContent = String(minutes).padStart(2, '0');
      secondsEl.textContent = String(seconds).padStart(2, '0');

      if (statusBadge) {
        statusBadge.style.background = 'rgba(34, 197, 94, 0.16)';
        statusBadge.style.borderColor = 'rgba(34, 197, 94, 0.45)';
        statusBadge.style.color = '#86efac';
      }
      if (statusText) statusText.innerHTML = 'Ongoing Class • Mon to Fri';
      if (headingText) {
        headingText.innerHTML = (daysToAdd === 0) ? 'Next Live Session Today in:' : 'Next Live Session in:';
      }
    }
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// Modal Handlers
window.openZoomModal = function() {
  const modal = document.getElementById('zoom-class-modal');
  if (modal) modal.classList.add('active');
};

window.closeZoomModal = function() {
  const modal = document.getElementById('zoom-class-modal');
  if (modal) modal.classList.remove('active');
};

window.openPosterModal = function() {
  const modal = document.getElementById('poster-lightbox-modal');
  if (modal) modal.classList.add('active');
};

window.closePosterModal = function() {
  const modal = document.getElementById('poster-lightbox-modal');
  if (modal) modal.classList.remove('active');
};

// Clipboard Helper
window.copyToClipboard = function(text, successMsg = 'Copied to clipboard!') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      window.showToast(successMsg, 'success');
    }).catch(() => {
      window.showToast('Copied: ' + text, 'info');
    });
  } else {
    window.showToast(successMsg + ': ' + text, 'info');
  }
};

// Copy Full Class Invitation
window.copyFullMeetingInvite = function() {
  const message = `🌸 *Brajdhan Bhakti Centre Presents* 🌸\n` +
    `📖 *Harinama Chintamani Daily Class*\n` +
    `✍️ By *Śrīla Bhaktivinoda Ṭhākura*\n` +
    `🎙️ *Speaker:* HG Vraj Kishor Das\n\n` +
    `✨ *Discussion:* Experience the power, practice, and ultimate perfection of the Lord’s Holy Name.\n\n` +
    `🔑 *Key Topics:*\n` +
    `1. Philosophy, power, and nature of Harinama\n` +
    `2. Removing impurities from the heart through Harinama-sankirtana\n` +
    `3. Establishing a deep, lasting connection in humility\n\n` +
    `📅 *Days:* Monday to Friday (Ongoing)\n` +
    `⏰ *Time:* 8:30 PM – 9:00 PM (IST)\n` +
    `🌐 *Platform:* Online via Zoom & YouTube Live\n` +
    `🔴 *YouTube Live:* https://www.youtube.com/channel/UCFBbjmun7ECGHfGcsYEkLOg/live\n` +
    `🔗 *ज़ूम लिंक (Zoom Link):* https://us06web.zoom.us/j/83810145066?pwd=bbbFLOAxyBxK4DSGJtNmhiHCadCBB6q7.1\n` +
    `🆔 *Meeting ID:* 838 1014 5066\n` +
    `🔑 *Passcode:* 399432\n\n` +
    `All spiritual seekers are cordially invited to participate! 🙏`;

  window.copyToClipboard(message, 'Complete class invitation copied to clipboard!');
};

// Share Satsang Handler
window.shareClassDetails = function() {
  const shareData = {
    title: 'Harinama Chintamani Daily Class',
    text: `Join the daily sacred class on 'Harinama Chintamani' by Śrīla Bhaktivinoda Ṭhākura, organized by Brajdhan Bhakti Centre with speaker HG Vraj Kishor Das. Mon to Fri, 8:30 PM - 9:00 PM IST on Zoom & YouTube Live! Watch: https://www.youtube.com/channel/UCFBbjmun7ECGHfGcsYEkLOg/live`,
    url: 'https://www.youtube.com/channel/UCFBbjmun7ECGHfGcsYEkLOg/live'
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    window.copyFullMeetingInvite();
  }
};

// Download .ics Calendar File for recurring Mon-Fri 8:30-9:00 PM IST class
window.downloadClassCalendar = function() {
  const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Brajdhan Bhakti Centre//Harinama Chintamani Class//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:harinama-chintamani-daily-class@brajdhan
DTSTAMP:20261029T000000Z
DTSTART;TZID=Asia/Kolkata:20261102T203000
DTEND;TZID=Asia/Kolkata:20261102T210000
RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR
SUMMARY:Harinama Chintamani Daily Class - HG Vraj Kishor Das
DESCRIPTION:Organizer: Brajdhan Bhakti Centre\\nBook: Harinama Chintamani by Śrīla Bhaktivinoda Ṭhākura\\nSpeaker: HG Vraj Kishor Das\\nDiscussion: Experience the power\\, practice\\, and ultimate perfection of the Lord's Holy Name.\\nYouTube Live: https://www.youtube.com/channel/UCFBbjmun7ECGHfGcsYEkLOg/live\\nZoom Link: https://us06web.zoom.us/j/83810145066?pwd=bbbFLOAxyBxK4DSGJtNmhiHCadCBB6q7.1\\nMeeting ID: 838 1014 5066\\nPasscode: 399432
LOCATION:https://www.youtube.com/channel/UCFBbjmun7ECGHfGcsYEkLOg/live
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Harinama Chintamani Class starts in 15 minutes!
END:VALARM
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Harinama-Chintamani-Daily-Class.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  window.showToast('Calendar invite (.ics) downloaded!', 'success');
};

// Close modal when clicking backdrop or escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.closeZoomModal();
    window.closePosterModal();
  }
});

document.addEventListener('click', (e) => {
  const zoomModal = document.getElementById('zoom-class-modal');
  const posterModal = document.getElementById('poster-lightbox-modal');
  if (zoomModal && e.target === zoomModal) window.closeZoomModal();
  if (posterModal && e.target === posterModal) window.closePosterModal();
});

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  initCelestialCanvas();
  initNavigation();
  initSutraOracle();
  initPranayama();
  initScrollAnimations();
  initLiveClassTimer();
});
