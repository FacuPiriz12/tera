import {
  users,
  cloudFiles,
  copyOperations,
  shareRequests,
  shareEvents,
  scheduledTasks,
  scheduledTaskRuns,
  syncFileRegistry,
  fileHashes,
  fileConflicts,
  type User,
  type UpsertUser,
  type CloudFile,
  type InsertCloudFile,
  type CopyOperation,
  type InsertCopyOperation,
  type ShareRequest,
  type InsertShareRequest,
  type ShareEvent,
  type InsertShareEvent,
  type ScheduledTask,
  type InsertScheduledTask,
  type ScheduledTaskRun,
  type InsertScheduledTaskRun,
  type SyncFileRegistry,
  type InsertSyncFileRegistry,
  type FileHash,
  type InsertFileHash,
  type FileConflict,
  type InsertFileConflict,
} from "@shared/schema";
import { getDb } from "./db";
import { eq, desc, sql, and, or, isNull, lte, count, asc, ne, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(userId: string, updates: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
    membershipPlan?: string;
    membershipExpiry?: Date;
    membershipTrialUsed?: boolean;
  }): Promise<User>;
  updateUserGoogleTokens(userId: string, tokens: {
    accessToken: string | null;
    refreshToken?: string | null;
    expiry?: Date | null;
  }): Promise<User>;
  updateUserDropboxTokens(userId: string, tokens: {
    accessToken: string | null;
    refreshToken?: string | null;
    expiry?: Date | null;
  }): Promise<User>;
  
  // Stripe integration methods - for Stripe payment processing
  updateUserStripeInfo(userId: string, stripeData: {
    customerId?: string;
    subscriptionId?: string;
  }): Promise<User>;
  
  // Admin user operations
  getAllUsers(page?: number, limit?: number): Promise<{ users: User[]; total: number; totalPages: number }>;
  updateUserLimits(userId: string, limits: {
    maxStorageBytes?: number;
    maxConcurrentOperations?: number;
    maxDailyOperations?: number;
  }): Promise<User>;
  updateUserRole(userId: string, role: string): Promise<User>;
  suspendUser(userId: string): Promise<User>;
  activateUser(userId: string): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  getUserActivity(userId: string): Promise<{ operations: CopyOperation[]; files: CloudFile[] }>;
  
  // Cloud files operations (Google Drive, Dropbox, etc.)
  createCloudFile(cloudFile: InsertCloudFile): Promise<CloudFile>;
  getUserCloudFiles(userId: string, page?: number, limit?: number): Promise<{ files: CloudFile[]; total: number; totalPages: number }>;
  
  // Copy operations
  createCopyOperation(operation: InsertCopyOperation): Promise<CopyOperation>;
  updateCopyOperation(id: string, updates: Partial<CopyOperation>): Promise<CopyOperation>;
  getCopyOperation(id: string): Promise<CopyOperation | undefined>;
  getUserCopyOperations(userId: string): Promise<CopyOperation[]>;
  getRecentCopyOperations(userId: string, limit: number): Promise<CopyOperation[]>;
  
  // Admin operations
  getAllOperations(filters?: {
    userId?: string;
    status?: string;
    provider?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ operations: CopyOperation[]; total: number; totalPages: number }>;
  getSystemMetrics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalOperations: number;
    operationsToday: number;
    successRate: number;
    avgDuration: number;
    totalStorage: number;
    operationsByStatus: { status: string; count: number }[];
    operationsByProvider: { provider: string; count: number }[];
  }>;
  retryOperation(id: string): Promise<CopyOperation>;
  
  // Job queue operations
  claimPendingJobs(workerId: string, limit: number): Promise<CopyOperation[]>;
  setJobInProgress(id: string, workerId: string): Promise<CopyOperation>;
  setJobPendingWithBackoff(id: string, attempts: number, nextRunAt: Date, errorMessage?: string): Promise<CopyOperation>;
  completeJob(id: string, result: { copiedFileId?: string; copiedFileName?: string; copiedFileUrl?: string; duration?: number }): Promise<CopyOperation>;
  failJob(id: string, errorMessage: string): Promise<CopyOperation>;
  countUserRunningJobs(userId: string): Promise<number>;
  setJobProgress(id: string, completedFiles: number, totalFiles: number, progressPct: number): Promise<CopyOperation>;
  requestJobCancel(id: string): Promise<CopyOperation>;
  reclaimStaleJobs(staleDurationMs: number): Promise<number>;
  
  // Cleanup operations for old completed/failed jobs
  cleanupOldOperations(olderThanMs: number): Promise<number>;
  
  // Share request operations
  createShareRequest(request: InsertShareRequest): Promise<ShareRequest>;
  getShareRequest(id: string): Promise<ShareRequest | undefined>;
  updateShareRequest(id: string, updates: Partial<ShareRequest>): Promise<ShareRequest>;
  getUserInbox(userId: string): Promise<ShareRequest[]>;
  getUserOutbox(userId: string): Promise<ShareRequest[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
  searchUsers(query: string, excludeUserId: string): Promise<User[]>;
  
  // Share events
  createShareEvent(event: InsertShareEvent): Promise<ShareEvent>;
  getShareEvents(shareRequestId: string): Promise<ShareEvent[]>;
  
  // Scheduled tasks operations
  createScheduledTask(task: InsertScheduledTask): Promise<ScheduledTask>;
  getScheduledTask(id: string): Promise<ScheduledTask | undefined>;
  getUserScheduledTasks(userId: string): Promise<ScheduledTask[]>;
  updateScheduledTask(id: string, updates: Partial<ScheduledTask>): Promise<ScheduledTask>;
  deleteScheduledTask(id: string): Promise<void>;
  getTasksDueForExecution(): Promise<ScheduledTask[]>;
  pauseScheduledTask(id: string): Promise<ScheduledTask>;
  resumeScheduledTask(id: string): Promise<ScheduledTask>;
  
  // Scheduled task runs
  createScheduledTaskRun(run: InsertScheduledTaskRun): Promise<ScheduledTaskRun>;
  getTaskRuns(taskId: string, limit?: number): Promise<ScheduledTaskRun[]>;
  updateTaskRun(id: string, updates: Partial<ScheduledTaskRun>): Promise<ScheduledTaskRun>;
  
  // Sync file registry operations (for cumulative sync)
  createSyncFileRecord(record: InsertSyncFileRegistry): Promise<SyncFileRegistry>;
  getSyncFilesByTask(taskId: string): Promise<SyncFileRegistry[]>;
  getSyncFileBySourceId(taskId: string, sourceFileId: string): Promise<SyncFileRegistry | undefined>;
  updateSyncFileRecord(id: string, updates: Partial<SyncFileRegistry>): Promise<SyncFileRegistry>;
  deleteSyncFilesByTask(taskId: string): Promise<number>;
  
  // Duplicate detection operations
  createFileHash(hash: InsertFileHash): Promise<FileHash>;
  findFilesByMetadata(userId: string, fileName: string, fileSize: number, provider?: string): Promise<FileHash[]>;
  findFileByHash(userId: string, contentHash: string): Promise<FileHash | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await getDb().select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // First, check if user exists by email (more reliable than ID for auth providers)
    if (userData.email) {
      const existingUser = await getDb()
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);
      
      if (existingUser.length > 0) {
        // Update existing user, preserving the role if already admin
        const currentRole = existingUser[0].role;
        const newRole = userData.role === 'admin' ? 'admin' : currentRole;
        
        const [user] = await getDb()
          .update(users)
          .set({
            ...userData,
            id: existingUser[0].id, // Keep original ID
            role: newRole, // Preserve admin role, or upgrade to admin
            updatedAt: new Date(),
          })
          .where(eq(users.email, userData.email))
          .returning();
        return user;
      }
    }
    
    // If no existing user by email, try upsert by ID
    const [user] = await getDb()
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(userId: string, updates: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
    membershipPlan?: string;
    membershipExpiry?: Date;
    membershipTrialUsed?: boolean;
  }): Promise<User> {
    // Filter out undefined values to avoid overwriting existing data
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    
    const [user] = await getDb()
      .update(users)
      .set({
        ...cleanUpdates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserGoogleTokens(userId: string, tokens: {
    accessToken: string | null;
    refreshToken?: string | null;
    expiry?: Date | null;
  }): Promise<User> {
    const [user] = await getDb()
      .update(users)
      .set({
        googleAccessToken: tokens.accessToken,
        googleRefreshToken: tokens.refreshToken || null,
        googleTokenExpiry: tokens.expiry || null,
        googleConnected: tokens.accessToken ? true : false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserDropboxTokens(userId: string, tokens: {
    accessToken: string | null;
    refreshToken?: string | null;
    expiry?: Date | null;
  }): Promise<User> {
    const [user] = await getDb()
      .update(users)
      .set({
        dropboxAccessToken: tokens.accessToken,
        dropboxRefreshToken: tokens.refreshToken || null,
        dropboxTokenExpiry: tokens.expiry || null,
        dropboxConnected: !!(tokens.accessToken || tokens.refreshToken),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeData: {
    customerId?: string;
    subscriptionId?: string;
  }): Promise<User> {
    const [user] = await getDb()
      .update(users)
      .set({
        stripeCustomerId: stripeData.customerId,
        stripeSubscriptionId: stripeData.subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Admin user operations
  async getAllUsers(page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    
    const allUsers = await getDb()
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
    
    const [{ count: total }] = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(users);
    
    const totalPages = Math.ceil(Number(total) / limit);
    
    return { users: allUsers, total: Number(total), totalPages };
  }

  async updateUserLimits(userId: string, limits: {
    maxStorageBytes?: number;
    maxConcurrentOperations?: number;
    maxDailyOperations?: number;
  }): Promise<User> {
    const cleanLimits = Object.fromEntries(
      Object.entries(limits).filter(([, value]) => value !== undefined)
    );
    
    const [user] = await getDb()
      .update(users)
      .set({
        ...cleanLimits,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await getDb()
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async suspendUser(userId: string): Promise<User> {
    const [user] = await getDb()
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async activateUser(userId: string): Promise<User> {
    const [user] = await getDb()
      .update(users)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    await getDb()
      .delete(users)
      .where(eq(users.id, userId));
  }

  async getUserActivity(userId: string): Promise<{ operations: CopyOperation[]; files: CloudFile[] }> {
    const operations = await getDb()
      .select()
      .from(copyOperations)
      .where(eq(copyOperations.userId, userId))
      .orderBy(desc(copyOperations.createdAt))
      .limit(50);
    
    const files = await getDb()
      .select()
      .from(cloudFiles)
      .where(eq(cloudFiles.userId, userId))
      .orderBy(desc(cloudFiles.createdAt))
      .limit(50);
    
    return { operations, files };
  }

  async createCloudFile(cloudFile: InsertCloudFile): Promise<CloudFile> {
    const [file] = await getDb()
      .insert(cloudFiles)
      .values(cloudFile)
      .returning();
    return file;
  }

  async getUserCloudFiles(
    userId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{ files: CloudFile[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    
    // Obtener archivos paginados
    const files = await getDb()
      .select()
      .from(cloudFiles)
      .where(eq(cloudFiles.userId, userId))
      .orderBy(desc(cloudFiles.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Obtener total de archivos
    const [{ count }] = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(cloudFiles)
      .where(eq(cloudFiles.userId, userId));
    
    const total = Number(count);
    const totalPages = Math.ceil(total / limit);
    
    return { files, total, totalPages };
  }

  async createCopyOperation(operation: InsertCopyOperation): Promise<CopyOperation> {
    const [op] = await getDb()
      .insert(copyOperations)
      .values(operation)
      .returning();
    return op;
  }

  async updateCopyOperation(id: string, updates: Partial<CopyOperation>): Promise<CopyOperation> {
    const [op] = await getDb()
      .update(copyOperations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(copyOperations.id, id))
      .returning();
    return op;
  }

  async getCopyOperation(id: string): Promise<CopyOperation | undefined> {
    const [op] = await getDb()
      .select()
      .from(copyOperations)
      .where(eq(copyOperations.id, id));
    return op;
  }

  async getUserCopyOperations(userId: string): Promise<CopyOperation[]> {
    return await getDb()
      .select()
      .from(copyOperations)
      .where(eq(copyOperations.userId, userId))
      .orderBy(desc(copyOperations.createdAt));
  }

  async getRecentCopyOperations(userId: string, limit: number): Promise<CopyOperation[]> {
    return await getDb()
      .select()
      .from(copyOperations)
      .where(eq(copyOperations.userId, userId))
      .orderBy(desc(copyOperations.createdAt))
      .limit(limit);
  }

  // Admin operations
  async getAllOperations(filters?: {
    userId?: string;
    status?: string;
    provider?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ operations: CopyOperation[]; total: number; totalPages: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;
    
    let query = getDb().select().from(copyOperations);
    const conditions = [];
    
    if (filters?.userId) {
      conditions.push(eq(copyOperations.userId, filters.userId));
    }
    if (filters?.status) {
      conditions.push(eq(copyOperations.status, filters.status));
    }
    if (filters?.provider) {
      conditions.push(eq(copyOperations.sourceProvider, filters.provider));
    }
    if (filters?.startDate) {
      conditions.push(sql`${copyOperations.createdAt} >= ${filters.startDate}`);
    }
    if (filters?.endDate) {
      conditions.push(sql`${copyOperations.createdAt} <= ${filters.endDate}`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const operations = await query
      .orderBy(desc(copyOperations.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Count total
    let countQuery = getDb().select({ count: sql<number>`count(*)` }).from(copyOperations);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as any;
    }
    const [{ count: total }] = await countQuery;
    
    const totalPages = Math.ceil(Number(total) / limit);
    
    return { operations, total: Number(total), totalPages };
  }

  async getSystemMetrics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalOperations: number;
    operationsToday: number;
    successRate: number;
    avgDuration: number;
    totalStorage: number;
    operationsByStatus: { status: string; count: number }[];
    operationsByProvider: { provider: string; count: number }[];
  }> {
    // Total users
    const [{ count: totalUsers }] = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(users);
    
    // Active users (with at least one operation)
    const [{ count: activeUsers }] = await getDb()
      .select({ count: sql<number>`count(DISTINCT user_id)` })
      .from(copyOperations);
    
    // Total operations
    const [{ count: totalOperations }] = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(copyOperations);
    
    // Operations today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [{ count: operationsToday }] = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(copyOperations)
      .where(sql`${copyOperations.createdAt} >= ${today}`);
    
    // Success rate
    const [{ count: completedOps }] = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(copyOperations)
      .where(eq(copyOperations.status, 'completed'));
    
    const successRate = Number(totalOperations) > 0 
      ? (Number(completedOps) / Number(totalOperations)) * 100 
      : 0;
    
    // Average duration
    const [{ avg: avgDuration }] = await getDb()
      .select({ avg: sql<number>`AVG(duration)` })
      .from(copyOperations)
      .where(eq(copyOperations.status, 'completed'));
    
    // Total storage
    const [{ sum: totalStorage }] = await getDb()
      .select({ sum: sql<number>`COALESCE(SUM(file_size), 0)` })
      .from(cloudFiles);
    
    // Operations by status
    const operationsByStatus = await getDb()
      .select({
        status: copyOperations.status,
        count: sql<number>`count(*)`,
      })
      .from(copyOperations)
      .groupBy(copyOperations.status);
    
    // Operations by provider
    const operationsByProvider = await getDb()
      .select({
        provider: copyOperations.sourceProvider,
        count: sql<number>`count(*)`,
      })
      .from(copyOperations)
      .where(sql`${copyOperations.sourceProvider} IS NOT NULL`)
      .groupBy(copyOperations.sourceProvider);
    
    return {
      totalUsers: Number(totalUsers),
      activeUsers: Number(activeUsers),
      totalOperations: Number(totalOperations),
      operationsToday: Number(operationsToday),
      successRate: Math.round(successRate * 100) / 100,
      avgDuration: Number(avgDuration) || 0,
      totalStorage: Number(totalStorage),
      operationsByStatus: operationsByStatus.map(row => ({ 
        status: row.status, 
        count: Number(row.count) 
      })),
      operationsByProvider: operationsByProvider.map(row => ({ 
        provider: row.provider || 'unknown', 
        count: Number(row.count) 
      })),
    };
  }

  async retryOperation(id: string): Promise<CopyOperation> {
    const [operation] = await getDb()
      .update(copyOperations)
      .set({
        status: 'pending',
        attempts: 0,
        nextRunAt: new Date(),
        errorMessage: null,
        lockedBy: null,
        lockedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(copyOperations.id, id))
      .returning();
    return operation;
  }

  // Job queue operations implementation  
  async claimPendingJobs(workerId: string, limit: number): Promise<CopyOperation[]> {
    // Atomic job claiming with proper limit and ordering using CTE
    const claimedJobs = await getDb().execute(sql`
      WITH cte AS (
        SELECT id FROM copy_operations 
        WHERE status = 'pending' 
        AND (next_run_at IS NULL OR next_run_at <= NOW())
        ORDER BY priority DESC, created_at ASC 
        FOR UPDATE SKIP LOCKED 
        LIMIT ${limit}
      )
      UPDATE copy_operations 
      SET 
        status = 'in_progress',
        locked_by = ${workerId},
        locked_at = NOW(),
        updated_at = NOW()
      FROM cte 
      WHERE copy_operations.id = cte.id 
      RETURNING copy_operations.*
    `);

    // Map raw results to proper CopyOperation objects
    return claimedJobs.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      sourceUrl: row.source_url,
      destinationFolderId: row.destination_folder_id,
      status: row.status,
      totalFiles: row.total_files,
      completedFiles: row.completed_files,
      errorMessage: row.error_message,
      sourceProvider: row.source_provider,
      destProvider: row.dest_provider,
      sourceFileId: row.source_file_id,
      sourceFilePath: row.source_file_path,
      fileName: row.file_name,
      itemType: row.item_type,
      priority: row.priority,
      attempts: row.attempts,
      maxRetries: row.max_retries,
      nextRunAt: row.next_run_at,
      lockedBy: row.locked_by,
      lockedAt: row.locked_at,
      cancelRequested: row.cancel_requested,
      progressPct: row.progress_pct,
      copiedFileId: row.copied_file_id,
      copiedFileName: row.copied_file_name,
      copiedFileUrl: row.copied_file_url,
      duration: row.duration,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })) as CopyOperation[];
  }

  async setJobInProgress(id: string, workerId: string): Promise<CopyOperation> {
    const [job] = await getDb()
      .update(copyOperations)
      .set({
        status: 'in_progress',
        lockedBy: workerId,
        lockedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(copyOperations.id, id))
      .returning();
    return job;
  }

  async setJobPendingWithBackoff(id: string, attempts: number, nextRunAt: Date, errorMessage?: string): Promise<CopyOperation> {
    const [job] = await getDb()
      .update(copyOperations)
      .set({
        status: 'pending',
        attempts,
        nextRunAt,
        errorMessage,
        lockedBy: null,
        lockedAt: null,
        updatedAt: new Date()
      })
      .where(eq(copyOperations.id, id))
      .returning();
    return job;
  }

  async completeJob(id: string, result: { copiedFileId?: string; copiedFileName?: string; copiedFileUrl?: string; duration?: number }): Promise<CopyOperation> {
    const [job] = await getDb()
      .update(copyOperations)
      .set({
        status: 'completed',
        copiedFileId: result.copiedFileId,
        copiedFileName: result.copiedFileName,
        copiedFileUrl: result.copiedFileUrl,
        duration: result.duration,
        progressPct: 100,
        lockedBy: null,
        lockedAt: null,
        updatedAt: new Date()
      })
      .where(eq(copyOperations.id, id))
      .returning();
    return job;
  }

  async failJob(id: string, errorMessage: string): Promise<CopyOperation> {
    const [job] = await getDb()
      .update(copyOperations)
      .set({
        status: 'failed',
        errorMessage,
        lockedBy: null,
        lockedAt: null,
        updatedAt: new Date()
      })
      .where(eq(copyOperations.id, id))
      .returning();
    return job;
  }

  async countUserRunningJobs(userId: string): Promise<number> {
    const [result] = await getDb()
      .select({ count: count() })
      .from(copyOperations)
      .where(
        and(
          eq(copyOperations.userId, userId),
          eq(copyOperations.status, 'in_progress')
        )
      );
    return result.count;
  }

  async setJobProgress(id: string, completedFiles: number, totalFiles: number, progressPct: number): Promise<CopyOperation> {
    const [job] = await getDb()
      .update(copyOperations)
      .set({
        completedFiles,
        totalFiles,
        progressPct,
        updatedAt: new Date()
      })
      .where(eq(copyOperations.id, id))
      .returning();
    return job;
  }

  async requestJobCancel(id: string): Promise<CopyOperation> {
    const [job] = await getDb()
      .update(copyOperations)
      .set({
        cancelRequested: true,
        updatedAt: new Date()
      })
      .where(eq(copyOperations.id, id))
      .returning();
    return job;
  }

  async reclaimStaleJobs(staleDurationMs: number): Promise<number> {
    const staleThreshold = new Date(Date.now() - staleDurationMs);
    
    // Reclaim jobs that are:
    // 1. in_progress AND lockedAt is old (worker crashed while processing)
    // 2. in_progress AND lockedAt is NULL (orphaned job without proper lock)
    // 3. in_progress AND updatedAt is old (fallback for jobs without lock info)
    const reclaimedJobs = await getDb()
      .update(copyOperations)
      .set({
        status: 'pending',
        lockedBy: null,
        lockedAt: null,
        nextRunAt: new Date(), // Retry immediately
        updatedAt: new Date()
      })
      .where(
        and(
          eq(copyOperations.status, 'in_progress'),
          or(
            lte(copyOperations.lockedAt, staleThreshold),
            isNull(copyOperations.lockedAt),
            lte(copyOperations.updatedAt, staleThreshold)
          )
        )
      )
      .returning();

    return reclaimedJobs.length;
  }

  async cleanupOldOperations(olderThanMs: number): Promise<number> {
    const cleanupThreshold = new Date(Date.now() - olderThanMs);
    
    const deletedOps = await getDb()
      .delete(copyOperations)
      .where(
        and(
          or(
            eq(copyOperations.status, 'completed'),
            eq(copyOperations.status, 'failed'),
            eq(copyOperations.status, 'cancelled')
          ),
          lte(copyOperations.updatedAt, cleanupThreshold)
        )
      )
      .returning();

    return deletedOps.length;
  }

  // Share request operations
  async createShareRequest(request: InsertShareRequest): Promise<ShareRequest> {
    const [shareRequest] = await getDb()
      .insert(shareRequests)
      .values(request)
      .returning();
    return shareRequest;
  }

  async getShareRequest(id: string): Promise<ShareRequest | undefined> {
    const [shareRequest] = await getDb()
      .select()
      .from(shareRequests)
      .where(eq(shareRequests.id, id));
    return shareRequest;
  }

  async updateShareRequest(id: string, updates: Partial<ShareRequest>): Promise<ShareRequest> {
    const [shareRequest] = await getDb()
      .update(shareRequests)
      .set(updates)
      .where(eq(shareRequests.id, id))
      .returning();
    return shareRequest;
  }

  async getUserInbox(userId: string): Promise<ShareRequest[]> {
    return await getDb()
      .select()
      .from(shareRequests)
      .where(eq(shareRequests.recipientId, userId))
      .orderBy(desc(shareRequests.createdAt));
  }

  async getUserOutbox(userId: string): Promise<ShareRequest[]> {
    return await getDb()
      .select()
      .from(shareRequests)
      .where(eq(shareRequests.senderId, userId))
      .orderBy(desc(shareRequests.createdAt));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await getDb()
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async searchUsers(query: string, excludeUserId: string): Promise<User[]> {
    const lowerQuery = query.toLowerCase();
    const results = await getDb()
      .select()
      .from(users)
      .where(
        and(
          ne(users.id, excludeUserId),
          or(
            ilike(users.email, `%${lowerQuery}%`),
            ilike(users.firstName, `%${lowerQuery}%`),
            ilike(users.lastName, `%${lowerQuery}%`)
          )
        )
      )
      .limit(10);
    return results;
  }

  async createShareEvent(event: InsertShareEvent): Promise<ShareEvent> {
    const [shareEvent] = await getDb()
      .insert(shareEvents)
      .values(event)
      .returning();
    return shareEvent;
  }

  async getShareEvents(shareRequestId: string): Promise<ShareEvent[]> {
    return await getDb()
      .select()
      .from(shareEvents)
      .where(eq(shareEvents.shareRequestId, shareRequestId))
      .orderBy(desc(shareEvents.createdAt));
  }

  // Scheduled tasks operations
  async createScheduledTask(task: InsertScheduledTask): Promise<ScheduledTask> {
    const [scheduledTask] = await getDb()
      .insert(scheduledTasks)
      .values(task)
      .returning();
    return scheduledTask;
  }

  async getScheduledTask(id: string): Promise<ScheduledTask | undefined> {
    const [task] = await getDb()
      .select()
      .from(scheduledTasks)
      .where(eq(scheduledTasks.id, id));
    return task;
  }

  async getUserScheduledTasks(userId: string): Promise<ScheduledTask[]> {
    return await getDb()
      .select()
      .from(scheduledTasks)
      .where(and(
        eq(scheduledTasks.userId, userId),
        ne(scheduledTasks.status, 'deleted')
      ))
      .orderBy(desc(scheduledTasks.createdAt));
  }

  async updateScheduledTask(id: string, updates: Partial<ScheduledTask>): Promise<ScheduledTask> {
    const [task] = await getDb()
      .update(scheduledTasks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(scheduledTasks.id, id))
      .returning();
    return task;
  }

  async deleteScheduledTask(id: string): Promise<void> {
    await getDb()
      .update(scheduledTasks)
      .set({ status: 'deleted', updatedAt: new Date() })
      .where(eq(scheduledTasks.id, id));
  }

  async getTasksDueForExecution(): Promise<ScheduledTask[]> {
    const now = new Date();
    return await getDb()
      .select()
      .from(scheduledTasks)
      .where(and(
        eq(scheduledTasks.status, 'active'),
        lte(scheduledTasks.nextRunAt, now)
      ))
      .orderBy(asc(scheduledTasks.nextRunAt));
  }

  async pauseScheduledTask(id: string): Promise<ScheduledTask> {
    const [task] = await getDb()
      .update(scheduledTasks)
      .set({ status: 'paused', updatedAt: new Date() })
      .where(eq(scheduledTasks.id, id))
      .returning();
    return task;
  }

  async resumeScheduledTask(id: string): Promise<ScheduledTask> {
    const [task] = await getDb()
      .update(scheduledTasks)
      .set({ status: 'active', updatedAt: new Date() })
      .where(eq(scheduledTasks.id, id))
      .returning();
    return task;
  }

  // Scheduled task runs
  async createScheduledTaskRun(run: InsertScheduledTaskRun): Promise<ScheduledTaskRun> {
    const [taskRun] = await getDb()
      .insert(scheduledTaskRuns)
      .values(run)
      .returning();
    return taskRun;
  }

  async getTaskRuns(taskId: string, limit: number = 50): Promise<ScheduledTaskRun[]> {
    return await getDb()
      .select()
      .from(scheduledTaskRuns)
      .where(eq(scheduledTaskRuns.scheduledTaskId, taskId))
      .orderBy(desc(scheduledTaskRuns.createdAt))
      .limit(limit);
  }

  async updateTaskRun(id: string, updates: Partial<ScheduledTaskRun>): Promise<ScheduledTaskRun> {
    const [taskRun] = await getDb()
      .update(scheduledTaskRuns)
      .set(updates)
      .where(eq(scheduledTaskRuns.id, id))
      .returning();
    return taskRun;
  }

  // Sync file registry operations (for cumulative sync)
  async createSyncFileRecord(record: InsertSyncFileRegistry): Promise<SyncFileRegistry> {
    const [syncFile] = await getDb()
      .insert(syncFileRegistry)
      .values(record)
      .returning();
    return syncFile;
  }

  async getSyncFilesByTask(taskId: string): Promise<SyncFileRegistry[]> {
    return await getDb()
      .select()
      .from(syncFileRegistry)
      .where(eq(syncFileRegistry.scheduledTaskId, taskId));
  }

  async getSyncFileBySourceId(taskId: string, sourceFileId: string): Promise<SyncFileRegistry | undefined> {
    const [syncFile] = await getDb()
      .select()
      .from(syncFileRegistry)
      .where(and(
        eq(syncFileRegistry.scheduledTaskId, taskId),
        eq(syncFileRegistry.sourceFileId, sourceFileId)
      ));
    return syncFile;
  }

  async updateSyncFileRecord(id: string, updates: Partial<SyncFileRegistry>): Promise<SyncFileRegistry> {
    const [syncFile] = await getDb()
      .update(syncFileRegistry)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(syncFileRegistry.id, id))
      .returning();
    return syncFile;
  }

  async deleteSyncFilesByTask(taskId: string): Promise<number> {
    const result = await getDb()
      .delete(syncFileRegistry)
      .where(eq(syncFileRegistry.scheduledTaskId, taskId))
      .returning();
    return result.length;
  }
}

// Memory storage for development when DATABASE_URL is not available
class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private cloudFiles: Map<string, CloudFile> = new Map();
  private copyOperations: Map<string, CopyOperation> = new Map();
  private shareRequestsMap: Map<string, ShareRequest> = new Map();
  private shareEventsMap: Map<string, ShareEvent> = new Map();
  private scheduledTasksMap: Map<string, ScheduledTask> = new Map();
  private scheduledTaskRunsMap: Map<string, ScheduledTaskRun> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const user: User = {
      ...existingUser,
      ...userData,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
      googleAccessToken: existingUser?.googleAccessToken || null,
      googleRefreshToken: existingUser?.googleRefreshToken || null,
      googleTokenExpiry: existingUser?.googleTokenExpiry || null,
      googleConnected: existingUser?.googleConnected || false,
      dropboxAccessToken: existingUser?.dropboxAccessToken || null,
      dropboxRefreshToken: existingUser?.dropboxRefreshToken || null,
      dropboxTokenExpiry: existingUser?.dropboxTokenExpiry || null,
      dropboxConnected: existingUser?.dropboxConnected || false,
    };
    this.users.set(userData.id, user);
    return user;
  }

  async updateUser(userId: string, updates: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
    membershipPlan?: string;
    membershipExpiry?: Date;
    membershipTrialUsed?: boolean;
  }): Promise<User> {
    const existingUser = this.users.get(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    // Filter out undefined values to avoid overwriting existing data
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    
    const user: User = {
      ...existingUser,
      ...cleanUpdates,
      updatedAt: new Date(),
    };
    this.users.set(userId, user);
    return user;
  }

  async updateUserGoogleTokens(userId: string, tokens: {
    accessToken: string | null;
    refreshToken?: string | null;
    expiry?: Date | null;
  }): Promise<User> {
    const existingUser = this.users.get(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const user: User = {
      ...existingUser,
      googleAccessToken: tokens.accessToken,
      googleRefreshToken: tokens.refreshToken || null,
      googleTokenExpiry: tokens.expiry || null,
      googleConnected: tokens.accessToken ? true : false,
      updatedAt: new Date(),
    };
    this.users.set(userId, user);
    return user;
  }

  async updateUserDropboxTokens(userId: string, tokens: {
    accessToken: string | null;
    refreshToken?: string | null;
    expiry?: Date | null;
  }): Promise<User> {
    const existingUser = this.users.get(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const user: User = {
      ...existingUser,
      dropboxAccessToken: tokens.accessToken,
      dropboxRefreshToken: tokens.refreshToken || null,
      dropboxTokenExpiry: tokens.expiry || null,
      dropboxConnected: !!(tokens.accessToken || tokens.refreshToken),
      updatedAt: new Date(),
    };
    this.users.set(userId, user);
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeData: {
    customerId?: string;
    subscriptionId?: string;
  }): Promise<User> {
    const existingUser = this.users.get(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const user: User = {
      ...existingUser,
      stripeCustomerId: stripeData.customerId || existingUser.stripeCustomerId,
      stripeSubscriptionId: stripeData.subscriptionId || existingUser.stripeSubscriptionId,
      updatedAt: new Date(),
    };
    this.users.set(userId, user);
    return user;
  }

  // Admin user operations
  async getAllUsers(page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number; totalPages: number }> {
    const allUsers = Array.from(this.users.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const total = allUsers.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const users = allUsers.slice(offset, offset + limit);
    
    return { users, total, totalPages };
  }

  async updateUserLimits(userId: string, limits: {
    maxStorageBytes?: number;
    maxConcurrentOperations?: number;
    maxDailyOperations?: number;
  }): Promise<User> {
    const existingUser = this.users.get(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const cleanLimits = Object.fromEntries(
      Object.entries(limits).filter(([, value]) => value !== undefined)
    );
    
    const user: User = {
      ...existingUser,
      ...cleanLimits,
      updatedAt: new Date(),
    };
    this.users.set(userId, user);
    return user;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const existingUser = this.users.get(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const user: User = {
      ...existingUser,
      role,
      updatedAt: new Date(),
    };
    this.users.set(userId, user);
    return user;
  }

  async suspendUser(userId: string): Promise<User> {
    const existingUser = this.users.get(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const user: User = {
      ...existingUser,
      isActive: false,
      updatedAt: new Date(),
    };
    this.users.set(userId, user);
    return user;
  }

  async activateUser(userId: string): Promise<User> {
    const existingUser = this.users.get(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const user: User = {
      ...existingUser,
      isActive: true,
      updatedAt: new Date(),
    };
    this.users.set(userId, user);
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    this.users.delete(userId);
  }

  async getUserActivity(userId: string): Promise<{ operations: CopyOperation[]; files: CloudFile[] }> {
    const operations = Array.from(this.copyOperations.values())
      .filter(op => op.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50);
    
    const files = Array.from(this.cloudFiles.values())
      .filter(file => file.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50);
    
    return { operations, files };
  }

  async createCloudFile(cloudFile: InsertCloudFile): Promise<CloudFile> {
    const file: CloudFile = {
      ...cloudFile,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    this.cloudFiles.set(file.id, file);
    return file;
  }

  async getUserCloudFiles(
    userId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{ files: CloudFile[]; total: number; totalPages: number }> {
    const userFiles = Array.from(this.cloudFiles.values())
      .filter(file => file.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const total = userFiles.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const files = userFiles.slice(offset, offset + limit);
    
    return { files, total, totalPages };
  }

  async createCopyOperation(operation: InsertCopyOperation): Promise<CopyOperation> {
    const op: CopyOperation = {
      ...operation,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.copyOperations.set(op.id, op);
    return op;
  }

  async updateCopyOperation(id: string, updates: Partial<CopyOperation>): Promise<CopyOperation> {
    const existingOp = this.copyOperations.get(id);
    if (!existingOp) {
      throw new Error('Copy operation not found');
    }
    
    const op: CopyOperation = {
      ...existingOp,
      ...updates,
      updatedAt: new Date(),
    };
    this.copyOperations.set(id, op);
    return op;
  }

  async getCopyOperation(id: string): Promise<CopyOperation | undefined> {
    return this.copyOperations.get(id);
  }

  async getUserCopyOperations(userId: string): Promise<CopyOperation[]> {
    return Array.from(this.copyOperations.values())
      .filter(op => op.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRecentCopyOperations(userId: string, limit: number): Promise<CopyOperation[]> {
    return Array.from(this.copyOperations.values())
      .filter(op => op.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Admin operations
  async getAllOperations(filters?: {
    userId?: string;
    status?: string;
    provider?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ operations: CopyOperation[]; total: number; totalPages: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;
    
    let filteredOps = Array.from(this.copyOperations.values());
    
    if (filters?.userId) {
      filteredOps = filteredOps.filter(op => op.userId === filters.userId);
    }
    if (filters?.status) {
      filteredOps = filteredOps.filter(op => op.status === filters.status);
    }
    if (filters?.provider) {
      filteredOps = filteredOps.filter(op => op.sourceProvider === filters.provider);
    }
    if (filters?.startDate) {
      filteredOps = filteredOps.filter(op => op.createdAt >= filters.startDate!);
    }
    if (filters?.endDate) {
      filteredOps = filteredOps.filter(op => op.createdAt <= filters.endDate!);
    }
    
    const total = filteredOps.length;
    const totalPages = Math.ceil(total / limit);
    
    const operations = filteredOps
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
    
    return { operations, total, totalPages };
  }

  async getSystemMetrics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalOperations: number;
    operationsToday: number;
    successRate: number;
    avgDuration: number;
    totalStorage: number;
    operationsByStatus: { status: string; count: number }[];
    operationsByProvider: { provider: string; count: number }[];
  }> {
    const allUsers = Array.from(this.users.values());
    const allOperations = Array.from(this.copyOperations.values());
    const allFiles = Array.from(this.cloudFiles.values());
    
    // Total users
    const totalUsers = allUsers.length;
    
    // Active users (with at least one operation)
    const activeUsers = new Set(allOperations.map(op => op.userId)).size;
    
    // Total operations
    const totalOperations = allOperations.length;
    
    // Operations today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const operationsToday = allOperations.filter(op => op.createdAt >= today).length;
    
    // Success rate
    const completedOps = allOperations.filter(op => op.status === 'completed').length;
    const successRate = totalOperations > 0 
      ? (completedOps / totalOperations) * 100 
      : 0;
    
    // Average duration
    const completedWithDuration = allOperations.filter(op => op.status === 'completed' && op.duration);
    const avgDuration = completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, op) => sum + (op.duration || 0), 0) / completedWithDuration.length
      : 0;
    
    // Total storage
    const totalStorage = allFiles.reduce((sum, file) => sum + (file.fileSize || 0), 0);
    
    // Operations by status
    const statusCounts: Record<string, number> = {};
    allOperations.forEach(op => {
      statusCounts[op.status] = (statusCounts[op.status] || 0) + 1;
    });
    const operationsByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
    
    // Operations by provider
    const providerCounts: Record<string, number> = {};
    allOperations.forEach(op => {
      if (op.sourceProvider) {
        providerCounts[op.sourceProvider] = (providerCounts[op.sourceProvider] || 0) + 1;
      }
    });
    const operationsByProvider = Object.entries(providerCounts).map(([provider, count]) => ({ provider, count }));
    
    return {
      totalUsers,
      activeUsers,
      totalOperations,
      operationsToday,
      successRate: Math.round(successRate * 100) / 100,
      avgDuration,
      totalStorage,
      operationsByStatus,
      operationsByProvider,
    };
  }

  async retryOperation(id: string): Promise<CopyOperation> {
    const operation = this.copyOperations.get(id);
    if (!operation) {
      throw new Error('Operation not found');
    }
    
    const updated: CopyOperation = {
      ...operation,
      status: 'pending',
      attempts: 0,
      nextRunAt: new Date(),
      errorMessage: null,
      lockedBy: null,
      lockedAt: null,
      updatedAt: new Date(),
    };
    this.copyOperations.set(id, updated);
    return updated;
  }

  // Job queue operations implementation for memory storage
  async claimPendingJobs(workerId: string, limit: number): Promise<CopyOperation[]> {
    const now = new Date();
    const allOps = Array.from(this.copyOperations.values());
    console.log(`🔍 claimPendingJobs: Total operations in memory: ${allOps.length}`);
    if (allOps.length > 0) {
      console.log(`🔍 Operations status breakdown:`, allOps.map(op => ({ id: op.id.slice(0, 8), status: op.status, nextRunAt: op.nextRunAt })));
    }
    const readyJobs = allOps
      .filter(op => 
        op.status === 'pending' && 
        (!op.nextRunAt || op.nextRunAt <= now)
      )
      .sort((a, b) => {
        // Sort by priority desc, then by createdAt asc
        if (a.priority !== b.priority) {
          return (b.priority || 0) - (a.priority || 0);
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      })
      .slice(0, limit);

    // Atomically mark them as in progress
    const claimedJobs: CopyOperation[] = [];
    for (const job of readyJobs) {
      // Double-check the job is still pending (for consistency with DB implementation)
      const currentJob = this.copyOperations.get(job.id);
      if (currentJob && currentJob.status === 'pending') {
        const updated: CopyOperation = {
          ...currentJob,
          status: 'in_progress',
          lockedBy: workerId,
          lockedAt: now,
          updatedAt: now
        };
        this.copyOperations.set(job.id, updated);
        claimedJobs.push(updated);
      }
    }

    return claimedJobs;
  }

  async setJobInProgress(id: string, workerId: string): Promise<CopyOperation> {
    const job = this.copyOperations.get(id);
    if (!job) {
      throw new Error('Job not found');
    }

    const updated: CopyOperation = {
      ...job,
      status: 'in_progress',
      lockedBy: workerId,
      lockedAt: new Date(),
      updatedAt: new Date()
    };
    this.copyOperations.set(id, updated);
    return updated;
  }

  async setJobPendingWithBackoff(id: string, attempts: number, nextRunAt: Date, errorMessage?: string): Promise<CopyOperation> {
    const job = this.copyOperations.get(id);
    if (!job) {
      throw new Error('Job not found');
    }

    const updated: CopyOperation = {
      ...job,
      status: 'pending',
      attempts,
      nextRunAt,
      errorMessage: errorMessage || null,
      lockedBy: null,
      lockedAt: null,
      updatedAt: new Date()
    };
    this.copyOperations.set(id, updated);
    return updated;
  }

  async completeJob(id: string, result: { copiedFileId?: string; copiedFileName?: string; copiedFileUrl?: string; duration?: number }): Promise<CopyOperation> {
    const job = this.copyOperations.get(id);
    if (!job) {
      throw new Error('Job not found');
    }

    const updated: CopyOperation = {
      ...job,
      status: 'completed',
      copiedFileId: result.copiedFileId || null,
      copiedFileName: result.copiedFileName || null,
      copiedFileUrl: result.copiedFileUrl || null,
      duration: result.duration || null,
      progressPct: 100,
      lockedBy: null,
      lockedAt: null,
      updatedAt: new Date()
    };
    this.copyOperations.set(id, updated);
    return updated;
  }

  async failJob(id: string, errorMessage: string): Promise<CopyOperation> {
    const job = this.copyOperations.get(id);
    if (!job) {
      throw new Error('Job not found');
    }

    const updated: CopyOperation = {
      ...job,
      status: 'failed',
      errorMessage,
      lockedBy: null,
      lockedAt: null,
      updatedAt: new Date()
    };
    this.copyOperations.set(id, updated);
    return updated;
  }

  async countUserRunningJobs(userId: string): Promise<number> {
    return Array.from(this.copyOperations.values())
      .filter(op => op.userId === userId && op.status === 'in_progress')
      .length;
  }

  async setJobProgress(id: string, completedFiles: number, totalFiles: number, progressPct: number): Promise<CopyOperation> {
    const job = this.copyOperations.get(id);
    if (!job) {
      throw new Error('Job not found');
    }

    const updated: CopyOperation = {
      ...job,
      completedFiles,
      totalFiles,
      progressPct,
      updatedAt: new Date()
    };
    this.copyOperations.set(id, updated);
    return updated;
  }

  async requestJobCancel(id: string): Promise<CopyOperation> {
    const job = this.copyOperations.get(id);
    if (!job) {
      throw new Error('Job not found');
    }

    const updated: CopyOperation = {
      ...job,
      cancelRequested: true,
      updatedAt: new Date()
    };
    this.copyOperations.set(id, updated);
    return updated;
  }

  async reclaimStaleJobs(staleDurationMs: number): Promise<number> {
    const staleThreshold = new Date(Date.now() - staleDurationMs);
    let reclaimedCount = 0;

    for (const [id, job] of this.copyOperations.entries()) {
      // Reclaim jobs that are:
      // 1. in_progress AND lockedAt is old (worker crashed while processing)
      // 2. in_progress AND lockedAt is NULL (orphaned job without proper lock)
      // 3. in_progress AND updatedAt is old (fallback for jobs without lock info)
      const isStaleByLock = job.lockedAt && job.lockedAt <= staleThreshold;
      const hasNoLock = !job.lockedAt;
      const isStaleByUpdate = job.updatedAt && job.updatedAt <= staleThreshold;
      
      if (job.status === 'in_progress' && (isStaleByLock || hasNoLock || isStaleByUpdate)) {
        const updated: CopyOperation = {
          ...job,
          status: 'pending',
          lockedBy: null,
          lockedAt: null,
          nextRunAt: new Date(), // Retry immediately
          updatedAt: new Date()
        };
        this.copyOperations.set(id, updated);
        reclaimedCount++;
      }
    }

    return reclaimedCount;
  }

  async cleanupOldOperations(olderThanMs: number): Promise<number> {
    const cleanupThreshold = new Date(Date.now() - olderThanMs);
    let deletedCount = 0;

    for (const [id, job] of this.copyOperations.entries()) {
      if ((job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') &&
          job.updatedAt && job.updatedAt <= cleanupThreshold) {
        this.copyOperations.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  // Share request operations
  async createShareRequest(request: InsertShareRequest): Promise<ShareRequest> {
    const id = crypto.randomUUID();
    const shareRequest: ShareRequest = {
      id,
      ...request,
      status: request.status || 'pending',
      createdAt: new Date(),
      respondedAt: null,
      expiresAt: request.expiresAt || null,
    };
    this.shareRequestsMap.set(id, shareRequest);
    return shareRequest;
  }

  async getShareRequest(id: string): Promise<ShareRequest | undefined> {
    return this.shareRequestsMap.get(id);
  }

  async updateShareRequest(id: string, updates: Partial<ShareRequest>): Promise<ShareRequest> {
    const existing = this.shareRequestsMap.get(id);
    if (!existing) {
      throw new Error('Share request not found');
    }
    const updated = { ...existing, ...updates };
    this.shareRequestsMap.set(id, updated);
    return updated;
  }

  async getUserInbox(userId: string): Promise<ShareRequest[]> {
    return Array.from(this.shareRequestsMap.values())
      .filter(sr => sr.recipientId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getUserOutbox(userId: string): Promise<ShareRequest[]> {
    return Array.from(this.shareRequestsMap.values())
      .filter(sr => sr.senderId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async searchUsers(query: string, excludeUserId: string): Promise<User[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.users.values())
      .filter(u => 
        u.id !== excludeUserId &&
        (
          u.email?.toLowerCase().includes(lowerQuery) ||
          u.firstName?.toLowerCase().includes(lowerQuery) ||
          u.lastName?.toLowerCase().includes(lowerQuery)
        )
      )
      .slice(0, 10);
  }

  async createShareEvent(event: InsertShareEvent): Promise<ShareEvent> {
    const id = crypto.randomUUID();
    const shareEvent: ShareEvent = {
      id,
      ...event,
      createdAt: new Date(),
    };
    this.shareEventsMap.set(id, shareEvent);
    return shareEvent;
  }

  async getShareEvents(shareRequestId: string): Promise<ShareEvent[]> {
    return Array.from(this.shareEventsMap.values())
      .filter(se => se.shareRequestId === shareRequestId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  // Scheduled tasks operations
  async createScheduledTask(task: InsertScheduledTask): Promise<ScheduledTask> {
    const id = crypto.randomUUID();
    const scheduledTask: ScheduledTask = {
      id,
      ...task,
      status: task.status || 'active',
      lastRunAt: null,
      lastRunStatus: null,
      lastRunError: null,
      nextRunAt: null,
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.scheduledTasksMap.set(id, scheduledTask);
    return scheduledTask;
  }

  async getScheduledTask(id: string): Promise<ScheduledTask | undefined> {
    return this.scheduledTasksMap.get(id);
  }

  async getUserScheduledTasks(userId: string): Promise<ScheduledTask[]> {
    return Array.from(this.scheduledTasksMap.values())
      .filter(t => t.userId === userId && t.status !== 'deleted')
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updateScheduledTask(id: string, updates: Partial<ScheduledTask>): Promise<ScheduledTask> {
    const existing = this.scheduledTasksMap.get(id);
    if (!existing) {
      throw new Error('Scheduled task not found');
    }
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.scheduledTasksMap.set(id, updated);
    return updated;
  }

  async deleteScheduledTask(id: string): Promise<void> {
    const existing = this.scheduledTasksMap.get(id);
    if (existing) {
      existing.status = 'deleted';
      existing.updatedAt = new Date();
      this.scheduledTasksMap.set(id, existing);
    }
  }

  async getTasksDueForExecution(): Promise<ScheduledTask[]> {
    const now = new Date();
    return Array.from(this.scheduledTasksMap.values())
      .filter(t => t.status === 'active' && t.nextRunAt && t.nextRunAt <= now)
      .sort((a, b) => (a.nextRunAt?.getTime() || 0) - (b.nextRunAt?.getTime() || 0));
  }

  async pauseScheduledTask(id: string): Promise<ScheduledTask> {
    return this.updateScheduledTask(id, { status: 'paused' });
  }

  async resumeScheduledTask(id: string): Promise<ScheduledTask> {
    return this.updateScheduledTask(id, { status: 'active' });
  }

  // Scheduled task runs
  async createScheduledTaskRun(run: InsertScheduledTaskRun): Promise<ScheduledTaskRun> {
    const id = crypto.randomUUID();
    const taskRun: ScheduledTaskRun = {
      id,
      ...run,
      filesProcessed: run.filesProcessed || 0,
      filesFailed: run.filesFailed || 0,
      bytesTransferred: run.bytesTransferred || 0,
      createdAt: new Date(),
    };
    this.scheduledTaskRunsMap.set(id, taskRun);
    return taskRun;
  }

  async getTaskRuns(taskId: string, limit: number = 50): Promise<ScheduledTaskRun[]> {
    return Array.from(this.scheduledTaskRunsMap.values())
      .filter(r => r.scheduledTaskId === taskId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async updateTaskRun(id: string, updates: Partial<ScheduledTaskRun>): Promise<ScheduledTaskRun> {
    const existing = this.scheduledTaskRunsMap.get(id);
    if (!existing) {
      throw new Error('Task run not found');
    }
    const updated = { ...existing, ...updates };
    this.scheduledTaskRunsMap.set(id, updated);
    return updated;
  }

  // File conflicts (for mirror sync conflict resolution)
  private fileConflictsMap: Map<string, FileConflict> = new Map();

  async createFileConflict(conflict: InsertFileConflict): Promise<FileConflict> {
    const id = crypto.randomUUID();
    const fileConflict: FileConflict = {
      id,
      ...conflict,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.fileConflictsMap.set(id, fileConflict);
    return fileConflict;
  }

  async getFileConflicts(taskId: string): Promise<FileConflict[]> {
    return Array.from(this.fileConflictsMap.values())
      .filter(fc => fc.scheduledTaskId === taskId && !fc.resolvedAt);
  }

  async resolveFileConflict(
    conflictId: string,
    resolution: 'keep_newer' | 'keep_source' | 'keep_target',
    details?: string
  ): Promise<FileConflict> {
    const conflict = this.fileConflictsMap.get(conflictId);
    if (!conflict) throw new Error('Conflict not found');
    const updated = { ...conflict, resolution, resolvedAt: new Date(), resolutionDetails: details || '', updatedAt: new Date() };
    this.fileConflictsMap.set(conflictId, updated);
    return updated;
  }

  // Sync file registry operations (for cumulative sync)
  private syncFileRegistryMap: Map<string, SyncFileRegistry> = new Map();

  async createSyncFileRecord(record: InsertSyncFileRegistry): Promise<SyncFileRegistry> {
    const id = crypto.randomUUID();
    const syncFile: SyncFileRegistry = {
      id,
      ...record,
      lastSyncedAt: new Date(),
      syncStatus: record.syncStatus || 'synced',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.syncFileRegistryMap.set(id, syncFile);
    return syncFile;
  }

  async getSyncFilesByTask(taskId: string): Promise<SyncFileRegistry[]> {
    return Array.from(this.syncFileRegistryMap.values())
      .filter(sf => sf.scheduledTaskId === taskId);
  }

  async getSyncFileBySourceId(taskId: string, sourceFileId: string): Promise<SyncFileRegistry | undefined> {
    return Array.from(this.syncFileRegistryMap.values())
      .find(sf => sf.scheduledTaskId === taskId && sf.sourceFileId === sourceFileId);
  }

  async updateSyncFileRecord(id: string, updates: Partial<SyncFileRegistry>): Promise<SyncFileRegistry> {
    const existing = this.syncFileRegistryMap.get(id);
    if (!existing) {
      throw new Error('Sync file record not found');
    }
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.syncFileRegistryMap.set(id, updated);
    return updated;
  }

  async deleteSyncFilesByTask(taskId: string): Promise<number> {
    const toDelete = Array.from(this.syncFileRegistryMap.entries())
      .filter(([, sf]) => sf.scheduledTaskId === taskId);
    toDelete.forEach(([id]) => this.syncFileRegistryMap.delete(id));
    return toDelete.length;
  }

  // Duplicate detection operations
  async createFileHash(hash: InsertFileHash): Promise<FileHash> {
    const [created] = await getDb()
      .insert(fileHashes)
      .values(hash)
      .returning();
    return created;
  }

  async findFilesByMetadata(userId: string, fileName: string, fileSize: number, provider?: string): Promise<FileHash[]> {
    let query = getDb()
      .select()
      .from(fileHashes)
      .where(and(
        eq(fileHashes.userId, userId),
        eq(fileHashes.fileName, fileName),
        eq(fileHashes.fileSize, fileSize)
      ));
    
    if (provider) {
      query = query.where(and(
        eq(fileHashes.userId, userId),
        eq(fileHashes.fileName, fileName),
        eq(fileHashes.fileSize, fileSize),
        eq(fileHashes.provider, provider)
      ));
    }
    
    return await query;
  }

  async findFileByHash(userId: string, contentHash: string): Promise<FileHash | undefined> {
    const [hash] = await getDb()
      .select()
      .from(fileHashes)
      .where(and(
        eq(fileHashes.userId, userId),
        eq(fileHashes.contentHash, contentHash)
      ));
    return hash;
  }

  // File conflict methods (for mirror sync)
  async createFileConflict(conflict: InsertFileConflict): Promise<FileConflict> {
    const [result] = await getDb()
      .insert(fileConflicts)
      .values(conflict)
      .returning();
    return result;
  }

  async getFileConflicts(taskId: string): Promise<FileConflict[]> {
    return await getDb()
      .select()
      .from(fileConflicts)
      .where(and(
        eq(fileConflicts.scheduledTaskId, taskId),
        isNull(fileConflicts.resolvedAt)
      ));
  }

  async resolveFileConflict(
    conflictId: string,
    resolution: 'keep_newer' | 'keep_source' | 'keep_target',
    details?: string
  ): Promise<FileConflict> {
    const [result] = await getDb()
      .update(fileConflicts)
      .set({
        resolution,
        resolvedAt: new Date(),
        resolutionDetails: details || '',
        updatedAt: new Date(),
      })
      .where(eq(fileConflicts.id, conflictId))
      .returning();
    return result;
  }
}

console.log('💾 Using memory storage - data will be lost on restart (development mode)');
export const storage: IStorage = new MemoryStorage();
