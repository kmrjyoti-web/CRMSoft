import {
  Controller, Get, Post, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { PlanGuard, RequirePlan } from '../../../../common/guards/plan.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateBroadcastCommand } from '../application/commands/create-broadcast/create-broadcast.command';
import { AddBroadcastRecipientsCommand } from '../application/commands/add-broadcast-recipients/add-broadcast-recipients.command';
import { StartBroadcastCommand } from '../application/commands/start-broadcast/start-broadcast.command';
import { PauseBroadcastCommand } from '../application/commands/pause-broadcast/pause-broadcast.command';
import { CancelBroadcastCommand } from '../application/commands/cancel-broadcast/cancel-broadcast.command';
import { GetBroadcastsQuery } from '../application/queries/get-broadcasts/query';
import { GetBroadcastDetailQuery } from '../application/queries/get-broadcast-detail/query';
import { GetBroadcastRecipientsQuery } from '../application/queries/get-broadcast-recipients/query';
import { CreateBroadcastDto, AddBroadcastRecipientsDto, BroadcastQueryDto, BroadcastRecipientQueryDto } from './dto/broadcast.dto';

@ApiTags('WhatsApp Broadcasts')
@ApiBearerAuth()
@RequirePlan('WL_PROFESSIONAL')
@UseGuards(JwtAuthGuard, PlanGuard)
@Controller('whatsapp/broadcasts')
export class WhatsAppBroadcastsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermissions('whatsapp:manage')
  async create(@Body() dto: CreateBroadcastDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(
      new CreateBroadcastCommand(
        dto.wabaId, dto.name, dto.templateId,
        dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        dto.throttlePerSecond, user.id, `${user.firstName} ${user.lastName}`.trim(),
      ),
    );
    return ApiResponse.success(result, 'Broadcast created');
  }

  @Post(':id/recipients')
  @RequirePermissions('whatsapp:manage')
  async addRecipients(@Param('id') id: string, @Body() dto: AddBroadcastRecipientsDto) {
    const result = await this.commandBus.execute(
      new AddBroadcastRecipientsCommand(id, dto.recipients),
    );
    return ApiResponse.success(result, 'Recipients added');
  }

  @Post(':id/start')
  @RequirePermissions('whatsapp:manage')
  async start(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.commandBus.execute(new StartBroadcastCommand(id, userId));
    return ApiResponse.success(null, 'Broadcast started');
  }

  @Post(':id/pause')
  @RequirePermissions('whatsapp:manage')
  async pause(@Param('id') id: string) {
    await this.commandBus.execute(new PauseBroadcastCommand(id));
    return ApiResponse.success(null, 'Broadcast paused');
  }

  @Post(':id/cancel')
  @RequirePermissions('whatsapp:manage')
  async cancel(@Param('id') id: string) {
    await this.commandBus.execute(new CancelBroadcastCommand(id));
    return ApiResponse.success(null, 'Broadcast cancelled');
  }

  @Get()
  @RequirePermissions('whatsapp:read')
  async list(@Query() dto: BroadcastQueryDto) {
    const result = await this.queryBus.execute(
      new GetBroadcastsQuery(dto.wabaId, dto.page || 1, dto.limit || 20, dto.status),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('whatsapp:read')
  async detail(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetBroadcastDetailQuery(id));
    return ApiResponse.success(result);
  }

  @Get(':id/recipients')
  @RequirePermissions('whatsapp:read')
  async recipients(@Param('id') id: string, @Query() dto: BroadcastRecipientQueryDto) {
    const result = await this.queryBus.execute(
      new GetBroadcastRecipientsQuery(id, dto.page || 1, dto.limit || 20, dto.status),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }
}
