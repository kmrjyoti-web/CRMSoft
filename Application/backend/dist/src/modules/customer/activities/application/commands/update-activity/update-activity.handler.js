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
var UpdateActivityHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateActivityHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_activity_command_1 = require("./update-activity.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const cross_db_resolver_service_1 = require("../../../../../../core/prisma/cross-db-resolver.service");
const calendar_colors_1 = require("../../../../../../common/utils/calendar-colors");
let UpdateActivityHandler = UpdateActivityHandler_1 = class UpdateActivityHandler {
    constructor(prisma, resolver) {
        this.prisma = prisma;
        this.resolver = resolver;
        this.logger = new common_1.Logger(UpdateActivityHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.activity.findUnique({ where: { id: cmd.id } });
            if (!existing)
                throw new common_1.NotFoundException('Activity not found');
            const activity = await this.prisma.working.activity.update({
                where: { id: cmd.id },
                data: cmd.data,
                include: { lead: true, contact: true },
            });
            const scheduledAt = cmd.data.scheduledAt || existing.scheduledAt;
            if (scheduledAt) {
                const existingEvent = await this.prisma.working.calendarEvent.findFirst({
                    where: { eventType: 'ACTIVITY', sourceId: activity.id },
                });
                if (existingEvent) {
                    await this.prisma.working.calendarEvent.update({
                        where: { id: existingEvent.id },
                        data: {
                            title: activity.subject,
                            startTime: new Date(scheduledAt),
                            endTime: activity.endTime,
                        },
                    });
                }
                else {
                    await this.prisma.working.calendarEvent.create({
                        data: {
                            eventType: 'ACTIVITY',
                            sourceId: activity.id,
                            title: activity.subject,
                            description: activity.description,
                            startTime: new Date(scheduledAt),
                            endTime: activity.endTime,
                            color: calendar_colors_1.CALENDAR_COLORS[activity.type] || calendar_colors_1.CALENDAR_COLORS.CALL,
                            userId: existing.createdById,
                        },
                    });
                }
            }
            const createdByUser = await this.resolver.resolveUser(activity.createdById);
            return { ...activity, createdByUser };
        }
        catch (error) {
            this.logger.error(`UpdateActivityHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateActivityHandler = UpdateActivityHandler;
exports.UpdateActivityHandler = UpdateActivityHandler = UpdateActivityHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_activity_command_1.UpdateActivityCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cross_db_resolver_service_1.CrossDbResolverService])
], UpdateActivityHandler);
//# sourceMappingURL=update-activity.handler.js.map