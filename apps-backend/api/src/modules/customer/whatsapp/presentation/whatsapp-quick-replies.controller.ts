import {
  Controller, Get, Post, Query, Body, UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { PlanGuard, RequirePlan } from '../../../../common/guards/plan.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateQuickReplyCommand } from '../application/commands/create-quick-reply/create-quick-reply.command';
import { GetQuickRepliesQuery } from '../application/queries/get-quick-replies/query';
import { CreateQuickReplyDto } from './dto/quick-reply.dto';

@ApiTags('WhatsApp Quick Replies')
@ApiBearerAuth()
@RequirePlan('WL_PROFESSIONAL')
@UseGuards(JwtAuthGuard, PlanGuard)
@Controller('whatsapp/quick-replies')
export class WhatsAppQuickRepliesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermissions('whatsapp:manage')
  async create(@Body() dto: CreateQuickReplyDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new CreateQuickReplyCommand(dto.wabaId, dto.shortcut, dto.message, userId, dto.category),
    );
    return ApiResponse.success(result, 'Quick reply created');
  }

  @Get()
  @RequirePermissions('whatsapp:read')
  async list(@Query('wabaId') wabaId: string, @Query('category') category?: string) {
    const result = await this.queryBus.execute(new GetQuickRepliesQuery(wabaId, category));
    return ApiResponse.success(result);
  }
}
