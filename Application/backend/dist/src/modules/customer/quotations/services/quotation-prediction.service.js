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
exports.QuotationPredictionService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const cross_db_resolver_service_1 = require("../../../../core/prisma/cross-db-resolver.service");
let QuotationPredictionService = class QuotationPredictionService {
    constructor(prisma, resolver) {
        this.prisma = prisma;
        this.resolver = resolver;
    }
    async predict(leadId) {
        const rawLead = await this.prisma.working.lead.findUnique({
            where: { id: leadId },
            include: {
                contact: { select: { designation: true, department: true } },
                organization: { select: { industry: true, city: true, state: true } },
                filters: true,
            },
        });
        if (!rawLead)
            throw new common_2.NotFoundException('Lead not found');
        const enrichedFilters = await this.resolver.resolveLookupValues(rawLead.filters || [], 'lookupValueId', true);
        const lead = { ...rawLead, filters: enrichedFilters };
        const industry = lead.organization?.industry || 'Unknown';
        const expectedValue = lead.expectedValue ? Number(lead.expectedValue) : 0;
        const valueLow = expectedValue * 0.7;
        const valueHigh = expectedValue * 1.3;
        const similarLeads = await this.prisma.working.lead.findMany({
            where: {
                id: { not: leadId },
                status: { in: ['WON', 'LOST'] },
                organization: industry !== 'Unknown' ? { industry } : undefined,
                expectedValue: expectedValue > 0 ? { gte: valueLow, lte: valueHigh } : undefined,
            },
            include: {
                quotations: {
                    select: {
                        id: true, status: true, totalAmount: true, discountValue: true,
                        priceType: true, paymentTerms: true, acceptedAt: true, createdAt: true,
                        rejectedReason: true,
                        lineItems: { select: { productId: true, productName: true } },
                    },
                },
            },
            take: 50,
        });
        const acceptedQuotations = similarLeads.flatMap((l) => l.quotations.filter((q) => q.status === 'ACCEPTED'));
        const rejectedQuotations = similarLeads.flatMap((l) => l.quotations.filter((q) => q.status === 'REJECTED'));
        const avgAcceptedDiscount = this.avg(acceptedQuotations.map((q) => Number(q.discountValue || 0)));
        const avgAcceptedValue = this.avg(acceptedQuotations.map((q) => Number(q.totalAmount)));
        const avgRejectedValue = this.avg(rejectedQuotations.map((q) => Number(q.totalAmount)));
        const productCounts = {};
        for (const q of acceptedQuotations) {
            for (const item of q.lineItems) {
                const key = item.productId || item.productName;
                if (!productCounts[key])
                    productCounts[key] = { count: 0, id: item.productId || '', name: item.productName };
                productCounts[key].count++;
            }
        }
        const topProducts = Object.values(productCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map((p) => ({ productId: p.id, name: p.name, reason: `Appeared in ${p.count} won deals` }));
        const closeTimes = acceptedQuotations
            .filter((q) => q.acceptedAt && q.createdAt)
            .map((q) => (q.acceptedAt.getTime() - q.createdAt.getTime()) / 86400000);
        const avgTimeToClose = closeTimes.length > 0 ? Math.round(this.avg(closeTimes)) : 14;
        let score = 50;
        if (lead.priority === 'URGENT')
            score += 15;
        else if (lead.priority === 'HIGH')
            score += 12;
        else if (lead.priority === 'MEDIUM')
            score += 8;
        else
            score += 3;
        const totalSimilar = acceptedQuotations.length + rejectedQuotations.length;
        if (totalSimilar > 0) {
            const industryRate = acceptedQuotations.length / totalSimilar;
            score += Math.round(industryRate * 15);
        }
        if (expectedValue > 0 && avgAcceptedValue > 0) {
            const ratio = expectedValue / avgAcceptedValue;
            if (ratio >= 0.8 && ratio <= 1.2)
                score += 10;
        }
        const designation = lead.contact?.designation?.toLowerCase() || '';
        if (['ceo', 'cto', 'cfo', 'director', 'vp', 'president'].some((t) => designation.includes(t))) {
            score += 10;
        }
        else if (['manager', 'head', 'lead'].some((t) => designation.includes(t))) {
            score += 5;
        }
        if (!lead.organization)
            score -= 10;
        const filters = lead.filters.map((f) => f.lookupValue.value.toLowerCase());
        if (filters.includes('cold'))
            score -= 15;
        score = Math.max(0, Math.min(100, score));
        const warnings = [];
        if (avgRejectedValue > 0 && expectedValue > avgRejectedValue) {
            warnings.push(`Similar leads rejected quotations above ?${Math.round(avgRejectedValue).toLocaleString()}`);
        }
        if (rejectedQuotations.length > acceptedQuotations.length) {
            warnings.push('More similar deals were lost than won � consider competitive pricing');
        }
        if (!lead.organization) {
            warnings.push('No organization linked � conversion rates are typically lower');
        }
        const confidence = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
        const discountSweet = avgAcceptedDiscount > 0 ? Math.round(avgAcceptedDiscount) : 8;
        return {
            score, confidence,
            recommendations: {
                suggestedProducts: topProducts,
                suggestedPriceRange: avgAcceptedValue > 0
                    ? { min: Math.round(avgAcceptedValue * 0.85), max: Math.round(avgAcceptedValue * 1.15), optimal: Math.round(avgAcceptedValue) }
                    : null,
                suggestedDiscount: { min: Math.max(0, discountSweet - 3), max: discountSweet + 5, sweet_spot: discountSweet },
                suggestedPriceType: acceptedQuotations.some((q) => q.priceType === 'RANGE') ? 'RANGE' : 'FIXED',
                suggestedPaymentTerms: this.mostCommon(acceptedQuotations.map((q) => q.paymentTerms).filter(Boolean)) || '50% advance, 50% on delivery',
                suggestedValidityDays: 30,
                estimatedTimeToClose: avgTimeToClose,
            },
            warnings,
            similarDeals: similarLeads.slice(0, 5).map((l) => ({
                leadNumber: l.leadNumber, status: l.status,
                quotations: l.quotations.map((q) => ({
                    quotationNo: undefined, status: q.status,
                    value: Number(q.totalAmount), daysToClose: q.acceptedAt && q.createdAt
                        ? Math.round((q.acceptedAt.getTime() - q.createdAt.getTime()) / 86400000) : null,
                })),
            })),
        };
    }
    async getQuestions(leadId) {
        const lead = await this.prisma.working.lead.findUnique({
            where: { id: leadId },
            include: { organization: true, contact: true },
        });
        if (!lead)
            throw new common_2.NotFoundException('Lead not found');
        const questions = [];
        if (!lead.expectedValue) {
            questions.push({
                id: 'budget', question: "What is the customer's budget range?",
                type: 'RANGE', required: true,
                reason: 'Budget info improves prediction accuracy by 25%',
            });
        }
        if (!lead.expectedCloseDate) {
            questions.push({
                id: 'timeline', question: 'When does the customer need this?',
                type: 'SELECT', options: ['Immediate', '1-3 months', '3-6 months', '6+ months'],
                required: true, reason: 'Urgency affects pricing strategy',
            });
        }
        questions.push({
            id: 'competitor', question: 'Is the customer evaluating competitors?',
            type: 'BOOLEAN', required: false,
            reason: 'Competitor awareness helps set competitive pricing',
        });
        if (!lead.contact?.designation) {
            questions.push({
                id: 'decision_maker', question: 'Is the contact the final decision maker?',
                type: 'BOOLEAN', required: false,
                reason: 'Non-decision-makers need lower initial quotes',
            });
        }
        questions.push({
            id: 'requirements', question: 'Describe specific customer requirements',
            type: 'TEXT', required: false,
            reason: 'Specific requirements help suggest right products',
        });
        return questions;
    }
    avg(nums) {
        if (nums.length === 0)
            return 0;
        return nums.reduce((a, b) => a + b, 0) / nums.length;
    }
    mostCommon(items) {
        if (items.length === 0)
            return undefined;
        const freq = {};
        for (const i of items)
            freq[i] = (freq[i] || 0) + 1;
        return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
    }
};
exports.QuotationPredictionService = QuotationPredictionService;
exports.QuotationPredictionService = QuotationPredictionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cross_db_resolver_service_1.CrossDbResolverService])
], QuotationPredictionService);
//# sourceMappingURL=quotation-prediction.service.js.map