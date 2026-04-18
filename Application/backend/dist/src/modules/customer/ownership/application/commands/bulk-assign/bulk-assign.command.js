"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkAssignCommand = void 0;
class BulkAssignCommand {
    constructor(entityType, entityIds, userId, ownerType, reason, assignedById) {
        this.entityType = entityType;
        this.entityIds = entityIds;
        this.userId = userId;
        this.ownerType = ownerType;
        this.reason = reason;
        this.assignedById = assignedById;
    }
}
exports.BulkAssignCommand = BulkAssignCommand;
//# sourceMappingURL=bulk-assign.command.js.map