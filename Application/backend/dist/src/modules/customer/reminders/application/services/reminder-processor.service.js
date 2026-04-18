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
var ReminderProcessorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderProcessorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const error_utils_1 = require("../../../../../common/utils/error.utils");
let ReminderProcessorService = ReminderProcessorService_1 = class ReminderProcessorService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ReminderProcessorService_1.name);
    }
    async processDueReminders() {
        const now = new Date();
        const unsnoozed = await this.prisma.working.reminder.updateMany({
            where: { isActive: true, status: 'SNOOZED', snoozedUntil: { lte: now } },
            data: { status: 'PENDING', snoozedUntil: null },
        });
        if (unsnoozed.count > 0) {
            this.logger.log(`Re-activated ${unsnoozed.count} snoozed reminders`);
        }
        const dueReminders = await this.prisma.working.reminder.findMany({
            where: { isActive: true, status: 'PENDING', scheduledAt: { lte: now } },
            take: 100,
        });
        if (dueReminders.length === 0)
            return;
        for (const reminder of dueReminders) {
            try {
                switch (reminder.channel) {
                    case 'IN_APP':
                        this.logger.log(`[IN_APP] Reminder "${reminder.title}" for user ${reminder.recipientId}`);
                        break;
                    case 'EMAIL':
                        this.logger.log(`[EMAIL] Would send to user ${reminder.recipientId}: ${reminder.title}`);
                        break;
                    case 'SMS':
                        this.logger.log(`[SMS] Would send to user ${reminder.recipientId}: ${reminder.title}`);
                        break;
                    case 'PUSH':
                        this.logger.log(`[PUSH] Would push to user ${reminder.recipientId}: ${reminder.title}`);
                        break;
                    case 'WHATSAPP':
                        this.logger.log(`[WHATSAPP] Would send to user ${reminder.recipientId}: ${reminder.title}`);
                        break;
                }
                await this.prisma.working.reminder.update({
                    where: { id: reminder.id },
                    data: { isSent: true, sentAt: now, status: 'TRIGGERED', triggeredAt: now },
                });
            }
            catch (error) {
                this.logger.error(`Failed to process reminder ${reminder.id}: ${(0, error_utils_1.getErrorMessage)(error)}`);
            }
        }
        this.logger.log(`Processed ${dueReminders.length} reminders`);
    }
    async detectMissedReminders() {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const missed = await this.prisma.working.reminder.updateMany({
            where: {
                isActive: true,
                status: 'PENDING',
                scheduledAt: { lt: oneHourAgo },
            },
            data: { status: 'MISSED', missedAt: new Date() },
        });
        if (missed.count > 0) {
            this.logger.log(`Marked ${missed.count} reminders as MISSED`);
        }
        return missed.count;
    }
};
exports.ReminderProcessorService = ReminderProcessorService;
exports.ReminderProcessorService = ReminderProcessorService = ReminderProcessorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReminderProcessorService);
//# sourceMappingURL=reminder-processor.service.js.map