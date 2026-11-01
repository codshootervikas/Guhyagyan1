/**
 * GuhyaGyan - Vedic Wisdom Quiz & Examination Engine
 * Features:
 *  - Dedicated Quiz Hub with category filters & search
 *  - Seeker Login Verification (auth.js integration)
 *  - Interactive examination with timer and step-by-step questions
 *  - Result calculation showing score & ONLY seeker's selected answers (NO master correct key revealed)
 *  - Dual persistence (localStorage + /data/quizzes.json and /data/quiz-results.json)
 *  - Seeker profile history integration (sanctuary.html)
 *  - Master Admin Quiz Creator & Submissions Leaderboard (admin.html)
 */

(function (window) {
  'use strict';

  const QUIZZES_STORAGE_KEY = 'guhyagyan_quizzes';
  const RESULTS_STORAGE_KEY = 'guhyagyan_quiz_results';

  class QuizEngine {
    constructor() {
      this.quizzes = this.loadQuizzesFromStorage();
      this.results = this.loadResultsFromStorage();
      this.activeQuiz = null;
      this.activeQuestionIndex = 0;
      this.userAnswers = {}; // { [qId]: optionIndex }
      this.timerInterval = null;
      this.timeRemaining = 0;
      this.activeCategory = 'all';
      this.searchQuery = '';

      // Sync with server in background
      setTimeout(() => {
        this.syncQuizzesWithServer();
        this.syncResultsWithServer();
      }, 100);
    }

    /* ================= Persistence & Server Sync ================= */
    loadQuizzesFromStorage() {
      try {
        const raw = localStorage.getItem(QUIZZES_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Error reading quizzes from storage:', e);
      }
      return [];
    }

    loadResultsFromStorage() {
      try {
        const raw = localStorage.getItem(RESULTS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.warn('Error reading quiz results from storage:', e);
      }
      return [];
    }

    syncQuizzesWithServer() {
      fetch('data/quizzes.json?v=' + Date.now())
        .then(res => res.ok ? res.json() : [])
        .then(serverQuizzes => {
          if (Array.isArray(serverQuizzes) && serverQuizzes.length > 0) {
            const serverIds = new Set(serverQuizzes.map(q => q.id));
            const merged = [...serverQuizzes];

            // Retain any locally created quiz not yet on server
            this.quizzes.forEach(lq => {
              if (!serverIds.has(lq.id)) {
                merged.unshift(lq);
              }
            });

            this.quizzes = merged;
            try { localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(this.quizzes)); } catch (e) {}
            this.refreshActiveViews();
          }
        })
        .catch(() => {});
    }

    syncResultsWithServer() {
      fetch('data/quiz-results.json?v=' + Date.now())
        .then(res => res.ok ? res.json() : [])
        .then(serverResults => {
          if (Array.isArray(serverResults) && serverResults.length > 0) {
            const serverSubIds = new Set(serverResults.map(r => r.id));
            const merged = [...serverResults];

            this.results.forEach(lr => {
              if (!serverSubIds.has(lr.id)) {
                merged.unshift(lr);
              }
            });

            this.results = merged;
            try { localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(this.results)); } catch (e) {}
            this.refreshActiveViews();
          }
        })
        .catch(() => {});
    }

    saveQuizzes() {
      try {
        localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(this.quizzes));
      } catch (e) {}

      fetch('/api/save-quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.quizzes, null, 2)
      }).catch(() => {});
    }

    saveResults() {
      try {
        localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(this.results));
      } catch (e) {}

      fetch('/api/save-quiz-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.results, null, 2)
      }).catch(() => {});
    }

    refreshActiveViews() {
      if (document.getElementById('quizzes-grid-container')) {
        this.renderQuizList('quizzes-grid-container');
      }
      if (document.getElementById('seeker-quiz-history-container')) {
        this.renderSeekerHistory('seeker-quiz-history-container');
      }
      if (document.getElementById('admin-quiz-submissions-tbody')) {
        this.renderAdminSubmissionsTable('admin-quiz-submissions-tbody');
      }
      if (document.getElementById('admin-quizzes-tbody')) {
        this.renderAdminQuizzesTable('admin-quizzes-tbody');
      }
    }

    /* ================= Seeker Quiz Hub Rendering (quiz.html) ================= */
    renderQuizList(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      let list = [...this.quizzes];

      // Filter by category
      if (this.activeCategory && this.activeCategory !== 'all') {
        const catClean = this.activeCategory.toLowerCase();
        list = list.filter(q => (q.category || '').toLowerCase() === catClean);
      }

      // Filter by search query
      if (this.searchQuery) {
        const qClean = this.searchQuery.toLowerCase();
        list = list.filter(q => 
          (q.title || '').toLowerCase().includes(qClean) ||
          (q.description || '').toLowerCase().includes(qClean) ||
          (q.category || '').toLowerCase().includes(qClean)
        );
      }

      const counterBadge = document.getElementById('quizzes-count-badge');
      if (counterBadge) {
        counterBadge.textContent = `${list.length} ${list.length === 1 ? 'Quiz Available' : 'Quizzes Available'}`;
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-quiz-notice" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: rgba(26, 10, 4, 0.45); border-radius: 20px; border: 1px dashed rgba(245, 158, 11, 0.3);">
            <div style="font-size: 3rem; margin-bottom: 0.75rem;">🪔</div>
            <h3 style="color: #fed7aa; font-family: var(--font-cinzel); font-size: 1.4rem; margin-bottom: 0.5rem;">No Quizzes Found</h3>
            <p style="color: var(--text-secondary); font-size: 0.95rem; max-width: 500px; margin: 0 auto 1.5rem auto;">
              No quizzes match the chosen filter or search term. Try switching category or resetting search.
            </p>
            <button class="btn btn-outline btn-sm" onclick="window.quizEngine.setCategory('all'); window.quizEngine.resetSearch();">
              <span>View All Quizzes</span>
            </button>
          </div>
        `;
        return;
      }

      // Current user check
      let currentUser = null;
      if (window.authManager && typeof window.authManager.getCurrentUser === 'function') {
        currentUser = window.authManager.getCurrentUser();
      }

      const categoryBadges = {
        'Hari-nāma Cintāmaṇi': { label: 'हरिनाम चिन्तामणि', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
        'Valmiki Ramayana': { label: 'वाल्मीकि रामायण', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.15)' },
        'Bhagavad Gita': { label: 'श्रीमद्भगवद्गीता', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)' },
        'Daily Online Reading': { label: 'स्वाध्याय एवं सत्संग', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
        'Upanishads & Vedanta': { label: 'उपनिषद् एवं वेदान्त', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' },
        'Srimad Bhagavatam': { label: 'श्रीमद्भागवतम्', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' },
        'Youth & Newcomers': { label: 'युवा संस्कार IKS', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' }
      };

      container.innerHTML = list.map(q => {
        const catInfo = categoryBadges[q.category] || { label: q.category || 'Vedic Quiz', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
        const qCount = (q.questions || []).length;
        const dur = q.durationMinutes || 10;
        const passPercent = q.passingScore || 60;

        // Check if user has taken this quiz before
        let userPastSub = null;
        if (currentUser) {
          userPastSub = this.results.find(r => 
            r.quizId === q.id && 
            ((r.seekerEmail || '').toLowerCase() === (currentUser.email || '').toLowerCase() || r.seekerId === currentUser.id)
          );
        }

        return `
          <div class="quiz-card" data-quiz-id="${q.id}">
            <div class="quiz-card-header">
              <span class="quiz-card-badge" style="color: ${catInfo.color}; background: ${catInfo.bg}; border: 1px solid ${catInfo.color}40;">
                🪔 ${this.escapeHtml(catInfo.label)}
              </span>
              <span class="quiz-card-timer-badge">
                ⏱️ ${dur} min
              </span>
            </div>

            <h3 class="quiz-card-title">${this.escapeHtml(q.title)}</h3>
            <p class="quiz-card-desc">${this.escapeHtml(q.description || 'Test your comprehension of sacred teachings and verse insights.')}</p>

            <div class="quiz-card-meta">
              <div class="quiz-meta-item">
                <span class="quiz-meta-label">Questions</span>
                <span class="quiz-meta-val">${qCount} MCQs</span>
              </div>
              <div class="quiz-meta-item">
                <span class="quiz-meta-label">Passing</span>
                <span class="quiz-meta-val">${passPercent}%</span>
              </div>
              <div class="quiz-meta-item">
                <span class="quiz-meta-label">Mode</span>
                <span class="quiz-meta-val">Online</span>
              </div>
            </div>

            ${userPastSub ? `
              <div class="quiz-past-attempt-pill ${userPastSub.passed ? 'passed' : 'failed'}">
                <span>${userPastSub.passed ? '✅ Completed' : '⚠️ Attempted'}: <strong>${userPastSub.score}/${userPastSub.totalQuestions} (${userPastSub.percentage}%)</strong></span>
              </div>
            ` : ''}

            <div class="quiz-card-actions">
              <button class="btn btn-primary btn-sm quiz-start-btn" onclick="window.quizEngine.startQuiz('${q.id}')">
                <span>${userPastSub ? '🔄 Retake Quiz' : '🚀 Start Examination'}</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    setCategory(cat) {
      this.activeCategory = cat;
      const pills = document.querySelectorAll('.quiz-filter-pill');
      pills.forEach(p => {
        if (p.getAttribute('data-cat') === cat) p.classList.add('active');
        else p.classList.remove('active');
      });
      this.renderQuizList('quizzes-grid-container');
    }

    setSearch(query) {
      this.searchQuery = (query || '').trim();
      this.renderQuizList('quizzes-grid-container');
    }

    resetSearch() {
      this.searchQuery = '';
      const input = document.getElementById('quiz-search-input');
      if (input) input.value = '';
      this.renderQuizList('quizzes-grid-container');
    }

    /* ================= Interactive Quiz Examination Flow ================= */
    startQuiz(quizId) {
      const quiz = this.quizzes.find(q => q.id === quizId);
      if (!quiz) {
        alert('प्रश्नोत्तरी नहीं मिली। कृपया पुनः प्रयास करें।');
        return;
      }

      // Check Seeker Login
      let currentUser = null;
      if (window.authManager && typeof window.authManager.getCurrentUser === 'function') {
        currentUser = window.authManager.getCurrentUser();
      }

      if (!currentUser) {
        this.openLoginRequiredModal(quiz);
        return;
      }

      this.activeQuiz = quiz;
      this.activeQuestionIndex = 0;
      this.userAnswers = {};
      this.timeRemaining = (quiz.durationMinutes || 10) * 60;

      this.openQuizPlayerModal();
      this.renderActiveQuestion();
      this.startTimer();
    }

    openLoginRequiredModal(quiz) {
      let modal = document.getElementById('quiz-login-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'quiz-login-modal';
        modal.className = 'quiz-modal-overlay active';
        modal.innerHTML = `
          <div class="quiz-modal-dialog" style="max-width: 480px; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔐</div>
            <div class="sanskrit-subtitle" style="justify-content: center;">दीक्षा एवं साधक पहचान • Seeker Verification</div>
            <h3 class="font-cinzel" style="color: #fff; font-size: 1.45rem; margin-bottom: 0.75rem;">
              Seeker Login <span class="gold-gradient-text">Required</span>
            </h3>
            <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6; margin-bottom: 1.5rem;">
              इस पवित्र परीक्षा को देने के लिए आपको अपने <strong>साधक खाते (Seeker ID)</strong> से लॉगिन करना अनिवार्य है ताकि आपके प्राप्त अंक आपकी व्यक्तिगत प्रोफाइल में सुरक्षित रहें और एडमिन को आपका नाम दिख सके।
            </p>
            <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
              <a href="login.html?redirect=quiz.html" class="btn btn-primary btn-sm">
                <span>🔐 Log In to My Account</span>
              </a>
              <a href="register.html?redirect=quiz.html" class="btn btn-outline btn-sm">
                <span>🪷 Register New Seeker</span>
              </a>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="document.getElementById('quiz-login-modal').remove()" style="margin-top: 1rem; color: var(--text-muted); font-size: 0.8rem;">
              Cancel & Browse
            </button>
          </div>
        `;
        document.body.appendChild(modal);
      } else {
        modal.classList.add('active');
      }
    }

    openQuizPlayerModal() {
      let modal = document.getElementById('quiz-player-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'quiz-player-modal';
        modal.className = 'quiz-modal-overlay';
        modal.innerHTML = `
          <div class="quiz-modal-dialog quiz-player-dialog">
            <!-- Header Bar -->
            <div class="quiz-player-header">
              <div class="quiz-player-title-wrap">
                <span class="quiz-player-cat-pill" id="qp-category-pill">Category</span>
                <h3 class="quiz-player-title font-cinzel" id="qp-quiz-title">Quiz Title</h3>
              </div>
              <div class="quiz-player-header-actions">
                <div class="quiz-timer-wrap" id="qp-timer-wrap">
                  <span class="timer-icon">⏳</span>
                  <span class="timer-val" id="qp-timer-display">10:00</span>
                </div>
                <button class="quiz-player-close-btn" onclick="window.quizEngine.confirmExitQuiz()" aria-label="Exit Quiz">✕</button>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="quiz-progress-track">
              <div class="quiz-progress-fill" id="qp-progress-fill" style="width: 0%;"></div>
            </div>

            <!-- Question Body Area -->
            <div class="quiz-player-body" id="qp-question-container">
              <!-- Dynamically populated question & options -->
            </div>

            <!-- Footer Controls -->
            <div class="quiz-player-footer">
              <div class="qp-question-counter" id="qp-counter-text">
                Question 1 of 5
              </div>
              <div class="qp-nav-buttons">
                <button class="btn btn-outline btn-sm" id="qp-prev-btn" onclick="window.quizEngine.prevQuestion()">
                  <span>← Previous</span>
                </button>
                <button class="btn btn-primary btn-sm" id="qp-next-btn" onclick="window.quizEngine.nextQuestion()">
                  <span>Next →</span>
                </button>
                <button class="btn btn-primary btn-sm" id="qp-submit-btn" style="display: none; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-color: #34d399;" onclick="window.quizEngine.confirmSubmitQuiz()">
                  <span>Submit Examination 🎯</span>
                </button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }

      document.body.style.overflow = 'hidden';
      modal.classList.add('active');

      const catPill = document.getElementById('qp-category-pill');
      const titleEl = document.getElementById('qp-quiz-title');
      if (catPill) catPill.textContent = this.activeQuiz.category || 'Vedic Quiz';
      if (titleEl) titleEl.textContent = this.activeQuiz.title;
    }

    renderActiveQuestion() {
      const qContainer = document.getElementById('qp-question-container');
      const counterText = document.getElementById('qp-counter-text');
      const progressFill = document.getElementById('qp-progress-fill');
      const prevBtn = document.getElementById('qp-prev-btn');
      const nextBtn = document.getElementById('qp-next-btn');
      const submitBtn = document.getElementById('qp-submit-btn');

      if (!qContainer || !this.activeQuiz) return;

      const questions = this.activeQuiz.questions || [];
      const total = questions.length;
      const current = questions[this.activeQuestionIndex];

      if (!current) return;

      // Update progress
      const percent = Math.round(((this.activeQuestionIndex + 1) / total) * 100);
      if (progressFill) progressFill.style.width = `${percent}%`;
      if (counterText) counterText.textContent = `प्रश्न ${this.activeQuestionIndex + 1} / ${total} (Question ${this.activeQuestionIndex + 1} of ${total})`;

      // Navigation buttons state
      if (prevBtn) prevBtn.style.visibility = this.activeQuestionIndex === 0 ? 'hidden' : 'visible';
      if (this.activeQuestionIndex === total - 1) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'inline-flex';
      } else {
        if (nextBtn) nextBtn.style.display = 'inline-flex';
        if (submitBtn) submitBtn.style.display = 'none';
      }

      const selectedOptIndex = this.userAnswers[current.id];

      qContainer.innerHTML = `
        <div class="quiz-question-box">
          <div class="quiz-question-num-tag">Question ${this.activeQuestionIndex + 1}</div>
          <h4 class="quiz-question-text">${this.escapeHtml(current.question)}</h4>
          
          <div class="quiz-options-list">
            ${current.options.map((optText, optIdx) => {
              const isSelected = selectedOptIndex === optIdx;
              const optionLetters = ['A', 'B', 'C', 'D', 'E'];
              return `
                <div class="quiz-option-card ${isSelected ? 'selected' : ''}" onclick="window.quizEngine.selectOption('${current.id}', ${optIdx})">
                  <div class="quiz-option-indicator">${optionLetters[optIdx] || optIdx + 1}</div>
                  <div class="quiz-option-text">${this.escapeHtml(optText)}</div>
                  <div class="quiz-option-check">${isSelected ? '●' : '○'}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    selectOption(questionId, optionIndex) {
      this.userAnswers[questionId] = optionIndex;
      this.renderActiveQuestion();
    }

    nextQuestion() {
      if (this.activeQuestionIndex < (this.activeQuiz.questions || []).length - 1) {
        this.activeQuestionIndex++;
        this.renderActiveQuestion();
      }
    }

    prevQuestion() {
      if (this.activeQuestionIndex > 0) {
        this.activeQuestionIndex--;
        this.renderActiveQuestion();
      }
    }

    startTimer() {
      clearInterval(this.timerInterval);
      const timerDisplay = document.getElementById('qp-timer-display');

      const updateDisplay = () => {
        const mins = Math.floor(this.timeRemaining / 60);
        const secs = this.timeRemaining % 60;
        if (timerDisplay) {
          timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
          if (this.timeRemaining <= 60) {
            timerDisplay.style.color = '#ef4444';
          } else {
            timerDisplay.style.color = 'var(--gold-light)';
          }
        }
      };

      updateDisplay();

      this.timerInterval = setInterval(() => {
        this.timeRemaining--;
        updateDisplay();

        if (this.timeRemaining <= 0) {
          clearInterval(this.timerInterval);
          alert('समय समाप्त हुआ (Time is up)! आपकी परीक्षा अब सबमिट की जा रही है।');
          this.submitQuiz();
        }
      }, 1000);
    }

    confirmExitQuiz() {
      if (confirm('क्या आप सचमुच परीक्षा से बाहर जाना चाहते हैं? आपके द्वारा चुने गए उत्तर खो जाएंगे।')) {
        clearInterval(this.timerInterval);
        const modal = document.getElementById('quiz-player-modal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    confirmSubmitQuiz() {
      const questions = this.activeQuiz.questions || [];
      const answeredCount = Object.keys(this.userAnswers).length;
      const unanswered = questions.length - answeredCount;

      let msg = 'क्या आप अपनी परीक्षा सबमिट करना चाहते हैं?';
      if (unanswered > 0) {
        msg = `सावधान: आपने ${unanswered} प्रश्नों का उत्तर नहीं दिया है। क्या आप फिर भी सबमिट करना चाहते हैं?`;
      }

      if (confirm(msg)) {
        this.submitQuiz();
      }
    }

    /* ================= Submit & Result Calculation ================= */
    submitQuiz() {
      clearInterval(this.timerInterval);

      const currentUser = window.authManager ? window.authManager.getCurrentUser() : null;
      if (!currentUser) {
        alert('साधक सत्र समाप्त हो गया। कृपया पुनः लॉगिन करें।');
        return;
      }

      const questions = this.activeQuiz.questions || [];
      let earnedPoints = 0;
      let totalPoints = 0;

      questions.forEach(q => {
        const pt = q.points || 1;
        totalPoints += pt;
        const userChoice = this.userAnswers[q.id];
        if (typeof userChoice === 'number' && userChoice === q.correctIndex) {
          earnedPoints += pt;
        }
      });

      const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const passed = percentage >= (this.activeQuiz.passingScore || 60);

      const submissionRecord = {
        id: 'sub_' + Date.now(),
        quizId: this.activeQuiz.id,
        quizTitle: this.activeQuiz.title,
        category: this.activeQuiz.category,
        seekerId: currentUser.id || 'seeker-unknown',
        seekerName: currentUser.name || 'Anonymous Seeker',
        seekerEmail: currentUser.email || '',
        spiritualName: currentUser.spiritualName || currentUser.name || '',
        score: earnedPoints,
        totalQuestions: questions.length,
        percentage: percentage,
        passed: passed,
        userAnswers: { ...this.userAnswers },
        submittedAt: new Date().toISOString()
      };

      // Save to global results
      this.results.unshift(submissionRecord);
      this.saveResults();

      // Close player modal
      const pModal = document.getElementById('quiz-player-modal');
      if (pModal) pModal.classList.remove('active');

      // Display Dedicated Result Screen (showing ONLY seeker's selections, NO master answers)
      this.renderResultScreen(submissionRecord);
      this.renderQuizList('quizzes-grid-container');
    }

    /* ================= Result Card Display =================
     * NOTE: As specifically requested by the user:
     * "sahi answer direct na dikhe usne jo lgaya hai bss wahi dikhe"
     * The correct master answer key is NEVER revealed here!
     * Only seeker's selected option and submission status are shown.
     */
    renderResultScreen(record) {
      let modal = document.getElementById('quiz-result-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'quiz-result-modal';
        modal.className = 'quiz-modal-overlay active';
        document.body.appendChild(modal);
      } else {
        modal.classList.add('active');
      }

      document.body.style.overflow = 'hidden';

      const quiz = this.activeQuiz || this.quizzes.find(q => q.id === record.quizId);
      const questions = quiz ? (quiz.questions || []) : [];

      modal.innerHTML = `
        <div class="quiz-modal-dialog quiz-result-dialog">
          <!-- Top Congratulations/Status Banner -->
          <div class="quiz-result-header ${record.passed ? 'passed' : 'failed'}">
            <div class="quiz-result-icon">${record.passed ? '🏆' : '📿'}</div>
            <div class="sanskrit-subtitle" style="justify-content: center; margin-bottom: 0.25rem;">
              ${record.passed ? 'परीक्षा उत्तीर्ण • Auspicious Realization' : 'अध्ययन साधना • Continued Practice'}
            </div>
            <h3 class="font-cinzel" style="font-size: 1.6rem; color: #fff; margin-bottom: 0.25rem;">
              ${record.passed ? 'Congratulations, Seeker!' : 'Evaluation Submitted'}
            </h3>
            <div style="font-family: var(--font-editorial); color: var(--gold-light); font-size: 1.1rem; font-style: italic;">
              ${this.escapeHtml(record.spiritualName || record.seekerName)}
            </div>
          </div>

          <!-- Score Metrics Card -->
          <div class="quiz-result-metrics-grid">
            <div class="quiz-metric-box">
              <span class="quiz-metric-label">Total Score</span>
              <span class="quiz-metric-val font-cinzel" style="color: ${record.passed ? '#86efac' : '#fca5a5'};">
                ${record.score} / ${record.totalQuestions}
              </span>
            </div>
            <div class="quiz-metric-box">
              <span class="quiz-metric-label">Percentage</span>
              <span class="quiz-metric-val font-cinzel" style="color: var(--gold-light);">
                ${record.percentage}%
              </span>
            </div>
            <div class="quiz-metric-box">
              <span class="quiz-metric-label">Status</span>
              <span class="quiz-metric-val" style="font-size: 1.1rem; font-weight: 700; color: ${record.passed ? '#86efac' : '#fde68a'};">
                ${record.passed ? '✅ Passed' : '⚠️ Practice Needed'}
              </span>
            </div>
          </div>

          <!-- Submitted Answers Review (NO correct answer revealed) -->
          <div class="quiz-review-section">
            <div class="quiz-review-heading">
              <span style="font-size: 1.2rem;">📝</span>
              <span style="font-weight: 700; color: #fff;">आपके द्वारा दिए गए उत्तर (Your Submitted Answers)</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
              नोट: नीचे केवल आपके द्वारा चुने गए विकल्प प्रदर्शित हैं। सही उत्तर कुंजी सुरक्षित है।
            </p>

            <div class="quiz-review-list">
              ${questions.map((q, idx) => {
                const userChoiceIdx = record.userAnswers[q.id];
                const hasAnswered = typeof userChoiceIdx === 'number';
                const userChoiceText = hasAnswered ? q.options[userChoiceIdx] : 'उत्तर नहीं दिया गया (Not Attempted)';
                const optionLetters = ['A', 'B', 'C', 'D'];
                const letter = hasAnswered ? (optionLetters[userChoiceIdx] || '') : '-';

                return `
                  <div class="quiz-review-item">
                    <div class="quiz-review-q">
                      <span class="q-num">Q${idx + 1}.</span>
                      <span>${this.escapeHtml(q.question)}</span>
                    </div>
                    <div class="quiz-review-choice">
                      <span class="choice-tag">आपने चुना (Your Answer):</span>
                      <strong class="choice-text ${hasAnswered ? 'answered' : 'unanswered'}">
                        ${hasAnswered ? `[${letter}] ${this.escapeHtml(userChoiceText)}` : 'उत्तर नहीं दिया'}
                      </strong>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Bottom Actions -->
          <div class="quiz-result-footer">
            <button class="btn btn-outline btn-sm" onclick="window.quizEngine.closeResultModal()">
              <span>← Browse Other Quizzes</span>
            </button>
            <a href="sanctuary.html" class="btn btn-primary btn-sm">
              <span>🪷 View My Seeker Scorecard →</span>
            </a>
          </div>
        </div>
      `;
    }

    closeResultModal() {
      const modal = document.getElementById('quiz-result-modal');
      if (modal) modal.classList.remove('active');
      document.body.style.overflow = '';
      this.refreshActiveViews();
    }

    /* ================= Seeker Profile Scorecard (sanctuary.html) ================= */
    renderSeekerHistory(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      let currentUser = null;
      if (window.authManager && typeof window.authManager.getCurrentUser === 'function') {
        currentUser = window.authManager.getCurrentUser();
      }

      if (!currentUser) {
        container.innerHTML = `
          <div style="text-align: center; padding: 2.5rem; background: rgba(0,0,0,0.25); border-radius: 16px; border: 1px dashed var(--border-subtle);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🔐</div>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">Please log in to view your Vedic Quiz achievements.</p>
            <a href="login.html" class="btn btn-outline btn-sm">Log In</a>
          </div>
        `;
        return;
      }

      const userEmail = (currentUser.email || '').toLowerCase();
      const userSubmissions = this.results.filter(r => 
        (r.seekerEmail || '').toLowerCase() === userEmail || r.seekerId === currentUser.id
      );

      if (userSubmissions.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 2.5rem; background: rgba(26, 10, 4, 0.4); border-radius: 16px; border: 1px dashed rgba(245, 158, 11, 0.3);">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🪔</div>
            <h4 class="font-cinzel" style="color: #fed7aa; margin-bottom: 0.35rem;">No Examinations Taken Yet</h4>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.25rem;">
              You have not attempted any Vedic Wisdom Quizzes yet. Test your understanding of Ramayana, Gita, and Harinama Chintamani!
            </p>
            <a href="quiz.html" class="btn btn-primary btn-sm">
              <span>🏆 Explore Vedic Quizzes</span>
            </a>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="seeker-quiz-history-grid">
          ${userSubmissions.map(sub => `
            <div class="seeker-quiz-history-card">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                <span class="quiz-card-badge" style="font-size: 0.72rem; padding: 0.2rem 0.55rem; color: #f59e0b; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3);">
                  ${this.escapeHtml(sub.category || 'Vedic Quiz')}
                </span>
                <span style="font-size: 0.8rem; color: ${sub.passed ? '#86efac' : '#fde68a'}; font-weight: 700;">
                  ${sub.passed ? '✅ Passed' : '⚠️ Attempted'}
                </span>
              </div>

              <h4 style="font-size: 1.05rem; color: #fff; font-weight: 700; line-height: 1.35; margin-bottom: 0.5rem;">
                ${this.escapeHtml(sub.quizTitle)}
              </h4>

              <div style="display: flex; gap: 1.25rem; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.85rem;">
                <div>Score: <strong style="color: #fff;">${sub.score}/${sub.totalQuestions}</strong></div>
                <div>Percentage: <strong style="color: var(--gold-light);">${sub.percentage}%</strong></div>
                <div>Date: <span>${new Date(sub.submittedAt || Date.now()).toLocaleDateString()}</span></div>
              </div>

              <div style="text-align: right;">
                <button class="btn btn-outline btn-sm" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="window.quizEngine.showUserPastResult('${sub.id}')">
                  👁️ View My Choices
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    showUserPastResult(subId) {
      const sub = this.results.find(r => r.id === subId);
      if (sub) {
        this.renderResultScreen(sub);
      }
    }

    /* ================= Master Admin Management (admin.html) ================= */
    renderAdminSubmissionsTable(tbodyId, searchFilter, quizFilter) {
      const tbody = document.getElementById(tbodyId);
      if (!tbody) return;

      let list = [...this.results];

      if (quizFilter && quizFilter !== 'all') {
        list = list.filter(r => r.quizId === quizFilter);
      }

      if (searchFilter) {
        const qClean = searchFilter.toLowerCase();
        list = list.filter(r => 
          (r.seekerName || '').toLowerCase().includes(qClean) ||
          (r.seekerEmail || '').toLowerCase().includes(qClean) ||
          (r.quizTitle || '').toLowerCase().includes(qClean)
        );
      }

      const counterBadge = document.getElementById('admin-quiz-submissions-count');
      if (counterBadge) {
        counterBadge.textContent = `${list.length} Submissions`;
      }

      if (list.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
              📿 No quiz submissions found matching the criteria.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = list.map(sub => `
        <tr data-sub-id="${sub.id}">
          <td>
            <div style="font-weight: 600; color: #fff;">${this.escapeHtml(sub.seekerName)}</div>
            <div style="font-size: 0.76rem; color: var(--gold-light); font-style: italic;">${this.escapeHtml(sub.spiritualName || '')}</div>
          </td>
          <td>
            <div style="font-family: monospace; font-size: 0.82rem; color: var(--text-secondary);">${this.escapeHtml(sub.seekerEmail)}</div>
          </td>
          <td>
            <div style="font-weight: 600; color: #fed7aa; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${this.escapeHtml(sub.quizTitle)}
            </div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">${this.escapeHtml(sub.category || '')}</div>
          </td>
          <td>
            <span style="font-weight: 700; color: ${sub.passed ? '#86efac' : '#fca5a5'}; font-size: 0.95rem;">
              ${sub.score} / ${sub.totalQuestions}
            </span>
            <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.25rem;">(${sub.percentage}%)</span>
          </td>
          <td>
            <span class="seeker-badge-pill" style="background: ${sub.passed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${sub.passed ? '#86efac' : '#fca5a5'}; border: 1px solid ${sub.passed ? '#22c55e40' : '#ef444440'}; font-size: 0.74rem;">
              ${sub.passed ? 'Passed' : 'Needs Practice'}
            </span>
          </td>
          <td style="font-size: 0.8rem; color: var(--text-muted);">
            ${new Date(sub.submittedAt || Date.now()).toLocaleString()}
          </td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-outline btn-sm" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="window.quizEngine.adminViewSubmissionDetails('${sub.id}')">
                👁️ Details
              </button>
              <button class="btn btn-danger btn-sm" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="window.quizEngine.adminDeleteSubmission('${sub.id}')">
                🗑 Delete
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    renderAdminQuizzesTable(tbodyId) {
      const tbody = document.getElementById(tbodyId);
      if (!tbody) return;

      if (this.quizzes.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
              No active quizzes. Click "➕ Create New Quiz" to add one!
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = this.quizzes.map(q => `
        <tr>
          <td>
            <div style="font-weight: 700; color: #fff;">${this.escapeHtml(q.title)}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${this.escapeHtml(q.description || '')}</div>
          </td>
          <td>
            <span class="video-tag-pill" style="font-size: 0.72rem;">${this.escapeHtml(q.category)}</span>
          </td>
          <td style="font-family: monospace; color: var(--gold-light); font-size: 0.85rem;">
            ${(q.questions || []).length} MCQs
          </td>
          <td style="font-size: 0.82rem; color: var(--text-secondary);">
            ${q.durationMinutes || 10} min
          </td>
          <td style="font-size: 0.82rem; color: #86efac; font-weight: 600;">
            ${q.passingScore || 60}%
          </td>
          <td style="text-align: right;">
            <button class="btn btn-danger btn-sm" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="window.quizEngine.adminDeleteQuiz('${q.id}')">
              🗑 Delete
            </button>
          </td>
        </tr>
      `).join('');
    }

    adminViewSubmissionDetails(subId) {
      const sub = this.results.find(r => r.id === subId);
      if (!sub) return;

      const quiz = this.quizzes.find(q => q.id === sub.quizId);
      const questions = quiz ? (quiz.questions || []) : [];

      let modal = document.getElementById('admin-sub-details-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-sub-details-modal';
        modal.className = 'quiz-modal-overlay active';
        document.body.appendChild(modal);
      } else {
        modal.classList.add('active');
      }

      const optionLetters = ['A', 'B', 'C', 'D'];

      modal.innerHTML = `
        <div class="quiz-modal-dialog" style="max-width: 650px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem;">
            <div>
              <div class="sanskrit-subtitle" style="justify-content: flex-start; margin-bottom: 0.25rem;">साधक परीक्षा पत्र • Seeker Submission Sheet</div>
              <h3 class="font-cinzel" style="color: #fff; font-size: 1.4rem;">${this.escapeHtml(sub.quizTitle)}</h3>
              <div style="color: var(--gold-light); font-size: 0.95rem; margin-top: 0.25rem;">
                <strong>${this.escapeHtml(sub.seekerName)}</strong> (${this.escapeHtml(sub.seekerEmail)})
              </div>
            </div>
            <button class="quiz-player-close-btn" onclick="document.getElementById('admin-sub-details-modal').classList.remove('active')">✕</button>
          </div>

          <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 12px; border: 1px solid var(--border-subtle);">
            <div>Score: <strong style="color: ${sub.passed ? '#86efac' : '#fca5a5'}; font-size: 1.1rem;">${sub.score}/${sub.totalQuestions} (${sub.percentage}%)</strong></div>
            <div>Result: <strong>${sub.passed ? '✅ Passed' : '⚠️ Failed'}</strong></div>
            <div>Submitted: <span style="color: var(--text-muted); font-size: 0.85rem;">${new Date(sub.submittedAt).toLocaleString()}</span></div>
          </div>

          <div style="max-height: 50vh; overflow-y: auto; padding-right: 0.5rem;">
            ${questions.map((q, idx) => {
              const userChoiceIdx = sub.userAnswers ? sub.userAnswers[q.id] : undefined;
              const hasAnswered = typeof userChoiceIdx === 'number';
              const userChoiceText = hasAnswered ? q.options[userChoiceIdx] : 'उत्तर नहीं दिया';
              const isCorrect = hasAnswered && userChoiceIdx === q.correctIndex;
              const correctText = q.options[q.correctIndex];

              return `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid ${isCorrect ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}; padding: 1rem; border-radius: 10px; margin-bottom: 0.75rem;">
                  <div style="font-weight: 600; color: #fff; margin-bottom: 0.5rem; font-size: 0.95rem;">
                    ${idx + 1}. ${this.escapeHtml(q.question)}
                  </div>
                  <div style="font-size: 0.85rem; margin-bottom: 0.25rem;">
                    <span style="color: var(--text-muted);">साधक का उत्तर (Seeker Chose):</span>
                    <strong style="color: ${isCorrect ? '#86efac' : '#fca5a5'};">
                      ${hasAnswered ? `[${optionLetters[userChoiceIdx]}] ${this.escapeHtml(userChoiceText)}` : 'उत्तर नहीं दिया'}
                    </strong>
                    ${isCorrect ? ' ✅ (Correct)' : ' ❌ (Incorrect)'}
                  </div>
                  <div style="font-size: 0.82rem; color: #fed7aa;">
                    <span>सही उत्तर (Master Correct Answer):</span>
                    <strong>[${optionLetters[q.correctIndex]}] ${this.escapeHtml(correctText)}</strong>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="text-align: right; margin-top: 1.5rem;">
            <button class="btn btn-outline btn-sm" onclick="document.getElementById('admin-sub-details-modal').classList.remove('active')">Close</button>
          </div>
        </div>
      `;
    }

    adminDeleteSubmission(subId) {
      if (confirm('क्या आप सचमुच इस साधक का परिणाम हटाना चाहते हैं?')) {
        this.results = this.results.filter(r => r.id !== subId);
        this.saveResults();
        this.renderAdminSubmissionsTable('admin-quiz-submissions-tbody');
      }
    }

    adminDeleteQuiz(quizId) {
      if (confirm('क्या आप सचमुच इस क्विज़ को हटाना चाहते हैं? इसके परिणाम सुरक्षित रहेंगे।')) {
        this.quizzes = this.quizzes.filter(q => q.id !== quizId);
        this.saveQuizzes();
        this.renderAdminQuizzesTable('admin-quizzes-tbody');
      }
    }

    exportSubmissionsCSV() {
      if (this.results.length === 0) {
        alert('डाउनलोड करने के लिए कोई सबमिशन नहीं है।');
        return;
      }

      const headers = ['Submission ID', 'Seeker Name', 'Spiritual Name', 'Seeker Email', 'Quiz Title', 'Category', 'Score', 'Total Questions', 'Percentage', 'Passed', 'Submitted Date'];
      const rows = this.results.map(r => [
        `"${r.id || ''}"`,
        `"${(r.seekerName || '').replace(/"/g, '""')}"`,
        `"${(r.spiritualName || '').replace(/"/g, '""')}"`,
        `"${r.seekerEmail || ''}"`,
        `"${(r.quizTitle || '').replace(/"/g, '""')}"`,
        `"${r.category || ''}"`,
        `"${r.score || 0}"`,
        `"${r.totalQuestions || 0}"`,
        `"${r.percentage || 0}%"`,
        `"${r.passed ? 'Passed' : 'Failed'}"`,
        `"${r.submittedAt || ''}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `guhyagyan_quiz_results_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    /* ================= Admin Create Quiz Helper ================= */
    addNewQuiz(quizData) {
      if (!quizData.title || !quizData.title.trim()) {
        throw new Error('क्विज़ का शीर्षक दर्ज करना आवश्यक है।');
      }
      if (!quizData.questions || quizData.questions.length === 0) {
        throw new Error('क्विज़ में कम से कम 1 प्रश्न जोड़ना आवश्यक है।');
      }

      const newQuiz = {
        id: 'quiz_' + Date.now(),
        title: quizData.title.trim(),
        category: quizData.category || 'Valmiki Ramayana',
        description: quizData.description ? quizData.description.trim() : 'Sacred wisdom examination.',
        durationMinutes: parseInt(quizData.durationMinutes, 10) || 10,
        passingScore: parseInt(quizData.passingScore, 10) || 60,
        createdAt: new Date().toISOString().split('T')[0],
        questions: quizData.questions
      };

      this.quizzes.unshift(newQuiz);
      this.saveQuizzes();
      this.refreshActiveViews();
      return newQuiz;
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  }

  window.quizEngine = new QuizEngine();

  // Initialize interactive components when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    window.quizEngine.refreshActiveViews();
  });

})(window);
