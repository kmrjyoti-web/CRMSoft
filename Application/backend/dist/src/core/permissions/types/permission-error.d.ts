import { ForbiddenException } from '@nestjs/common';
export declare class PermissionError extends ForbiddenException {
    readonly code: string;
    readonly action: string;
    readonly deniedBy?: string | undefined;
    constructor(code: string, action: string, deniedBy?: string | undefined);
}
export declare class ApprovalRequiredError extends ForbiddenException {
    readonly approvalRequestId: string;
    readonly checkerRole: string;
    readonly action: string;
    constructor(approvalRequestId: string, checkerRole: string, action: string);
}
export declare const PERMISSION_ERRORS: {
    readonly RBAC_DENIED: "No role permission found for this action";
    readonly UBAC_DENIED: "User-level override denies this action";
    readonly ROLE_LEVEL_DENIED: "Insufficient role level for this action";
    readonly DEPT_HIERARCHY_DENIED: "Department access not permitted";
    readonly OWNERSHIP_DENIED: "Not an owner of this resource";
    readonly MAKER_CHECKER_REQUIRED: "This action requires maker-checker approval";
    readonly APPROVAL_EXPIRED: "Approval request has expired";
    readonly APPROVAL_REJECTED: "Approval request was rejected";
};
export type PermissionErrorCode = keyof typeof PERMISSION_ERRORS;
