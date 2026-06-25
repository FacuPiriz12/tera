import { EventEmitter } from 'events';
import { storage } from './storage';
import { GoogleDriveService } from './services/googleDriveService';
import { DropboxService } from './services/dropboxService';
import { OneDriveService } from './services/oneDriveService';
import { BoxService } from './services/boxService';
import { S3Service } from './services/s3Service';
import type { CopyOperation } from '@shared/schema';

interface WorkerConfig {
  globalConcurrency: number;
  pollInterval: number;
  workerId: string;
  maxPollInterval: number;
  backoffMultiplier: number;
  connectionTimeout: number;
  heartbeatInterval: number;
}

interface UserConcurrencyLimits {
  free: number;
  pro: number;
}

export class QueueWorker extends EventEmitter {
  private config: WorkerConfig;
  private isRunning = false;
  private processingJobs = new Set<string>();
  private userLimits: UserConcurrencyLimits = {
    free: 1,
    pro: 3
  };
  private currentPollInterval: number;
  private consecutiveEmptyPolls = 0;
  private lastHeartbeat = Date.now();
  private servicePool = new Map<string, GoogleDriveService | DropboxService | OneDriveService | BoxService | S3Service>();
  private wakeUpSignal: (() => void) | null = null;

  constructor(config: Partial<WorkerConfig> = {}) {
    super();
    this.config = {
      globalConcurrency: config.globalConcurrency || 5,
      pollInterval: config.pollInterval || 2000, // 2 seconds
      workerId: config.workerId || `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      maxPollInterval: config.maxPollInterval || 30000, // 30 seconds max
      backoffMultiplier: config.backoffMultiplier || 1.5,
      connectionTimeout: config.connectionTimeout || 60000, // 60 seconds
      heartbeatInterval: config.heartbeatInterval || 30000 // 30 seconds
    };
    this.currentPollInterval = this.config.pollInterval;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Queue worker is already running');
      return;
    }

    this.isRunning = true;
    console.log(`🚀 Queue worker started with ID: ${this.config.workerId}`);
    console.log(`📊 Config: Global concurrency: ${this.config.globalConcurrency}, Poll interval: ${this.config.pollInterval}ms`);

    // Aggressively reclaim any stale jobs from previous worker instances (2 minutes threshold)
    try {
      const reclaimedCount = await storage.reclaimStaleJobs(600000); // 10 minutes — allow large file transfers to complete
      if (reclaimedCount > 0) {
        console.log(`🔄 Reclaimed ${reclaimedCount} stale jobs from previous worker instances`);
      }
    } catch (error) {
      console.error('❌ Failed to reclaim stale jobs:', error);
    }

    this.processLoop();
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping queue worker...');
    this.isRunning = false;
    
    // Wait for current jobs to finish
    while (this.processingJobs.size > 0) {
      console.log(`⏳ Waiting for ${this.processingJobs.size} jobs to finish...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ Queue worker stopped');
  }

  private async processLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        const jobsProcessed = await this.processPendingJobs();
        
        // Adaptive polling: reduce frequency when no work is available
        if (jobsProcessed === 0) {
          this.consecutiveEmptyPolls++;
          this.currentPollInterval = Math.min(
            this.currentPollInterval * this.config.backoffMultiplier,
            this.config.maxPollInterval
          );
        } else {
          // Reset to normal polling when work is found
          this.consecutiveEmptyPolls = 0;
          this.currentPollInterval = this.config.pollInterval;
        }

        // Periodic heartbeat and cleanup
        if (Date.now() - this.lastHeartbeat > this.config.heartbeatInterval) {
          await this.performHeartbeat();
          this.lastHeartbeat = Date.now();
        }

      } catch (error) {
        console.error('❌ Error in process loop:', error);
        // Reset to normal polling on error
        this.currentPollInterval = this.config.pollInterval;
      }

      // Interruptible sleep — notifyNewJob() can wake this up immediately
      await new Promise<void>(resolve => {
        let done = false;
        const finish = () => { if (!done) { done = true; resolve(); } };
        this.wakeUpSignal = finish;
        setTimeout(finish, this.currentPollInterval);
      });
      this.wakeUpSignal = null;
    }
  }

  /** Called by routes after enqueuing a new job — wakes up the worker immediately. */
  public notifyNewJob(): void {
    this.currentPollInterval = this.config.pollInterval;
    this.consecutiveEmptyPolls = 0;
    if (this.wakeUpSignal) {
      console.log('🔔 New job enqueued — waking up worker');
      this.wakeUpSignal();
      this.wakeUpSignal = null;
    }
  }

  private async processPendingJobs(): Promise<number> {
    // Check how many slots we have available
    const availableSlots = this.config.globalConcurrency - this.processingJobs.size;
    if (availableSlots <= 0) {
      return 0;
    }

    // Periodically reclaim stale jobs (every ~10 poll cycles) - more frequent cleanup
    if (Math.random() < 0.1) { // ~10% chance per poll
      try {
        const reclaimedCount = await storage.reclaimStaleJobs(600000); // 10 minutes — allow large file transfers to complete
        if (reclaimedCount > 0) {
          console.log(`🔄 Reclaimed ${reclaimedCount} stale jobs`);
        }
      } catch (error) {
        console.error('❌ Failed to reclaim stale jobs:', error);
      }
    }

    // Claim pending jobs (reduced to avoid immediate user limit conflicts)
    const conservativeLimit = Math.min(availableSlots, 3);
    const jobs = await storage.claimPendingJobs(this.config.workerId, conservativeLimit);
    
    if (jobs.length === 0) {
      return 0;
    }

    console.log(`📋 Claimed ${jobs.length} jobs for processing`);

    let jobsStarted = 0;
    // Process each job with user concurrency validation
    for (const job of jobs) {
      if (this.processingJobs.size >= this.config.globalConcurrency) {
        break;
      }

      // Check user concurrency limits AFTER claiming to reduce churn
      const userRunningCount = await storage.countUserRunningJobs(job.userId);
      const user = await storage.getUser(job.userId);
      const userPlan = user?.membershipPlan || 'free';
      const isAdmin = user?.role === 'admin';
      
      // Admins have no concurrency limits
      const userLimit = isAdmin ? Infinity : (this.userLimits[userPlan as keyof UserConcurrencyLimits] || this.userLimits.free);

      if (!isAdmin && userRunningCount >= userLimit) {
        // User has reached their limit - this might indicate stale jobs
        console.log(`⏸️ User ${job.userId} (${userPlan}) has reached concurrency limit (${userRunningCount}/${userLimit})`);
        
        // Try to reclaim stale jobs for this specific user (jobs stuck for >2 minutes)
        try {
          const reclaimedCount = await storage.reclaimStaleJobs(120000); // 2 minutes
          if (reclaimedCount > 0) {
            console.log(`🔄 Auto-reclaimed ${reclaimedCount} stale jobs due to concurrency limit hit`);
            // Re-check after reclaim
            const newRunningCount = await storage.countUserRunningJobs(job.userId);
            if (newRunningCount < userLimit) {
              console.log(`✅ After reclaim, user ${job.userId} now has ${newRunningCount}/${userLimit} running - proceeding with job`);
              this.processJob(job).catch(error => {
                console.error(`❌ Unhandled error processing job ${job.id}:`, error);
              });
              jobsStarted++;
              continue;
            }
          }
        } catch (error) {
          console.error('❌ Failed to reclaim stale jobs:', error);
        }
        
        const nextRunAt = new Date(Date.now() + 10000); // 10 seconds delay (increased from 5)
        await storage.setJobPendingWithBackoff(job.id, job.attempts || 0, nextRunAt, 'User concurrency limit reached');
        continue;
      }

      // Process job in background
      this.processJob(job).catch(error => {
        console.error(`❌ Unhandled error processing job ${job.id}:`, error);
      });
      jobsStarted++;
    }

    return jobsStarted;
  }

  private async processJob(job: CopyOperation): Promise<void> {
    const startTime = Date.now();
    this.processingJobs.add(job.id);
    
    console.log(`🔄 Processing job ${job.id}: ${job.fileName} (${job.sourceProvider} -> ${job.destProvider})`);

    try {
      // Check if job was cancelled
      const currentJob = await storage.getCopyOperation(job.id);
      if (currentJob?.cancelRequested) {
        await storage.failJob(job.id, 'Job was cancelled by user');
        this.emit('jobCancelled', job.id, job.userId);
        return;
      }

      // Update progress to show job started
      await storage.setJobProgress(job.id, 0, 1, 0);
      this.emit('jobProgress', job.id, job.userId, { completedFiles: 0, totalFiles: 1, progressPct: 0 });

      // Process the file transfer with timeout
      const result = await this.executeTransferWithTimeout(job);

      // Calculate duration
      const duration = Math.round((Date.now() - startTime) / 1000);

      // Mark job as completed
      await storage.completeJob(job.id, {
        ...result,
        duration
      });

      console.log(`✅ Job ${job.id} completed successfully in ${duration}s`);
      this.emit('jobCompleted', job.id, job.userId, result);

    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error);
      
      const attempts = (job.attempts || 0) + 1;
      const maxRetries = job.maxRetries || 5;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (attempts >= maxRetries || this.isNonRetryableError(error)) {
        // Max retries reached or non-retryable error
        await storage.failJob(job.id, errorMessage);
        this.emit('jobFailed', job.id, job.userId, errorMessage);
      } else {
        // Retry with exponential backoff
        const delay = this.calculateBackoffDelay(attempts);
        const nextRunAt = new Date(Date.now() + delay);
        
        await storage.setJobPendingWithBackoff(job.id, attempts, nextRunAt, errorMessage);
        console.log(`🔄 Job ${job.id} will retry in ${Math.round(delay / 1000)}s (attempt ${attempts}/${maxRetries})`);
        this.emit('jobRetry', job.id, job.userId, { attempts, nextRunAt, error: errorMessage });
      }
    } finally {
      this.processingJobs.delete(job.id);
    }
  }

  private async executeTransfer(job: CopyOperation): Promise<{ copiedFileId?: string; copiedFileName?: string; copiedFileUrl?: string }> {
    const { sourceProvider, destProvider, sourceFileId, sourceFilePath, destinationFolderId, sourceUrl } = job;
    let fileName = job.fileName;

    // Check for cancellation before starting
    const currentJob = await storage.getCopyOperation(job.id);
    if (currentJob?.cancelRequested) {
      throw new Error('Job was cancelled by user');
    }

    // Detect if this is a folder operation — prefer the stored itemType, fall back to URL parsing
    let isFolder = job.itemType === 'folder';
    if (!isFolder && sourceUrl) {
      isFolder = sourceUrl.includes('/drive/folders/') || sourceUrl.includes('dropbox://folder:');
    }
    // Handle folder operations with progress callback
    if (isFolder) {
      return await this.executefolderTransfer(job);
    }

    // Skip-if-exists: live check against destination before downloading
    if (job.duplicateAction === 'skip' && fileName) {
      const fileSize = undefined; // size not stored on the job; name match is sufficient
      const exists = await this.destFileExists(
        destProvider || '',
        job.userId,
        destinationFolderId || 'root',
        fileName,
        fileSize
      );
      if (exists) {
        console.log(`⏭️  Skipping "${fileName}" — already exists at destination`);
        await storage.setJobProgress(job.id, 1, 1, 100);
        return { copiedFileName: fileName };
      }
    }

    // Step 1: Download file from source
    let fileContent: Buffer;

    if (sourceProvider === 'google') {
      if (!sourceFileId) throw new Error('Source file ID is required for Google Drive');
      const driveService = this.getServiceFromPool('google', job.userId) as GoogleDriveService;
      const download = await driveService.downloadFile(sourceFileId);
      fileContent = Buffer.from(download.content);
      if (download.exportExtension && fileName && !fileName.includes('.')) {
        fileName = fileName + download.exportExtension;
      }
    } else if (sourceProvider === 'dropbox') {
      if (!sourceFilePath) throw new Error('Source file path is required for Dropbox');
      const dropboxService = this.getServiceFromPool('dropbox', job.userId) as DropboxService;
      const downloadedContent = await dropboxService.downloadFile(sourceFilePath);
      fileContent = downloadedContent instanceof ArrayBuffer
        ? Buffer.from(downloadedContent)
        : downloadedContent as Buffer;
    } else if (sourceProvider === 'onedrive') {
      if (!sourceFileId) throw new Error('Source file ID is required for OneDrive');
      const onedriveService = this.getServiceFromPool('onedrive', job.userId) as OneDriveService;
      fileContent = await onedriveService.downloadFile(sourceFileId);
    } else if (sourceProvider === 'box') {
      if (!sourceFileId) throw new Error('Source file ID is required for Box');
      const boxService = this.getServiceFromPool('box', job.userId) as BoxService;
      fileContent = await boxService.downloadFile(sourceFileId);
    } else if (sourceProvider === 's3') {
      // sourceUrl is s3://bucket/key
      if (!sourceUrl) throw new Error('Source URL is required for S3');
      const s3Match = sourceUrl.match(/^s3:\/\/([^/]+)\/(.+)$/);
      if (!s3Match) throw new Error(`Invalid S3 source URL: ${sourceUrl}`);
      const [, s3SrcBucket, s3SrcKey] = s3Match;
      const s3Service = this.getServiceFromPool('s3', job.userId) as S3Service;
      fileContent = await s3Service.downloadFile(s3SrcBucket, s3SrcKey);
    } else {
      throw new Error(`Unsupported source provider: ${sourceProvider}`);
    }

    // Check for cancellation after download
    const midJob = await storage.getCopyOperation(job.id);
    if (midJob?.cancelRequested) {
      throw new Error('Job was cancelled by user');
    }

    // Update progress - download completed
    await storage.setJobProgress(job.id, 0, 1, 50);
    this.emit('jobProgress', job.id, job.userId, { completedFiles: 0, totalFiles: 1, progressPct: 50 });

    // Step 2: Upload file to destination
    let result: { copiedFileId?: string; copiedFileName?: string; copiedFileUrl?: string } = {};

    if (destProvider === 'google') {
      const driveService = this.getServiceFromPool('google', job.userId) as GoogleDriveService;
      const targetFolderId = destinationFolderId || 'root';
      const uploadResult = await driveService.uploadFile(fileName || 'untitled', fileContent, targetFolderId);
      result = {
        copiedFileId: uploadResult.id,
        copiedFileName: uploadResult.name,
        copiedFileUrl: `https://drive.google.com/file/d/${uploadResult.id}/view`
      };
    } else if (destProvider === 'dropbox') {
      const dropboxService = this.getServiceFromPool('dropbox', job.userId) as DropboxService;
      const arrayBufferContent = fileContent.buffer.slice(
        fileContent.byteOffset,
        fileContent.byteOffset + fileContent.byteLength
      );
      let targetFolderPath = destinationFolderId || '';
      if (targetFolderPath.endsWith('/')) targetFolderPath = targetFolderPath.slice(0, -1);
      const uploadResult = await dropboxService.uploadFile(fileName || 'untitled', arrayBufferContent, targetFolderPath);
      let normalizedFolderPath = targetFolderPath || '';
      if (normalizedFolderPath && !normalizedFolderPath.startsWith('/')) {
        normalizedFolderPath = '/' + normalizedFolderPath;
      }
      const fullFilePath = normalizedFolderPath ? `${normalizedFolderPath}/${fileName}` : `/${fileName}`;
      let sharedUrl: string | undefined;
      try {
        sharedUrl = await dropboxService.getSharedLink(fullFilePath);
      } catch {
        sharedUrl = undefined;
      }
      result = {
        copiedFileId: uploadResult.id,
        copiedFileName: uploadResult.name,
        copiedFileUrl: sharedUrl
      };
    } else if (destProvider === 'onedrive') {
      const onedriveService = this.getServiceFromPool('onedrive', job.userId) as OneDriveService;
      // destinationFolderId is the OneDrive folder ID ('' = root)
      const targetFolderId = destinationFolderId && destinationFolderId !== 'root' ? destinationFolderId : null;
      const uploadResult = await onedriveService.uploadFile(targetFolderId, fileName || 'untitled', fileContent);
      result = {
        copiedFileId: uploadResult.id,
        copiedFileName: uploadResult.name,
        copiedFileUrl: uploadResult.webUrl
      };
    } else if (destProvider === 'box') {
      const boxService = this.getServiceFromPool('box', job.userId) as BoxService;
      // destinationFolderId is the Box folder ID ('' = root → Box uses '0')
      const targetFolderId = destinationFolderId && destinationFolderId !== 'root' ? destinationFolderId : null;
      const uploadResult = await boxService.uploadFile(targetFolderId, fileName || 'untitled', fileContent);
      result = {
        copiedFileId: uploadResult.id,
        copiedFileName: uploadResult.name,
        copiedFileUrl: uploadResult.webUrl
      };
    } else if (destProvider === 's3') {
      // destinationFolderId is encoded as "bucket/prefix"
      const slashIdx = (destinationFolderId || '').indexOf('/');
      const s3DestBucket = slashIdx >= 0 ? destinationFolderId!.slice(0, slashIdx) : destinationFolderId!;
      const s3DestPrefix = slashIdx >= 0 ? destinationFolderId!.slice(slashIdx + 1) : '';
      const s3Key = s3DestPrefix ? `${s3DestPrefix}${fileName || 'untitled'}` : (fileName || 'untitled');
      const s3Service = this.getServiceFromPool('s3', job.userId) as S3Service;
      const uploadResult = await s3Service.uploadFile(s3DestBucket, s3Key, fileContent);
      result = {
        copiedFileId: uploadResult.id,
        copiedFileName: uploadResult.name,
        copiedFileUrl: undefined
      };
    } else {
      throw new Error(`Unsupported destination provider: ${destProvider}`);
    }

    // Update progress - upload completed
    await storage.setJobProgress(job.id, 1, 1, 100);
    this.emit('jobProgress', job.id, job.userId, { completedFiles: 1, totalFiles: 1, progressPct: 100 });

    return result;
  }

  private async executefolderTransfer(job: CopyOperation): Promise<{ copiedFileId?: string; copiedFileName?: string; copiedFileUrl?: string }> {
    const { sourceProvider, destProvider, sourceFileId, sourceFilePath, fileName, destinationFolderId, sourceUrl } = job;

    const progressCallback = async (completedFiles: number, totalFiles: number, progressPct: number) => {
      this.emit('jobProgress', job.id, job.userId, { completedFiles, totalFiles, progressPct });
    };

    // Native same-provider copies (use provider's own recursive copy API)
    if (sourceProvider === 'google' && destProvider === 'google') {
      const driveService = this.getServiceFromPool('google', job.userId) as GoogleDriveService;
      let actualSourceFileId = sourceFileId;
      if (!actualSourceFileId && sourceUrl) {
        const { fileId } = driveService.parseGoogleDriveUrl(sourceUrl);
        actualSourceFileId = fileId;
      }
      await storage.setJobProgress(job.id, 0, 1, 0);
      this.emit('jobProgress', job.id, job.userId, { completedFiles: 0, totalFiles: 1, progressPct: 0 });
      const copiedFolder = await driveService.copyFolderRecursive(actualSourceFileId, destinationFolderId, fileName, job.id, progressCallback);
      return { copiedFileId: copiedFolder.id, copiedFileName: copiedFolder.name, copiedFileUrl: copiedFolder.webViewLink };
    }

    if (sourceProvider === 'dropbox' && destProvider === 'dropbox') {
      const dropboxService = this.getServiceFromPool('dropbox', job.userId) as DropboxService;
      await storage.setJobProgress(job.id, 0, 1, 0);
      this.emit('jobProgress', job.id, job.userId, { completedFiles: 0, totalFiles: 1, progressPct: 0 });
      const copiedFolder = await dropboxService.copyFolderRecursive(sourceUrl!, destinationFolderId, fileName, job.id, '', progressCallback);
      return { copiedFileId: copiedFolder.id, copiedFileName: copiedFolder.name, copiedFileUrl: copiedFolder.url };
    }

    // Generic path: all cross-cloud combinations + same-provider OneDrive/Box/S3
    let actualSourceId: string;
    let sourceBucket: string | undefined;

    if (sourceProvider === 'google') {
      actualSourceId = sourceFileId || '';
      if (!actualSourceId && sourceUrl) {
        const driveService = this.getServiceFromPool('google', job.userId) as GoogleDriveService;
        actualSourceId = driveService.parseGoogleDriveUrl(sourceUrl).fileId;
      }
    } else if (sourceProvider === 'dropbox') {
      actualSourceId = sourceFilePath || (sourceUrl ? sourceUrl.replace('dropbox://folder:', '') : '');
    } else if (sourceProvider === 's3') {
      const m = (sourceUrl || '').match(/^s3:\/\/([^/]+)\/(.*)$/);
      sourceBucket = m?.[1];
      actualSourceId = m?.[2] || sourceFileId || '';
    } else {
      // onedrive / box
      actualSourceId = sourceFileId || '';
    }

    let destParent: string;
    let destBucket: string | undefined;

    if (destProvider === 's3') {
      const slashIdx = (destinationFolderId || '').indexOf('/');
      destBucket = slashIdx >= 0 ? destinationFolderId!.slice(0, slashIdx) : (destinationFolderId || '');
      destParent = slashIdx >= 0 ? destinationFolderId!.slice(slashIdx + 1) : '';
    } else {
      destParent = destinationFolderId || '';
    }

    const totalFiles = await this.countFilesInSourceFolder(sourceProvider, actualSourceId, job.userId, sourceBucket);
    const progressCtx = { completed: 0, total: Math.max(totalFiles, 1) };
    await storage.setJobProgress(job.id, 0, progressCtx.total, 0);
    this.emit('jobProgress', job.id, job.userId, { completedFiles: 0, totalFiles: progressCtx.total, progressPct: 0 });

    await this.crossCloudFolderTransfer(
      job, actualSourceId, destParent, fileName || 'Untitled',
      progressCtx, progressCallback, sourceBucket, destBucket
    );

    return { copiedFileName: fileName, copiedFileUrl: undefined };
  }

  private async countFilesInSourceFolder(
    provider: string,
    folderId: string,
    userId: string,
    bucket?: string
  ): Promise<number> {
    try {
      switch (provider) {
        case 'google': {
          const svc = this.getServiceFromPool('google', userId) as GoogleDriveService;
          const files = await svc.listFiles(folderId);
          let count = files.filter(f => f.mimeType !== 'application/vnd.google-apps.folder').length;
          for (const sub of files.filter(f => f.mimeType === 'application/vnd.google-apps.folder')) {
            count += await this.countFilesInSourceFolder('google', sub.id, userId);
          }
          return count;
        }
        case 'dropbox': {
          const svc = this.getServiceFromPool('dropbox', userId) as DropboxService;
          const path = folderId === '/' ? '' : folderId;
          const items = await svc.listFiles(path);
          let count = items.filter(f => f.mimeType !== 'application/vnd.dropbox.folder').length;
          for (const sub of items.filter(f => f.mimeType === 'application/vnd.dropbox.folder')) {
            const subPath = path ? `${path}/${sub.name}` : `/${sub.name}`;
            count += await this.countFilesInSourceFolder('dropbox', subPath, userId);
          }
          return count;
        }
        case 'onedrive': {
          const svc = this.getServiceFromPool('onedrive', userId) as OneDriveService;
          const items = await svc.listFolder(folderId || undefined);
          let count = items.filter(f => !f.isFolder).length;
          for (const sub of items.filter(f => f.isFolder)) {
            count += await this.countFilesInSourceFolder('onedrive', sub.id, userId);
          }
          return count;
        }
        case 'box': {
          const svc = this.getServiceFromPool('box', userId) as BoxService;
          const items = await svc.listFolder(folderId || undefined);
          let count = items.filter(f => !f.isFolder).length;
          for (const sub of items.filter(f => f.isFolder)) {
            count += await this.countFilesInSourceFolder('box', sub.id, userId);
          }
          return count;
        }
        case 's3': {
          const svc = this.getServiceFromPool('s3', userId) as S3Service;
          const items = await svc.listFolder(bucket!, folderId || undefined);
          let count = items.filter(f => !f.isFolder).length;
          for (const sub of items.filter(f => f.isFolder)) {
            count += await this.countFilesInSourceFolder('s3', sub.id, userId, bucket);
          }
          return count;
        }
        default:
          return 0;
      }
    } catch {
      return 0;
    }
  }

  private async crossCloudFolderTransfer(
    job: CopyOperation,
    sourceFolderId: string,
    destParent: string,
    folderName: string,
    progressCtx: { completed: number; total: number },
    progressCallback: (c: number, t: number, pct: number) => Promise<void>,
    sourceBucket?: string,
    destBucket?: string,
  ): Promise<void> {
    const { sourceProvider, destProvider } = job;
    const CONCURRENCY = 5;

    // ── Services ────────────────────────────────────────────────────────────────
    const drive    = (sourceProvider === 'google'   || destProvider === 'google')   ? this.getServiceFromPool('google',   job.userId) as GoogleDriveService : null;
    const dbx      = (sourceProvider === 'dropbox'  || destProvider === 'dropbox')  ? this.getServiceFromPool('dropbox',  job.userId) as DropboxService      : null;
    const onedrive = (sourceProvider === 'onedrive' || destProvider === 'onedrive') ? this.getServiceFromPool('onedrive', job.userId) as OneDriveService     : null;
    const box      = (sourceProvider === 'box'      || destProvider === 'box')      ? this.getServiceFromPool('box',      job.userId) as BoxService           : null;
    const s3       = (sourceProvider === 's3'       || destProvider === 's3')       ? this.getServiceFromPool('s3',       job.userId) as S3Service            : null;

    // ── List source items ────────────────────────────────────────────────────────
    type FolderItem = { id: string; name: string; isFolder: boolean; mimeType?: string };
    let sourceItems: FolderItem[];

    switch (sourceProvider) {
      case 'google':
        sourceItems = (await drive!.listFiles(sourceFolderId)).map(f => ({
          id: f.id, name: f.name, isFolder: f.mimeType === 'application/vnd.google-apps.folder', mimeType: f.mimeType
        }));
        break;
      case 'dropbox': {
        const dbxPath = sourceFolderId === '/' ? '' : sourceFolderId;
        sourceItems = (await dbx!.listFiles(dbxPath)).map(f => ({
          id: f.id, name: f.name, isFolder: f.mimeType === 'application/vnd.dropbox.folder', mimeType: f.mimeType
        }));
        break;
      }
      case 'onedrive':
        sourceItems = (await onedrive!.listFolder(sourceFolderId || undefined)).map(f => ({
          id: f.id, name: f.name, isFolder: f.isFolder, mimeType: f.mimeType
        }));
        break;
      case 'box':
        sourceItems = (await box!.listFolder(sourceFolderId || undefined)).map(f => ({
          id: f.id, name: f.name, isFolder: f.isFolder, mimeType: f.mimeType
        }));
        break;
      case 's3':
        sourceItems = (await s3!.listFolder(sourceBucket!, sourceFolderId || undefined)).map(f => ({
          id: f.id, name: f.name, isFolder: f.isFolder
        }));
        break;
      default:
        throw new Error(`Unsupported source provider: ${sourceProvider}`);
    }

    // ── Create destination folder ────────────────────────────────────────────────
    let newDestId: string;

    switch (destProvider) {
      case 'google': {
        const parentId = destParent && destParent !== 'root' ? destParent : undefined;
        const newFolder = await drive!.createFolder(folderName, parentId);
        newDestId = newFolder.id!;
        break;
      }
      case 'dropbox': {
        const p = destParent.endsWith('/') ? destParent.slice(0, -1) : destParent;
        newDestId = p ? `${p}/${folderName}` : `/${folderName}`;
        try { await dbx!.createFolder(newDestId); } catch { /* may already exist */ }
        break;
      }
      case 'onedrive': {
        const parentId = destParent && destParent !== 'root' ? destParent : null;
        const newFolder = await onedrive!.createFolder(parentId, folderName);
        newDestId = newFolder.id;
        break;
      }
      case 'box': {
        const parentId = destParent && destParent !== 'root' ? destParent : null;
        const newFolder = await box!.createFolder(parentId, folderName);
        newDestId = newFolder.id;
        break;
      }
      case 's3':
        newDestId = `${destParent}${folderName}/`;
        break;
      default:
        throw new Error(`Unsupported destination provider: ${destProvider}`);
    }

    // ── Recurse into subfolders ──────────────────────────────────────────────────
    const subfolders = sourceItems.filter(i => i.isFolder);
    const files      = sourceItems.filter(i => !i.isFolder);

    for (const sub of subfolders) {
      let subId: string;
      if (sourceProvider === 'dropbox') {
        const srcPath = sourceFolderId === '/' ? '' : sourceFolderId;
        subId = srcPath ? `${srcPath}/${sub.name}` : `/${sub.name}`;
      } else {
        subId = sub.id;
      }
      await this.crossCloudFolderTransfer(
        job, subId, newDestId, sub.name, progressCtx, progressCallback, sourceBucket, destBucket
      );
    }

    // ── Transfer files in concurrent batches ────────────────────────────────────
    for (let i = 0; i < files.length; i += CONCURRENCY) {
      const batch = files.slice(i, i + CONCURRENCY);
      await Promise.allSettled(batch.map(async (file) => {
        try {
          let content: Buffer;
          let finalName = file.name;

          // Download
          switch (sourceProvider) {
            case 'google': {
              const dl = await drive!.downloadFile(file.id);
              content = Buffer.from(dl.content);
              if (dl.exportExtension && !finalName.includes('.')) finalName += dl.exportExtension;
              break;
            }
            case 'dropbox': {
              const srcPath = sourceFolderId === '/' ? '' : sourceFolderId;
              const filePath = srcPath ? `${srcPath}/${file.name}` : `/${file.name}`;
              content = Buffer.from(await dbx!.downloadFile(filePath));
              break;
            }
            case 'onedrive':
              content = await onedrive!.downloadFile(file.id);
              break;
            case 'box':
              content = await box!.downloadFile(file.id);
              break;
            case 's3':
              content = await s3!.downloadFile(sourceBucket!, file.id);
              break;
            default:
              throw new Error(`Unknown source provider: ${sourceProvider}`);
          }

          // Upload
          switch (destProvider) {
            case 'google': {
              const fid = newDestId === 'root' ? undefined : newDestId;
              await drive!.uploadFile(finalName, content, fid, undefined, undefined, { skipDuplicateCheck: true });
              break;
            }
            case 'dropbox': {
              const ab = content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength);
              await dbx!.uploadFile(finalName, ab, newDestId, undefined, { skipDuplicateCheck: true });
              break;
            }
            case 'onedrive': {
              const fid = newDestId === 'root' ? null : newDestId;
              await onedrive!.uploadFile(fid, finalName, content, file.mimeType);
              break;
            }
            case 'box': {
              const fid = newDestId === 'root' ? null : newDestId;
              await box!.uploadFile(fid, finalName, content, file.mimeType);
              break;
            }
            case 's3':
              await s3!.uploadFile(destBucket!, `${newDestId}${finalName}`, content, file.mimeType);
              break;
          }

          progressCtx.completed++;
          const pct = Math.min(100, Math.round((progressCtx.completed / Math.max(1, progressCtx.total)) * 100));
          await storage.setJobProgress(job.id, progressCtx.completed, progressCtx.total, pct);
          await progressCallback(progressCtx.completed, progressCtx.total, pct);
        } catch (err) {
          console.error(`Folder transfer: error with ${file.name}:`, err);
        }
      }));
    }
  }

  private async destFileExists(
    provider: string,
    userId: string,
    folderIdOrPath: string,
    name: string,
    size?: number
  ): Promise<boolean> {
    try {
      if (provider === 'google') {
        const svc = this.getServiceFromPool('google', userId) as GoogleDriveService;
        return await svc.fileExistsInFolder(name, folderIdOrPath || 'root', size);
      } else if (provider === 'dropbox') {
        const svc = this.getServiceFromPool('dropbox', userId) as DropboxService;
        return await svc.fileExistsAtPath(folderIdOrPath, name, size);
      }
      return false; // fail open for onedrive, box, s3
    } catch {
      return false;
    }
  }

  private calculateBackoffDelay(attempts: number): number {
    // Exponential backoff: min(base * 2^attempts, maxDelay) + jitter
    const baseDelay = 1000; // 1 second
    const maxDelay = 60000; // 60 seconds
    const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempts - 1), maxDelay);
    
    // Add jitter (up to 20% of the delay)
    const jitter = Math.random() * 0.2 * exponentialDelay;
    
    return exponentialDelay + jitter;
  }

  private isNonRetryableError(error: any): boolean {
    if (!(error instanceof Error)) return false;
    
    const message = error.message.toLowerCase();
    
    // Authentication/authorization errors
    if (message.includes('unauthorized') || 
        message.includes('access denied') || 
        message.includes('invalid token') ||
        message.includes('expired token') ||
        message.includes('not connected')) {
      return true;
    }
    
    // File not found or invalid input
    if (message.includes('not found') || 
        message.includes('invalid file') ||
        message.includes('file too large') ||
        message.includes('unsupported file type')) {
      return true;
    }
    
    // Quota exceeded (not worth retrying immediately)
    if (message.includes('quota exceeded') || 
        message.includes('storage full')) {
      return true;
    }
    
    return false;
  }

  private async performHeartbeat(): Promise<void> {
    try {
      // Reclaim stale jobs more aggressively during heartbeat
      const reclaimedCount = await storage.reclaimStaleJobs(300000); // 5 minutes
      if (reclaimedCount > 0) {
        console.log(`💓 Heartbeat: Reclaimed ${reclaimedCount} stale jobs`);
      }

      // Clean up old completed/failed operations (older than 24 hours)
      const cleanupCount = await this.cleanupOldOperations();
      if (cleanupCount > 0) {
        console.log(`🧹 Heartbeat: Cleaned up ${cleanupCount} old operations`);
      }

      // Clear unused service connections from pool
      this.cleanupServicePool();

      console.log(`💓 Heartbeat: Active jobs: ${this.processingJobs.size}/${this.config.globalConcurrency}, Poll interval: ${this.currentPollInterval}ms`);
    } catch (error) {
      console.error('❌ Error during heartbeat:', error);
    }
  }

  private async cleanupOldOperations(): Promise<number> {
    try {
      // Clean up operations older than 24 hours
      const cleanupThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const deletedCount = await storage.cleanupOldOperations(cleanupThreshold);
      return deletedCount;
    } catch (error) {
      console.error('❌ Failed to cleanup old operations:', error);
      return 0;
    }
  }

  private cleanupServicePool(): void {
    // Clear services that haven't been used recently
    const maxPoolSize = 10;
    if (this.servicePool.size > maxPoolSize) {
      // Simple cleanup: clear half the pool
      const toRemove = Array.from(this.servicePool.keys()).slice(0, Math.floor(this.servicePool.size / 2));
      toRemove.forEach(key => this.servicePool.delete(key));
      console.log(`🧹 Service pool cleanup: Removed ${toRemove.length} unused services`);
    }
  }

  private getServiceFromPool(provider: string, userId: string): GoogleDriveService | DropboxService | OneDriveService | BoxService | S3Service {
    const poolKey = `${provider}-${userId}`;

    if (!this.servicePool.has(poolKey)) {
      if (provider === 'google') {
        this.servicePool.set(poolKey, new GoogleDriveService(userId));
      } else if (provider === 'dropbox') {
        this.servicePool.set(poolKey, new DropboxService(userId));
      } else if (provider === 'onedrive') {
        this.servicePool.set(poolKey, new OneDriveService(userId));
      } else if (provider === 'box') {
        this.servicePool.set(poolKey, new BoxService(userId));
      } else if (provider === 's3') {
        this.servicePool.set(poolKey, new S3Service(userId));
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }
    }

    return this.servicePool.get(poolKey)!;
  }

  private async executeTransferWithTimeout(job: CopyOperation): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Transfer timeout after ${this.config.connectionTimeout}ms`));
      }, this.config.connectionTimeout);

      this.executeTransfer(job)
        .then(result => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  getStats() {
    return {
      isRunning: this.isRunning,
      workerId: this.config.workerId,
      processingJobs: this.processingJobs.size,
      globalConcurrency: this.config.globalConcurrency,
      userLimits: this.userLimits,
      currentPollInterval: this.currentPollInterval,
      consecutiveEmptyPolls: this.consecutiveEmptyPolls,
      servicePoolSize: this.servicePool.size
    };
  }
}

// Global worker instance
let globalWorker: QueueWorker | null = null;

export function startQueueWorker(config?: Partial<WorkerConfig>): QueueWorker {
  if (globalWorker) {
    console.log('Queue worker already exists, returning existing instance');
    return globalWorker;
  }

  globalWorker = new QueueWorker(config);
  globalWorker.start();
  
  return globalWorker;
}

export function getQueueWorker(): QueueWorker | null {
  return globalWorker;
}

export async function stopQueueWorker(): Promise<void> {
  if (globalWorker) {
    await globalWorker.stop();
    globalWorker = null;
  }
}