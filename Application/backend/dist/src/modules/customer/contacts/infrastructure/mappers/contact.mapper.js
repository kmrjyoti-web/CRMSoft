"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactMapper = void 0;
const contact_entity_1 = require("../../domain/entities/contact.entity");
class ContactMapper {
    static toDomain(raw) {
        return contact_entity_1.ContactEntity.fromPersistence({
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
    static toPersistence(entity) {
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
exports.ContactMapper = ContactMapper;
//# sourceMappingURL=contact.mapper.js.map