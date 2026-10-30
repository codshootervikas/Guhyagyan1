/**
 * GuhyaGyan - Spiritual Discourse & Sacred Video Library Engine
 * Features:
 *  - "Explore Categories" visual thumbnail cards (Image 2 style)
 *  - "Discourses & Recordings" horizontal video row list form (Image 1 style)
 *  - Interactive video modal popup with warm header bar (Image 1 style)
 *  - Search, sort, category filtering, and direct YouTube / Share actions
 *  - Full admin management compatibility
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'guhya_discourses_v2';

  // Category Definitions matching Explore Categories
  const CATEGORIES = [
    {
      id: 'Daily Online Reading',
      name: 'Daily Online Reading',
      hindi: 'दैनिक स्वाध्याय एवं प्रवचन',
      image: 'assets/images/cat-daily-reading.jpg',
      tag: 'ONLINE READING'
    },
    {
      id: 'Valmiki Ramayana',
      name: 'Valmiki Ramayana Series',
      hindi: 'वाल्मीकि रामायण प्रवचन',
      image: 'assets/images/cat-valmiki-ramayan.jpg',
      tag: 'RAMAYANA'
    },
    {
      id: 'Bhagavad Gita',
      name: 'Bhagavad Gita Rahasya',
      hindi: 'श्रीमद्भगवद्गीता रहस्य',
      image: 'assets/images/cat-bhagavad-gita.jpg',
      tag: 'GITA'
    },
    {
      id: 'Upanishads & Vedanta',
      name: 'Upanishads & Vedanta',
      hindi: 'उपनिषद् एवं वेदान्त',
      image: 'assets/images/sanctum-library.jpg',
      tag: 'VEDANTA'
    },
    {
      id: 'Srimad Bhagavatam',
      name: 'Srimad Bhagavatam',
      hindi: 'श्रीमद्भागवतम् अमृत',
      image: 'assets/images/hero-bg.jpg',
      tag: 'BHAGAVATAM'
    },
    {
      id: 'Youth & Newcomers',
      name: 'Senior Youth Training & IKS',
      hindi: 'युवा संस्कार एवं शिक्षण',
      image: 'assets/images/cat-youth-education.jpg',
      tag: 'YOUTH TRAINING'
    }
  ];

  // Default starter recordings
  const DEFAULT_DISCOURSES = [
    {
      id: 'disc_harinama_chintamani',
      title: 'Harinama Chintamani Daily Class • Śrīla Bhaktivinoda Ṭhākura',
      youtubeId: '',
      youtubeUrl: '#harinama-chintamani',
      category: 'Daily Online Reading',
      speaker: 'HG Vraj Kishor Das',
      duration: 'Live Daily 30m',
      description: 'Organizer: Brajdhan Bhakti Centre. Experience the power, practice, and perfection of the Lord’s Holy Name. Mon–Fri 8:30 PM – 9:00 PM IST on Zoom.',
      tags: ['HARINAMA CHINTAMANI', 'BRAJDHAN BHAKTI CENTRE', 'BHAKTIVINODA THAKURA', 'LIVE CLASS'],
      date: '2026-10-29'
    },
    {
      id: 'disc_1',
      title: 'Session 1 - Srutadeva and Bahulasva - Part 1',
      youtubeId: 'mO3QZgQ6Wqg',
      youtubeUrl: 'https://www.youtube.com/watch?v=mO3QZgQ6Wqg',
      category: 'Daily Online Reading',
      speaker: 'HG Radheshyam Das',
      duration: '22:28',
      description: 'Devotional evening discourse exploring the pure bhakti and hospitality of Brahmana Srutadeva and King Bahulasva in Mithila.',
      tags: ['SRUTADEVA AND BAHULASVA', 'DAILY READING'],
      date: '2026-01-22'
    },
    {
      id: 'disc_2',
      title: 'Session 2 - Srutadeva and Bahulasva - Part 2',
      youtubeId: 'jfKfPfyJRdk',
      youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      category: 'Daily Online Reading',
      speaker: 'HG Radheshyam Das',
      duration: '24:15',
      description: 'The conclusion of Krishna’s simultaneous pastimes with Srutadeva and Bahulasva, elucidating selfless dedication.',
      tags: ['SRUTADEVA AND BAHULASVA', 'KRISHNA LEELA'],
      date: '2026-01-23'
    },
    {
      id: 'disc_3',
      title: 'वाल्मीकि रामायण किष्किन्धा काण्ड • Session 1 - The Sacred Forest',
      youtubeId: '7X8II6J-6mU',
      youtubeUrl: 'https://www.youtube.com/watch?v=7X8II6J-6mU',
      category: 'Valmiki Ramayana',
      speaker: 'Dhananjay Vashistha',
      duration: '54:10',
      description: 'Chanted verse-by-verse from Maharishi Valmiki’s original Sanskrit verses exploring Lakshmana and Rama’s arrival at Pampa Lake.',
      tags: ['VALMIKI RAMAYANA', 'KISHKINDHA KAND'],
      date: '2026-01-20'
    },
    {
      id: 'disc_4',
      title: 'श्रीमद्भगवद्गीता यथार्थ रहस्य • The Eternal Song of Consciousness',
      youtubeId: 'mO3QZgQ6Wqg',
      youtubeUrl: 'https://www.youtube.com/watch?v=mO3QZgQ6Wqg',
      category: 'Bhagavad Gita',
      speaker: 'Dhananjay Vashistha',
      duration: '48:20',
      description: 'An illuminating hermeneutic journey into Arjuna’s dilemma and Bhagavan Sri Krishna’s immortal instructions on Nishkama Karma.',
      tags: ['BHAGAVAD GITA', 'SANKHYA YOGA'],
      date: '2026-01-18'
    },
    {
      id: 'disc_5',
      title: 'माण्डूक्य उपनिषद् एवं ओम् ध्यान • Mandukya & The Silence of Turiya',
      youtubeId: 'jfKfPfyJRdk',
      youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      category: 'Upanishads & Vedanta',
      speaker: 'Dhananjay Vashistha',
      duration: '42:35',
      description: 'Transcending waking (Jagrat), dreaming (Svapna), and deep sleep (Susupti) into the changeless witness of Pure Consciousness.',
      tags: ['UPANISHADS', 'VEDANTA', 'TURIYA'],
      date: '2026-01-15'
    },
    {
      id: 'disc_6',
      title: 'श्रीमद्भागवतम् अमृत बूँदें • Bhagavatam Droplets & Divine Bhakti',
      youtubeId: 'kxyh50aU-iU',
      youtubeUrl: 'https://www.youtube.com/watch?v=kxyh50aU-iU',
      category: 'Srimad Bhagavatam',
      speaker: 'Dhananjay Vashistha',
      duration: '36:50',
      description: 'Nurturing the soul’s dormant devotion for the Supreme Divine through contemplative reflections from the crest-jewel of Vedic literature.',
      tags: ['BHAGAVATAM', 'BHAKTI'],
      date: '2026-01-12'
    },
    {
      id: 'disc_7',
      title: 'Senior Youth Training & Dharmic Leadership in Modern Times',
      youtubeId: 'mO3QZgQ6Wqg',
      youtubeUrl: 'https://www.youtube.com/watch?v=mO3QZgQ6Wqg',
      category: 'Youth & Newcomers',
      speaker: 'Dhananjay Vashistha',
      duration: '31:40',
      description: 'Practical application of Indian Knowledge System (IKS) principles for emotional intelligence, character development, and purpose.',
      tags: ['YOUTH TRAINING', 'IKS', 'LEADERSHIP'],
      date: '2026-01-10'
    }
  ];

  class DiscourseManager {
    constructor() {
      this.discourses = this.loadFromStorage();
      this.categories = CATEGORIES;
      this.activeCategory = 'all';
      this.searchQuery = '';
      this.currentSort = 'default';
    }

    loadFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Error reading discourses from storage:', e);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DISCOURSES));
      return [...DEFAULT_DISCOURSES];
    }

    saveToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.discourses));
      } catch (e) {
        console.error('Failed to save discourses to storage:', e);
      }
    }

    extractYouTubeId(url) {
      if (!url) return null;
      url = url.trim();

      if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return url;
      }

      const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const match = url.match(regExp);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }

      const fallback = /(?:v=|\/)([a-zA-Z0-9_-]{11})(?:[?&]|$)/i;
      const fbMatch = url.match(fallback);
      if (fbMatch && fbMatch[1] && fbMatch[1].length === 11) {
        return fbMatch[1];
      }

      return null;
    }

    getThumbnailUrl(youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }

    getAll() {
      return [...this.discourses];
    }

    /* ================= Category Explorer Rendering (Image 2 style) ================= */
    renderCategoryCards(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = this.categories.map(cat => {
        const isActive = this.activeCategory === cat.id;
        return `
          <div class="category-card ${isActive ? 'is-active' : ''}" 
               onclick="window.discourseManager.selectCategory('${this.escapeHtml(cat.id)}')"
               title="${this.escapeHtml(cat.name)}">
            <img src="${cat.image}" alt="${this.escapeHtml(cat.name)}" loading="lazy" onerror="this.src='assets/images/cat-daily-reading.jpg'">
            <div class="category-card-overlay">
              <span class="category-card-name">${this.escapeHtml(cat.name)}</span>
              <span class="category-card-sub">${this.escapeHtml(cat.hindi)}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    selectCategory(catId) {
      if (this.activeCategory === catId) {
        this.activeCategory = 'all'; // Toggle back to all
      } else {
        this.activeCategory = catId;
      }
      this.renderCategoryCards('category-cards-grid');
      this.renderVideoList('discourse-video-list');

      // Scroll smoothly to the recordings section
      const target = document.getElementById('recordings-list-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    setSearch(query) {
      this.searchQuery = (query || '').toLowerCase().trim();
      this.renderVideoList('discourse-video-list');
    }

    setSort(sortValue) {
      this.currentSort = sortValue || 'default';
      this.renderVideoList('discourse-video-list');
    }

    /* ================= Video Form List Rendering (Image 1 style) ================= */
    renderVideoList(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      let list = [...this.discourses];

      // Filter by category
      if (this.activeCategory !== 'all') {
        list = list.filter(d => d.category === this.activeCategory);
      }

      // Filter by search query
      if (this.searchQuery) {
        list = list.filter(d => {
          const inTitle = (d.title || '').toLowerCase().includes(this.searchQuery);
          const inDesc = (d.description || '').toLowerCase().includes(this.searchQuery);
          const inSpeaker = (d.speaker || '').toLowerCase().includes(this.searchQuery);
          const inCat = (d.category || '').toLowerCase().includes(this.searchQuery);
          const inTags = (d.tags || []).some(t => t.toLowerCase().includes(this.searchQuery));
          return inTitle || inDesc || inSpeaker || inCat || inTags;
        });
      }

      // Sorting
      if (this.currentSort === 'newest') {
        list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      } else if (this.currentSort === 'longest') {
        list.sort((a, b) => (b.duration || '').localeCompare(a.duration || ''));
      } else if (this.currentSort === 'title') {
        list.sort((a, b) => a.title.localeCompare(b.title));
      }

      // Update counter and filter chip
      this.updateHeaderMeta(list.length);

      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-video-notice">
            <div style="font-size: 2.4rem; margin-bottom: 0.6rem;">📿</div>
            <h4 style="color: var(--gold-light); margin-bottom: 0.35rem; font-size: 1.15rem;">No Recordings Found</h4>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">No recordings match your current selection or search term.</p>
            <button class="btn btn-outline btn-sm" onclick="window.discourseManager.resetFilters()">
              <span>Reset All Filters</span>
            </button>
          </div>
        `;
        return;
      }

      container.innerHTML = list.map(d => {
        const thumb = this.getThumbnailUrl(d.youtubeId);
        const tags = Array.isArray(d.tags) && d.tags.length > 0
          ? d.tags
          : [d.category || 'VEDIC DISCOURSE'];

        return `
          <article class="video-row-item" data-id="${d.id}">
            <div class="video-row-left">
              <div class="video-row-thumb" onclick="window.discourseManager.playDiscourseById('${d.id}')" title="Play Video">
                <img src="${thumb}" alt="${this.escapeHtml(d.title)}" loading="lazy" onerror="this.src='assets/images/cat-daily-reading.jpg'">
                <div class="video-row-thumb-play">
                  <svg viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
                <span class="video-row-duration">${this.escapeHtml(d.duration || 'Video')}</span>
              </div>

              <div class="video-row-details">
                <h4 class="video-row-title" onclick="window.discourseManager.playDiscourseById('${d.id}')">
                  ${this.escapeHtml(d.title)}
                </h4>
                
                <div class="video-row-meta">
                  <span>👤 ${this.escapeHtml(d.speaker || 'Dhananjay Vashistha')}</span>
                  <span>⏱️ ${this.escapeHtml(d.duration || 'Discourse')}</span>
                  <span>📅 ${this.escapeHtml(d.date ? this.formatDate(d.date) : 'Recent')}</span>
                </div>

                <div class="video-row-tags">
                  ${tags.map(t => `<span class="video-tag-pill">${this.escapeHtml(t)}</span>`).join('')}
                </div>
              </div>
            </div>

            <div class="video-row-actions">
              <button class="btn-video-watch" onclick="window.discourseManager.playDiscourseById('${d.id}')" title="Watch in Player">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Watch</span>
              </button>

              <a href="${d.youtubeUrl}" target="_blank" rel="noopener noreferrer" class="btn-video-yt" title="Open on YouTube">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>+ YouTube</span>
              </a>

              <button class="btn-video-share" onclick="window.discourseManager.shareDiscourse('${d.id}')" title="Copy Share Link">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                <span>Share</span>
              </button>
            </div>
          </article>
        `;
      }).join('');
    }

    updateHeaderMeta(count) {
      const countEl = document.getElementById('recordings-count-badge');
      if (countEl) {
        countEl.textContent = `${count} ${count === 1 ? 'recording' : 'recordings'} found`;
      }

      const chipWrap = document.getElementById('active-category-chip-wrap');
      if (chipWrap) {
        if (this.activeCategory !== 'all') {
          chipWrap.innerHTML = `
            <span class="active-filter-chip">
              <span>Category: <strong>${this.escapeHtml(this.activeCategory)}</strong></span>
              <button onclick="window.discourseManager.selectCategory('all')" title="Clear filter">&times;</button>
            </span>
          `;
        } else {
          chipWrap.innerHTML = '';
        }
      }
    }

    resetFilters() {
      this.activeCategory = 'all';
      this.searchQuery = '';
      this.currentSort = 'default';

      const searchInput = document.getElementById('recordings-search-input');
      if (searchInput) searchInput.value = '';

      const sortSelect = document.getElementById('recordings-sort-select');
      if (sortSelect) sortSelect.value = 'default';

      const clearBtn = document.getElementById('clear-search-btn');
      if (clearBtn) clearBtn.style.display = 'none';

      this.renderCategoryCards('category-cards-grid');
      this.renderVideoList('discourse-video-list');
    }

    formatDate(dateStr) {
      try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      } catch (e) {}
      return dateStr;
    }

    playDiscourseById(id) {
      const d = this.discourses.find(item => item.id === id);
      if (!d) return;
      this.playDiscourse(d.youtubeId, d.title, d.youtubeUrl);
    }

    /* ================= Video Modal Popup (Image 1 style) ================= */
    playDiscourse(youtubeId, title, youtubeUrl) {
      let modal = document.getElementById('discourse-video-modal');

      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'discourse-video-modal';
        modal.className = 'modal-overlay';
        modal.onclick = (e) => {
          if (e.target === modal) this.closeModal();
        };
        modal.innerHTML = `
          <div class="video-modal-dialog">
            <div class="video-modal-header">
              <span class="video-modal-title" id="video-modal-title-text"></span>
              <button class="video-modal-close" onclick="window.discourseManager.closeModal()" aria-label="Close Player">&times;</button>
            </div>
            <div class="video-modal-body">
              <iframe id="video-modal-iframe" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        // Escape key listener
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && modal.classList.contains('active')) {
            this.closeModal();
          }
        });
      }

      const titleEl = document.getElementById('video-modal-title-text');
      const iframeEl = document.getElementById('video-modal-iframe');

      if (titleEl) titleEl.textContent = title;
      if (iframeEl) {
        iframeEl.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&enablejsapi=1&rel=0`;
      }

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    closeModal() {
      const modal = document.getElementById('discourse-video-modal');
      if (modal) {
        modal.classList.remove('active');
        const iframe = document.getElementById('video-modal-iframe');
        if (iframe) iframe.src = '';
      }
      document.body.style.overflow = '';
    }

    shareDiscourse(id) {
      const d = this.discourses.find(item => item.id === id);
      if (!d) return;

      const shareUrl = d.youtubeUrl || window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          if (window.showToast) {
            window.showToast(`प्रवचन लिंक कॉपी हुआ: "${d.title}"`, 'success');
          } else {
            alert(`Link copied: ${shareUrl}`);
          }
        }).catch(() => {
          this.promptShareFallback(shareUrl);
        });
      } else {
        this.promptShareFallback(shareUrl);
      }
    }

    promptShareFallback(url) {
      window.prompt('प्रवचन लिंक कॉपी करें:', url);
    }

    /* ================= Admin Panel Management View ================= */
    addDiscourse({ title, url, category, duration, description, speaker, tags }) {
      const ytId = this.extractYouTubeId(url);
      if (!ytId) {
        throw new Error('अमान्य YouTube वीडियो लिंक। कृपया वीडियो का सही लिंक दर्ज करें (उदा. https://www.youtube.com/watch?v=...)');
      }

      if (!title || title.trim().length === 0) {
        throw new Error('कृपया प्रवचन का शीर्षक (Title) दर्ज करें।');
      }

      const newDiscourse = {
        id: 'disc_' + Date.now(),
        title: title.trim(),
        youtubeId: ytId,
        youtubeUrl: `https://www.youtube.com/watch?v=${ytId}`,
        category: (category && category.trim()) ? category.trim() : 'Daily Online Reading',
        speaker: speaker || 'Dhananjay Vashistha',
        duration: duration ? duration.trim() : 'Video Discourse',
        description: description ? description.trim() : 'Spiritual discourse.',
        tags: tags || [(category && category.trim()) ? category.trim().toUpperCase() : 'VEDIC DISCOURSE'],
        date: new Date().toISOString().split('T')[0]
      };

      this.discourses.unshift(newDiscourse);
      this.saveToStorage();
      return newDiscourse;
    }

    deleteDiscourse(id) {
      const initialLength = this.discourses.length;
      this.discourses = this.discourses.filter(d => d.id !== id);
      this.saveToStorage();
      return this.discourses.length < initialLength;
    }

    renderAdminTable(tbodyId, emptyStateId) {
      const tbody = document.getElementById(tbodyId);
      const emptyState = document.getElementById(emptyStateId);
      if (!tbody) return;

      if (this.discourses.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      tbody.innerHTML = this.discourses.map(d => {
        const thumb = this.getThumbnailUrl(d.youtubeId);
        return `
          <tr data-discourse-id="${d.id}">
            <td>
              <div style="width: 100px; aspect-ratio: 16/9; border-radius: 6px; overflow: hidden; background: #000; border: 1px solid rgba(245, 158, 11, 0.3);">
                <img src="${thumb}" alt="${this.escapeHtml(d.title)}" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
            </td>
            <td>
              <div style="font-weight: 700; color: #fff; line-height: 1.4; margin-bottom: 0.25rem;">${this.escapeHtml(d.title)}</div>
              <div style="font-size: 0.78rem; color: #fdba74; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">
                ${this.escapeHtml(d.description)}
              </div>
            </td>
            <td>
              <span class="video-tag-pill" style="font-size: 0.72rem; padding: 0.2rem 0.6rem;">${this.escapeHtml(d.category)}</span>
            </td>
            <td style="color: #fed7aa; font-size: 0.85rem; font-weight: 600;">
              ${this.escapeHtml(d.speaker || 'Dhananjay Vashistha')}
            </td>
            <td style="color: var(--gold-light); font-size: 0.85rem; font-family: monospace;">
              ${this.escapeHtml(d.duration || 'Discourse')}
            </td>
            <td style="color: var(--text-muted); font-size: 0.8rem;">
              ${this.escapeHtml(d.date || 'Recent')}
            </td>
            <td>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <button class="btn btn-outline btn-sm" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;" onclick="window.discourseManager.playDiscourseById('${d.id}')">
                  ▶ Watch
                </button>
                <button class="btn btn-danger btn-sm" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;" onclick="window.adminDeleteDiscourse('${d.id}')">
                  🗑 Delete
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  }

  window.discourseManager = new DiscourseManager();

  // Admin Window Helpers
  window.adminOpenAddDiscourseModal = function () {
    const modal = document.getElementById('admin-add-discourse-modal');
    if (modal) {
      modal.classList.add('is-active', 'active');
      modal.style.display = 'flex';
      modal.style.opacity = '1';
      modal.style.pointerEvents = 'auto';
    }
  };

  window.adminCloseAddDiscourseModal = function () {
    const modal = document.getElementById('admin-add-discourse-modal');
    if (modal) {
      modal.classList.remove('is-active', 'active');
      modal.style.display = '';
      modal.style.opacity = '';
      modal.style.pointerEvents = '';
    }
    const form = document.getElementById('admin-add-discourse-form');
    if (form) form.reset();
  };

  window.adminHandleAddDiscourse = function (e) {
    if (e && e.preventDefault) e.preventDefault();

    const urlInput = document.getElementById('new-discourse-url');
    const titleInput = document.getElementById('new-discourse-title');
    const categoryInput = document.getElementById('new-discourse-category');
    const durationInput = document.getElementById('new-discourse-duration');
    const speakerInput = document.getElementById('new-discourse-speaker');
    const descInput = document.getElementById('new-discourse-desc');

    const url = urlInput ? urlInput.value.trim() : '';
    const title = titleInput ? titleInput.value.trim() : '';
    const category = categoryInput ? categoryInput.value.trim() : 'Daily Online Reading';
    const duration = durationInput ? durationInput.value.trim() : 'Discourse';
    const speaker = speakerInput ? speakerInput.value.trim() : 'Dhananjay Vashistha';
    const description = descInput ? descInput.value.trim() : 'Spiritual discourse.';

    if (!url) {
      alert('कृपया YouTube वीडियो लिंक दर्ज करें।');
      return;
    }

    if (!title) {
      alert('कृपया प्रवचन का शीर्षक दर्ज करें।');
      return;
    }

    try {
      const added = window.discourseManager.addDiscourse({
        title,
        url,
        category: category || 'Daily Online Reading',
        duration: duration || 'Discourse',
        speaker: speaker || 'Dhananjay Vashistha',
        description: description || 'Spiritual discourse.'
      });

      window.adminCloseAddDiscourseModal();
      window.discourseManager.renderAdminTable('admin-discourses-tbody', 'admin-discourse-empty');

      if (window.showToast) {
        window.showToast(`प्रवचन सफलतापूर्वक जोड़ा गया: "${added.title}"`, 'success');
      } else {
        alert('प्रवचन सफलतापूर्वक वेबसाइट पर जोड़ दिया गया है!');
      }
    } catch (err) {
      alert(err.message || 'वीडियो जोड़ने में त्रुटि हुई। कृपया लिंक जांचें।');
    }
  };

  window.adminDeleteDiscourse = function (id) {
    if (confirm('क्या आप सचमुच इस प्रवचन को वेबसाइट से हटाना चाहते हैं?')) {
      window.discourseManager.deleteDiscourse(id);
      window.discourseManager.renderAdminTable('admin-discourses-tbody', 'admin-discourse-empty');
      if (window.showToast) {
        window.showToast('प्रवचन को लाइब्रेरी से हटा दिया गया है।', 'info');
      }
    }
  };

  // Initialize interactive components on load
  function initDiscourseClient() {
    if (document.getElementById('category-cards-grid')) {
      window.discourseManager.renderCategoryCards('category-cards-grid');
    }
    if (document.getElementById('discourse-video-list')) {
      window.discourseManager.renderVideoList('discourse-video-list');
    }
    if (document.getElementById('admin-discourses-tbody')) {
      window.discourseManager.renderAdminTable('admin-discourses-tbody', 'admin-discourse-empty');
    }

    // Attach search and sort listeners
    const searchInput = document.getElementById('recordings-search-input');
    const clearBtn = document.getElementById('clear-search-btn');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';
        window.discourseManager.setSearch(val);
      });
    }

    if (clearBtn && searchInput) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        window.discourseManager.setSearch('');
      });
    }

    const sortSelect = document.getElementById('recordings-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        window.discourseManager.setSort(e.target.value);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDiscourseClient);
  } else {
    initDiscourseClient();
  }

})(window);
