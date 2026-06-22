import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, createSupabaseClient } from "./replitAuth";
import { sendPasswordResetEmail, sendWelcomeEmail, sendVerificationCodeEmail, sendEmailChangeEmail } from "./lib/email";
import { GoogleDriveService } from "./services/googleDriveService";
import { DropboxService } from "./services/dropboxService";
import { OneDriveService } from "./services/oneDriveService";
import { BoxService } from "./services/boxService";
import { S3Service } from "./services/s3Service";
import { DuplicateDetectionService } from "./services/duplicateDetectionService";
import { SyncService } from "./services/syncService";
import { getQueueWorker } from "./queueWorker";
import { insertCloudFileSchema, insertCopyOperationSchema } from "@shared/schema";
import { z } from "zod";
import { google } from "googleapis";
import crypto from "crypto";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const PLAN_LIMITS = {
  free:     { maxDailyOperations: 20,   maxConcurrentOperations: 2,  maxStorageBytes: 5368709120   }, // 5 GB traffic
  pro:      { maxDailyOperations: 300,  maxConcurrentOperations: 10, maxStorageBytes: 214748364800 }, // 200 GB traffic
  business: { maxDailyOperations: 9999, maxConcurrentOperations: 30, maxStorageBytes: 2199023255552 }, // 2 TB traffic
} as const;

// Map a Stripe price ID to a plan name — update these after creating new prices in Stripe dashboard
const STRIPE_PRICE_TO_PLAN: Record<string, 'pro' | 'business'> = {
  'price_1Tk1ozGMtCDZ5sKadebYpBII': 'pro',      // Pro $7.99/month
  'price_1Tk1uAGMtCDZ5sKaHHyc8KGc': 'pro',      // Pro $65/year
  'price_1Tk1viGMtCDZ5sKaWGPYSJfA': 'business', // Business $19.99/month
  'price_1Tk1xwGMtCDZ5sKaBukVmyZb': 'business', // Business $159/year
};

// Utility function to compute redirect URI consistently across all OAuth flows
function getOAuthRedirectUri(req: any, path: string): string {
  // On Replit, use HTTPS with the dev domain
  const replitDomain = process.env.REPLIT_DEV_DOMAIN;
  if (replitDomain) {
    return `https://${replitDomain}${path}`;
  }
  
  // In production (Render, etc.), use the request's protocol and host
  const protocol = req.protocol || 'https';
  const host = req.get('host') || 'localhost:5000';
  return `${protocol}://${host}${path}`;
}

// Utility function to detect provider from URL
function detectProviderFromUrl(sourceUrl: string): 'google' | 'dropbox' | null {
  try {
    const url = new URL(sourceUrl.toLowerCase());
    
    // Google Drive detection (case-insensitive)
    if (url.hostname.includes('drive.google.com') || 
        url.hostname.includes('docs.google.com') ||
        url.hostname.includes('sheets.google.com') ||
        url.hostname.includes('slides.google.com')) {
      return 'google';
    }
    
    // Dropbox detection (case-insensitive)
    if (url.hostname.includes('dropbox.com') || 
        url.hostname.includes('db.tt')) {
      return 'dropbox';
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

async function getNextVersionNumber(userId: string, fileId: string): Promise<number> {
  const existing = await storage.getFileVersions(userId, fileId);
  return existing.length > 0 ? Math.max(...existing.map(v => v.versionNumber)) + 1 : 1;
}

async function enforceOperationLimits(userId: string): Promise<{ status: number; message: string } | null> {
  const user = await storage.getUser(userId);
  if (!user) return null;

  const [daily, active] = await Promise.all([
    storage.countUserDailyOperations(userId),
    storage.countUserActiveOperations(userId),
  ]);

  const maxDaily = user.maxDailyOperations ?? PLAN_LIMITS.free.maxDailyOperations;
  const maxConcurrent = user.maxConcurrentOperations ?? PLAN_LIMITS.free.maxConcurrentOperations;

  if (maxDaily > 0 && daily >= maxDaily) {
    return {
      status: 429,
      message: `Límite diario alcanzado (${maxDaily} operaciones/día). Actualizá tu plan para continuar.`,
    };
  }
  if (maxConcurrent > 0 && active >= maxConcurrent) {
    return {
      status: 429,
      message: `Demasiadas operaciones activas (máximo ${maxConcurrent} simultáneas). Esperá a que termine alguna.`,
    };
  }
  return null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Trust proxy for correct protocol/host detection behind load balancers
  app.set('trust proxy', 1);

  // Public health check — used by uptime monitors and Render keep-alive
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', ts: Date.now() });
  });

  // Stripe routes
  app.post('/api/stripe/create-checkout', isAuthenticated, async (req: any, res) => {
    if (!stripe) return res.status(500).json({ message: "Stripe not configured" });
    try {
      const { priceId, currency } = req.body;
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        ...(currency ? { currency } : {}),
        success_url: `${req.protocol}://${req.get('host')}/settings?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/settings`,
        client_reference_id: req.user.claims.sub,
      });
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post('/api/stripe/cancel-subscription', isAuthenticated, async (req: any, res) => {
    if (!stripe) return res.status(500).json({ message: "Stripe not configured" });
    const userId = req.user.claims.sub;
    try {
      const user = await storage.getUser(userId);
      if (!user?.stripeSubscriptionId) return res.status(400).json({ message: "No active subscription" });
      await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: true });
      res.json({ message: "Subscription will be cancelled at end of billing period" });
    } catch (error: any) {
      console.error("Stripe cancel error:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(500).send("Stripe not configured");
    const sig = req.headers['stripe-signature'];
    try {
      const event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET);
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.client_reference_id && session.subscription) {
          // Determine plan from the price ID on the line item
          const fullSession = await stripe!.checkout.sessions.retrieve(session.id, {
            expand: ['line_items'],
          });
          const priceId = fullSession.line_items?.data?.[0]?.price?.id ?? '';
          const plan = STRIPE_PRICE_TO_PLAN[priceId] ?? 'pro';

          await storage.updateUserStripeInfo(session.client_reference_id, {
            subscriptionId: session.subscription as string,
            customerId: session.customer as string,
          });
          await storage.updateUser(session.client_reference_id, {
            membershipPlan: plan,
            ...PLAN_LIMITS[plan],
          });
          console.log(`User ${session.client_reference_id} upgraded to ${plan.toUpperCase()} via Stripe`);
        }
      } else if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await storage.getUserByStripeSubscriptionId(subscription.id);

        if (user) {
          if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            await storage.updateUser(user.id, {
              membershipPlan: 'free',
              ...PLAN_LIMITS.free,
            });
            console.log(`Subscription ${subscription.id} ended — user ${user.id} reverted to FREE`);
          }
        }
      }
      res.json({ received: true });
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      
      // Check if this is the admin user
      const isAdminEmail = userEmail === (process.env.ADMIN_EMAIL || 'facupiriz87@gmail.com');
      
      // Try to get user from database first
      let user;
      try {
        user = await storage.getUser(userId);
      } catch (dbError) {
        console.log('Database not available, using claims data directly');
        user = null;
      }
      
      // If user doesn't exist in database or database is unavailable, 
      // return user data from claims (Supabase auth)
      if (!user) {
        const userData: any = {
          id: userId,
          email: userEmail,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          profileImageUrl: req.user.claims.profile_image_url,
          role: isAdminEmail ? 'admin' : 'user',
          ...PLAN_LIMITS.free,
        };
        
        // In development, dev-user-123 is always admin
        if (process.env.NODE_ENV === "development" && userId === "dev-user-123") {
          userData.role = 'admin';
        }
        
        // Try to save to database, but don't fail if it doesn't work
        try {
          user = await storage.upsertUser(userData);
          // New user — send welcome email in background (don't await)
          sendWelcomeEmail(userEmail, userData.firstName).catch(() => {});
        } catch (dbError) {
          console.log('Database upsert failed, returning claims data directly');
          user = userData;
        }
      } else {
        // User exists - ensure admin email always has admin role
        if (isAdminEmail && user.role !== 'admin') {
          try {
            user = await storage.updateUserRole(user.id, 'admin');
            console.log('🔑 Updated user to admin role:', userEmail);
          } catch (dbError) {
            console.log('Failed to update admin role:', dbError);
          }
        }
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user information
  app.patch('/api/user/update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const updateSchema = z.object({
        firstName: z.string().min(1, "El nombre es requerido").max(50, "El nombre es muy largo").optional(),
        lastName: z.string().min(1, "El apellido es requerido").max(50, "El apellido es muy largo").optional(),
        email: z.string().email("Email inválido").optional(),
        profileImageUrl: z.string().url("URL de imagen inválida").optional()
      });

      const validation = updateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Datos de usuario inválidos",
          errors: validation.error.errors
        });
      }

      // Check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const { email: newEmail, ...otherFields } = validation.data;
      const isEmailChange = newEmail && newEmail !== existingUser.email;

      // Update non-email fields immediately
      if (Object.keys(otherFields).length > 0) {
        await storage.updateUser(userId, otherFields);
      }

      // Email change requires OTP verification
      if (isEmailChange) {
        const taken = await storage.getUserByEmail(newEmail);
        if (taken && taken.id !== userId) {
          return res.status(409).json({ message: "El email ya está en uso por otro usuario", code: "EMAIL_ALREADY_EXISTS" });
        }

        const code = String(crypto.randomInt(100000, 999999));
        const expiry = Date.now() + 10 * 60 * 1000; // 10 min

        const supabase = createSupabaseClient();
        if (supabase) {
          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { pending_email: newEmail, pending_email_code: code, pending_email_expiry: expiry }
          });
        }

        sendVerificationCodeEmail(newEmail, code, 10).catch(() => {});

        return res.json({ requiresEmailVerification: true, pendingEmail: newEmail });
      }

      const updatedUser = await storage.getUser(userId);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof Error) {
        if (error.message.includes('unique constraint') || error.message.includes('UNIQUE constraint')) {
          return res.status(409).json({ message: "El email ya está en uso por otro usuario", code: "EMAIL_ALREADY_EXISTS" });
        }
        if (error.message.includes('User not found')) {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }
      }
      res.status(500).json({ message: "Error al actualizar la información del usuario" });
    }
  });

  app.post('/api/user/verify-email-change', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code } = req.body;
      if (!code) return res.status(400).json({ message: "Código requerido" });

      const supabase = createSupabaseClient();
      if (!supabase) return res.status(500).json({ message: "Servicio no disponible" });

      const { data: supaData, error: supaErr } = await supabase.auth.admin.getUserById(userId);
      if (supaErr || !supaData?.user) return res.status(404).json({ message: "Usuario no encontrado" });

      const meta = supaData.user.user_metadata || {};
      const { pending_email, pending_email_code, pending_email_expiry } = meta;

      if (!pending_email || !pending_email_code) {
        return res.status(400).json({ message: "No hay un cambio de email pendiente" });
      }
      if (Date.now() > Number(pending_email_expiry)) {
        return res.status(400).json({ message: "El código expiró. Solicitá uno nuevo." });
      }
      if (String(code) !== String(pending_email_code)) {
        return res.status(400).json({ message: "Código incorrecto" });
      }

      const currentUser = await storage.getUser(userId);

      // Apply the email change
      await storage.updateUser(userId, { email: pending_email });
      await supabase.auth.admin.updateUserById(userId, {
        email: pending_email,
        user_metadata: { pending_email: null, pending_email_code: null, pending_email_expiry: null }
      });

      // Notify old email that the change happened
      if (currentUser?.email) {
        sendEmailChangeEmail(pending_email, currentUser.email, '').catch(() => {});
      }

      const updatedUser = await storage.getUser(userId);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error verifying email change:", error);
      res.status(500).json({ message: "Error al verificar el código" });
    }
  });

  // Cloud health stats — real data derived from user's copy operations
  app.get('/api/cloud-health', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const ops = await storage.getUserCopyOperations(userId);

      const total = ops.length;
      const completed = ops.filter(op => op.status === 'completed').length;
      const failed = ops.filter(op => op.status === 'failed').length;
      const cancelled = ops.filter(op => op.status === 'cancelled').length;
      const active = ops.filter(op => op.status === 'pending' || op.status === 'in_progress').length;
      const finishedTotal = completed + failed;
      const successRate = finishedTotal > 0 ? Math.round((completed / finishedTotal) * 100) : 100;
      const totalFilesProcessed = ops.reduce((sum, op) => sum + (op.completedFiles || 0), 0);

      const byProvider: Record<string, number> = {};
      for (const op of ops) {
        const src = op.sourceProvider;
        const dst = op.destProvider;
        if (src) byProvider[src] = (byProvider[src] || 0) + 1;
        if (dst && dst !== src) byProvider[dst] = (byProvider[dst] || 0) + 1;
      }

      // Last 7 days vs prior 7 days
      const now = Date.now();
      const day7 = now - 7 * 24 * 60 * 60 * 1000;
      const day14 = now - 14 * 24 * 60 * 60 * 1000;
      const recentOps = ops.filter(op => op.createdAt && new Date(op.createdAt).getTime() >= day7).length;
      const prevOps = ops.filter(op => op.createdAt && new Date(op.createdAt).getTime() >= day14 && new Date(op.createdAt).getTime() < day7).length;

      // Health score: 100% when success rate is high, penalised by failures
      const healthScore = total === 0 ? 100 : Math.max(0, successRate);

      res.json({
        healthScore,
        successRate,
        total,
        completed,
        failed,
        cancelled,
        active,
        totalFilesProcessed,
        byProvider,
        trend: { recentOps, prevOps },
      });
    } catch (error) {
      console.error("Error fetching cloud health:", error);
      res.status(500).json({ message: "Failed to fetch cloud health data" });
    }
  });

  // Drive files routes
  app.get('/api/drive-files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await storage.getUserCloudFiles(userId, page, limit);
      res.json(result);
    } catch (error) {
      console.error("Error fetching drive files:", error);
      res.status(500).json({ message: "Failed to fetch drive files" });
    }
  });

  // Copy operations routes
  app.get('/api/copy-operations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const operations = await storage.getUserCopyOperations(userId);
      res.json(operations);
    } catch (error) {
      console.error("Error fetching copy operations:", error);
      res.status(500).json({ message: "Failed to fetch copy operations" });
    }
  });

  app.post('/api/copy-operations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const limitError = await enforceOperationLimits(userId);
      if (limitError) return res.status(limitError.status).json({ message: limitError.message });

      // Validate provider before creating operation
      const provider = detectProviderFromUrl(req.body.sourceUrl);
      if (!provider) {
        return res.status(400).json({
          message: "Unsupported URL format - only Google Drive and Dropbox URLs are supported"
        });
      }

      // Validate with Zod schema
      const validation = insertCopyOperationSchema.parse({
        ...req.body,
        userId,
        status: 'pending',
      });

      // Handle duplicates if specified in request
      const duplicateAction = req.body.duplicateAction || 'skip'; // 'skip' | 'replace' | 'copy_with_suffix'
      
      const operation = await storage.createCopyOperation(validation);
      
      // Store duplicate handling preference if provided
      if (req.body.duplicateAction) {
        await storage.updateCopyOperation(operation.id, { 
          fileName: validation.fileName,
        });
      }
      
      res.json(operation);

      // Start copy process in background with error handling based on provider
      if (provider === 'google') {
        const driveService = new GoogleDriveService(userId);
        // Wrap in try-catch to handle background errors
        setImmediate(async () => {
          try {
            await driveService.startCopyOperation(operation.id, validation.sourceUrl, duplicateAction);
          } catch (error) {
            console.error(`Google Drive copy operation ${operation.id} failed:`, error);
            await storage.updateCopyOperationStatus(operation.id, 'failed', error instanceof Error ? error.message : 'Unknown error occurred');
          }
        });
      } else if (provider === 'dropbox') {
        const dropboxService = new DropboxService(userId);
        // Wrap in try-catch to handle background errors
        setImmediate(async () => {
          try {
            await dropboxService.startCopyOperation(operation.id, validation.sourceUrl, duplicateAction);
          } catch (error) {
            console.error(`Dropbox copy operation ${operation.id} failed:`, error);
            await storage.updateCopyOperationStatus(operation.id, 'failed', error instanceof Error ? error.message : 'Unknown error occurred');
          }
        });
      }
    } catch (error) {
      console.error("Error creating copy operation:", error);
      res.status(500).json({ message: "Failed to create copy operation" });
    }
  });

  app.get('/api/copy-operations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const operation = await storage.getCopyOperation(id);
      
      if (!operation) {
        return res.status(404).json({ message: "Copy operation not found" });
      }

      // Check if user owns this operation
      const userId = req.user.claims.sub;
      if (operation.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(operation);
    } catch (error) {
      console.error("Error fetching copy operation:", error);
      res.status(500).json({ message: "Failed to fetch copy operation" });
    }
  });

  // Password reset endpoints — delegates token generation/validation to Supabase Auth,
  // we only generate the recovery link (admin API) and send the email via Resend.
  app.post('/api/auth/forgot-password', async (req, res) => {
    const genericResponse = { message: "Si la cuenta existe, se enviará un enlace de restablecimiento." };
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const supabase = createSupabaseClient();
      if (!supabase) {
        console.error("Forgot password error: Supabase client not configured");
        return res.json(genericResponse);
      }

      const redirectTo = `${req.protocol}://${req.get('host')}/reset-password`;
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo },
      });

      if (error || !data?.properties?.action_link) {
        console.error("Forgot password error:", error?.message);
        return res.json(genericResponse);
      }

      await sendPasswordResetEmail(email, data.properties.action_link);
      res.json(genericResponse);
    } catch (error) {
      console.error("Forgot password error:", error);
      res.json(genericResponse);
    }
  });

  // Preview route for copy operations
  app.post('/api/copy-operations/preview', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log('📋 Preview request - userId:', userId, 'body:', req.body);
      
      // Validate request body with Zod
      const previewSchema = z.object({
        sourceUrl: z.string().url("Invalid URL format").min(1, "Source URL is required")
      });
      
      const validation = previewSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: validation.error.errors
        });
      }

      const { sourceUrl } = validation.data;
      
      // Detect provider and get preview from appropriate service
      const provider = detectProviderFromUrl(sourceUrl);
      console.log('📋 Detected provider:', provider, 'for URL:', sourceUrl.substring(0, 50) + '...');
      
      let preview;
      if (provider === 'google') {
        // Verify user has Google connected before proceeding
        const user = await storage.getUser(userId);
        console.log('📋 User lookup result:', { 
          found: !!user, 
          hasGoogleToken: !!user?.googleAccessToken,
          tokenExpiry: user?.googleTokenExpiry 
        });
        
        if (!user) {
          return res.status(401).json({ message: "User not found. Please login again." });
        }
        if (!user.googleAccessToken) {
          return res.status(401).json({ message: "Google Drive not connected. Please connect your Google account first." });
        }
        
        const driveService = new GoogleDriveService(userId);
        preview = await driveService.getOperationPreview(sourceUrl);
      } else if (provider === 'dropbox') {
        // Verify user has Dropbox connected before proceeding
        const user = await storage.getUser(userId);
        console.log('📋 User lookup result:', { 
          found: !!user, 
          hasDropboxToken: !!user?.dropboxAccessToken,
          tokenExpiry: user?.dropboxTokenExpiry 
        });
        
        if (!user) {
          return res.status(401).json({ message: "User not found. Please login again." });
        }
        if (!user.dropboxAccessToken) {
          return res.status(401).json({ message: "Dropbox not connected. Please connect your Dropbox account first." });
        }
        
        const dropboxService = new DropboxService(userId);
        preview = await dropboxService.getOperationPreview(sourceUrl);
      } else {
        return res.status(400).json({ 
          message: "Unsupported URL format - only Google Drive and Dropbox URLs are supported"
        });
      }
      
      console.log('📋 Preview successful:', preview?.name);
      res.json(preview);
    } catch (error) {
      console.error("Error getting copy operation preview:", error);
      
      // Provide more specific error messages based on the actual errors thrown
      if (error instanceof Error) {
        const errorMessage = error.message;
        console.error("📋 Preview error details:", errorMessage);
        
        // Google Drive specific errors
        if (errorMessage.includes('Invalid Google Drive URL')) {
          return res.status(400).json({ message: "Invalid Google Drive URL format" });
        }
        if (errorMessage.includes('Google Drive access expired') || errorMessage.includes('Google Drive access token has expired')) {
          return res.status(401).json({ message: "Google Drive access expired. Please reconnect your account." });
        }
        
        // Dropbox specific errors
        if (errorMessage.includes('Invalid Dropbox URL')) {
          return res.status(400).json({ message: "Invalid Dropbox URL format" });
        }
        if (errorMessage.includes('Dropbox access token has expired') || errorMessage.includes('Dropbox access expired')) {
          return res.status(401).json({ message: "Dropbox access expired. Please reconnect your account." });
        }
        
        // Generic errors that apply to both
        if (errorMessage.includes('access token has expired')) {
          return res.status(401).json({ message: "Cloud storage access expired. Please reconnect your account." });
        }
        if (errorMessage.includes('not connected') || errorMessage.includes('has not connected')) {
          return res.status(401).json({ message: "Cloud storage account not connected. Please connect your account first." });
        }
        if (errorMessage.includes('shared link not found') || errorMessage.includes('not_found')) {
          return res.status(404).json({ message: "Shared file or folder not found" });
        }
        if (errorMessage.includes('File not found') || errorMessage.includes('notFound')) {
          return res.status(404).json({ message: "File or folder not found. Check that the link is correct and accessible." });
        }
        if (errorMessage.includes('insufficient permissions') || errorMessage.includes('forbidden')) {
          return res.status(403).json({ message: "No permission to access this file. Make sure the link is publicly shared." });
        }
        
        return res.status(500).json({
          message: "Failed to get operation preview",
          ...(process.env.NODE_ENV !== 'production' && { details: errorMessage })
        });
      }
      
      res.status(500).json({ message: "Failed to get operation preview" });
    }
  });

  // Google Drive API routes
  app.post('/api/drive/parse-url', isAuthenticated, async (req: any, res) => {
    try {
      const { url } = req.body;
      const userId = req.user.claims.sub;
      const driveService = new GoogleDriveService(userId);
      const fileInfo = await driveService.parseGoogleDriveUrl(url);
      res.json(fileInfo);
    } catch (error) {
      console.error("Error parsing Drive URL:", error);
      res.status(500).json({ message: "Failed to parse Drive URL" });
    }
  });

  app.post('/api/drive/list-files', isAuthenticated, async (req: any, res) => {
    try {
      const { fileId } = req.body;
      const userId = req.user.claims.sub;
      const driveService = new GoogleDriveService(userId);
      const files = await driveService.listFiles(fileId);
      res.json(files);
    } catch (error) {
      console.error("Error listing Drive files:", error);
      res.status(500).json({ message: "Failed to list Drive files" });
    }
  });

  // Get folders for folder browser
  app.get('/api/drive/folders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parentId = req.query.parentId || 'root';
      const pageToken = req.query.pageToken;
      
      const driveService = new GoogleDriveService(userId);
      const result = await driveService.listFolders(parentId, pageToken);
      
      res.json(result);
    } catch (error) {
      console.error("Error listing Drive folders:", error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('access token has expired')) {
          return res.status(401).json({ message: "Google Drive access expired. Please reconnect your account." });
        }
        if (error.message.includes('not connected')) {
          return res.status(401).json({ message: "Google Drive account not connected" });
        }
      }
      
      res.status(500).json({ message: "Failed to list Drive folders" });
    }
  });

  // Get folder path for breadcrumbs
  app.get('/api/drive/folders/:id/path', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const folderId = req.params.id;
      
      const driveService = new GoogleDriveService(userId);
      const path = await driveService.getFolderPath(folderId);
      
      res.json({ path });
    } catch (error) {
      console.error("Error getting folder path:", error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('access token has expired')) {
          return res.status(401).json({ message: "Google Drive access expired. Please reconnect your account." });
        }
        if (error.message.includes('not connected')) {
          return res.status(401).json({ message: "Google Drive account not connected" });
        }
      }
      
      res.status(500).json({ message: "Failed to get folder path" });
    }
  });

  // Generic file upload route - handles uploading from PC to Google Drive or Dropbox
  app.post('/api/upload-file', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { filename, content, provider, mimeType } = req.body;

      // Validate required fields
      if (!filename || typeof filename !== 'string') {
        return res.status(400).json({ message: "Valid filename is required" });
      }
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "File content (base64) is required" });
      }
      if (!provider || (provider !== 'google' && provider !== 'dropbox')) {
        return res.status(400).json({ message: "Provider must be 'google' or 'dropbox'" });
      }

      // Validate filename
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: "Invalid filename format" });
      }

      // Convert base64 to buffer
      let contentBuffer: ArrayBuffer;
      try {
        const binaryString = Buffer.from(content, 'base64').toString('binary');
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        contentBuffer = bytes.buffer;
      } catch (error) {
        return res.status(400).json({ message: "Invalid base64 content" });
      }

      // Check file size (max 100MB)
      const maxSize = 100 * 1024 * 1024;
      if (contentBuffer.byteLength > maxSize) {
        return res.status(413).json({ message: "File too large. Maximum size is 100MB." });
      }

      if (provider === 'google') {
        const driveService = new GoogleDriveService(userId);
        const uploadedFile = await driveService.uploadFile(filename, contentBuffer, 'root', mimeType);
        
        // Save file metadata to TERA database
        await storage.createCloudFile({
          userId,
          provider: 'google',
          originalFileId: filename, // Use filename as original ID for uploads from PC
          copiedFileId: uploadedFile.id || uploadedFile.fileId || 'unknown',
          fileName: filename,
          mimeType: mimeType || 'application/octet-stream',
          fileSize: contentBuffer.byteLength,
          sourceUrl: uploadedFile.webViewLink || uploadedFile.webContentLink || `https://drive.google.com/file/d/${uploadedFile.id}`,
        });
        
        console.log("File uploaded successfully to Google Drive:", { userId, filename, size: contentBuffer.byteLength });
        res.json(uploadedFile);
      } else if (provider === 'dropbox') {
        const dropboxService = new DropboxService(userId);
        const uploadedFile = await dropboxService.uploadFile(filename, contentBuffer);
        
        // Save file metadata to TERA database
        await storage.createCloudFile({
          userId,
          provider: 'dropbox',
          originalFileId: filename, // Use filename as original ID for uploads from PC
          copiedFileId: uploadedFile.id || uploadedFile.file_id || 'unknown',
          fileName: filename,
          mimeType: mimeType || 'application/octet-stream',
          fileSize: contentBuffer.byteLength,
          sourceUrl: uploadedFile.preview_url || `https://www.dropbox.com/preview/${uploadedFile.path_display}`,
        });
        
        console.log("File uploaded successfully to Dropbox:", { userId, filename, size: contentBuffer.byteLength });
        res.json(uploadedFile);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      
      if (error instanceof Error) {
        if (error.message.includes('not connected') || error.message.includes('User has not connected')) {
          return res.status(401).json({ 
            message: `${provider === 'google' ? 'Google Drive' : 'Dropbox'} account not connected. Please connect first.`,
            action: "connect_required"
          });
        }
        if (error.message.includes('expired') || error.message.includes('access token')) {
          return res.status(401).json({ 
            message: `${provider === 'google' ? 'Google Drive' : 'Dropbox'} access expired. Please reconnect.`,
            action: "reconnect_required"
          });
        }
        if (error.message.includes('storage_quota') || error.message.includes('insufficient_space')) {
          return res.status(507).json({ message: "Insufficient storage space" });
        }
      }
      
      res.status(500).json({ 
        message: "Failed to upload file",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Google Drive upload route
  app.post('/api/drive/upload', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { filename, content, parentFolderId, mimeType } = req.body;

      // Validate required fields
      if (!filename || typeof filename !== 'string') {
        return res.status(400).json({ message: "Valid filename is required" });
      }
      if (content === undefined || content === null) {
        return res.status(400).json({ message: "File content is required" });
      }

      // Validate parent folder ID parameter
      if (parentFolderId !== undefined && typeof parentFolderId !== 'string') {
        return res.status(400).json({ message: "Invalid parent folder ID parameter" });
      }

      // Validate filename
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: "Invalid filename format" });
      }

      // Convert content to ArrayBuffer for service compatibility
      let contentBuffer: ArrayBuffer;
      if (typeof content === 'string') {
        // Convert string content to ArrayBuffer
        const encoder = new TextEncoder();
        contentBuffer = encoder.encode(content).buffer;
      } else if (content instanceof ArrayBuffer) {
        contentBuffer = content;
      } else {
        // Convert other types to JSON string then to ArrayBuffer  
        const encoder = new TextEncoder();
        contentBuffer = encoder.encode(JSON.stringify(content)).buffer;
      }

      // Validate file size (Google Drive supports up to 5TB with resumable uploads)
      const contentSize = contentBuffer.byteLength;
      const maxSize = 5 * 1024 * 1024 * 1024 * 1024; // 5TB limit for resumable uploads
      if (contentSize > maxSize) {
        return res.status(413).json({ message: "File too large. Maximum size is 5TB." });
      }

      const driveService = new GoogleDriveService(userId);
      const file = await driveService.uploadFile(filename, contentBuffer, parentFolderId, mimeType);

      console.log("File uploaded successfully to Google Drive:", { userId, filename, size: contentSize });
      res.json(file);
    } catch (error) {
      console.error("Error uploading file to Google Drive:", error, { 
        userId: req.user.claims.sub, 
        filename: req.body.filename 
      });
      
      if (error instanceof Error) {
        // Handle specific Google Drive API errors
        if (error.message.includes('access token has expired') || error.message.includes('expired access token')) {
          return res.status(401).json({ 
            message: "Google Drive access expired. Please reconnect your account.",
            action: "reconnect_required"
          });
        }
        if (error.message.includes('not connected') || error.message.includes('User has not connected')) {
          return res.status(401).json({ 
            message: "Google Drive account not connected",
            action: "connect_required"
          });
        }
        if (error.message.includes('insufficient_space') || error.message.includes('storage_quota')) {
          return res.status(507).json({ message: "Insufficient storage space in Google Drive account" });
        }
        if (error.message.includes('file_already_exists') || error.message.includes('already exists')) {
          return res.status(409).json({ message: "File already exists at this location" });
        }
        if (error.message.includes('invalid_path') || error.message.includes('path_not_found')) {
          return res.status(404).json({ message: "Upload path not found in Google Drive" });
        }
        if (error.message.includes('rate_limit') || error.message.includes('too_many_requests')) {
          return res.status(429).json({ message: "Rate limit exceeded. Please try again later." });
        }
        if (error.message.includes('file_size_error') || error.message.includes('too large')) {
          return res.status(413).json({ message: "File size exceeds Google Drive limits" });
        }
        if (error.message.includes('invalid_file_name') || error.message.includes('disallowed_name')) {
          return res.status(400).json({ message: "Invalid or disallowed filename" });
        }
      }
      
      res.status(500).json({ 
        message: "Failed to upload file to Google Drive",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Google OAuth Configuration
  const getGoogleOAuth2Client = (req?: any) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = req ? 
      getOAuthRedirectUri(req, '/api/auth/google/callback') :
      `https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}/api/auth/google/callback`;
    
    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  };

  // Helper function to validate Supabase token and get user with timeout
  async function validateSupabaseToken(token: string): Promise<any> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('Supabase not configured, skipping token validation');
      return null;
    }
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.log('Supabase token validation timed out');
        resolve(null);
      }, 5000); // 5 second timeout
    });
    
    const validationPromise = (async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
        });
        
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (user && !error) {
          console.log('Supabase token validated for user:', user.id);
          return user;
        }
        if (error) {
          console.log('Supabase token validation error:', error.message);
        }
        return null;
      } catch (error) {
        console.error('Token validation exception:', error);
        return null;
      }
    })();
    
    return Promise.race([validationPromise, timeoutPromise]);
  }

  // Google OAuth routes - supports both session auth and token-based auth
  app.get('/api/auth/google', async (req: any, res) => {
    console.log('=== Google OAuth Start ===');
    console.log('Query params:', { token: req.query.token ? 'present' : 'none' });
    
    try {
      let userId: string | null = null;
      
      // Check for token in query parameter (for Supabase auth redirect)
      const token = req.query.token as string;
      if (token) {
        console.log('Validating Supabase token...');
        const user = await validateSupabaseToken(token);
        if (user) {
          userId = user.id;
          // Store user info in session for the callback
          req.session.supabaseUserId = user.id;
          req.session.supabaseUserEmail = user.email;
          console.log('Supabase user authenticated:', userId);
        } else {
          console.log('Supabase token validation failed');
        }
      }
      
      // If no token, check if already authenticated via session
      if (!userId && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
        console.log('User authenticated via session:', userId);
      }
      
      // Check session for previously stored user
      if (!userId && req.session?.supabaseUserId) {
        userId = req.session.supabaseUserId;
        console.log('User found in session:', userId);
      }
      
      if (!userId) {
        console.log('No user found, redirecting to login');
        return res.redirect('/login?redirect=/integrations&error=auth_required');
      }
      
      // Check if Google OAuth is configured
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        console.error('Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
        return res.redirect('/integrations?google_auth=error&reason=not_configured');
      }
      
      console.log('Creating OAuth client...');
      const oauth2Client = getGoogleOAuth2Client(req);
      
      // Generate random state for CSRF protection (like Dropbox)
      const state = crypto.randomBytes(16).toString('hex');
      req.session.googleOAuthState = state;
      req.session.googleUserId = userId;
      
      // Save session before redirecting with timeout
      console.log('Saving session...');
      try {
        await Promise.race([
          new Promise<void>((resolve, reject) => {
            req.session.save((err: any) => {
              if (err) reject(err);
              else resolve();
            });
          }),
          new Promise<void>((_, reject) => 
            setTimeout(() => reject(new Error('Session save timeout')), 5000)
          )
        ]);
        console.log('Session saved successfully');
      } catch (sessionError) {
        console.error('Session save error:', sessionError);
        // Continue anyway - we can try without session
      }
      
      console.log('Generating auth URL...');
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [
          'https://www.googleapis.com/auth/drive',
          'openid',
          'email',
          'profile'
        ],
        state: state
      });

      console.log('Redirecting to Google OAuth:', authUrl.substring(0, 100) + '...');
      res.redirect(authUrl);
    } catch (error) {
      console.error("Error starting Google OAuth:", error);
      // Always redirect instead of returning JSON to avoid hanging
      res.redirect('/integrations?google_auth=error&reason=server_error');
    }
  });

  app.get('/api/auth/google/callback', async (req: any, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        // Clean up session on error
        delete req.session.googleOAuthState;
        delete req.session.googleUserId;
        return res.redirect('/integrations?google_auth=error&reason=no_code');
      }

      // Validate state parameter for CSRF protection
      const expectedState = req.session.googleOAuthState;
      const sessionUserId = req.session.googleUserId;
      
      // Get current user ID from session or authenticated user
      const currentUserId = req.user?.claims?.sub || req.session?.supabaseUserId;
      
      if (state !== expectedState) {
        console.error("Invalid state parameter in Google OAuth callback", {
          expectedState,
          receivedState: state
        });
        // Clean up session on error
        delete req.session.googleOAuthState;
        delete req.session.googleUserId;
        return res.redirect('/integrations?google_auth=error&reason=invalid_state');
      }
      
      if (!sessionUserId) {
        console.error("No user ID in session for Google OAuth callback");
        return res.redirect('/integrations?google_auth=error&reason=no_session');
      }

      // Clean up OAuth state from session
      delete req.session.googleOAuthState;

      const oauth2Client = getGoogleOAuth2Client(req);
      const { tokens } = await oauth2Client.getToken(code as string);

      // Use user ID from session (stored during OAuth initiation)
      const userId = sessionUserId;
      
      // Clean up user ID from session
      delete req.session.googleUserId;

      // Save tokens to database
      await storage.updateUserGoogleTokens(userId, {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
      });

      // Redirect back to integrations page with success
      res.redirect('/integrations?google_auth=success');
    } catch (error) {
      console.error("Error in Google OAuth callback:", error);
      
      // Clean up session on error
      delete req.session.googleUserId;
      
      // Check for specific OAuth errors and provide helpful instructions
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('redirect_uri_mismatch')) {
        const domain = process.env.REPLIT_DEV_DOMAIN || req.get('host') || 'localhost:5000';
        const protocol = req.protocol;
        const redirectUri = `${protocol}://${domain}/api/auth/google/callback`;
        console.error(`Google OAuth redirect_uri_mismatch. Add this URL to Google Cloud Console: ${redirectUri}`);
        return res.redirect(`/integrations?google_auth=error&reason=redirect_mismatch&domain=${encodeURIComponent(domain)}`);
      }
      
      if (errorMessage.includes('invalid_client') || errorMessage.includes('unauthorized_client')) {
        console.error('Google OAuth client configuration error. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
        return res.redirect('/integrations?google_auth=error&reason=invalid_client');
      }
      
      res.redirect('/integrations?google_auth=error');
    }
  });

  // Check Google connection status
  app.get('/api/auth/google/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // hasValidToken = true if access token is still valid OR if we have a refresh token
      // (ensureValidToken auto-refreshes when needed, so having a refresh token is enough)
      const accessTokenValid = !!(user?.googleAccessToken && user?.googleTokenExpiry &&
                                  new Date(user.googleTokenExpiry) > new Date());
      const canAutoRefresh = !!user?.googleRefreshToken;
      res.json({
        connected: user?.googleConnected || false,
        hasValidToken: accessTokenValid || canAutoRefresh
      });
    } catch (error) {
      console.error("Error checking Google auth status:", error);
      res.status(500).json({ message: "Failed to check Google auth status" });
    }
  });

  // Disconnect Google account
  app.delete('/api/auth/google', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.updateUserGoogleTokens(userId, {
        accessToken: null,
        refreshToken: null,
        expiry: null
      });

      res.json({ message: "Google account disconnected successfully" });
    } catch (error) {
      console.error("Error disconnecting Google account:", error);
      res.status(500).json({ message: "Failed to disconnect Google account" });
    }
  });

  // Dropbox OAuth routes - supports both session auth and token-based auth
  app.get('/api/auth/dropbox', async (req: any, res) => {
    console.log('=== Dropbox OAuth Start ===');
    console.log('Query params:', { token: req.query.token ? 'present' : 'none' });
    
    try {
      let userId: string | null = null;
      
      // Check for token in query parameter (for Supabase auth redirect)
      const token = req.query.token as string;
      if (token) {
        console.log('Validating Supabase token...');
        const user = await validateSupabaseToken(token);
        if (user) {
          userId = user.id;
          req.session.supabaseUserId = user.id;
          req.session.supabaseUserEmail = user.email;
          console.log('Supabase user authenticated:', userId);
        } else {
          console.log('Supabase token validation failed');
        }
      }
      
      // If no token, check if already authenticated via session
      if (!userId && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
        console.log('User authenticated via session:', userId);
      }
      
      // Check session for previously stored user
      if (!userId && req.session?.supabaseUserId) {
        userId = req.session.supabaseUserId;
        console.log('User found in session:', userId);
      }
      
      if (!userId) {
        console.log('No user found, redirecting to login');
        return res.redirect('/login?redirect=/integrations&error=auth_required');
      }
      
      // Check if Dropbox OAuth is configured
      const appKey = process.env.DROPBOX_APP_KEY;
      const appSecret = process.env.DROPBOX_APP_SECRET;
      
      if (!appKey || !appSecret) {
        console.error('Dropbox OAuth not configured - missing DROPBOX_APP_KEY or DROPBOX_APP_SECRET');
        return res.redirect('/integrations?dropbox_auth=error&reason=not_configured');
      }
      
      const redirectUri = getOAuthRedirectUri(req, '/api/auth/dropbox/callback');
      console.log('Dropbox redirect URI:', redirectUri);
      
      // Generate random state and store in session
      const state = crypto.randomBytes(16).toString('hex');
      req.session.dropboxOAuthState = state;
      req.session.dropboxUserId = userId;
      
      // Save session before redirecting with timeout
      console.log('Saving session...');
      try {
        await Promise.race([
          new Promise<void>((resolve, reject) => {
            req.session.save((err: any) => {
              if (err) reject(err);
              else resolve();
            });
          }),
          new Promise<void>((_, reject) => 
            setTimeout(() => reject(new Error('Session save timeout')), 5000)
          )
        ]);
        console.log('Session saved successfully');
      } catch (sessionError) {
        console.error('Session save error:', sessionError);
        // Continue anyway - we can try without session
      }

      console.log('Creating Dropbox service...');
      const dropboxService = new DropboxService(userId);
      const authUrl = await dropboxService.getAuthUrl(redirectUri, state);

      console.log('Redirecting to Dropbox OAuth:', authUrl.substring(0, 100) + '...');
      res.redirect(authUrl);
    } catch (error) {
      console.error("Error starting Dropbox OAuth:", error);
      // Always redirect instead of returning JSON to avoid hanging
      res.redirect('/integrations?dropbox_auth=error&reason=server_error');
    }
  });

  app.get('/api/auth/dropbox/callback', async (req: any, res) => {
    try {
      const { code, state, error: oauthError, error_description } = req.query;
      
      // Handle OAuth errors from Dropbox
      if (oauthError) {
        console.error("Dropbox OAuth error:", oauthError, error_description);
        // Clean up session on error
        delete req.session.dropboxOAuthState;
        delete req.session.dropboxUserId;
        const errorType = oauthError === 'access_denied' ? 'denied' : 'error';
        return res.redirect(`/?dropbox_auth=error&reason=${errorType}`);
      }
      
      if (!code) {
        console.error("Authorization code not provided in Dropbox callback");
        // Clean up session on error
        delete req.session.dropboxOAuthState;
        delete req.session.dropboxUserId;
        return res.redirect('/integrations?dropbox_auth=error&reason=no_code');
      }

      // Validate state parameter for CSRF protection
      const expectedState = req.session.dropboxOAuthState;
      const sessionUserId = req.session.dropboxUserId;
      
      if (state !== expectedState) {
        console.error("Invalid state parameter in Dropbox OAuth callback", { 
          expectedState, 
          receivedState: state
        });
        // Clean up session on error
        delete req.session.dropboxOAuthState;
        delete req.session.dropboxUserId;
        return res.redirect('/integrations?dropbox_auth=error&reason=invalid_state');
      }
      
      if (!sessionUserId) {
        console.error("No user ID in session for Dropbox OAuth callback");
        return res.redirect('/integrations?dropbox_auth=error&reason=no_session');
      }

      // Clean up OAuth state from session
      delete req.session.dropboxOAuthState;
      
      const userId = sessionUserId;
      
      // Clean up user ID from session
      delete req.session.dropboxUserId;
      
      const protocol = req.protocol;
      const host = req.get('host');
      const redirectUri = `${protocol}://${host}/api/auth/dropbox/callback`;
      
      const dropboxService = new DropboxService(userId);
      const tokenData = await dropboxService.exchangeCodeForToken(redirectUri, code as string);

      // Save tokens to database
      await storage.updateUserDropboxTokens(userId, {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken || null,
        expiry: tokenData.expiresAt || null
      });

      console.log("Dropbox OAuth completed successfully for user:", userId);
      // Redirect back to integrations page with success
      res.redirect('/integrations?dropbox_auth=success');
    } catch (error) {
      console.error("Error in Dropbox OAuth callback:", error);
      
      // Clean up session on any error
      delete req.session.dropboxOAuthState;
      delete req.session.dropboxUserId;
      
      // Check for specific OAuth errors and provide helpful instructions
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('redirect_uri') || errorMessage.includes('invalid_redirect')) {
        const domain = process.env.REPLIT_DEV_DOMAIN || req.get('host') || 'localhost:5000';
        const protocol = req.protocol;
        const redirectUri = `${protocol}://${domain}/api/auth/dropbox/callback`;
        console.error(`Dropbox OAuth redirect URI error. Add this URL to Dropbox App Console: ${redirectUri}`);
        return res.redirect(`/integrations?dropbox_auth=error&reason=redirect_mismatch&domain=${encodeURIComponent(domain)}`);
      }
      
      if (errorMessage.includes('invalid_grant')) {
        return res.redirect('/integrations?dropbox_auth=error&reason=expired_code');
      }
      
      if (errorMessage.includes('invalid_client') || errorMessage.includes('unauthorized_client')) {
        console.error('Dropbox OAuth client configuration error. Check DROPBOX_APP_KEY and DROPBOX_APP_SECRET.');
        return res.redirect('/integrations?dropbox_auth=error&reason=invalid_client');
      }
      
      res.redirect('/integrations?dropbox_auth=error&reason=unknown');
    }
  });

  // Check Dropbox connection status
  app.get('/api/auth/dropbox/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.error("User not found when checking Dropbox status:", userId);
        return res.status(404).json({ 
          message: "User not found",
          connected: false,
          hasValidToken: false
        });
      }
      
      const hasAccessToken = !!user.dropboxAccessToken;
      const hasRefreshToken = !!user.dropboxRefreshToken;
      const isTokenExpired = user.dropboxTokenExpiry && new Date(user.dropboxTokenExpiry) <= new Date();
      
      // Connected if we have either token
      const connected = hasAccessToken || hasRefreshToken;
      
      // Valid token if we have unexpired access token OR we have refresh token to get new access token
      const hasValidToken = (hasAccessToken && !isTokenExpired) || hasRefreshToken;
      
      res.json({
        connected,
        hasValidToken,
        // Add debug info for development
        ...(process.env.NODE_ENV === 'development' && {
          debug: {
            hasAccessToken,
            hasRefreshToken,
            isTokenExpired,
            tokenExpiry: user.dropboxTokenExpiry
          }
        })
      });
    } catch (error) {
      console.error("Error checking Dropbox auth status:", error);
      res.status(500).json({ 
        message: "Failed to check Dropbox auth status",
        connected: false,
        hasValidToken: false,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Disconnect Dropbox account
  app.delete('/api/auth/dropbox', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.error("User not found when disconnecting Dropbox:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.dropboxConnected) {
        return res.status(400).json({ message: "Dropbox account is not connected" });
      }

      await storage.updateUserDropboxTokens(userId, {
        accessToken: null,
        refreshToken: null,
        expiry: null
      });

      console.log("Dropbox account disconnected successfully for user:", userId);
      res.json({ message: "Dropbox account disconnected successfully" });
    } catch (error) {
      console.error("Error disconnecting Dropbox account:", error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(500).json({ 
        message: "Failed to disconnect Dropbox account",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Dropbox API routes
  app.get('/api/dropbox/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const path = req.query.path as string || '';

      // Validate path parameter
      if (typeof path !== 'string') {
        return res.status(400).json({ message: "Invalid path parameter" });
      }

      const dropboxService = new DropboxService(userId);
      const files = await dropboxService.listFiles(path);

      res.json(files);
    } catch (error) {
      console.error("Error listing Dropbox files:", error, { userId: req.user.claims.sub, path: req.query.path });
      
      if (error instanceof Error) {
        // Handle specific Dropbox API errors
        if (error.message.includes('access token has expired') || error.message.includes('expired access token')) {
          return res.status(401).json({ 
            message: "Dropbox access expired. Please reconnect your account.",
            action: "reconnect_required"
          });
        }
        if (error.message.includes('not connected') || error.message.includes('User has not connected')) {
          return res.status(401).json({ 
            message: "Dropbox account not connected",
            action: "connect_required"
          });
        }
        if (error.message.includes('path_not_found') || error.message.includes('not_found')) {
          return res.status(404).json({ message: "Folder or path not found in Dropbox" });
        }
        if (error.message.includes('insufficient_permissions') || error.message.includes('access_denied')) {
          return res.status(403).json({ message: "Insufficient permissions to access this folder" });
        }
        if (error.message.includes('rate_limit') || error.message.includes('too_many_requests')) {
          return res.status(429).json({ message: "Rate limit exceeded. Please try again later." });
        }
        if (error.message.includes('invalid_cursor')) {
          return res.status(400).json({ message: "Invalid folder listing cursor. Please refresh." });
        }
      }
      
      res.status(500).json({ 
        message: "Failed to list Dropbox files",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  app.post('/api/dropbox/upload', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { filename, content, path } = req.body;

      // Validate required fields
      if (!filename || typeof filename !== 'string') {
        return res.status(400).json({ message: "Valid filename is required" });
      }
      if (content === undefined || content === null) {
        return res.status(400).json({ message: "File content is required" });
      }

      // Validate path parameter
      if (path !== undefined && typeof path !== 'string') {
        return res.status(400).json({ message: "Invalid path parameter" });
      }

      // Validate filename
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: "Invalid filename format" });
      }

      // Convert content to ArrayBuffer for service compatibility
      let contentBuffer: ArrayBuffer;
      if (typeof content === 'string') {
        // Convert string content to ArrayBuffer
        const encoder = new TextEncoder();
        contentBuffer = encoder.encode(content).buffer;
      } else if (content instanceof ArrayBuffer) {
        contentBuffer = content;
      } else {
        // Convert other types to JSON string then to ArrayBuffer  
        const encoder = new TextEncoder();
        contentBuffer = encoder.encode(JSON.stringify(content)).buffer;
      }

      // Validate file size (Dropbox supports up to 350GB with upload sessions)
      const contentSize = contentBuffer.byteLength;
      const maxSize = 350 * 1024 * 1024 * 1024; // 350GB limit for upload sessions
      if (contentSize > maxSize) {
        return res.status(413).json({ message: "File too large. Maximum size is 350GB." });
      }

      const dropboxService = new DropboxService(userId);
      const file = await dropboxService.uploadFile(filename, contentBuffer, path);

      console.log("File uploaded successfully to Dropbox:", { userId, filename, size: contentSize });
      res.json(file);
    } catch (error) {
      console.error("Error uploading file to Dropbox:", error, { 
        userId: req.user.claims.sub, 
        filename: req.body.filename 
      });
      
      if (error instanceof Error) {
        // Handle specific Dropbox API errors
        if (error.message.includes('access token has expired') || error.message.includes('expired access token')) {
          return res.status(401).json({ 
            message: "Dropbox access expired. Please reconnect your account.",
            action: "reconnect_required"
          });
        }
        if (error.message.includes('not connected') || error.message.includes('User has not connected')) {
          return res.status(401).json({ 
            message: "Dropbox account not connected",
            action: "connect_required"
          });
        }
        if (error.message.includes('insufficient_space') || error.message.includes('storage_quota')) {
          return res.status(507).json({ message: "Insufficient storage space in Dropbox account" });
        }
        if (error.message.includes('file_already_exists') || error.message.includes('already exists')) {
          return res.status(409).json({ message: "File already exists at this location" });
        }
        if (error.message.includes('invalid_path') || error.message.includes('path_not_found')) {
          return res.status(404).json({ message: "Upload path not found in Dropbox" });
        }
        if (error.message.includes('rate_limit') || error.message.includes('too_many_requests')) {
          return res.status(429).json({ message: "Rate limit exceeded. Please try again later." });
        }
        if (error.message.includes('file_size_error') || error.message.includes('too large')) {
          return res.status(413).json({ message: "File size exceeds Dropbox limits" });
        }
        if (error.message.includes('invalid_file_name') || error.message.includes('disallowed_name')) {
          return res.status(400).json({ message: "Invalid or disallowed filename" });
        }
      }
      
      res.status(500).json({ 
        message: "Failed to upload file to Dropbox",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Duplicate detection check before copy/transfer
  app.post('/api/duplicate-check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { fileName, fileSize, provider } = req.body;

      if (!fileName || fileSize === undefined) {
        return res.status(400).json({ 
          message: "fileName and fileSize are required for duplicate check"
        });
      }

      const duplicateService = new DuplicateDetectionService(userId);
      const result = await duplicateService.checkDuplicate(fileName, fileSize, undefined, provider);

      res.json({
        isDuplicate: result.isDuplicate,
        matchType: result.matchType,
        duplicateFile: result.duplicateFile || null,
        resolutionOptions: result.isDuplicate 
          ? ['skip', 'replace', 'copy_with_suffix'] 
          : []
      });
    } catch (error) {
      console.error("Error checking duplicates:", error);
      res.status(500).json({ message: "Failed to check duplicates" });
    }
  });

  // Cross-cloud transfer route - Queue-based asynchronous transfers
  app.post('/api/transfer-files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const limitError = await enforceOperationLimits(userId);
      if (limitError) return res.status(limitError.status).json({ message: limitError.message });

      // Strict validation with Zod schema
      const transferSchema = z.object({
        sourceProvider: z.enum(['google', 'dropbox', 'onedrive', 'box', 's3']),
        targetProvider: z.enum(['google', 'dropbox', 'onedrive', 'box', 's3']),
        fileName: z.string().min(1, "File name is required").max(255, "File name too long"),
        fileSize: z.number().optional(),
        targetPath: z.string().optional(),
        duplicateAction: z.enum(['skip', 'replace', 'copy_with_suffix']).default('skip'),
        sourceFileId: z.string().optional(),
        sourceFilePath: z.string().optional(),
        sourceBucket: z.string().optional(),  // S3 source bucket
        targetBucket: z.string().optional(),  // S3 target bucket
        isFolder: z.boolean().optional().default(false)
      }).refine(data => data.sourceProvider !== data.targetProvider, {
        message: "Source and target providers must be different"
      }).refine(data => {
        if (data.sourceProvider === 'google') return !!data.sourceFileId;
        if (data.sourceProvider === 'dropbox') return !!data.sourceFilePath;
        if (data.sourceProvider === 'onedrive') return !!data.sourceFileId;
        if (data.sourceProvider === 'box') return !!data.sourceFileId;
        if (data.sourceProvider === 's3') return !!data.sourceFileId && !!data.sourceBucket;
        return true;
      }, {
        message: "Invalid source identifier for provider"
      }).refine(data => {
        if (data.targetProvider === 's3') return !!data.targetBucket;
        return true;
      }, {
        message: "S3 target requires a bucket (targetBucket)"
      });

      const validation = transferSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validation.error.errors 
        });
      }

      const { sourceProvider, sourceFileId, sourceFilePath, sourceBucket, targetBucket, targetProvider, targetPath, fileName, fileSize, duplicateAction, isFolder } = validation.data;

      // Check user membership in backend for security
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userMembership = user.membershipPlan || 'free';
      const membershipExpiry = user.membershipExpiry ? new Date(user.membershipExpiry) : null;
      const isExpired = membershipExpiry && membershipExpiry < new Date();
      const isAdmin = user.role === 'admin';

      if (!isAdmin && (userMembership === 'free' || isExpired)) {
        return res.status(403).json({
          message: "Premium feature",
          detail: isExpired
            ? "Your PRO subscription has expired"
            : "Cross-cloud transfers require a PRO subscription"
        });
      }

      // Check for duplicates if fileSize is provided
      if (fileSize) {
        const duplicateService = new DuplicateDetectionService(userId);
        const dupCheck = await duplicateService.checkDuplicate(fileName, fileSize, undefined, targetProvider);

        if (dupCheck.isDuplicate && duplicateAction === 'skip') {
          return res.status(409).json({
            message: "File already exists",
            isDuplicate: true,
            duplicateFile: dupCheck.duplicateFile,
            suggestedAction: 'skip',
            detail: `A file named "${fileName}" already exists in your ${targetProvider} storage`
          });
        }
      }

      // Build sourceUrl for cross-cloud transfers
      let sourceUrl: string;
      if (sourceProvider === 'google') {
        sourceUrl = isFolder
          ? `https://drive.google.com/drive/folders/${sourceFileId}`
          : `https://drive.google.com/file/d/${sourceFileId}`;
      } else if (sourceProvider === 'dropbox') {
        sourceUrl = isFolder ? `dropbox://folder:${sourceFilePath}` : `dropbox://${sourceFilePath}`;
      } else if (sourceProvider === 'onedrive') {
        sourceUrl = `onedrive://${sourceFileId}`;
      } else if (sourceProvider === 'box') {
        sourceUrl = `box://${sourceFileId}`;
      } else {
        // s3
        sourceUrl = `s3://${sourceBucket}/${sourceFileId}`;
      }

      // Build destinationFolderId — for S3 encode as "bucket/prefix"
      const destinationFolderId = targetProvider === 's3'
        ? `${targetBucket}/${targetPath || ''}`
        : (targetPath || 'root');

      let finalFileName = fileName;

      // Apply duplicate resolution if needed
      if (fileSize) {
        const duplicateService = new DuplicateDetectionService(userId);
        const dupCheck = await duplicateService.checkDuplicate(fileName, fileSize, undefined, targetProvider);
        if (dupCheck.isDuplicate && duplicateAction === 'copy_with_suffix') {
          const resolution = duplicateService.applyResolution(fileName, { action: 'copy_with_suffix' });
          finalFileName = resolution.newFileName;
        }
      }

      const copyOperation = await storage.createCopyOperation({
        userId,
        sourceUrl,
        sourceProvider,
        sourceFileId: sourceFileId || null,
        sourceFilePath: sourceFilePath || null,
        destProvider: targetProvider,
        destinationFolderId,
        fileName: finalFileName,
        itemType: isFolder ? 'folder' : 'file',
        duplicateAction,
        status: 'pending'
      });

      console.log(`Transfer job created: ${sourceProvider} → ${targetProvider}`, {
        jobId: copyOperation.id,
        userId,
        fileName: finalFileName,
        isFolder,
        duplicateAction
      });

      // Wake up worker immediately (resets backoff)
      const worker = getQueueWorker();
      worker?.notifyNewJob();

      // Return job ID immediately for tracking (202 Accepted for async processing)
      res.status(202).json({
        success: true,
        jobId: copyOperation.id,
        status: 'queued',
        fileName: finalFileName,
        duplicateAction,
        message: 'Transfer started in background. Use the job ID to track progress.'
      });

    } catch (error) {
      console.error("Error creating transfer job:", error, {
        userId: req.user.claims.sub,
        sourceProvider: req.body.sourceProvider,
        targetProvider: req.body.targetProvider,
        fileName: req.body.fileName
      });

      res.status(500).json({
        message: "Failed to create transfer job",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Server-Sent Events endpoint for real-time job updates
  // IMPORTANT: This static route must be defined BEFORE the dynamic :jobId route
  app.get('/api/transfer-jobs/events', isAuthenticated, (req: any, res) => {
    const userId = req.user.claims.sub;
    
    // Set proper SSE headers for production
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    // Flush headers immediately to establish connection
    res.flushHeaders();

    // Send initial connection confirmation with proper SSE format
    res.write(`event: connected\n`);
    res.write(`data: ${JSON.stringify({ userId, timestamp: new Date().toISOString() })}\n\n`);

    // Get the queue worker instance
    const worker = getQueueWorker();
    if (!worker) {
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: 'Queue worker not available' })}\n\n`);
      res.end();
      return;
    }

    // Event listeners for job updates with proper SSE format
    const sendJobUpdate = async (eventType: string, jobId: string, jobUserId: string, extraData?: any) => {
      // Only send events for this user's jobs
      if (jobUserId === userId) {
        try {
          // Get job details from storage to include full info
          const job = await storage.getCopyOperation(jobId);
          if (job) {
            const eventData = {
              jobId: job.id,
              status: job.status,
              fileName: job.fileName,
              progressPct: extraData?.progressPct || job.progressPct || 0,
              errorMessage: extraData?.error || job.errorMessage,
              copiedFileUrl: job.copiedFileUrl,
              timestamp: new Date().toISOString(),
              ...extraData
            };
            
            res.write(`event: ${eventType}\n`);
            res.write(`data: ${JSON.stringify(eventData)}\n\n`);
          }
        } catch (error) {
          console.error('Error writing SSE data:', error);
        }
      }
    };

    // Register event listeners with correct signatures
    const onJobProgress = (jobId: string, jobUserId: string, data: any) => sendJobUpdate('progress', jobId, jobUserId, data);
    const onJobCompleted = (jobId: string, jobUserId: string, result: any) => sendJobUpdate('completed', jobId, jobUserId, result);
    const onJobFailed = (jobId: string, jobUserId: string, errorMessage: string) => sendJobUpdate('failed', jobId, jobUserId, { error: errorMessage });
    const onJobCancelled = (jobId: string, jobUserId: string) => sendJobUpdate('cancelled', jobId, jobUserId);
    const onJobRetry = (jobId: string, jobUserId: string, data: any) => sendJobUpdate('retry', jobId, jobUserId, data);

    worker.on('jobProgress', onJobProgress);
    worker.on('jobCompleted', onJobCompleted);
    worker.on('jobFailed', onJobFailed);
    worker.on('jobCancelled', onJobCancelled);
    worker.on('jobRetry', onJobRetry);

    // Handle client disconnect
    req.on('close', () => {
      console.log(`SSE client disconnected: ${userId}`);
      worker.off('jobProgress', onJobProgress);
      worker.off('jobCompleted', onJobCompleted);
      worker.off('jobFailed', onJobFailed);
      worker.off('jobCancelled', onJobCancelled);
      worker.off('jobRetry', onJobRetry);
    });

    req.on('error', (error: any) => {
      console.error('SSE client error:', error);
      worker.off('jobProgress', onJobProgress);
      worker.off('jobCompleted', onJobCompleted);
      worker.off('jobFailed', onJobFailed);
      worker.off('jobCancelled', onJobCancelled);
      worker.off('jobRetry', onJobRetry);
    });

    // Keep connection alive with periodic heartbeat
    const heartbeat = setInterval(() => {
      try {
        res.write(`event: heartbeat\n`);
        res.write(`data: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
      } catch (error) {
        console.error('Error sending heartbeat:', error);
        clearInterval(heartbeat);
      }
    }, 30000); // Every 30 seconds

    // Clear heartbeat on disconnect
    req.on('close', () => {
      clearInterval(heartbeat);
    });
  });

  // Job tracking endpoints
  app.get('/api/transfer-jobs/:jobId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { jobId } = req.params;

      const job = await storage.getCopyOperation(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Ensure user can only access their own jobs
      if (job.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json({
        id: job.id,
        status: job.status,
        fileName: job.fileName,
        sourceProvider: job.sourceProvider,
        destinationProvider: job.destProvider,
        progressPct: job.progressPct || 0,
        completedFiles: job.completedFiles || 0,
        totalFiles: job.totalFiles || 1,
        errorMessage: job.errorMessage,
        copiedFileUrl: job.copiedFileUrl,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      });
    } catch (error) {
      console.error("Error getting job status:", error);
      res.status(500).json({ message: "Failed to get job status" });
    }
  });

  app.get('/api/transfer-jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobs = await storage.getUserCopyOperations(userId);

      res.json(jobs.map(job => ({
        id: job.id,
        status: job.status,
        fileName: job.fileName,
        sourceProvider: job.sourceProvider,
        destinationProvider: job.destProvider,
        progressPct: job.progressPct || 0,
        errorMessage: job.errorMessage,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      })));
    } catch (error) {
      console.error("Error getting user jobs:", error);
      res.status(500).json({ message: "Failed to get jobs" });
    }
  });

  app.post('/api/transfer-jobs/:jobId/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { jobId } = req.params;

      const job = await storage.getCopyOperation(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Ensure user can only cancel their own jobs
      if (job.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Only allow cancellation of pending or in-progress jobs
      if (job.status !== 'pending' && job.status !== 'in_progress') {
        return res.status(400).json({ 
          message: `Cannot cancel job with status: ${job.status}` 
        });
      }

      const updatedJob = await storage.requestJobCancel(jobId);
      
      res.json({
        id: updatedJob.id,
        status: updatedJob.status,
        cancelRequested: updatedJob.cancelRequested,
        message: 'Cancellation requested'
      });
    } catch (error) {
      console.error("Error canceling job:", error);
      res.status(500).json({ message: "Failed to cancel job" });
    }
  });

  // Membership management routes
  app.get('/api/membership/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const membershipExpiry = user.membershipExpiry ? new Date(user.membershipExpiry) : null;
      const isExpired = membershipExpiry && membershipExpiry < new Date();

      res.json({
        plan: user.membershipPlan || 'free',
        expiry: membershipExpiry,
        isExpired,
        trialUsed: user.membershipTrialUsed || false
      });
    } catch (error) {
      console.error("Error getting membership status:", error);
      res.status(500).json({ message: "Failed to get membership status" });
    }
  });

  app.post('/api/membership/upgrade', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request with Zod
      const upgradeSchema = z.object({
        plan: z.literal('pro'),
        duration: z.number().int().positive().max(24, "Duration cannot exceed 24 months")
      });
      
      const validation = upgradeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validation.error.errors 
        });
      }
      
      const { plan, duration } = validation.data;

      // Calculate expiry (duration in months)
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + (duration || 1));

      const updatedUser = await storage.updateUser(userId, {
        membershipPlan: 'pro',
        membershipExpiry: expiryDate,
        ...PLAN_LIMITS.pro,
      });

      res.json({
        success: true,
        plan: updatedUser.membershipPlan,
        expiry: updatedUser.membershipExpiry,
        message: `Successfully upgraded to ${plan.toUpperCase()} plan`
      });
    } catch (error) {
      console.error("Error upgrading membership:", error);
      res.status(500).json({ message: "Failed to upgrade membership" });
    }
  });

  // Dropbox URL parsing and copy operations
  app.post('/api/dropbox/parse-url', isAuthenticated, async (req: any, res) => {
    try {
      const { url } = req.body;
      const userId = req.user.claims.sub;
      const dropboxService = new DropboxService(userId);
      const urlInfo = dropboxService.parseDropboxUrl(url);
      res.json(urlInfo);
    } catch (error) {
      console.error("Error parsing Dropbox URL:", error);
      res.status(500).json({ message: "Failed to parse Dropbox URL" });
    }
  });

  app.post('/api/dropbox/list-shared-files', isAuthenticated, async (req: any, res) => {
    try {
      const { sharedUrl, path = '' } = req.body;
      const userId = req.user.claims.sub;
      const dropboxService = new DropboxService(userId);
      
      if (!sharedUrl) {
        return res.status(400).json({ message: "Shared URL is required" });
      }

      const files = await dropboxService.listSharedFolderContents(sharedUrl, path);
      res.json(files);
    } catch (error) {
      console.error("Error listing shared folder contents:", error);
      
      if (error instanceof Error) {
        if (error.message.includes('access token has expired')) {
          return res.status(401).json({ message: "Dropbox access expired. Please reconnect your account." });
        }
        if (error.message.includes('not connected')) {
          return res.status(401).json({ message: "Dropbox account not connected" });
        }
        if (error.message.includes('Invalid Dropbox URL')) {
          return res.status(400).json({ message: "Invalid Dropbox URL format" });
        }
      }
      
      res.status(500).json({ message: "Failed to list shared folder contents" });
    }
  });

  app.post('/api/dropbox/copy-from-url', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const limitError = await enforceOperationLimits(userId);
      if (limitError) return res.status(limitError.status).json({ message: limitError.message });

      const validation = insertCopyOperationSchema.parse({
        ...req.body,
        userId,
        status: 'pending',
      });

      const operation = await storage.createCopyOperation(validation);
      res.json(operation);

      // Start copy process in background for Dropbox
      const dropboxService = new DropboxService(userId);
      dropboxService.startCopyFromUrl(operation.id, validation.sourceUrl);
    } catch (error) {
      console.error("Error creating Dropbox copy operation:", error);
      res.status(500).json({ message: "Failed to create Dropbox copy operation" });
    }
  });

  app.post('/api/dropbox/copy-operations/preview', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body with Zod
      const previewSchema = z.object({
        sourceUrl: z.string().url("Invalid URL format").min(1, "Source URL is required")
      });
      
      const validation = previewSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: validation.error.errors
        });
      }

      const { sourceUrl } = validation.data;
      const dropboxService = new DropboxService(userId);
      const preview = await dropboxService.getOperationPreview(sourceUrl);
      
      res.json(preview);
    } catch (error) {
      console.error("Error getting Dropbox operation preview:", error);
      
      // Provide more specific error messages based on the actual errors thrown
      if (error instanceof Error) {
        if (error.message.includes('Invalid Dropbox URL')) {
          return res.status(400).json({ message: "Invalid Dropbox URL format" });
        }
        if (error.message.includes('access token has expired')) {
          return res.status(401).json({ message: "Dropbox access expired. Please reconnect your account." });
        }
        if (error.message.includes('not connected')) {
          return res.status(401).json({ message: "Dropbox account not connected" });
        }
      }
      
      res.status(500).json({ message: "Failed to get Dropbox operation preview" });
    }
  });

  // Dropbox folder browsing endpoints
  app.get('/api/dropbox/folders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const path = String(req.query.path || '/');
      const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
      
      // Validate path format
      if (typeof req.query.path !== 'undefined' && typeof req.query.path !== 'string') {
        return res.status(400).json({ message: "Invalid path parameter" });
      }
      
      const dropboxService = new DropboxService(userId);
      const result = await dropboxService.listFolders(path, cursor);
      
      res.json(result);
    } catch (error) {
      console.error("Error listing Dropbox folders:", error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('access token has expired')) {
          return res.status(401).json({ message: "Dropbox access expired. Please reconnect your account." });
        }
        if (error.message.includes('not connected')) {
          return res.status(401).json({ message: "Dropbox account not connected" });
        }
        if (error.message.includes('path_not_found') || error.message.includes('not_found')) {
          return res.status(404).json({ message: "Folder path not found in Dropbox" });
        }
        if (error.message.includes('path_malformed') || error.message.includes('malformed_path')) {
          return res.status(400).json({ message: "Invalid folder path format" });
        }
      }
      
      res.status(500).json({ message: "Failed to list Dropbox folders" });
    }
  });

  app.get('/api/dropbox/folders/path', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const path = String(req.query.path || '/');
      
      // Validate path format
      if (typeof req.query.path !== 'undefined' && typeof req.query.path !== 'string') {
        return res.status(400).json({ message: "Invalid path parameter" });
      }
      
      const dropboxService = new DropboxService(userId);
      const breadcrumbs = await dropboxService.getFolderPath(path);
      
      res.json({ path: breadcrumbs });
    } catch (error) {
      console.error("Error getting Dropbox folder path:", error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('access token has expired')) {
          return res.status(401).json({ message: "Dropbox access expired. Please reconnect your account." });
        }
        if (error.message.includes('not connected')) {
          return res.status(401).json({ message: "Dropbox account not connected" });
        }
        if (error.message.includes('path_not_found') || error.message.includes('not_found')) {
          return res.status(404).json({ message: "Folder path not found in Dropbox" });
        }
        if (error.message.includes('path_malformed') || error.message.includes('malformed_path')) {
          return res.status(400).json({ message: "Invalid folder path format" });
        }
      }
      
      res.status(500).json({ message: "Failed to get Dropbox folder path" });
    }
  });

  // OAuth help and status endpoints
  app.get('/api/oauth/help', (req, res) => {
    const googleUri = getOAuthRedirectUri(req, '/api/auth/google/callback');
    const dropboxUri = getOAuthRedirectUri(req, '/api/auth/dropbox/callback');
    const domain = process.env.REPLIT_DEV_DOMAIN || req.get('host') || 'localhost:5000';
    
    res.json({
      message: "Add these redirect URIs to your OAuth applications",
      redirectUris: {
        google: {
          service: "Google Cloud Console",
          url: googleUri,
          instructions: "Go to Google Cloud Console → APIs & Services → Credentials → Edit your OAuth 2.0 Client ID → Add this URL to 'Authorized redirect URIs'"
        },
        dropbox: {
          service: "Dropbox App Console",
          url: dropboxUri,
          instructions: "Go to Dropbox App Console → Your App → Settings → Add this URL to 'OAuth2 Redirect URIs'"
        }
      },
      currentDomain: domain,
      note: "💡 Remember: Each time you remix this Repl, the domain changes and you'll need to add the new URLs to your OAuth configurations."
    });
  });

  app.get('/api/oauth/status', async (req: any, res) => {
    try {
      const isAuthenticated = req.user ? true : false;
      let status = {
        authenticated: isAuthenticated,
        domain: process.env.REPLIT_DEV_DOMAIN || req.get('host') || 'localhost:5000',
        google: { configured: false, connected: false },
        dropbox: { configured: false, connected: false }
      };

      // Check if OAuth credentials are configured
      status.google.configured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
      status.dropbox.configured = !!(process.env.DROPBOX_APP_KEY && process.env.DROPBOX_APP_SECRET);

      if (isAuthenticated) {
        try {
          const userId = req.user.claims.sub;
          const user = await storage.getUser(userId);
          
          status.google.connected = !!(user?.googleAccessToken || user?.googleRefreshToken);
          status.dropbox.connected = !!(user?.dropboxAccessToken || user?.dropboxRefreshToken);
        } catch (error) {
          console.error("Error checking user OAuth status:", error);
        }
      }

      res.json(status);
    } catch (error) {
      console.error("Error getting OAuth status:", error);
      res.status(500).json({ message: "Failed to get OAuth status" });
    }
  });

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  // Get all users (admin only)
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await storage.getAllUsers(page, limit);
      res.json(result);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update user limits (admin only)
  app.put('/api/admin/users/:id/limits', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      
      const limitsSchema = z.object({
        maxStorageBytes: z.number().positive().optional(),
        maxConcurrentOperations: z.number().positive().optional(),
        maxDailyOperations: z.number().positive().optional(),
      });

      const validation = limitsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid limits data",
          errors: validation.error.errors
        });
      }

      const updatedUser = await storage.updateUserLimits(userId, validation.data);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user limits:", error);
      res.status(500).json({ message: "Failed to update user limits" });
    }
  });

  // Update user role (admin only)
  app.put('/api/admin/users/:id/role', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const { role } = req.body;

      if (!role || !['admin', 'user'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'admin' or 'user'" });
      }

      const updatedUser = await storage.updateUserRole(userId, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Suspend user (admin only)
  app.post('/api/admin/users/:id/suspend', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const updatedUser = await storage.suspendUser(userId);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error suspending user:", error);
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });

  // Activate user (admin only)
  app.post('/api/admin/users/:id/activate', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const updatedUser = await storage.activateUser(userId);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error activating user:", error);
      res.status(500).json({ message: "Failed to activate user" });
    }
  });

  // Delete user (admin only)
  app.delete('/api/admin/users/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Get user activity (admin only)
  app.get('/api/admin/users/:id/activity', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const activity = await storage.getUserActivity(userId);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });

  // Get all operations with filters (admin only)
  app.get('/api/admin/operations', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const filters: any = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      if (req.query.userId) filters.userId = req.query.userId as string;
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.provider) filters.provider = req.query.provider as string;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

      const result = await storage.getAllOperations(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching operations:", error);
      res.status(500).json({ message: "Failed to fetch operations" });
    }
  });

  // Retry failed operation (user-level — only own operations)
  app.post('/api/copy-operations/:id/retry', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const operation = await storage.getCopyOperation(req.params.id);
      if (!operation) return res.status(404).json({ message: "Operation not found" });
      if (operation.userId !== userId) return res.status(403).json({ message: "Access denied" });
      if (operation.status !== 'failed') return res.status(400).json({ message: "Only failed operations can be retried" });
      const retried = await storage.retryOperation(req.params.id);
      res.json(retried);
    } catch (error) {
      console.error("Error retrying operation:", error);
      res.status(500).json({ message: "Failed to retry operation" });
    }
  });

  // Retry failed operation (admin only)
  app.post('/api/admin/operations/:id/retry', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const operationId = req.params.id;
      const retriedOperation = await storage.retryOperation(operationId);
      res.json(retriedOperation);
    } catch (error) {
      console.error("Error retrying operation:", error);
      res.status(500).json({ message: "Failed to retry operation" });
    }
  });

  // Get system metrics (admin only)
  app.get('/api/admin/metrics', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const metrics = await storage.getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // ==========================================
  // FILE SHARING BETWEEN USERS
  // ==========================================

  // Create a share request (send file to another user)
  // Download shared file
  app.get('/api/shares/:id/download', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const share = await storage.getShareRequest(id);
      
      if (!share) {
        return res.status(404).json({ message: "Share request not found" });
      }

      // Check permissions: either sender or recipient
      const userId = req.user.claims.sub;
      if (share.senderId !== userId && share.recipientId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (share.status !== 'accepted' && share.senderId !== userId) {
        return res.status(403).json({ message: "File not accepted yet" });
      }

      if (share.fileType === 'folder') {
        return res.status(400).json({ message: "Folders cannot be downloaded directly. Use 'Copy to Drive' instead." });
      }

      // Initialize service based on provider
      if (share.provider === 'google') {
        const driveService = new GoogleDriveService(share.senderId);
        const { stream, filename, mimeType } = await driveService.downloadFile(share.fileId);
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', mimeType || 'application/octet-stream');
        stream.pipe(res);
      } else if (share.provider === 'dropbox') {
        const dropboxService = new DropboxService(share.senderId);
        const { buffer, filename, mimeType } = await dropboxService.downloadFile(share.fileId);
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', mimeType || 'application/octet-stream');
        res.send(buffer);
      } else {
        res.status(400).json({ message: "Unsupported provider" });
      }
    } catch (error) {
      console.error("Error downloading shared file:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  app.post('/api/shares', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const { recipientEmail, provider, fileId, filePath, fileName, fileType, fileSize, mimeType, message } = req.body;

      if (!recipientEmail || !provider || !fileId || !fileName || !fileType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Find recipient by email
      const recipient = await storage.getUserByEmail(recipientEmail);
      if (!recipient) {
        return res.status(404).json({ message: "User not found with this email" });
      }

      // Cannot share with yourself
      if (recipient.id === senderId) {
        return res.status(400).json({ message: "Cannot share with yourself" });
      }

      // Create share request
      const shareRequest = await storage.createShareRequest({
        senderId,
        recipientId: recipient.id,
        recipientEmail,
        provider,
        fileId,
        filePath: filePath || null,
        fileName,
        fileType,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        message: message || null,
        status: 'pending',
      });

      // Create event
      await storage.createShareEvent({
        shareRequestId: shareRequest.id,
        eventType: 'created',
        actorId: senderId,
        details: `File "${fileName}" shared with ${recipientEmail}`,
      });

      res.status(201).json(shareRequest);
    } catch (error: any) {
      console.error("Error creating share request:", error);
      res.status(500).json({ message: "Failed to create share request" });
    }
  });

  // Get user's inbox (files shared with them)
  app.get('/api/shares/inbox', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const inbox = await storage.getUserInbox(userId);
      
      // Enrich with sender info
      const enrichedInbox = await Promise.all(inbox.map(async (share) => {
        const sender = await storage.getUser(share.senderId);
        return {
          ...share,
          senderName: sender ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || sender.email : 'Unknown',
          senderEmail: sender?.email || 'Unknown',
          senderAvatar: sender?.profileImageUrl || null,
        };
      }));
      
      res.json(enrichedInbox);
    } catch (error: any) {
      console.error("Error fetching inbox:", error);
      res.status(500).json({ message: "Failed to fetch inbox" });
    }
  });

  // Get user's outbox (files they shared)
  app.get('/api/shares/outbox', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outbox = await storage.getUserOutbox(userId);
      
      // Enrich with recipient info
      const enrichedOutbox = await Promise.all(outbox.map(async (share) => {
        const recipient = await storage.getUser(share.recipientId);
        return {
          ...share,
          recipientName: recipient ? `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || recipient.email : 'Unknown',
          recipientAvatar: recipient?.profileImageUrl || null,
        };
      }));
      
      res.json(enrichedOutbox);
    } catch (error: any) {
      console.error("Error fetching outbox:", error);
      res.status(500).json({ message: "Failed to fetch outbox" });
    }
  });

  // Respond to share request (accept/reject)
  app.patch('/api/shares/:id/respond', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shareId = req.params.id;
      const { action } = req.body; // 'accept' or 'reject'

      if (!action || !['accept', 'reject'].includes(action)) {
        return res.status(400).json({ message: "Invalid action. Must be 'accept' or 'reject'" });
      }

      const shareRequest = await storage.getShareRequest(shareId);
      if (!shareRequest) {
        return res.status(404).json({ message: "Share request not found" });
      }

      // Only recipient can respond
      if (shareRequest.recipientId !== userId) {
        return res.status(403).json({ message: "Not authorized to respond to this share" });
      }

      // Can only respond to pending requests
      if (shareRequest.status !== 'pending') {
        return res.status(400).json({ message: "Share request already processed" });
      }

      const newStatus = action === 'accept' ? 'accepted' : 'rejected';
      const updated = await storage.updateShareRequest(shareId, {
        status: newStatus,
        respondedAt: new Date(),
      });

      // Note: cloudFile is NOT created on acceptance
      // The file will be copied to user's cloud storage when they use "Send to" feature

      // Create event
      await storage.createShareEvent({
        shareRequestId: shareId,
        eventType: newStatus,
        actorId: userId,
        details: `Share request ${newStatus}`,
      });

      res.json(updated);
    } catch (error: any) {
      console.error("Error responding to share:", error);
      res.status(500).json({ message: "Failed to respond to share request" });
    }
  });

  // Get share request details
  app.get('/api/shares/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shareId = req.params.id;

      const shareRequest = await storage.getShareRequest(shareId);
      if (!shareRequest) {
        return res.status(404).json({ message: "Share request not found" });
      }

      // Only sender or recipient can view
      if (shareRequest.senderId !== userId && shareRequest.recipientId !== userId) {
        return res.status(403).json({ message: "Not authorized to view this share" });
      }

      res.json(shareRequest);
    } catch (error: any) {
      console.error("Error fetching share:", error);
      res.status(500).json({ message: "Failed to fetch share request" });
    }
  });

  // Get share events/history
  app.get('/api/shares/:id/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shareId = req.params.id;

      const shareRequest = await storage.getShareRequest(shareId);
      if (!shareRequest) {
        return res.status(404).json({ message: "Share request not found" });
      }

      // Only sender or recipient can view events
      if (shareRequest.senderId !== userId && shareRequest.recipientId !== userId) {
        return res.status(403).json({ message: "Not authorized to view these events" });
      }

      const events = await storage.getShareEvents(shareId);
      res.json(events);
    } catch (error: any) {
      console.error("Error fetching share events:", error);
      res.status(500).json({ message: "Failed to fetch share events" });
    }
  });

  // Cancel share request (sender only)
  app.delete('/api/shares/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shareId = req.params.id;

      const shareRequest = await storage.getShareRequest(shareId);
      if (!shareRequest) {
        return res.status(404).json({ message: "Share request not found" });
      }

      // Only sender can cancel
      if (shareRequest.senderId !== userId) {
        return res.status(403).json({ message: "Not authorized to cancel this share" });
      }

      // Can only cancel pending requests
      if (shareRequest.status !== 'pending') {
        return res.status(400).json({ message: "Cannot cancel a processed share request" });
      }

      const updated = await storage.updateShareRequest(shareId, {
        status: 'cancelled',
        respondedAt: new Date(),
      });

      // Create event
      await storage.createShareEvent({
        shareRequestId: shareId,
        eventType: 'cancelled',
        actorId: userId,
        details: 'Share request cancelled by sender',
      });

      res.json(updated);
    } catch (error: any) {
      console.error("Error cancelling share:", error);
      res.status(500).json({ message: "Failed to cancel share request" });
    }
  });

  // Send accepted share to cloud provider (Google Drive or Dropbox)
  // Note: Only same-provider transfers are supported (Google->Google, Dropbox->Dropbox)
  app.post('/api/shares/:id/send-to', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shareId = req.params.id;
      const { provider, destinationFolderId, destinationPath } = req.body;

      const limitError = await enforceOperationLimits(userId);
      if (limitError) return res.status(limitError.status).json({ message: limitError.message });

      if (!provider || !['google', 'dropbox'].includes(provider)) {
        return res.status(400).json({ message: "Invalid provider. Must be 'google' or 'dropbox'" });
      }

      const shareRequest = await storage.getShareRequest(shareId);
      if (!shareRequest) {
        return res.status(404).json({ message: "Share request not found" });
      }

      if (shareRequest.recipientId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      if (shareRequest.status !== 'accepted') {
        return res.status(400).json({ message: "Share must be accepted first" });
      }

      // Enforce same-provider transfers for now
      if (shareRequest.provider !== provider) {
        return res.status(400).json({ 
          message: `Cross-provider transfers not supported. The file is from ${shareRequest.provider}, please select ${shareRequest.provider} as destination.`
        });
      }

      // Build source URL based on source provider
      let sourceUrl: string;
      if (shareRequest.provider === 'google') {
        sourceUrl = `https://drive.google.com/file/d/${shareRequest.fileId}/view`;
      } else {
        sourceUrl = shareRequest.filePath || `https://www.dropbox.com/s/${shareRequest.fileId}`;
      }

      // Create copy operation using the standard flow
      // For Google: destinationFolderId is the folder ID
      // For Dropbox: destinationFolderId stores the destination path
      const destFolder = provider === 'google' 
        ? (destinationFolderId || 'root')
        : (destinationPath || '/');
      
      const operation = await storage.createCopyOperation({
        userId,
        sourceUrl,
        destinationFolderId: destFolder,
        status: 'pending',
        sourceProvider: shareRequest.provider as 'google' | 'dropbox',
        destProvider: provider,
        sourceFileId: shareRequest.fileId,
        sourceFilePath: shareRequest.filePath,
        fileName: shareRequest.fileName,
        itemType: shareRequest.fileType,
      });

      await storage.createShareEvent({
        shareRequestId: shareId,
        eventType: 'sent_to_' + provider,
        actorId: userId,
        details: `File sent to ${provider}`,
      });

      // Start copy process using the source provider's service
      // (same as destination provider since cross-provider is not supported)
      if (shareRequest.provider === 'google') {
        const driveService = new GoogleDriveService(userId);
        setImmediate(async () => {
          try {
            // For Google, copy the file to the destination folder
            const startTime = Date.now();
            await storage.updateCopyOperationStatus(operation.id, 'in_progress');
            
            const result = await driveService.copyFile(
              shareRequest.fileId, 
              undefined, 
              destinationFolderId || undefined
            );
            
            const duration = Math.round((Date.now() - startTime) / 1000);
            await storage.updateCopyOperation(operation.id, {
              status: 'completed',
              copiedFileId: result.id,
              copiedFileName: result.name,
              copiedFileUrl: result.webViewLink,
              totalFiles: 1,
              completedFiles: 1,
              duration
            });

            // Create version record
            await storage.createFileVersion({
              userId,
              fileName: result.name!,
              fileId: result.id!,
              provider: 'google',
              versionNumber: await getNextVersionNumber(userId, result.id!),
              size: result.size ? Number(result.size) : null,
              mimeType: result.mimeType,
              changeType: 'copied',
              changeDetails: 'Copiado desde compartir archivo',
              copyOperationId: operation.id,
            });

            // Save to cloud files
            await storage.createCloudFile({
              userId,
              provider: 'google',
              originalFileId: shareRequest.fileId,
              copiedFileId: result.id!,
              fileName: result.name!,
              mimeType: result.mimeType,
              fileSize: result.size ? Number(result.size) : null,
              sourceUrl
            });
          } catch (error) {
            console.error(`Copy to Google Drive failed:`, error);
            await storage.updateCopyOperationStatus(operation.id, 'failed', error instanceof Error ? error.message : 'Unknown error');
          }
        });
      } else if (shareRequest.provider === 'dropbox') {
        const dropboxService = new DropboxService(userId);
        setImmediate(async () => {
          try {
            const startTime = Date.now();
            await storage.updateCopyOperationStatus(operation.id, 'in_progress');
            
            // For Dropbox, copy from shared link with destination path
            const result = await dropboxService.copyFileFromSharedLink(
              sourceUrl,
              undefined,
              shareRequest.fileName,
              destinationPath || undefined
            );
            
            const duration = Math.round((Date.now() - startTime) / 1000);
            await storage.updateCopyOperation(operation.id, {
              status: 'completed',
              copiedFileId: result.id,
              copiedFileName: result.name,
              totalFiles: 1,
              completedFiles: 1,
              duration
            });

            // Create version record
            await storage.createFileVersion({
              userId,
              fileName: result.name,
              fileId: result.id,
              provider: 'dropbox',
              filePath: result.path_display,
              versionNumber: await getNextVersionNumber(userId, result.id),
              size: result.size || null,
              changeType: 'copied',
              changeDetails: 'Copiado desde compartir archivo',
              copyOperationId: operation.id,
            });

            // Save to cloud files
            await storage.createCloudFile({
              userId,
              provider: 'dropbox',
              originalFileId: shareRequest.fileId,
              copiedFileId: result.id!,
              fileName: result.name!,
              mimeType: result.mimeType,
              fileSize: result.size ? Number(result.size) : null,
              sourceUrl
            });
          } catch (error) {
            console.error(`Copy to Dropbox failed:`, error);
            await storage.updateCopyOperationStatus(operation.id, 'failed', error instanceof Error ? error.message : 'Unknown error');
          }
        });
      }

      res.json({ message: "Copy operation started", operationId: operation.id });
    } catch (error: any) {
      console.error("Error sending share to provider:", error);
      res.status(500).json({ message: "Failed to send file" });
    }
  });

  // Search users by email or name for sharing
  app.get('/api/users/search', isAuthenticated, async (req: any, res) => {
    try {
      const query = (req.query.q || req.query.email) as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }

      const currentUserId = req.user.claims.sub;
      const users = await storage.searchUsers(query, currentUserId);
      
      res.json(users.map(user => ({
        id: user.id,
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        avatar: user.profileImageUrl,
      })));
    } catch (error: any) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // ===============================
  // SCHEDULED TASKS ROUTES
  // ===============================

  // Get all scheduled tasks for the current user
  app.get('/api/scheduled-tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getUserScheduledTasks(userId);
      res.json(tasks);
    } catch (error: any) {
      console.error("Error fetching scheduled tasks:", error);
      res.status(500).json({ message: "Failed to fetch scheduled tasks" });
    }
  });

  // Get a specific scheduled task
  app.get('/api/scheduled-tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getScheduledTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      res.json(task);
    } catch (error: any) {
      console.error("Error fetching scheduled task:", error);
      res.status(500).json({ message: "Failed to fetch scheduled task" });
    }
  });

  // Create a new scheduled task
  app.post('/api/scheduled-tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { getSchedulerService } = await import('./services/schedulerService');
      const scheduler = getSchedulerService();
      
      const taskData = {
        ...req.body,
        userId,
        status: 'active',
      };

      // Calculate next run time
      const nextRunAt = scheduler.calculateNextRun({
        ...taskData,
        id: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastRunAt: null,
        lastRunStatus: null,
        lastRunError: null,
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
      });
      
      taskData.nextRunAt = nextRunAt;

      const task = await storage.createScheduledTask(taskData);
      res.status(201).json(task);
    } catch (error: any) {
      console.error("Error creating scheduled task:", error);
      res.status(500).json({ message: "Failed to create scheduled task" });
    }
  });

  // Update a scheduled task
  app.patch('/api/scheduled-tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getScheduledTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updates = { ...req.body };
      
      // Recalculate next run if schedule changed
      if (updates.frequency || updates.hour !== undefined || updates.minute !== undefined || 
          updates.dayOfWeek !== undefined || updates.dayOfMonth !== undefined) {
        const { getSchedulerService } = await import('./services/schedulerService');
        const scheduler = getSchedulerService();
        
        const updatedTask = { ...task, ...updates };
        updates.nextRunAt = scheduler.calculateNextRun(updatedTask);
      }

      const updatedTask = await storage.updateScheduledTask(req.params.id, updates);
      res.json(updatedTask);
    } catch (error: any) {
      console.error("Error updating scheduled task:", error);
      res.status(500).json({ message: "Failed to update scheduled task" });
    }
  });

  // Delete a scheduled task
  app.delete('/api/scheduled-tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getScheduledTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteScheduledTask(req.params.id);
      res.json({ message: "Task deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting scheduled task:", error);
      res.status(500).json({ message: "Failed to delete scheduled task" });
    }
  });

  // Pause a scheduled task
  app.post('/api/scheduled-tasks/:id/pause', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getScheduledTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const pausedTask = await storage.pauseScheduledTask(req.params.id);
      res.json(pausedTask);
    } catch (error: any) {
      console.error("Error pausing scheduled task:", error);
      res.status(500).json({ message: "Failed to pause scheduled task" });
    }
  });

  // Resume a scheduled task
  app.post('/api/scheduled-tasks/:id/resume', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getScheduledTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Recalculate next run time when resuming
      const { getSchedulerService } = await import('./services/schedulerService');
      const scheduler = getSchedulerService();
      const nextRunAt = scheduler.calculateNextRun(task);
      
      await storage.updateScheduledTask(req.params.id, { nextRunAt });
      const resumedTask = await storage.resumeScheduledTask(req.params.id);
      res.json(resumedTask);
    } catch (error: any) {
      console.error("Error resuming scheduled task:", error);
      res.status(500).json({ message: "Failed to resume scheduled task" });
    }
  });

  // Run a scheduled task immediately
  app.post('/api/scheduled-tasks/:id/run-now', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getScheduledTask(req.params.id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (task.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const limitError = await enforceOperationLimits(userId);
      if (limitError) return res.status(limitError.status).json({ message: limitError.message });

      // Check if task is already running to prevent duplicates
      if (task.lastRunStatus === 'running') {
        return res.status(409).json({ message: "Task is already running" });
      }

      const startTime = new Date();

      // Create a copy operation for immediate execution
      const operation = await storage.createCopyOperation({
        userId: task.userId,
        sourceUrl: task.sourceUrl,
        sourceProvider: task.sourceProvider,
        destinationFolderId: task.destinationFolderId,
        destProvider: task.destProvider,
        status: 'pending',
        fileName: task.sourceName || 'Manual: Scheduled Copy',
      });

      // Create a task run record
      const taskRun = await storage.createScheduledTaskRun({
        scheduledTaskId: task.id,
        copyOperationId: operation.id,
        status: 'running',
        startedAt: startTime,
        filesProcessed: 0,
        filesFailed: 0,
        bytesTransferred: 0,
      });

      await storage.updateScheduledTask(task.id, {
        lastRunAt: startTime,
        lastRunStatus: 'running',
        totalRuns: (task.totalRuns || 0) + 1,
      });

      res.json({ message: "Task execution started", operationId: operation.id, taskRunId: taskRun.id });
    } catch (error: any) {
      console.error("Error running scheduled task:", error);
      res.status(500).json({ message: "Failed to run scheduled task" });
    }
  });

  // Execute cumulative sync for a scheduled task
  app.post('/api/scheduled-tasks/:id/cumulative-sync', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getScheduledTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      if (task.syncMode !== 'cumulative_sync') {
        return res.status(400).json({ message: "This task is not configured for cumulative sync" });
      }

      // Check if task is already running
      if (task.lastRunStatus === 'running') {
        return res.status(409).json({ message: "Task is already running" });
      }

      const syncService = new SyncService(userId);
      const startTime = Date.now();

      // Execute cumulative sync in background
      const result = await syncService.executeCumulativeSync(task);

      // Update task with results
      await storage.updateScheduledTask(task.id, {
        lastRunAt: new Date(),
        lastRunStatus: result.success ? 'success' : 'failed',
        lastRunError: result.errors.length > 0 ? result.errors[0] : undefined,
        totalRuns: (task.totalRuns || 0) + 1,
        successfulRuns: result.success ? (task.successfulRuns || 0) + 1 : task.successfulRuns,
        failedRuns: !result.success ? (task.failedRuns || 0) + 1 : task.failedRuns,
      });

      // Create task run record
      const taskRun = await storage.createScheduledTaskRun({
        scheduledTaskId: task.id,
        status: result.success ? 'completed' : 'failed',
        startedAt: new Date(startTime),
        completedAt: new Date(),
        duration: result.duration,
        filesProcessed: result.filesNew + result.filesModified,
        filesFailed: result.filesFailed,
        bytesTransferred: 0,
        errorMessage: result.errors.length > 0 ? result.errors.join('; ') : undefined,
      });

      res.json({
        success: result.success,
        filesNew: result.filesNew,
        filesModified: result.filesModified,
        filesCopied: result.filesCopied,
        filesSkipped: result.filesSkipped,
        filesFailed: result.filesFailed,
        duration: result.duration,
        errors: result.errors,
        taskRunId: taskRun.id
      });
    } catch (error: any) {
      console.error("Error executing cumulative sync:", error);
      res.status(500).json({ message: "Failed to execute cumulative sync" });
    }
  });

  // Get cumulative sync statistics
  app.get('/api/scheduled-tasks/:id/cumulative-sync/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getScheduledTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Get sync file registry for this task
      const syncFiles = await storage.getSyncFilesByTask(task.id);
      
      // Calculate statistics
      const stats = {
        taskId: task.id,
        taskName: task.name,
        syncMode: task.syncMode,
        totalFilesTracked: syncFiles.length,
        lastSyncedAt: task.lastRunAt,
        lastSyncStatus: task.lastRunStatus,
        totalRuns: task.totalRuns || 0,
        successfulRuns: task.successfulRuns || 0,
        failedRuns: task.failedRuns || 0,
        successRate: task.totalRuns ? ((task.successfulRuns || 0) / task.totalRuns * 100).toFixed(1) + '%' : 'N/A',
        filesByStatus: {
          synced: syncFiles.filter(f => f.syncStatus === 'synced').length,
          pending: syncFiles.filter(f => f.syncStatus === 'pending').length,
          failed: syncFiles.filter(f => f.syncStatus === 'failed').length,
        },
        recentFiles: syncFiles.slice(0, 10).map(f => ({
          fileName: f.fileName,
          lastSyncedAt: f.lastSyncedAt,
          status: f.syncStatus,
          size: f.fileSize,
          provider: f.sourceProvider,
        }))
      };

      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching cumulative sync stats:", error);
      res.status(500).json({ message: "Failed to fetch sync statistics" });
    }
  });

  // Get task execution history
  app.get('/api/scheduled-tasks/:id/runs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getScheduledTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const runs = await storage.getTaskRuns(req.params.id, limit);
      res.json(runs);
    } catch (error: any) {
      console.error("Error fetching task runs:", error);
      res.status(500).json({ message: "Failed to fetch task runs" });
    }
  });

  // Execute mirror sync for a scheduled task (bidirectional)
  app.post('/api/scheduled-tasks/:id/mirror-sync', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getScheduledTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Check if task is already running
      if (task.lastRunStatus === 'running') {
        return res.status(409).json({ message: "Task is already running" });
      }

      const syncService = new SyncService(userId);
      const startTime = Date.now();

      // Execute mirror sync in background
      const result = await syncService.executeMirrorSync(task);

      // Update task with results
      await storage.updateScheduledTask(task.id, {
        lastRunAt: new Date(),
        lastRunStatus: result.success ? 'success' : 'failed',
        lastRunError: result.errors.length > 0 ? result.errors[0] : undefined,
        totalRuns: (task.totalRuns || 0) + 1,
        successfulRuns: result.success ? (task.successfulRuns || 0) + 1 : task.successfulRuns,
        failedRuns: !result.success ? (task.failedRuns || 0) + 1 : task.failedRuns,
      });

      // Create task run record
      const taskRun = await storage.createScheduledTaskRun({
        scheduledTaskId: task.id,
        status: result.success ? 'completed' : 'failed',
        startedAt: new Date(startTime),
        completedAt: new Date(),
        duration: result.duration,
        filesProcessed: result.filesNew + result.filesModified,
        filesFailed: result.filesFailed,
        bytesTransferred: 0,
        errorMessage: result.errors.length > 0 ? result.errors.join('; ') : undefined,
      });

      res.json({
        success: result.success,
        filesNew: result.filesNew,
        filesModified: result.filesModified,
        filesCopied: result.filesCopied,
        filesSkipped: result.filesSkipped,
        filesFailed: result.filesFailed,
        duration: result.duration,
        errors: result.errors,
        taskRunId: taskRun.id,
        message: 'Mirror sync completed - files synchronized in both directions'
      });
    } catch (error: any) {
      console.error("Error executing mirror sync:", error);
      res.status(500).json({ message: "Failed to execute mirror sync" });
    }
  });

  // Get file conflicts from last mirror sync
  app.get('/api/scheduled-tasks/:id/conflicts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getScheduledTask(req.params.id);
      
      if (!task) return res.status(404).json({ message: "Task not found" });
      if (task.userId !== userId) return res.status(403).json({ message: "Not authorized" });

      const conflicts = await storage.getFileConflicts(task.id);
      res.json({ conflicts, count: conflicts.length });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch conflicts" });
    }
  });

  // Resolve file conflict
  app.post('/api/scheduled-tasks/:id/conflicts/:conflictId/resolve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getScheduledTask(req.params.id);
      
      if (!task) return res.status(404).json({ message: "Task not found" });
      if (task.userId !== userId) return res.status(403).json({ message: "Not authorized" });

      const { resolution, details } = req.body; // 'keep_newer' | 'keep_source' | 'keep_target'
      const resolved = await storage.resolveFileConflict(req.params.conflictId, resolution, details);
      
      res.json({ success: true, conflict: resolved, message: `Conflict resolved: ${resolution}` });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to resolve conflict" });
    }
  });

  // Get mirror sync status and file comparison
  app.get('/api/scheduled-tasks/:id/mirror-sync/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getScheduledTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Get recent task runs
      const runs = await storage.getTaskRuns(task.id, 5);
      
      const status = {
        taskId: task.id,
        taskName: task.name,
        syncMode: task.syncMode,
        isMirrorSync: task.operationType === 'transfer',
        sourceProvider: task.sourceProvider,
        destProvider: task.destProvider,
        lastRunAt: task.lastRunAt,
        lastRunStatus: task.lastRunStatus,
        lastRunError: task.lastRunError,
        totalRuns: task.totalRuns || 0,
        successfulRuns: task.successfulRuns || 0,
        failedRuns: task.failedRuns || 0,
        successRate: task.totalRuns ? ((task.successfulRuns || 0) / task.totalRuns * 100).toFixed(1) + '%' : 'N/A',
        recentRuns: runs.map(r => ({
          id: r.id,
          status: r.status,
          filesProcessed: r.filesProcessed,
          filesFailed: r.filesFailed,
          duration: r.duration,
          startedAt: r.startedAt,
          completedAt: r.completedAt,
        }))
      };

      res.json(status);
    } catch (error: any) {
      console.error("Error fetching mirror sync status:", error);
      res.status(500).json({ message: "Failed to fetch mirror sync status" });
    }
  });

  // List available folders for selective sync
  app.get('/api/scheduled-tasks/:id/folders/list', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getScheduledTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const provider = req.query.provider as string; // 'source' | 'destination'
      
      if (!provider || !['source', 'destination'].includes(provider)) {
        return res.status(400).json({ message: "Invalid provider - must be 'source' or 'destination'" });
      }

      let folders: any[] = [];
      
      if (provider === 'source') {
        const sourceProvider = task.sourceProvider as string;
        const folderId = task.sourceFolderId || (task.sourceUrl as any);
        
        if (sourceProvider === 'google') {
          const googleService = new (require('../services/googleDriveService').GoogleDriveService)(userId);
          const result = await googleService.listFolderContentsRecursive(folderId);
          folders = result.filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder').map((f: any) => ({
            id: f.id,
            name: f.name,
            type: 'folder',
            size: f.size || 0,
            selected: task.selectedFolderIds?.includes(f.id) || false,
            excluded: task.excludedFolderIds?.includes(f.id) || false,
          }));
        } else if (sourceProvider === 'dropbox') {
          const dropboxService = new (require('../services/dropboxService').DropboxService)(userId);
          const path = task.sourceFolderId || '';
          const result = await dropboxService.listFolderContentsRecursive(path);
          folders = result.filter((f: any) => f['.tag'] === 'folder').map((f: any) => ({
            id: f.id,
            name: f.name,
            path: f.path_display,
            type: 'folder',
            size: f.size || 0,
            selected: task.selectedFolderIds?.includes(f.id) || false,
            excluded: task.excludedFolderIds?.includes(f.id) || false,
          }));
        }
      } else {
        // Destination folders
        const destProvider = task.destProvider as string;
        const folderId = task.destinationFolderId || 'root';
        
        if (destProvider === 'google') {
          const googleService = new (require('../services/googleDriveService').GoogleDriveService)(userId);
          const result = await googleService.listFolderContentsRecursive(folderId);
          folders = result.filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder').map((f: any) => ({
            id: f.id,
            name: f.name,
            type: 'folder',
            size: f.size || 0,
            selected: task.selectedFolderIds?.includes(f.id) || false,
            excluded: task.excludedFolderIds?.includes(f.id) || false,
          }));
        } else if (destProvider === 'dropbox') {
          const dropboxService = new (require('../services/dropboxService').DropboxService)(userId);
          const path = task.destinationFolderId === 'root' ? '' : task.destinationFolderId;
          const result = await dropboxService.listFolderContentsRecursive(path);
          folders = result.filter((f: any) => f['.tag'] === 'folder').map((f: any) => ({
            id: f.id,
            name: f.name,
            path: f.path_display,
            type: 'folder',
            size: f.size || 0,
            selected: task.selectedFolderIds?.includes(f.id) || false,
            excluded: task.excludedFolderIds?.includes(f.id) || false,
          }));
        }
      }

      res.json({
        provider,
        folders,
        totalFolders: folders.length,
      });
    } catch (error: any) {
      console.error("Error listing folders:", error);
      res.status(500).json({ message: "Failed to list folders" });
    }
  });

  // Save selective sync folder selection
  app.post('/api/scheduled-tasks/:id/folders/select', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getScheduledTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const { selectedFolderIds, excludedFolderIds } = req.body;
      
      if (!Array.isArray(selectedFolderIds) && !Array.isArray(excludedFolderIds)) {
        return res.status(400).json({ message: "Invalid request - provide selectedFolderIds or excludedFolderIds arrays" });
      }

      // Update task with folder selections
      await storage.updateScheduledTask(task.id, {
        selectedFolderIds: selectedFolderIds || undefined,
        excludedFolderIds: excludedFolderIds || undefined,
      });

      res.json({
        success: true,
        message: 'Folder selection updated',
        selectedFolders: selectedFolderIds?.length || 0,
        excludedFolders: excludedFolderIds?.length || 0,
      });
    } catch (error: any) {
      console.error("Error saving folder selection:", error);
      res.status(500).json({ message: "Failed to save folder selection" });
    }
  });

  // File versioning endpoint - get all versions
  app.get('/api/files/:fileId/versions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const versions = await storage.getFileVersions(userId, req.params.fileId);
      res.json(versions);
    } catch (error: any) {
      console.error("Error fetching file versions:", error);
      res.status(500).json({ message: "Failed to fetch versions" });
    }
  });

  // File versioning endpoint - restore to previous version
  app.post('/api/files/:fileId/restore/:versionId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { fileId, versionId } = req.params;
      
      // Get the version to restore
      const versions = await storage.getFileVersions(userId, fileId);
      const versionToRestore = versions.find(v => v.id === versionId);
      
      if (!versionToRestore) {
        return res.status(404).json({ message: "Version not found" });
      }

      // Create a new version entry recording this restore action
      const newVersion = await storage.createFileVersion({
        userId,
        fileName: versionToRestore.fileName,
        fileId,
        provider: versionToRestore.provider,
        filePath: versionToRestore.filePath,
        versionNumber: Math.max(...versions.map(v => v.versionNumber)) + 1,
        size: versionToRestore.size,
        mimeType: versionToRestore.mimeType,
        changeType: 'modified',
        changedBy: userId,
        changeDetails: `Restored to version ${versionToRestore.versionNumber}`,
      });

      res.json(newVersion);
    } catch (error: any) {
      console.error("Error restoring file version:", error);
      res.status(500).json({ message: "Failed to restore version" });
    }
  });

  // Development endpoint to seed test data
  if (process.env.NODE_ENV === "development") {
    app.post('/api/dev/seed-test-conflicts', async (req: any, res) => {
      try {
        const userId = "dev-user-123";
        
        // Create a test task with Mirror Sync
        const task = await storage.createScheduledTask({
          userId,
          name: "Demo: Mirror Sync con Conflictos",
          description: "Tarea de prueba para ver el modal de resolución de conflictos",
          sourceUrl: "https://drive.google.com/drive/folders/root",
          sourceProvider: "google",
          sourceName: "Mi unidad",
          sourceFolderId: "root",
          destProvider: "dropbox",
          destinationFolderId: "/",
          destinationFolderName: "Root",
          operationType: "transfer",
          syncMode: "mirror_sync",
          frequency: "daily",
          hour: 8,
          minute: 0,
          dayOfWeek: 1,
          dayOfMonth: 1,
          status: "active",
          skipDuplicates: false,
          notifyOnComplete: true,
          notifyOnFailure: true,
        });

        // Create test conflicts
        const conflict1 = await storage.createFileConflict({
          scheduledTaskId: task.id,
          fileName: "presupuesto_2025.xlsx",
          fileId: "file-123-456",
          sourceVersion: {
            fileId: "gdrive-123",
            modifiedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
            size: 2048000,
          },
          destVersion: {
            fileId: "dropbox-123",
            modifiedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
            size: 2150000,
          },
          sourceProvider: "google",
          destProvider: "dropbox",
        });

        const conflict2 = await storage.createFileConflict({
          scheduledTaskId: task.id,
          fileName: "informe_trimestral.pdf",
          fileId: "file-789-101",
          sourceVersion: {
            fileId: "gdrive-789",
            modifiedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
            size: 5242880,
          },
          destVersion: {
            fileId: "dropbox-789",
            modifiedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
            size: 5242880,
          },
          sourceProvider: "google",
          destProvider: "dropbox",
        });

        res.json({
          success: true,
          message: "Test data created successfully",
          task: {
            id: task.id,
            name: task.name,
          },
          conflicts: [conflict1, conflict2],
        });
      } catch (error: any) {
        console.error("Error seeding test data:", error);
        res.status(500).json({ message: "Failed to seed test data" });
      }
    });
  }

  // ── OneDrive OAuth routes ─────────────────────────────────────────────────

  app.get('/api/auth/onedrive', async (req: any, res) => {
    try {
      let userId: string | null = null;

      const token = req.query.token as string;
      if (token) {
        const user = await validateSupabaseToken(token);
        if (user) { userId = user.id; req.session.supabaseUserId = user.id; }
      }
      if (!userId && req.user?.claims?.sub) userId = req.user.claims.sub;
      if (!userId && req.session?.supabaseUserId) userId = req.session.supabaseUserId;

      if (!userId) return res.redirect('/login?redirect=/integrations&error=auth_required');

      if (!process.env.ONEDRIVE_CLIENT_ID || !process.env.ONEDRIVE_CLIENT_SECRET) {
        console.error('OneDrive OAuth not configured');
        return res.redirect('/integrations?onedrive_auth=error&reason=not_configured');
      }

      const redirectUri = getOAuthRedirectUri(req, '/api/auth/onedrive/callback');
      const state = crypto.randomBytes(16).toString('hex');
      req.session.onedriveOAuthState = state;
      req.session.onedriveUserId = userId;

      await new Promise<void>((resolve) => req.session.save((err: any) => resolve()));

      const authUrl = OneDriveService.getAuthUrl(redirectUri, state);
      res.redirect(authUrl);
    } catch (error) {
      console.error('Error starting OneDrive OAuth:', error);
      res.redirect('/integrations?onedrive_auth=error&reason=server_error');
    }
  });

  app.get('/api/auth/onedrive/callback', async (req: any, res) => {
    try {
      const { code, state, error: oauthError } = req.query;

      if (oauthError) {
        delete req.session.onedriveOAuthState;
        delete req.session.onedriveUserId;
        return res.redirect(`/integrations?onedrive_auth=error&reason=${oauthError === 'access_denied' ? 'denied' : 'error'}`);
      }

      if (!code) {
        delete req.session.onedriveOAuthState;
        delete req.session.onedriveUserId;
        return res.redirect('/integrations?onedrive_auth=error&reason=no_code');
      }

      const expectedState = req.session.onedriveOAuthState;
      const sessionUserId = req.session.onedriveUserId;

      if (state !== expectedState) {
        delete req.session.onedriveOAuthState;
        delete req.session.onedriveUserId;
        return res.redirect('/integrations?onedrive_auth=error&reason=invalid_state');
      }

      if (!sessionUserId) return res.redirect('/integrations?onedrive_auth=error&reason=no_session');

      delete req.session.onedriveOAuthState;
      delete req.session.onedriveUserId;

      const redirectUri = getOAuthRedirectUri(req, '/api/auth/onedrive/callback');
      const { accessToken, refreshToken, expiresIn } = await OneDriveService.exchangeCode(code as string, redirectUri);
      const expiry = new Date(Date.now() + expiresIn * 1000);

      await storage.updateUserOnedriveTokens(sessionUserId, { accessToken, refreshToken, expiry });

      console.log('OneDrive OAuth completed for user:', sessionUserId);
      res.redirect('/integrations?onedrive_auth=success');
    } catch (error) {
      console.error('Error in OneDrive OAuth callback:', error);
      delete req.session.onedriveOAuthState;
      delete req.session.onedriveUserId;
      res.redirect('/integrations?onedrive_auth=error&reason=unknown');
    }
  });

  app.get('/api/auth/onedrive/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ connected: false, hasValidToken: false });

      const hasAccessToken = !!user.onedriveAccessToken;
      const hasRefreshToken = !!user.onedriveRefreshToken;
      const isExpired = user.onedriveTokenExpiry && new Date(user.onedriveTokenExpiry) <= new Date();
      res.json({
        connected: hasAccessToken || hasRefreshToken,
        hasValidToken: (hasAccessToken && !isExpired) || !!hasRefreshToken,
      });
    } catch (error) {
      console.error('Error checking OneDrive status:', error);
      res.status(500).json({ connected: false, hasValidToken: false });
    }
  });

  app.delete('/api/auth/onedrive', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.updateUserOnedriveTokens(userId, { accessToken: null, refreshToken: null, expiry: null });
      res.json({ message: 'OneDrive disconnected successfully' });
    } catch (error) {
      console.error('Error disconnecting OneDrive:', error);
      res.status(500).json({ message: 'Failed to disconnect OneDrive' });
    }
  });

  // ── OneDrive API routes ───────────────────────────────────────────────────

  app.get('/api/onedrive/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const folderId = req.query.folderId as string | undefined;
      const service = new OneDriveService(userId);
      const files = await service.listFolder(folderId);
      res.json(files);
    } catch (error: any) {
      console.error('Error listing OneDrive files:', error);
      if (error.message?.includes('not connected')) return res.status(401).json({ message: error.message });
      res.status(500).json({ message: 'Failed to list OneDrive files' });
    }
  });

  // ── Box OAuth routes ──────────────────────────────────────────────────────

  app.get('/api/auth/box', async (req: any, res) => {
    try {
      let userId: string | null = null;

      const token = req.query.token as string;
      if (token) {
        const user = await validateSupabaseToken(token);
        if (user) { userId = user.id; req.session.supabaseUserId = user.id; }
      }
      if (!userId && req.user?.claims?.sub) userId = req.user.claims.sub;
      if (!userId && req.session?.supabaseUserId) userId = req.session.supabaseUserId;

      if (!userId) return res.redirect('/login?redirect=/integrations&error=auth_required');

      if (!process.env.BOX_CLIENT_ID || !process.env.BOX_CLIENT_SECRET) {
        console.error('Box OAuth not configured');
        return res.redirect('/integrations?box_auth=error&reason=not_configured');
      }

      const redirectUri = getOAuthRedirectUri(req, '/api/auth/box/callback');
      const state = crypto.randomBytes(16).toString('hex');
      req.session.boxOAuthState = state;
      req.session.boxUserId = userId;

      await new Promise<void>((resolve) => req.session.save((err: any) => resolve()));

      const authUrl = BoxService.getAuthUrl(redirectUri, state);
      res.redirect(authUrl);
    } catch (error) {
      console.error('Error starting Box OAuth:', error);
      res.redirect('/integrations?box_auth=error&reason=server_error');
    }
  });

  app.get('/api/auth/box/callback', async (req: any, res) => {
    try {
      const { code, state, error: oauthError } = req.query;

      if (oauthError) {
        delete req.session.boxOAuthState;
        delete req.session.boxUserId;
        return res.redirect(`/integrations?box_auth=error&reason=${oauthError === 'access_denied' ? 'denied' : 'error'}`);
      }

      if (!code) {
        delete req.session.boxOAuthState;
        delete req.session.boxUserId;
        return res.redirect('/integrations?box_auth=error&reason=no_code');
      }

      const expectedState = req.session.boxOAuthState;
      const sessionUserId = req.session.boxUserId;

      if (state !== expectedState) {
        delete req.session.boxOAuthState;
        delete req.session.boxUserId;
        return res.redirect('/integrations?box_auth=error&reason=invalid_state');
      }

      if (!sessionUserId) return res.redirect('/integrations?box_auth=error&reason=no_session');

      delete req.session.boxOAuthState;
      delete req.session.boxUserId;

      const redirectUri = getOAuthRedirectUri(req, '/api/auth/box/callback');
      const { accessToken, refreshToken, expiresIn } = await BoxService.exchangeCode(code as string, redirectUri);
      const expiry = new Date(Date.now() + expiresIn * 1000);

      await storage.updateUserBoxTokens(sessionUserId, { accessToken, refreshToken, expiry });

      console.log('Box OAuth completed for user:', sessionUserId);
      res.redirect('/integrations?box_auth=success');
    } catch (error) {
      console.error('Error in Box OAuth callback:', error);
      delete req.session.boxOAuthState;
      delete req.session.boxUserId;
      res.redirect('/integrations?box_auth=error&reason=unknown');
    }
  });

  app.get('/api/auth/box/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ connected: false, hasValidToken: false });

      const hasAccessToken = !!user.boxAccessToken;
      const hasRefreshToken = !!user.boxRefreshToken;
      const isExpired = user.boxTokenExpiry && new Date(user.boxTokenExpiry) <= new Date();
      res.json({
        connected: hasAccessToken || hasRefreshToken,
        hasValidToken: (hasAccessToken && !isExpired) || !!hasRefreshToken,
      });
    } catch (error) {
      console.error('Error checking Box status:', error);
      res.status(500).json({ connected: false, hasValidToken: false });
    }
  });

  app.delete('/api/auth/box', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.updateUserBoxTokens(userId, { accessToken: null, refreshToken: null, expiry: null });
      res.json({ message: 'Box disconnected successfully' });
    } catch (error) {
      console.error('Error disconnecting Box:', error);
      res.status(500).json({ message: 'Failed to disconnect Box' });
    }
  });

  // ── Box API routes ────────────────────────────────────────────────────────

  app.get('/api/box/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const folderId = req.query.folderId as string | undefined;
      const service = new BoxService(userId);
      const files = await service.listFolder(folderId);
      res.json(files);
    } catch (error: any) {
      console.error('Error listing Box files:', error);
      if (error.message?.includes('not connected')) return res.status(401).json({ message: error.message });
      res.status(500).json({ message: 'Failed to list Box files' });
    }
  });

  // ── Amazon S3 routes ──────────────────────────────────────────────────────

  app.post('/api/auth/s3', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accessKeyId, secretAccessKey, region } = req.body;

      if (!accessKeyId || !secretAccessKey) {
        return res.status(400).json({ message: 'Access Key ID and Secret Access Key are required' });
      }

      const valid = await S3Service.validateCredentials(accessKeyId, secretAccessKey, region || 'us-east-1');
      if (!valid) {
        return res.status(401).json({ message: 'Invalid AWS credentials. Please check your Access Key ID and Secret Access Key.' });
      }

      await storage.updateUserS3Credentials(userId, { accessKeyId, secretAccessKey, region: region || 'us-east-1' });
      res.json({ message: 'S3 connected successfully' });
    } catch (error) {
      console.error('Error connecting S3:', error);
      res.status(500).json({ message: 'Failed to connect S3' });
    }
  });

  app.get('/api/auth/s3/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ connected: false });
      res.json({ connected: !!user.s3Connected, region: user.s3Region });
    } catch (error) {
      console.error('Error checking S3 status:', error);
      res.status(500).json({ connected: false });
    }
  });

  app.delete('/api/auth/s3', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.updateUserS3Credentials(userId, { accessKeyId: null, secretAccessKey: null });
      res.json({ message: 'S3 disconnected successfully' });
    } catch (error) {
      console.error('Error disconnecting S3:', error);
      res.status(500).json({ message: 'Failed to disconnect S3' });
    }
  });

  app.get('/api/s3/buckets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const service = new S3Service(userId);
      const buckets = await service.listBuckets();
      res.json(buckets);
    } catch (error: any) {
      console.error('Error listing S3 buckets:', error);
      if (error.message?.includes('not connected')) return res.status(401).json({ message: error.message });
      res.status(500).json({ message: 'Failed to list S3 buckets' });
    }
  });

  app.get('/api/s3/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bucket, prefix } = req.query;
      if (!bucket) return res.status(400).json({ message: 'Bucket name is required' });
      const service = new S3Service(userId);
      const files = await service.listFolder(bucket as string, prefix as string);
      res.json(files);
    } catch (error: any) {
      console.error('Error listing S3 files:', error);
      if (error.message?.includes('not connected')) return res.status(401).json({ message: error.message });
      res.status(500).json({ message: 'Failed to list S3 files' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
