"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronEngineModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../core/prisma/prisma.module");
const notifications_module_1 = require("../../core/work/notifications/notifications.module");
const calendar_module_1 = require("../../customer/calendar/calendar.module");
const job_registry_service_1 = require("./services/job-registry.service");
const cron_parser_service_1 = require("./services/cron-parser.service");
const job_runner_service_1 = require("./services/job-runner.service");
const master_scheduler_service_1 = require("./services/master-scheduler.service");
const cron_alert_service_1 = require("./services/cron-alert.service");
const cron_analytics_service_1 = require("./services/cron-analytics.service");
const cron_seed_service_1 = require("./services/cron-seed.service");
const cron_admin_controller_1 = require("./presentation/cron-admin.controller");
const sync_handlers_1 = require("./handlers/sync-handlers");
const ownership_handlers_1 = require("./handlers/ownership-handlers");
const notification_handlers_1 = require("./handlers/notification-handlers");
const crm_handlers_1 = require("./handlers/crm-handlers");
const system_handlers_1 = require("./handlers/system-handlers");
const placeholder_handlers_1 = require("./handlers/placeholder-handlers");
const task_handlers_1 = require("./handlers/task-handlers");
const calendar_handlers_1 = require("./handlers/calendar-handlers");
const ALL_HANDLERS = [
    sync_handlers_1.ExpireFlushCommandsHandler, sync_handlers_1.SyncChangelogCleanupHandler,
    sync_handlers_1.SyncDeviceHealthHandler, sync_handlers_1.AutoResolveConflictsHandler,
    ownership_handlers_1.RevertDelegationsHandler, ownership_handlers_1.EscalateUnattendedHandler,
    ownership_handlers_1.ExpireOwnershipHandler, ownership_handlers_1.RecalcCapacityHandler,
    notification_handlers_1.NotificationCleanupHandler, notification_handlers_1.DigestHourlyHandler,
    notification_handlers_1.DigestDailyHandler, notification_handlers_1.DigestWeeklyHandler,
    notification_handlers_1.RegroupNotificationsHandler, notification_handlers_1.CleanupPushSubscriptionsHandler,
    crm_handlers_1.LeadAutoExpireHandler, crm_handlers_1.QuotationExpiryHandler,
    crm_handlers_1.RecalcSalesTargetsHandler, crm_handlers_1.ProcessRemindersHandler,
    crm_handlers_1.CheckOverdueFollowUpsHandler, crm_handlers_1.GenerateRecurrencesHandler,
    crm_handlers_1.CheckSlaBreachesHandler,
    system_handlers_1.TokenRefreshHandler, system_handlers_1.CredentialHealthCheckHandler,
    system_handlers_1.AuditLogCleanupHandler, system_handlers_1.ResetDailyCountersHandler,
    system_handlers_1.ExportFileCleanupHandler, system_handlers_1.BackupDbHandler,
    placeholder_handlers_1.EmailSyncHandler, placeholder_handlers_1.ScheduledEmailsHandler,
    placeholder_handlers_1.BroadcastExecutorEmailHandler, placeholder_handlers_1.WhatsappWebhookRetryHandler,
    placeholder_handlers_1.BroadcastExecutorWaHandler, placeholder_handlers_1.ExpireTrialsHandler,
    placeholder_handlers_1.ExpireSubscriptionsHandler, placeholder_handlers_1.ProcessAutoRenewalsHandler,
    placeholder_handlers_1.RecalcTenantUsageHandler, placeholder_handlers_1.SendTrialExpiryEmailsHandler,
    placeholder_handlers_1.SuspendOverdueAccountsHandler, placeholder_handlers_1.ScheduledReportsHandler,
    placeholder_handlers_1.DailyDigestHandler, placeholder_handlers_1.WorkflowDelayedActionsHandler,
    task_handlers_1.CheckOverdueTasksHandler, task_handlers_1.CheckTaskEscalationsHandler,
    task_handlers_1.ProcessTaskRecurrenceHandler, task_handlers_1.CheckMissedRemindersHandler,
    calendar_handlers_1.ProcessEventRemindersHandler, calendar_handlers_1.SyncExternalCalendarsHandler,
    calendar_handlers_1.RenewCalendarWebhooksHandler, calendar_handlers_1.AutoCompletePastEventsHandler,
    calendar_handlers_1.GenerateRecurringEventsHandler,
];
let CronEngineModule = class CronEngineModule {
    constructor(registry, expireFlush, syncChangelog, syncDevice, autoResolve, revertDelegations, escalateUnattended, expireOwnership, recalcCapacity, notifCleanup, digestHourly, digestDaily, digestWeekly, regroupNotif, cleanupPush, leadExpire, quotExpiry, recalcTargets, reminders, overdueFollowUps, recurrences, slaBreach, tokenRefresh, credHealth, auditCleanup, resetCounters, exportCleanup, backupDb, emailSync, scheduledEmails, broadcastEmail, waWebhook, broadcastWa, expireTrials, expireSubs, autoRenew, recalcUsage, trialExpiry, suspendOverdue, schedReports, dailyDigest, workflowActions, overdueTasks, taskEscalations, taskRecurrence, missedReminders, eventReminders, syncCalendars, renewWebhooks, autoComplete, genRecurring) {
        this.registry = registry;
        this.expireFlush = expireFlush;
        this.syncChangelog = syncChangelog;
        this.syncDevice = syncDevice;
        this.autoResolve = autoResolve;
        this.revertDelegations = revertDelegations;
        this.escalateUnattended = escalateUnattended;
        this.expireOwnership = expireOwnership;
        this.recalcCapacity = recalcCapacity;
        this.notifCleanup = notifCleanup;
        this.digestHourly = digestHourly;
        this.digestDaily = digestDaily;
        this.digestWeekly = digestWeekly;
        this.regroupNotif = regroupNotif;
        this.cleanupPush = cleanupPush;
        this.leadExpire = leadExpire;
        this.quotExpiry = quotExpiry;
        this.recalcTargets = recalcTargets;
        this.reminders = reminders;
        this.overdueFollowUps = overdueFollowUps;
        this.recurrences = recurrences;
        this.slaBreach = slaBreach;
        this.tokenRefresh = tokenRefresh;
        this.credHealth = credHealth;
        this.auditCleanup = auditCleanup;
        this.resetCounters = resetCounters;
        this.exportCleanup = exportCleanup;
        this.backupDb = backupDb;
        this.emailSync = emailSync;
        this.scheduledEmails = scheduledEmails;
        this.broadcastEmail = broadcastEmail;
        this.waWebhook = waWebhook;
        this.broadcastWa = broadcastWa;
        this.expireTrials = expireTrials;
        this.expireSubs = expireSubs;
        this.autoRenew = autoRenew;
        this.recalcUsage = recalcUsage;
        this.trialExpiry = trialExpiry;
        this.suspendOverdue = suspendOverdue;
        this.schedReports = schedReports;
        this.dailyDigest = dailyDigest;
        this.workflowActions = workflowActions;
        this.overdueTasks = overdueTasks;
        this.taskEscalations = taskEscalations;
        this.taskRecurrence = taskRecurrence;
        this.missedReminders = missedReminders;
        this.eventReminders = eventReminders;
        this.syncCalendars = syncCalendars;
        this.renewWebhooks = renewWebhooks;
        this.autoComplete = autoComplete;
        this.genRecurring = genRecurring;
    }
    onModuleInit() {
        const handlers = [
            this.expireFlush, this.syncChangelog, this.syncDevice, this.autoResolve,
            this.revertDelegations, this.escalateUnattended, this.expireOwnership, this.recalcCapacity,
            this.notifCleanup, this.digestHourly, this.digestDaily, this.digestWeekly,
            this.regroupNotif, this.cleanupPush,
            this.leadExpire, this.quotExpiry, this.recalcTargets, this.reminders,
            this.overdueFollowUps, this.recurrences, this.slaBreach,
            this.tokenRefresh, this.credHealth, this.auditCleanup, this.resetCounters,
            this.exportCleanup, this.backupDb,
            this.emailSync, this.scheduledEmails, this.broadcastEmail,
            this.waWebhook, this.broadcastWa,
            this.expireTrials, this.expireSubs, this.autoRenew,
            this.recalcUsage, this.trialExpiry, this.suspendOverdue,
            this.schedReports, this.dailyDigest, this.workflowActions,
            this.overdueTasks, this.taskEscalations, this.taskRecurrence, this.missedReminders,
            this.eventReminders, this.syncCalendars, this.renewWebhooks,
            this.autoComplete, this.genRecurring,
        ];
        for (const h of handlers) {
            this.registry.register(h);
        }
    }
};
exports.CronEngineModule = CronEngineModule;
exports.CronEngineModule = CronEngineModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, notifications_module_1.NotificationsModule, calendar_module_1.CalendarModule],
        controllers: [cron_admin_controller_1.CronAdminController],
        providers: [
            job_registry_service_1.JobRegistryService,
            cron_parser_service_1.CronParserService,
            job_runner_service_1.JobRunnerService,
            master_scheduler_service_1.MasterSchedulerService,
            cron_alert_service_1.CronAlertService,
            cron_analytics_service_1.CronAnalyticsService,
            cron_seed_service_1.CronSeedService,
            ...ALL_HANDLERS,
        ],
        exports: [
            job_registry_service_1.JobRegistryService,
            master_scheduler_service_1.MasterSchedulerService,
            job_runner_service_1.JobRunnerService,
        ],
    }),
    __metadata("design:paramtypes", [job_registry_service_1.JobRegistryService,
        sync_handlers_1.ExpireFlushCommandsHandler,
        sync_handlers_1.SyncChangelogCleanupHandler,
        sync_handlers_1.SyncDeviceHealthHandler,
        sync_handlers_1.AutoResolveConflictsHandler,
        ownership_handlers_1.RevertDelegationsHandler,
        ownership_handlers_1.EscalateUnattendedHandler,
        ownership_handlers_1.ExpireOwnershipHandler,
        ownership_handlers_1.RecalcCapacityHandler,
        notification_handlers_1.NotificationCleanupHandler,
        notification_handlers_1.DigestHourlyHandler,
        notification_handlers_1.DigestDailyHandler,
        notification_handlers_1.DigestWeeklyHandler,
        notification_handlers_1.RegroupNotificationsHandler,
        notification_handlers_1.CleanupPushSubscriptionsHandler,
        crm_handlers_1.LeadAutoExpireHandler,
        crm_handlers_1.QuotationExpiryHandler,
        crm_handlers_1.RecalcSalesTargetsHandler,
        crm_handlers_1.ProcessRemindersHandler,
        crm_handlers_1.CheckOverdueFollowUpsHandler,
        crm_handlers_1.GenerateRecurrencesHandler,
        crm_handlers_1.CheckSlaBreachesHandler,
        system_handlers_1.TokenRefreshHandler,
        system_handlers_1.CredentialHealthCheckHandler,
        system_handlers_1.AuditLogCleanupHandler,
        system_handlers_1.ResetDailyCountersHandler,
        system_handlers_1.ExportFileCleanupHandler,
        system_handlers_1.BackupDbHandler,
        placeholder_handlers_1.EmailSyncHandler,
        placeholder_handlers_1.ScheduledEmailsHandler,
        placeholder_handlers_1.BroadcastExecutorEmailHandler,
        placeholder_handlers_1.WhatsappWebhookRetryHandler,
        placeholder_handlers_1.BroadcastExecutorWaHandler,
        placeholder_handlers_1.ExpireTrialsHandler,
        placeholder_handlers_1.ExpireSubscriptionsHandler,
        placeholder_handlers_1.ProcessAutoRenewalsHandler,
        placeholder_handlers_1.RecalcTenantUsageHandler,
        placeholder_handlers_1.SendTrialExpiryEmailsHandler,
        placeholder_handlers_1.SuspendOverdueAccountsHandler,
        placeholder_handlers_1.ScheduledReportsHandler,
        placeholder_handlers_1.DailyDigestHandler,
        placeholder_handlers_1.WorkflowDelayedActionsHandler,
        task_handlers_1.CheckOverdueTasksHandler,
        task_handlers_1.CheckTaskEscalationsHandler,
        task_handlers_1.ProcessTaskRecurrenceHandler,
        task_handlers_1.CheckMissedRemindersHandler,
        calendar_handlers_1.ProcessEventRemindersHandler,
        calendar_handlers_1.SyncExternalCalendarsHandler,
        calendar_handlers_1.RenewCalendarWebhooksHandler,
        calendar_handlers_1.AutoCompletePastEventsHandler,
        calendar_handlers_1.GenerateRecurringEventsHandler])
], CronEngineModule);
//# sourceMappingURL=cron-engine.module.js.map