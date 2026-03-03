import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { EntityResolverService } from './entity-resolver.service';

@Injectable()
export class SyncScopeResolverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entityResolver: EntityResolverService,
  ) {}

  /**
   * Build a Prisma `where` clause that scopes records for a given user.
   * @param userId - The user performing the sync
   * @param entityName - The entity being synced
   * @param downloadScope - "OWNED" | "TEAM" | "ALL"
   * @returns Prisma where clause to merge into queries
   */
  async resolveScope(
    userId: string,
    entityName: string,
    downloadScope: string,
  ): Promise<Record<string, any>> {
    switch (downloadScope) {
      case 'OWNED':
        return this.buildOwnedScope(userId, entityName);
      case 'TEAM':
        return this.buildTeamScope(userId, entityName);
      case 'ALL':
        return {};
      default:
        return this.buildOwnedScope(userId, entityName);
    }
  }

  private buildOwnedScope(
    userId: string,
    entityName: string,
  ): Record<string, any> {
    const config = this.entityResolver.getEntityConfig(entityName);
    const ownerFields = config.ownerFields;

    if (ownerFields.length === 0) {
      // Global entities (LookupValue, Role, etc.) — no user scoping
      return {};
    }

    if (ownerFields.length === 1) {
      return { [ownerFields[0]]: userId };
    }

    // Multiple owner fields (e.g., Lead has allocatedToId + createdById)
    return {
      OR: ownerFields.map((field) => ({ [field]: userId })),
    };
  }

  private async buildTeamScope(
    userId: string,
    entityName: string,
  ): Promise<Record<string, any>> {
    const config = this.entityResolver.getEntityConfig(entityName);
    const ownerFields = config.ownerFields;

    if (ownerFields.length === 0) {
      return {};
    }

    // Find the user's department path to identify team members
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true },
    });

    if (!user?.departmentId) {
      // No department → fall back to OWNED scope
      return this.buildOwnedScope(userId, entityName);
    }

    // Find all users in the same department (and sub-departments)
    const department = await this.prisma.department.findUnique({
      where: { id: user.departmentId },
      select: { path: true },
    });

    if (!department?.path) {
      return this.buildOwnedScope(userId, entityName);
    }

    // Get all departments under the user's department path
    const departments = await this.prisma.department.findMany({
      where: { path: { startsWith: department.path } },
      select: { id: true },
    });
    const deptIds = departments.map((d) => d.id);

    // Get all team member IDs
    const teamMembers = await this.prisma.user.findMany({
      where: { departmentId: { in: deptIds }, status: 'ACTIVE' },
      select: { id: true },
    });
    const teamUserIds = teamMembers.map((u) => u.id);

    if (ownerFields.length === 1) {
      return { [ownerFields[0]]: { in: teamUserIds } };
    }

    return {
      OR: ownerFields.map((field) => ({
        [field]: { in: teamUserIds },
      })),
    };
  }
}
