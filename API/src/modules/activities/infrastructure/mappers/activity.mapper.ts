import { ActivityEntity } from '../../domain/entities/activity.entity';

export class ActivityMapper {
  static toDomain(raw: any): ActivityEntity {
    return ActivityEntity.fromPersistence({
      id: raw.id,
      type: raw.type,
      subject: raw.subject,
      description: raw.description,
      outcome: raw.outcome,
      duration: raw.duration,
      scheduledAt: raw.scheduledAt,
      endTime: raw.endTime,
      completedAt: raw.completedAt,
      latitude: raw.latitude,
      longitude: raw.longitude,
      locationName: raw.locationName,
      leadId: raw.leadId,
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

  static toPersistence(entity: ActivityEntity): any {
    return {
      id: entity.id,
      type: entity.type,
      subject: entity.subject,
      description: entity.description || null,
      outcome: entity.outcome || null,
      duration: entity.duration ?? null,
      scheduledAt: entity.scheduledAt || null,
      endTime: entity.endTime || null,
      completedAt: entity.completedAt || null,
      latitude: entity.latitude ?? null,
      longitude: entity.longitude ?? null,
      locationName: entity.locationName || null,
      leadId: entity.leadId || null,
      contactId: entity.contactId || null,
      isActive: entity.isActive,
      isDeleted: entity.isDeleted,
      deletedAt: entity.deletedAt,
      deletedById: entity.deletedById,
      createdById: entity.createdById,
    };
  }
}
