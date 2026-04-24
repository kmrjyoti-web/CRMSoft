/**
 * IdentityServiceMonolith
 *
 * Monolith implementation of IIdentityService.
 * Reads from IdentityDB (prisma.identity.*) directly.
 *
 * When extracting Identity as a microservice, replace this class with an
 * HTTP or gRPC client implementation that calls the Identity service API.
 * The calling code (Work service) will not change — only this class swaps out.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { IIdentityService, IdentityUser, IdentityTenant } from '../interfaces/identity-service.interface';

@Injectable()
export class IdentityServiceMonolith implements IIdentityService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(userId: string): Promise<IdentityUser | null> {
    const user = await this.prisma.identity.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, email: true, tenantId: true },
    });

    if (!user) return null;
    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      tenantId: user.tenantId,
    };
  }

  async getUsersByIds(userIds: string[]): Promise<IdentityUser[]> {
    if (userIds.length === 0) return [];

    const users = await this.prisma.identity.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, email: true, tenantId: true },
    });

    return users.map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`.trim(),
      email: u.email,
      tenantId: u.tenantId,
    }));
  }

  async getTenantById(tenantId: string): Promise<IdentityTenant | null> {
    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true },
    });

    if (!tenant) return null;
    return {
      id: tenant.id,
      name: tenant.name,
      hasDedicatedDb: false, // read from platform.package if needed
    };
  }

  async validateToken(_token: string): Promise<{ userId: string; tenantId: string; role: string } | null> {
    // In the monolith, JWT validation is handled by JwtAuthGuard (in-process).
    // This method is a no-op placeholder — it returns null to indicate
    // "use the existing in-process guard, do not call this method in monolith."
    // When extracting, replace with a real JWT verification using the Identity
    // service's public key or an introspection endpoint.
    return null;
  }
}
