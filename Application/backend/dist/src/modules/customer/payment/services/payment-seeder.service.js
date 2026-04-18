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
var PaymentSeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentSeederService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let PaymentSeederService = PaymentSeederService_1 = class PaymentSeederService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PaymentSeederService_1.name);
    }
    async seedAll(tenantId) {
        await Promise.all([
            this.seedAutoNumbers(tenantId),
            this.seedTenantConfigs(tenantId),
            this.seedCronJobs(tenantId),
        ]);
        this.logger.log(`Payment seeds completed for tenant ${tenantId}`);
    }
    async seedAutoNumbers(tenantId) {
        const sequences = [
            { entityName: 'Payment', prefix: 'PAY', formatPattern: 'PAY-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' },
            { entityName: 'Receipt', prefix: 'RCT', formatPattern: 'RCT-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' },
            { entityName: 'Refund', prefix: 'RFD', formatPattern: 'RFD-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' },
            { entityName: 'CreditNote', prefix: 'CN', formatPattern: 'CN-{YYYY}/{MM}-{SEQ:4}', resetPolicy: 'YEARLY' },
        ];
        for (const seq of sequences) {
            await this.prisma.working.autoNumberSequence.upsert({
                where: { tenantId_entityName: { tenantId, entityName: seq.entityName } },
                update: {},
                create: {
                    tenantId,
                    entityName: seq.entityName,
                    prefix: seq.prefix,
                    formatPattern: seq.formatPattern,
                    currentSequence: 0,
                    resetPolicy: seq.resetPolicy,
                    isActive: true,
                },
            });
        }
    }
    async seedTenantConfigs(tenantId) {
        const configs = [
            {
                configKey: 'payment.default_gateway',
                configValue: 'MANUAL',
                category: 'GENERAL',
                valueType: 'ENUM',
                displayName: 'Default Payment Gateway',
                description: 'Default payment gateway for new invoices',
                groupName: 'Payment',
                enumOptions: JSON.stringify(['MANUAL', 'RAZORPAY', 'STRIPE']),
            },
            {
                configKey: 'payment.default_due_days',
                configValue: '30',
                category: 'GENERAL',
                valueType: 'INTEGER',
                displayName: 'Default Invoice Due Days',
                description: 'Number of days from invoice date to set as default due date',
                groupName: 'Payment',
            },
            {
                configKey: 'payment.auto_receipt',
                configValue: 'true',
                category: 'GENERAL',
                valueType: 'BOOLEAN',
                displayName: 'Auto-Generate Receipt',
                description: 'Automatically generate receipt on payment capture',
                groupName: 'Payment',
            },
            {
                configKey: 'payment.reminder_enabled',
                configValue: 'true',
                category: 'NOTIFICATION',
                valueType: 'BOOLEAN',
                displayName: 'Payment Reminders',
                description: 'Enable automatic payment reminders for overdue invoices',
                groupName: 'Payment',
            },
            {
                configKey: 'payment.default_currency',
                configValue: 'INR',
                category: 'GENERAL',
                valueType: 'STRING',
                displayName: 'Default Currency',
                description: 'Default currency for invoices and payments',
                groupName: 'Payment',
            },
            {
                configKey: 'payment.gst_enabled',
                configValue: 'true',
                category: 'GENERAL',
                valueType: 'BOOLEAN',
                displayName: 'GST Enabled',
                description: 'Enable GST calculations on invoices',
                groupName: 'Payment',
            },
        ];
        for (const config of configs) {
            await this.prisma.tenantConfig.upsert({
                where: { tenantId_configKey: { tenantId, configKey: config.configKey } },
                update: {},
                create: {
                    tenantId,
                    configKey: config.configKey,
                    configValue: config.configValue,
                    category: config.category,
                    valueType: config.valueType,
                    displayName: config.displayName,
                    description: config.description,
                    groupName: config.groupName,
                    enumOptions: config.enumOptions ? JSON.parse(config.enumOptions) : undefined,
                },
            });
        }
    }
    async seedCronJobs(_tenantId) {
        const cronJobs = [
            {
                jobCode: 'PAYMENT_REMINDER_CHECK',
                jobName: 'Payment Reminder Check',
                moduleName: 'PAYMENT',
                description: 'Send payment reminders for overdue invoices based on escalation ladder',
                cronExpression: '0 9 * * *',
                timeoutSeconds: 120,
            },
            {
                jobCode: 'OVERDUE_INVOICE_MARK',
                jobName: 'Overdue Invoice Marker',
                moduleName: 'PAYMENT',
                description: 'Mark invoices past due date as OVERDUE',
                cronExpression: '0 0 * * *',
                timeoutSeconds: 120,
            },
        ];
        for (const job of cronJobs) {
            await this.prisma.working.cronJobConfig.upsert({
                where: { jobCode: job.jobCode },
                update: {},
                create: job,
            });
        }
    }
};
exports.PaymentSeederService = PaymentSeederService;
exports.PaymentSeederService = PaymentSeederService = PaymentSeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentSeederService);
//# sourceMappingURL=payment-seeder.service.js.map