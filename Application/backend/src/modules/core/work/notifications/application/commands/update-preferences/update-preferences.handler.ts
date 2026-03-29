import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePreferencesCommand } from './update-preferences.command';
import { PreferenceService } from '../../../services/preference.service';

@CommandHandler(UpdatePreferencesCommand)
export class UpdatePreferencesHandler implements ICommandHandler<UpdatePreferencesCommand> {
  constructor(private readonly preferenceService: PreferenceService) {}

  async execute(command: UpdatePreferencesCommand) {
    return this.preferenceService.updatePreferences(command.userId, {
      channels: command.channels,
      categories: command.categories,
      quietHoursStart: command.quietHoursStart,
      quietHoursEnd: command.quietHoursEnd,
      digestFrequency: command.digestFrequency,
      timezone: command.timezone,
    });
  }
}
