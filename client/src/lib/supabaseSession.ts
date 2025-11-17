import type { Session } from "@supabase/supabase-js";

// Cache for the current Supabase session
// This is updated by onAuthStateChange callbacks and used by getAuthHeaders
let cachedSession: Session | null = null;

export function setCachedSession(session: Session | null) {
  cachedSession = session;
}

export function getCachedSession(): Session | null {
  return cachedSession;
}
