import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SavedFiltersController } from './presentation/saved-filters.controller';
import { CreateSavedFilterHandler } from './application/commands/create-saved-filter/create-saved-filter.handler';
import { UpdateSavedFilterHandler } from './application/commands/update-saved-filter/update-saved-filter.handler';
import { DeleteSavedFilterHandler } from './application/commands/delete-saved-filter/delete-saved-filter.handler';
import { ListSavedFiltersHandler } from './application/queries/list-saved-filters/list-saved-filters.handler';
import { GetSavedFilterHandler } from './application/queries/get-saved-filter/get-saved-filter.handler';

const CommandHandlers = [CreateSavedFilterHandler, UpdateSavedFilterHandler, DeleteSavedFilterHandler];
const QueryHandlers = [ListSavedFiltersHandler, GetSavedFilterHandler];

@Module({
  imports: [CqrsModule],
  controllers: [SavedFiltersController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class SavedFiltersModule {}
