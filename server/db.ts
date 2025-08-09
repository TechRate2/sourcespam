import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// ✅ OPTIMIZED: Enhanced connection pooling for high concurrent users
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Max 20 concurrent connections
  min: 5,                     // Min 5 idle connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000 // 2s connection timeout
});

console.log('✅ Database pool configured for high concurrency');
export const db = drizzle({ client: pool, schema });