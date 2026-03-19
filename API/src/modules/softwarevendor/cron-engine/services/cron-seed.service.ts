import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

const SEED_CRON_JOBS = [
  // ─── EMAIL ───
  { jobCode: 'EMAIL_SYNC', jobName: 'Email Sync', moduleName: 'email-integration', cronExpression: '*/5 * * * *', scope: 'TENANT', timeoutSeconds: 120, description: 'Sync emails from Gmail/Outlook/IMAP for all accounts', jobParams: { batchSize: 50, maxEmailsPerSync: 200 } },
  { jobCode: 'SCHEDULED_EMAILS', jobName: 'Send Scheduled Emails', moduleName: 'email-integration', cronExpression: '*/1 * * * *', scope: 'TENANT', timeoutSeconds: 60, description: 'Send emails scheduled for later delivery' },
  { jobCode: 'BROADCAST_EXECUTOR_EMAIL', jobName: 'Email Broadcast Executor', moduleName: 'email-integration', cronExpression: '*/5 * * * *', scope: 'TENANT', timeoutSeconds: 300, description: 'Process email campaign broadcast queues', jobParams: { throttlePerMinute: 30 } },

  // ─── WHATSAPP ───
  { jobCode: 'WHATSAPP_WEBHOOK_RETRY', jobName: 'WhatsApp Webhook Retry', moduleName: 'whatsapp-integration', cronExpression: '*/10 * * * *', scope: 'TENANT', timeoutSeconds: 60, description: 'Retry failed WhatsApp webhook deliveries' },
  { jobCode: 'BROADCAST_EXECUTOR_WA', jobName: 'WhatsApp Broadcast Executor', moduleName: 'whatsapp-integration', cronExpression: '*/5 * * * *', scope: 'TENANT', timeoutSeconds: 300, description: 'Process WhatsApp broadcast queues', jobParams: { throttlePerMinute: 30, batchSize: 10 } },

  // ─── MULTI-TENANT ───
  { jobCode: 'EXPIRE_TRIALS', jobName: 'Expire Trial Tenants', moduleName: 'multi-tenant', cronExpression: '0 0 * * *', scope: 'GLOBAL', timeoutSeconds: 120, description: 'Expire trial tenants past their trial end date' },
  { jobCode: 'EXPIRE_SUBSCRIPTIONS', jobName: 'Expire Subscriptions', moduleName: 'multi-tenant', cronExpression: '0 1 * * *', scope: 'GLOBAL', timeoutSeconds: 120, description: 'Expire ended subscriptions without auto-renew' },
  { jobCode: 'PROCESS_AUTO_RENEWALS', jobName: 'Process Auto-Renewals', moduleName: 'multi-tenant', cronExpression: '0 2 * * *', scope: 'GLOBAL', timeoutSeconds: 300, description: 'Attempt charge for auto-renew subscriptions due in 3 days' },
  { jobCode: 'RECALC_TENANT_USAGE', jobName: 'Recalculate Tenant Usage', moduleName: 'multi-tenant', cronExpression: '0 3 * * *', scope: 'GLOBAL', timeoutSeconds: 600, description: 'Count resources per tenant, update usage snapshot' },
  { jobCode: 'RESET_DAILY_COUNTERS', jobName: 'Reset Daily Counters', moduleName: 'multi-tenant', cronExpression: '0 0 * * *', scope: 'GLOBAL', timeoutSeconds: 60, description: 'Reset emailsSentToday, whatsAppSentToday to 0' },
  { jobCode: 'SEND_TRIAL_EXPIRY_EMAILS', jobName: 'Trial Expiry Reminders', moduleName: 'multi-tenant', cronExpression: '0 9 * * *', scope: 'GLOBAL', timeoutSeconds: 120, description: 'Send trial expiry reminders at -3d, -1d, 0d' },
  { jobCode: 'SUSPEND_OVERDUE_ACCOUNTS', jobName: 'Suspend Overdue Accounts', moduleName: 'multi-tenant', cronExpression: '0 4 * * *', scope: 'GLOBAL', timeoutSeconds: 120, description: 'Suspend accounts 15 days past due' },

  // ─── LEADS / CRM ───
  { jobCode: 'LEAD_AUTO_EXPIRE', jobName: 'Auto-Expire Stale Leads', moduleName: 'leads', cronExpression: '0 3 * * *', scope: 'TENANT', timeoutSeconds: 300, description: 'Auto-expire leads with no activity beyond configured days', jobParams: { expiryDays: 90, notifyBeforeDays: 7 } },
  { jobCode: 'RECALC_SALES_TARGETS', jobName: 'Recalculate Sales Targets', moduleName: 'mis-reports', cronExpression: '0 * * * *', scope: 'TENANT', timeoutSeconds: 120, description: 'Recalculate current achievement vs target' },
  { jobCode: 'QUOTATION_EXPIRY', jobName: 'Expire Quotations', moduleName: 'quotation', cronExpression: '0 4 * * *', scope: 'TENANT', timeoutSeconds: 120, description: 'Expire quotations past their validity date' },

  // ─── MIS REPORTS ───
  { jobCode: 'SCHEDULED_REPORTS', jobName: 'Process Scheduled Reports', moduleName: 'mis-reports', cronExpression: '*/15 * * * *', scope: 'TENANT', timeoutSeconds: 600, description: 'Generate and email scheduled reports' },
  { jobCode: 'DAILY_DIGEST', jobName: 'MIS Daily Digest', moduleName: 'mis-reports', cronExpression: '0 8 * * *', scope: 'TENANT', timeoutSeconds: 300, description: 'Auto-generate and email daily summary', jobParams: { sendTime: '08:00' } },

  // ─── WORKFLOW ───
  { jobCode: 'WORKFLOW_DELAYED_ACTIONS', jobName: 'Workflow Delayed Actions', moduleName: 'dynamic-workflow', cronExpression: '*/1 * * * *', scope: 'TENANT', timeoutSeconds: 60, description: 'Execute delayed workflow actions' },

  // ─── OFFLINE SYNC ───
  { jobCode: 'SYNC_DEVICE_HEALTH', jobName: 'Sync Device Health Check', moduleName: 'offline-sync', cronExpression: '0 * * * *', scope: 'GLOBAL', timeoutSeconds: 120, description: 'Mark devices with lastHeartbeat > 48h as INACTIVE' },
  { jobCode: 'AUTO_RESOLVE_CONFLICTS', jobName: 'Auto-Resolve Old Conflicts', moduleName: 'offline-sync', cronExpression: '0 6 * * *', scope: 'GLOBAL', timeoutSeconds: 300, description: 'Auto-resolve sync conflicts pending > 7 days' },
  { jobCode: 'EXPIRE_FLUSH_COMMANDS', jobName: 'Expire Stale Flush Commands', moduleName: 'offline-sync', cronExpression: '0 * * * *', scope: 'GLOBAL', timeoutSeconds: 60, description: 'Cancel pending flush commands older than 7 days' },

  // ─── CLEANUP ───
  { jobCode: 'NOTIFICATION_CLEANUP', jobName: 'Cleanup Old Notifications', moduleName: 'notifications', cronExpression: '0 5 * * 0', scope: 'GLOBAL', timeoutSeconds: 300, description: 'Delete read notifications older than 90 days', jobParams: { retentionDays: 90 } },
  { jobCode: 'AUDIT_LOG_CLEANUP', jobName: 'Archive Old Audit Logs', moduleName: 'audit-log', cronExpression: '0 5 1 * *', scope: 'GLOBAL', timeoutSeconds: 600, description: 'Archive audit logs older than configured days', jobParams: { retentionDays: 180 } },
  { jobCode: 'SYNC_CHANGELOG_CLEANUP', jobName: 'Clean Sync Change Logs', moduleName: 'offline-sync', cronExpression: '0 4 * * *', scope: 'GLOBAL', timeoutSeconds: 300, description: 'Delete pushed sync change logs older than 30 days', jobParams: { retentionDays: 30 } },
  { jobCode: 'EXPORT_FILE_CLEANUP', jobName: 'Clean Old Export Files', moduleName: 'mis-reports', cronExpression: '0 5 * * 0', scope: 'GLOBAL', timeoutSeconds: 120, description: 'Delete report export files older than 30 days', jobParams: { retentionDays: 30 } },

  // ─── CREDENTIAL MANAGEMENT ───
  { jobCode: 'TOKEN_REFRESH', jobName: 'Refresh OAuth Tokens', moduleName: 'tenant-config', cronExpression: '0 */6 * * *', scope: 'GLOBAL', timeoutSeconds: 300, description: 'Refresh expiring OAuth tokens (Gmail, Outlook, etc.)' },
  { jobCode: 'CREDENTIAL_HEALTH_CHECK', jobName: 'Credential Health Check', moduleName: 'tenant-config', cronExpression: '0 7 * * 1', scope: 'GLOBAL', timeoutSeconds: 600, description: 'Verify all active credentials weekly' },

  // ─── OWNERSHIP ───
  { jobCode: 'REVERT_DELEGATIONS', jobName: 'Auto-Revert Delegations', moduleName: 'ownership', cronExpression: '0 * * * *', scope: 'GLOBAL', timeoutSeconds: 120, description: 'Auto-revert expired ownership delegations' },
  { jobCode: 'ESCALATE_UNATTENDED', jobName: 'Escalate Unattended', moduleName: 'ownership', cronExpression: '0 */2 * * *', scope: 'GLOBAL', timeoutSeconds: 120, description: 'Escalate unattended entities based on rules' },
  { jobCode: 'EXPIRE_OWNERSHIP', jobName: 'Expire Time-Limited Ownership', moduleName: 'ownership', cronExpression: '0 0 * * *', scope: 'GLOBAL', timeoutSeconds: 120, description: 'Expire time-limited ownership entries' },
  { jobCode: 'RECALC_CAPACITY', jobName: 'Recalculate User Capacity', moduleName: 'ownership', cronExpression: '0 3 * * *', scope: 'GLOBAL', timeoutSeconds: 120, description: 'Recalculate all user capacity counts' },

  // ─── MISC ───
  { jobCode: 'PROCESS_REMINDERS', jobName: 'Process Due Reminders', moduleName: 'reminders', cronExpression: '*/1 * * * *', scope: 'GLOBAL', timeoutSeconds: 60, description: 'Process and trigger due reminders' },
  { jobCode: 'CHECK_OVERDUE_FOLLOWUPS', jobName: 'Check Overdue Follow-Ups', moduleName: 'follow-ups', cronExpression: '0 * * * *', scope: 'GLOBAL', timeoutSeconds: 60, description: 'Mark overdue follow-ups' },
  { jobCode: 'GENERATE_RECURRENCES', jobName: 'Generate Recurrences', moduleName: 'recurrence', cronExpression: '0 0 * * *', scope: 'GLOBAL', timeoutSeconds: 120, description: 'Generate upcoming recurring event occurrences' },
  { jobCode: 'CHECK_SLA_BREACHES', jobName: 'Check SLA Breaches', moduleName: 'workflow', cronExpression: '*/10 * * * *', scope: 'GLOBAL', timeoutSeconds: 120, description: 'Check and alert on SLA breaches' },
  { jobCode: 'DIGEST_HOURLY', jobName: 'Hourly Notification Digest', moduleName: 'notifications', cronExpression: '0 * * * *', scope: 'GLOBAL', timeoutSeconds: 120, description: 'Process hourly notification digests' },
  { jobCode: 'DIGEST_DAILY', jobName: 'Daily Notification Digest', moduleName: 'notifications', cronExpression: '0 9 * * *', scope: 'GLOBAL', timeoutSeconds: 120, description: 'Process daily notification digests' },
  { jobCode: 'DIGEST_WEEKLY', jobName: 'Weekly Notification Digest', moduleName: 'notifications', cronExpression: '0 9 * * 1', scope: 'GLOBAL', timeoutSeconds: 120, description: 'Process weekly notification digests' },
  { jobCode: 'REGROUP_NOTIFICATIONS', jobName: 'Regroup Notifications', moduleName: 'notifications', cronExpression: '*/30 * * * *', scope: 'GLOBAL', timeoutSeconds: 60, description: 'Regroup ungrouped notifications' },
  { jobCode: 'CLEANUP_PUSH_SUBSCRIPTIONS', jobName: 'Cleanup Push Subscriptions', moduleName: 'notifications', cronExpression: '0 3 * * 0', scope: 'GLOBAL', timeoutSeconds: 120, description: 'Remove inactive push subscriptions' },

  // ─── BACKUP ───
  { jobCode: 'BACKUP_DB', jobName: 'Database Backup', moduleName: 'system', cronExpression: '0 2 * * *', scope: 'GLOBAL', timeoutSeconds: 1800, description: 'Daily database backup', status: 'PAUSED', jobParams: { backupPath: '/backups', compress: true } },
] as const;

/** Seeds all cron job configs on first run. */
@Injectable()
export class CronSeedService implements OnModuleInit {
  private readonly logger = new Logger(CronSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  /** Upsert all seed cron job configurations. */
  async seed(): Promise<void> {
    let created = 0;
    for (const job of SEED_CRON_JOBS) {
      const existing = await this.prisma.cronJobConfig.findUnique({
        where: { jobCode: job.jobCode },
      });
      if (existing) continue;

      await this.prisma.cronJobConfig.create({
        data: {
          jobCode: job.jobCode,
          jobName: job.jobName,
          moduleName: job.moduleName,
          cronExpression: job.cronExpression,
          scope: job.scope as any,
          timeoutSeconds: job.timeoutSeconds,
          description: job.description,
          jobParams: 'jobParams' in job ? (job as any).jobParams : undefined,
          status: ('status' in job ? job.status : 'ACTIVE') as any,
        },
      });
      created++;
    }
    if (created > 0) this.logger.log(`Seeded ${created} cron job configs`);
  }
}
