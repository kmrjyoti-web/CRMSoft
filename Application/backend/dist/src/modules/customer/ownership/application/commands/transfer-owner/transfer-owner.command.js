"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferOwnerCommand = void 0;
class TransferOwnerCommand {
    constructor(entityType, entityId, fromUserId, toUserId, ownerType, transferredById, reason, reasonDetail) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.ownerType = ownerType;
        this.transferredById = transferredById;
        this.reason = reason;
        this.reasonDetail = reasonDetail;
    }
}
exports.TransferOwnerCommand = TransferOwnerCommand;
//# sourceMappingURL=transfer-owner.command.js.map