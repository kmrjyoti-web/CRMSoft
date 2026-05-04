import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateAuditLogCommand } from './create-audit-log.command';
import { AuditCoreService } from '../../../services/audit-core.service';

@CommandHandler(CreateAuditLogCommand)
export class CreateAuditLogHandler implements ICommandHandler<CreateAuditLogCommand> {
    private readonly logger = new Logger(CreateAuditLogHandler.name);

  constructor(private readonly auditService: AuditCoreService) {}

  async execute(command: CreateAuditLogCommand) {
    try {
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
    } catch (error) {
      this.logger.error(`CreateAuditLogHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
