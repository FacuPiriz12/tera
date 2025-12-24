import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import { startQueueWorker } from "./queueWorker";
import { startSchedulerService } from "./services/schedulerService";
import { ensureTablesExist } from "./db";
import { storage } from "./storage";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize database tables on startup
  try {
    await ensureTablesExist();
  } catch (error) {
    console.error('Warning: Could not initialize database tables:', error);
  }
  
  // Seed development data
  if (process.env.NODE_ENV === 'development') {
    try {
      const testUserId = 'dev-user-001';
      const existingTasks = await storage.getUserScheduledTasks(testUserId);
      if (existingTasks.length === 0) {
        const task = await storage.createScheduledTask({
          userId: testUserId,
          name: 'Google Drive → Dropbox (Cumulative Sync)',
          description: 'Sincronización acumulativa de documentos importantes',
          sourceProvider: 'google',
          destProvider: 'dropbox',
          sourceFolderId: 'folder_google_123',
          sourceName: 'My Documents',
          destinationFolderId: 'folder_dropbox_456',
          destinationFolderName: 'Backup Dropbox',
          operationType: 'transfer',
          syncMode: 'cumulative_sync',
          frequency: 'daily',
          hour: 14,
          minute: 30,
          skipDuplicates: true,
          notifyOnComplete: true,
          notifyOnFailure: true,
          status: 'active',
          successfulRuns: 3,
          failedRuns: 0,
        });
        
        // Create a sample run to show stats
        await storage.createScheduledTaskRun({
          scheduledTaskId: task.id,
          status: 'completed',
          startedAt: new Date(Date.now() - 3600000),
          completedAt: new Date(),
          filesProcessed: 42,
          filesFailed: 0,
          bytesTransferred: 1073741824,
          duration: 1250,
        });
        
        console.log('✅ Development data seeded: Test task created');
        
        // Create sample file versions
        const fileId = 'file_test_001';
        const existingVersions = await storage.getFileVersions(testUserId, fileId);
        if (existingVersions.length === 0) {
          // V1 - Created
          await storage.createFileVersion({
            userId: testUserId,
            fileName: 'Documento importante.pdf',
            fileId,
            provider: 'google',
            filePath: '/docs/Documento importante.pdf',
            versionNumber: 1,
            size: 524288,
            mimeType: 'application/pdf',
            changeType: 'created',
            changedBy: testUserId,
            changeDetails: 'Documento original creado',
          });
          
          // V2 - Modified
          await storage.createFileVersion({
            userId: testUserId,
            fileName: 'Documento importante.pdf',
            fileId,
            provider: 'google',
            filePath: '/docs/Documento importante.pdf',
            versionNumber: 2,
            size: 645120,
            mimeType: 'application/pdf',
            changeType: 'modified',
            changedBy: testUserId,
            changeDetails: 'Agregados 3 párrafos al capítulo 2',
          });
          
          // V3 - Synced
          await storage.createFileVersion({
            userId: testUserId,
            fileName: 'Documento importante.pdf',
            fileId,
            provider: 'google',
            filePath: '/docs/Documento importante.pdf',
            versionNumber: 3,
            size: 645120,
            mimeType: 'application/pdf',
            changeType: 'synced',
            changedBy: 'system',
            changeDetails: 'Sincronizado automáticamente',
          });
          
          console.log('✅ File versions seeded: 3 versions created');
        }
      }
    } catch (error) {
      console.error('Dev seed error (non-critical):', error);
    }
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    // Handle session-related errors gracefully
    if (err.message && (
      err.message.includes('session') || 
      err.message.includes('Session') ||
      err.message.includes('cookie') ||
      err.code === 'EBADCSRFTOKEN'
    )) {
      console.log('🔄 Session error detected, clearing cookie and redirecting...');
      res.clearCookie('connect.sid', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // For API requests, return JSON error
      if (req.path.startsWith('/api')) {
        return res.status(401).json({ 
          message: "Session expired. Please refresh the page.",
          action: "refresh_required"
        });
      }
      
      // For page requests, redirect to home
      return res.redirect('/');
    }
    
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Don't expose internal error details in production
    const safeMessage = process.env.NODE_ENV === 'production' && status === 500
      ? "Something went wrong. Please try again."
      : message;

    res.status(status).json({ message: safeMessage });
    
    // Log error but don't throw (prevents server crash)
    console.error('Error:', err);
  });

  // Setup Vite for React development or serve static files in production
  const httpServer = createServer(app);
  
  if (process.env.NODE_ENV === 'production') {
    serveStatic(app);
  } else {
    await setupVite(app, httpServer);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    
    
    // Display OAuth redirect URIs for easy configuration
    const domain = process.env.REPLIT_DEV_DOMAIN || process.env.RENDER_EXTERNAL_HOSTNAME || `localhost:${port}`;
    const protocol = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEV_DOMAIN ? 'https' : 'http';
    
    console.log('🔗 OAUTH REDIRECT URIs - Add these to your OAuth applications:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Google Cloud Console:`);
    console.log(`   ${protocol}://${domain}/api/auth/google/callback`);
    console.log(`📍 Dropbox App Console:`);
    console.log(`   ${protocol}://${domain}/api/auth/dropbox/callback`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
  
  // Start queue worker for background job processing (once after server setup)
  try {
    startQueueWorker({
      globalConcurrency: 5,
      pollInterval: 2000
    });
    console.log('🚀 Queue worker started successfully');
  } catch (error) {
    console.error('❌ Failed to start queue worker:', error);
  }
  
  // Start scheduler service for automated task execution
  try {
    await startSchedulerService();
    console.log('📅 Scheduler service started successfully');
  } catch (error) {
    console.error('❌ Failed to start scheduler service:', error);
  }
})();
