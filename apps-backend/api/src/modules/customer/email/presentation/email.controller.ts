import {
  Controller, Get, Post, Put, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { ComposeEmailCommand } from '../application/commands/compose-email/compose-email.command';
import { ReplyEmailCommand } from '../application/commands/reply-email/reply-email.command';
import { SendEmailCommand } from '../application/commands/send-email/send-email.command';
import { ScheduleEmailCommand } from '../application/commands/schedule-email/schedule-email.command';
import { CancelScheduledEmailCommand } from '../application/commands/cancel-scheduled-email/cancel-scheduled-email.command';
import { StarEmailCommand } from '../application/commands/star-email/star-email.command';
import { MarkReadCommand } from '../application/commands/mark-read/mark-read.command';
import { LinkEmailToEntityCommand } from '../application/commands/link-email-to-entity/link-email-to-entity.command';
import { UnlinkEmailFromEntityCommand } from '../application/commands/unlink-email-from-entity/unlink-email-from-entity.command';
import { GetEmailQuery } from '../application/queries/get-email/query';
import { GetEmailsQuery } from '../application/queries/get-emails/query';
import { GetEmailThreadQuery } from '../application/queries/get-email-thread/query';
import { GetEntityEmailsQuery } from '../application/queries/get-entity-emails/query';
import { SearchEmailsQuery } from '../application/queries/search-emails/query';
import { GetEmailAnalyticsQuery } from '../application/queries/get-email-analytics/query';
import { ComposeEmailDto, ReplyEmailDto } from './dto/compose-email.dto';
import { EmailQueryDto, SearchEmailsDto } from './dto/email-query.dto';

@ApiTags('Emails')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('emails')
export class EmailController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('compose')
  @RequirePermissions('emails:create')
  async compose(@Body() dto: ComposeEmailDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new ComposeEmailCommand(
        dto.accountId, userId, dto.to, dto.subject, dto.bodyHtml,
        dto.cc, dto.bcc, dto.bodyText, dto.replyToEmailId,
        dto.templateId, dto.templateData, dto.signatureId,
        dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        dto.sendNow, dto.entityType, dto.entityId,
        dto.priority, dto.trackOpens, dto.trackClicks,
      ),
    );
    return ApiResponse.success(result, 'Email composed successfully');
  }

  @Post('reply')
  @RequirePermissions('emails:create')
  async reply(@Body() dto: ReplyEmailDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new ReplyEmailCommand(dto.originalEmailId, userId, dto.replyType, dto.bodyHtml, dto.to, dto.bodyText),
    );
    return ApiResponse.success(result, 'Reply sent successfully');
  }

  @Post(':id/send')
  @RequirePermissions('emails:create')
  async send(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new SendEmailCommand(id, userId));
    return ApiResponse.success(result, 'Email sent successfully');
  }

  @Post(':id/schedule')
  @RequirePermissions('emails:create')
  async schedule(@Param('id') id: string, @Body('scheduledAt') scheduledAt: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new ScheduleEmailCommand(id, new Date(scheduledAt), userId));
    return ApiResponse.success(result, 'Email scheduled successfully');
  }

  @Post(':id/cancel-schedule')
  @RequirePermissions('emails:update')
  async cancelSchedule(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new CancelScheduledEmailCommand(id, userId));
    return ApiResponse.success(result, 'Scheduled email cancelled');
  }

  @Post(':id/star')
  @RequirePermissions('emails:update')
  async star(@Param('id') id: string, @Body('starred') starred: boolean) {
    const result = await this.commandBus.execute(new StarEmailCommand(id, starred));
    return ApiResponse.success(result, 'Email star updated');
  }

  @Post(':id/read')
  @RequirePermissions('emails:update')
  async markRead(@Param('id') id: string, @Body('isRead') isRead: boolean) {
    const result = await this.commandBus.execute(new MarkReadCommand(id, isRead));
    return ApiResponse.success(result, 'Email read status updated');
  }

  @Post(':id/link')
  @RequirePermissions('emails:update')
  async linkToEntity(
    @Param('id') id: string,
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.commandBus.execute(new LinkEmailToEntityCommand(id, entityType, entityId, userId));
    return ApiResponse.success(result, 'Email linked to entity');
  }

  @Post(':id/unlink')
  @RequirePermissions('emails:update')
  async unlinkFromEntity(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new UnlinkEmailFromEntityCommand(id, userId));
    return ApiResponse.success(result, 'Email unlinked from entity');
  }

  @Get()
  @RequirePermissions('emails:read')
  async list(@Query() query: EmailQueryDto) {
    const result = await this.queryBus.execute(
      new GetEmailsQuery(
        query.page || 1, query.limit || 20,
        query.accountId, query.direction, query.status,
        query.isStarred, query.isRead,
      ),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('search')
  @RequirePermissions('emails:read')
  async search(@Query() query: SearchEmailsDto) {
    const result = await this.queryBus.execute(
      new SearchEmailsQuery(query.query || '', query.page || 1, query.limit || 20, query.accountId),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('analytics')
  @RequirePermissions('emails:read')
  async analytics(
    @CurrentUser('id') userId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetEmailAnalyticsQuery(userId, dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined),
    );
    return ApiResponse.success(result, 'Email analytics retrieved');
  }

  @Get('entity/:entityType/:entityId')
  @RequirePermissions('emails:read')
  async entityEmails(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.queryBus.execute(
      new GetEntityEmailsQuery(entityType, entityId, page || 1, limit || 20),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('thread/:threadId')
  @RequirePermissions('emails:read')
  async thread(@Param('threadId') threadId: string) {
    const result = await this.queryBus.execute(new GetEmailThreadQuery(threadId));
    return ApiResponse.success(result, 'Email thread retrieved');
  }

  @Get(':id')
  @RequirePermissions('emails:read')
  async getById(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetEmailQuery(id));
    return ApiResponse.success(result, 'Email retrieved');
  }
}
