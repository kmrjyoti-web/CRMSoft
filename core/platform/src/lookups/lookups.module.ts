import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LookupsController } from './presentation/lookups.controller';

import { CreateLookupHandler } from './application/commands/create-lookup/create-lookup.handler';
import { UpdateLookupHandler } from './application/commands/update-lookup/update-lookup.handler';
import { DeactivateLookupHandler } from './application/commands/deactivate-lookup/deactivate-lookup.handler';
import { AddValueHandler } from './application/commands/add-value/add-value.handler';
import { UpdateValueHandler } from './application/commands/update-value/update-value.handler';
import { ReorderValuesHandler } from './application/commands/reorder-values/reorder-values.handler';
import { DeactivateValueHandler } from './application/commands/deactivate-value/deactivate-value.handler';
import { ResetLookupDefaultsHandler } from './application/commands/reset-lookup-defaults/reset-lookup-defaults.handler';

import { GetAllLookupsHandler } from './application/queries/get-all-lookups/get-all-lookups.handler';
import { GetLookupByIdHandler } from './application/queries/get-lookup-by-id/get-lookup-by-id.handler';
import { GetValuesByCategoryHandler } from './application/queries/get-values-by-category/get-values-by-category.handler';

const CommandHandlers = [
  CreateLookupHandler, UpdateLookupHandler, DeactivateLookupHandler,
  AddValueHandler, UpdateValueHandler, ReorderValuesHandler, DeactivateValueHandler,
  ResetLookupDefaultsHandler,
];
const QueryHandlers = [
  GetAllLookupsHandler, GetLookupByIdHandler, GetValuesByCategoryHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [LookupsController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class LookupsModule {}
