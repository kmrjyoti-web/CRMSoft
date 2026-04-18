export declare class PermissionCacheService {
    private store;
    get<T>(key: string): T | undefined;
    set<T>(key: string, data: T, ttlMs: number): void;
    invalidate(key: string): void;
    invalidatePrefix(prefix: string): void;
    clear(): void;
    get size(): number;
}
