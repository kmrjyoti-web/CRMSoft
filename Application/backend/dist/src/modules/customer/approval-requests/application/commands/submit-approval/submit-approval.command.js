"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitApprovalCommand = void 0;
class SubmitApprovalCommand {
    constructor(entityType, entityId, action, makerId, roleName, roleLevel, payload, makerNote) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.action = action;
        this.makerId = makerId;
        this.roleName = roleName;
        this.roleLevel = roleLevel;
        this.payload = payload;
        this.makerNote = makerNote;
    }
}
exports.SubmitApprovalCommand = SubmitApprovalCommand;
//# sourceMappingURL=submit-approval.command.js.map