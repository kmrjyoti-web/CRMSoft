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
exports.CalendarHighlightsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
let CalendarHighlightsService = class CalendarHighlightsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getHighlights(tenantId, from, to, types) {
        const where = {
            date: {
                gte: new Date(from),
                lte: new Date(to),
            },
            isActive: true,
            OR: [
                { tenantId: null },
                { tenantId },
            ],
        };
        if (types?.length) {
            where.highlightType = { in: types };
        }
        return this.prisma.working.calendarHighlight.findMany({
            where,
            orderBy: { date: 'asc' },
        });
    }
    async getHolidays(tenantId, year) {
        const from = new Date(`${year}-01-01`);
        const to = new Date(`${year}-12-31`);
        return this.prisma.working.calendarHighlight.findMany({
            where: {
                date: { gte: from, lte: to },
                isHoliday: true,
                isActive: true,
                OR: [
                    { tenantId: null },
                    { tenantId },
                ],
            },
            orderBy: { date: 'asc' },
        });
    }
    async create(tenantId, data) {
        return this.prisma.working.calendarHighlight.create({
            data: {
                tenantId,
                date: new Date(data.date),
                title: data.title,
                highlightType: data.highlightType,
                color: data.color ?? '#7C3AED',
                isHoliday: data.isHoliday ?? false,
                isRecurring: data.isRecurring ?? false,
                recurringType: data.recurringType,
                industryCode: data.industryCode,
                stateCode: data.stateCode,
            },
        });
    }
};
exports.CalendarHighlightsService = CalendarHighlightsService;
exports.CalendarHighlightsService = CalendarHighlightsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalendarHighlightsService);
//# sourceMappingURL=calendar-highlights.service.js.map