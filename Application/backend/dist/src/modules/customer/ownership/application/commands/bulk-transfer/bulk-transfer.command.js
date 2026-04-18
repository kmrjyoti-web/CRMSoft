"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkTransferCommand = void 0;
class BulkTransferCommand {
    constructor(fromUserId, toUserId, transferredById, reason, reasonDetail, entityType) {
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.transferredById = transferredById;
        this.reason = reason;
        this.reasonDetail = reasonDetail;
        this.entityType = entityType;
    }
}
exports.BulkTransferCommand = BulkTransferCommand;
//# sourceMappingURL=bulk-transfer.command.js.map