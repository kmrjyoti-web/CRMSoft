export interface PermissionResult {
    allowed: boolean;
    reason?: string;
    deniedBy?: string;
    makerChecker?: {
        requiresApproval: boolean;
        approvalRequestId?: string;
        checkerRole?: string;
        status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
    };
}
