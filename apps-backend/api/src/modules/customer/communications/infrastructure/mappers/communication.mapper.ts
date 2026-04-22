import { CommunicationEntity } from '../../domain/entities/communication.entity';

export class CommunicationMapper {
  static toDomain(raw: Record<string, unknown>): CommunicationEntity {
    return CommunicationEntity.fromPersistence({
      id: raw.id,
      type: raw.type,
      value: raw.value,
      priorityType: raw.priorityType,
      isPrimary: raw.isPrimary,
      isVerified: raw.isVerified,
      label: raw.label ?? undefined,
      rawContactId: raw.rawContactId ?? undefined,
      contactId: raw.contactId ?? undefined,
      organizationId: raw.organizationId ?? undefined,
      leadId: raw.leadId ?? undefined,
      notes: raw.notes ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(entity: CommunicationEntity): any {
    return {
      id: entity.id,
      type: entity.type.value,
      value: entity.value,
      priorityType: entity.priorityType.value,
      isPrimary: entity.isPrimary,
      isVerified: entity.isVerified,
      label: entity.label || null,
      rawContactId: entity.rawContactId || null,
      contactId: entity.contactId || null,
      organizationId: entity.organizationId || null,
      leadId: entity.leadId || null,
      notes: entity.notes || null,
    };
  }
}
