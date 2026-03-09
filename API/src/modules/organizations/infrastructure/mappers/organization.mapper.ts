import { OrganizationEntity } from '../../domain/entities/organization.entity';

export class OrganizationMapper {
  static toDomain(raw: any): OrganizationEntity {
    return OrganizationEntity.fromPersistence({
      id: raw.id,
      name: raw.name,
      website: raw.website,
      email: raw.email,
      phone: raw.phone,
      gstNumber: raw.gstNumber,
      address: raw.address,
      city: raw.city,
      state: raw.state,
      country: raw.country,
      pincode: raw.pincode,
      industry: raw.industry,
      annualRevenue: raw.annualRevenue,
      notes: raw.notes,
      isActive: raw.isActive,
      createdById: raw.createdById,
      isDeleted: raw.isDeleted,
      deletedAt: raw.deletedAt,
      deletedById: raw.deletedById,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(entity: OrganizationEntity): any {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email || null,
      phone: entity.phone || null,
      website: entity.website || null,
      gstNumber: entity.gstNumber || null,
      address: entity.address || null,
      city: entity.city || null,
      state: entity.state || null,
      country: entity.country || null,
      pincode: entity.pincode || null,
      industry: entity.industry || null,
      annualRevenue: entity.annualRevenue ?? null,
      notes: entity.notes || null,
      isActive: entity.isActive,
      createdById: entity.createdById,
      isDeleted: entity.isDeleted,
      deletedAt: entity.deletedAt,
      deletedById: entity.deletedById,
    };
  }
}
