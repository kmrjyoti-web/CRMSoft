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
var PaymentReminderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentReminderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const REMINDER_SCHEDULE = [
    { level: 'GENTLE', daysAfterDue: 3 },
    { level: 'FIRM', daysAfterDue: 7 },
    { level: 'URGENT', daysAfterDue: 15 },
    { level: 'FINAL', daysAfterDue: 30 },
];
let PaymentReminderService = PaymentReminderService_1 = class PaymentReminderService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PaymentReminderService_1.name);
    }
    async scheduleReminders(tenantId, invoiceId, dueDate) {
        const reminders = REMINDER_SCHEDULE.map((r) => {
            const scheduledAt = new Date(dueDate);
            scheduledAt.setDate(scheduledAt.getDate() + r.daysAfterDue);
            return {
                tenantId,
                invoiceId,
                level: r.level,
                scheduledAt,
                channel: 'EMAIL',
                isSent: false,
            };
        });
        await this.prisma.working.paymentReminder.createMany({ data: reminders });
        this.logger.log(`Scheduled ${reminders.length} reminders for invoice ${invoiceId}`);
    }
    async processDueReminders(tenantId) {
        const now = new Date();
        const dueReminders = await this.prisma.working.paymentReminder.findMany({
            where: {
                tenantId,
                isSent: false,
                scheduledAt: { lte: now },
                invoice: {
                    status: { in: ['OVERDUE', 'SENT', 'PARTIALLY_PAID'] },
                },
            },
            include: {
                invoice: { select: { invoiceNo: true, billingName: true, balanceAmount: true, dueDate: true } },
            },
        });
        const results = [];
        for (const reminder of dueReminders) {
            this.logger.log(`[REMINDER] ${reminder.level}: Invoice ${reminder.invoice.invoiceNo} ` +
                `for ${reminder.invoice.billingName}, balance: ${reminder.invoice.balanceAmount}`);
            await this.prisma.working.paymentReminder.update({
                where: { id: reminder.id },
                data: { isSent: true, sentAt: new Date() },
            });
            results.push({
                id: reminder.id,
                level: reminder.level,
                invoiceNo: reminder.invoice.invoiceNo,
                sent: true,
            });
        }
        return results;
    }
    async cancelReminders(tenantId, invoiceId) {
        const result = await this.prisma.working.paymentReminder.deleteMany({
            where: { tenantId, invoiceId, isSent: false },
        });
        return result.count;
    }
    async getForInvoice(tenantId, invoiceId) {
        return this.prisma.working.paymentReminder.findMany({
            where: { tenantId, invoiceId },
            orderBy: { scheduledAt: 'asc' },
        });
    }
};
exports.PaymentReminderService = PaymentReminderService;
exports.PaymentReminderService = PaymentReminderService = PaymentReminderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentReminderService);
//# sourceMappingURL=payment-reminder.service.js.map