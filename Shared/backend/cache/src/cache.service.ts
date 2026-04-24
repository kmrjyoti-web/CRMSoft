import { Injectable, Logger } from '@nestjs/common';

export interface CacheOptions {
  ttl?: number; // seconds, default 300
  prefix?: string;
}

/**
 * Generic cache service interface.
 * Default implementation uses in-memory Map (for testing/dev).
 * Production: extend and override with Redis/ioredis.
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly store = new Map<string, { value: string; expiresAt?: number }>();

  private buildKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const k = this.buildKey(key, options?.prefix);
    const entry = this.store.get(k);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(k);
      return null;
    }
    try {
      return JSON.parse(entry.value) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const k = this.buildKey(key, options?.prefix);
    const ttl = options?.ttl ?? 300;
    this.store.set(k, {
      value: JSON.stringify(value),
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  async del(key: string, options?: CacheOptions): Promise<void> {
    const k = this.buildKey(key, options?.prefix);
    this.store.delete(k);
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== null) return cached;
    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  async invalidatePattern(prefix: string): Promise<number> {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }
}
