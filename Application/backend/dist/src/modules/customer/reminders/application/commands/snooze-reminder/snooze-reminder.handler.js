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
var SnoozeReminderHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnoozeReminderHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const snooze_reminder_command_1 = require("./snooze-reminder.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const common_1 = require("@nestjs/common");
let SnoozeReminderHandler = SnoozeReminderHandler_1 = class SnoozeReminderHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SnoozeReminderHandler_1.name);
    }
    async execute(cmd) {
        try {
            const reminder = await this.prisma.working.reminder.findUnique({ where: { id: cmd.id } });
            if (!reminder || !reminder.isActive)
                throw new common_1.NotFoundException('Reminder not found');
            if (reminder.recipientId !== cmd.userId)
                throw new common_1.BadRequestException('Not your reminder');
            if (reminder.snoozeCount >= reminder.maxSnooze) {
                throw new common_1.BadRequestException(`Maximum snooze count (${reminder.maxSnooze}) reached`);
            }
            const snoozedUntil = cmd.snoozedUntil || new Date(Date.now() + 30 * 60 * 1000);
            return this.prisma.working.reminder.update({
                where: { id: cmd.id },
                data: {
                    status: 'SNOOZED',
                    snoozedUntil,
                    snoozeCount: { increment: 1 },
                },
            });
        }
        catch (error) {
            this.logger.error(`SnoozeReminderHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SnoozeReminderHandler = SnoozeReminderHandler;
exports.SnoozeReminderHandler = SnoozeReminderHandler = SnoozeReminderHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(snooze_reminder_command_1.SnoozeReminderCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SnoozeReminderHandler);
//# sourceMappingURL=snooze-reminder.handler.js.map