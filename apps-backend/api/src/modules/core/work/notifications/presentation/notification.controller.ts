import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../../common/utils/api-response';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { SendNotificationCommand } from '../application/commands/send-notification/send-notification.command';
import { MarkReadCommand } from '../application/commands/mark-read/mark-read.command';
import { MarkAllReadCommand } from '../application/commands/mark-all-read/mark-all-read.command';
import { DismissNotificationCommand } from '../application/commands/dismiss-notification/dismiss-notification.command';
import { BulkMarkReadCommand } from '../application/commands/bulk-mark-read/bulk-mark-read.command';
import { BulkDismissCommand } from '../application/commands/bulk-dismiss/bulk-dismiss.command';
import { GetNotificationsQuery } from '../application/queries/get-notifications/get-notifications.query';
import { GetNotificationByIdQuery } from '../application/queries/get-notification-by-id/get-notification-by-id.query';
import { GetUnreadCountQuery } from '../application/queries/get-unread-count/get-unread-count.query';
import { GetNotificationStatsQuery } from '../application/queries/get-notification-stats/get-notification-stats.query';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermissions('notifications:send')
  async send(@Body() dto: SendNotificationDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new SendNotificationCommand(
        dto.templateName, dto.recipientId, dto.variables, userId,
        dto.entityType, dto.entityId, dto.priority, dto.groupKey, dto.channelOverrides,
      ),
    );
    return ApiResponse.success(result, 'Notification sent');
  }

  @Get()
  @RequirePermissions('notifications:read')
  async list(@Query() query: NotificationQueryDto, @CurrentUser('id') userId: string) {
    const result = await this.queryBus.execute(
      new GetNotificationsQuery(userId, query.page, query.limit, query.category, query.status, query.priority),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('unread-count')
  @RequirePermissions('notifications:read')
  async unreadCount(@CurrentUser('id') userId: string) {
    const result = await this.queryBus.execute(new GetUnreadCountQuery(userId));
    return ApiResponse.success(result);
  }

  @Get('stats')
  @RequirePermissions('notifications:read')
  async stats(@CurrentUser('id') userId: string) {
    const result = await this.queryBus.execute(new GetNotificationStatsQuery(userId));
    return ApiResponse.success(result);
  }

  @Get(':id')
  @RequirePermissions('notifications:read')
  async getById(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.queryBus.execute(new GetNotificationByIdQuery(id, userId));
    return ApiResponse.success(result);
  }

  @Post(':id/read')
  @RequirePermissions('notifications:update')
  async markRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new MarkReadCommand(id, userId));
    return ApiResponse.success(result, 'Marked as read');
  }

  @Post('mark-all-read')
  @RequirePermissions('notifications:update')
  async markAllRead(@CurrentUser('id') userId: string, @Body('category') category?: string) {
    const result = await this.commandBus.execute(new MarkAllReadCommand(userId, category));
    return ApiResponse.success(result, 'All marked as read');
  }

  @Post(':id/dismiss')
  @RequirePermissions('notifications:update')
  async dismiss(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new DismissNotificationCommand(id, userId));
    return ApiResponse.success(result, 'Dismissed');
  }

  @Post('bulk/read')
  @RequirePermissions('notifications:update')
  async bulkRead(@Body('ids') ids: string[], @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new BulkMarkReadCommand(ids, userId));
    return ApiResponse.success(result, 'Bulk marked as read');
  }

  @Post('bulk/dismiss')
  @RequirePermissions('notifications:update')
  async bulkDismiss(@Body('ids') ids: string[], @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new BulkDismissCommand(ids, userId));
    return ApiResponse.success(result, 'Bulk dismissed');
  }
}
