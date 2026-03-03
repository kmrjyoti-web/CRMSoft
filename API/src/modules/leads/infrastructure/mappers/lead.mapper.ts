import { LeadEntity } from '../../domain/entities/lead.entity';

export class LeadMapper {
  static toDomain(raw: any): LeadEntity {
    return LeadEntity.fromPersistence({
      id: raw.id,
      leadNumber: raw.leadNumber,
      contactId: raw.contactId,
      organizationId: raw.organizationId ?? undefined,
      status: raw.status,
      priority: raw.priority,
      expectedValue: raw.expectedValue ? Number(raw.expectedValue) : undefined,
      expectedCloseDate: raw.expectedCloseDate ?? undefined,
      allocatedToId: raw.allocatedToId ?? undefined,
      allocatedAt: raw.allocatedAt ?? undefined,
      lostReason: raw.lostReason ?? undefined,
      notes: raw.notes ?? undefined,
      isActive: raw.isActive,
      isDeleted: raw.isDeleted,
      deletedAt: raw.deletedAt,
      deletedById: raw.deletedById,
      createdById: raw.createdById,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(entity: LeadEntity): any {
    return {
      id: entity.id,
      leadNumber: entity.leadNumber,
      contactId: entity.contactId,
      organizationId: entity.organizationId || null,
      status: entity.status.value,
      priority: entity.priority,
      expectedValue: entity.expectedValue ?? null,
      expectedCloseDate: entity.expectedCloseDate || null,
      allocatedToId: entity.allocatedToId || null,
      allocatedAt: entity.allocatedAt || null,
      lostReason: entity.lostReason || null,
      notes: entity.notes || null,
      isActive: entity.isActive,
      isDeleted: entity.isDeleted,
      deletedAt: entity.deletedAt,
      deletedById: entity.deletedById,
      createdById: entity.createdById,
    };
  }
}
