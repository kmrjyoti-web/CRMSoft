import { ICommandHandler } from '@nestjs/cqrs';
import { CreateBulkAuditLogCommand } from './create-bulk-audit-log.command';
import { AuditCoreService } from '../../../services/audit-core.service';
export declare class CreateBulkAuditLogHandler implements ICommandHandler<CreateBulkAuditLogCommand> {
    private readonly auditService;
    private readonly logger;
    constructor(auditService: AuditCoreService);
    execute(command: CreateBulkAuditLogCommand): Promise<{
        logged: number;
        correlationId: string;
    }>;
}
