import { ContactOrganizationEntity } from '../../domain/entities/contact-organization.entity';

export class ContactOrgMapper {
  static toDomain(raw: Record<string, unknown>): ContactOrganizationEntity {
    return ContactOrganizationEntity.fromPersistence({
      id: raw.id,
      contactId: raw.contactId,
      organizationId: raw.organizationId,
      relationType: raw.relationType,
      isPrimary: raw.isPrimary,
      designation: raw.designation ?? undefined,
      department: raw.department ?? undefined,
      startDate: raw.startDate ?? undefined,
      endDate: raw.endDate ?? undefined,
      isActive: raw.isActive,
      notes: raw.notes ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(entity: ContactOrganizationEntity): any {
    return {
      id: entity.id,
      contactId: entity.contactId,
      organizationId: entity.organizationId,
      relationType: entity.relationType.value,
      isPrimary: entity.isPrimary,
      designation: entity.designation || null,
      department: entity.department || null,
      startDate: entity.startDate || null,
      endDate: entity.endDate || null,
      isActive: entity.isActive,
    };
  }
}
