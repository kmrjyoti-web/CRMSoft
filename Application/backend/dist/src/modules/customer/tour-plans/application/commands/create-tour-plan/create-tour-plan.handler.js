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
var CreateTourPlanHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTourPlanHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_tour_plan_command_1 = require("./create-tour-plan.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const reminder_utils_1 = require("../../../../../../common/utils/reminder.utils");
const calendar_colors_1 = require("../../../../../../common/utils/calendar-colors");
let CreateTourPlanHandler = CreateTourPlanHandler_1 = class CreateTourPlanHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateTourPlanHandler_1.name);
    }
    async execute(cmd) {
        try {
            const tourPlan = await this.prisma.working.tourPlan.create({
                data: {
                    title: cmd.title,
                    description: cmd.description,
                    planDate: cmd.planDate,
                    startLocation: cmd.startLocation,
                    endLocation: cmd.endLocation,
                    leadId: cmd.leadId,
                    salesPersonId: cmd.userId,
                    visits: cmd.visits?.length ? {
                        create: cmd.visits.map((v, i) => ({
                            leadId: v.leadId,
                            contactId: v.contactId,
                            scheduledTime: v.scheduledTime,
                            sortOrder: v.sortOrder ?? i,
                        })),
                    } : undefined,
                },
                include: { lead: true, salesPerson: true, visits: true },
            });
            await (0, reminder_utils_1.createAutoReminder)(this.prisma, {
                entityType: 'TOUR_PLAN',
                entityId: tourPlan.id,
                eventDate: cmd.planDate,
                title: cmd.title,
                recipientId: cmd.userId,
                createdById: cmd.userId,
            });
            const existingEvent = await this.prisma.working.calendarEvent.findFirst({
                where: { eventType: 'TOUR_PLAN', sourceId: tourPlan.id },
            });
            if (existingEvent) {
                await this.prisma.working.calendarEvent.update({
                    where: { id: existingEvent.id },
                    data: { title: cmd.title, startTime: cmd.planDate },
                });
            }
            else {
                await this.prisma.working.calendarEvent.create({
                    data: {
                        eventType: 'TOUR_PLAN',
                        sourceId: tourPlan.id,
                        title: cmd.title,
                        description: cmd.description,
                        startTime: cmd.planDate,
                        allDay: true,
                        color: calendar_colors_1.CALENDAR_COLORS.TOUR,
                        userId: cmd.userId,
                    },
                });
            }
            return tourPlan;
        }
        catch (error) {
            this.logger.error(`CreateTourPlanHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateTourPlanHandler = CreateTourPlanHandler;
exports.CreateTourPlanHandler = CreateTourPlanHandler = CreateTourPlanHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_tour_plan_command_1.CreateTourPlanCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateTourPlanHandler);
//# sourceMappingURL=create-tour-plan.handler.js.map