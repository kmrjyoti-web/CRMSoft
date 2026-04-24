export interface CacheOptions {
    ttl?: number;
    prefix?: string;
}
/**
 * Generic cache service interface.
 * Default implementation uses in-memory Map (for testing/dev).
 * Production: extend and override with Redis/ioredis.
 */
export declare class CacheService {
    private readonly logger;
    private readonly store;
    private buildKey;
    get<T>(key: string, options?: CacheOptions): Promise<T | null>;
    set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
    del(key: string, options?: CacheOptions): Promise<void>;
    getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions): Promise<T>;
    invalidatePattern(prefix: string): Promise<number>;
}
//# sourceMappingURL=cache.service.d.ts.map