import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';
export declare class EmailSyncHandler implements ICronJobHandler {
    readonly jobCode = "EMAIL_SYNC";
    private readonly logger;
    execute(params: Record<string, any>, ctx?: {
        tenantId?: string;
    }): Promise<CronJobResult>;
}
export declare class ScheduledEmailsHandler implements ICronJobHandler {
    readonly jobCode = "SCHEDULED_EMAILS";
    execute(): Promise<CronJobResult>;
}
export declare class BroadcastExecutorEmailHandler implements ICronJobHandler {
    readonly jobCode = "BROADCAST_EXECUTOR_EMAIL";
    execute(): Promise<CronJobResult>;
}
export declare class WhatsappWebhookRetryHandler implements ICronJobHandler {
    readonly jobCode = "WHATSAPP_WEBHOOK_RETRY";
    execute(): Promise<CronJobResult>;
}
export declare class BroadcastExecutorWaHandler implements ICronJobHandler {
    readonly jobCode = "BROADCAST_EXECUTOR_WA";
    execute(): Promise<CronJobResult>;
}
export declare class ExpireTrialsHandler implements ICronJobHandler {
    readonly jobCode = "EXPIRE_TRIALS";
    execute(): Promise<CronJobResult>;
}
export declare class ExpireSubscriptionsHandler implements ICronJobHandler {
    readonly jobCode = "EXPIRE_SUBSCRIPTIONS";
    execute(): Promise<CronJobResult>;
}
export declare class ProcessAutoRenewalsHandler implements ICronJobHandler {
    readonly jobCode = "PROCESS_AUTO_RENEWALS";
    execute(): Promise<CronJobResult>;
}
export declare class RecalcTenantUsageHandler implements ICronJobHandler {
    readonly jobCode = "RECALC_TENANT_USAGE";
    execute(): Promise<CronJobResult>;
}
export declare class SendTrialExpiryEmailsHandler implements ICronJobHandler {
    readonly jobCode = "SEND_TRIAL_EXPIRY_EMAILS";
    execute(): Promise<CronJobResult>;
}
export declare class SuspendOverdueAccountsHandler implements ICronJobHandler {
    readonly jobCode = "SUSPEND_OVERDUE_ACCOUNTS";
    execute(): Promise<CronJobResult>;
}
export declare class ScheduledReportsHandler implements ICronJobHandler {
    readonly jobCode = "SCHEDULED_REPORTS";
    execute(): Promise<CronJobResult>;
}
export declare class DailyDigestHandler implements ICronJobHandler {
    readonly jobCode = "DAILY_DIGEST";
    execute(): Promise<CronJobResult>;
}
export declare class WorkflowDelayedActionsHandler implements ICronJobHandler {
    readonly jobCode = "WORKFLOW_DELAYED_ACTIONS";
    execute(): Promise<CronJobResult>;
}
