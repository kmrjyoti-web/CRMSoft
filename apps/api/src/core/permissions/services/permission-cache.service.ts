import { Injectable } from '@nestjs/common';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Simple in-memory cache for permission data.
 * Used by engines to cache role permissions, user overrides, dept paths.
 */
@Injectable()
export class PermissionCacheService {
  private store = new Map<string, CacheEntry<any>>();

  /** Get a cached value. Returns undefined if not found or expired. */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  /** Set a value with TTL in milliseconds. */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  /** Invalidate a specific key. */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /** Invalidate all keys matching a prefix. */
  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /** Clear all cached data. */
  clear(): void {
    this.store.clear();
  }

  /** Get current cache size. */
  get size(): number {
    return this.store.size;
  }
}
