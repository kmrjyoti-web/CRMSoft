import {
  Controller, Get, Post, Put, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateCampaignCommand } from '../application/commands/create-campaign/create-campaign.command';
import { UpdateCampaignCommand } from '../application/commands/update-campaign/update-campaign.command';
import { AddCampaignRecipientsCommand } from '../application/commands/add-campaign-recipients/add-campaign-recipients.command';
import { StartCampaignCommand } from '../application/commands/start-campaign/start-campaign.command';
import { PauseCampaignCommand } from '../application/commands/pause-campaign/pause-campaign.command';
import { CancelCampaignCommand } from '../application/commands/cancel-campaign/cancel-campaign.command';
import { GetCampaignsQuery } from '../application/queries/get-campaigns/query';
import { GetCampaignDetailQuery } from '../application/queries/get-campaign-detail/query';
import { GetCampaignStatsQuery } from '../application/queries/get-campaign-stats/query';
import { GetCampaignRecipientsQuery } from '../application/queries/get-campaign-recipients/query';
import { GetUnsubscribesQuery } from '../application/queries/get-unsubscribes/query';
import {
  CreateCampaignDto, UpdateCampaignDto, AddCampaignRecipientsDto,
  CampaignQueryDto, CampaignRecipientQueryDto,
} from './dto/campaign.dto';

@ApiTags('Email Campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('email-campaigns')
export class EmailCampaignController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermissions('emails:create')
  async create(@Body() dto: CreateCampaignDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(
      new CreateCampaignCommand(
        dto.name, dto.subject, dto.bodyHtml, dto.accountId, user.id, user.name || user.email,
        dto.description, dto.bodyText, dto.fromName, dto.replyToEmail,
        dto.templateId, dto.sendRatePerMinute, dto.batchSize,
        dto.trackOpens, dto.trackClicks, dto.includeUnsubscribe,
        dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      ),
    );
    return ApiResponse.success(result, 'Campaign created successfully');
  }

  @Put(':id')
  @RequirePermissions('emails:update')
  async update(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    const result = await this.commandBus.execute(
      new UpdateCampaignCommand(
        id, dto.name, dto.description, dto.subject, dto.bodyHtml, dto.bodyText,
        dto.sendRatePerMinute, dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      ),
    );
    return ApiResponse.success(result, 'Campaign updated successfully');
  }

  @Post(':id/recipients')
  @RequirePermissions('emails:update')
  async addRecipients(@Param('id') id: string, @Body() dto: AddCampaignRecipientsDto) {
    const result = await this.commandBus.execute(
      new AddCampaignRecipientsCommand(id, dto.recipients),
    );
    return ApiResponse.success(result, 'Recipients added successfully');
  }

  @Post(':id/start')
  @RequirePermissions('emails:update')
  async start(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new StartCampaignCommand(id, userId));
    return ApiResponse.success(result, 'Campaign started');
  }

  @Post(':id/pause')
  @RequirePermissions('emails:update')
  async pause(@Param('id') id: string) {
    const result = await this.commandBus.execute(new PauseCampaignCommand(id));
    return ApiResponse.success(result, 'Campaign paused');
  }

  @Post(':id/cancel')
  @RequirePermissions('emails:update')
  async cancel(@Param('id') id: string) {
    const result = await this.commandBus.execute(new CancelCampaignCommand(id));
    return ApiResponse.success(result, 'Campaign cancelled');
  }

  @Get()
  @RequirePermissions('emails:read')
  async list(@Query() query: CampaignQueryDto, @CurrentUser('id') userId: string) {
    const result = await this.queryBus.execute(
      new GetCampaignsQuery(userId, query.page || 1, query.limit || 20, query.status),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('unsubscribes')
  @RequirePermissions('emails:read')
  async unsubscribes(@Query('page') page?: number, @Query('limit') limit?: number) {
    const result = await this.queryBus.execute(new GetUnsubscribesQuery(page || 1, limit || 20));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('emails:read')
  async getById(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetCampaignDetailQuery(id));
    return ApiResponse.success(result, 'Campaign retrieved');
  }

  @Get(':id/stats')
  @RequirePermissions('emails:read')
  async stats(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetCampaignStatsQuery(id));
    return ApiResponse.success(result, 'Campaign stats retrieved');
  }

  @Get(':id/recipients')
  @RequirePermissions('emails:read')
  async recipients(@Param('id') id: string, @Query() query: CampaignRecipientQueryDto) {
    const result = await this.queryBus.execute(
      new GetCampaignRecipientsQuery(id, query.page || 1, query.limit || 20, query.status),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }
}
