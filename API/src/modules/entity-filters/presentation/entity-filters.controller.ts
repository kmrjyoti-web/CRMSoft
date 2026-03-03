import {
  Controller, Get, Post, Delete, Param, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AssignFiltersCommand } from '../application/commands/assign-filters/assign-filters.command';
import { RemoveFilterCommand } from '../application/commands/remove-filter/remove-filter.command';
import { ReplaceFiltersCommand } from '../application/commands/replace-filters/replace-filters.command';
import { CopyFiltersCommand } from '../application/commands/copy-filters/copy-filters.command';
import { GetEntityFiltersQuery } from '../application/queries/get-entity-filters/get-entity-filters.query';
import { GetEntitiesByFilterQuery } from '../application/queries/get-entities-by-filter/get-entities-by-filter.query';
import { AssignFiltersDto, ReplaceFiltersDto, CopyFiltersDto, FilterSearchDto } from './dto/entity-filter.dto';
import { EntityType, VALID_ENTITY_TYPES } from '../entity-filter.types';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Entity Filters')
@ApiBearerAuth()
@Controller(':entityType/:entityId/filters')
export class EntityFiltersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all filters for an entity (grouped by category)' })
  @ApiParam({ name: 'entityType', enum: VALID_ENTITY_TYPES })
  async getFilters(
    @Param('entityType') entityType: EntityType,
    @Param('entityId') entityId: string,
  ) {
    const result = await this.queryBus.execute(
      new GetEntityFiltersQuery(entityType, entityId),
    );
    return ApiResponse.success(result);
  }

  @Post()
  @ApiOperation({ summary: 'Assign filters to entity (additive — keeps existing)' })
  @ApiParam({ name: 'entityType', enum: VALID_ENTITY_TYPES })
  async assignFilters(
    @Param('entityType') entityType: EntityType,
    @Param('entityId') entityId: string,
    @Body() dto: AssignFiltersDto,
  ) {
    const result = await this.commandBus.execute(
      new AssignFiltersCommand(entityType, entityId, dto.lookupValueIds),
    );
    return ApiResponse.success(result, 'Filters assigned');
  }

  @Post('replace')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Replace filters (optionally per category)' })
  @ApiParam({ name: 'entityType', enum: VALID_ENTITY_TYPES })
  async replaceFilters(
    @Param('entityType') entityType: EntityType,
    @Param('entityId') entityId: string,
    @Body() dto: ReplaceFiltersDto,
  ) {
    const result = await this.commandBus.execute(
      new ReplaceFiltersCommand(entityType, entityId, dto.lookupValueIds, dto.category),
    );
    return ApiResponse.success(result, 'Filters replaced');
  }

  @Delete(':lookupValueId')
  @ApiOperation({ summary: 'Remove a single filter from entity' })
  @ApiParam({ name: 'entityType', enum: VALID_ENTITY_TYPES })
  async removeFilter(
    @Param('entityType') entityType: EntityType,
    @Param('entityId') entityId: string,
    @Param('lookupValueId') lookupValueId: string,
  ) {
    await this.commandBus.execute(
      new RemoveFilterCommand(entityType, entityId, lookupValueId),
    );
    return ApiResponse.success(null, 'Filter removed');
  }

  @Post('copy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Copy all filters to another entity (e.g., RawContact → Contact)' })
  @ApiParam({ name: 'entityType', enum: VALID_ENTITY_TYPES })
  async copyFilters(
    @Param('entityType') entityType: EntityType,
    @Param('entityId') entityId: string,
    @Body() dto: CopyFiltersDto,
  ) {
    const copied = await this.commandBus.execute(
      new CopyFiltersCommand(entityType, entityId, dto.targetType, dto.targetId),
    );
    return ApiResponse.success({ copied }, 'Filters copied');
  }
}

/**
 * Separate controller for search-by-filter (no entityId in path).
 */
@ApiTags('Entity Filters')
@ApiBearerAuth()
@Controller(':entityType/filter-search')
export class FilterSearchController {
  constructor(private readonly queryBus: QueryBus) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find entity IDs that match filter criteria (AND/OR)' })
  @ApiParam({ name: 'entityType', enum: VALID_ENTITY_TYPES })
  async searchByFilters(
    @Param('entityType') entityType: EntityType,
    @Body() dto: FilterSearchDto,
  ) {
    const entityIds = await this.queryBus.execute(
      new GetEntitiesByFilterQuery(entityType, dto.lookupValueIds, dto.matchAll),
    );
    return ApiResponse.success({ entityIds, count: entityIds.length });
  }
}
