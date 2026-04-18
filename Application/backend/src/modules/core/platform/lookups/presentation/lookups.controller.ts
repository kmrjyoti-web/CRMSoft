import {
  Controller, Get, Post, Put, Param, Body, Query,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateLookupCommand } from '../application/commands/create-lookup/create-lookup.command';
import { UpdateLookupCommand } from '../application/commands/update-lookup/update-lookup.command';
import { DeactivateLookupCommand } from '../application/commands/deactivate-lookup/deactivate-lookup.command';
import { AddValueCommand } from '../application/commands/add-value/add-value.command';
import { UpdateValueCommand } from '../application/commands/update-value/update-value.command';
import { ReorderValuesCommand } from '../application/commands/reorder-values/reorder-values.command';
import { DeactivateValueCommand } from '../application/commands/deactivate-value/deactivate-value.command';
import { ResetLookupDefaultsCommand } from '../application/commands/reset-lookup-defaults/reset-lookup-defaults.command';
import { GetAllLookupsQuery } from '../application/queries/get-all-lookups/get-all-lookups.query';
import { GetLookupByIdQuery } from '../application/queries/get-lookup-by-id/get-lookup-by-id.query';
import { GetValuesByCategoryQuery } from '../application/queries/get-values-by-category/get-values-by-category.query';
import { CreateLookupDto } from './dto/create-lookup.dto';
import { UpdateLookupDto } from './dto/update-lookup.dto';
import { AddValueDto } from './dto/add-value.dto';
import { UpdateValueDto } from './dto/update-value.dto';
import { ReorderValuesDto } from './dto/reorder-values.dto';
import { ApiResponse } from '../../../../../common/utils/api-response';

@ApiTags('Lookups')
@ApiBearerAuth()
@Controller('lookups')
export class LookupsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ─── MasterLookup CRUD ───

  @Post()
  @ApiOperation({ summary: 'Create lookup category (e.g., INDUSTRY, LEAD_SOURCE)' })
  async createLookup(@Body() dto: CreateLookupDto) {
    const id = await this.commandBus.execute(
      new CreateLookupCommand(dto.category, dto.displayName, dto.description, dto.isSystem),
    );
    const lookup = await this.queryBus.execute(new GetLookupByIdQuery(id));
    return ApiResponse.success(lookup, 'Lookup created');
  }

  @Get()
  @ApiOperation({ summary: 'List all lookup categories' })
  async getAllLookups(@Query('activeOnly') activeOnly?: string) {
    const lookups = await this.queryBus.execute(
      new GetAllLookupsQuery(activeOnly !== 'false'),
    );
    return ApiResponse.success(lookups);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lookup by ID (with all values)' })
  async getLookupById(@Param('id') id: string) {
    const lookup = await this.queryBus.execute(new GetLookupByIdQuery(id));
    return ApiResponse.success(lookup);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update lookup display name/description' })
  async updateLookup(@Param('id') id: string, @Body() dto: UpdateLookupDto) {
    await this.commandBus.execute(new UpdateLookupCommand(id, dto));
    const lookup = await this.queryBus.execute(new GetLookupByIdQuery(id));
    return ApiResponse.success(lookup, 'Lookup updated');
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate lookup category (non-system only)' })
  async deactivateLookup(@Param('id') id: string) {
    await this.commandBus.execute(new DeactivateLookupCommand(id));
    return ApiResponse.success(null, 'Lookup deactivated');
  }

  // ─── LookupValue CRUD ───

  @Get('values/:category')
  @ApiOperation({ summary: '⭐ Get values by category name (for dropdowns)' })
  async getValuesByCategory(@Param('category') category: string) {
    const result = await this.queryBus.execute(new GetValuesByCategoryQuery(category));
    return ApiResponse.success(result);
  }

  @Post(':lookupId/values')
  @ApiOperation({ summary: 'Add a value to a lookup category' })
  async addValue(@Param('lookupId') lookupId: string, @Body() dto: AddValueDto) {
    const id = await this.commandBus.execute(
      new AddValueCommand(
        lookupId, dto.value, dto.label, dto.icon,
        dto.color, dto.isDefault, dto.parentId, dto.configJson,
      ),
    );
    const lookup = await this.queryBus.execute(new GetLookupByIdQuery(lookupId));
    return ApiResponse.success(lookup, 'Value added');
  }

  @Put('values/:valueId')
  @ApiOperation({ summary: 'Update a lookup value (label, icon, color, default)' })
  async updateValue(@Param('valueId') valueId: string, @Body() dto: UpdateValueDto) {
    await this.commandBus.execute(new UpdateValueCommand(valueId, dto));
    return ApiResponse.success(null, 'Value updated');
  }

  @Post(':lookupId/values/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reorder values (drag-and-drop)' })
  async reorderValues(@Param('lookupId') lookupId: string, @Body() dto: ReorderValuesDto) {
    await this.commandBus.execute(new ReorderValuesCommand(lookupId, dto.orderedIds));
    const lookup = await this.queryBus.execute(new GetLookupByIdQuery(lookupId));
    return ApiResponse.success(lookup, 'Values reordered');
  }

  @Post('values/:valueId/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a lookup value' })
  async deactivateValue(@Param('valueId') valueId: string) {
    await this.commandBus.execute(new DeactivateValueCommand(valueId));
    return ApiResponse.success(null, 'Value deactivated');
  }

  @Post('reset-defaults')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset all system lookups to seed defaults' })
  async resetToDefaults() {
    const result = await this.commandBus.execute(new ResetLookupDefaultsCommand());
    return ApiResponse.success(result, 'Lookup defaults restored');
  }
}
