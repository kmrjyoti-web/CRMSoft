import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CleanupOldLogsCommand } from './cleanup-old-logs.command';
import { AuditCleanupService } from '../../../services/audit-cleanup.service';

@CommandHandler(CleanupOldLogsCommand)
export class CleanupOldLogsHandler implements ICommandHandler<CleanupOldLogsCommand> {
    private readonly logger = new Logger(CleanupOldLogsHandler.name);

  constructor(private readonly cleanupService: AuditCleanupService) {}

  async execute(_command: CleanupOldLogsCommand) {
    try {
      return this.cleanupService.cleanupOldLogs();
    } catch (error) {
      this.logger.error(`CleanupOldLogsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
