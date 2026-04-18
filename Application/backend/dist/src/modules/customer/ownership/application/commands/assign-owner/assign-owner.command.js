"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignOwnerCommand = void 0;
class AssignOwnerCommand {
    constructor(entityType, entityId, userId, ownerType, assignedById, reason, reasonDetail, method, validFrom, validTo) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.userId = userId;
        this.ownerType = ownerType;
        this.assignedById = assignedById;
        this.reason = reason;
        this.reasonDetail = reasonDetail;
        this.method = method;
        this.validFrom = validFrom;
        this.validTo = validTo;
    }
}
exports.AssignOwnerCommand = AssignOwnerCommand;
//# sourceMappingURL=assign-owner.command.js.map