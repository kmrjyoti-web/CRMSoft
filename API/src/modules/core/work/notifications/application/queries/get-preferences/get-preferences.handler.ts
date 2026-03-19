import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPreferencesQuery } from './get-preferences.query';
import { PreferenceService } from '../../../services/preference.service';

@QueryHandler(GetPreferencesQuery)
export class GetPreferencesHandler implements IQueryHandler<GetPreferencesQuery> {
  constructor(private readonly preferenceService: PreferenceService) {}

  async execute(query: GetPreferencesQuery) {
    return this.preferenceService.getPreferences(query.userId);
  }
}
