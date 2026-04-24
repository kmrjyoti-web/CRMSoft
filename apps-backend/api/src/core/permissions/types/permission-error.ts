import { ForbiddenException } from '@nestjs/common';

export class PermissionError extends ForbiddenException {
  constructor(
    public readonly code: string,
    public readonly action: string,
    public readonly deniedBy?: string,
  ) {
    super({ error: 'FORBIDDEN', code, action, deniedBy });
  }
}

export class ApprovalRequiredError extends ForbiddenException {
  constructor(
    public readonly approvalRequestId: string,
    public readonly checkerRole: string,
    public readonly action: string,
  ) {
    super({
      error: 'APPROVAL_REQUIRED',
      approvalRequestId,
      checkerRole,
      action,
    });
  }
}

export const PERMISSION_ERRORS = {
  RBAC_DENIED: 'No role permission found for this action',
  UBAC_DENIED: 'User-level override denies this action',
  ROLE_LEVEL_DENIED: 'Insufficient role level for this action',
  DEPT_HIERARCHY_DENIED: 'Department access not permitted',
  OWNERSHIP_DENIED: 'Not an owner of this resource',
  MAKER_CHECKER_REQUIRED: 'This action requires maker-checker approval',
  APPROVAL_EXPIRED: 'Approval request has expired',
  APPROVAL_REJECTED: 'Approval request was rejected',
} as const;

export type PermissionErrorCode = keyof typeof PERMISSION_ERRORS;
