import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../../common/utils/api-response';
import { AuditQueryDto } from './dto/audit-query.dto';
import { SearchAuditDto } from './dto/search-audit.dto';
import { CreateAuditLogDto, ExportAuditDto } from './dto/retention-policy.dto';
import { AuditExportService } from '../services/audit-export.service';
export declare class AuditController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly exportService;
    constructor(commandBus: CommandBus, queryBus: QueryBus, exportService: AuditExportService);
    entityTimeline(entityType: string, entityId: string, q: AuditQueryDto): Promise<ApiResponse<any>>;
    fieldHistory(entityType: string, entityId: string, fieldName: string, q: AuditQueryDto): Promise<ApiResponse<any>>;
    globalFeed(q: AuditQueryDto): Promise<ApiResponse<any>>;
    userActivity(userId: string, q: AuditQueryDto): Promise<ApiResponse<any>>;
    search(q: SearchAuditDto): Promise<ApiResponse<any>>;
    stats(q: AuditQueryDto): Promise<ApiResponse<any>>;
    userStats(userId: string, q: AuditQueryDto): Promise<ApiResponse<any>>;
    detail(id: string): Promise<ApiResponse<any>>;
    diff(id: string): Promise<ApiResponse<any>>;
    exportAudit(dto: ExportAuditDto, userId: string): Promise<ApiResponse<{
        fileUrl: string;
        recordCount: number;
    }>>;
    createLog(dto: CreateAuditLogDto): Promise<ApiResponse<any>>;
}
