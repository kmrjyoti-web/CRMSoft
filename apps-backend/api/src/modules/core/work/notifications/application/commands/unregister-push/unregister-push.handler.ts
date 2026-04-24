import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UnregisterPushCommand } from './unregister-push.command';
import { PreferenceService } from '../../../services/preference.service';

@CommandHandler(UnregisterPushCommand)
export class UnregisterPushHandler implements ICommandHandler<UnregisterPushCommand> {
    private readonly logger = new Logger(UnregisterPushHandler.name);

  constructor(private readonly preferenceService: PreferenceService) {}

  async execute(command: UnregisterPushCommand) {
    try {
      return this.preferenceService.unregisterPushSubscription(command.userId, command.endpoint);
    } catch (error) {
      this.logger.error(`UnregisterPushHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
