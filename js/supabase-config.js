/**
 * GuhyaGyan - Supabase Client Configuration
 * Supports environment variables via .env & /api/config
 */

let SUPABASE_URL = 'https://fklfhqhzjwrtnxkafeui.supabase.co';
let SUPABASE_ANON_KEY = 'sb_publishable_TvMB1HDJ-69zITtdUl4nTQ_Uhi5agZu';

// Function to initialize or re-initialize the Supabase client
function initSupabase(url, key) {
  if (window.supabase) {
    try {
      window.supabaseClient = window.supabase.createClient(url, key);
      console.log('✅ Supabase client active:', url);
    } catch (err) {
      console.error('❌ Failed to initialize Supabase client:', err);
    }
  } else {
    console.warn('⚠️ Supabase JS library not found. Please ensure the CDN script is included.');
  }
}

// Initial setup with baseline credentials
initSupabase(SUPABASE_URL, SUPABASE_ANON_KEY);

// Dynamically sync with server environment variables from .env
(async function loadEnvConfig() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const config = await res.json();
      if (config.SUPABASE_URL && config.SUPABASE_ANON_KEY) {
        if (config.SUPABASE_URL !== SUPABASE_URL || config.SUPABASE_ANON_KEY !== SUPABASE_ANON_KEY) {
          SUPABASE_URL = config.SUPABASE_URL;
          SUPABASE_ANON_KEY = config.SUPABASE_ANON_KEY;
          initSupabase(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
      }
    }
  } catch (err) {
    // Running statically or offline without server API, defaults remain active
  }
})();
