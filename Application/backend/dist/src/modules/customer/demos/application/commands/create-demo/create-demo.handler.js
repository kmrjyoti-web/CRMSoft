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
var CreateDemoHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDemoHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_demo_command_1 = require("./create-demo.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const reminder_utils_1 = require("../../../../../../common/utils/reminder.utils");
const calendar_colors_1 = require("../../../../../../common/utils/calendar-colors");
let CreateDemoHandler = CreateDemoHandler_1 = class CreateDemoHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateDemoHandler_1.name);
    }
    async execute(cmd) {
        try {
            const demo = await this.prisma.working.demo.create({
                data: {
                    mode: cmd.mode,
                    scheduledAt: cmd.scheduledAt,
                    duration: cmd.duration,
                    meetingLink: cmd.meetingLink,
                    location: cmd.location,
                    notes: cmd.notes,
                    leadId: cmd.leadId,
                    conductedById: cmd.userId,
                },
                include: { lead: true, conductedBy: true },
            });
            await (0, reminder_utils_1.createAutoReminder)(this.prisma, {
                entityType: 'DEMO',
                entityId: demo.id,
                eventDate: cmd.scheduledAt,
                title: `Demo with ${demo.lead?.leadNumber || 'Lead'}`,
                recipientId: cmd.userId,
                createdById: cmd.userId,
            });
            const existingEvent = await this.prisma.working.calendarEvent.findFirst({
                where: { eventType: 'DEMO', sourceId: demo.id },
            });
            if (existingEvent) {
                await this.prisma.working.calendarEvent.update({
                    where: { id: existingEvent.id },
                    data: { startTime: cmd.scheduledAt },
                });
            }
            else {
                await this.prisma.working.calendarEvent.create({
                    data: {
                        eventType: 'DEMO',
                        sourceId: demo.id,
                        title: `Demo: ${demo.lead?.leadNumber || 'Lead'}`,
                        startTime: cmd.scheduledAt,
                        endTime: cmd.duration ? new Date(cmd.scheduledAt.getTime() + cmd.duration * 60000) : undefined,
                        color: calendar_colors_1.CALENDAR_COLORS.DEMO,
                        userId: cmd.userId,
                    },
                });
            }
            return demo;
        }
        catch (error) {
            this.logger.error(`CreateDemoHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateDemoHandler = CreateDemoHandler;
exports.CreateDemoHandler = CreateDemoHandler = CreateDemoHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_demo_command_1.CreateDemoCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateDemoHandler);
//# sourceMappingURL=create-demo.handler.js.map