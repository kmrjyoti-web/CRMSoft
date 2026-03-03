import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnregisterPushCommand } from './unregister-push.command';
import { PreferenceService } from '../../../services/preference.service';

@CommandHandler(UnregisterPushCommand)
export class UnregisterPushHandler implements ICommandHandler<UnregisterPushCommand> {
  constructor(private readonly preferenceService: PreferenceService) {}

  async execute(command: UnregisterPushCommand) {
    return this.preferenceService.unregisterPushSubscription(command.userId, command.endpoint);
  }
}
