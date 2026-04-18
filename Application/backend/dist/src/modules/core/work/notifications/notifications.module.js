"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const notification_core_service_1 = require("./services/notification-core.service");
const template_service_1 = require("./services/template.service");
const channel_router_service_1 = require("./services/channel-router.service");
const realtime_service_1 = require("./services/realtime.service");
const digest_service_1 = require("./services/digest.service");
const cleanup_service_1 = require("./services/cleanup.service");
const preference_service_1 = require("./services/preference.service");
const notification_config_service_1 = require("./services/notification-config.service");
const escalation_service_1 = require("./services/escalation.service");
const quiet_hour_service_1 = require("./services/quiet-hour.service");
const notification_dispatch_service_1 = require("./services/notification-dispatch.service");
const notification_analytics_service_1 = require("./services/notification-analytics.service");
const email_adapter_1 = require("./services/adapters/email.adapter");
const sms_adapter_1 = require("./services/adapters/sms.adapter");
const whatsapp_adapter_1 = require("./services/adapters/whatsapp.adapter");
const push_adapter_1 = require("./services/adapters/push.adapter");
const call_adapter_1 = require("./services/adapters/call.adapter");
const notification_gateway_1 = require("./gateway/notification.gateway");
const sse_controller_1 = require("./gateway/sse.controller");
const notification_controller_1 = require("./presentation/notification.controller");
const notification_settings_controller_1 = require("./presentation/notification-settings.controller");
const notification_admin_controller_1 = require("./presentation/notification-admin.controller");
const send_notification_handler_1 = require("./application/commands/send-notification/send-notification.handler");
const mark_read_handler_1 = require("./application/commands/mark-read/mark-read.handler");
const mark_all_read_handler_1 = require("./application/commands/mark-all-read/mark-all-read.handler");
const dismiss_notification_handler_1 = require("./application/commands/dismiss-notification/dismiss-notification.handler");
const bulk_mark_read_handler_1 = require("./application/commands/bulk-mark-read/bulk-mark-read.handler");
const bulk_dismiss_handler_1 = require("./application/commands/bulk-dismiss/bulk-dismiss.handler");
const update_preferences_handler_1 = require("./application/commands/update-preferences/update-preferences.handler");
const register_push_handler_1 = require("./application/commands/register-push/register-push.handler");
const unregister_push_handler_1 = require("./application/commands/unregister-push/unregister-push.handler");
const create_template_handler_1 = require("./application/commands/create-template/create-template.handler");
const update_template_handler_1 = require("./application/commands/update-template/update-template.handler");
const get_notifications_handler_1 = require("./application/queries/get-notifications/get-notifications.handler");
const get_notification_by_id_handler_1 = require("./application/queries/get-notification-by-id/get-notification-by-id.handler");
const get_unread_count_handler_1 = require("./application/queries/get-unread-count/get-unread-count.handler");
const get_preferences_handler_1 = require("./application/queries/get-preferences/get-preferences.handler");
const get_templates_handler_1 = require("./application/queries/get-templates/get-templates.handler");
const get_notification_stats_handler_1 = require("./application/queries/get-notification-stats/get-notification-stats.handler");
const CommandHandlers = [
    send_notification_handler_1.SendNotificationHandler,
    mark_read_handler_1.MarkReadHandler,
    mark_all_read_handler_1.MarkAllReadHandler,
    dismiss_notification_handler_1.DismissNotificationHandler,
    bulk_mark_read_handler_1.BulkMarkReadHandler,
    bulk_dismiss_handler_1.BulkDismissHandler,
    update_preferences_handler_1.UpdatePreferencesHandler,
    register_push_handler_1.RegisterPushHandler,
    unregister_push_handler_1.UnregisterPushHandler,
    create_template_handler_1.CreateTemplateHandler,
    update_template_handler_1.UpdateTemplateHandler,
];
const QueryHandlers = [
    get_notifications_handler_1.GetNotificationsHandler,
    get_notification_by_id_handler_1.GetNotificationByIdHandler,
    get_unread_count_handler_1.GetUnreadCountHandler,
    get_preferences_handler_1.GetPreferencesHandler,
    get_templates_handler_1.GetTemplatesHandler,
    get_notification_stats_handler_1.GetNotificationStatsHandler,
];
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [notification_controller_1.NotificationController, notification_settings_controller_1.NotificationSettingsController, notification_admin_controller_1.NotificationAdminController, sse_controller_1.SseController],
        providers: [
            notification_core_service_1.NotificationCoreService,
            template_service_1.NotificationTemplateService,
            channel_router_service_1.ChannelRouterService,
            realtime_service_1.RealtimeService,
            digest_service_1.DigestService,
            cleanup_service_1.CleanupService,
            preference_service_1.PreferenceService,
            notification_config_service_1.NotificationConfigService,
            escalation_service_1.EscalationService,
            quiet_hour_service_1.QuietHourService,
            notification_dispatch_service_1.NotificationDispatchService,
            notification_analytics_service_1.NotificationAnalyticsService,
            email_adapter_1.EmailAdapter,
            sms_adapter_1.SmsAdapter,
            whatsapp_adapter_1.WhatsAppAdapter,
            push_adapter_1.PushAdapter,
            call_adapter_1.CallAdapter,
            notification_gateway_1.NotificationGateway,
            ...CommandHandlers,
            ...QueryHandlers,
        ],
        exports: [notification_core_service_1.NotificationCoreService, channel_router_service_1.ChannelRouterService, realtime_service_1.RealtimeService, template_service_1.NotificationTemplateService, notification_config_service_1.NotificationConfigService, escalation_service_1.EscalationService, quiet_hour_service_1.QuietHourService, notification_dispatch_service_1.NotificationDispatchService, notification_analytics_service_1.NotificationAnalyticsService],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map