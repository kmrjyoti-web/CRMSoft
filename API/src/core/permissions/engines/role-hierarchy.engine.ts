import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PermissionContext } from '../types/permission-context';

export interface RoleLevelInfo {
  id: string;
  name: string;
  level: number;
  canManageLevels: number[];
}

/**
 * Role Hierarchy Engine — level-based permission inheritance.
 * Level 0 = SUPER_ADMIN (top), Level 6 = VIEWER (bottom).
 * Lower number = more authority. Roles inherit permissions from higher level numbers.
 */
@Injectable()
export class RoleHierarchyEngine {
  private roleMap = new Map<string, RoleLevelInfo>();
  private cacheLoadedAt = 0;
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  constructor(private readonly prisma: PrismaService) {}

  /** Check if user's role level is sufficient for the action. */
  async check(ctx: PermissionContext, targetRoleLevel?: number): Promise<boolean> {
    if (ctx.roleLevel === 0) return true; // SUPER_ADMIN always passes
    if (targetRoleLevel === undefined) return true; // No target = pass through

    const role = await this.getRoleInfo(ctx.roleId);
    if (!role) return false;

    // Explicit canManageLevels override
    if (role.canManageLevels.length > 0 && role.canManageLevels.includes(targetRoleLevel)) {
      return true;
    }

    // Default: lower level number = higher authority
    return ctx.roleLevel < targetRoleLevel;
  }

  /** Get all effective permissions for a user (own role + inherited from lower-authority roles). */
  async getEffectivePermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roleId: true, role: { select: { level: true } } },
    });
    if (!user) return [];

    const userLevel = user.role.level;

    // SUPER_ADMIN inherits all
    if (userLevel === 0) {
      const all = await this.prisma.permission.findMany();
      return all.map((p) => `${p.module}:${p.action}`);
    }

    // Get own role + all roles with HIGHER level number (lower authority)
    const inheritableRoles = await this.prisma.role.findMany({
      where: { level: { gte: userLevel } },
      select: { id: true },
    });

    const roleIds = inheritableRoles.map((r) => r.id);
    const rolePerms = await this.prisma.rolePermission.findMany({
      where: { roleId: { in: roleIds } },
      include: { permission: true },
    });

    const permSet = new Set(
      rolePerms.map((rp) => `${rp.permission.module}:${rp.permission.action}`),
    );
    return [...permSet];
  }

  /** Check if manager can manage target user based on role levels. */
  async canManageUser(managerUserId: string, targetUserId: string): Promise<boolean> {
    const [manager, target] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: managerUserId },
        select: { role: { select: { id: true, level: true, canManageLevels: true } } },
      }),
      this.prisma.user.findUnique({
        where: { id: targetUserId },
        select: { role: { select: { level: true } } },
      }),
    ]);

    if (!manager || !target) return false;
    if (manager.role.level === 0) return true;

    if (manager.role.canManageLevels.length > 0) {
      return manager.role.canManageLevels.includes(target.role.level);
    }

    return manager.role.level < target.role.level;
  }

  /** Get cached role info by ID. */
  async getRoleInfo(roleId: string): Promise<RoleLevelInfo | null> {
    await this.ensureCacheLoaded();
    return this.roleMap.get(roleId) || null;
  }

  private async ensureCacheLoaded(): Promise<void> {
    if (this.roleMap.size > 0 && Date.now() - this.cacheLoadedAt < this.CACHE_TTL) {
      return;
    }
    const roles = await this.prisma.role.findMany({
      select: { id: true, name: true, level: true, canManageLevels: true },
    });
    this.roleMap.clear();
    for (const role of roles) this.roleMap.set(role.id, role);
    this.cacheLoadedAt = Date.now();
  }

  /** Get ALL permission codes in the system (for super admin). */
  async getAllPermissionCodes(): Promise<string[]> {
    const all = await this.prisma.permission.findMany();
    return all.map((p) => `${p.module}:${p.action}`);
  }

  invalidateAll(): void {
    this.roleMap.clear();
    this.cacheLoadedAt = 0;
  }
}
