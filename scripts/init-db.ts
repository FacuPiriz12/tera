import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function initializeDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
  }
  
  console.log('🔄 Connecting to database...');
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    console.log('📦 Creating tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_session_expire ON sessions (expire);
    `);
    console.log('✅ Sessions table created');
    
    await pool.query(`
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
      );
    `);
    console.log('✅ Users table created');
    
    await pool.query(`
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
      );
    `);
    console.log('✅ Cloud files table created');
    
    await pool.query(`
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
      );
    `);
    console.log('✅ Copy operations table created');
    
    console.log('\n🎉 Database initialized successfully!');
    
    const userCheck = await pool.query(`SELECT COUNT(*) FROM users WHERE email = 'facupiriz87@gmail.com'`);
    if (parseInt(userCheck.rows[0].count) === 0) {
      console.log('🔑 Creating admin user...');
      await pool.query(`
        INSERT INTO users (id, email, first_name, last_name, role, auth_provider)
        VALUES (gen_random_uuid(), 'facupiriz87@gmail.com', 'Facundo', 'Piriz', 'admin', 'supabase')
        ON CONFLICT (email) DO UPDATE SET role = 'admin'
      `);
      console.log('✅ Admin user created');
    } else {
      console.log('🔑 Updating admin user role...');
      await pool.query(`UPDATE users SET role = 'admin' WHERE email = 'facupiriz87@gmail.com'`);
      console.log('✅ Admin user updated');
    }
    
    const adminCheck = await pool.query(`SELECT id, email, role FROM users WHERE email = 'facupiriz87@gmail.com'`);
    console.log('👤 Admin user:', adminCheck.rows[0]);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
