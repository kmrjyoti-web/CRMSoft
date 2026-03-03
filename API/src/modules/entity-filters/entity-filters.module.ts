import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EntityFiltersController, FilterSearchController } from './presentation/entity-filters.controller';

import { AssignFiltersHandler } from './application/commands/assign-filters/assign-filters.handler';
import { RemoveFilterHandler } from './application/commands/remove-filter/remove-filter.handler';
import { ReplaceFiltersHandler } from './application/commands/replace-filters/replace-filters.handler';
import { CopyFiltersHandler } from './application/commands/copy-filters/copy-filters.handler';
import { GetEntityFiltersHandler } from './application/queries/get-entity-filters/get-entity-filters.handler';
import { GetEntitiesByFilterHandler } from './application/queries/get-entities-by-filter/get-entities-by-filter.handler';

const CommandHandlers = [
  AssignFiltersHandler, RemoveFilterHandler, ReplaceFiltersHandler, CopyFiltersHandler,
];
const QueryHandlers = [GetEntityFiltersHandler, GetEntitiesByFilterHandler];

@Module({
  imports: [CqrsModule],
  controllers: [EntityFiltersController, FilterSearchController],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class EntityFiltersModule {}
