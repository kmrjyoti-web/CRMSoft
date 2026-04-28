import {
  Controller, Get, Post, Put, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { PlanGuard, RequirePlan } from '../../../../common/guards/plan.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateChatbotFlowCommand } from '../application/commands/create-chatbot-flow/create-chatbot-flow.command';
import { UpdateChatbotFlowCommand } from '../application/commands/update-chatbot-flow/update-chatbot-flow.command';
import { ToggleChatbotFlowCommand } from '../application/commands/toggle-chatbot-flow/toggle-chatbot-flow.command';
import { GetChatbotFlowsQuery } from '../application/queries/get-chatbot-flows/query';
import { GetChatbotFlowDetailQuery } from '../application/queries/get-chatbot-flow-detail/query';
import { CreateChatbotFlowDto, UpdateChatbotFlowDto, ToggleChatbotFlowDto } from './dto/chatbot.dto';

@ApiTags('WhatsApp Chatbot')
@ApiBearerAuth()
@RequirePlan('WL_PROFESSIONAL')
@UseGuards(JwtAuthGuard, PlanGuard)
@Controller('whatsapp/chatbot')
export class WhatsAppChatbotController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermissions('whatsapp:manage')
  async create(@Body() dto: CreateChatbotFlowDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new CreateChatbotFlowCommand(dto.wabaId, dto.name, dto.triggerKeywords, dto.nodes, userId),
    );
    return ApiResponse.success(result, 'Chatbot flow created');
  }

  @Put(':id')
  @RequirePermissions('whatsapp:manage')
  async update(@Param('id') id: string, @Body() dto: UpdateChatbotFlowDto) {
    const result = await this.commandBus.execute(
      new UpdateChatbotFlowCommand(id, dto.name, dto.triggerKeywords, dto.nodes),
    );
    return ApiResponse.success(result, 'Chatbot flow updated');
  }

  @Post(':id/toggle')
  @RequirePermissions('whatsapp:manage')
  async toggle(@Param('id') id: string, @Body() dto: ToggleChatbotFlowDto) {
    const result = await this.commandBus.execute(new ToggleChatbotFlowCommand(id, dto.status));
    return ApiResponse.success(result, 'Chatbot flow status updated');
  }

  @Get()
  @RequirePermissions('whatsapp:read')
  async list(@Query('wabaId') wabaId: string, @Query('status') status?: string) {
    const result = await this.queryBus.execute(new GetChatbotFlowsQuery(wabaId, status));
    return ApiResponse.success(result);
  }

  @Get(':id')
  @RequirePermissions('whatsapp:read')
  async detail(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetChatbotFlowDetailQuery(id));
    return ApiResponse.success(result);
  }
}
