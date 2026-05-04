import { Injectable, Logger } from '@nestjs/common';
import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';

/**
 * Placeholder handlers for jobs whose parent modules
 * will provide full implementations later.
 * Each handler logs a message and returns a no-op result.
 */

@Injectable()
export class EmailSyncHandler implements ICronJobHandler {
  readonly jobCode = 'EMAIL_SYNC';
  private readonly logger = new Logger(EmailSyncHandler.name);
  async execute(params: Record<string, any>, ctx?: { tenantId?: string }): Promise<CronJobResult> {
    this.logger.log(`Email sync placeholder — tenant: ${ctx?.tenantId ?? 'all'}`);
    return { recordsProcessed: 0 };
  }
}

@Injectable()
export class ScheduledEmailsHandler implements ICronJobHandler {
  readonly jobCode = 'SCHEDULED_EMAILS';
  async execute(): Promise<CronJobResult> { return { recordsProcessed: 0 }; }
}

@Injectable()
export class BroadcastExecutorEmailHandler implements ICronJobHandler {
  readonly jobCode = 'BROADCAST_EXECUTOR_EMAIL';
  async execute(): Promise<CronJobResult> { return { recordsProcessed: 0 }; }
}

@Injectable()
export class WhatsappWebhookRetryHandler implements ICronJobHandler {
  readonly jobCode = 'WHATSAPP_WEBHOOK_RETRY';
  async execute(): Promise<CronJobResult> { return { recordsProcessed: 0 }; }
}

@Injectable()
export class BroadcastExecutorWaHandler implements ICronJobHandler {
  readonly jobCode = 'BROADCAST_EXECUTOR_WA';
  async execute(): Promise<CronJobResult> { return { recordsProcessed: 0 }; }
}

@Injectable()
export class ExpireTrialsHandler implements ICronJobHandler {
  readonly jobCode = 'EXPIRE_TRIALS';
  async execute(): Promise<CronJobResult> { return { recordsProcessed: 0 }; }
}

@Injectable()
export class ExpireSubscriptionsHandler implements ICronJobHandler {
  readonly jobCode = 'EXPIRE_SUBSCRIPTIONS';
  async execute(): Promise<CronJobResult> { return { recordsProcessed: 0 }; }
}

@Injectable()
export class ProcessAutoRenewalsHandler implements ICronJobHandler {
  readonly jobCode = 'PROCESS_AUTO_RENEWALS';
  async execute(): Promise<CronJobResult> { return { recordsProcessed: 0 }; }
}

@Injectable()
export class RecalcTenantUsageHandler implements ICronJobHandler {
  readonly jobCode = 'RECALC_TENANT_USAGE';
  async execute(): Promise<CronJobResult> { return { recordsProcessed: 0 }; }
}

@Injectable()
export class SendTrialExpiryEmailsHandler implements ICronJobHandler {
  readonly jobCode = 'SEND_TRIAL_EXPIRY_EMAILS';
  async execute(): Promise<CronJobResult> { return { recordsProcessed: 0 }; }
}

@Injectable()
export class SuspendOverdueAccountsHandler implements ICronJobHandler {
  readonly jobCode = 'SUSPEND_OVERDUE_ACCOUNTS';
  async execute(): Promise<CronJobResult> { return { recordsProcessed: 0 }; }
}

@Injectable()
export class ScheduledReportsHandler implements ICronJobHandler {
  readonly jobCode = 'SCHEDULED_REPORTS';
  async execute(): Promise<CronJobResult> { return { recordsProcessed: 0 }; }
}

@Injectable()
export class DailyDigestHandler implements ICronJobHandler {
  readonly jobCode = 'DAILY_DIGEST';
  async execute(): Promise<CronJobResult> { return { recordsProcessed: 0 }; }
}

@Injectable()
export class WorkflowDelayedActionsHandler implements ICronJobHandler {
  readonly jobCode = 'WORKFLOW_DELAYED_ACTIONS';
  async execute(): Promise<CronJobResult> { return { recordsProcessed: 0 }; }
}
