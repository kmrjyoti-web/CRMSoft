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
var AcknowledgeReminderHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcknowledgeReminderHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const acknowledge_reminder_command_1 = require("./acknowledge-reminder.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let AcknowledgeReminderHandler = AcknowledgeReminderHandler_1 = class AcknowledgeReminderHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AcknowledgeReminderHandler_1.name);
    }
    async execute(cmd) {
        try {
            const reminder = await this.prisma.working.reminder.findUnique({ where: { id: cmd.reminderId } });
            if (!reminder)
                throw new common_1.NotFoundException('Reminder not found');
            if (reminder.recipientId !== cmd.userId) {
                throw new common_1.NotFoundException('Reminder not found');
            }
            return this.prisma.working.reminder.update({
                where: { id: cmd.reminderId },
                data: { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() },
            });
        }
        catch (error) {
            this.logger.error(`AcknowledgeReminderHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AcknowledgeReminderHandler = AcknowledgeReminderHandler;
exports.AcknowledgeReminderHandler = AcknowledgeReminderHandler = AcknowledgeReminderHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(acknowledge_reminder_command_1.AcknowledgeReminderCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AcknowledgeReminderHandler);
//# sourceMappingURL=acknowledge-reminder.handler.js.map