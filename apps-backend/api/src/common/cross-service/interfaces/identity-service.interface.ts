/**
 * IIdentityService — Cross-Service Interface
 *
 * Defines the contract for reading identity data from other service boundaries.
 *
 * Monolith:      Implemented as direct Prisma queries (IdentityServiceMonolith).
 * Microservice:  Implemented as HTTP/gRPC client to the Identity service.
 *
 * Covered cross-service patterns (from MS1 audit):
 *   - Work → Identity: fetch users for assignment, ownership, audit trails
 *   - Work → Identity: fetch tenants for multi-tenant context
 *   - Vendor → Identity: validate tokens (pass-through, handled by guards in monolith)
 */

export const IDENTITY_SERVICE = Symbol('IDENTITY_SERVICE');

export interface IdentityUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  tenantId?: string;
}

export interface IdentityTenant {
  id: string;
  name: string;
  hasDedicatedDb: boolean;
  databaseUrl?: string;
  packageId?: string;
}

export interface IIdentityService {
  /** Fetch a single user by ID — used in activity/lead/contact audit trails */
  getUserById(userId: string): Promise<IdentityUser | null>;

  /** Fetch multiple users by ID — used in bulk export, assignment lookups */
  getUsersByIds(userIds: string[]): Promise<IdentityUser[]>;

  /** Fetch tenant metadata — used in multi-tenant context and provisioning */
  getTenantById(tenantId: string): Promise<IdentityTenant | null>;

  /**
   * Validate a JWT and return the decoded claims.
   * In the monolith this is a no-op (validation happens in JwtAuthGuard).
   * In microservices, each service must call Identity to validate tokens.
   */
  validateToken(token: string): Promise<{ userId: string; tenantId: string; role: string } | null>;
}
