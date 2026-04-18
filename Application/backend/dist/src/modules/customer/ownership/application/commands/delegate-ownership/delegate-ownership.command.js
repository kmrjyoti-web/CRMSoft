"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelegateOwnershipCommand = void 0;
class DelegateOwnershipCommand {
    constructor(fromUserId, toUserId, startDate, endDate, reason, delegatedById, entityType) {
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.reason = reason;
        this.delegatedById = delegatedById;
        this.entityType = entityType;
    }
}
exports.DelegateOwnershipCommand = DelegateOwnershipCommand;
//# sourceMappingURL=delegate-ownership.command.js.map