import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  bigint
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - compatible with both Replit Auth and Supabase Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Authentication provider - 'replit' or 'supabase'
  authProvider: varchar("auth_provider").notNull().default('replit'),
  // User role - 'admin' or 'user'
  role: varchar("role").notNull().default('user'),
  // User limits
  maxStorageBytes: bigint("max_storage_bytes", { mode: "number" }).default(16106127360), // 15 GB default
  maxConcurrentOperations: integer("max_concurrent_operations").default(5),
  maxDailyOperations: integer("max_daily_operations").default(100),
  isActive: boolean("is_active").default(true),
  // Google OAuth fields
  googleAccessToken: text("google_access_token"),
  googleRefreshToken: text("google_refresh_token"),
  googleTokenExpiry: timestamp("google_token_expiry"),
  googleConnected: boolean("google_connected").default(false),
  // Dropbox OAuth fields
  dropboxAccessToken: text("dropbox_access_token"),
  dropboxRefreshToken: text("dropbox_refresh_token"),
  dropboxTokenExpiry: timestamp("dropbox_token_expiry"),
  dropboxConnected: boolean("dropbox_connected").default(false),
  // Membership fields
  membershipPlan: varchar("membership_plan").notNull().default('free'), // 'free', 'pro'
  membershipExpiry: timestamp("membership_expiry"),
  membershipTrialUsed: boolean("membership_trial_used").default(false),
  // Stripe integration fields - for Stripe payment processing
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
});

// Cloud files table for tracking copied files from all providers (Google Drive, Dropbox, etc.)
export const cloudFiles = pgTable("cloud_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  provider: varchar("provider").notNull(), // 'google' | 'dropbox' | 'onedrive' etc.
  originalFileId: varchar("original_file_id").notNull(),
  copiedFileId: varchar("copied_file_id").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: varchar("mime_type"),
  fileSize: integer("file_size"),
  sourceUrl: text("source_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Copy operations for tracking progress and job queue
export const copyOperations = pgTable("copy_operations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sourceUrl: text("source_url").notNull(),
  destinationFolderId: text("destination_folder_id").notNull().default('root'), // Google Drive folder ID
  status: varchar("status").notNull(), // 'pending', 'in_progress', 'completed', 'failed', 'cancelled'
  totalFiles: integer("total_files").default(0),
  completedFiles: integer("completed_files").default(0),
  errorMessage: text("error_message"),
  
  // Queue system fields
  sourceProvider: varchar("source_provider"), // 'google' | 'dropbox'
  destProvider: varchar("dest_provider"), // 'google' | 'dropbox'
  sourceFileId: varchar("source_file_id"), // For Google Drive
  sourceFilePath: text("source_file_path"), // For Dropbox
  fileName: text("file_name"), // Original file name
  itemType: varchar("item_type").default('file'), // 'file' | 'folder'
  priority: integer("priority").default(0),
  attempts: integer("attempts").default(0),
  maxRetries: integer("max_retries").default(5),
  nextRunAt: timestamp("next_run_at"),
  lockedBy: varchar("locked_by"), // Instance/worker ID
  lockedAt: timestamp("locked_at"),
  cancelRequested: boolean("cancel_requested").default(false),
  progressPct: integer("progress_pct").default(0),
  
  // Result fields
  copiedFileId: varchar("copied_file_id"), // ID del archivo/carpeta copiado
  copiedFileName: text("copied_file_name"), // Nombre del archivo/carpeta copiado
  copiedFileUrl: text("copied_file_url"), // Enlace directo al archivo/carpeta copiado
  duration: integer("duration"), // Duración en segundos
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertCloudFile = typeof cloudFiles.$inferInsert;
export type CloudFile = typeof cloudFiles.$inferSelect;

export type InsertCopyOperation = typeof copyOperations.$inferInsert;
export type CopyOperation = typeof copyOperations.$inferSelect;

// File sharing between users
export const shareRequests = pgTable("share_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientId: varchar("recipient_id").notNull().references(() => users.id),
  recipientEmail: varchar("recipient_email").notNull(),
  
  // File information
  provider: varchar("provider").notNull(), // 'google' | 'dropbox'
  fileId: varchar("file_id").notNull(),
  filePath: text("file_path"),
  fileName: text("file_name").notNull(),
  fileType: varchar("file_type").notNull(), // 'file' | 'folder'
  fileSize: bigint("file_size", { mode: "number" }),
  mimeType: varchar("mime_type"),
  
  // Share details
  message: text("message"),
  status: varchar("status").notNull().default('pending'), // 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled'
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  expiresAt: timestamp("expires_at"),
});

// Share events for audit trail
export const shareEvents = pgTable("share_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shareRequestId: varchar("share_request_id").notNull().references(() => shareRequests.id),
  eventType: varchar("event_type").notNull(), // 'created' | 'accepted' | 'rejected' | 'expired' | 'cancelled' | 'downloaded'
  actorId: varchar("actor_id").notNull().references(() => users.id),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertShareRequest = typeof shareRequests.$inferInsert;
export type ShareRequest = typeof shareRequests.$inferSelect;

export type InsertShareEvent = typeof shareEvents.$inferInsert;
export type ShareEvent = typeof shareEvents.$inferSelect;

export const insertShareRequestSchema = createInsertSchema(shareRequests).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
});

export const insertShareEventSchema = createInsertSchema(shareEvents).omit({
  id: true,
  createdAt: true,
});

export const insertCloudFileSchema = createInsertSchema(cloudFiles).omit({
  id: true,
  createdAt: true,
});

export type DriveFile = CloudFile;

export const insertCopyOperationSchema = createInsertSchema(copyOperations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Scheduled tasks for automated copy operations
export const scheduledTasks = pgTable("scheduled_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Task name and description
  name: varchar("name").notNull(),
  description: text("description"),
  
  // Source configuration
  sourceUrl: text("source_url").notNull(),
  sourceProvider: varchar("source_provider").notNull(), // 'google' | 'dropbox'
  sourceName: varchar("source_name"), // Display name of source file/folder
  
  // Destination configuration
  destProvider: varchar("dest_provider").notNull(), // 'google' | 'dropbox'
  destinationFolderId: text("destination_folder_id").notNull().default('root'),
  destinationFolderName: varchar("destination_folder_name"), // Display name
  
  // Schedule configuration (user-friendly, not cron)
  frequency: varchar("frequency").notNull(), // 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom'
  hour: integer("hour").default(8), // Hour of day (0-23)
  minute: integer("minute").default(0), // Minute (0-59)
  dayOfWeek: integer("day_of_week"), // 0-6 for weekly (0=Sunday)
  dayOfMonth: integer("day_of_month"), // 1-31 for monthly
  timezone: varchar("timezone").default('America/Argentina/Buenos_Aires'),
  
  // Status
  status: varchar("status").notNull().default('active'), // 'active' | 'paused' | 'deleted'
  
  // Execution tracking
  lastRunAt: timestamp("last_run_at"),
  lastRunStatus: varchar("last_run_status"), // 'success' | 'failed' | 'running'
  lastRunError: text("last_run_error"),
  nextRunAt: timestamp("next_run_at"),
  totalRuns: integer("total_runs").default(0),
  successfulRuns: integer("successful_runs").default(0),
  failedRuns: integer("failed_runs").default(0),
  
  // Options
  skipDuplicates: boolean("skip_duplicates").default(true),
  notifyOnComplete: boolean("notify_on_complete").default(true),
  notifyOnFailure: boolean("notify_on_failure").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scheduled task execution history
export const scheduledTaskRuns = pgTable("scheduled_task_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scheduledTaskId: varchar("scheduled_task_id").notNull().references(() => scheduledTasks.id),
  copyOperationId: varchar("copy_operation_id").references(() => copyOperations.id),
  
  status: varchar("status").notNull(), // 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // seconds
  
  filesProcessed: integer("files_processed").default(0),
  filesFailed: integer("files_failed").default(0),
  bytesTransferred: bigint("bytes_transferred", { mode: "number" }).default(0),
  
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ScheduledTask = typeof scheduledTasks.$inferSelect;
export type InsertScheduledTask = typeof scheduledTasks.$inferInsert;
export type ScheduledTaskRun = typeof scheduledTaskRuns.$inferSelect;
export type InsertScheduledTaskRun = typeof scheduledTaskRuns.$inferInsert;

export const insertScheduledTaskSchema = createInsertSchema(scheduledTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastRunAt: true,
  lastRunStatus: true,
  lastRunError: true,
  nextRunAt: true,
  totalRuns: true,
  successfulRuns: true,
  failedRuns: true,
});

export const insertScheduledTaskRunSchema = createInsertSchema(scheduledTaskRuns).omit({
  id: true,
  createdAt: true,
});
