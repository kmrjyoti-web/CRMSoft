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
var CreateFollowUpHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFollowUpHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_follow_up_command_1 = require("./create-follow-up.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const reminder_utils_1 = require("../../../../../../common/utils/reminder.utils");
let CreateFollowUpHandler = CreateFollowUpHandler_1 = class CreateFollowUpHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateFollowUpHandler_1.name);
    }
    async execute(cmd) {
        try {
            const followUp = await this.prisma.working.followUp.create({
                data: {
                    title: cmd.title,
                    description: cmd.description,
                    dueDate: cmd.dueDate,
                    priority: (cmd.priority || 'MEDIUM'),
                    entityType: cmd.entityType,
                    entityId: cmd.entityId,
                    assignedToId: cmd.assignedToId,
                    createdById: cmd.createdById,
                },
                include: {
                    assignedTo: { select: { id: true, firstName: true, lastName: true } },
                    createdBy: { select: { id: true, firstName: true, lastName: true } },
                },
            });
            await (0, reminder_utils_1.createAutoReminder)(this.prisma, {
                entityType: 'FOLLOW_UP',
                entityId: followUp.id,
                eventDate: cmd.dueDate,
                title: cmd.title,
                recipientId: cmd.assignedToId,
                createdById: cmd.createdById,
                minutesBefore: 60,
            });
            return followUp;
        }
        catch (error) {
            this.logger.error(`CreateFollowUpHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateFollowUpHandler = CreateFollowUpHandler;
exports.CreateFollowUpHandler = CreateFollowUpHandler = CreateFollowUpHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_follow_up_command_1.CreateFollowUpCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateFollowUpHandler);
//# sourceMappingURL=create-follow-up.handler.js.map