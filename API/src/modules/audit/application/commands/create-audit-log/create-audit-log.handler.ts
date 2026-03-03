import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAuditLogCommand } from './create-audit-log.command';
import { AuditCoreService } from '../../../services/audit-core.service';

@CommandHandler(CreateAuditLogCommand)
export class CreateAuditLogHandler implements ICommandHandler<CreateAuditLogCommand> {
  constructor(private readonly auditService: AuditCoreService) {}

  async execute(command: CreateAuditLogCommand) {
    return this.auditService.logAction({
      entityType: command.entityType,
      entityId: command.entityId,
      action: command.action,
      summary: command.summary,
      source: command.source,
      module: command.module,
      performedById: command.performedById,
      performedByName: command.performedByName,
      changes: command.changes,
      correlationId: command.correlationId,
      tags: command.tags,
    });
  }
}
