import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../../common/utils/api-response';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CreateFieldDefinitionDto } from './dto/create-field-definition.dto';
import { UpdateFieldDefinitionDto } from './dto/update-field-definition.dto';
import { BulkSetFieldValuesDto } from './dto/set-field-value.dto';
import { CreateFieldDefinitionCommand } from '../application/commands/create-field-definition/create-field-definition.command';
import { UpdateFieldDefinitionCommand } from '../application/commands/update-field-definition/update-field-definition.command';
import { DeleteFieldDefinitionCommand } from '../application/commands/delete-field-definition/delete-field-definition.command';
import { SetFieldValueCommand } from '../application/commands/set-field-value/set-field-value.command';
import { GetFieldDefinitionsQuery } from '../application/queries/get-field-definitions/get-field-definitions.query';
import { GetEntityValuesQuery } from '../application/queries/get-entity-values/get-entity-values.query';
import { GetFormSchemaQuery } from '../application/queries/get-form-schema/get-form-schema.query';

@ApiTags('Custom Fields')
@ApiBearerAuth()
@Controller('custom-fields')
export class CustomFieldsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @Post('definitions')
  @ApiOperation({ summary: 'Create custom field definition' })
  @RequirePermissions('custom_fields:create')
  async createDefinition(@Body() dto: CreateFieldDefinitionDto) {
    const result = await this.commandBus.execute(
      new CreateFieldDefinitionCommand(
        dto.entityType, dto.fieldName, dto.fieldLabel, dto.fieldType,
        dto.isRequired, dto.defaultValue, dto.options, dto.sortOrder,
      ),
    );
    return ApiResponse.success(result, 'Field definition created');
  }

  @Get('definitions')
  @ApiOperation({ summary: 'List field definitions for entity type' })
  @RequirePermissions('custom_fields:read')
  async getDefinitions(
    @Query('entityType') entityType: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetFieldDefinitionsQuery(entityType, includeInactive !== 'true'),
    );
    return ApiResponse.success(result);
  }

  @Put('definitions/:id')
  @ApiOperation({ summary: 'Update field definition' })
  @RequirePermissions('custom_fields:update')
  async updateDefinition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFieldDefinitionDto,
  ) {
    const result = await this.commandBus.execute(
      new UpdateFieldDefinitionCommand(id, dto),
    );
    return ApiResponse.success(result, 'Field definition updated');
  }

  @Delete('definitions/:id')
  @ApiOperation({ summary: 'Deactivate field definition' })
  @RequirePermissions('custom_fields:delete')
  async deleteDefinition(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.commandBus.execute(
      new DeleteFieldDefinitionCommand(id),
    );
    return ApiResponse.success(result, 'Field definition deactivated');
  }

  @Post(':entityType/:entityId/values')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set custom field values for entity' })
  @RequirePermissions('custom_fields:update')
  async setValues(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body() dto: BulkSetFieldValuesDto,
  ) {
    const result = await this.commandBus.execute(
      new SetFieldValueCommand(entityType, entityId, dto.values),
    );
    return ApiResponse.success(result, 'Values saved');
  }

  @Get(':entityType/:entityId/values')
  @ApiOperation({ summary: 'Get custom field values for entity' })
  @RequirePermissions('custom_fields:read')
  async getValues(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const result = await this.queryBus.execute(
      new GetEntityValuesQuery(entityType, entityId),
    );
    return ApiResponse.success(result);
  }

  @Get(':entityType/form-schema')
  @ApiOperation({ summary: 'Get form schema for entity type' })
  @RequirePermissions('custom_fields:read')
  async getFormSchema(@Param('entityType') entityType: string) {
    const result = await this.queryBus.execute(
      new GetFormSchemaQuery(entityType),
    );
    return ApiResponse.success(result);
  }

  @Get(':entityType/filter')
  @ApiOperation({ summary: 'Filter entities by custom field value' })
  @RequirePermissions('custom_fields:read')
  async filterByField(
    @Param('entityType') entityType: string,
    @Query('fieldName') fieldName: string,
    @Query('operator') operator = 'eq',
    @Query('value') value: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const p = Math.max(1, +page);
    const l = Math.min(100, Math.max(1, +limit));
    const where = this.buildFilterWhere(entityType.toUpperCase(), fieldName, operator, value);
    const [data, total] = await Promise.all([
      this.prisma.entityConfigValue.findMany({
        where, skip: (p - 1) * l, take: l,
        include: { definition: { select: { fieldName: true, fieldLabel: true } } },
      }),
      this.prisma.entityConfigValue.count({ where }),
    ]);
    return ApiResponse.paginated(data, total, p, l);
  }

  private buildFilterWhere(
    entityType: string, fieldName: string, operator: string, value: string,
  ): any {
    const base: any = {
      entityType,
      definition: { fieldName, isActive: true },
    };
    switch (operator) {
      case 'eq': base.valueText = value; break;
      case 'contains': base.valueText = { contains: value, mode: 'insensitive' }; break;
      case 'gt': base.valueNumber = { gt: parseFloat(value) }; break;
      case 'lt': base.valueNumber = { lt: parseFloat(value) }; break;
      case 'gte': base.valueNumber = { gte: parseFloat(value) }; break;
      case 'lte': base.valueNumber = { lte: parseFloat(value) }; break;
      case 'between': {
        const [min, max] = value.split(',').map(Number);
        base.valueNumber = { gte: min, lte: max };
        break;
      }
      case 'dropdown': base.valueDropdown = value; break;
      default: base.valueText = value;
    }
    return base;
  }
}
