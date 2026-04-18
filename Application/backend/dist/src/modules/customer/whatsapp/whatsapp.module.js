"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const axios_1 = require("@nestjs/axios");
const wa_api_service_1 = require("./services/wa-api.service");
const wa_webhook_service_1 = require("./services/wa-webhook.service");
const wa_conversation_service_1 = require("./services/wa-conversation.service");
const wa_message_sender_service_1 = require("./services/wa-message-sender.service");
const wa_media_service_1 = require("./services/wa-media.service");
const wa_template_service_1 = require("./services/wa-template.service");
const wa_entity_linker_service_1 = require("./services/wa-entity-linker.service");
const wa_chatbot_engine_service_1 = require("./services/wa-chatbot-engine.service");
const wa_broadcast_executor_service_1 = require("./services/wa-broadcast-executor.service");
const wa_window_checker_service_1 = require("./services/wa-window-checker.service");
const wa_analytics_service_1 = require("./services/wa-analytics.service");
const setup_waba_handler_1 = require("./application/commands/setup-waba/setup-waba.handler");
const update_waba_handler_1 = require("./application/commands/update-waba/update-waba.handler");
const send_text_message_handler_1 = require("./application/commands/send-text-message/send-text-message.handler");
const send_template_message_handler_1 = require("./application/commands/send-template-message/send-template-message.handler");
const send_media_message_handler_1 = require("./application/commands/send-media-message/send-media-message.handler");
const send_interactive_message_handler_1 = require("./application/commands/send-interactive-message/send-interactive-message.handler");
const send_location_message_handler_1 = require("./application/commands/send-location-message/send-location-message.handler");
const mark_conversation_read_handler_1 = require("./application/commands/mark-conversation-read/mark-conversation-read.handler");
const assign_conversation_handler_1 = require("./application/commands/assign-conversation/assign-conversation.handler");
const resolve_conversation_handler_1 = require("./application/commands/resolve-conversation/resolve-conversation.handler");
const reopen_conversation_handler_1 = require("./application/commands/reopen-conversation/reopen-conversation.handler");
const link_conversation_to_entity_handler_1 = require("./application/commands/link-conversation-to-entity/link-conversation-to-entity.handler");
const create_template_handler_1 = require("./application/commands/create-template/create-template.handler");
const update_template_handler_1 = require("./application/commands/update-template/update-template.handler");
const delete_template_handler_1 = require("./application/commands/delete-template/delete-template.handler");
const sync_templates_handler_1 = require("./application/commands/sync-templates/sync-templates.handler");
const create_broadcast_handler_1 = require("./application/commands/create-broadcast/create-broadcast.handler");
const add_broadcast_recipients_handler_1 = require("./application/commands/add-broadcast-recipients/add-broadcast-recipients.handler");
const start_broadcast_handler_1 = require("./application/commands/start-broadcast/start-broadcast.handler");
const pause_broadcast_handler_1 = require("./application/commands/pause-broadcast/pause-broadcast.handler");
const cancel_broadcast_handler_1 = require("./application/commands/cancel-broadcast/cancel-broadcast.handler");
const create_chatbot_flow_handler_1 = require("./application/commands/create-chatbot-flow/create-chatbot-flow.handler");
const update_chatbot_flow_handler_1 = require("./application/commands/update-chatbot-flow/update-chatbot-flow.handler");
const toggle_chatbot_flow_handler_1 = require("./application/commands/toggle-chatbot-flow/toggle-chatbot-flow.handler");
const create_quick_reply_handler_1 = require("./application/commands/create-quick-reply/create-quick-reply.handler");
const opt_out_contact_handler_1 = require("./application/commands/opt-out-contact/opt-out-contact.handler");
const opt_in_contact_handler_1 = require("./application/commands/opt-in-contact/opt-in-contact.handler");
const handler_1 = require("./application/queries/get-conversations/handler");
const handler_2 = require("./application/queries/get-conversation-detail/handler");
const handler_3 = require("./application/queries/get-conversation-messages/handler");
const handler_4 = require("./application/queries/get-entity-conversations/handler");
const handler_5 = require("./application/queries/search-conversations/handler");
const handler_6 = require("./application/queries/get-waba-detail/handler");
const handler_7 = require("./application/queries/get-templates/handler");
const handler_8 = require("./application/queries/get-template-detail/handler");
const handler_9 = require("./application/queries/get-broadcasts/handler");
const handler_10 = require("./application/queries/get-broadcast-detail/handler");
const handler_11 = require("./application/queries/get-broadcast-recipients/handler");
const handler_12 = require("./application/queries/get-chatbot-flows/handler");
const handler_13 = require("./application/queries/get-chatbot-flow-detail/handler");
const handler_14 = require("./application/queries/get-quick-replies/handler");
const handler_15 = require("./application/queries/get-analytics/handler");
const handler_16 = require("./application/queries/get-agent-performance/handler");
const handler_17 = require("./application/queries/get-opt-outs/handler");
const whatsapp_controller_1 = require("./presentation/whatsapp.controller");
const whatsapp_webhook_controller_1 = require("./presentation/whatsapp-webhook.controller");
const whatsapp_templates_controller_1 = require("./presentation/whatsapp-templates.controller");
const whatsapp_broadcasts_controller_1 = require("./presentation/whatsapp-broadcasts.controller");
const whatsapp_chatbot_controller_1 = require("./presentation/whatsapp-chatbot.controller");
const whatsapp_quick_replies_controller_1 = require("./presentation/whatsapp-quick-replies.controller");
const CommandHandlers = [
    setup_waba_handler_1.SetupWabaHandler,
    update_waba_handler_1.UpdateWabaHandler,
    send_text_message_handler_1.SendTextMessageHandler,
    send_template_message_handler_1.SendTemplateMessageHandler,
    send_media_message_handler_1.SendMediaMessageHandler,
    send_interactive_message_handler_1.SendInteractiveMessageHandler,
    send_location_message_handler_1.SendLocationMessageHandler,
    mark_conversation_read_handler_1.MarkConversationReadHandler,
    assign_conversation_handler_1.AssignConversationHandler,
    resolve_conversation_handler_1.ResolveConversationHandler,
    reopen_conversation_handler_1.ReopenConversationHandler,
    link_conversation_to_entity_handler_1.LinkConversationToEntityHandler,
    create_template_handler_1.CreateTemplateHandler,
    update_template_handler_1.UpdateTemplateHandler,
    delete_template_handler_1.DeleteTemplateHandler,
    sync_templates_handler_1.SyncTemplatesHandler,
    create_broadcast_handler_1.CreateBroadcastHandler,
    add_broadcast_recipients_handler_1.AddBroadcastRecipientsHandler,
    start_broadcast_handler_1.StartBroadcastHandler,
    pause_broadcast_handler_1.PauseBroadcastHandler,
    cancel_broadcast_handler_1.CancelBroadcastHandler,
    create_chatbot_flow_handler_1.CreateChatbotFlowHandler,
    update_chatbot_flow_handler_1.UpdateChatbotFlowHandler,
    toggle_chatbot_flow_handler_1.ToggleChatbotFlowHandler,
    create_quick_reply_handler_1.CreateQuickReplyHandler,
    opt_out_contact_handler_1.OptOutContactHandler,
    opt_in_contact_handler_1.OptInContactHandler,
];
const QueryHandlers = [
    handler_1.GetConversationsHandler,
    handler_2.GetConversationDetailHandler,
    handler_3.GetConversationMessagesHandler,
    handler_4.GetEntityConversationsHandler,
    handler_5.SearchConversationsHandler,
    handler_6.GetWabaDetailHandler,
    handler_7.GetTemplatesHandler,
    handler_8.GetTemplateDetailHandler,
    handler_9.GetBroadcastsHandler,
    handler_10.GetBroadcastDetailHandler,
    handler_11.GetBroadcastRecipientsHandler,
    handler_12.GetChatbotFlowsHandler,
    handler_13.GetChatbotFlowDetailHandler,
    handler_14.GetQuickRepliesHandler,
    handler_15.GetAnalyticsHandler,
    handler_16.GetAgentPerformanceHandler,
    handler_17.GetOptOutsHandler,
];
let WhatsAppModule = class WhatsAppModule {
};
exports.WhatsAppModule = WhatsAppModule;
exports.WhatsAppModule = WhatsAppModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule, axios_1.HttpModule],
        controllers: [
            whatsapp_controller_1.WhatsAppController,
            whatsapp_webhook_controller_1.WhatsAppWebhookController,
            whatsapp_templates_controller_1.WhatsAppTemplatesController,
            whatsapp_broadcasts_controller_1.WhatsAppBroadcastsController,
            whatsapp_chatbot_controller_1.WhatsAppChatbotController,
            whatsapp_quick_replies_controller_1.WhatsAppQuickRepliesController,
        ],
        providers: [
            wa_api_service_1.WaApiService,
            wa_webhook_service_1.WaWebhookService,
            wa_conversation_service_1.WaConversationService,
            wa_message_sender_service_1.WaMessageSenderService,
            wa_media_service_1.WaMediaService,
            wa_template_service_1.WaTemplateService,
            wa_entity_linker_service_1.WaEntityLinkerService,
            wa_chatbot_engine_service_1.WaChatbotEngineService,
            wa_broadcast_executor_service_1.WaBroadcastExecutorService,
            wa_window_checker_service_1.WaWindowCheckerService,
            wa_analytics_service_1.WaAnalyticsService,
            ...CommandHandlers,
            ...QueryHandlers,
        ],
        exports: [
            wa_api_service_1.WaApiService,
            wa_message_sender_service_1.WaMessageSenderService,
            wa_analytics_service_1.WaAnalyticsService,
        ],
    })
], WhatsAppModule);
//# sourceMappingURL=whatsapp.module.js.map