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
var UsageTrackerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageTrackerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const RESOURCE_MODELS = {
    users: 'user',
    contacts: 'contact',
    leads: 'lead',
    products: 'product',
    organizations: 'organization',
    invoices: 'invoice',
    quotations: 'quotation',
    activities: 'activity',
    demos: 'demo',
    tour_plans: 'tourPlan',
    workflows: 'workflow',
    documents: 'document',
    tickets: 'ticket',
    installations: 'installation',
    trainings: 'training',
};
let UsageTrackerService = UsageTrackerService_1 = class UsageTrackerService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UsageTrackerService_1.name);
    }
    async recalculate(tenantId) {
        const counts = {};
        const countPromises = Object.entries(RESOURCE_MODELS).map(async ([resourceKey, modelName]) => {
            try {
                const model = this.prisma[modelName];
                if (model && typeof model.count === 'function') {
                    counts[resourceKey] = await model.count({ where: { tenantId } });
                }
                else {
                    counts[resourceKey] = 0;
                }
            }
            catch {
                counts[resourceKey] = 0;
            }
        });
        await Promise.all(countPromises);
        const currentMonth = new Date().toISOString().slice(0, 7);
        await this.prisma.identity.tenantUsage.upsert({
            where: { tenantId },
            update: {
                usersCount: counts.users ?? 0,
                contactsCount: counts.contacts ?? 0,
                leadsCount: counts.leads ?? 0,
                productsCount: counts.products ?? 0,
                lastCalculated: new Date(),
            },
            create: {
                tenantId,
                usersCount: counts.users ?? 0,
                contactsCount: counts.contacts ?? 0,
                leadsCount: counts.leads ?? 0,
                productsCount: counts.products ?? 0,
                lastCalculated: new Date(),
            },
        });
        const detailUpserts = Object.entries(counts).map(([resourceKey, currentCount]) => this.prisma.platform.tenantUsageDetail.upsert({
            where: { tenantId_resourceKey: { tenantId, resourceKey } },
            update: {
                currentCount,
                lastUpdated: new Date(),
            },
            create: {
                tenantId,
                resourceKey,
                currentCount,
                monthlyCount: 0,
                monthYear: currentMonth,
                lastUpdated: new Date(),
            },
        }));
        await Promise.all(detailUpserts);
        this.logger.log(`Usage recalculated for tenant ${tenantId}: ${Object.entries(counts)
            .filter(([, v]) => v > 0)
            .map(([k, v]) => `${k}=${v}`)
            .join(', ')}`);
    }
    async incrementUsage(tenantId, resourceKey) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const existing = await this.prisma.platform.tenantUsageDetail.findUnique({
            where: { tenantId_resourceKey: { tenantId, resourceKey } },
        });
        if (existing) {
            const monthlyCount = existing.monthYear === currentMonth
                ? existing.monthlyCount + 1
                : 1;
            await this.prisma.platform.tenantUsageDetail.update({
                where: { tenantId_resourceKey: { tenantId, resourceKey } },
                data: {
                    currentCount: { increment: 1 },
                    monthlyCount,
                    monthYear: currentMonth,
                    lastUpdated: new Date(),
                },
            });
        }
        else {
            await this.prisma.platform.tenantUsageDetail.create({
                data: {
                    tenantId,
                    resourceKey,
                    currentCount: 1,
                    monthlyCount: 1,
                    monthYear: currentMonth,
                    lastUpdated: new Date(),
                },
            });
        }
        const legacyField = this.getLegacyField(resourceKey);
        if (legacyField) {
            await this.prisma.identity.tenantUsage.updateMany({
                where: { tenantId },
                data: { [legacyField]: { increment: 1 } },
            });
        }
    }
    async decrementUsage(tenantId, resourceKey) {
        const existing = await this.prisma.platform.tenantUsageDetail.findUnique({
            where: { tenantId_resourceKey: { tenantId, resourceKey } },
        });
        if (existing && existing.currentCount > 0) {
            await this.prisma.platform.tenantUsageDetail.update({
                where: { tenantId_resourceKey: { tenantId, resourceKey } },
                data: {
                    currentCount: { decrement: 1 },
                    lastUpdated: new Date(),
                },
            });
        }
        const legacyField = this.getLegacyField(resourceKey);
        if (legacyField) {
            await this.prisma.identity.tenantUsage.updateMany({
                where: { tenantId },
                data: { [legacyField]: { decrement: 1 } },
            });
        }
    }
    async getUsageDetails(tenantId) {
        return this.prisma.platform.tenantUsageDetail.findMany({
            where: { tenantId },
            orderBy: { resourceKey: 'asc' },
        });
    }
    async resetMonthlyCounts(tenantId) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const where = tenantId
            ? { tenantId, monthYear: { not: currentMonth } }
            : { monthYear: { not: currentMonth } };
        await this.prisma.platform.tenantUsageDetail.updateMany({
            where,
            data: { monthlyCount: 0, monthYear: currentMonth },
        });
    }
    getLegacyField(resourceKey) {
        const map = {
            users: 'usersCount',
            contacts: 'contactsCount',
            leads: 'leadsCount',
            products: 'productsCount',
        };
        return map[resourceKey] ?? null;
    }
};
exports.UsageTrackerService = UsageTrackerService;
exports.UsageTrackerService = UsageTrackerService = UsageTrackerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsageTrackerService);
//# sourceMappingURL=usage-tracker.service.js.map