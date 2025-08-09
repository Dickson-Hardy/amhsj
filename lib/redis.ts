import { Redis } from '@upstash/redis'

// Test Redis connection function
async function testRedisConnection(redis: Redis): Promise<boolean> {
  try {
    const result = await redis.ping()
    return result === 'PONG'
  } catch (error) {
    console.error('Redis connection test failed:', error)
    return false
  }
}

// Create Redis client instance for edge runtime
export const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Test connection and log status
let redisConnected = false
if (redis) {
  testRedisConnection(redis).then(connected => {
    redisConnected = connected
    if (connected) {
      console.log('✅ Redis client initialized and connected successfully')
    } else {
      console.log('❌ Redis client initialized but connection failed - using memory fallback')
    }
  }).catch(() => {
    console.log('❌ Redis connection test failed - using memory fallback')
  })
} else {
  console.log('⚠️  Redis client not initialized - missing environment variables, using memory fallback')
}

// In-memory cache fallback for development
const memoryCache = new Map<string, { value: any; expires?: number }>()

// Clean up expired items from memory cache
const cleanMemoryCache = () => {
  const now = Date.now()
  for (const [key, item] of memoryCache.entries()) {
    if (item.expires && item.expires < now) {
      memoryCache.delete(key)
    }
  }
}

// Clean memory cache every 5 minutes
setInterval(cleanMemoryCache, 5 * 60 * 1000)

// Cache utility functions
export const cache = {
  // Set a value with optional expiration (in seconds)
  async set(key: string, value: any, expiration?: number): Promise<void> {
    // Always try memory cache first, then Redis as a backup
    const expires = expiration ? Date.now() + (expiration * 1000) : undefined
    memoryCache.set(key, { value, expires })
    
    // Try Redis as secondary storage (best effort)
    if (redis) {
      try {
        const serialized = JSON.stringify(value)
        if (expiration) {
          await redis.setex(key, expiration, serialized)
        } else {
          await redis.set(key, serialized)
        }
      } catch (error) {
        // Silent fail for Redis - we already have memory cache
        console.debug('Redis set failed, using memory cache:', error instanceof Error ? error.message : 'Unknown error')
      }
    }
  },

  // Get a value from cache
  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const item = memoryCache.get(key)
    if (item) {
      if (item.expires && item.expires < Date.now()) {
        memoryCache.delete(key)
      } else {
        return item.value
      }
    }
    
    // If not in memory cache, try Redis
    if (redis) {
      try {
        const value = await redis.get(key)
        if (value) {
          const parsed = JSON.parse(value as string)
          // Store in memory cache for next time
          memoryCache.set(key, { value: parsed })
          return parsed
        }
      } catch (error) {
        console.debug('Redis get failed:', error instanceof Error ? error.message : 'Unknown error')
      }
    }
    
    return null
  },
  // Delete a key from cache
  async del(key: string): Promise<void> {
    try {
      if (redis) {
        await redis.del(key)
      } else {
        memoryCache.delete(key)
      }
    } catch (error) {
      console.error('Cache delete error:', error)
      memoryCache.delete(key)
    }
  },
  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      if (redis) {
        const result = await redis.exists(key)
        return result === 1
      } else {
        const item = memoryCache.get(key)
        if (!item) return false
        if (item.expires && item.expires < Date.now()) {
          memoryCache.delete(key)
          return false
        }
        return true
      }
    } catch (error) {
      console.error('Cache exists error:', error)
      const item = memoryCache.get(key)
      if (!item) return false
      if (item.expires && item.expires < Date.now()) {
        memoryCache.delete(key)
        return false
      }
      return true
    }
  },
  // Set expiration for existing key
  async expire(key: string, seconds: number): Promise<void> {
    try {
      if (redis) {
        await redis.expire(key, seconds)
      } else {
        const item = memoryCache.get(key)
        if (item) {
          item.expires = Date.now() + (seconds * 1000)
          memoryCache.set(key, item)
        }
      }
    } catch (error) {
      console.error('Cache expire error:', error)
      const item = memoryCache.get(key)
      if (item) {
        item.expires = Date.now() + (seconds * 1000)
        memoryCache.set(key, item)
      }
    }
  },

  // Get multiple keys
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (redis) {
        const values = await redis.mget(...keys)
        return values.map(value => value ? JSON.parse(value as string) : null)
      } else {
        return keys.map(key => {
          const item = memoryCache.get(key)
          if (!item) return null
          if (item.expires && item.expires < Date.now()) {
            memoryCache.delete(key)
            return null
          }
          return item.value
        })
      }
    } catch (error) {
      console.error('Cache mget error:', error)
      return keys.map(key => {
        const item = memoryCache.get(key)
        if (!item) return null
        if (item.expires && item.expires < Date.now()) {
          memoryCache.delete(key)
          return null
        }
        return item.value
      })
    }
  },

  // Set multiple key-value pairs
  async mset(keyValues: Record<string, any>): Promise<void> {
    try {
      if (redis) {
        const serializedPairs: Record<string, string> = {}
        for (const [key, value] of Object.entries(keyValues)) {
          serializedPairs[key] = JSON.stringify(value)
        }
        await redis.mset(serializedPairs)
      } else {
        for (const [key, value] of Object.entries(keyValues)) {
          memoryCache.set(key, { value })
        }
      }
    } catch (error) {
      console.error('Cache mset error:', error)
      for (const [key, value] of Object.entries(keyValues)) {
        memoryCache.set(key, { value })
      }
    }
  },
  // Increment a numeric value
  async incr(key: string): Promise<number> {
    try {
      if (redis) {
        return await redis.incr(key)
      } else {
        const item = memoryCache.get(key)
        const currentValue = item ? (typeof item.value === 'number' ? item.value : 0) : 0
        const newValue = currentValue + 1
        memoryCache.set(key, { value: newValue, expires: item?.expires })
        return newValue
      }
    } catch (error) {
      console.error('Cache incr error:', error)
      const item = memoryCache.get(key)
      const currentValue = item ? (typeof item.value === 'number' ? item.value : 0) : 0
      const newValue = currentValue + 1
      memoryCache.set(key, { value: newValue, expires: item?.expires })
      return newValue
    }
  },

  // Add to a set (simplified for memory fallback)
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      if (redis) {
        return await redis.sadd(key, members)
      } else {
        const item = memoryCache.get(key)
        const currentSet = new Set(item?.value || [])
        let added = 0
        for (const member of members) {
          if (!currentSet.has(member)) {
            currentSet.add(member)
            added++
          }
        }
        memoryCache.set(key, { value: Array.from(currentSet), expires: item?.expires })
        return added
      }
    } catch (error) {
      console.error('Cache sadd error:', error)
      return 0
    }
  },

  // Get all members of a set
  async smembers(key: string): Promise<string[]> {
    try {
      if (redis) {
        return await redis.smembers(key)
      } else {
        const item = memoryCache.get(key)
        return item?.value || []
      }
    } catch (error) {
      console.error('Cache smembers error:', error)
      return []
    }
  },

  // Remove from a set
  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      if (redis) {
        return await redis.srem(key, ...members)
      } else {
        const item = memoryCache.get(key)
        const currentSet = new Set(item?.value || [])
        let removed = 0
        for (const member of members) {
          if (currentSet.has(member)) {
            currentSet.delete(member)
            removed++
          }
        }
        memoryCache.set(key, { value: Array.from(currentSet), expires: item?.expires })
        return removed
      }
    } catch (error) {
      console.error('Cache srem error:', error)
      return 0
    }
  },

  // Check if member exists in set
  async sismember(key: string, member: string): Promise<boolean> {
    try {
      if (redis) {
        const result = await redis.sismember(key, member)
        return result === 1
      } else {
        const item = memoryCache.get(key)
        const currentSet = new Set(item?.value || [])
        return currentSet.has(member)
      }
    } catch (error) {
      console.error('Cache sismember error:', error)
      return false
    }
  }
}

// Session management utilities
export const session = {
  // Store session data
  async create(sessionId: string, data: any, expiration: number = 3600): Promise<void> {
    await cache.set(`session:${sessionId}`, data, expiration)
  },

  // Get session data
  async get<T>(sessionId: string): Promise<T | null> {
    return await cache.get<T>(`session:${sessionId}`)
  },

  // Update session data
  async update(sessionId: string, data: any, expiration?: number): Promise<void> {
    const key = `session:${sessionId}`
    await cache.set(key, data, expiration)
  },

  // Delete session
  async destroy(sessionId: string): Promise<void> {
    await cache.del(`session:${sessionId}`)
  },

  // Extend session expiration
  async extend(sessionId: string, seconds: number): Promise<void> {
    await cache.expire(`session:${sessionId}`, seconds)
  }
}

// Rate limiting utilities
export const rateLimit = {
  // Check and increment rate limit counter
  async check(key: string, limit: number, window: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      if (redis) {
        const current = await redis.incr(key)
        
        if (current === 1) {
          await redis.expire(key, window)
        }
        
        const ttl = await redis.ttl(key)
        const resetTime = Date.now() + (ttl * 1000)
        
        return {
          allowed: current <= limit,
          remaining: Math.max(0, limit - current),
          resetTime
        }
      } else {
        // Fallback to memory-based rate limiting
        const item = memoryCache.get(key)
        const now = Date.now()
        
        if (!item || (item.expires && item.expires < now)) {
          // First request or expired window
          const resetTime = now + (window * 1000)
          memoryCache.set(key, { value: 1, expires: resetTime })
          return {
            allowed: true,
            remaining: limit - 1,
            resetTime
          }
        } else {
          // Increment counter
          const current = item.value + 1
          memoryCache.set(key, { value: current, expires: item.expires })
          return {
            allowed: current <= limit,
            remaining: Math.max(0, limit - current),
            resetTime: item.expires || now + (window * 1000)
          }
        }
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      return { allowed: true, remaining: limit, resetTime: Date.now() + (window * 1000) }
    }
  },

  // Reset rate limit for a key
  async reset(key: string): Promise<void> {
    await cache.del(key)
  }
}

export default redis
