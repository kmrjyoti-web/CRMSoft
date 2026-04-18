import { RetentionAction } from '@prisma/identity-client';
export declare class UpdateDataRetentionDto {
    retentionDays?: number;
    action?: RetentionAction;
    scopeFilter?: Record<string, any>;
    isEnabled?: boolean;
    requireApproval?: boolean;
    notifyBeforeDays?: number;
}
