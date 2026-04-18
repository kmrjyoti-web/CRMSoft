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
var CreateReminderHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReminderHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_reminder_command_1 = require("./create-reminder.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let CreateReminderHandler = CreateReminderHandler_1 = class CreateReminderHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateReminderHandler_1.name);
    }
    async execute(cmd) {
        try {
            return this.prisma.working.reminder.create({
                data: {
                    title: cmd.title,
                    message: cmd.message,
                    scheduledAt: cmd.scheduledAt,
                    channel: (cmd.channel || 'IN_APP'),
                    entityType: cmd.entityType,
                    entityId: cmd.entityId,
                    recipientId: cmd.recipientId,
                    createdById: cmd.createdById,
                },
                include: {
                    recipient: { select: { id: true, firstName: true, lastName: true } },
                },
            });
        }
        catch (error) {
            this.logger.error(`CreateReminderHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateReminderHandler = CreateReminderHandler;
exports.CreateReminderHandler = CreateReminderHandler = CreateReminderHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_reminder_command_1.CreateReminderCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateReminderHandler);
//# sourceMappingURL=create-reminder.handler.js.map