import { ContactEntity } from '../../domain/entities/contact.entity';

export class ContactMapper {
  static toDomain(raw: Record<string, unknown>): ContactEntity {
    return ContactEntity.fromPersistence({
      id: raw.id,
      firstName: raw.firstName,
      lastName: raw.lastName,
      designation: raw.designation,
      department: raw.department,
      notes: raw.notes,
      isActive: raw.isActive,
      isDeleted: raw.isDeleted,
      deletedAt: raw.deletedAt,
      deletedById: raw.deletedById,
      createdById: raw.createdById,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(entity: ContactEntity): any {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      designation: entity.designation || null,
      department: entity.department || null,
      notes: entity.notes || null,
      isActive: entity.isActive,
      isDeleted: entity.isDeleted,
      deletedAt: entity.deletedAt,
      deletedById: entity.deletedById,
      createdById: entity.createdById,
    };
  }
}
