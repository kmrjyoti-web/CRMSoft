import { ICommandHandler } from '@nestjs/cqrs';
import { CleanupOldLogsCommand } from './cleanup-old-logs.command';
import { AuditCleanupService } from '../../../services/audit-cleanup.service';
export declare class CleanupOldLogsHandler implements ICommandHandler<CleanupOldLogsCommand> {
    private readonly cleanupService;
    private readonly logger;
    constructor(cleanupService: AuditCleanupService);
    execute(_command: CleanupOldLogsCommand): Promise<{
        totalDeleted: number;
    }>;
}
