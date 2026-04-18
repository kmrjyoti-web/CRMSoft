"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EmailSyncHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowDelayedActionsHandler = exports.DailyDigestHandler = exports.ScheduledReportsHandler = exports.SuspendOverdueAccountsHandler = exports.SendTrialExpiryEmailsHandler = exports.RecalcTenantUsageHandler = exports.ProcessAutoRenewalsHandler = exports.ExpireSubscriptionsHandler = exports.ExpireTrialsHandler = exports.BroadcastExecutorWaHandler = exports.WhatsappWebhookRetryHandler = exports.BroadcastExecutorEmailHandler = exports.ScheduledEmailsHandler = exports.EmailSyncHandler = void 0;
const common_1 = require("@nestjs/common");
let EmailSyncHandler = EmailSyncHandler_1 = class EmailSyncHandler {
    constructor() {
        this.jobCode = 'EMAIL_SYNC';
        this.logger = new common_1.Logger(EmailSyncHandler_1.name);
    }
    async execute(params, ctx) {
        this.logger.log(`Email sync placeholder — tenant: ${ctx?.tenantId ?? 'all'}`);
        return { recordsProcessed: 0 };
    }
};
exports.EmailSyncHandler = EmailSyncHandler;
exports.EmailSyncHandler = EmailSyncHandler = EmailSyncHandler_1 = __decorate([
    (0, common_1.Injectable)()
], EmailSyncHandler);
let ScheduledEmailsHandler = class ScheduledEmailsHandler {
    constructor() {
        this.jobCode = 'SCHEDULED_EMAILS';
    }
    async execute() { return { recordsProcessed: 0 }; }
};
exports.ScheduledEmailsHandler = ScheduledEmailsHandler;
exports.ScheduledEmailsHandler = ScheduledEmailsHandler = __decorate([
    (0, common_1.Injectable)()
], ScheduledEmailsHandler);
let BroadcastExecutorEmailHandler = class BroadcastExecutorEmailHandler {
    constructor() {
        this.jobCode = 'BROADCAST_EXECUTOR_EMAIL';
    }
    async execute() { return { recordsProcessed: 0 }; }
};
exports.BroadcastExecutorEmailHandler = BroadcastExecutorEmailHandler;
exports.BroadcastExecutorEmailHandler = BroadcastExecutorEmailHandler = __decorate([
    (0, common_1.Injectable)()
], BroadcastExecutorEmailHandler);
let WhatsappWebhookRetryHandler = class WhatsappWebhookRetryHandler {
    constructor() {
        this.jobCode = 'WHATSAPP_WEBHOOK_RETRY';
    }
    async execute() { return { recordsProcessed: 0 }; }
};
exports.WhatsappWebhookRetryHandler = WhatsappWebhookRetryHandler;
exports.WhatsappWebhookRetryHandler = WhatsappWebhookRetryHandler = __decorate([
    (0, common_1.Injectable)()
], WhatsappWebhookRetryHandler);
let BroadcastExecutorWaHandler = class BroadcastExecutorWaHandler {
    constructor() {
        this.jobCode = 'BROADCAST_EXECUTOR_WA';
    }
    async execute() { return { recordsProcessed: 0 }; }
};
exports.BroadcastExecutorWaHandler = BroadcastExecutorWaHandler;
exports.BroadcastExecutorWaHandler = BroadcastExecutorWaHandler = __decorate([
    (0, common_1.Injectable)()
], BroadcastExecutorWaHandler);
let ExpireTrialsHandler = class ExpireTrialsHandler {
    constructor() {
        this.jobCode = 'EXPIRE_TRIALS';
    }
    async execute() { return { recordsProcessed: 0 }; }
};
exports.ExpireTrialsHandler = ExpireTrialsHandler;
exports.ExpireTrialsHandler = ExpireTrialsHandler = __decorate([
    (0, common_1.Injectable)()
], ExpireTrialsHandler);
let ExpireSubscriptionsHandler = class ExpireSubscriptionsHandler {
    constructor() {
        this.jobCode = 'EXPIRE_SUBSCRIPTIONS';
    }
    async execute() { return { recordsProcessed: 0 }; }
};
exports.ExpireSubscriptionsHandler = ExpireSubscriptionsHandler;
exports.ExpireSubscriptionsHandler = ExpireSubscriptionsHandler = __decorate([
    (0, common_1.Injectable)()
], ExpireSubscriptionsHandler);
let ProcessAutoRenewalsHandler = class ProcessAutoRenewalsHandler {
    constructor() {
        this.jobCode = 'PROCESS_AUTO_RENEWALS';
    }
    async execute() { return { recordsProcessed: 0 }; }
};
exports.ProcessAutoRenewalsHandler = ProcessAutoRenewalsHandler;
exports.ProcessAutoRenewalsHandler = ProcessAutoRenewalsHandler = __decorate([
    (0, common_1.Injectable)()
], ProcessAutoRenewalsHandler);
let RecalcTenantUsageHandler = class RecalcTenantUsageHandler {
    constructor() {
        this.jobCode = 'RECALC_TENANT_USAGE';
    }
    async execute() { return { recordsProcessed: 0 }; }
};
exports.RecalcTenantUsageHandler = RecalcTenantUsageHandler;
exports.RecalcTenantUsageHandler = RecalcTenantUsageHandler = __decorate([
    (0, common_1.Injectable)()
], RecalcTenantUsageHandler);
let SendTrialExpiryEmailsHandler = class SendTrialExpiryEmailsHandler {
    constructor() {
        this.jobCode = 'SEND_TRIAL_EXPIRY_EMAILS';
    }
    async execute() { return { recordsProcessed: 0 }; }
};
exports.SendTrialExpiryEmailsHandler = SendTrialExpiryEmailsHandler;
exports.SendTrialExpiryEmailsHandler = SendTrialExpiryEmailsHandler = __decorate([
    (0, common_1.Injectable)()
], SendTrialExpiryEmailsHandler);
let SuspendOverdueAccountsHandler = class SuspendOverdueAccountsHandler {
    constructor() {
        this.jobCode = 'SUSPEND_OVERDUE_ACCOUNTS';
    }
    async execute() { return { recordsProcessed: 0 }; }
};
exports.SuspendOverdueAccountsHandler = SuspendOverdueAccountsHandler;
exports.SuspendOverdueAccountsHandler = SuspendOverdueAccountsHandler = __decorate([
    (0, common_1.Injectable)()
], SuspendOverdueAccountsHandler);
let ScheduledReportsHandler = class ScheduledReportsHandler {
    constructor() {
        this.jobCode = 'SCHEDULED_REPORTS';
    }
    async execute() { return { recordsProcessed: 0 }; }
};
exports.ScheduledReportsHandler = ScheduledReportsHandler;
exports.ScheduledReportsHandler = ScheduledReportsHandler = __decorate([
    (0, common_1.Injectable)()
], ScheduledReportsHandler);
let DailyDigestHandler = class DailyDigestHandler {
    constructor() {
        this.jobCode = 'DAILY_DIGEST';
    }
    async execute() { return { recordsProcessed: 0 }; }
};
exports.DailyDigestHandler = DailyDigestHandler;
exports.DailyDigestHandler = DailyDigestHandler = __decorate([
    (0, common_1.Injectable)()
], DailyDigestHandler);
let WorkflowDelayedActionsHandler = class WorkflowDelayedActionsHandler {
    constructor() {
        this.jobCode = 'WORKFLOW_DELAYED_ACTIONS';
    }
    async execute() { return { recordsProcessed: 0 }; }
};
exports.WorkflowDelayedActionsHandler = WorkflowDelayedActionsHandler;
exports.WorkflowDelayedActionsHandler = WorkflowDelayedActionsHandler = __decorate([
    (0, common_1.Injectable)()
], WorkflowDelayedActionsHandler);
//# sourceMappingURL=placeholder-handlers.js.map