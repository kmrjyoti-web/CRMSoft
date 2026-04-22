import 'reflect-metadata';

export type ServiceBoundary = 'vendor' | 'identity' | 'work';

export interface CrossServiceMetadata {
  targetService: ServiceBoundary;
  reason: string;
  sourceName: string;
  method?: string;
}

/**
 * Marks a class or method as having a cross-service dependency.
 *
 * When extracting to microservices, every @CrossService usage must be
 * replaced with an API call, message queue event, or shared library import.
 *
 * Categories:
 *   - 'vendor'   → Depends on SoftwareVendor service (table-config, tenant-config, control-room)
 *   - 'identity' → Depends on Identity service (auth, permissions, settings, auto-number)
 *   - 'work'     → Depends on Work service (workflow engine, notifications, customer data)
 *
 * Usage on a class (all methods depend on the cross-service):
 *   @CrossService('identity', 'Uses AutoNumberService for invoice numbering')
 *   @Injectable()
 *   export class InvoiceService { ... }
 *
 * Usage on a method (single method has the cross-service dependency):
 *   @CrossService('vendor', 'Reads CredentialService for OAuth tokens')
 *   async connect() { ... }
 */
export function CrossService(
  targetService: ServiceBoundary,
  reason: string,
): MethodDecorator & ClassDecorator {
  return function (
    target: object,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) {
    const sourceName =
      typeof target === 'function'
        ? target.name
        : (target as { constructor?: { name?: string } }).constructor?.name ?? 'Unknown';

    const metadata: CrossServiceMetadata = {
      targetService,
      reason,
      sourceName,
      method: propertyKey?.toString(),
    };

    const metaKey = 'cross_service_deps';

    // Store on constructor for class decorator
    const store = typeof target === 'function' ? target : (target as { constructor: object }).constructor;
    const existing: CrossServiceMetadata[] = Reflect.getMetadata(metaKey, store) ?? [];
    existing.push(metadata);
    Reflect.defineMetadata(metaKey, existing, store);

    return (descriptor ?? target) as any;
  };
}

/**
 * Retrieves all @CrossService metadata stored on a class.
 */
export function getCrossServiceDeps(target: object): CrossServiceMetadata[] {
  return Reflect.getMetadata('cross_service_deps', target) ?? [];
}
