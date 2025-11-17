import { createClient } from '@supabase/supabase-js'
import { setCachedSession } from './supabaseSession';

// Get Supabase credentials from server endpoint
async function getSupabaseConfig() {
  try {
    const response = await fetch('/api/config/supabase');
    if (!response.ok) {
      throw new Error('Failed to fetch Supabase config');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching Supabase config:', error);
    throw error;
  }
}

// Create Supabase client with config from server
export async function createSupabaseClient() {
  try {
    const config = await getSupabaseConfig();
    
    if (!config.url || !config.anonKey) {
      console.log('Supabase not configured, falling back to Replit Auth');
      return null;
    }

    const client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    // Initialize cached session with current session
    // This happens at module level BEFORE any React Query requests
    const { data: { session } } = await client.auth.getSession();
    setCachedSession(session);

    // Set up module-level auth state listener to keep cache updated
    // This ensures the cache is always up-to-date before any React Query requests
    client.auth.onAuthStateChange((_event, session) => {
      setCachedSession(session);
    });

    return client;
  } catch (error) {
    console.log('Supabase initialization failed, using Replit Auth only');
    return null;
  }
}

// Export a promise that resolves to the supabase client or null
export const supabasePromise = createSupabaseClient();