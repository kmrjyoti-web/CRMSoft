// @ts-nocheck
import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateSavedFilterDto } from './dto/create-saved-filter.dto';
import { UpdateSavedFilterDto } from './dto/update-saved-filter.dto';
import { SavedFilterQueryDto } from './dto/saved-filter-query.dto';
import { CreateSavedFilterCommand } from '../application/commands/create-saved-filter/create-saved-filter.command';
import { UpdateSavedFilterCommand } from '../application/commands/update-saved-filter/update-saved-filter.command';
import { DeleteSavedFilterCommand } from '../application/commands/delete-saved-filter/delete-saved-filter.command';
import { ListSavedFiltersQuery } from '../application/queries/list-saved-filters/list-saved-filters.query';
import { GetSavedFilterQuery } from '../application/queries/get-saved-filter/get-saved-filter.query';

@Controller('saved-filters')
export class SavedFiltersController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get()
  @RequirePermissions('saved-filters:read')
  async list(@Query() query: SavedFilterQueryDto, @CurrentUser('id') userId: string) {
    const result = await this.queryBus.execute(
      new ListSavedFiltersQuery(userId, query.entityType, query.search, query.page, query.limit),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('saved-filters:read')
  async getById(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetSavedFilterQuery(id));
    return ApiResponse.success(result);
  }

  @Post()
  @RequirePermissions('saved-filters:create')
  async create(@Body() dto: CreateSavedFilterDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new CreateSavedFilterCommand(
        dto.name,
        dto.entityType,
        dto.filterConfig,
        userId,
        dto.description,
        dto.isDefault,
        dto.isShared,
        dto.sharedWithRoles,
      ),
    );
    return ApiResponse.success(result, 'Filter saved');
  }

  @Patch(':id')
  @RequirePermissions('saved-filters:update')
  async update(@Param('id') id: string, @Body() dto: UpdateSavedFilterDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new UpdateSavedFilterCommand(id, userId, dto as any));
    return ApiResponse.success(result, 'Filter updated');
  }

  @Delete(':id')
  @RequirePermissions('saved-filters:delete')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new DeleteSavedFilterCommand(id, userId));
    return ApiResponse.success(result, 'Filter deleted');
  }
}
