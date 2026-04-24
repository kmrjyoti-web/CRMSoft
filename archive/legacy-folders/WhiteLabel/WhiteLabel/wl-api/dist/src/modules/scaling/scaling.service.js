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
var ScalingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScalingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const PLAN_LIMITS = {
    STARTER: { maxInstances: 2, scaleUpThreshold: 80, scaleDownThreshold: 20 },
    PROFESSIONAL: { maxInstances: 5, scaleUpThreshold: 75, scaleDownThreshold: 25 },
    ENTERPRISE: { maxInstances: 10, scaleUpThreshold: 70, scaleDownThreshold: 30 },
};
let ScalingService = ScalingService_1 = class ScalingService {
    prisma;
    audit;
    logger = new common_1.Logger(ScalingService_1.name);
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async getOrCreatePolicy(partnerId) {
        const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        const limits = PLAN_LIMITS[partner.plan] ?? PLAN_LIMITS.STARTER;
        return this.prisma.partnerScalingPolicy.upsert({
            where: { partnerId },
            create: {
                partnerId,
                maxInstances: limits.maxInstances,
                minInstances: 1,
                currentInstances: 1,
                scaleUpThreshold: limits.scaleUpThreshold,
                scaleDownThreshold: limits.scaleDownThreshold,
                isAutoScalingEnabled: false,
                cooldownMinutes: 15,
            },
            update: {},
        });
    }
    async updatePolicy(partnerId, dto) {
        await this.getOrCreatePolicy(partnerId);
        return this.prisma.partnerScalingPolicy.update({ where: { partnerId }, data: dto });
    }
    async computeUsageMetric(partnerId) {
        const period = this.getCurrentPeriod();
        const usageLogs = await this.prisma.partnerUsageLog.findMany({ where: { partnerId, period } });
        if (usageLogs.length === 0)
            return 0;
        const totalCharged = usageLogs.reduce((sum, l) => sum + Number(l.totalChargedToPartner), 0);
        const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
        const maxTenants = partner?.maxTenants ?? 10;
        const estimatedCapacity = maxTenants * 1000;
        return Math.min(100, Math.round((totalCharged / estimatedCapacity) * 100));
    }
    async evaluatePartner(partnerId) {
        const policy = await this.getOrCreatePolicy(partnerId);
        if (!policy.isAutoScalingEnabled) {
            return { action: 'DISABLED', metric: 0 };
        }
        const now = new Date();
        if (policy.lastScaledAt) {
            const cooldownMs = policy.cooldownMinutes * 60 * 1000;
            if (now.getTime() - policy.lastScaledAt.getTime() < cooldownMs) {
                return { action: 'COOLDOWN', metric: 0 };
            }
        }
        const usageMetric = await this.computeUsageMetric(partnerId);
        if (usageMetric >= policy.scaleUpThreshold && policy.currentInstances < policy.maxInstances) {
            await this.scaleUp(partnerId, policy, usageMetric);
            return { action: 'SCALE_UP', metric: usageMetric };
        }
        if (usageMetric <= policy.scaleDownThreshold && policy.currentInstances > policy.minInstances) {
            await this.scaleDown(partnerId, policy, usageMetric);
            return { action: 'SCALE_DOWN', metric: usageMetric };
        }
        return { action: 'NO_CHANGE', metric: usageMetric };
    }
    async scaleUp(partnerId, policy, usageMetric) {
        const toInstances = policy.currentInstances + 1;
        await this.prisma.partnerScalingPolicy.update({
            where: { partnerId },
            data: { currentInstances: toInstances, lastScaledAt: new Date() },
        });
        await this.prisma.partnerScalingEvent.create({
            data: {
                partnerId,
                eventType: 'SCALE_UP',
                fromInstances: policy.currentInstances,
                toInstances,
                reason: `Usage at ${usageMetric}% exceeded scale-up threshold`,
                usageMetric,
                triggeredBy: 'auto',
            },
        });
        await this.audit.log({
            partnerId,
            action: 'AUTO_SCALED_UP',
            performedBy: 'system',
            performedByRole: 'SYSTEM',
            details: { from: policy.currentInstances, to: toInstances, usageMetric },
        });
        this.logger.log(`Partner ${partnerId} scaled UP: ${policy.currentInstances} → ${toInstances} (usage: ${usageMetric}%)`);
    }
    async scaleDown(partnerId, policy, usageMetric) {
        const toInstances = policy.currentInstances - 1;
        await this.prisma.partnerScalingPolicy.update({
            where: { partnerId },
            data: { currentInstances: toInstances, lastScaledAt: new Date() },
        });
        await this.prisma.partnerScalingEvent.create({
            data: {
                partnerId,
                eventType: 'SCALE_DOWN',
                fromInstances: policy.currentInstances,
                toInstances,
                reason: `Usage at ${usageMetric}% fell below scale-down threshold`,
                usageMetric,
                triggeredBy: 'auto',
            },
        });
        await this.audit.log({
            partnerId,
            action: 'AUTO_SCALED_DOWN',
            performedBy: 'system',
            performedByRole: 'SYSTEM',
            details: { from: policy.currentInstances, to: toInstances, usageMetric },
        });
        this.logger.log(`Partner ${partnerId} scaled DOWN: ${policy.currentInstances} → ${toInstances} (usage: ${usageMetric}%)`);
    }
    async evaluateAll() {
        const partners = await this.prisma.whiteLabelPartner.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, companyName: true },
        });
        for (const partner of partners) {
            try {
                const result = await this.evaluatePartner(partner.id);
                if (result.action !== 'NO_CHANGE' && result.action !== 'DISABLED' && result.action !== 'COOLDOWN') {
                    this.logger.log(`${partner.companyName}: ${result.action} at ${result.metric}%`);
                }
            }
            catch (err) {
                this.logger.error(`Failed to evaluate scaling for ${partner.companyName}`, err instanceof Error ? err.stack : String(err));
            }
        }
    }
    async getScalingHistory(partnerId, limit = 20) {
        return this.prisma.partnerScalingEvent.findMany({
            where: { partnerId },
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
    }
    async getScalingDashboard() {
        const [totalScaleUps, totalScaleDowns, enabledPolicies, recentEvents] = await Promise.all([
            this.prisma.partnerScalingEvent.count({ where: { eventType: 'SCALE_UP' } }),
            this.prisma.partnerScalingEvent.count({ where: { eventType: 'SCALE_DOWN' } }),
            this.prisma.partnerScalingPolicy.count({ where: { isAutoScalingEnabled: true } }),
            this.prisma.partnerScalingEvent.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { partner: { select: { companyName: true } } },
            }),
        ]);
        const allPolicies = await this.prisma.partnerScalingPolicy.findMany({
            include: { partner: { select: { companyName: true, plan: true } } },
        });
        return { totalScaleUps, totalScaleDowns, enabledPolicies, recentEvents, allPolicies };
    }
    getCurrentPeriod() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
};
exports.ScalingService = ScalingService;
exports.ScalingService = ScalingService = ScalingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], ScalingService);
//# sourceMappingURL=scaling.service.js.map