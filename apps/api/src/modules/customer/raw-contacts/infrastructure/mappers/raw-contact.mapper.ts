import { RawContactEntity } from '../../domain/entities/raw-contact.entity';

/**
 * Maps between Prisma RawContact and Domain Entity.
 */
export class RawContactMapper {
  static toDomain(raw: Record<string, unknown>): RawContactEntity {
    return RawContactEntity.fromPersistence({
      id: raw.id,
      firstName: raw.firstName,
      lastName: raw.lastName,
      status: raw.status,
      source: raw.source,
      companyName: raw.companyName,
      designation: raw.designation,
      department: raw.department,
      notes: raw.notes,
      verifiedAt: raw.verifiedAt,
      verifiedById: raw.verifiedById,
      contactId: raw.contactId,
      isActive: raw.isActive,
      isDeleted: raw.isDeleted,
      deletedAt: raw.deletedAt,
      deletedById: raw.deletedById,
      createdById: raw.createdById,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(entity: RawContactEntity): any {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      status: entity.status.value,
      source: entity.source,
      companyName: entity.companyName || null,
      designation: entity.designation || null,
      department: entity.department || null,
      notes: entity.notes || null,
      verifiedAt: entity.verifiedAt || null,
      verifiedById: entity.verifiedById || null,
      contactId: entity.contactId || null,
      isActive: entity.isActive,
      isDeleted: entity.isDeleted,
      deletedAt: entity.deletedAt,
      deletedById: entity.deletedById,
      createdById: entity.createdById,
    };
  }
}
