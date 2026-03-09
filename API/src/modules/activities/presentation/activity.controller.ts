import { Controller, Post, Get, Put, Delete, Param, Body, Query, HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { DataMaskingInterceptor, MaskTable } from '../../table-config/data-masking.interceptor';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { CompleteActivityDto } from './dto/complete-activity.dto';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { CreateActivityCommand } from '../application/commands/create-activity/create-activity.command';
import { UpdateActivityCommand } from '../application/commands/update-activity/update-activity.command';
import { CompleteActivityCommand } from '../application/commands/complete-activity/complete-activity.command';
import { DeleteActivityCommand } from '../application/commands/delete-activity/delete-activity.command';
import { DeactivateActivityCommand } from '../application/commands/deactivate-activity/deactivate-activity.command';
import { ReactivateActivityCommand } from '../application/commands/reactivate-activity/reactivate-activity.command';
import { SoftDeleteActivityCommand } from '../application/commands/soft-delete-activity/soft-delete-activity.command';
import { RestoreActivityCommand } from '../application/commands/restore-activity/restore-activity.command';
import { PermanentDeleteActivityCommand } from '../application/commands/permanent-delete-activity/permanent-delete-activity.command';
import { GetActivityListQuery } from '../application/queries/get-activity-list/get-activity-list.query';
import { GetActivityByIdQuery } from '../application/queries/get-activity-by-id/get-activity-by-id.query';
import { GetActivitiesByEntityQuery } from '../application/queries/get-activities-by-entity/get-activities-by-entity.query';
import { GetActivityStatsQuery } from '../application/queries/get-activity-stats/get-activity-stats.query';

@Controller('activities')
export class ActivityController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  @RequirePermissions('activities:create')
  async create(
    @Body() dto: CreateActivityDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.commandBus.execute(
      new CreateActivityCommand(
        dto.type, dto.subject, userId, dto.description,
        dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        dto.endTime ? new Date(dto.endTime) : undefined,
        dto.duration, dto.leadId, dto.contactId,
        dto.locationName, dto.latitude, dto.longitude,
        (dto as any).reminderMinutesBefore,
        (dto as any).taggedUserIds,
        tenantId,
      ),
    );
    return ApiResponse.success(result, 'Activity created');
  }

  @Get()
  @UseInterceptors(DataMaskingInterceptor)
  @MaskTable('activities')
  @RequirePermissions('activities:read')
  async list(@Query() query: ActivityQueryDto) {
    const result = await this.queryBus.execute(
      new GetActivityListQuery(
        query.page, query.limit, query.sortBy, query.sortOrder,
        query.search, query.isActive, query.type, query.leadId, query.contactId,
        query.createdById, query.fromDate, query.toDate,
      ),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('stats')
  @RequirePermissions('activities:read')
  async stats(@Query('userId') userId?: string, @Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
    const result = await this.queryBus.execute(new GetActivityStatsQuery(userId, fromDate, toDate));
    return ApiResponse.success(result);
  }

  @Get('entity/:type/:entityId')
  @RequirePermissions('activities:read')
  async byEntity(@Param('type') type: string, @Param('entityId') entityId: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.queryBus.execute(new GetActivitiesByEntityQuery(type, entityId, +page, +limit));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('activities:read')
  async getById(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetActivityByIdQuery(id));
    return ApiResponse.success(result);
  }

  @Put(':id')
  @RequirePermissions('activities:update')
  async update(@Param('id') id: string, @Body() dto: UpdateActivityDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new UpdateActivityCommand(id, userId, dto as any));
    return ApiResponse.success(result, 'Activity updated');
  }

  @Post(':id/complete')
  @RequirePermissions('activities:update')
  async complete(@Param('id') id: string, @Body() dto: CompleteActivityDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new CompleteActivityCommand(id, userId, dto.outcome));
    return ApiResponse.success(result, 'Activity completed');
  }

  @Delete(':id')
  @RequirePermissions('activities:delete')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new DeleteActivityCommand(id, userId));
    return ApiResponse.success(result, 'Activity deleted');
  }

  @Post(':id/deactivate')
  @RequirePermissions('activities:update')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id') id: string) {
    await this.commandBus.execute(new DeactivateActivityCommand(id));
    const result = await this.queryBus.execute(new GetActivityByIdQuery(id));
    return ApiResponse.success(result, 'Activity deactivated');
  }

  @Post(':id/reactivate')
  @RequirePermissions('activities:update')
  @HttpCode(HttpStatus.OK)
  async reactivate(@Param('id') id: string) {
    await this.commandBus.execute(new ReactivateActivityCommand(id));
    const result = await this.queryBus.execute(new GetActivityByIdQuery(id));
    return ApiResponse.success(result, 'Activity reactivated');
  }

  @Post(':id/soft-delete')
  @RequirePermissions('activities:delete')
  async softDelete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.commandBus.execute(new SoftDeleteActivityCommand(id, userId));
    const result = await this.queryBus.execute(new GetActivityByIdQuery(id));
    return ApiResponse.success(result, 'Activity soft-deleted');
  }

  @Post(':id/restore')
  @RequirePermissions('activities:update')
  async restore(@Param('id') id: string) {
    await this.commandBus.execute(new RestoreActivityCommand(id));
    const result = await this.queryBus.execute(new GetActivityByIdQuery(id));
    return ApiResponse.success(result, 'Activity restored');
  }

  @Delete(':id/permanent')
  @RequirePermissions('activities:delete')
  async permanentDelete(@Param('id') id: string) {
    await this.commandBus.execute(new PermanentDeleteActivityCommand(id));
    return ApiResponse.success({ id, deleted: true }, 'Activity permanently deleted');
  }
}
