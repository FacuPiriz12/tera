import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { createClient } from '@supabase/supabase-js';

function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('Supabase credentials not configured');
    return null;
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('✅ Supabase Auth configured with service role key');
  } else {
    console.log('⚠️  Supabase Auth using anon key (service role key recommended for production)');
  }

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { 'X-Client-Info': 'supabase-js-server' } }
  });

  if (client.realtime) client.realtime.disconnect();

  return client;
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;

  // Always use memory store in development — avoids DB connectivity requirement
  let sessionStore;

  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '' && process.env.NODE_ENV === 'production') {
    console.log('Using PostgreSQL session store');
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });
  } else {
    console.log('Using memory session store (development)');
  }

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

export function sessionRecoveryMiddleware(): RequestHandler {
  return (req, res, next) => {
    if (req.cookies && req.cookies['connect.sid'] && (!req.session || !req.sessionID)) {
      console.log('🔄 Detected invalid session cookie, clearing it...');
      res.clearCookie('connect.sid', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }
    next();
  };
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.post("/api/logout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: 'Failed to log out' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Session-based auth for SSE connections (EventSource can't send custom headers)
  if (req.session?.supabaseUserId && !req.headers.authorization) {
    req.user = {
      claims: {
        sub: req.session.supabaseUserId,
        email: req.session.supabaseUserEmail || '',
        first_name: '',
        last_name: ''
      },
      access_token: 'session-based',
      expires_at: Math.floor(Date.now() / 1000) + 3600
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.substring(7);
  const supabase = createSupabaseClient();

  if (!supabase) {
    return res.status(500).json({ message: "Auth service not configured" });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!user || error) {
      console.log('❌ Token validation failed:', error?.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    console.log('✅ Authenticated:', user.email);

    req.user = {
      claims: {
        sub: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name || user.user_metadata?.name?.split(' ')[0] || '',
        last_name: user.user_metadata?.last_name || user.user_metadata?.name?.split(' ').slice(1).join(' ') || ''
      },
      access_token: token,
      expires_at: Math.floor(Date.now() / 1000) + 3600
    };

    // Upsert user in database (non-fatal)
    try {
      const isAdminEmail = user.email === 'facupiriz87@gmail.com';
      await storage.upsertUser({
        id: user.id,
        email: user.email || '',
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: user.user_metadata?.avatar_url || '',
        authProvider: 'supabase',
        role: isAdminEmail ? 'admin' : 'user'
      });
    } catch (dbError) {
      console.error('Database upsert error (non-fatal):', dbError);
    }

    // Store in session so SSE connections can authenticate without headers
    if (req.session) {
      req.session.supabaseUserId = user.id;
      req.session.supabaseUserEmail = user.email;
    }

    return next();
  } catch (error) {
    console.error('Auth validation error:', error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req.user as any).claims.sub;
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    next();
  } catch (error) {
    console.error('Error checking admin privileges:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};
