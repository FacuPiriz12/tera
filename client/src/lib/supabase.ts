import { createClient } from '@supabase/supabase-js';
import { setCachedSession } from './supabaseSession';

function createSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn('Supabase env vars not set (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
    return null;
  }

  const client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'supabase.auth.token',
    }
  });

  if (client.realtime) client.realtime.disconnect();

  // Seed the module-level session cache on startup
  client.auth.getSession().then(({ data: { session } }) => {
    setCachedSession(session);
  });

  return client;
}

// Synchronous — no HTTP round-trip needed
export const supabasePromise: Promise<ReturnType<typeof createClient> | null> =
  Promise.resolve(createSupabaseClient());
