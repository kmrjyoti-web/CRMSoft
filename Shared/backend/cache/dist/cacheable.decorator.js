"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_KEY_PREFIX = exports.CACHEABLE_KEY = void 0;
exports.Cacheable = Cacheable;
exports.CACHEABLE_KEY = 'cacheable:ttl';
exports.CACHE_KEY_PREFIX = 'cacheable:prefix';
/**
 * Method decorator: marks a method's result as cacheable.
 * Works with CacheService or NestJS CacheManager.
 *
 * Usage:
 *   @Cacheable({ ttl: 300, prefix: 'tenant' })
 *   async getTenantProfile(tenantId: string) { ... }
 */
function Cacheable(options) {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(exports.CACHEABLE_KEY, options?.ttl ?? 300, target, propertyKey);
        Reflect.defineMetadata(exports.CACHE_KEY_PREFIX, options?.prefix ?? String(propertyKey), target, propertyKey);
        return descriptor;
    };
}
//# sourceMappingURL=cacheable.decorator.js.map