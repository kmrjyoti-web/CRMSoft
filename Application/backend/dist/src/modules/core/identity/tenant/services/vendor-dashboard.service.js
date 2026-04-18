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
var VendorDashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorDashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let VendorDashboardService = VendorDashboardService_1 = class VendorDashboardService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(VendorDashboardService_1.name);
    }
    async getOverview(days = 30) {
        const periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - days);
        const [totalTenants, activeTenants, trialTenants, suspendedTenants] = await Promise.all([
            this.prisma.identity.tenant.count(),
            this.prisma.identity.tenant.count({ where: { status: 'ACTIVE' } }),
            this.prisma.identity.tenant.count({ where: { status: 'TRIAL' } }),
            this.prisma.identity.tenant.count({ where: { status: 'SUSPENDED' } }),
        ]);
        const activeSubscriptions = await this.prisma.identity.subscription.findMany({
            where: { status: 'ACTIVE' },
            include: { plan: { select: { price: true, interval: true } } },
        });
        let mrr = 0;
        for (const sub of activeSubscriptions) {
            const price = Number(sub.plan.price);
            switch (sub.plan.interval) {
                case 'MONTHLY':
                    mrr += price;
                    break;
                case 'QUARTERLY':
                    mrr += price / 3;
                    break;
                case 'YEARLY':
                    mrr += price / 12;
                    break;
                default:
                    mrr += price;
            }
        }
        const arr = mrr * 12;
        const newTenants = await this.prisma.identity.tenant.count({
            where: { createdAt: { gte: periodStart } },
        });
        const cancelledInPeriod = await this.prisma.identity.subscription.count({
            where: {
                status: 'CANCELLED',
                cancelledAt: { gte: periodStart },
            },
        });
        const activeAtPeriodStart = await this.prisma.identity.subscription.count({
            where: {
                createdAt: { lt: periodStart },
                OR: [
                    { status: 'ACTIVE' },
                    { status: 'CANCELLED', cancelledAt: { gte: periodStart } },
                ],
            },
        });
        const churnRate = activeAtPeriodStart > 0
            ? Math.round((cancelledInPeriod / activeAtPeriodStart) * 10000) / 100
            : 0;
        return {
            totalTenants,
            activeTenants,
            trialTenants,
            suspendedTenants,
            mrr: Math.round(mrr * 100) / 100,
            arr: Math.round(arr * 100) / 100,
            newTenants,
            churnRate,
        };
    }
    async getMRR(days = 180) {
        const periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - days);
        const subscriptions = await this.prisma.identity.subscription.findMany({
            where: {
                createdAt: { lte: new Date() },
                OR: [
                    { status: 'ACTIVE' },
                    { status: 'TRIALING' },
                    { status: 'CANCELLED', cancelledAt: { gte: periodStart } },
                ],
            },
            include: { plan: { select: { price: true, interval: true } } },
        });
        const mrrByMonth = {};
        const currentDate = new Date();
        for (let d = new Date(periodStart); d <= currentDate; d.setMonth(d.getMonth() + 1)) {
            const monthKey = d.toISOString().slice(0, 7);
            mrrByMonth[monthKey] = 0;
        }
        for (const monthKey of Object.keys(mrrByMonth)) {
            const monthStart = new Date(`${monthKey}-01T00:00:00.000Z`);
            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            for (const sub of subscriptions) {
                const subStart = sub.createdAt;
                const subEnd = sub.cancelledAt ?? new Date('2099-12-31');
                if (subStart < monthEnd && subEnd >= monthStart) {
                    const price = Number(sub.plan.price);
                    switch (sub.plan.interval) {
                        case 'MONTHLY':
                            mrrByMonth[monthKey] += price;
                            break;
                        case 'QUARTERLY':
                            mrrByMonth[monthKey] += price / 3;
                            break;
                        case 'YEARLY':
                            mrrByMonth[monthKey] += price / 12;
                            break;
                        default:
                            mrrByMonth[monthKey] += price;
                    }
                }
            }
        }
        return Object.entries(mrrByMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, mrr]) => ({
            month,
            mrr: Math.round(mrr * 100) / 100,
        }));
    }
    async getTenantGrowth(days = 90) {
        const periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - days);
        const tenants = await this.prisma.identity.tenant.findMany({
            where: { createdAt: { gte: periodStart } },
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' },
        });
        const countsByDate = {};
        for (const tenant of tenants) {
            const dateKey = tenant.createdAt.toISOString().slice(0, 10);
            countsByDate[dateKey] = (countsByDate[dateKey] ?? 0) + 1;
        }
        const result = [];
        for (let d = new Date(periodStart); d <= new Date(); d.setDate(d.getDate() + 1)) {
            const dateKey = d.toISOString().slice(0, 10);
            result.push({ date: dateKey, count: countsByDate[dateKey] ?? 0 });
        }
        return result;
    }
    async getPlanDistribution() {
        const subscriptions = await this.prisma.identity.subscription.findMany({
            where: { status: { in: ['ACTIVE', 'TRIALING'] } },
            include: { plan: { select: { name: true, code: true } } },
        });
        const planCounts = {};
        for (const sub of subscriptions) {
            const key = sub.plan.code;
            if (!planCounts[key]) {
                planCounts[key] = {
                    planName: sub.plan.name,
                    planCode: sub.plan.code,
                    count: 0,
                };
            }
            planCounts[key].count++;
        }
        const total = subscriptions.length;
        return Object.values(planCounts).map((entry) => ({
            planName: entry.planName,
            planCode: entry.planCode,
            count: entry.count,
            percentage: total > 0 ? Math.round((entry.count / total) * 10000) / 100 : 0,
        }));
    }
    async getRevenueByPlan(days = 30) {
        const periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - days);
        const invoices = await this.prisma.identity.tenantInvoice.findMany({
            where: {
                createdAt: { gte: periodStart },
                status: { in: ['PAID', 'PENDING'] },
            },
            select: {
                tenantId: true,
                total: true,
            },
        });
        const subscriptions = await this.prisma.identity.subscription.findMany({
            where: {
                status: { in: ['ACTIVE', 'TRIALING'] },
            },
            include: { plan: { select: { name: true, code: true } } },
        });
        const tenantPlanMap = {};
        for (const sub of subscriptions) {
            tenantPlanMap[sub.tenantId] = {
                planName: sub.plan.name,
                planCode: sub.plan.code,
            };
        }
        const revenueByPlan = {};
        for (const inv of invoices) {
            const plan = tenantPlanMap[inv.tenantId];
            if (!plan)
                continue;
            const key = plan.planCode;
            if (!revenueByPlan[key]) {
                revenueByPlan[key] = {
                    planName: plan.planName,
                    revenue: 0,
                    invoiceCount: 0,
                };
            }
            revenueByPlan[key].revenue += Number(inv.total);
            revenueByPlan[key].invoiceCount++;
        }
        return Object.values(revenueByPlan).map((entry) => ({
            planName: entry.planName,
            revenue: Math.round(entry.revenue * 100) / 100,
            invoiceCount: entry.invoiceCount,
        }));
    }
};
exports.VendorDashboardService = VendorDashboardService;
exports.VendorDashboardService = VendorDashboardService = VendorDashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorDashboardService);
//# sourceMappingURL=vendor-dashboard.service.js.map