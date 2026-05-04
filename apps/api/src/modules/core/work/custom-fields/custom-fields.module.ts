import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CustomFieldsController } from './presentation/custom-fields.controller';
import { CreateFieldDefinitionHandler } from './application/commands/create-field-definition/create-field-definition.handler';
import { UpdateFieldDefinitionHandler } from './application/commands/update-field-definition/update-field-definition.handler';
import { DeleteFieldDefinitionHandler } from './application/commands/delete-field-definition/delete-field-definition.handler';
import { SetFieldValueHandler } from './application/commands/set-field-value/set-field-value.handler';
import { GetFieldDefinitionsHandler } from './application/queries/get-field-definitions/get-field-definitions.handler';
import { GetEntityValuesHandler } from './application/queries/get-entity-values/get-entity-values.handler';
import { GetFormSchemaHandler } from './application/queries/get-form-schema/get-form-schema.handler';

const CommandHandlers = [
  CreateFieldDefinitionHandler,
  UpdateFieldDefinitionHandler,
  DeleteFieldDefinitionHandler,
  SetFieldValueHandler,
];

const QueryHandlers = [
  GetFieldDefinitionsHandler,
  GetEntityValuesHandler,
  GetFormSchemaHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [CustomFieldsController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class CustomFieldsModule {}
