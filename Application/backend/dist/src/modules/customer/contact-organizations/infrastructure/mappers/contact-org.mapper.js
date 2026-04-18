"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactOrgMapper = void 0;
const contact_organization_entity_1 = require("../../domain/entities/contact-organization.entity");
class ContactOrgMapper {
    static toDomain(raw) {
        return contact_organization_entity_1.ContactOrganizationEntity.fromPersistence({
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
    static toPersistence(entity) {
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
exports.ContactOrgMapper = ContactOrgMapper;
//# sourceMappingURL=contact-org.mapper.js.map