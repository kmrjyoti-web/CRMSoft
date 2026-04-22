import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SyncInboxCommand } from './sync-inbox.command';
import { EmailSyncService } from '../../../services/email-sync.service';

@CommandHandler(SyncInboxCommand)
export class SyncInboxHandler implements ICommandHandler<SyncInboxCommand> {
  private readonly logger = new Logger(SyncInboxHandler.name);

  constructor(private readonly emailSyncService: EmailSyncService) {}

  async execute(cmd: SyncInboxCommand) {
    try {
      const result = await this.emailSyncService.syncAccount(cmd.accountId);
      this.logger.log(`Inbox sync completed for account ${cmd.accountId}: ${result.newEmails} new, ${result.errors} errors`);
      return result;
    } catch (error) {
      this.logger.error(`SyncInboxHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
