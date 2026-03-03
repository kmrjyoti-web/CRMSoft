export interface PermissionResult {
  allowed: boolean;
  reason?: string;             // "RBAC_DENIED", "OWNERSHIP_DENIED", etc.
  deniedBy?: string;           // "RBAC", "DEPT_HIERARCHY", etc.
  makerChecker?: {
    requiresApproval: boolean;
    approvalRequestId?: string;
    checkerRole?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  };
}
