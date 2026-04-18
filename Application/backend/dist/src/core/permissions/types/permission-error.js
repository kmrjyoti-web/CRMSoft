"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_ERRORS = exports.ApprovalRequiredError = exports.PermissionError = void 0;
const common_1 = require("@nestjs/common");
class PermissionError extends common_1.ForbiddenException {
    constructor(code, action, deniedBy) {
        super({ error: 'FORBIDDEN', code, action, deniedBy });
        this.code = code;
        this.action = action;
        this.deniedBy = deniedBy;
    }
}
exports.PermissionError = PermissionError;
class ApprovalRequiredError extends common_1.ForbiddenException {
    constructor(approvalRequestId, checkerRole, action) {
        super({
            error: 'APPROVAL_REQUIRED',
            approvalRequestId,
            checkerRole,
            action,
        });
        this.approvalRequestId = approvalRequestId;
        this.checkerRole = checkerRole;
        this.action = action;
    }
}
exports.ApprovalRequiredError = ApprovalRequiredError;
exports.PERMISSION_ERRORS = {
    RBAC_DENIED: 'No role permission found for this action',
    UBAC_DENIED: 'User-level override denies this action',
    ROLE_LEVEL_DENIED: 'Insufficient role level for this action',
    DEPT_HIERARCHY_DENIED: 'Department access not permitted',
    OWNERSHIP_DENIED: 'Not an owner of this resource',
    MAKER_CHECKER_REQUIRED: 'This action requires maker-checker approval',
    APPROVAL_EXPIRED: 'Approval request has expired',
    APPROVAL_REJECTED: 'Approval request was rejected',
};
//# sourceMappingURL=permission-error.js.map