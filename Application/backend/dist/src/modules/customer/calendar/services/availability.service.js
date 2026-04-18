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
exports.AvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let AvailabilityService = class AvailabilityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async setWorkingHours(userId, tenantId, hours, timezone) {
        const results = await this.prisma.$transaction(hours.map((h) => this.prisma.working.userAvailability.upsert({
            where: {
                tenantId_userId_dayOfWeek: {
                    tenantId,
                    userId,
                    dayOfWeek: h.dayOfWeek,
                },
            },
            update: {
                startTime: h.startTime,
                endTime: h.endTime,
                isWorkingDay: h.isWorkingDay ?? true,
                ...(timezone ? { timezone } : {}),
            },
            create: {
                tenantId,
                userId,
                dayOfWeek: h.dayOfWeek,
                startTime: h.startTime,
                endTime: h.endTime,
                isWorkingDay: h.isWorkingDay ?? true,
                timezone: timezone ?? 'Asia/Kolkata',
            },
        })));
        return results;
    }
    async getWorkingHours(userId, tenantId) {
        return this.prisma.working.userAvailability.findMany({
            where: { tenantId, userId, isActive: true },
            orderBy: { dayOfWeek: 'asc' },
        });
    }
    async createBlockedSlot(userId, tenantId, dto) {
        return this.prisma.working.blockedSlot.create({
            data: {
                tenantId,
                userId,
                title: dto.title,
                reason: dto.reason,
                startTime: new Date(dto.startTime),
                endTime: new Date(dto.endTime),
                allDay: dto.allDay ?? false,
                status: dto.status ?? 'OUT_OF_OFFICE',
                isRecurring: dto.isRecurring ?? false,
                recurrencePattern: dto.recurrencePattern ?? undefined,
            },
        });
    }
    async deleteBlockedSlot(id, userId, tenantId) {
        const slot = await this.prisma.working.blockedSlot.findFirst({
            where: { id, userId, tenantId, isActive: true },
        });
        if (!slot)
            throw new common_1.NotFoundException('Blocked slot not found');
        await this.prisma.working.blockedSlot.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async listBlockedSlots(userId, tenantId, startDate, endDate) {
        return this.prisma.working.blockedSlot.findMany({
            where: {
                tenantId,
                userId,
                isActive: true,
                startTime: { lte: endDate },
                endTime: { gte: startDate },
            },
            orderBy: { startTime: 'asc' },
        });
    }
    async checkConflicts(userId, tenantId, startTime, endTime, excludeEventId) {
        const eventWhere = {
            tenantId,
            organizerId: userId,
            isActive: true,
            status: { notIn: ['CANCELLED'] },
            startTime: { lt: endTime },
            endTime: { gt: startTime },
        };
        if (excludeEventId) {
            eventWhere.id = { not: excludeEventId };
        }
        const eventConflicts = await this.prisma.working.scheduledEvent.findMany({
            where: eventWhere,
            select: {
                id: true,
                title: true,
                startTime: true,
                endTime: true,
                status: true,
            },
        });
        const blockedConflicts = await this.prisma.working.blockedSlot.findMany({
            where: {
                tenantId,
                userId,
                isActive: true,
                startTime: { lt: endTime },
                endTime: { gt: startTime },
            },
            select: {
                id: true,
                title: true,
                startTime: true,
                endTime: true,
                status: true,
            },
        });
        const conflicts = [
            ...eventConflicts.map((e) => ({ ...e, type: 'EVENT' })),
            ...blockedConflicts.map((b) => ({ ...b, type: 'BLOCKED_SLOT' })),
        ];
        return {
            hasConflict: conflicts.length > 0,
            conflicts,
        };
    }
    async findFreeSlots(userIds, tenantId, date, durationMinutes, timezone) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        const dayOfWeek = dayStart.getDay();
        const holiday = await this.prisma.working.holidayCalendar.findFirst({
            where: {
                tenantId,
                isActive: true,
                date: {
                    gte: dayStart,
                    lte: dayEnd,
                },
            },
        });
        if (holiday && !holiday.isHalfDay) {
            return [];
        }
        const perUserFreeWindows = new Map();
        for (const userId of userIds) {
            const workingHour = await this.prisma.working.userAvailability.findFirst({
                where: {
                    tenantId,
                    userId,
                    dayOfWeek,
                    isActive: true,
                },
            });
            if (!workingHour || !workingHour.isWorkingDay) {
                perUserFreeWindows.set(userId, []);
                continue;
            }
            const workStart = this.timeStringToDate(dayStart, workingHour.startTime);
            let workEnd = this.timeStringToDate(dayStart, workingHour.endTime);
            if (holiday?.isHalfDay && holiday.halfDayEnd) {
                const halfEnd = this.timeStringToDate(dayStart, holiday.halfDayEnd);
                if (halfEnd.getTime() < workEnd.getTime()) {
                    workEnd = halfEnd;
                }
            }
            const events = await this.prisma.working.scheduledEvent.findMany({
                where: {
                    tenantId,
                    organizerId: userId,
                    isActive: true,
                    status: { notIn: ['CANCELLED'] },
                    startTime: { lt: workEnd },
                    endTime: { gt: workStart },
                },
                select: { startTime: true, endTime: true },
                orderBy: { startTime: 'asc' },
            });
            const blocked = await this.prisma.working.blockedSlot.findMany({
                where: {
                    tenantId,
                    userId,
                    isActive: true,
                    startTime: { lt: workEnd },
                    endTime: { gt: workStart },
                },
                select: { startTime: true, endTime: true },
                orderBy: { startTime: 'asc' },
            });
            const busyRanges = [
                ...events.map((e) => ({ start: e.startTime, end: e.endTime })),
                ...blocked.map((b) => ({ start: b.startTime, end: b.endTime })),
            ].sort((a, b) => a.start.getTime() - b.start.getTime());
            const freeWindows = this.subtractRanges({ start: workStart, end: workEnd }, busyRanges);
            perUserFreeWindows.set(userId, freeWindows);
        }
        const durationMs = durationMinutes * 60 * 1000;
        const allSlots = new Map();
        for (const userId of userIds) {
            const windows = perUserFreeWindows.get(userId) || [];
            for (const w of windows) {
                let slotStart = new Date(w.start);
                while (slotStart.getTime() + durationMs <= w.end.getTime()) {
                    const key = slotStart.toISOString();
                    if (!allSlots.has(key))
                        allSlots.set(key, new Set());
                    allSlots.get(key).add(userId);
                    slotStart = new Date(slotStart.getTime() + durationMs);
                }
            }
        }
        const result = [];
        const sortedKeys = [...allSlots.keys()].sort();
        for (const key of sortedKeys) {
            const available = allSlots.get(key);
            result.push({
                startTime: new Date(key),
                endTime: new Date(new Date(key).getTime() + durationMs),
                availableForAll: available.size === userIds.length,
            });
        }
        return result;
    }
    async getAvailabilityStatus(userId, tenantId, dateTime) {
        const dayOfWeek = dateTime.getDay();
        const workingHour = await this.prisma.working.userAvailability.findFirst({
            where: { tenantId, userId, dayOfWeek, isActive: true },
        });
        if (!workingHour || !workingHour.isWorkingDay) {
            return 'OUT_OF_OFFICE';
        }
        const dayStart = new Date(dateTime);
        dayStart.setHours(0, 0, 0, 0);
        const workStart = this.timeStringToDate(dayStart, workingHour.startTime);
        const workEnd = this.timeStringToDate(dayStart, workingHour.endTime);
        if (dateTime < workStart || dateTime >= workEnd) {
            return 'OUT_OF_OFFICE';
        }
        const blockedSlot = await this.prisma.working.blockedSlot.findFirst({
            where: {
                tenantId,
                userId,
                isActive: true,
                startTime: { lte: dateTime },
                endTime: { gt: dateTime },
            },
        });
        if (blockedSlot) {
            return blockedSlot.status || 'OUT_OF_OFFICE';
        }
        const event = await this.prisma.working.scheduledEvent.findFirst({
            where: {
                tenantId,
                organizerId: userId,
                isActive: true,
                status: { notIn: ['CANCELLED'] },
                startTime: { lte: dateTime },
                endTime: { gt: dateTime },
            },
        });
        if (event) {
            if (event.status === 'CONFIRMED' || event.status === 'IN_PROGRESS') {
                return 'BUSY';
            }
            if (event.status === 'SCHEDULED') {
                return 'TENTATIVE';
            }
            return 'BUSY';
        }
        return 'FREE';
    }
    timeStringToDate(dayBase, timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const d = new Date(dayBase);
        d.setHours(hours, minutes, 0, 0);
        return d;
    }
    subtractRanges(working, busy) {
        const free = [];
        let cursor = new Date(working.start);
        for (const b of busy) {
            const busyStart = b.start < working.start ? working.start : b.start;
            const busyEnd = b.end > working.end ? working.end : b.end;
            if (busyStart >= working.end || busyEnd <= working.start)
                continue;
            if (cursor < busyStart) {
                free.push({ start: new Date(cursor), end: new Date(busyStart) });
            }
            if (busyEnd > cursor) {
                cursor = new Date(busyEnd);
            }
        }
        if (cursor < working.end) {
            free.push({ start: new Date(cursor), end: new Date(working.end) });
        }
        return free;
    }
};
exports.AvailabilityService = AvailabilityService;
exports.AvailabilityService = AvailabilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AvailabilityService);
//# sourceMappingURL=availability.service.js.map