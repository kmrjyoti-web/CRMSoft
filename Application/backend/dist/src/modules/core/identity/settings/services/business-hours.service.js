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
var BusinessHoursService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessHoursService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const working_client_1 = require("@prisma/working-client");
const JS_DAY_MAP = [
    working_client_1.DayOfWeek.SUNDAY, working_client_1.DayOfWeek.MONDAY, working_client_1.DayOfWeek.TUESDAY,
    working_client_1.DayOfWeek.WEDNESDAY, working_client_1.DayOfWeek.THURSDAY, working_client_1.DayOfWeek.FRIDAY, working_client_1.DayOfWeek.SATURDAY,
];
let BusinessHoursService = BusinessHoursService_1 = class BusinessHoursService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(BusinessHoursService_1.name);
    }
    async isWorkingNow(tenantId) {
        const now = new Date();
        const day = JS_DAY_MAP[now.getDay()];
        const isHoliday = await this.isHoliday(tenantId, now);
        if (isHoliday)
            return false;
        const schedule = await this.prisma.businessHoursSchedule.findUnique({
            where: { tenantId_dayOfWeek: { tenantId, dayOfWeek: day } },
        });
        if (!schedule || !schedule.isWorkingDay)
            return false;
        const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (!schedule.startTime || !schedule.endTime)
            return false;
        if (hhmm < schedule.startTime || hhmm >= schedule.endTime)
            return false;
        if (schedule.breakStartTime && schedule.breakEndTime) {
            if (hhmm >= schedule.breakStartTime && hhmm < schedule.breakEndTime)
                return false;
        }
        return true;
    }
    async getNextWorkingTime(tenantId, from) {
        const start = from ?? new Date();
        for (let offset = 0; offset < 14; offset++) {
            const candidate = new Date(start);
            candidate.setDate(candidate.getDate() + offset);
            const day = JS_DAY_MAP[candidate.getDay()];
            const schedule = await this.prisma.businessHoursSchedule.findUnique({
                where: { tenantId_dayOfWeek: { tenantId, dayOfWeek: day } },
            });
            if (!schedule?.isWorkingDay || !schedule.startTime)
                continue;
            const isHoliday = await this.isHoliday(tenantId, candidate);
            if (isHoliday)
                continue;
            const [h, m] = schedule.startTime.split(':').map(Number);
            candidate.setHours(h, m, 0, 0);
            if (offset === 0 && start > candidate) {
                if (schedule.endTime) {
                    const [eh, em] = schedule.endTime.split(':').map(Number);
                    const end = new Date(candidate);
                    end.setHours(eh, em, 0, 0);
                    if (start < end)
                        return start;
                }
                continue;
            }
            return candidate;
        }
        return start;
    }
    async calculateWorkingHours(tenantId, from, to) {
        let totalMinutes = 0;
        const current = new Date(from);
        while (current < to) {
            const day = JS_DAY_MAP[current.getDay()];
            const schedule = await this.prisma.businessHoursSchedule.findUnique({
                where: { tenantId_dayOfWeek: { tenantId, dayOfWeek: day } },
            });
            const isHoliday = await this.isHoliday(tenantId, current);
            if (schedule?.isWorkingDay && !isHoliday && schedule.startTime && schedule.endTime) {
                const dayMinutes = this.timeToMinutes(schedule.endTime) - this.timeToMinutes(schedule.startTime);
                const breakMinutes = schedule.breakStartTime && schedule.breakEndTime
                    ? this.timeToMinutes(schedule.breakEndTime) - this.timeToMinutes(schedule.breakStartTime)
                    : 0;
                totalMinutes += dayMinutes - breakMinutes;
            }
            current.setDate(current.getDate() + 1);
        }
        return Math.round((totalMinutes / 60) * 100) / 100;
    }
    async getWeekSchedule(tenantId) {
        return this.prisma.businessHoursSchedule.findMany({
            where: { tenantId },
            orderBy: { dayOfWeek: 'asc' },
        });
    }
    async updateDay(tenantId, day, dto) {
        const { dayOfWeek: _, ...data } = dto;
        await this.prisma.businessHoursSchedule.upsert({
            where: { tenantId_dayOfWeek: { tenantId, dayOfWeek: day } },
            update: data,
            create: { tenantId, dayOfWeek: day, ...data },
        });
    }
    async updateWeek(tenantId, schedules) {
        await this.prisma.identity.$transaction(schedules.map((s) => {
            const { dayOfWeek, ...data } = s;
            return this.prisma.businessHoursSchedule.upsert({
                where: { tenantId_dayOfWeek: { tenantId, dayOfWeek } },
                update: data,
                create: { tenantId, dayOfWeek, ...data },
            });
        }));
    }
    async isHoliday(tenantId, date) {
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);
        const count = await this.prisma.holidayCalendar.count({
            where: { tenantId, isActive: true, date: { gte: startOfDay, lt: endOfDay } },
        });
        return count > 0;
    }
    timeToMinutes(time) {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    }
};
exports.BusinessHoursService = BusinessHoursService;
exports.BusinessHoursService = BusinessHoursService = BusinessHoursService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BusinessHoursService);
//# sourceMappingURL=business-hours.service.js.map