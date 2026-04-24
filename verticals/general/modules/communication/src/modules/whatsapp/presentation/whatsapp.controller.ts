import {
  Controller, Get, Post, Put, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

// Commands
import { SetupWabaCommand } from '../application/commands/setup-waba/setup-waba.command';
import { UpdateWabaCommand } from '../application/commands/update-waba/update-waba.command';
import { SendTextMessageCommand } from '../application/commands/send-text-message/send-text-message.command';
import { SendTemplateMessageCommand } from '../application/commands/send-template-message/send-template-message.command';
import { SendMediaMessageCommand } from '../application/commands/send-media-message/send-media-message.command';
import { SendInteractiveMessageCommand } from '../application/commands/send-interactive-message/send-interactive-message.command';
import { SendLocationMessageCommand } from '../application/commands/send-location-message/send-location-message.command';
import { MarkConversationReadCommand } from '../application/commands/mark-conversation-read/mark-conversation-read.command';
import { AssignConversationCommand } from '../application/commands/assign-conversation/assign-conversation.command';
import { ResolveConversationCommand } from '../application/commands/resolve-conversation/resolve-conversation.command';
import { ReopenConversationCommand } from '../application/commands/reopen-conversation/reopen-conversation.command';
import { LinkConversationToEntityCommand } from '../application/commands/link-conversation-to-entity/link-conversation-to-entity.command';
import { OptOutContactCommand } from '../application/commands/opt-out-contact/opt-out-contact.command';
import { OptInContactCommand } from '../application/commands/opt-in-contact/opt-in-contact.command';

// Queries
import { GetWabaDetailQuery } from '../application/queries/get-waba-detail/query';
import { GetConversationsQuery } from '../application/queries/get-conversations/query';
import { GetConversationDetailQuery } from '../application/queries/get-conversation-detail/query';
import { GetConversationMessagesQuery } from '../application/queries/get-conversation-messages/query';
import { GetEntityConversationsQuery } from '../application/queries/get-entity-conversations/query';
import { SearchConversationsQuery } from '../application/queries/search-conversations/query';
import { GetAnalyticsQuery } from '../application/queries/get-analytics/query';
import { GetAgentPerformanceQuery } from '../application/queries/get-agent-performance/query';
import { GetOptOutsQuery } from '../application/queries/get-opt-outs/query';

// DTOs
import { SetupWabaDto, UpdateWabaDto } from './dto/waba.dto';
import { SendTextMessageDto, SendTemplateMessageDto, SendMediaMessageDto, SendInteractiveMessageDto, SendLocationMessageDto } from './dto/message.dto';
import { ConversationQueryDto, AssignConversationDto, LinkConversationDto } from './dto/conversation.dto';

@ApiTags('WhatsApp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('whatsapp')
export class WhatsAppController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ═══ WABA ═══

  @Post('waba/setup')
  @RequirePermissions('whatsapp:manage')
  async setupWaba(@Body() dto: SetupWabaDto) {
    const result = await this.commandBus.execute(
      new SetupWabaCommand(dto.wabaId, dto.phoneNumberId, dto.phoneNumber, dto.displayName, dto.accessToken, dto.webhookVerifyToken),
    );
    return ApiResponse.success(result, 'WABA setup successfully');
  }

  @Put('waba/:id')
  @RequirePermissions('whatsapp:manage')
  async updateWaba(@Param('id') id: string, @Body() dto: UpdateWabaDto) {
    const result = await this.commandBus.execute(
      new UpdateWabaCommand(id, dto.displayName, dto.accessToken, dto.settings),
    );
    return ApiResponse.success(result, 'WABA updated successfully');
  }

  @Get('waba/:id')
  @RequirePermissions('whatsapp:read')
  async getWabaDetail(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetWabaDetailQuery(id));
    return ApiResponse.success(result);
  }

  // ═══ CONVERSATIONS ═══

  @Get('conversations')
  @RequirePermissions('whatsapp:read')
  async getConversations(@Query() dto: ConversationQueryDto) {
    const result = await this.queryBus.execute(
      new GetConversationsQuery(dto.wabaId, dto.page || 1, dto.limit || 20, dto.status, dto.assignedToId, dto.search),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('conversations/search')
  @RequirePermissions('whatsapp:read')
  async searchConversations(@Query('wabaId') wabaId: string, @Query('q') q: string, @Query() pagination: PaginationDto) {
    const result = await this.queryBus.execute(
      new SearchConversationsQuery(wabaId, q, pagination.page || 1, pagination.limit || 20),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('conversations/entity/:type/:entityId')
  @RequirePermissions('whatsapp:read')
  async getEntityConversations(
    @Param('type') type: string, @Param('entityId') entityId: string, @Query() pagination: PaginationDto,
  ) {
    const result = await this.queryBus.execute(
      new GetEntityConversationsQuery(type, entityId, pagination.page || 1, pagination.limit || 20),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('conversations/:id')
  @RequirePermissions('whatsapp:read')
  async getConversationDetail(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetConversationDetailQuery(id));
    return ApiResponse.success(result);
  }

  @Get('conversations/:id/messages')
  @RequirePermissions('whatsapp:read')
  async getConversationMessages(@Param('id') id: string, @Query() pagination: PaginationDto) {
    const result = await this.queryBus.execute(
      new GetConversationMessagesQuery(id, pagination.page || 1, pagination.limit || 20),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  // ═══ MESSAGES ═══

  @Post('conversations/:id/send-text')
  @RequirePermissions('whatsapp:send')
  async sendText(@Param('id') id: string, @Body() dto: SendTextMessageDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new SendTextMessageCommand(dto.wabaId, id, dto.text, userId),
    );
    return ApiResponse.success(result, 'Text message sent');
  }

  @Post('conversations/:id/send-template')
  @RequirePermissions('whatsapp:send')
  async sendTemplate(@Param('id') id: string, @Body() dto: SendTemplateMessageDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new SendTemplateMessageCommand(dto.wabaId, id, dto.templateId, dto.variables, userId),
    );
    return ApiResponse.success(result, 'Template message sent');
  }

  @Post('conversations/:id/send-media')
  @RequirePermissions('whatsapp:send')
  async sendMedia(@Param('id') id: string, @Body() dto: SendMediaMessageDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new SendMediaMessageCommand(dto.wabaId, id, dto.type, dto.mediaUrl, dto.caption, userId),
    );
    return ApiResponse.success(result, 'Media message sent');
  }

  @Post('conversations/:id/send-interactive')
  @RequirePermissions('whatsapp:send')
  async sendInteractive(@Param('id') id: string, @Body() dto: SendInteractiveMessageDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new SendInteractiveMessageCommand(dto.wabaId, id, dto.interactiveType, dto.interactiveData, userId),
    );
    return ApiResponse.success(result, 'Interactive message sent');
  }

  @Post('conversations/:id/send-location')
  @RequirePermissions('whatsapp:send')
  async sendLocation(@Param('id') id: string, @Body() dto: SendLocationMessageDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new SendLocationMessageCommand(dto.wabaId, id, dto.lat, dto.lng, dto.name, dto.address, userId),
    );
    return ApiResponse.success(result, 'Location message sent');
  }

  // ═══ CONVERSATION ACTIONS ═══

  @Post('conversations/:id/read')
  @RequirePermissions('whatsapp:send')
  async markRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.commandBus.execute(new MarkConversationReadCommand(id, userId));
    return ApiResponse.success(null, 'Conversation marked as read');
  }

  @Post('conversations/:id/assign')
  @RequirePermissions('whatsapp:manage')
  async assign(@Param('id') id: string, @Body() dto: AssignConversationDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new AssignConversationCommand(id, dto.assignToUserId, userId),
    );
    return ApiResponse.success(result, 'Conversation assigned');
  }

  @Post('conversations/:id/resolve')
  @RequirePermissions('whatsapp:manage')
  async resolve(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new ResolveConversationCommand(id, userId));
    return ApiResponse.success(result, 'Conversation resolved');
  }

  @Post('conversations/:id/reopen')
  @RequirePermissions('whatsapp:manage')
  async reopen(@Param('id') id: string) {
    const result = await this.commandBus.execute(new ReopenConversationCommand(id));
    return ApiResponse.success(result, 'Conversation reopened');
  }

  @Post('conversations/:id/link')
  @RequirePermissions('whatsapp:manage')
  async linkEntity(@Param('id') id: string, @Body() dto: LinkConversationDto, @CurrentUser('id') userId: string) {
    await this.commandBus.execute(
      new LinkConversationToEntityCommand(id, dto.entityType, dto.entityId, userId),
    );
    return ApiResponse.success(null, 'Conversation linked to entity');
  }

  // ═══ ANALYTICS ═══

  @Get('analytics')
  @RequirePermissions('whatsapp:read')
  async getAnalytics(@Query('wabaId') wabaId: string, @Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    const result = await this.queryBus.execute(
      new GetAnalyticsQuery(wabaId, dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined),
    );
    return ApiResponse.success(result);
  }

  @Get('analytics/agents')
  @RequirePermissions('whatsapp:read')
  async getAgentPerformance(@Query('wabaId') wabaId: string, @Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    const result = await this.queryBus.execute(
      new GetAgentPerformanceQuery(wabaId, dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined),
    );
    return ApiResponse.success(result);
  }

  // ═══ OPT-OUTS ═══

  @Get('opt-outs')
  @RequirePermissions('whatsapp:read')
  async getOptOuts(@Query('wabaId') wabaId: string, @Query() pagination: PaginationDto) {
    const result = await this.queryBus.execute(
      new GetOptOutsQuery(wabaId, pagination.page || 1, pagination.limit || 20),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Post('opt-out')
  @RequirePermissions('whatsapp:manage')
  async optOut(@Body() body: { wabaId: string; phoneNumber: string; contactId?: string; reason?: string }) {
    await this.commandBus.execute(
      new OptOutContactCommand(body.wabaId, body.phoneNumber, body.contactId, body.reason),
    );
    return ApiResponse.success(null, 'Contact opted out');
  }

  @Post('opt-in')
  @RequirePermissions('whatsapp:manage')
  async optIn(@Body() body: { wabaId: string; phoneNumber: string }) {
    await this.commandBus.execute(new OptInContactCommand(body.wabaId, body.phoneNumber));
    return ApiResponse.success(null, 'Contact opted in');
  }
}
