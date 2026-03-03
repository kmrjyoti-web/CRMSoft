import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PermissionContext } from '../types/permission-context';

interface CachedRolePermissions {
  permissions: string[];
  cachedAt: number;
}

/**
 * RBAC Engine — Role-Based Access Control with wildcard matching.
 * Checks if the user's role has the required permission.
 */
@Injectable()
export class RbacEngine {
  private roleCache = new Map<string, CachedRolePermissions>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly prisma: PrismaService) {}

  /** Check if context's role has the required permission. */
  async check(ctx: PermissionContext): Promise<boolean> {
    // SUPER_ADMIN (level 0) always passes
    if (ctx.roleLevel === 0) return true;

    const permissions = await this.getRolePermissions(ctx.roleId);
    return this.matchesAny(ctx.action, permissions);
  }

  /**
   * Wildcard permission matching:
   *   "*"            → matches everything
   *   "leads:*"      → matches "leads:create", "leads:delete", etc.
   *   "leads:create" → exact match only
   */
  matchesPermission(action: string, permission: string): boolean {
    if (permission === '*') return true;
    if (permission.endsWith(':*')) {
      return action.startsWith(permission.slice(0, -1));
    }
    return action === permission;
  }

  /** Check if action matches any of the given permissions. */
  matchesAny(action: string, permissions: string[]): boolean {
    return permissions.some((p) => this.matchesPermission(action, p));
  }

  /** Load and cache role permissions from DB. */
  async getRolePermissions(roleId: string): Promise<string[]> {
    const cached = this.roleCache.get(roleId);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL) {
      return cached.permissions;
    }

    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });

    const permissions = rolePermissions.map(
      (rp) => `${rp.permission.module}:${rp.permission.action}`,
    );

    this.roleCache.set(roleId, { permissions, cachedAt: Date.now() });
    return permissions;
  }

  invalidateRole(roleId: string): void {
    this.roleCache.delete(roleId);
  }

  invalidateAll(): void {
    this.roleCache.clear();
  }
}
