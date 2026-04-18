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
var HolidayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HolidayService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const app_error_1 = require("../../../../../common/errors/app-error");
let HolidayService = HolidayService_1 = class HolidayService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(HolidayService_1.name);
    }
    async create(tenantId, data) {
        return this.prisma.holidayCalendar.create({
            data: {
                tenantId,
                name: data.name,
                date: new Date(data.date),
                type: data.type ?? 'COMPANY',
                isRecurring: data.isRecurring ?? false,
                applicableStates: data.applicableStates ?? [],
                isHalfDay: data.isHalfDay ?? false,
                halfDayEnd: data.halfDayEnd,
                description: data.description,
            },
        });
    }
    async list(tenantId, year, type) {
        const where = { tenantId, isActive: true };
        if (year) {
            where.date = {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`),
            };
        }
        if (type)
            where.type = type;
        return this.prisma.holidayCalendar.findMany({ where, orderBy: { date: 'asc' } });
    }
    async upcoming(tenantId, limit = 10) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.prisma.holidayCalendar.findMany({
            where: { tenantId, isActive: true, date: { gte: today } },
            orderBy: { date: 'asc' },
            take: limit,
        });
    }
    async update(tenantId, id, data) {
        const holiday = await this.prisma.holidayCalendar.findFirst({ where: { id, tenantId } });
        if (!holiday)
            throw app_error_1.AppError.from('NOT_FOUND');
        const { date, ...rest } = data;
        return this.prisma.holidayCalendar.update({
            where: { id },
            data: { ...rest, ...(date ? { date: new Date(date) } : {}) },
        });
    }
    async remove(tenantId, id) {
        const holiday = await this.prisma.holidayCalendar.findFirst({ where: { id, tenantId } });
        if (!holiday)
            throw app_error_1.AppError.from('NOT_FOUND');
        await this.prisma.holidayCalendar.update({ where: { id }, data: { isActive: false } });
    }
    async isHoliday(tenantId, date, state) {
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);
        const holidays = await this.prisma.holidayCalendar.findMany({
            where: { tenantId, isActive: true, date: { gte: startOfDay, lt: endOfDay } },
        });
        for (const h of holidays) {
            if (h.type === 'REGIONAL' && state) {
                if (h.applicableStates.includes(state))
                    return true;
            }
            else if (h.type !== 'REGIONAL') {
                return true;
            }
        }
        return false;
    }
};
exports.HolidayService = HolidayService;
exports.HolidayService = HolidayService = HolidayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HolidayService);
//# sourceMappingURL=holiday.service.js.map