import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

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

export { initializeDatabase };
export const getDb = () => initializeDatabase();