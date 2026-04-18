"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationMapper = void 0;
const communication_entity_1 = require("../../domain/entities/communication.entity");
class CommunicationMapper {
    static toDomain(raw) {
        return communication_entity_1.CommunicationEntity.fromPersistence({
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
    static toPersistence(entity) {
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
exports.CommunicationMapper = CommunicationMapper;
//# sourceMappingURL=communication.mapper.js.map