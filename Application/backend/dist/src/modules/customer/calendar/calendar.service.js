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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const cross_db_resolver_service_1 = require("../../../core/prisma/cross-db-resolver.service");
let CalendarService = class CalendarService {
    constructor(prisma, resolver) {
        this.prisma = prisma;
        this.resolver = resolver;
    }
    async getCalendarEvents(tenantId, userId, startDate, endDate, eventTypes) {
        const where = {
            tenantId,
            userId,
            isActive: true,
            startTime: { gte: startDate, lte: endDate },
        };
        if (eventTypes?.length)
            where.eventType = { in: eventTypes };
        return this.prisma.working.calendarEvent.findMany({
            where,
            orderBy: { startTime: 'asc' },
        });
    }
    async getTeamCalendar(tenantId, userIds, startDate, endDate) {
        const events = await this.prisma.working.calendarEvent.findMany({
            where: {
                tenantId,
                userId: { in: userIds },
                isActive: true,
                startTime: { gte: startDate, lte: endDate },
            },
            orderBy: { startTime: 'asc' },
        });
        return this.resolver.resolveUsers(events, ['userId'], { id: true, firstName: true, lastName: true });
    }
    async getAvailability(tenantId, userId, date) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        const events = await this.prisma.working.calendarEvent.findMany({
            where: {
                tenantId,
                userId,
                isActive: true,
                startTime: { gte: dayStart, lte: dayEnd },
            },
            orderBy: { startTime: 'asc' },
            select: { startTime: true, endTime: true, title: true },
        });
        const busySlots = events.map((e) => ({
            start: e.startTime,
            end: e.endTime || new Date(e.startTime.getTime() + 60 * 60 * 1000),
            title: e.title,
        }));
        return { date, busySlots, totalEvents: events.length };
    }
    async getDayView(tenantId, userId, date) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        return this.getCalendarEvents(tenantId, userId, dayStart, dayEnd);
    }
    async getWeekView(tenantId, userId, date) {
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return this.getCalendarEvents(tenantId, userId, weekStart, weekEnd);
    }
    async getMonthView(tenantId, userId, year, month) {
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
        return this.getCalendarEvents(tenantId, userId, monthStart, monthEnd);
    }
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cross_db_resolver_service_1.CrossDbResolverService])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map