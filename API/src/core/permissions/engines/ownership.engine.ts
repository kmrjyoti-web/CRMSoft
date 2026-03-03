import { Injectable } from '@nestjs/common';
import { EntityType, OwnerType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PermissionContext } from '../types/permission-context';

/** Maps action suffix to minimum required ownership level. */
const ACTION_LEVEL: Record<string, OwnerType[]> = {
  delete: [OwnerType.PRIMARY_OWNER],
  create: [OwnerType.PRIMARY_OWNER, OwnerType.CO_OWNER],
  update: [OwnerType.PRIMARY_OWNER, OwnerType.CO_OWNER, OwnerType.DELEGATED_OWNER],
  read: [OwnerType.PRIMARY_OWNER, OwnerType.CO_OWNER, OwnerType.DELEGATED_OWNER, OwnerType.WATCHER],
};

/**
 * Ownership Engine (ReBAC) — checks entity ownership via EntityOwner table.
 * Maps action to required relationship level:
 *   - owner → full CRUD
 *   - co-owner → create+read+update
 *   - watcher → read only
 * SUPER_ADMIN/ADMIN bypass ownership checks.
 */
@Injectable()
export class OwnershipEngine {
  constructor(private readonly prisma: PrismaService) {}

  /** Check if user owns the target resource with sufficient relationship. */
  async check(ctx: PermissionContext): Promise<boolean> {
    // SUPER_ADMIN/ADMIN bypass
    if (ctx.roleLevel <= 1) return true;
    // No resource specified = skip
    if (!ctx.resourceType || !ctx.resourceId) return true;

    const entityType = this.mapResourceToEntityType(ctx.resourceType);
    if (!entityType) return true;

    // Determine required owner types based on action suffix
    const actionSuffix = ctx.action.split(':').pop() || '';
    const allowedTypes = ACTION_LEVEL[actionSuffix] || ACTION_LEVEL.read;

    const ownership = await this.prisma.entityOwner.findFirst({
      where: {
        entityType,
        entityId: ctx.resourceId,
        userId: ctx.userId,
        ownerType: { in: allowedTypes },
        isActive: true,
        OR: [{ validTo: null }, { validTo: { gt: new Date() } }],
      },
    });

    return !!ownership;
  }

  /** Check if user is the PRIMARY_OWNER of a resource. */
  async isPrimaryOwner(userId: string, resourceType: string, entityId: string): Promise<boolean> {
    const mapped = this.mapResourceToEntityType(resourceType);
    if (!mapped) return false;
    const owner = await this.prisma.entityOwner.findFirst({
      where: { entityType: mapped, entityId, userId, ownerType: OwnerType.PRIMARY_OWNER, isActive: true },
    });
    return !!owner;
  }

  /** Get all active owners of a resource. */
  async getOwners(resourceType: string, entityId: string) {
    const mapped = this.mapResourceToEntityType(resourceType);
    if (!mapped) return [];
    return this.prisma.entityOwner.findMany({
      where: {
        entityType: mapped,
        entityId,
        isActive: true,
        OR: [{ validTo: null }, { validTo: { gt: new Date() } }],
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  private mapResourceToEntityType(resourceType: string): EntityType | null {
    const mapping: Record<string, EntityType> = {
      lead: EntityType.LEAD,
      contact: EntityType.CONTACT,
      raw_contact: EntityType.RAW_CONTACT,
      organization: EntityType.ORGANIZATION,
      quotation: EntityType.QUOTATION,
      ticket: EntityType.TICKET,
    };
    return mapping[resourceType.toLowerCase()] || null;
  }
}
