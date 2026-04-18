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
var TargetCalculatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetCalculatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const error_utils_1 = require("../../../../common/utils/error.utils");
let TargetCalculatorService = TargetCalculatorService_1 = class TargetCalculatorService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TargetCalculatorService_1.name);
    }
    async recalculateTargets() {
        const targets = await this.prisma.working.salesTarget.findMany({
            where: { isActive: true, periodEnd: { gte: new Date() } },
        });
        let updated = 0;
        for (const target of targets) {
            try {
                const currentValue = await this.calculateMetric(target.metric, target.periodStart, target.periodEnd, target.userId);
                const targetVal = Number(target.targetValue);
                const achievedPercent = targetVal > 0 ? Math.round((currentValue / targetVal) * 10000) / 100 : 0;
                await this.prisma.working.salesTarget.update({
                    where: { id: target.id },
                    data: { currentValue, achievedPercent, lastCalculatedAt: new Date() },
                });
                updated++;
            }
            catch (error) {
                this.logger.error(`Failed to recalculate target ${target.id}: ${(0, error_utils_1.getErrorMessage)(error)}`);
            }
        }
        if (updated > 0)
            this.logger.log(`Recalculated ${updated} targets`);
    }
    async calculateMetric(metric, start, end, userId) {
        const userFilter = userId ? { allocatedToId: userId } : {};
        const activityUserFilter = userId ? { createdById: userId } : {};
        switch (metric) {
            case 'LEADS_CREATED':
                return this.prisma.working.lead.count({
                    where: { createdAt: { gte: start, lte: end }, ...userFilter },
                });
            case 'LEADS_WON':
                return this.prisma.working.lead.count({
                    where: { status: 'WON', updatedAt: { gte: start, lte: end }, ...userFilter },
                });
            case 'REVENUE': {
                const result = await this.prisma.working.lead.aggregate({
                    where: { status: 'WON', updatedAt: { gte: start, lte: end }, ...userFilter },
                    _sum: { expectedValue: true },
                });
                return Number(result._sum.expectedValue || 0);
            }
            case 'ACTIVITIES':
                return this.prisma.working.activity.count({
                    where: { createdAt: { gte: start, lte: end }, ...activityUserFilter },
                });
            case 'CALLS':
                return this.prisma.working.activity.count({
                    where: { type: 'CALL', createdAt: { gte: start, lte: end }, ...activityUserFilter },
                });
            case 'MEETINGS':
                return this.prisma.working.activity.count({
                    where: { type: 'MEETING', createdAt: { gte: start, lte: end }, ...activityUserFilter },
                });
            case 'VISITS':
                return this.prisma.working.activity.count({
                    where: { type: 'VISIT', createdAt: { gte: start, lte: end }, ...activityUserFilter },
                });
            case 'DEMOS':
                return this.prisma.working.demo.count({
                    where: { status: 'COMPLETED', completedAt: { gte: start, lte: end }, ...(userId ? { conductedById: userId } : {}) },
                });
            case 'QUOTATIONS_SENT':
                return this.prisma.working.quotation.count({
                    where: { status: { not: 'DRAFT' }, createdAt: { gte: start, lte: end }, ...(userId ? { createdById: userId } : {}) },
                });
            case 'QUOTATIONS_ACCEPTED':
                return this.prisma.working.quotation.count({
                    where: { status: 'ACCEPTED', updatedAt: { gte: start, lte: end }, ...(userId ? { createdById: userId } : {}) },
                });
            default:
                return 0;
        }
    }
    async getTargetTracking(params) {
        const where = { isActive: true };
        if (params.period)
            where.period = params.period;
        if (params.dateFrom)
            where.periodStart = { gte: params.dateFrom };
        if (params.dateTo)
            where.periodEnd = { lte: params.dateTo };
        const targets = await this.prisma.working.salesTarget.findMany({ where, orderBy: { achievedPercent: 'desc' } });
        const now = Date.now();
        const mapped = targets.map(t => {
            const targetVal = Number(t.targetValue);
            const currentVal = Number(t.currentValue);
            const achievedPct = Number(t.achievedPercent);
            const totalDays = Math.max(1, (t.periodEnd.getTime() - t.periodStart.getTime()) / 86400000);
            const elapsedDays = Math.max(1, (now - t.periodStart.getTime()) / 86400000);
            const daysLeft = Math.max(0, Math.ceil((t.periodEnd.getTime() - now) / 86400000));
            const projectedValue = elapsedDays > 0 ? Math.round((currentVal / elapsedDays) * totalDays) : 0;
            const projectedPct = targetVal > 0 ? Math.round((projectedValue / targetVal) * 100) : 0;
            let status = 'BEHIND';
            if (achievedPct >= 110)
                status = 'EXCEEDED';
            else if (achievedPct >= 100)
                status = 'ACHIEVED';
            else if (projectedPct >= 90)
                status = 'ON_TRACK';
            else if (projectedPct >= 70)
                status = 'AT_RISK';
            return {
                targetId: t.id, userId: t.userId, metric: t.metric, name: t.name,
                targetValue: targetVal, currentValue: currentVal, achievedPercent: achievedPct,
                remaining: Math.max(0, targetVal - currentVal), daysLeft,
                requiredPerDay: daysLeft > 0 ? Math.round((targetVal - currentVal) / daysLeft) : 0,
                status, projectedValue, projectedAchievement: projectedPct,
            };
        });
        const summary = {
            totalTargets: mapped.length,
            achieved: mapped.filter(t => t.status === 'ACHIEVED' || t.status === 'EXCEEDED').length,
            onTrack: mapped.filter(t => t.status === 'ON_TRACK').length,
            atRisk: mapped.filter(t => t.status === 'AT_RISK').length,
            behind: mapped.filter(t => t.status === 'BEHIND').length,
            overallAchievement: mapped.length > 0 ? Math.round(mapped.reduce((s, t) => s + t.achievedPercent, 0) / mapped.length * 10) / 10 : 0,
        };
        return { targets: mapped, summary };
    }
};
exports.TargetCalculatorService = TargetCalculatorService;
exports.TargetCalculatorService = TargetCalculatorService = TargetCalculatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TargetCalculatorService);
//# sourceMappingURL=target-calculator.service.js.map