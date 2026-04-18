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
var SnoozeFollowUpHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnoozeFollowUpHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const snooze_follow_up_command_1 = require("./snooze-follow-up.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let SnoozeFollowUpHandler = SnoozeFollowUpHandler_1 = class SnoozeFollowUpHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SnoozeFollowUpHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.followUp.findUnique({ where: { id: cmd.id } });
            if (!existing)
                throw new common_1.NotFoundException('Follow-up not found');
            return this.prisma.working.followUp.update({
                where: { id: cmd.id },
                data: { snoozedUntil: cmd.snoozedUntil, isOverdue: false },
                include: {
                    assignedTo: { select: { id: true, firstName: true, lastName: true } },
                },
            });
        }
        catch (error) {
            this.logger.error(`SnoozeFollowUpHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SnoozeFollowUpHandler = SnoozeFollowUpHandler;
exports.SnoozeFollowUpHandler = SnoozeFollowUpHandler = SnoozeFollowUpHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(snooze_follow_up_command_1.SnoozeFollowUpCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SnoozeFollowUpHandler);
//# sourceMappingURL=snooze-follow-up.handler.js.map