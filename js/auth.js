/**
 * GuhyaGyan - Seeker Authentication & Session Manager
 * Handles seeker registration, login, logout, profile state, and demo seeker seed
 */

const AUTH_STORAGE_KEY = 'guhyagyan_active_seeker';
const USERS_STORAGE_KEY = 'guhyagyan_seekers_vault';
const SADHANA_STORAGE_KEY = 'guhyagyan_sadhana_state';

// Default Seed Seeker for instant access & demonstration
const DEFAULT_DEMO_SEEKER = {
  id: 'seeker-108',
  name: 'Ananda Giri',
  spiritualName: 'Swami Anandamayi',
  email: 'seeker@guhyagyan.org',
  password: 'omshanti108',
  path: 'Advaita Vedanta & Kundalini Vidya',
  level: 'Dedicated Seeker (Madhyama Sadhaka)',
  avatar: '🪷',
  sadhanaStreak: 14,
  joinedDate: 'Vasant Panchami 2026',
  intention: 'Seeking direct realization of Non-Duality (Brahman) and inner stillness through silent contemplation.'
};

class AuthManager {
  constructor() {
    this.initVault();
  }

  // Initialize vault with default seeker if empty
  initVault() {
    const existing = localStorage.getItem(USERS_STORAGE_KEY);
    if (!existing) {
      const initialUsers = [DEFAULT_DEMO_SEEKER];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
    }
  }

  // Get all registered seekers
  getUsers() {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [DEFAULT_DEMO_SEEKER];
    } catch (e) {
      console.error('Error reading seeker vault:', e);
      return [DEFAULT_DEMO_SEEKER];
    }
  }

  // Save users to storage
  saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  // Get current logged-in seeker
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // Set active user session
  setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
    this.updateNavUI();
  }

  // Register a new seeker (Supabase Cloud + Local Backup)
  async register(userData) {
    const normalizedEmail = userData.email.trim().toLowerCase();

    // 1. If Supabase is connected, register with Supabase Auth
    if (window.supabaseClient) {
      console.log('🌟 Registering seeker with Supabase Cloud Auth...');
      const { data, error } = await window.supabaseClient.auth.signUp({
        email: normalizedEmail,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name.trim(),
            spiritual_name: userData.spiritualName ? userData.spiritualName.trim() : userData.name.trim(),
            path: userData.path || 'Classical Yoga & Meditation',
            level: userData.level || 'Beginning Seeker (Aarambha)',
            avatar: userData.avatar || '🪷'
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new Error('A seeker with this email address is already registered. Please go to Login.');
      }

      const seekerId = data.user ? data.user.id : 'seeker-' + Date.now();

      // Attempt to save extra details into public.profiles table
      if (data.user) {
        try {
          const { error: tableErr } = await window.supabaseClient.from('profiles').upsert([
            {
              id: data.user.id,
              email: normalizedEmail,
              name: userData.name.trim(),
              path: userData.path || 'Classical Yoga & Meditation',
              level: userData.level || 'Beginning Seeker (Aarambha)',
              avatar: userData.avatar || '🪷'
            }
          ]);
          if (tableErr) {
            console.warn('Note on Supabase profile table:', tableErr.message);
          } else {
            console.log('✅ Seeker profile record created in Supabase database.');
          }
        } catch (tableErr) {
          console.warn('Note: Profile table insert skipped or awaiting table schema:', tableErr);
        }
      }

      const newSeeker = {
        id: seekerId,
        name: userData.name.trim(),
        spiritualName: userData.spiritualName ? userData.spiritualName.trim() : userData.name.trim(),
        email: normalizedEmail,
        path: userData.path || 'Classical Yoga & Meditation',
        level: userData.level || 'Beginning Seeker (Aarambha)',
        avatar: userData.avatar || '🪷',
        sadhanaStreak: 1,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        intention: userData.intention || 'Cultivating peace and divine truth within.'
      };

      // Also cache user in local vault for offline reliability
      const users = this.getUsers();
      users.push(newSeeker);
      this.saveUsers(users);

      this.setCurrentUser(newSeeker);
      return newSeeker;
    }

    // 2. Local Fallback (if Supabase is offline)
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      throw new Error('A spiritual seeker with this email address is already initiated.');
    }

    const newSeeker = {
      id: 'seeker-' + Date.now(),
      name: userData.name.trim(),
      spiritualName: userData.spiritualName ? userData.spiritualName.trim() : userData.name.trim(),
      email: normalizedEmail,
      password: userData.password,
      path: userData.path || 'Classical Yoga & Meditation',
      level: userData.level || 'Beginning Seeker (Aarambha)',
      avatar: userData.avatar || '🪷',
      sadhanaStreak: 1,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      intention: userData.intention || 'Cultivating peace and divine truth within.'
    };

    users.push(newSeeker);
    this.saveUsers(users);
    this.setCurrentUser(newSeeker);
    return newSeeker;
  }

  // Log in a seeker (Supabase Cloud + Local Backup)
  async login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();

    // Quick demo account check
    if (normalizedEmail === DEFAULT_DEMO_SEEKER.email && password === DEFAULT_DEMO_SEEKER.password) {
      this.setCurrentUser(DEFAULT_DEMO_SEEKER);
      return DEFAULT_DEMO_SEEKER;
    }

    // 1. If Supabase is connected, sign in via Supabase Auth
    if (window.supabaseClient) {
      console.log('🌟 Logging in seeker with Supabase Cloud Auth...');
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: normalizedEmail,
        password: password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.user) {
        const metadata = data.user.user_metadata || {};

        let profileData = null;
        try {
          const { data: prof } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
          if (prof) profileData = prof;
        } catch (e) { }

        const seeker = {
          id: data.user.id,
          name: profileData?.name || metadata.full_name || metadata.name || data.user.email.split('@')[0],
          spiritualName: metadata.spiritual_name || profileData?.name || metadata.full_name || data.user.email.split('@')[0],
          email: data.user.email,
          path: profileData?.path || metadata.path || 'Classical Yoga & Meditation',
          level: profileData?.level || metadata.level || 'Dedicated Seeker (Madhyama Sadhaka)',
          avatar: profileData?.avatar || metadata.avatar || '🪷',
          sadhanaStreak: 1
        };

        this.setCurrentUser(seeker);
        return seeker;
      }
    }

    // 2. Local Fallback
    const users = this.getUsers();
    const seeker = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!seeker) {
      throw new Error('No seeker found with this sacred address. Please verify or initiate registration.');
    }

    if (seeker.password !== password) {
      throw new Error('The sacred passphrase does not align. Please re-enter.');
    }

    this.setCurrentUser(seeker);
    return seeker;
  }

  // Log out active seeker
  async logout() {
    if (window.supabaseClient) {
      try {
        await window.supabaseClient.auth.signOut();
      } catch (e) { }
    }
    this.setCurrentUser(null);
  }

  // Fill and trigger demo account login
  async loginDemo() {
    return this.login(DEFAULT_DEMO_SEEKER.email, DEFAULT_DEMO_SEEKER.password);
  }

  // Sync Nav Bar UI across all pages
  updateNavUI() {
    const currentUser = this.getCurrentUser();
    const navActions = document.getElementById('nav-auth-actions');
    const sanctuaryLink = document.getElementById('nav-sanctuary-link');

    if (!navActions) return;

    if (currentUser) {
      if (sanctuaryLink) {
        sanctuaryLink.style.display = 'inline-block';
      }
      navActions.innerHTML = `
        <a href="sanctuary.html" class="user-nav-profile" title="Seeker Sanctuary: ${currentUser.name}">
          <div class="avatar-badge">${currentUser.avatar || '🪷'}</div>
          <span class="user-nav-name">${currentUser.name}</span>
        </a>
        <button id="nav-logout-btn" class="btn-ghost-icon" onclick="window.confirmLogoutModal()" title="Log Out of Sanctuary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      `;
    } else {
      if (sanctuaryLink) {
        sanctuaryLink.style.display = 'none';
      }
      navActions.innerHTML = `
        <a href="login.html" class="btn-ghost-icon" id="nav-login-icon" title="Seeker Portal Login">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </a>
      `;
    }
  }
}

// Global Auth Instance
window.authManager = new AuthManager();

// Confirm Logout Dialog handler
window.confirmLogoutModal = function () {
  const modal = document.getElementById('logout-modal');
  if (modal) {
    modal.classList.add('active');
  } else {
    // If no modal in DOM, direct logout
    if (confirm('Peaceful Seeker, do you wish to conclude your sacred session and log out?')) {
      window.authManager.logout();
      window.showToast('You have returned to tranquil stillness. Logged out successfully.', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }
  }
};

window.closeLogoutModal = function () {
  const modal = document.getElementById('logout-modal');
  if (modal) modal.classList.remove('active');
};

window.executeLogout = async function () {
  await window.authManager.logout();
  window.closeLogoutModal();
  window.showToast('Sacred session concluded. May peace accompany your journey.', 'success');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
};

// Check for existing Supabase session and sync auth state
async function syncActiveSession() {
  if (window.supabaseClient) {
    try {
      const { data } = await window.supabaseClient.auth.getSession();
      const session = data ? data.session : null;
      if (session && session.user) {
        const metadata = session.user.user_metadata || {};
        let profileData = null;
        try {
          const { data: prof } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          if (prof) profileData = prof;
        } catch (e) { }

        const seeker = {
          id: session.user.id,
          name: profileData?.name || metadata.full_name || metadata.name || session.user.email.split('@')[0],
          spiritualName: metadata.spiritual_name || profileData?.name || metadata.full_name || session.user.email.split('@')[0],
          email: session.user.email,
          path: profileData?.path || metadata.path || 'Classical Yoga & Meditation',
          level: profileData?.level || metadata.level || 'Dedicated Seeker (Madhyama Sadhaka)',
          avatar: profileData?.avatar || metadata.avatar || '🪷',
          sadhanaStreak: 1
        };
        window.authManager.setCurrentUser(seeker);
      }
    } catch (err) {
      console.warn('Supabase session check notice:', err);
    }
  }
}

// Auto-run UI sync on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.authManager.updateNavUI();
  syncActiveSession();
});
