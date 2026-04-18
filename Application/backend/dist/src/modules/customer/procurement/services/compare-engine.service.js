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
exports.CompareEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let CompareEngineService = class CompareEngineService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async compareQuotations(tenantId, rfqId, weights) {
        const w = {
            priceWeight: weights?.priceWeight ?? 40,
            deliveryWeight: weights?.deliveryWeight ?? 25,
            creditWeight: weights?.creditWeight ?? 20,
            qualityWeight: weights?.qualityWeight ?? 15,
        };
        const totalWeight = w.priceWeight + w.deliveryWeight + w.creditWeight + w.qualityWeight;
        w.priceWeight = (w.priceWeight / totalWeight) * 100;
        w.deliveryWeight = (w.deliveryWeight / totalWeight) * 100;
        w.creditWeight = (w.creditWeight / totalWeight) * 100;
        w.qualityWeight = (w.qualityWeight / totalWeight) * 100;
        const quotations = await this.prisma.working.purchaseQuotation.findMany({
            where: { tenantId, rfqId, status: { in: ['RECEIVED', 'UNDER_REVIEW'] } },
            include: { items: true },
        });
        if (quotations.length < 2) {
            throw new common_1.BadRequestException('At least 2 quotations required for comparison');
        }
        const metrics = quotations.map((q) => ({
            quotationId: q.id,
            vendorId: q.vendorId,
            grandTotal: q.grandTotal?.toNumber() ?? 0,
            deliveryDays: q.deliveryDays ?? 30,
            creditDays: q.creditDays ?? 0,
        }));
        const prices = metrics.map((m) => m.grandTotal);
        const deliveries = metrics.map((m) => m.deliveryDays);
        const credits = metrics.map((m) => m.creditDays);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const minDelivery = Math.min(...deliveries);
        const maxDelivery = Math.max(...deliveries);
        const minCredit = Math.min(...credits);
        const maxCredit = Math.max(...credits);
        const scores = metrics.map((m) => {
            const priceScore = maxPrice === minPrice ? 100
                : 100 - ((m.grandTotal - minPrice) / (maxPrice - minPrice)) * 100;
            const deliveryScore = maxDelivery === minDelivery ? 100
                : 100 - ((m.deliveryDays - minDelivery) / (maxDelivery - minDelivery)) * 100;
            const creditScore = maxCredit === minCredit ? 100
                : ((m.creditDays - minCredit) / (maxCredit - minCredit)) * 100;
            const qualityScore = 75;
            const totalScore = (priceScore * (w.priceWeight / 100) +
                deliveryScore * (w.deliveryWeight / 100) +
                creditScore * (w.creditWeight / 100) +
                qualityScore * (w.qualityWeight / 100));
            return {
                quotationId: m.quotationId,
                vendorId: m.vendorId,
                priceScore: Math.round(priceScore * 10) / 10,
                deliveryScore: Math.round(deliveryScore * 10) / 10,
                creditScore: Math.round(creditScore * 10) / 10,
                qualityScore,
                totalScore: Math.round(totalScore * 10) / 10,
                grandTotal: m.grandTotal,
                deliveryDays: m.deliveryDays,
                creditDays: m.creditDays,
            };
        });
        scores.sort((a, b) => b.totalScore - a.totalScore);
        const comparison = await this.prisma.working.quotationComparison.create({
            data: {
                tenantId,
                rfqId,
                compareBy: 'WEIGHTED_SCORE',
                customWeights: w,
                comparisonData: scores,
                selectedQuotationId: scores[0].quotationId,
                status: 'COMPLETED',
                createdById: '',
            },
        });
        return { comparison, scores, weights: w };
    }
    async getComparison(tenantId, id) {
        const comparison = await this.prisma.working.quotationComparison.findFirst({
            where: { id, tenantId },
        });
        if (!comparison)
            throw new common_1.NotFoundException('Comparison not found');
        return comparison;
    }
    async listByRfq(tenantId, rfqId) {
        return this.prisma.working.quotationComparison.findMany({
            where: { tenantId, rfqId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async selectWinner(tenantId, comparisonId, quotationId, remarks) {
        const comparison = await this.prisma.working.quotationComparison.findFirst({
            where: { id: comparisonId, tenantId },
        });
        if (!comparison)
            throw new common_1.NotFoundException('Comparison not found');
        await this.prisma.working.quotationComparison.update({
            where: { id: comparisonId },
            data: { selectedQuotationId: quotationId },
        });
        await this.prisma.working.purchaseQuotation.update({
            where: { id: quotationId },
            data: { status: 'ACCEPTED' },
        });
        await this.prisma.working.purchaseQuotation.updateMany({
            where: {
                tenantId,
                rfqId: comparison.rfqId,
                id: { not: quotationId },
                status: { in: ['RECEIVED', 'UNDER_REVIEW'] },
            },
            data: { status: 'REJECTED' },
        });
        return this.getComparison(tenantId, comparisonId);
    }
};
exports.CompareEngineService = CompareEngineService;
exports.CompareEngineService = CompareEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompareEngineService);
//# sourceMappingURL=compare-engine.service.js.map