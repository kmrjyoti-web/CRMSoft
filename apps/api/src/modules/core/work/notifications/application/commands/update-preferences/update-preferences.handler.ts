import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdatePreferencesCommand } from './update-preferences.command';
import { PreferenceService } from '../../../services/preference.service';

@CommandHandler(UpdatePreferencesCommand)
export class UpdatePreferencesHandler implements ICommandHandler<UpdatePreferencesCommand> {
    private readonly logger = new Logger(UpdatePreferencesHandler.name);

  constructor(private readonly preferenceService: PreferenceService) {}

  async execute(command: UpdatePreferencesCommand) {
    try {
      return this.preferenceService.updatePreferences(command.userId, {
        channels: command.channels,
        categories: command.categories,
        quietHoursStart: command.quietHoursStart,
        quietHoursEnd: command.quietHoursEnd,
        digestFrequency: command.digestFrequency,
        timezone: command.timezone,
      });
    } catch (error) {
      this.logger.error(`UpdatePreferencesHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
