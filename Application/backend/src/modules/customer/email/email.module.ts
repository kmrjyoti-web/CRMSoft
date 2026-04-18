import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TenantConfigModule } from '../../softwarevendor/tenant-config/tenant-config.module';

// Services
import { GmailService } from './services/gmail.service';
import { OutlookService } from './services/outlook.service';
import { ImapSmtpService } from './services/imap-smtp.service';
import { EmailProviderFactoryService } from './services/email-provider-factory.service';
import { TemplateRendererService } from './services/template-renderer.service';
import { TrackingService } from './services/tracking.service';
import { EmailSenderService } from './services/email-sender.service';
import { EmailLinkerService } from './services/email-linker.service';
import { ThreadBuilderService } from './services/thread-builder.service';
import { EmailSyncService } from './services/email-sync.service';
import { CampaignExecutorService } from './services/campaign-executor.service';
import { EmailAnalyticsService } from './services/email-analytics.service';

// Command Handlers
import { ConnectAccountHandler } from './application/commands/connect-account/connect-account.handler';
import { DisconnectAccountHandler } from './application/commands/disconnect-account/disconnect-account.handler';
import { ComposeEmailHandler } from './application/commands/compose-email/compose-email.handler';
import { ReplyEmailHandler } from './application/commands/reply-email/reply-email.handler';
import { SendEmailHandler } from './application/commands/send-email/send-email.handler';
import { ScheduleEmailHandler } from './application/commands/schedule-email/schedule-email.handler';
import { CancelScheduledEmailHandler } from './application/commands/cancel-scheduled-email/cancel-scheduled-email.handler';
import { StarEmailHandler } from './application/commands/star-email/star-email.handler';
import { MarkReadHandler } from './application/commands/mark-read/mark-read.handler';
import { LinkEmailToEntityHandler } from './application/commands/link-email-to-entity/link-email-to-entity.handler';
import { UnlinkEmailFromEntityHandler } from './application/commands/unlink-email-from-entity/unlink-email-from-entity.handler';
import { SyncInboxHandler } from './application/commands/sync-inbox/sync-inbox.handler';
import { CreateTemplateHandler } from './application/commands/create-template/create-template.handler';
import { UpdateTemplateHandler } from './application/commands/update-template/update-template.handler';
import { DeleteTemplateHandler } from './application/commands/delete-template/delete-template.handler';
import { CreateSignatureHandler } from './application/commands/create-signature/create-signature.handler';
import { UpdateSignatureHandler } from './application/commands/update-signature/update-signature.handler';
import { DeleteSignatureHandler } from './application/commands/delete-signature/delete-signature.handler';
import { CreateCampaignHandler } from './application/commands/create-campaign/create-campaign.handler';
import { UpdateCampaignHandler } from './application/commands/update-campaign/update-campaign.handler';
import { AddCampaignRecipientsHandler } from './application/commands/add-campaign-recipients/add-campaign-recipients.handler';
import { StartCampaignHandler } from './application/commands/start-campaign/start-campaign.handler';
import { PauseCampaignHandler } from './application/commands/pause-campaign/pause-campaign.handler';
import { CancelCampaignHandler } from './application/commands/cancel-campaign/cancel-campaign.handler';
import { ProcessTrackingEventHandler } from './application/commands/process-tracking-event/process-tracking-event.handler';

// Query Handlers
import { GetEmailHandler } from './application/queries/get-email/handler';
import { GetEmailsHandler } from './application/queries/get-emails/handler';
import { GetEmailThreadHandler } from './application/queries/get-email-thread/handler';
import { GetEntityEmailsHandler } from './application/queries/get-entity-emails/handler';
import { SearchEmailsHandler } from './application/queries/search-emails/handler';
import { GetAccountsHandler } from './application/queries/get-accounts/handler';
import { GetAccountDetailHandler } from './application/queries/get-account-detail/handler';
import { GetTemplatesHandler } from './application/queries/get-templates/handler';
import { GetTemplateDetailHandler } from './application/queries/get-template-detail/handler';
import { PreviewTemplateHandler } from './application/queries/preview-template/handler';
import { GetSignaturesHandler } from './application/queries/get-signatures/handler';
import { GetCampaignsHandler } from './application/queries/get-campaigns/handler';
import { GetCampaignDetailHandler } from './application/queries/get-campaign-detail/handler';
import { GetCampaignStatsHandler } from './application/queries/get-campaign-stats/handler';
import { GetCampaignRecipientsHandler } from './application/queries/get-campaign-recipients/handler';
import { GetEmailAnalyticsHandler } from './application/queries/get-email-analytics/handler';
import { GetUnsubscribesHandler } from './application/queries/get-unsubscribes/handler';

// Controllers
import { EmailController } from './presentation/email.controller';
import { EmailAccountController } from './presentation/email-account.controller';
import { EmailTemplateController } from './presentation/email-template.controller';
import { EmailSignatureController } from './presentation/email-signature.controller';
import { EmailCampaignController } from './presentation/email-campaign.controller';
import { EmailTrackingController } from './presentation/email-tracking.controller';

const CommandHandlers = [
  ConnectAccountHandler,
  DisconnectAccountHandler,
  ComposeEmailHandler,
  ReplyEmailHandler,
  SendEmailHandler,
  ScheduleEmailHandler,
  CancelScheduledEmailHandler,
  StarEmailHandler,
  MarkReadHandler,
  LinkEmailToEntityHandler,
  UnlinkEmailFromEntityHandler,
  SyncInboxHandler,
  CreateTemplateHandler,
  UpdateTemplateHandler,
  DeleteTemplateHandler,
  CreateSignatureHandler,
  UpdateSignatureHandler,
  DeleteSignatureHandler,
  CreateCampaignHandler,
  UpdateCampaignHandler,
  AddCampaignRecipientsHandler,
  StartCampaignHandler,
  PauseCampaignHandler,
  CancelCampaignHandler,
  ProcessTrackingEventHandler,
];

const QueryHandlers = [
  GetEmailHandler,
  GetEmailsHandler,
  GetEmailThreadHandler,
  GetEntityEmailsHandler,
  SearchEmailsHandler,
  GetAccountsHandler,
  GetAccountDetailHandler,
  GetTemplatesHandler,
  GetTemplateDetailHandler,
  PreviewTemplateHandler,
  GetSignaturesHandler,
  GetCampaignsHandler,
  GetCampaignDetailHandler,
  GetCampaignStatsHandler,
  GetCampaignRecipientsHandler,
  GetEmailAnalyticsHandler,
  GetUnsubscribesHandler,
];

@Module({
  imports: [CqrsModule, TenantConfigModule],
  controllers: [
    EmailController,
    EmailAccountController,
    EmailTemplateController,
    EmailSignatureController,
    EmailCampaignController,
    EmailTrackingController,
  ],
  providers: [
    // Services
    GmailService,
    OutlookService,
    ImapSmtpService,
    EmailProviderFactoryService,
    TemplateRendererService,
    TrackingService,
    EmailSenderService,
    EmailLinkerService,
    ThreadBuilderService,
    EmailSyncService,
    CampaignExecutorService,
    EmailAnalyticsService,
    // CQRS
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    EmailSenderService,
    TemplateRendererService,
    EmailAnalyticsService,
  ],
})
export class EmailModule {}
