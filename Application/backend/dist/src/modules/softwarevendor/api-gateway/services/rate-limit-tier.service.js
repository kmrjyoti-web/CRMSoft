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
var RateLimitTierService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitTierService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let RateLimitTierService = RateLimitTierService_1 = class RateLimitTierService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RateLimitTierService_1.name);
    }
    async getTierForPlan(planCode) {
        return this.prisma.working.rateLimitTier.findUnique({ where: { planCode } });
    }
    async getAllTiers() {
        return this.prisma.working.rateLimitTier.findMany({
            where: { isActive: true },
            orderBy: { requestsPerDay: 'asc' },
        });
    }
    async seedTiers() {
        const tiers = [
            { planCode: 'FREE', planName: 'Free', requestsPerMinute: 10, requestsPerHour: 100, requestsPerDay: 500, maxApiKeys: 1, maxWebhookEndpoints: 2, webhookRatePerMinute: 5, burstLimit: 5 },
            { planCode: 'STARTER', planName: 'Starter', requestsPerMinute: 20, requestsPerHour: 500, requestsPerDay: 5000, maxApiKeys: 3, maxWebhookEndpoints: 5, webhookRatePerMinute: 10, burstLimit: 10 },
            { planCode: 'GROWTH', planName: 'Growth', requestsPerMinute: 50, requestsPerHour: 2000, requestsPerDay: 20000, maxApiKeys: 10, maxWebhookEndpoints: 15, webhookRatePerMinute: 30, burstLimit: 20 },
            { planCode: 'BUSINESS', planName: 'Business', requestsPerMinute: 100, requestsPerHour: 5000, requestsPerDay: 50000, maxApiKeys: 25, maxWebhookEndpoints: 50, webhookRatePerMinute: 60, burstLimit: 50 },
            { planCode: 'ENTERPRISE', planName: 'Enterprise', requestsPerMinute: 500, requestsPerHour: 20000, requestsPerDay: 200000, maxApiKeys: 100, maxWebhookEndpoints: 200, webhookRatePerMinute: 200, burstLimit: 100 },
        ];
        for (const tier of tiers) {
            await this.prisma.working.rateLimitTier.upsert({
                where: { planCode: tier.planCode },
                update: {},
                create: tier,
            });
        }
        this.logger.log('Rate limit tiers seeded');
    }
};
exports.RateLimitTierService = RateLimitTierService;
exports.RateLimitTierService = RateLimitTierService = RateLimitTierService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RateLimitTierService);
//# sourceMappingURL=rate-limit-tier.service.js.map