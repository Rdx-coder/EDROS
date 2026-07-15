/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Redis from "ioredis";
import { PinoLogger } from "./pinoLogger";

/**
 * Helper to create resilient Redis client connection
 */
function createRedisClient(name: string, dbIndex: number): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) {
    PinoLogger.warn(`REDIS_URL not configured. ${name} Redis instance will run in virtual memory-fallback mode.`);
    return null;
  }

  try {
    const client = new Redis(url, {
      db: dbIndex,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        PinoLogger.warn(`${name} Redis retry attempt #${times}`);
        return Math.min(times * 100, 2000);
      },
      reconnectOnError: (err) => {
        PinoLogger.warn(`${name} Redis reconnecting on error: ${err.message}`);
        return true;
      }
    });

    client.on("connect", () => {
      PinoLogger.info(`${name} Redis connected successfully to DB index ${dbIndex}`);
    });

    client.on("error", (err) => {
      PinoLogger.error(`${name} Redis client connection error:`, err);
    });

    return client;
  } catch (err) {
    PinoLogger.error(`Failed to construct ${name} Redis Client:`, err);
    return null;
  }
}

/**
 * Enterprise Redis Connection Pool Manager
 */
export class RedisConnectionPool {
  public static cacheRedis = createRedisClient("Cache", 0);
  public static queueRedis = createRedisClient("Queue", 1);
  public static sessionRedis = createRedisClient("Session", 2);
}

/**
 * Enterprise Redis Cache Client
 */
export class RedisCacheManager {
  private client: Redis | null = RedisConnectionPool.cacheRedis;
  private memoryCache = new Map<string, { value: string; expiresAt: number }>();

  /**
   * Set key with TTL in seconds
   */
  public async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    const stringified = JSON.stringify(value);
    if (this.client && this.client.status === "ready") {
      try {
        await this.client.set(key, stringified, "EX", ttlSeconds);
        return;
      } catch (err) {
        PinoLogger.error(`Redis SET failed for key: ${key}. Falling back to memory-cache.`, err);
      }
    }
    this.memoryCache.set(key, {
      value: stringified,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Get value by key
   */
  public async get<T>(key: string): Promise<T | null> {
    if (this.client && this.client.status === "ready") {
      try {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
      } catch (err) {
        PinoLogger.error(`Redis GET failed for key: ${key}. Trying memory-cache fallback.`, err);
      }
    }
    const cached = this.memoryCache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return JSON.parse(cached.value);
  }

  /**
   * Delete key (Invalidation)
   */
  public async del(key: string): Promise<void> {
    if (this.client && this.client.status === "ready") {
      try {
        await this.client.del(key);
        return;
      } catch (err) {
        PinoLogger.error(`Redis DEL failed for key: ${key}. Trying memory-cache fallback.`, err);
      }
    }
    this.memoryCache.delete(key);
  }

  /**
   * Invalidate multiple keys by pattern
   */
  public async invalidatePattern(pattern: string): Promise<void> {
    PinoLogger.info(`Invalidating cache keys matching pattern: ${pattern}`);
    if (this.client && this.client.status === "ready") {
      try {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
        return;
      } catch (err) {
        PinoLogger.error(`Redis pattern invalidation failed for: ${pattern}`, err);
      }
    }
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  public async clearAll(): Promise<void> {
    if (this.client && this.client.status === "ready") {
      try {
        await this.client.flushall();
        return;
      } catch (err) {
        PinoLogger.error("Redis flushall failed.", err);
      }
    }
    this.memoryCache.clear();
  }
}

export const redisCache = new RedisCacheManager();
