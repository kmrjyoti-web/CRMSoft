import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetPreferencesQuery } from './get-preferences.query';
import { PreferenceService } from '../../../services/preference.service';

@QueryHandler(GetPreferencesQuery)
export class GetPreferencesHandler implements IQueryHandler<GetPreferencesQuery> {
    private readonly logger = new Logger(GetPreferencesHandler.name);

  constructor(private readonly preferenceService: PreferenceService) {}

  async execute(query: GetPreferencesQuery) {
    try {
      return this.preferenceService.getPreferences(query.userId);
    } catch (error) {
      this.logger.error(`GetPreferencesHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
