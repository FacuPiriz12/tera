import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;
let tablesInitialized = false;

function getDatabaseUrl(): string {
  let databaseUrl = process.env.DATABASE_URL;
  
  // Try to construct from PG* variables if DATABASE_URL is not available
  if (!databaseUrl || databaseUrl.trim() === '') {
    const { PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT } = process.env;
    if (PGHOST && PGUSER && PGPASSWORD && PGDATABASE) {
      databaseUrl = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT || '5432'}/${PGDATABASE}?sslmode=require`;
      console.log('Constructed DATABASE_URL from PG* variables');
    }
  }
  
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  return databaseUrl;
}

function initializeDatabase() {
  if (!pool) {
    pool = new Pool({ connectionString: getDatabaseUrl() });
    db = drizzle({ client: pool, schema });
  }
  return db!;
}

async function ensureTablesExist() {
  if (tablesInitialized) return;
  
  const database = initializeDatabase();
  
  try {
    // Create sessions table for session storage
    await database.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `);
    
    await database.execute(sql`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire)
    `);
    
    // Create users table
    await database.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        auth_provider VARCHAR NOT NULL DEFAULT 'replit',
        role VARCHAR NOT NULL DEFAULT 'user',
        max_storage_bytes INTEGER DEFAULT 16106127360,
        max_concurrent_operations INTEGER DEFAULT 5,
        max_daily_operations INTEGER DEFAULT 100,
        is_active BOOLEAN DEFAULT true,
        google_access_token TEXT,
        google_refresh_token TEXT,
        google_token_expiry TIMESTAMP,
        google_connected BOOLEAN DEFAULT false,
        dropbox_access_token TEXT,
        dropbox_refresh_token TEXT,
        dropbox_token_expiry TIMESTAMP,
        dropbox_connected BOOLEAN DEFAULT false,
        membership_plan VARCHAR NOT NULL DEFAULT 'free',
        membership_expiry TIMESTAMP,
        membership_trial_used BOOLEAN DEFAULT false,
        stripe_customer_id VARCHAR,
        stripe_subscription_id VARCHAR
      )
    `);
    
    // Create cloud_files table
    await database.execute(sql`
      CREATE TABLE IF NOT EXISTS cloud_files (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        provider VARCHAR NOT NULL,
        original_file_id VARCHAR NOT NULL,
        copied_file_id VARCHAR NOT NULL,
        file_name TEXT NOT NULL,
        mime_type VARCHAR,
        file_size INTEGER,
        source_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create copy_operations table
    await database.execute(sql`
      CREATE TABLE IF NOT EXISTS copy_operations (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        source_url TEXT NOT NULL,
        destination_folder_id TEXT NOT NULL DEFAULT 'root',
        status VARCHAR NOT NULL,
        total_files INTEGER DEFAULT 0,
        completed_files INTEGER DEFAULT 0,
        error_message TEXT,
        source_provider VARCHAR,
        dest_provider VARCHAR,
        source_file_id VARCHAR,
        source_file_path TEXT,
        file_name TEXT,
        item_type VARCHAR DEFAULT 'file',
        priority INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 5,
        next_run_at TIMESTAMP,
        locked_by VARCHAR,
        locked_at TIMESTAMP,
        cancel_requested BOOLEAN DEFAULT false,
        progress_pct INTEGER DEFAULT 0,
        copied_file_id VARCHAR,
        copied_file_name TEXT,
        copied_file_url TEXT,
        duration INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create scheduled_tasks table
    await database.execute(sql`
      CREATE TABLE IF NOT EXISTS scheduled_tasks (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        name VARCHAR NOT NULL,
        description TEXT,
        source_url TEXT NOT NULL,
        source_provider VARCHAR NOT NULL,
        source_name VARCHAR,
        dest_provider VARCHAR NOT NULL,
        destination_folder_id TEXT NOT NULL DEFAULT 'root',
        destination_folder_name VARCHAR,
        operation_type VARCHAR DEFAULT 'copy',
        frequency VARCHAR NOT NULL,
        hour INTEGER DEFAULT 8,
        minute INTEGER DEFAULT 0,
        day_of_week INTEGER,
        day_of_month INTEGER,
        selected_days INTEGER[],
        timezone VARCHAR DEFAULT 'America/Argentina/Buenos_Aires',
        status VARCHAR NOT NULL DEFAULT 'active',
        last_run_at TIMESTAMP,
        last_run_status VARCHAR,
        last_run_error TEXT,
        next_run_at TIMESTAMP,
        total_runs INTEGER DEFAULT 0,
        successful_runs INTEGER DEFAULT 0,
        failed_runs INTEGER DEFAULT 0,
        skip_duplicates BOOLEAN DEFAULT true,
        notify_on_complete BOOLEAN DEFAULT true,
        notify_on_failure BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create scheduled_task_runs table
    await database.execute(sql`
      CREATE TABLE IF NOT EXISTS scheduled_task_runs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        scheduled_task_id VARCHAR NOT NULL REFERENCES scheduled_tasks(id),
        copy_operation_id VARCHAR REFERENCES copy_operations(id),
        status VARCHAR NOT NULL,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        duration INTEGER,
        files_processed INTEGER DEFAULT 0,
        files_failed INTEGER DEFAULT 0,
        bytes_transferred BIGINT DEFAULT 0,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create file_hashes table for duplicate detection
    await database.execute(sql`
      CREATE TABLE IF NOT EXISTS file_hashes (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        file_name TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        content_hash VARCHAR NOT NULL,
        provider VARCHAR NOT NULL,
        file_id VARCHAR NOT NULL,
        file_path TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await database.execute(sql`
      CREATE INDEX IF NOT EXISTS "IDX_file_hashes_user_id" ON file_hashes (user_id)
    `);
    
    await database.execute(sql`
      CREATE INDEX IF NOT EXISTS "IDX_file_hashes_content_hash" ON file_hashes (user_id, content_hash)
    `);
    
    await database.execute(sql`
      CREATE INDEX IF NOT EXISTS "IDX_file_hashes_metadata" ON file_hashes (user_id, file_name, file_size, provider)
    `);
    
    tablesInitialized = true;
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database tables:', error);
    // Don't throw - allow app to continue even if table creation fails
  }
}

export { initializeDatabase, ensureTablesExist };
export const getDb = () => initializeDatabase();