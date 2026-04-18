"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawContactMapper = void 0;
const raw_contact_entity_1 = require("../../domain/entities/raw-contact.entity");
class RawContactMapper {
    static toDomain(raw) {
        return raw_contact_entity_1.RawContactEntity.fromPersistence({
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
    static toPersistence(entity) {
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
exports.RawContactMapper = RawContactMapper;
//# sourceMappingURL=raw-contact.mapper.js.map