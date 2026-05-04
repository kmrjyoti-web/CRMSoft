export declare const CACHEABLE_KEY = "cacheable:ttl";
export declare const CACHE_KEY_PREFIX = "cacheable:prefix";
/**
 * Method decorator: marks a method's result as cacheable.
 * Works with CacheService or NestJS CacheManager.
 *
 * Usage:
 *   @Cacheable({ ttl: 300, prefix: 'tenant' })
 *   async getTenantProfile(tenantId: string) { ... }
 */
export declare function Cacheable(options?: {
    ttl?: number;
    prefix?: string;
}): MethodDecorator;
//# sourceMappingURL=cacheable.decorator.d.ts.map