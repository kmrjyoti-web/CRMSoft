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
var RescheduleDemoHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RescheduleDemoHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const reschedule_demo_command_1 = require("./reschedule-demo.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const reminder_utils_1 = require("../../../../../../common/utils/reminder.utils");
let RescheduleDemoHandler = RescheduleDemoHandler_1 = class RescheduleDemoHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RescheduleDemoHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.demo.findUnique({ where: { id: cmd.id } });
            if (!existing)
                throw new common_1.NotFoundException('Demo not found');
            if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
                throw new common_1.BadRequestException('Cannot reschedule a completed or cancelled demo');
            }
            const demo = await this.prisma.working.demo.update({
                where: { id: cmd.id },
                data: {
                    scheduledAt: cmd.scheduledAt,
                    status: 'RESCHEDULED',
                    rescheduleCount: { increment: 1 },
                },
                include: { lead: true, conductedBy: true },
            });
            await (0, reminder_utils_1.createAutoReminder)(this.prisma, {
                entityType: 'DEMO',
                entityId: demo.id,
                eventDate: cmd.scheduledAt,
                title: `Rescheduled Demo`,
                recipientId: existing.conductedById,
                createdById: cmd.userId,
            });
            await this.prisma.working.calendarEvent.updateMany({
                where: { eventType: 'DEMO', sourceId: cmd.id },
                data: { startTime: cmd.scheduledAt },
            });
            return demo;
        }
        catch (error) {
            this.logger.error(`RescheduleDemoHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RescheduleDemoHandler = RescheduleDemoHandler;
exports.RescheduleDemoHandler = RescheduleDemoHandler = RescheduleDemoHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(reschedule_demo_command_1.RescheduleDemoCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RescheduleDemoHandler);
//# sourceMappingURL=reschedule-demo.handler.js.map