import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../../common/utils/api-response';
import { UpdateRetentionPolicyDto } from './dto/retention-policy.dto';
import { AuditCleanupService } from '../services/audit-cleanup.service';
export declare class AuditAdminController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly cleanupService;
    constructor(commandBus: CommandBus, queryBus: QueryBus, cleanupService: AuditCleanupService);
    listPolicies(): Promise<ApiResponse<any>>;
    updatePolicy(entityType: string, dto: UpdateRetentionPolicyDto): Promise<ApiResponse<any>>;
    cleanup(): Promise<ApiResponse<any>>;
    cleanupPreview(): Promise<ApiResponse<{
        entityType: string;
        totalRecords: number;
        wouldDelete: number;
        retentionDays: number;
    }[]>>;
}
