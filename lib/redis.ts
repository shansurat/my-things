import { Redis } from '@upstash/redis'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Only initialize if we have credentials, otherwise export a dummy or null
export const redis = redisUrl && redisToken 
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

if (!redis) {
  console.warn('Redis environment variables are missing. Caching is disabled.');
}

/**
 * Cache keys helper
 */
export const CACHE_KEYS = {
  userItems: (userId: string) => `user-items:${userId}`,
}
