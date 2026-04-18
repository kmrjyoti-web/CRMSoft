export const CACHEABLE_KEY = 'cacheable:ttl';
export const CACHE_KEY_PREFIX = 'cacheable:prefix';

/**
 * Method decorator: marks a method's result as cacheable.
 * Works with CacheService or NestJS CacheManager.
 *
 * Usage:
 *   @Cacheable({ ttl: 300, prefix: 'tenant' })
 *   async getTenantProfile(tenantId: string) { ... }
 */
export function Cacheable(options?: { ttl?: number; prefix?: string }): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(CACHEABLE_KEY, options?.ttl ?? 300, target, propertyKey);
    Reflect.defineMetadata(CACHE_KEY_PREFIX, options?.prefix ?? String(propertyKey), target, propertyKey);
    return descriptor;
  };
}
