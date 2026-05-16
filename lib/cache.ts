import prisma from '@/lib/prisma'

export interface CacheEntry {
  key: string
  value: any
  ttl?: number // in seconds
}

const CACHE_TTL = {
  VERY_SHORT: 60, // 1 minute
  SHORT: 300, // 5 minutes
  MEDIUM: 3600, // 1 hour
  LONG: 86400, // 24 hours
}

/**
 * Set a value in cache with TTL
 */
export async function setCacheValue(key: string, value: any, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
  const expiresAt = new Date(Date.now() + ttl * 1000)

  await prisma.cache.upsert({
    where: { key },
    create: {
      key,
      value,
      expiresAt,
    },
    update: {
      value,
      expiresAt,
    },
  })
}

/**
 * Get a value from cache
 */
export async function getCacheValue(key: string): Promise<any | null> {
  const data = await prisma.cache.findUnique({
    where: { key },
  })

  if (!data) return null

  // Check if cache has expired
  if (data.expiresAt < new Date()) {
    // Delete expired cache entry
    await prisma.cache.delete({ where: { key } }).catch(() => {})
    return null
  }

  return data.value
}

/**
 * Delete a cache entry
 */
export async function deleteCacheValue(key: string): Promise<void> {
  await prisma.cache.delete({ where: { key } }).catch(() => {})
}

/**
 * Clear all expired cache entries
 */
export async function clearExpiredCache(): Promise<void> {
  await prisma.cache.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  })
}

/**
 * Get or compute a cached value
 */
export async function getOrComputeCacheValue<T>(
  key: string,
  computeFn: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  // Try to get from cache first
  const cached = await getCacheValue(key)
  if (cached !== null) {
    return cached as T
  }

  // Compute the value
  const value = await computeFn()

  // Store in cache
  await setCacheValue(key, value, ttl)

  return value
}

export const CACHE_TTL_CONFIG = CACHE_TTL
