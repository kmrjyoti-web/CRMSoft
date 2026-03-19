import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { AuditQueryDto } from './dto/audit-query.dto';
import { SearchAuditDto } from './dto/search-audit.dto';
import { CreateAuditLogDto, ExportAuditDto } from './dto/retention-policy.dto';
import { GetEntityTimelineQuery } from '../application/queries/get-entity-timeline/get-entity-timeline.query';
import { GetFieldHistoryQuery } from '../application/queries/get-field-history/get-field-history.query';
import { GetGlobalFeedQuery } from '../application/queries/get-global-feed/get-global-feed.query';
import { GetUserActivityQuery } from '../application/queries/get-user-activity/get-user-activity.query';
import { GetAuditLogDetailQuery } from '../application/queries/get-audit-log-detail/get-audit-log-detail.query';
import { GetDiffViewQuery } from '../application/queries/get-diff-view/get-diff-view.query';
import { SearchAuditLogsQuery } from '../application/queries/search-audit-logs/search-audit-logs.query';
import { GetAuditStatsQuery } from '../application/queries/get-audit-stats/get-audit-stats.query';
import { CreateAuditLogCommand } from '../application/commands/create-audit-log/create-audit-log.command';
import { AuditExportService } from '../services/audit-export.service';
import { AuditSkip } from '../decorators/audit-skip.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard)
@AuditSkip()
export class AuditController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly exportService: AuditExportService,
  ) {}

  @Get('entity/:entityType/:entityId')
  @RequirePermissions('audit:read')
  async entityTimeline(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query() q: AuditQueryDto,
  ) {
    const result = await this.queryBus.execute(
      new GetEntityTimelineQuery(
        entityType, entityId, q.page, q.limit, q.action,
        q.dateFrom ? new Date(q.dateFrom) : undefined,
        q.dateTo ? new Date(q.dateTo) : undefined,
      ),
    );
    return ApiResponse.success(result);
  }

  @Get('entity/:entityType/:entityId/field/:fieldName')
  @RequirePermissions('audit:read')
  async fieldHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Param('fieldName') fieldName: string,
    @Query() q: AuditQueryDto,
  ) {
    const result = await this.queryBus.execute(
      new GetFieldHistoryQuery(entityType, entityId, fieldName, q.page, q.limit),
    );
    return ApiResponse.success(result);
  }

  @Get('feed')
  @RequirePermissions('audit:read')
  async globalFeed(@Query() q: AuditQueryDto) {
    const result = await this.queryBus.execute(
      new GetGlobalFeedQuery(
        q.page, q.limit, q.entityType, q.action,
        q.dateFrom ? new Date(q.dateFrom) : undefined,
        q.dateTo ? new Date(q.dateTo) : undefined,
      ),
    );
    return ApiResponse.success(result);
  }

  @Get('user/:userId')
  @RequirePermissions('audit:read')
  async userActivity(@Param('userId') userId: string, @Query() q: AuditQueryDto) {
    const result = await this.queryBus.execute(
      new GetUserActivityQuery(
        userId, q.page, q.limit,
        q.dateFrom ? new Date(q.dateFrom) : undefined,
        q.dateTo ? new Date(q.dateTo) : undefined,
      ),
    );
    return ApiResponse.success(result);
  }

  @Get('search')
  @RequirePermissions('audit:read')
  async search(@Query() q: SearchAuditDto) {
    const result = await this.queryBus.execute(
      new SearchAuditLogsQuery(
        q.q, q.entityType, q.action, q.userId,
        q.dateFrom ? new Date(q.dateFrom) : undefined,
        q.dateTo ? new Date(q.dateTo) : undefined,
        q.field, q.module, q.sensitive,
        q.page, q.limit,
      ),
    );
    return ApiResponse.success(result);
  }

  @Get('stats')
  @RequirePermissions('audit:read')
  async stats(@Query() q: AuditQueryDto) {
    const result = await this.queryBus.execute(
      new GetAuditStatsQuery(
        q.dateFrom ? new Date(q.dateFrom) : undefined,
        q.dateTo ? new Date(q.dateTo) : undefined,
      ),
    );
    return ApiResponse.success(result);
  }

  @Get('stats/user/:userId')
  @RequirePermissions('audit:read')
  async userStats(@Param('userId') userId: string, @Query() q: AuditQueryDto) {
    const result = await this.queryBus.execute(
      new GetAuditStatsQuery(
        q.dateFrom ? new Date(q.dateFrom) : undefined,
        q.dateTo ? new Date(q.dateTo) : undefined,
        userId,
      ),
    );
    return ApiResponse.success(result);
  }

  @Get(':id')
  @RequirePermissions('audit:read')
  async detail(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetAuditLogDetailQuery(id));
    return ApiResponse.success(result);
  }

  @Get(':id/diff')
  @RequirePermissions('audit:read')
  async diff(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetDiffViewQuery(id));
    return ApiResponse.success(result);
  }

  @Post('export')
  @RequirePermissions('audit:export')
  async exportAudit(@Body() dto: ExportAuditDto, @CurrentUser('id') userId: string) {
    const result = await this.exportService.exportAuditTrail({
      format: dto.format,
      entityType: dto.entityType,
      entityId: dto.entityId,
      userId: dto.userId,
      dateFrom: new Date(dto.dateFrom),
      dateTo: new Date(dto.dateTo),
      exportedById: userId,
    });
    return ApiResponse.success(result, 'Audit trail exported');
  }

  @Post('log')
  @RequirePermissions('audit:write')
  async createLog(@Body() dto: CreateAuditLogDto) {
    const result = await this.commandBus.execute(
      new CreateAuditLogCommand(
        dto.entityType, dto.entityId, dto.action, dto.summary, dto.source,
        dto.performedById, dto.performedByName, dto.module,
        dto.changes, dto.correlationId, dto.tags,
      ),
    );
    return ApiResponse.success(result, 'Audit log created');
  }
}
