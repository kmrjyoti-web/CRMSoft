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
exports.AMCScheduleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let AMCScheduleService = class AMCScheduleService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, filters) {
        return this.prisma.working.aMCSchedule.findMany({
            where: {
                tenantId,
                ...(filters?.status && { status: filters.status }),
                ...(filters?.from || filters?.to
                    ? {
                        scheduleDate: {
                            ...(filters.from && { gte: filters.from }),
                            ...(filters.to && { lte: filters.to }),
                        },
                    }
                    : {}),
            },
            include: { contract: { include: { plan: true } } },
            orderBy: { scheduleDate: 'asc' },
        });
    }
    async complete(tenantId, id, dto) {
        const schedule = await this.prisma.working.aMCSchedule.findFirst({ where: { id, tenantId } });
        if (!schedule)
            throw new common_1.NotFoundException('Schedule not found');
        return this.prisma.working.aMCSchedule.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completedDate: dto.completedDate ?? new Date(),
                serviceNotes: dto.serviceNotes,
                partsUsed: dto.partsUsed,
                customerSignature: dto.customerSignature,
                nextScheduleDate: dto.nextScheduleDate,
                usageAtVisit: dto.usageAtVisit,
                assignedToId: dto.assignedToId,
                assignedToName: dto.assignedToName,
            },
        });
    }
    async reschedule(tenantId, id, newDate) {
        const schedule = await this.prisma.working.aMCSchedule.findFirst({ where: { id, tenantId } });
        if (!schedule)
            throw new common_1.NotFoundException('Schedule not found');
        return this.prisma.working.aMCSchedule.update({
            where: { id },
            data: { scheduleDate: newDate, status: 'RESCHEDULED' },
        });
    }
};
exports.AMCScheduleService = AMCScheduleService;
exports.AMCScheduleService = AMCScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AMCScheduleService);
//# sourceMappingURL=amc-schedule.service.js.map