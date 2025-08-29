import { Request, Response, NextFunction } from 'express';

interface CacheOptions {
  ttl: number; // Time to live in seconds
  key?: (req: Request) => string;
  condition?: (req: Request) => boolean;
}

class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();

  set(key: string, data: any, ttl: number): void {
    const expires = Date.now() + (ttl * 1000);
    this.cache.set(key, { data, expires });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new MemoryCache();

// Clean up expired cache entries every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

export const cacheMiddleware = (options: CacheOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching if condition is not met
    if (options.condition && !options.condition(req)) {
      return next();
    }

    // Generate cache key
    const cacheKey = options.key 
      ? options.key(req)
      : `${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;

    // Try to get from cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache the response
    res.json = function(data: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, data, options.ttl);
        res.setHeader('X-Cache', 'MISS');
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
};

// Predefined cache configurations
export const shortCache = cacheMiddleware({ ttl: 300 }); // 5 minutes
export const mediumCache = cacheMiddleware({ ttl: 1800 }); // 30 minutes
export const longCache = cacheMiddleware({ ttl: 3600 }); // 1 hour

// Cache for static data that rarely changes
export const staticDataCache = cacheMiddleware({
  ttl: 3600, // 1 hour
  condition: (req) => req.method === 'GET'
});

// Cache for user-specific data
export const userDataCache = cacheMiddleware({
  ttl: 600, // 10 minutes
  key: (req) => `user:${req.user?.id}:${req.originalUrl}`,
  condition: (req) => req.method === 'GET' && !!req.user
});

// Cache for foundation-specific data
export const foundationDataCache = cacheMiddleware({
  ttl: 900, // 15 minutes
  key: (req) => {
    const foundationId = req.params.foundationId || req.query.foundation_id;
    return `foundation:${foundationId}:${req.originalUrl}`;
  },
  condition: (req) => req.method === 'GET'
});

// Cache invalidation helpers
export const invalidateCache = {
  user: (userId: string) => {
    // In a real implementation, this would invalidate all user-related cache entries
    console.log(`Invalidating cache for user: ${userId}`);
  },
  
  foundation: (foundationId: string) => {
    // In a real implementation, this would invalidate all foundation-related cache entries
    console.log(`Invalidating cache for foundation: ${foundationId}`);
  },
  
  all: () => {
    cache.clear();
    console.log('All cache cleared');
  }
};

export { cache };