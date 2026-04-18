"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevokeOwnerCommand = void 0;
class RevokeOwnerCommand {
    constructor(entityType, entityId, userId, ownerType, revokedById, reason) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.userId = userId;
        this.ownerType = ownerType;
        this.revokedById = revokedById;
        this.reason = reason;
    }
}
exports.RevokeOwnerCommand = RevokeOwnerCommand;
//# sourceMappingURL=revoke-owner.command.js.map