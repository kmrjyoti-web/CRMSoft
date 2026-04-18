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
exports.LimitCheckerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let LimitCheckerService = class LimitCheckerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkResource(tenantId, resourceKey) {
        const subscription = await this.prisma.identity.subscription.findFirst({
            where: { tenantId, status: { in: ['ACTIVE', 'TRIALING'] } },
            include: {
                plan: {
                    include: { limits: { where: { resourceKey } } },
                },
            },
        });
        if (!subscription) {
            return { allowed: false, current: 0, limit: 0, limitType: 'DISABLED', isChargeable: false, chargeTokens: 0 };
        }
        const planLimit = subscription.plan.limits[0];
        if (planLimit) {
            if (planLimit.limitType === 'DISABLED') {
                return { allowed: false, current: 0, limit: 0, limitType: 'DISABLED', isChargeable: false, chargeTokens: 0 };
            }
            if (planLimit.limitType === 'UNLIMITED') {
                return { allowed: true, current: 0, limit: -1, limitType: 'UNLIMITED', isChargeable: planLimit.isChargeable, chargeTokens: planLimit.chargeTokens };
            }
            const usageDetail = await this.prisma.platform.tenantUsageDetail.findUnique({
                where: { tenantId_resourceKey: { tenantId, resourceKey } },
            });
            const currentMonth = new Date().toISOString().slice(0, 7);
            let current = 0;
            if (planLimit.limitType === 'MONTHLY') {
                current = usageDetail && usageDetail.monthYear === currentMonth
                    ? usageDetail.monthlyCount
                    : 0;
            }
            else {
                current = usageDetail?.currentCount ?? 0;
            }
            return {
                allowed: current < planLimit.limitValue,
                current,
                limit: planLimit.limitValue,
                limitType: planLimit.limitType,
                isChargeable: planLimit.isChargeable,
                chargeTokens: planLimit.chargeTokens,
            };
        }
        const legacyMap = {
            users: 'maxUsers',
            contacts: 'maxContacts',
            leads: 'maxLeads',
            products: 'maxProducts',
        };
        const planField = legacyMap[resourceKey];
        if (!planField) {
            return { allowed: true, current: 0, limit: -1, limitType: 'UNLIMITED', isChargeable: false, chargeTokens: 0 };
        }
        const usage = await this.prisma.identity.tenantUsage.findUnique({ where: { tenantId } });
        const plan = subscription.plan;
        const countMap = {
            users: usage?.usersCount ?? 0,
            contacts: usage?.contactsCount ?? 0,
            leads: usage?.leadsCount ?? 0,
            products: usage?.productsCount ?? 0,
        };
        const limitMap = {
            maxUsers: plan.maxUsers,
            maxContacts: plan.maxContacts,
            maxLeads: plan.maxLeads,
            maxProducts: plan.maxProducts,
        };
        const current = countMap[resourceKey] ?? 0;
        const limit = limitMap[planField] ?? 0;
        return { allowed: current < limit, current, limit, limitType: 'TOTAL', isChargeable: false, chargeTokens: 0 };
    }
    async canCreate(tenantId, resource) {
        const result = await this.checkResource(tenantId, resource);
        return { allowed: result.allowed, current: result.current, limit: result.limit };
    }
    async hasFeature(tenantId, feature) {
        const subscription = await this.prisma.identity.subscription.findFirst({
            where: { tenantId, status: { in: ['ACTIVE', 'TRIALING'] } },
            include: { plan: true },
        });
        if (!subscription)
            return false;
        return subscription.plan.features.includes(feature);
    }
    async getAllLimitsWithUsage(tenantId) {
        const subscription = await this.prisma.identity.subscription.findFirst({
            where: { tenantId, status: { in: ['ACTIVE', 'TRIALING'] } },
            include: {
                plan: { include: { limits: true } },
            },
        });
        if (!subscription) {
            return { planName: '', limits: [] };
        }
        const usageDetails = await this.prisma.platform.tenantUsageDetail.findMany({
            where: { tenantId },
        });
        const usageMap = new Map(usageDetails.map((u) => [u.resourceKey, u]));
        const currentMonth = new Date().toISOString().slice(0, 7);
        const limits = subscription.plan.limits.map((pl) => {
            const usage = usageMap.get(pl.resourceKey);
            let current = 0;
            if (pl.limitType === 'MONTHLY') {
                current = usage && usage.monthYear === currentMonth ? usage.monthlyCount : 0;
            }
            else if (pl.limitType === 'TOTAL') {
                current = usage?.currentCount ?? 0;
            }
            return {
                resourceKey: pl.resourceKey,
                allowed: pl.limitType === 'DISABLED' ? false : pl.limitType === 'UNLIMITED' ? true : current < pl.limitValue,
                current,
                limit: pl.limitType === 'UNLIMITED' ? -1 : pl.limitValue,
                limitType: pl.limitType,
                isChargeable: pl.isChargeable,
                chargeTokens: pl.chargeTokens,
            };
        });
        return { planName: subscription.plan.name, limits };
    }
};
exports.LimitCheckerService = LimitCheckerService;
exports.LimitCheckerService = LimitCheckerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LimitCheckerService);
//# sourceMappingURL=limit-checker.service.js.map