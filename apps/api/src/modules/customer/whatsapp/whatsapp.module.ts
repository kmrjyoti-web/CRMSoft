import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';

// Services
import { WaApiService } from './services/wa-api.service';
import { WaWebhookService } from './services/wa-webhook.service';
import { WaConversationService } from './services/wa-conversation.service';
import { WaMessageSenderService } from './services/wa-message-sender.service';
import { WaMediaService } from './services/wa-media.service';
import { WaTemplateService } from './services/wa-template.service';
import { WaEntityLinkerService } from './services/wa-entity-linker.service';
import { WaChatbotEngineService } from './services/wa-chatbot-engine.service';
import { WaBroadcastExecutorService } from './services/wa-broadcast-executor.service';
import { WaWindowCheckerService } from './services/wa-window-checker.service';
import { WaAnalyticsService } from './services/wa-analytics.service';

// Command Handlers
import { SetupWabaHandler } from './application/commands/setup-waba/setup-waba.handler';
import { UpdateWabaHandler } from './application/commands/update-waba/update-waba.handler';
import { SendTextMessageHandler } from './application/commands/send-text-message/send-text-message.handler';
import { SendTemplateMessageHandler } from './application/commands/send-template-message/send-template-message.handler';
import { SendMediaMessageHandler } from './application/commands/send-media-message/send-media-message.handler';
import { SendInteractiveMessageHandler } from './application/commands/send-interactive-message/send-interactive-message.handler';
import { SendLocationMessageHandler } from './application/commands/send-location-message/send-location-message.handler';
import { MarkConversationReadHandler } from './application/commands/mark-conversation-read/mark-conversation-read.handler';
import { AssignConversationHandler } from './application/commands/assign-conversation/assign-conversation.handler';
import { ResolveConversationHandler } from './application/commands/resolve-conversation/resolve-conversation.handler';
import { ReopenConversationHandler } from './application/commands/reopen-conversation/reopen-conversation.handler';
import { LinkConversationToEntityHandler } from './application/commands/link-conversation-to-entity/link-conversation-to-entity.handler';
import { CreateTemplateHandler } from './application/commands/create-template/create-template.handler';
import { UpdateTemplateHandler } from './application/commands/update-template/update-template.handler';
import { DeleteTemplateHandler } from './application/commands/delete-template/delete-template.handler';
import { SyncTemplatesHandler } from './application/commands/sync-templates/sync-templates.handler';
import { CreateBroadcastHandler } from './application/commands/create-broadcast/create-broadcast.handler';
import { AddBroadcastRecipientsHandler } from './application/commands/add-broadcast-recipients/add-broadcast-recipients.handler';
import { StartBroadcastHandler } from './application/commands/start-broadcast/start-broadcast.handler';
import { PauseBroadcastHandler } from './application/commands/pause-broadcast/pause-broadcast.handler';
import { CancelBroadcastHandler } from './application/commands/cancel-broadcast/cancel-broadcast.handler';
import { CreateChatbotFlowHandler } from './application/commands/create-chatbot-flow/create-chatbot-flow.handler';
import { UpdateChatbotFlowHandler } from './application/commands/update-chatbot-flow/update-chatbot-flow.handler';
import { ToggleChatbotFlowHandler } from './application/commands/toggle-chatbot-flow/toggle-chatbot-flow.handler';
import { CreateQuickReplyHandler } from './application/commands/create-quick-reply/create-quick-reply.handler';
import { OptOutContactHandler } from './application/commands/opt-out-contact/opt-out-contact.handler';
import { OptInContactHandler } from './application/commands/opt-in-contact/opt-in-contact.handler';

// Query Handlers
import { GetConversationsHandler } from './application/queries/get-conversations/handler';
import { GetConversationDetailHandler } from './application/queries/get-conversation-detail/handler';
import { GetConversationMessagesHandler } from './application/queries/get-conversation-messages/handler';
import { GetEntityConversationsHandler } from './application/queries/get-entity-conversations/handler';
import { SearchConversationsHandler } from './application/queries/search-conversations/handler';
import { GetWabaDetailHandler } from './application/queries/get-waba-detail/handler';
import { GetTemplatesHandler } from './application/queries/get-templates/handler';
import { GetTemplateDetailHandler } from './application/queries/get-template-detail/handler';
import { GetBroadcastsHandler } from './application/queries/get-broadcasts/handler';
import { GetBroadcastDetailHandler } from './application/queries/get-broadcast-detail/handler';
import { GetBroadcastRecipientsHandler } from './application/queries/get-broadcast-recipients/handler';
import { GetChatbotFlowsHandler } from './application/queries/get-chatbot-flows/handler';
import { GetChatbotFlowDetailHandler } from './application/queries/get-chatbot-flow-detail/handler';
import { GetQuickRepliesHandler } from './application/queries/get-quick-replies/handler';
import { GetAnalyticsHandler } from './application/queries/get-analytics/handler';
import { GetAgentPerformanceHandler } from './application/queries/get-agent-performance/handler';
import { GetOptOutsHandler } from './application/queries/get-opt-outs/handler';

// Controllers
import { WhatsAppController } from './presentation/whatsapp.controller';
import { WhatsAppWebhookController } from './presentation/whatsapp-webhook.controller';
import { WhatsAppTemplatesController } from './presentation/whatsapp-templates.controller';
import { WhatsAppBroadcastsController } from './presentation/whatsapp-broadcasts.controller';
import { WhatsAppChatbotController } from './presentation/whatsapp-chatbot.controller';
import { WhatsAppQuickRepliesController } from './presentation/whatsapp-quick-replies.controller';

const CommandHandlers = [
  SetupWabaHandler,
  UpdateWabaHandler,
  SendTextMessageHandler,
  SendTemplateMessageHandler,
  SendMediaMessageHandler,
  SendInteractiveMessageHandler,
  SendLocationMessageHandler,
  MarkConversationReadHandler,
  AssignConversationHandler,
  ResolveConversationHandler,
  ReopenConversationHandler,
  LinkConversationToEntityHandler,
  CreateTemplateHandler,
  UpdateTemplateHandler,
  DeleteTemplateHandler,
  SyncTemplatesHandler,
  CreateBroadcastHandler,
  AddBroadcastRecipientsHandler,
  StartBroadcastHandler,
  PauseBroadcastHandler,
  CancelBroadcastHandler,
  CreateChatbotFlowHandler,
  UpdateChatbotFlowHandler,
  ToggleChatbotFlowHandler,
  CreateQuickReplyHandler,
  OptOutContactHandler,
  OptInContactHandler,
];

const QueryHandlers = [
  GetConversationsHandler,
  GetConversationDetailHandler,
  GetConversationMessagesHandler,
  GetEntityConversationsHandler,
  SearchConversationsHandler,
  GetWabaDetailHandler,
  GetTemplatesHandler,
  GetTemplateDetailHandler,
  GetBroadcastsHandler,
  GetBroadcastDetailHandler,
  GetBroadcastRecipientsHandler,
  GetChatbotFlowsHandler,
  GetChatbotFlowDetailHandler,
  GetQuickRepliesHandler,
  GetAnalyticsHandler,
  GetAgentPerformanceHandler,
  GetOptOutsHandler,
];

@Module({
  imports: [CqrsModule, HttpModule],
  controllers: [
    WhatsAppController,
    WhatsAppWebhookController,
    WhatsAppTemplatesController,
    WhatsAppBroadcastsController,
    WhatsAppChatbotController,
    WhatsAppQuickRepliesController,
  ],
  providers: [
    // Services
    WaApiService,
    WaWebhookService,
    WaConversationService,
    WaMessageSenderService,
    WaMediaService,
    WaTemplateService,
    WaEntityLinkerService,
    WaChatbotEngineService,
    WaBroadcastExecutorService,
    WaWindowCheckerService,
    WaAnalyticsService,
    // CQRS
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    WaApiService,
    WaMessageSenderService,
    WaAnalyticsService,
  ],
})
export class WhatsAppModule {}
