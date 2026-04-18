"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const tenant_config_module_1 = require("../../softwarevendor/tenant-config/tenant-config.module");
const gmail_service_1 = require("./services/gmail.service");
const outlook_service_1 = require("./services/outlook.service");
const imap_smtp_service_1 = require("./services/imap-smtp.service");
const email_provider_factory_service_1 = require("./services/email-provider-factory.service");
const template_renderer_service_1 = require("./services/template-renderer.service");
const tracking_service_1 = require("./services/tracking.service");
const email_sender_service_1 = require("./services/email-sender.service");
const email_linker_service_1 = require("./services/email-linker.service");
const thread_builder_service_1 = require("./services/thread-builder.service");
const email_sync_service_1 = require("./services/email-sync.service");
const campaign_executor_service_1 = require("./services/campaign-executor.service");
const email_analytics_service_1 = require("./services/email-analytics.service");
const connect_account_handler_1 = require("./application/commands/connect-account/connect-account.handler");
const disconnect_account_handler_1 = require("./application/commands/disconnect-account/disconnect-account.handler");
const compose_email_handler_1 = require("./application/commands/compose-email/compose-email.handler");
const reply_email_handler_1 = require("./application/commands/reply-email/reply-email.handler");
const send_email_handler_1 = require("./application/commands/send-email/send-email.handler");
const schedule_email_handler_1 = require("./application/commands/schedule-email/schedule-email.handler");
const cancel_scheduled_email_handler_1 = require("./application/commands/cancel-scheduled-email/cancel-scheduled-email.handler");
const star_email_handler_1 = require("./application/commands/star-email/star-email.handler");
const mark_read_handler_1 = require("./application/commands/mark-read/mark-read.handler");
const link_email_to_entity_handler_1 = require("./application/commands/link-email-to-entity/link-email-to-entity.handler");
const unlink_email_from_entity_handler_1 = require("./application/commands/unlink-email-from-entity/unlink-email-from-entity.handler");
const sync_inbox_handler_1 = require("./application/commands/sync-inbox/sync-inbox.handler");
const create_template_handler_1 = require("./application/commands/create-template/create-template.handler");
const update_template_handler_1 = require("./application/commands/update-template/update-template.handler");
const delete_template_handler_1 = require("./application/commands/delete-template/delete-template.handler");
const create_signature_handler_1 = require("./application/commands/create-signature/create-signature.handler");
const update_signature_handler_1 = require("./application/commands/update-signature/update-signature.handler");
const delete_signature_handler_1 = require("./application/commands/delete-signature/delete-signature.handler");
const create_campaign_handler_1 = require("./application/commands/create-campaign/create-campaign.handler");
const update_campaign_handler_1 = require("./application/commands/update-campaign/update-campaign.handler");
const add_campaign_recipients_handler_1 = require("./application/commands/add-campaign-recipients/add-campaign-recipients.handler");
const start_campaign_handler_1 = require("./application/commands/start-campaign/start-campaign.handler");
const pause_campaign_handler_1 = require("./application/commands/pause-campaign/pause-campaign.handler");
const cancel_campaign_handler_1 = require("./application/commands/cancel-campaign/cancel-campaign.handler");
const process_tracking_event_handler_1 = require("./application/commands/process-tracking-event/process-tracking-event.handler");
const handler_1 = require("./application/queries/get-email/handler");
const handler_2 = require("./application/queries/get-emails/handler");
const handler_3 = require("./application/queries/get-email-thread/handler");
const handler_4 = require("./application/queries/get-entity-emails/handler");
const handler_5 = require("./application/queries/search-emails/handler");
const handler_6 = require("./application/queries/get-accounts/handler");
const handler_7 = require("./application/queries/get-account-detail/handler");
const handler_8 = require("./application/queries/get-templates/handler");
const handler_9 = require("./application/queries/get-template-detail/handler");
const handler_10 = require("./application/queries/preview-template/handler");
const handler_11 = require("./application/queries/get-signatures/handler");
const handler_12 = require("./application/queries/get-campaigns/handler");
const handler_13 = require("./application/queries/get-campaign-detail/handler");
const handler_14 = require("./application/queries/get-campaign-stats/handler");
const handler_15 = require("./application/queries/get-campaign-recipients/handler");
const handler_16 = require("./application/queries/get-email-analytics/handler");
const handler_17 = require("./application/queries/get-unsubscribes/handler");
const email_controller_1 = require("./presentation/email.controller");
const email_account_controller_1 = require("./presentation/email-account.controller");
const email_template_controller_1 = require("./presentation/email-template.controller");
const email_signature_controller_1 = require("./presentation/email-signature.controller");
const email_campaign_controller_1 = require("./presentation/email-campaign.controller");
const email_tracking_controller_1 = require("./presentation/email-tracking.controller");
const CommandHandlers = [
    connect_account_handler_1.ConnectAccountHandler,
    disconnect_account_handler_1.DisconnectAccountHandler,
    compose_email_handler_1.ComposeEmailHandler,
    reply_email_handler_1.ReplyEmailHandler,
    send_email_handler_1.SendEmailHandler,
    schedule_email_handler_1.ScheduleEmailHandler,
    cancel_scheduled_email_handler_1.CancelScheduledEmailHandler,
    star_email_handler_1.StarEmailHandler,
    mark_read_handler_1.MarkReadHandler,
    link_email_to_entity_handler_1.LinkEmailToEntityHandler,
    unlink_email_from_entity_handler_1.UnlinkEmailFromEntityHandler,
    sync_inbox_handler_1.SyncInboxHandler,
    create_template_handler_1.CreateTemplateHandler,
    update_template_handler_1.UpdateTemplateHandler,
    delete_template_handler_1.DeleteTemplateHandler,
    create_signature_handler_1.CreateSignatureHandler,
    update_signature_handler_1.UpdateSignatureHandler,
    delete_signature_handler_1.DeleteSignatureHandler,
    create_campaign_handler_1.CreateCampaignHandler,
    update_campaign_handler_1.UpdateCampaignHandler,
    add_campaign_recipients_handler_1.AddCampaignRecipientsHandler,
    start_campaign_handler_1.StartCampaignHandler,
    pause_campaign_handler_1.PauseCampaignHandler,
    cancel_campaign_handler_1.CancelCampaignHandler,
    process_tracking_event_handler_1.ProcessTrackingEventHandler,
];
const QueryHandlers = [
    handler_1.GetEmailHandler,
    handler_2.GetEmailsHandler,
    handler_3.GetEmailThreadHandler,
    handler_4.GetEntityEmailsHandler,
    handler_5.SearchEmailsHandler,
    handler_6.GetAccountsHandler,
    handler_7.GetAccountDetailHandler,
    handler_8.GetTemplatesHandler,
    handler_9.GetTemplateDetailHandler,
    handler_10.PreviewTemplateHandler,
    handler_11.GetSignaturesHandler,
    handler_12.GetCampaignsHandler,
    handler_13.GetCampaignDetailHandler,
    handler_14.GetCampaignStatsHandler,
    handler_15.GetCampaignRecipientsHandler,
    handler_16.GetEmailAnalyticsHandler,
    handler_17.GetUnsubscribesHandler,
];
let EmailModule = class EmailModule {
};
exports.EmailModule = EmailModule;
exports.EmailModule = EmailModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule, tenant_config_module_1.TenantConfigModule],
        controllers: [
            email_controller_1.EmailController,
            email_account_controller_1.EmailAccountController,
            email_template_controller_1.EmailTemplateController,
            email_signature_controller_1.EmailSignatureController,
            email_campaign_controller_1.EmailCampaignController,
            email_tracking_controller_1.EmailTrackingController,
        ],
        providers: [
            gmail_service_1.GmailService,
            outlook_service_1.OutlookService,
            imap_smtp_service_1.ImapSmtpService,
            email_provider_factory_service_1.EmailProviderFactoryService,
            template_renderer_service_1.TemplateRendererService,
            tracking_service_1.TrackingService,
            email_sender_service_1.EmailSenderService,
            email_linker_service_1.EmailLinkerService,
            thread_builder_service_1.ThreadBuilderService,
            email_sync_service_1.EmailSyncService,
            campaign_executor_service_1.CampaignExecutorService,
            email_analytics_service_1.EmailAnalyticsService,
            ...CommandHandlers,
            ...QueryHandlers,
        ],
        exports: [
            email_sender_service_1.EmailSenderService,
            template_renderer_service_1.TemplateRendererService,
            email_analytics_service_1.EmailAnalyticsService,
        ],
    })
], EmailModule);
//# sourceMappingURL=email.module.js.map