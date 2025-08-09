// Performance Optimization Module for Twilio Pro
import { db } from "./db";

export class PerformanceOptimizer {
  // Database query optimization
  static async optimizeQueries() {
    console.log('🚀 Optimizing database queries...');
    
    // Add database indexes for frequently accessed columns
    const indexes = [
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_user_created ON calls(user_id, created_at DESC);`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_status ON calls(status);`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dids_active ON dids(is_active) WHERE is_active = true;`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blacklist_lookup ON blacklisted_numbers(phone_number, did_id);`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_user_status ON call_campaigns(user_id, status);`
    ];

    for (const indexSQL of indexes) {
      try {
        await db.execute(indexSQL as any);
        console.log('✅ Index created successfully');
      } catch (error) {
        // Index might already exist
        console.log('ℹ️  Index exists or creation skipped');
      }
    }
  }

  // Memory optimization for Node.js
  static optimizeMemory() {
    console.log('🧠 Optimizing memory usage...');
    
    if ((global as any).gc) {
      // Force garbage collection periodically
      setInterval(() => {
        (global as any).gc();
      }, 300000); // Every 5 minutes
    }

    // Set Node.js memory optimization flags
    process.env.NODE_OPTIONS = [
      '--max-old-space-size=2048',
      '--optimize-for-size',
      '--max-semi-space-size=128'
    ].join(' ');
  }

  // API Response caching
  static createCache() {
    const cache = new Map();
    const maxSize = 1000;
    const ttl = 60000; // 1 minute

    return {
      get(key: string) {
        const item = cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
          cache.delete(key);
          return null;
        }
        
        return item.value;
      },
      
      set(key: string, value: any) {
        if (cache.size >= maxSize) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        
        cache.set(key, {
          value,
          expiry: Date.now() + ttl
        });
      },
      
      clear() {
        cache.clear();
      }
    };
  }

  // Connection pooling optimization
  static optimizeConnections() {
    console.log('🔗 Optimizing database connections...');
    
    // Connection pool is already optimized in db.ts
    // Additional monitoring
    setInterval(() => {
      const stats = {
        totalConnections: (db as any).pool?.totalCount || 0,
        idleConnections: (db as any).pool?.idleCount || 0,
        waitingClients: (db as any).pool?.waitingCount || 0
      };
      
      if (stats.waitingClients > 5) {
        console.warn('⚠️  High connection wait queue:', stats);
      }
    }, 30000);
  }

  // Request rate limiting and optimization
  static optimizeRequests() {
    const requestStats = new Map();
    
    return {
      trackRequest(endpoint: string) {
        const current = requestStats.get(endpoint) || { count: 0, lastReset: Date.now() };
        const now = Date.now();
        
        // Reset counter every minute
        if (now - current.lastReset > 60000) {
          current.count = 0;
          current.lastReset = now;
        }
        
        current.count++;
        requestStats.set(endpoint, current);
        
        // Log high traffic endpoints
        if (current.count > 100) {
          console.log(`🔥 High traffic endpoint: ${endpoint} (${current.count} req/min)`);
        }
      }
    };
  }
}

// Auto-start optimizations
export function initializePerformanceOptimizations() {
  console.log('🚀 Initializing performance optimizations...');
  
  PerformanceOptimizer.optimizeMemory();
  PerformanceOptimizer.optimizeConnections();
  PerformanceOptimizer.optimizeQueries();
  
  console.log('✅ Performance optimizations initialized');
}