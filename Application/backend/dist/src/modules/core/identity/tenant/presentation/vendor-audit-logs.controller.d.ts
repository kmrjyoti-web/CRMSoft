import { ApiResponse } from '../../../../../common/utils/api-response';
import { VendorAuditLogsService } from '../services/vendor-audit-logs.service';
export declare class VendorAuditLogsController {
    private readonly vendorAuditLogsService;
    constructor(vendorAuditLogsService: VendorAuditLogsService);
    list(page?: number, limit?: number, tenantId?: string, category?: string, action?: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        category: string;
        metadata: import("@prisma/platform-client/runtime/library").JsonValue | null;
        action: string;
        details: string | null;
        performedById: string | null;
        ipAddress: string | null;
    }[]>>;
}
