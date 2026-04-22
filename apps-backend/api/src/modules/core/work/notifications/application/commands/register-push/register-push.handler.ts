import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RegisterPushCommand } from './register-push.command';
import { PreferenceService } from '../../../services/preference.service';

@CommandHandler(RegisterPushCommand)
export class RegisterPushHandler implements ICommandHandler<RegisterPushCommand> {
    private readonly logger = new Logger(RegisterPushHandler.name);

  constructor(private readonly preferenceService: PreferenceService) {}

  async execute(command: RegisterPushCommand) {
    try {
      return this.preferenceService.registerPushSubscription(command.userId, {
        endpoint: command.endpoint,
        p256dh: command.p256dh,
        auth: command.auth,
        deviceType: command.deviceType,
      });
    } catch (error) {
      this.logger.error(`RegisterPushHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
