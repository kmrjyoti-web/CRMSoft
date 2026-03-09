import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Services
import { NotificationCoreService } from './services/notification-core.service';
import { NotificationTemplateService } from './services/template.service';
import { ChannelRouterService } from './services/channel-router.service';
import { RealtimeService } from './services/realtime.service';
import { DigestService } from './services/digest.service';
import { CleanupService } from './services/cleanup.service';
import { PreferenceService } from './services/preference.service';
import { NotificationConfigService } from './services/notification-config.service';
import { EscalationService } from './services/escalation.service';
import { QuietHourService } from './services/quiet-hour.service';
import { NotificationDispatchService } from './services/notification-dispatch.service';
import { NotificationAnalyticsService } from './services/notification-analytics.service';

// Channel Adapters
import { EmailAdapter } from './services/adapters/email.adapter';
import { SmsAdapter } from './services/adapters/sms.adapter';
import { WhatsAppAdapter } from './services/adapters/whatsapp.adapter';
import { PushAdapter } from './services/adapters/push.adapter';
import { CallAdapter } from './services/adapters/call.adapter';

// Gateway
import { NotificationGateway } from './gateway/notification.gateway';
import { SseController } from './gateway/sse.controller';

// Controllers
import { NotificationController } from './presentation/notification.controller';
import { NotificationSettingsController } from './presentation/notification-settings.controller';
import { NotificationAdminController } from './presentation/notification-admin.controller';

// Command Handlers
import { SendNotificationHandler } from './application/commands/send-notification/send-notification.handler';
import { MarkReadHandler } from './application/commands/mark-read/mark-read.handler';
import { MarkAllReadHandler } from './application/commands/mark-all-read/mark-all-read.handler';
import { DismissNotificationHandler } from './application/commands/dismiss-notification/dismiss-notification.handler';
import { BulkMarkReadHandler } from './application/commands/bulk-mark-read/bulk-mark-read.handler';
import { BulkDismissHandler } from './application/commands/bulk-dismiss/bulk-dismiss.handler';
import { UpdatePreferencesHandler } from './application/commands/update-preferences/update-preferences.handler';
import { RegisterPushHandler } from './application/commands/register-push/register-push.handler';
import { UnregisterPushHandler } from './application/commands/unregister-push/unregister-push.handler';
import { CreateTemplateHandler } from './application/commands/create-template/create-template.handler';
import { UpdateTemplateHandler } from './application/commands/update-template/update-template.handler';

// Query Handlers
import { GetNotificationsHandler } from './application/queries/get-notifications/get-notifications.handler';
import { GetNotificationByIdHandler } from './application/queries/get-notification-by-id/get-notification-by-id.handler';
import { GetUnreadCountHandler } from './application/queries/get-unread-count/get-unread-count.handler';
import { GetPreferencesHandler } from './application/queries/get-preferences/get-preferences.handler';
import { GetTemplatesHandler } from './application/queries/get-templates/get-templates.handler';
import { GetNotificationStatsHandler } from './application/queries/get-notification-stats/get-notification-stats.handler';

const CommandHandlers = [
  SendNotificationHandler,
  MarkReadHandler,
  MarkAllReadHandler,
  DismissNotificationHandler,
  BulkMarkReadHandler,
  BulkDismissHandler,
  UpdatePreferencesHandler,
  RegisterPushHandler,
  UnregisterPushHandler,
  CreateTemplateHandler,
  UpdateTemplateHandler,
];

const QueryHandlers = [
  GetNotificationsHandler,
  GetNotificationByIdHandler,
  GetUnreadCountHandler,
  GetPreferencesHandler,
  GetTemplatesHandler,
  GetNotificationStatsHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [NotificationController, NotificationSettingsController, NotificationAdminController, SseController],
  providers: [
    NotificationCoreService,
    NotificationTemplateService,
    ChannelRouterService,
    RealtimeService,
    DigestService,
    CleanupService,
    PreferenceService,
    NotificationConfigService,
    EscalationService,
    QuietHourService,
    NotificationDispatchService,
    NotificationAnalyticsService,
    EmailAdapter,
    SmsAdapter,
    WhatsAppAdapter,
    PushAdapter,
    CallAdapter,
    NotificationGateway,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [NotificationCoreService, ChannelRouterService, RealtimeService, NotificationTemplateService, NotificationConfigService, EscalationService, QuietHourService, NotificationDispatchService, NotificationAnalyticsService],
})
export class NotificationsModule {}
