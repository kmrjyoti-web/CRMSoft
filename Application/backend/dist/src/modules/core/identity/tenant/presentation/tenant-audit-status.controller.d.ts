import { ApiResponse } from '../../../../../common/utils/api-response';
import { TenantAuditService } from '../services/tenant-audit.service';
export declare class TenantAuditStatusController {
    private readonly auditService;
    constructor(auditService: TenantAuditService);
    getAuditStatus(req: any): Promise<ApiResponse<null> | ApiResponse<{
        isUnderAudit: boolean;
        reason: string;
        startedAt: Date;
        startedByName: string | null;
    }>>;
}
