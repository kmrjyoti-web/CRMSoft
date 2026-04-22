import { Module, OnModuleInit } from '@nestjs/common';
import { PrismaModule } from '../../../core/prisma/prisma.module';
import { NotificationsModule } from '../../core/work/notifications/notifications.module';
import { CalendarModule } from '../../customer/calendar/calendar.module';

// ─── SERVICES ───
import { JobRegistryService } from './services/job-registry.service';
import { CronParserService } from './services/cron-parser.service';
import { JobRunnerService } from './services/job-runner.service';
import { MasterSchedulerService } from './services/master-scheduler.service';
import { CronAlertService } from './services/cron-alert.service';
import { CronAnalyticsService } from './services/cron-analytics.service';
import { CronSeedService } from './services/cron-seed.service';

// ─── CONTROLLER ───
import { CronAdminController } from './presentation/cron-admin.controller';

// ─── HANDLERS: SYNC ───
import {
  ExpireFlushCommandsHandler,
  SyncChangelogCleanupHandler,
  SyncDeviceHealthHandler,
  AutoResolveConflictsHandler,
} from './handlers/sync-handlers';

// ─── HANDLERS: OWNERSHIP ───
import {
  RevertDelegationsHandler,
  EscalateUnattendedHandler,
  ExpireOwnershipHandler,
  RecalcCapacityHandler,
} from './handlers/ownership-handlers';

// ─── HANDLERS: NOTIFICATIONS ───
import {
  NotificationCleanupHandler,
  DigestHourlyHandler,
  DigestDailyHandler,
  DigestWeeklyHandler,
  RegroupNotificationsHandler,
  CleanupPushSubscriptionsHandler,
} from './handlers/notification-handlers';

// ─── HANDLERS: CRM ───
import {
  LeadAutoExpireHandler,
  QuotationExpiryHandler,
  RecalcSalesTargetsHandler,
  ProcessRemindersHandler,
  CheckOverdueFollowUpsHandler,
  GenerateRecurrencesHandler,
  CheckSlaBreachesHandler,
} from './handlers/crm-handlers';

// ─── HANDLERS: SYSTEM ───
import {
  TokenRefreshHandler,
  CredentialHealthCheckHandler,
  AuditLogCleanupHandler,
  ResetDailyCountersHandler,
  ExportFileCleanupHandler,
  BackupDbHandler,
} from './handlers/system-handlers';

// ─── HANDLERS: PLACEHOLDER ───
import {
  EmailSyncHandler,
  ScheduledEmailsHandler,
  BroadcastExecutorEmailHandler,
  WhatsappWebhookRetryHandler,
  BroadcastExecutorWaHandler,
  ExpireTrialsHandler,
  ExpireSubscriptionsHandler,
  ProcessAutoRenewalsHandler,
  RecalcTenantUsageHandler,
  SendTrialExpiryEmailsHandler,
  SuspendOverdueAccountsHandler,
  ScheduledReportsHandler,
  DailyDigestHandler,
  WorkflowDelayedActionsHandler,
} from './handlers/placeholder-handlers';

// ─── HANDLERS: TASK ENGINE ───
import {
  CheckOverdueTasksHandler,
  CheckTaskEscalationsHandler,
  ProcessTaskRecurrenceHandler,
  CheckMissedRemindersHandler,
} from './handlers/task-handlers';

// ─── HANDLERS: CALENDAR ENGINE ───
import {
  ProcessEventRemindersHandler,
  SyncExternalCalendarsHandler,
  RenewCalendarWebhooksHandler,
  AutoCompletePastEventsHandler,
  GenerateRecurringEventsHandler,
} from './handlers/calendar-handlers';

const ALL_HANDLERS = [
  // Sync
  ExpireFlushCommandsHandler, SyncChangelogCleanupHandler,
  SyncDeviceHealthHandler, AutoResolveConflictsHandler,
  // Ownership
  RevertDelegationsHandler, EscalateUnattendedHandler,
  ExpireOwnershipHandler, RecalcCapacityHandler,
  // Notifications
  NotificationCleanupHandler, DigestHourlyHandler,
  DigestDailyHandler, DigestWeeklyHandler,
  RegroupNotificationsHandler, CleanupPushSubscriptionsHandler,
  // CRM
  LeadAutoExpireHandler, QuotationExpiryHandler,
  RecalcSalesTargetsHandler, ProcessRemindersHandler,
  CheckOverdueFollowUpsHandler, GenerateRecurrencesHandler,
  CheckSlaBreachesHandler,
  // System
  TokenRefreshHandler, CredentialHealthCheckHandler,
  AuditLogCleanupHandler, ResetDailyCountersHandler,
  ExportFileCleanupHandler, BackupDbHandler,
  // Placeholders
  EmailSyncHandler, ScheduledEmailsHandler,
  BroadcastExecutorEmailHandler, WhatsappWebhookRetryHandler,
  BroadcastExecutorWaHandler, ExpireTrialsHandler,
  ExpireSubscriptionsHandler, ProcessAutoRenewalsHandler,
  RecalcTenantUsageHandler, SendTrialExpiryEmailsHandler,
  SuspendOverdueAccountsHandler, ScheduledReportsHandler,
  DailyDigestHandler, WorkflowDelayedActionsHandler,
  // Task Engine
  CheckOverdueTasksHandler, CheckTaskEscalationsHandler,
  ProcessTaskRecurrenceHandler, CheckMissedRemindersHandler,
  // Calendar Engine
  ProcessEventRemindersHandler, SyncExternalCalendarsHandler,
  RenewCalendarWebhooksHandler, AutoCompletePastEventsHandler,
  GenerateRecurringEventsHandler,
];

@Module({
  imports: [PrismaModule, NotificationsModule, CalendarModule],
  controllers: [CronAdminController],
  providers: [
    JobRegistryService,
    CronParserService,
    JobRunnerService,
    MasterSchedulerService,
    CronAlertService,
    CronAnalyticsService,
    CronSeedService,
    ...ALL_HANDLERS,
  ],
  exports: [
    JobRegistryService,
    MasterSchedulerService,
    JobRunnerService,
  ],
})
export class CronEngineModule implements OnModuleInit {
  constructor(
    private readonly registry: JobRegistryService,
    private readonly expireFlush: ExpireFlushCommandsHandler,
    private readonly syncChangelog: SyncChangelogCleanupHandler,
    private readonly syncDevice: SyncDeviceHealthHandler,
    private readonly autoResolve: AutoResolveConflictsHandler,
    private readonly revertDelegations: RevertDelegationsHandler,
    private readonly escalateUnattended: EscalateUnattendedHandler,
    private readonly expireOwnership: ExpireOwnershipHandler,
    private readonly recalcCapacity: RecalcCapacityHandler,
    private readonly notifCleanup: NotificationCleanupHandler,
    private readonly digestHourly: DigestHourlyHandler,
    private readonly digestDaily: DigestDailyHandler,
    private readonly digestWeekly: DigestWeeklyHandler,
    private readonly regroupNotif: RegroupNotificationsHandler,
    private readonly cleanupPush: CleanupPushSubscriptionsHandler,
    private readonly leadExpire: LeadAutoExpireHandler,
    private readonly quotExpiry: QuotationExpiryHandler,
    private readonly recalcTargets: RecalcSalesTargetsHandler,
    private readonly reminders: ProcessRemindersHandler,
    private readonly overdueFollowUps: CheckOverdueFollowUpsHandler,
    private readonly recurrences: GenerateRecurrencesHandler,
    private readonly slaBreach: CheckSlaBreachesHandler,
    private readonly tokenRefresh: TokenRefreshHandler,
    private readonly credHealth: CredentialHealthCheckHandler,
    private readonly auditCleanup: AuditLogCleanupHandler,
    private readonly resetCounters: ResetDailyCountersHandler,
    private readonly exportCleanup: ExportFileCleanupHandler,
    private readonly backupDb: BackupDbHandler,
    private readonly emailSync: EmailSyncHandler,
    private readonly scheduledEmails: ScheduledEmailsHandler,
    private readonly broadcastEmail: BroadcastExecutorEmailHandler,
    private readonly waWebhook: WhatsappWebhookRetryHandler,
    private readonly broadcastWa: BroadcastExecutorWaHandler,
    private readonly expireTrials: ExpireTrialsHandler,
    private readonly expireSubs: ExpireSubscriptionsHandler,
    private readonly autoRenew: ProcessAutoRenewalsHandler,
    private readonly recalcUsage: RecalcTenantUsageHandler,
    private readonly trialExpiry: SendTrialExpiryEmailsHandler,
    private readonly suspendOverdue: SuspendOverdueAccountsHandler,
    private readonly schedReports: ScheduledReportsHandler,
    private readonly dailyDigest: DailyDigestHandler,
    private readonly workflowActions: WorkflowDelayedActionsHandler,
    private readonly overdueTasks: CheckOverdueTasksHandler,
    private readonly taskEscalations: CheckTaskEscalationsHandler,
    private readonly taskRecurrence: ProcessTaskRecurrenceHandler,
    private readonly missedReminders: CheckMissedRemindersHandler,
    private readonly eventReminders: ProcessEventRemindersHandler,
    private readonly syncCalendars: SyncExternalCalendarsHandler,
    private readonly renewWebhooks: RenewCalendarWebhooksHandler,
    private readonly autoComplete: AutoCompletePastEventsHandler,
    private readonly genRecurring: GenerateRecurringEventsHandler,
  ) {}

  onModuleInit(): void {
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
}
