import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterPushCommand } from './register-push.command';
import { PreferenceService } from '../../../services/preference.service';

@CommandHandler(RegisterPushCommand)
export class RegisterPushHandler implements ICommandHandler<RegisterPushCommand> {
  constructor(private readonly preferenceService: PreferenceService) {}

  async execute(command: RegisterPushCommand) {
    return this.preferenceService.registerPushSubscription(command.userId, {
      endpoint: command.endpoint,
      p256dh: command.p256dh,
      auth: command.auth,
      deviceType: command.deviceType,
    });
  }
}
