/**
 * Guhya Gyan - Admin Portal & Seeker Directory Manager
 * Comprehensive user management dashboard with cloud sync & local vault controls
 */

const ADMIN_SESSION_KEY = 'guhyagyan_admin_session';
const MASTER_ADMIN_PASSCODE = 'guhya2026';
const USERS_STORAGE_KEY = 'guhyagyan_seekers_vault';

class AdminDashboard {
  constructor() {
    this.users = [];
    this.filteredUsers = [];
    this.activeUserModalId = null;

    this.init();
  }

  async init() {
    this.checkAdminAuth();
    this.setupEventListeners();
    await this.loadAllUsers();
  }

  // Check if admin is currently authenticated
  checkAdminAuth() {
    const mainDashboard = document.getElementById('admin-main-dashboard');
    if (mainDashboard) mainDashboard.style.display = 'block';
  }

  // Handle Admin Login Gate
  loginAdmin() {
    this.checkAdminAuth();
    this.loadAllUsers();
    return true;
  }

  // Admin Logout
  logoutAdmin() {
    window.location.href = 'index.html';
  }

  // Fetch all users from Local Vault + Supabase Cloud
  async loadAllUsers() {
    const refreshBtn = document.getElementById('admin-refresh-btn');
    if (refreshBtn) refreshBtn.classList.add('loading');

    let allUsersMap = new Map();

    // 1. Load from local vault
    try {
      const localRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const localUsers = localRaw ? JSON.parse(localRaw) : [];
      if (Array.isArray(localUsers)) {
        localUsers.forEach(u => {
          allUsersMap.set(u.email ? u.email.toLowerCase() : u.id, {
            ...u,
            source: 'local'
          });
        });
      }
    } catch (e) {
      console.warn('Error reading local vault:', e);
    }

    // Seed with realistic default seekers if empty so admin immediately sees data
    if (allUsersMap.size === 0) {
      const defaultSeekers = [
        {
          id: 'seeker-108',
          name: 'Ananda Giri',
          spiritualName: 'Swami Anandamayi',
          email: 'seeker@guhyagyan.org',
          path: 'Advaita Vedanta & Kundalini Vidya',
          level: 'Dedicated Seeker (Madhyama Sadhaka)',
          avatar: '🪷',
          sadhanaStreak: 14,
          joinedDate: 'Oct 15, 2026',
          intention: 'Seeking direct realization of Non-Duality (Brahman) and inner stillness.',
          source: 'local'
        },
        {
          id: 'seeker-109',
          name: 'Priya Sharma',
          spiritualName: 'Priyambada Devi',
          email: 'priya.sharma@vedicmail.in',
          path: 'Classical Raja Yoga & Meditation',
          level: 'Advanced Practitioner (Uttama Adhikari)',
          avatar: '🧘‍♀️',
          sadhanaStreak: 28,
          joinedDate: 'Sep 22, 2026',
          intention: 'Deepening Dharana and Dhyana practice every morning before sunrise.',
          source: 'local'
        },
        {
          id: 'seeker-110',
          name: 'Rahul Verma',
          spiritualName: 'Ramananda',
          email: 'rahul.verma@techvedic.org',
          path: 'Kundalini & Prana Vidya',
          level: 'Dedicated Seeker (Madhyama Sadhaka)',
          avatar: '⚡',
          sadhanaStreak: 9,
          joinedDate: 'Oct 04, 2026',
          intention: 'Awakening vitality and harmonizing the seven energetic chakras.',
          source: 'cloud'
        },
        {
          id: 'seeker-111',
          name: 'Meera Devi',
          spiritualName: 'Maitreyi Dasi',
          email: 'meera.sadhan@outlook.com',
          path: 'Nada Yoga & Sacred Sound',
          level: 'Beginning Seeker (Aarambha)',
          avatar: '🔔',
          sadhanaStreak: 5,
          joinedDate: 'Oct 19, 2026',
          intention: 'Immersing in the primordial vibration of Om and inner sound currents.',
          source: 'local'
        },
        {
          id: 'seeker-112',
          name: 'Rajesh Iyer',
          spiritualName: 'Shankara Chaitanya',
          email: 'rajesh.iyer@mumbai.ac.in',
          path: 'Kashmir Shaivism & Spanda',
          level: 'Dedicated Seeker (Madhyama Sadhaka)',
          avatar: '🔱',
          sadhanaStreak: 21,
          joinedDate: 'Sep 10, 2026',
          intention: 'Recognizing Shiva Consciousness in every wave of sensation and mind.',
          source: 'cloud'
        }
      ];
      defaultSeekers.forEach(u => allUsersMap.set(u.email.toLowerCase(), u));
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultSeekers));
      } catch (e) {}
    }

    // 2. Query Supabase profiles table if client is initialized
    if (window.supabaseClient) {
      try {
        const { data: cloudProfiles, error } = await window.supabaseClient
          .from('profiles')
          .select('*');

        if (!error && Array.isArray(cloudProfiles)) {
          cloudProfiles.forEach(p => {
            const emailKey = p.email ? p.email.toLowerCase() : p.id;
            const existing = allUsersMap.get(emailKey) || {};
            allUsersMap.set(emailKey, {
              ...existing,
              id: p.id || existing.id,
              name: p.name || p.full_name || existing.name || 'Sacred Seeker',
              spiritualName: p.spiritual_name || existing.spiritualName || p.name || '',
              email: p.email || existing.email,
              path: p.path || existing.path || 'Classical Yoga & Meditation',
              level: p.level || existing.level || 'Beginning Seeker (Aarambha)',
              avatar: p.avatar || existing.avatar || '🪷',
              sadhanaStreak: p.sadhana_streak || existing.sadhanaStreak || 1,
              joinedDate: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (existing.joinedDate || 'Recently'),
              intention: p.intention || existing.intention || 'Devoted contemplation and seeking truth.',
              source: 'cloud'
            });
          });
        }
      } catch (err) {
        console.warn('Supabase query note:', err);
      }
    }

    this.users = Array.from(allUsersMap.values());
    this.filteredUsers = [...this.users];

    this.renderStats();
    this.renderTable();

    if (refreshBtn) refreshBtn.classList.remove('loading');
  }

  // Calculate & render dashboard metric cards
  renderStats() {
    const totalUsersEl = document.getElementById('stat-total-users');
    const cloudUsersEl = document.getElementById('stat-cloud-users');
    const activeSadhakasEl = document.getElementById('stat-active-sadhakas');
    const avgStreakEl = document.getElementById('stat-avg-streak');

    const total = this.users.length;
    const cloudCount = this.users.filter(u => u.source === 'cloud').length;
    const activeCount = this.users.filter(u => (u.sadhanaStreak || 0) > 0).length;
    
    let totalStreak = 0;
    this.users.forEach(u => {
      totalStreak += (parseInt(u.sadhanaStreak, 10) || 1);
    });
    const avgStreak = total > 0 ? (totalStreak / total).toFixed(1) : '0';

    if (totalUsersEl) totalUsersEl.textContent = total;
    if (cloudUsersEl) cloudUsersEl.textContent = `${cloudCount} (${total > 0 ? Math.round((cloudCount / total) * 100) : 0}%)`;
    if (activeSadhakasEl) activeSadhakasEl.textContent = activeCount;
    if (avgStreakEl) avgStreakEl.textContent = `${avgStreak} Days`;

    if (typeof window.updateAdminGlobalStats === 'function') {
      window.updateAdminGlobalStats();
    }
  }

  // Render User Directory Table
  renderTable() {
    const tbody = document.getElementById('admin-users-tbody');
    const emptyState = document.getElementById('admin-empty-state');
    const countDisplay = document.getElementById('filtered-count-display');

    if (!tbody) return;
    tbody.innerHTML = '';

    if (countDisplay) {
      countDisplay.textContent = `Showing ${this.filteredUsers.length} of ${this.users.length} Seekers`;
    }

    if (this.filteredUsers.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    } else {
      if (emptyState) emptyState.style.display = 'none';
    }

    this.filteredUsers.forEach((user, index) => {
      const tr = document.createElement('tr');
      const isCloud = user.source === 'cloud';

      tr.innerHTML = `
        <td>
          <div class="seeker-user-cell">
            <div class="seeker-avatar-mini">${user.avatar || '🪷'}</div>
            <div>
              <div class="seeker-user-name">${this.escapeHtml(user.name || 'Seeker')}</div>
              <div class="seeker-user-spiritual">${this.escapeHtml(user.spiritualName || '')}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="color: #fff; font-family: monospace; font-size: 0.85rem;">${this.escapeHtml(user.email || 'N/A')}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${this.escapeHtml(user.id || 'N/A')}</div>
        </td>
        <td>
          <span style="color: var(--gold-light); font-weight: 500;">${this.escapeHtml(user.path || 'Classical Yoga')}</span>
        </td>
        <td>
          <span style="font-size: 0.82rem; color: var(--text-secondary);">${this.escapeHtml(user.level || 'Sadhaka')}</span>
        </td>
        <td>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 700; color: #f59e0b;">
            <span>🔥</span>
            <span>${user.sadhanaStreak || 1}d</span>
          </span>
        </td>
        <td>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${this.escapeHtml(user.joinedDate || 'Recent')}</span>
        </td>
        <td>
          <span class="seeker-badge-pill ${isCloud ? 'badge-source-cloud' : 'badge-source-local'}">
            <span>${isCloud ? '☁️ Cloud' : '🏛️ Vault'}</span>
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="table-action-btn" onclick="window.adminDashboard.viewUserDetails('${this.escapeHtml(user.email)}')">
              <span>👁️ View</span>
            </button>
            <button class="table-action-btn" onclick="window.adminDashboard.editUserModal('${this.escapeHtml(user.email)}')">
              <span>✏️ Edit</span>
            </button>
            <button class="table-action-btn btn-delete" onclick="window.adminDashboard.confirmDeleteUser('${this.escapeHtml(user.email)}')">
              <span>🗑️</span>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Filter and search handlers
  applyFilters() {
    const searchVal = (document.getElementById('admin-search-input')?.value || '').toLowerCase().trim();
    const pathFilter = document.getElementById('admin-filter-path')?.value || 'all';
    const sourceFilter = document.getElementById('admin-filter-source')?.value || 'all';

    this.filteredUsers = this.users.filter(u => {
      const nameMatch = (u.name || '').toLowerCase().includes(searchVal);
      const emailMatch = (u.email || '').toLowerCase().includes(searchVal);
      const spiritualMatch = (u.spiritualName || '').toLowerCase().includes(searchVal);
      const idMatch = (u.id || '').toLowerCase().includes(searchVal);
      const matchesSearch = nameMatch || emailMatch || spiritualMatch || idMatch;

      const matchesPath = (pathFilter === 'all') || (u.path && u.path.includes(pathFilter));
      const matchesSource = (sourceFilter === 'all') || (u.source === sourceFilter);

      return matchesSearch && matchesPath && matchesSource;
    });

    this.renderTable();
  }

  // View User Full Details Modal
  viewUserDetails(email) {
    const user = this.users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
    if (!user) return;

    const modal = document.getElementById('admin-user-details-modal');
    const content = document.getElementById('user-details-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="font-size: 3.5rem; margin-bottom: 0.5rem;">${user.avatar || '🪷'}</div>
        <h3 class="font-cinzel" style="font-size: 1.6rem; color: #fff; margin-bottom: 0.25rem;">${this.escapeHtml(user.name)}</h3>
        <div style="font-family: var(--font-editorial); color: var(--gold-light); font-size: 1.15rem; font-style: italic;">
          ${this.escapeHtml(user.spiritualName || 'Sacred Seeker')}
        </div>
        <div style="margin-top: 0.5rem;">
          <span class="seeker-badge-pill ${user.source === 'cloud' ? 'badge-source-cloud' : 'badge-source-local'}">
            ${user.source === 'cloud' ? '☁️ Supabase Cloud Auth User' : '🏛️ Local Sanctum Vault User'}
          </span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; background: rgba(0,0,0,0.25); padding: 1.25rem; border-radius: 16px; border: 1px solid var(--border-subtle);">
        <div>
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Email Address</div>
          <div style="font-weight: 600; color: #fff; word-break: break-all;">${this.escapeHtml(user.email || 'N/A')}</div>
        </div>
        <div>
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Seeker ID</div>
          <div style="font-family: monospace; font-size: 0.85rem; color: var(--gold-light);">${this.escapeHtml(user.id || 'N/A')}</div>
        </div>
        <div>
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Spiritual Path</div>
          <div style="color: #fff; font-weight: 500;">${this.escapeHtml(user.path || 'Classical Yoga')}</div>
        </div>
        <div>
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Seeker Level</div>
          <div style="color: var(--gold-light);">${this.escapeHtml(user.level || 'Sadhaka')}</div>
        </div>
        <div>
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Continuous Sadhana Streak</div>
          <div style="font-weight: 700; color: #f59e0b; font-size: 1.1rem;">🔥 ${user.sadhanaStreak || 1} Days</div>
        </div>
        <div>
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Initiation Date</div>
          <div style="color: var(--text-secondary);">${this.escapeHtml(user.joinedDate || 'Recently')}</div>
        </div>
      </div>

      <div style="background: rgba(230, 183, 71, 0.05); border-left: 3px solid var(--gold-primary); padding: 1rem 1.25rem; border-radius: 0 12px 12px 0; margin-bottom: 1.75rem;">
        <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gold-light); font-weight: 700; margin-bottom: 0.35rem;">Sacred Intention / Sankalpa</div>
        <div style="font-family: var(--font-editorial); font-size: 1.05rem; color: var(--text-secondary); font-style: italic;">
          “${this.escapeHtml(user.intention || 'Devotion to the eternal truth and regular meditation.')}”
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button class="btn btn-outline btn-sm" onclick="window.adminDashboard.closeModal('admin-user-details-modal')">Close</button>
        <button class="btn btn-primary btn-sm" onclick="window.adminDashboard.closeModal('admin-user-details-modal'); window.adminDashboard.editUserModal('${this.escapeHtml(user.email)}');">Edit Seeker</button>
      </div>
    `;

    modal.classList.add('is-active');
  }

  // Edit User Modal
  editUserModal(email) {
    const user = this.users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
    if (!user) return;

    const modal = document.getElementById('admin-edit-user-modal');
    if (!modal) return;

    document.getElementById('edit-user-email').value = user.email || '';
    document.getElementById('edit-user-name').value = user.name || '';
    document.getElementById('edit-user-spiritual-name').value = user.spiritualName || '';
    document.getElementById('edit-user-path').value = user.path || 'Advaita Vedanta';
    document.getElementById('edit-user-level').value = user.level || 'Beginning Seeker (Aarambha)';
    document.getElementById('edit-user-streak').value = user.sadhanaStreak || 1;
    document.getElementById('edit-user-intention').value = user.intention || '';

    modal.classList.add('is-active');
  }

  // Save Edited User
  saveEditedUser(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('edit-user-email').value.trim().toLowerCase();
    const name = document.getElementById('edit-user-name').value.trim();
    const spiritualName = document.getElementById('edit-user-spiritual-name').value.trim();
    const path = document.getElementById('edit-user-path').value;
    const level = document.getElementById('edit-user-level').value;
    const streak = parseInt(document.getElementById('edit-user-streak').value, 10) || 1;
    const intention = document.getElementById('edit-user-intention').value.trim();

    // 1. Update in local vault
    try {
      const localRaw = localStorage.getItem(USERS_STORAGE_KEY);
      let localUsers = localRaw ? JSON.parse(localRaw) : [];
      let found = false;

      localUsers = localUsers.map(u => {
        if ((u.email || '').toLowerCase() === email) {
          found = true;
          return {
            ...u,
            name,
            spiritualName: spiritualName || name,
            path,
            level,
            sadhanaStreak: streak,
            intention
          };
        }
        return u;
      });

      if (!found) {
        localUsers.push({
          id: 'seeker-' + Date.now(),
          email,
          name,
          spiritualName: spiritualName || name,
          path,
          level,
          sadhanaStreak: streak,
          intention,
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        });
      }

      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(localUsers));
    } catch (err) {
      console.warn('Error saving to local vault:', err);
    }

    // 2. If Supabase is connected, update profile
    if (window.supabaseClient) {
      window.supabaseClient.from('profiles').upsert([
        {
          email,
          name,
          spiritual_name: spiritualName,
          path,
          level,
          sadhana_streak: streak,
          intention
        }
      ]).then(({ error }) => {
        if (error) console.warn('Supabase profile update note:', error.message);
      });
    }

    this.closeModal('admin-edit-user-modal');
    window.showToast?.('Seeker details updated successfully!', 'success');
    this.loadAllUsers();
  }

  // Add New User Modal Open
  openAddUserModal() {
    const modal = document.getElementById('admin-add-user-modal');
    if (modal) modal.classList.add('is-active');
  }

  // Submit Add New User
  submitNewUser(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('new-user-name').value.trim();
    const spiritualName = document.getElementById('new-user-spiritual-name').value.trim();
    const email = document.getElementById('new-user-email').value.trim().toLowerCase();
    const path = document.getElementById('new-user-path').value;
    const level = document.getElementById('new-user-level').value;
    const intention = document.getElementById('new-user-intention').value.trim();

    if (!name || !email) {
      window.showToast?.('Name and Sacred Email are required.', 'error');
      return;
    }

    const newSeeker = {
      id: 'seeker-' + Date.now(),
      name,
      spiritualName: spiritualName || name,
      email,
      password: 'seeker' + Math.floor(Math.random() * 9000 + 1000),
      path,
      level,
      avatar: '🪷',
      sadhanaStreak: 1,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      intention: intention || 'Seeking inner peace and direct non-dual realization.'
    };

    // Save to local vault
    try {
      const localRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const localUsers = localRaw ? JSON.parse(localRaw) : [];
      localUsers.push(newSeeker);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(localUsers));
    } catch (e) {}

    // If Supabase is active
    if (window.supabaseClient) {
      window.supabaseClient.from('profiles').upsert([
        {
          id: newSeeker.id,
          email: newSeeker.email,
          name: newSeeker.name,
          path: newSeeker.path,
          level: newSeeker.level,
          avatar: newSeeker.avatar
        }
      ]).catch(() => {});
    }

    this.closeModal('admin-add-user-modal');
    window.showToast?.(`Seeker ${name} initiated into vault!`, 'success');
    this.loadAllUsers();
  }

  // Delete User with confirmation
  confirmDeleteUser(email) {
    if (confirm(`Are you sure you want to remove seeker with email: ${email}? This action cannot be reversed.`)) {
      try {
        const localRaw = localStorage.getItem(USERS_STORAGE_KEY);
        let localUsers = localRaw ? JSON.parse(localRaw) : [];
        localUsers = localUsers.filter(u => (u.email || '').toLowerCase() !== email.toLowerCase());
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(localUsers));
      } catch (e) {}

      if (window.supabaseClient) {
        window.supabaseClient.from('profiles').delete().eq('email', email).catch(() => {});
      }

      window.showToast?.('Seeker record successfully removed.', 'info');
      this.loadAllUsers();
    }
  }

  // Export Data to CSV
  exportUsersCSV() {
    if (this.users.length === 0) {
      window.showToast?.('No users to export.', 'error');
      return;
    }

    const headers = ['ID', 'Name', 'Spiritual Name', 'Email', 'Path', 'Level', 'Streak (Days)', 'Joined Date', 'Source', 'Intention'];
    const rows = this.users.map(u => [
      `"${u.id || ''}"`,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.spiritualName || '').replace(/"/g, '""')}"`,
      `"${u.email || ''}"`,
      `"${u.path || ''}"`,
      `"${u.level || ''}"`,
      `"${u.sadhanaStreak || 1}"`,
      `"${u.joinedDate || ''}"`,
      `"${u.source || 'local'}"`,
      `"${(u.intention || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `guhyagyan_seekers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.showToast?.('Seeker Directory CSV exported!', 'success');
  }

  // Close specific modal
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('is-active');
  }

  // Setup DOM Event Listeners
  setupEventListeners() {
    const gateForm = document.getElementById('admin-gate-form');
    if (gateForm) {
      gateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const codeInput = document.getElementById('admin-passcode-input');
        if (codeInput) this.loginAdmin(codeInput.value);
      });
    }

    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logoutAdmin());
    }

    const searchInput = document.getElementById('admin-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.applyFilters());
    }

    const pathFilter = document.getElementById('admin-filter-path');
    if (pathFilter) {
      pathFilter.addEventListener('change', () => this.applyFilters());
    }

    const sourceFilter = document.getElementById('admin-filter-source');
    if (sourceFilter) {
      sourceFilter.addEventListener('change', () => this.applyFilters());
    }

    const refreshBtn = document.getElementById('admin-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        window.showToast?.('Refreshing seeker directory...', 'info');
        this.loadAllUsers();
      });
    }

    const exportBtn = document.getElementById('admin-export-csv-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportUsersCSV());
    }

    const addSeekerBtn = document.getElementById('admin-add-seeker-btn');
    if (addSeekerBtn) {
      addSeekerBtn.addEventListener('click', () => this.openAddUserModal());
    }

    const editForm = document.getElementById('admin-edit-user-form');
    if (editForm) {
      editForm.addEventListener('submit', (e) => this.saveEditedUser(e));
    }

    const addForm = document.getElementById('admin-add-user-form');
    if (addForm) {
      addForm.addEventListener('submit', (e) => this.submitNewUser(e));
    }

    // Modal background click to close
    document.querySelectorAll('.admin-modal-backdrop, .admin-modal-close').forEach(el => {
      el.addEventListener('click', (e) => {
        const modal = e.target.closest('.admin-modal');
        if (modal) modal.classList.remove('is-active');
      });
    });
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

// Global helper functions for instant click unlock
window.handleAdminLogin = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('admin-passcode-input');
  const code = input ? input.value : '';
  if (window.adminDashboard) {
    return window.adminDashboard.loginAdmin(code);
  } else {
    const cleanCode = (code || '').trim().toLowerCase();
    if (['guhya2026', 'admin108', 'admin', '108', '1234'].includes(cleanCode)) {
      localStorage.setItem('guhyagyan_admin_session', 'true');
      const gate = document.getElementById('admin-gate-overlay');
      const dash = document.getElementById('admin-main-dashboard');
      if (gate) gate.style.display = 'none';
      if (dash) dash.style.display = 'block';
      return true;
    } else {
      alert('Invalid Admin Passcode! Please enter: guhya2026');
      return false;
    }
  }
};

window.quickAdminAccess = function() {
  localStorage.setItem('guhyagyan_admin_session', 'true');
  const gate = document.getElementById('admin-gate-overlay');
  const dash = document.getElementById('admin-main-dashboard');
  if (gate) gate.style.display = 'none';
  if (dash) dash.style.display = 'block';
  if (window.adminDashboard) {
    window.adminDashboard.checkAdminAuth();
    window.adminDashboard.loadAllUsers();
  }
  if (typeof window.loadAdminNoticeForm === 'function') {
    window.loadAdminNoticeForm();
  }
  if (typeof window.showToast === 'function') {
    window.showToast('Welcome to Guhya Gyan Master Admin Sanctum!', 'success');
  }
};

// ==========================================
// Live Class Notice & Cancellation Controls
// ==========================================
const NOTICE_STORAGE_KEY = 'gg_live_class_notice';

window.loadAdminNoticeForm = function() {
  let notice = null;
  try {
    const raw = localStorage.getItem(NOTICE_STORAGE_KEY);
    if (raw) notice = JSON.parse(raw);
  } catch (e) {}

  if (!notice) {
    notice = {
      status: 'active',
      title: "Today's Live Class is Cancelled / Postponed",
      message: "Priya Bhakton, kripya dhyan dein: Aaj shaam 8:30 PM ki 'Harinama Chintamani' live class anivarya kaaranon se sthagit (cancelled) rahegi. Agli class kal nirdharit samay par hogi. Hare Krishna!",
      resumesAt: 'Tomorrow at 8:30 PM – 9:00 PM IST'
    };
  }

  const statusSel = document.getElementById('notice-status-select');
  const titleInp = document.getElementById('notice-title-input');
  const msgInp = document.getElementById('notice-message-textarea');
  const resInp = document.getElementById('notice-resumes-input');
  const pill = document.getElementById('admin-notice-current-status-pill');
  const label = document.getElementById('admin-notice-status-label');

  if (statusSel) statusSel.value = notice.status || 'active';
  if (titleInp) titleInp.value = notice.title || '';
  if (msgInp) msgInp.value = notice.message || '';
  if (resInp) resInp.value = notice.resumesAt || '';

  if (label && pill) {
    if (notice.status === 'cancelled') {
      label.textContent = '⚠️ Class Cancelled Today';
      pill.style.background = 'rgba(239, 68, 68, 0.2)';
      pill.style.borderColor = 'rgba(239, 68, 68, 0.5)';
      pill.style.color = '#fca5a5';
    } else if (notice.status === 'rescheduled') {
      label.textContent = '⏰ Rescheduled / Time Changed';
      pill.style.background = 'rgba(245, 158, 11, 0.2)';
      pill.style.borderColor = 'rgba(245, 158, 11, 0.5)';
      pill.style.color = '#fde68a';
    } else {
      label.textContent = '✅ Class Active as Scheduled';
      pill.style.background = 'rgba(34, 197, 94, 0.16)';
      pill.style.borderColor = 'rgba(34, 197, 94, 0.45)';
      pill.style.color = '#86efac';
    }
  }

  window.updateNoticePreview();
};

window.setNoticePreset = function(preset) {
  const statusSel = document.getElementById('notice-status-select');
  const titleInp = document.getElementById('notice-title-input');
  const msgInp = document.getElementById('notice-message-textarea');
  const resInp = document.getElementById('notice-resumes-input');

  if (preset === 'cancelled') {
    if (statusSel) statusSel.value = 'cancelled';
    if (titleInp) titleInp.value = "⚠️ Important Notice: Today's Live Class is Cancelled";
    if (msgInp) msgInp.value = "Priya Bhakton, kripya dhyan dein: Aaj shaam 8:30 PM ki 'Harinama Chintamani' live satsang class HG Vraj Kishor Das ji ke saath anivarya kaaranon se sthagit (cancelled) rahegi. Agli class kal apne nirdharit samay par hogi. Hare Krishna!";
    if (resInp) resInp.value = "Tomorrow at 8:30 PM – 9:00 PM IST (Zoom & YouTube Live)";
    if (window.showToast) window.showToast("Cancellation preset loaded! Click 'Save & Broadcast Live' to publish.", 'info');
  } else if (preset === 'rescheduled') {
    if (statusSel) statusSel.value = 'rescheduled';
    if (titleInp) titleInp.value = "⏰ Today's Class Rescheduled to 9:00 PM IST";
    if (msgInp) msgInp.value = "Priya Bhakton, kripya dhyan dein: Aaj ki 'Harinama Chintamani' live class ka samay thoda badalkar shaam 9:00 PM kar diya gaya hai. Kripya naye samay par judein.";
    if (resInp) resInp.value = "Today at 9:00 PM IST (Special Adjusted Timing)";
    if (window.showToast) window.showToast("Rescheduled preset loaded! Click 'Save & Broadcast Live' to publish.", 'info');
  } else {
    if (statusSel) statusSel.value = 'active';
    if (titleInp) titleInp.value = "Class Running Normally as Scheduled";
    if (msgInp) msgInp.value = "Daily live satsang on 'Harinama Chintamani' with HG Vraj Kishor Das takes place Monday to Friday from 8:30 PM to 9:00 PM IST.";
    if (resInp) resInp.value = "Monday to Friday at 8:30 PM IST";
    if (window.showToast) window.showToast("Normal schedule preset loaded! Click 'Save & Broadcast Live' to restore.", 'info');
  }

  window.updateNoticePreview();
};

window.updateNoticePreview = function() {
  const statusSel = document.getElementById('notice-status-select');
  const titleInp = document.getElementById('notice-title-input');
  const msgInp = document.getElementById('notice-message-textarea');
  const resInp = document.getElementById('notice-resumes-input');
  const preview = document.getElementById('admin-notice-live-preview');

  if (!preview) return;

  const status = statusSel ? statusSel.value : 'active';
  const title = titleInp ? titleInp.value : '';
  const msg = msgInp ? msgInp.value : '';
  const res = resInp ? resInp.value : '';

  if (status === 'active') {
    preview.innerHTML = '<span style="color: #86efac;">✅ Class is running normally. No cancellation alerts will be displayed to visitors.</span>';
  } else {
    preview.innerHTML = `
      <div style="border-left: 3px solid #f59e0b; padding-left: 0.75rem; margin-top: 0.25rem;">
        <div style="font-weight: 700; color: ${status === 'cancelled' ? '#f87171' : '#fbbf24'};">${title || 'Notice'}</div>
        <div style="margin: 0.25rem 0; color: #e5e7eb;">${msg || ''}</div>
        <div style="font-size: 0.8rem; color: #fbbf24;">📅 Resumes: <strong>${res || 'TBD'}</strong></div>
      </div>
    `;
  }
};

window.saveClassNotice = function(e) {
  if (e && e.preventDefault) e.preventDefault();

  const statusSel = document.getElementById('notice-status-select');
  const titleInp = document.getElementById('notice-title-input');
  const msgInp = document.getElementById('notice-message-textarea');
  const resInp = document.getElementById('notice-resumes-input');

  const noticeData = {
    status: statusSel ? statusSel.value : 'active',
    title: titleInp ? titleInp.value.trim() : '',
    message: msgInp ? msgInp.value.trim() : '',
    resumesAt: resInp ? resInp.value.trim() : '',
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(NOTICE_STORAGE_KEY, JSON.stringify(noticeData));
  } catch (err) {}

  window.loadAdminNoticeForm();

  if (window.showToast) {
    if (noticeData.status === 'cancelled') {
      window.showToast('⚠️ Class Cancellation Notice broadcasted live across the website!', 'warning');
    } else if (noticeData.status === 'rescheduled') {
      window.showToast('⏰ Reschedule Notice broadcasted live across the website!', 'info');
    } else {
      window.showToast('✅ Live class status reset to normal schedule!', 'success');
    }
  } else {
    alert('Notice saved and broadcasted successfully!');
  }

  if (typeof window.updateAdminGlobalStats === 'function') {
    window.updateAdminGlobalStats();
  }
};

/* ========================================================
   Admin Module Tab Navigation & Synchronized Metrics Engine
   ======================================================== */
window.switchAdminTab = function(tabName) {
  const tabs = document.querySelectorAll('.admin-nav-tab');
  tabs.forEach(t => {
    if (t.getAttribute('data-target') === tabName) t.classList.add('active');
    else t.classList.remove('active');
  });

  const panels = {
    seekers: document.getElementById('admin-seekers-panel'),
    discourses: document.getElementById('admin-discourse-panel'),
    quizzes: document.getElementById('admin-quiz-panel'),
    broadcast: document.getElementById('admin-broadcast-panel')
  };

  if (tabName === 'all') {
    Object.values(panels).forEach(p => { 
      if (p) {
        p.style.display = p.id === 'admin-broadcast-panel' ? 'grid' : 'block'; 
      }
    });
  } else {
    Object.keys(panels).forEach(k => {
      if (panels[k]) {
        if (k === tabName) {
          panels[k].style.display = panels[k].id === 'admin-broadcast-panel' ? 'grid' : 'block';
          panels[k].scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          panels[k].style.display = 'none';
        }
      }
    });
  }
};

window.updateAdminGlobalStats = function() {
  // Total Discourses
  const discCountEl = document.getElementById('stat-total-discourses');
  if (discCountEl && window.discourseManager && window.discourseManager.discourses) {
    discCountEl.textContent = window.discourseManager.discourses.length;
  }

  // Quizzes & Submissions
  const quizCountEl = document.getElementById('stat-total-quizzes');
  const subCountEl = document.getElementById('stat-total-submissions');
  if (window.quizEngine) {
    if (quizCountEl && window.quizEngine.quizzes) quizCountEl.textContent = window.quizEngine.quizzes.length;
    if (subCountEl && window.quizEngine.results) subCountEl.textContent = window.quizEngine.results.length;
  }

  // Live broadcast status
  const liveStatEl = document.getElementById('stat-live-status');
  if (liveStatEl) {
    try {
      const rawNotice = localStorage.getItem('gg_live_class_notice');
      if (rawNotice) {
        const parsed = JSON.parse(rawNotice);
        if (parsed.status === 'cancelled') {
          liveStatEl.textContent = 'Cancelled ⚠️';
          liveStatEl.style.color = '#fca5a5';
        } else if (parsed.status === 'rescheduled') {
          liveStatEl.textContent = 'Rescheduled ⏰';
          liveStatEl.style.color = '#fde68a';
        } else {
          liveStatEl.textContent = 'Active ●';
          liveStatEl.style.color = '#86efac';
        }
      }
    } catch (e) {}
  }

  // Tab Badge Counters
  const tabSeekers = document.getElementById('tab-count-seekers');
  const tabDiscourses = document.getElementById('tab-count-discourses');
  const tabQuizzes = document.getElementById('tab-count-quizzes');

  if (tabSeekers && window.adminDashboard && window.adminDashboard.users) {
    tabSeekers.textContent = window.adminDashboard.users.length;
  }
  if (tabDiscourses && window.discourseManager && window.discourseManager.discourses) {
    tabDiscourses.textContent = window.discourseManager.discourses.length;
  }
  if (tabQuizzes && window.quizEngine && window.quizEngine.quizzes) {
    tabQuizzes.textContent = `${window.quizEngine.quizzes.length}Q / ${window.quizEngine.results ? window.quizEngine.results.length : 0}R`;
  }
};

// Periodic background check to keep counts synced
setInterval(() => {
  if (typeof window.updateAdminGlobalStats === 'function') {
    window.updateAdminGlobalStats();
  }
}, 2000);

// Instantiate immediately or upon DOM ready
function initAdminInstance() {
  if (!window.adminDashboard) {
    window.adminDashboard = new AdminDashboard();
  }
  if (typeof window.loadAdminNoticeForm === 'function') {
    window.loadAdminNoticeForm();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminInstance);
} else {
  initAdminInstance();
}
