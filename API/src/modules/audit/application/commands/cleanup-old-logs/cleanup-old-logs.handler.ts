import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CleanupOldLogsCommand } from './cleanup-old-logs.command';
import { AuditCleanupService } from '../../../services/audit-cleanup.service';

@CommandHandler(CleanupOldLogsCommand)
export class CleanupOldLogsHandler implements ICommandHandler<CleanupOldLogsCommand> {
  constructor(private readonly cleanupService: AuditCleanupService) {}

  async execute(_command: CleanupOldLogsCommand) {
    return this.cleanupService.cleanupOldLogs();
  }
}
