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
var DismissReminderHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DismissReminderHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const dismiss_reminder_command_1 = require("./dismiss-reminder.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let DismissReminderHandler = DismissReminderHandler_1 = class DismissReminderHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DismissReminderHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.reminder.findUnique({ where: { id: cmd.id } });
            if (!existing)
                throw new common_1.NotFoundException('Reminder not found');
            return this.prisma.working.reminder.update({
                where: { id: cmd.id },
                data: { isSent: true, sentAt: new Date() },
            });
        }
        catch (error) {
            this.logger.error(`DismissReminderHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DismissReminderHandler = DismissReminderHandler;
exports.DismissReminderHandler = DismissReminderHandler = DismissReminderHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(dismiss_reminder_command_1.DismissReminderCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DismissReminderHandler);
//# sourceMappingURL=dismiss-reminder.handler.js.map