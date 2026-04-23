"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUDIT_ENTITY_KEY = void 0;
exports.AuditEntity = AuditEntity;
const common_1 = require("@nestjs/common");
exports.AUDIT_ENTITY_KEY = 'audit:entityType';
function AuditEntity(entityType) {
    return (0, common_1.SetMetadata)(exports.AUDIT_ENTITY_KEY, entityType);
}
//# sourceMappingURL=audit-entity.decorator.js.map