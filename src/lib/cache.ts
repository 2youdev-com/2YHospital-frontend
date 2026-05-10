// src/lib/cache.ts

/**
 * Simple in-memory cache for API responses.
 * Prevents redundant network calls when navigating between pages.
 * Cache TTL: 60 seconds for most resources, 10 seconds for real-time data.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export const TTL = {
  SHORT: 10_000, // 10s — live data (appointments, notifications)
  MEDIUM: 60_000, // 60s — semi-static (patients, bills)
  LONG: 300_000, // 5min — static (specialties, branches)
};

export function getCached<T>(key: string, ttl: number): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  if (!entry) return null;

  if (Date.now() - entry.timestamp > ttl) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCached<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function invalidateCache(prefix: string): void {
  Array.from(cache.keys()).forEach((key) => {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  });
}

export function clearCache(): void {
  cache.clear();
}