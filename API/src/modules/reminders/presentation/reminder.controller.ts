import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderQueryDto } from './dto/reminder-query.dto';
import { CreateReminderCommand } from '../application/commands/create-reminder/create-reminder.command';
import { DismissReminderCommand } from '../application/commands/dismiss-reminder/dismiss-reminder.command';
import { SnoozeReminderCommand } from '../application/commands/snooze-reminder/snooze-reminder.command';
import { CancelReminderCommand } from '../application/commands/cancel-reminder/cancel-reminder.command';
import { AcknowledgeReminderCommand } from '../application/commands/acknowledge-reminder/acknowledge-reminder.command';
import { GetReminderListQuery } from '../application/queries/get-reminder-list/get-reminder-list.query';
import { GetPendingRemindersQuery } from '../application/queries/get-pending-reminders/get-pending-reminders.query';
import { GetReminderStatsQuery } from '../application/queries/get-reminder-stats/get-reminder-stats.query';
import { GetManagerReminderStatsQuery } from '../application/queries/get-manager-reminder-stats/get-manager-reminder-stats.query';

@Controller('reminders')
export class ReminderController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  @RequirePermissions('reminders:create')
  async create(@Body() dto: CreateReminderDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new CreateReminderCommand(dto.title, new Date(dto.scheduledAt), dto.recipientId, userId, dto.entityType, dto.entityId, dto.channel, dto.message),
    );
    return ApiResponse.success(result, 'Reminder created');
  }

  @Get()
  @RequirePermissions('reminders:read')
  async list(@Query() query: ReminderQueryDto) {
    const result = await this.queryBus.execute(
      new GetReminderListQuery(query.page, query.limit, query.recipientId, query.channel, query.isSent),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('pending')
  @RequirePermissions('reminders:read')
  async pending(@Query('recipientId') recipientId?: string, @Query('page') page = 1, @Query('limit') limit = 50) {
    const result = await this.queryBus.execute(new GetPendingRemindersQuery(recipientId, +page, +limit));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('stats')
  @RequirePermissions('reminders:read')
  async stats(@Query('userId') userId?: string) {
    const result = await this.queryBus.execute(new GetReminderStatsQuery(userId));
    return ApiResponse.success(result);
  }

  @Get('manager-stats')
  @RequirePermissions('reminders:read')
  async managerStats(@CurrentUser() user: any) {
    const result = await this.queryBus.execute(new GetManagerReminderStatsQuery(user.id, user.roleLevel ?? 5));
    return ApiResponse.success(result);
  }

  @Post(':id/dismiss')
  @RequirePermissions('reminders:update')
  async dismiss(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new DismissReminderCommand(id, userId));
    return ApiResponse.success(result, 'Reminder dismissed');
  }

  @Post(':id/snooze')
  @RequirePermissions('reminders:update')
  async snooze(@Param('id') id: string, @CurrentUser('id') userId: string, @Body('snoozedUntil') snoozedUntil?: string) {
    const result = await this.commandBus.execute(
      new SnoozeReminderCommand(id, userId, snoozedUntil ? new Date(snoozedUntil) : undefined),
    );
    return ApiResponse.success(result, 'Reminder snoozed');
  }

  @Post(':id/cancel')
  @RequirePermissions('reminders:update')
  async cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new CancelReminderCommand(id, userId));
    return ApiResponse.success(result, 'Reminder cancelled');
  }

  @Post(':id/acknowledge')
  @RequirePermissions('reminders:update')
  async acknowledge(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new AcknowledgeReminderCommand(id, userId));
    return ApiResponse.success(result, 'Reminder acknowledged');
  }
}
