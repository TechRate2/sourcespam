// High-performance caching middleware
import { Request, Response, NextFunction } from 'express';
import { PerformanceOptimizer } from '../performance-optimizer';

// Create global cache instance
const cache = PerformanceOptimizer.createCache();

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: (req: Request) => string; // Custom key generator
  skip?: (req: Request) => boolean; // Skip cache condition
}

export function cacheMiddleware(options: CacheOptions = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip cache for non-GET requests or if skip condition met
    if (req.method !== 'GET' || (options.skip && options.skip(req))) {
      return next();
    }

    // Generate cache key
    const key = options.key ? options.key(req) : `${req.method}:${req.originalUrl}`;
    
    // Try to get from cache
    const cached = cache.get(key);
    if (cached) {
      console.log(`💾 Cache HIT: ${key}`);
      return res.json(cached);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(body) {
      // Cache successful responses only
      if (res.statusCode === 200) {
        cache.set(key, body);
        console.log(`💾 Cache SET: ${key}`);
      }
      return originalJson.call(this, body);
    };

    next();
  };
}

// Predefined cache configurations
export const cacheConfigs = {
  // Short cache for frequently changing data
  short: { ttl: 30000 }, // 30 seconds
  
  // Medium cache for semi-static data  
  medium: { ttl: 300000 }, // 5 minutes
  
  // Long cache for static data
  long: { ttl: 1800000 }, // 30 minutes
  
  // User-specific cache
  userSpecific: {
    ttl: 60000, // 1 minute
    key: (req: Request) => `user:${(req as any).user?.id}:${req.originalUrl}`
  },
  
  // Skip cache for authenticated requests with fresh data
  skipAuth: {
    skip: (req: Request) => !!(req as any).user && req.headers['cache-control'] === 'no-cache'
  }
};