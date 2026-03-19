import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBulkAuditLogCommand } from './create-bulk-audit-log.command';
import { AuditCoreService } from '../../../services/audit-core.service';

@CommandHandler(CreateBulkAuditLogCommand)
export class CreateBulkAuditLogHandler implements ICommandHandler<CreateBulkAuditLogCommand> {
  constructor(private readonly auditService: AuditCoreService) {}

  async execute(command: CreateBulkAuditLogCommand) {
    const correlationId = command.correlationId || `bulk-${Date.now()}`;

    const results = await Promise.all(
      command.entityIds.map(entityId =>
        this.auditService.logAction({
          entityType: command.entityType,
          entityId,
          action: command.action,
          summary: command.summary,
          source: command.source,
          module: command.module,
          performedById: command.performedById,
          performedByName: command.performedByName,
          correlationId,
        }),
      ),
    );

    return { logged: results.filter(Boolean).length, correlationId };
  }
}
