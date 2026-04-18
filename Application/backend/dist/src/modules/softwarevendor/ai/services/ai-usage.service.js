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
exports.AiUsageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let AiUsageService = class AiUsageService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(params) {
        const totalTokens = (params.promptTokens || 0) + (params.outputTokens || 0);
        return this.prisma.aiUsageLog.create({
            data: {
                tenantId: params.tenantId,
                userId: params.userId,
                provider: params.provider,
                model: params.model,
                operation: params.operation,
                promptTokens: params.promptTokens || 0,
                outputTokens: params.outputTokens || 0,
                totalTokens,
                latencyMs: params.latencyMs,
                success: params.success,
                errorMessage: params.errorMessage,
                entityType: params.entityType,
                entityId: params.entityId,
            },
        });
    }
    async getUsageStats(tenantId) {
        const stats = await this.prisma.aiUsageLog.groupBy({
            by: ['provider', 'model'],
            where: { tenantId },
            _sum: { totalTokens: true, promptTokens: true, outputTokens: true },
            _count: { id: true },
        });
        const successCounts = await this.prisma.aiUsageLog.groupBy({
            by: ['provider'],
            where: { tenantId, success: true },
            _count: { id: true },
        });
        const failureCounts = await this.prisma.aiUsageLog.groupBy({
            by: ['provider'],
            where: { tenantId, success: false },
            _count: { id: true },
        });
        const successMap = Object.fromEntries(successCounts.map((s) => [s.provider, s._count.id]));
        const failureMap = Object.fromEntries(failureCounts.map((f) => [f.provider, f._count.id]));
        return stats.map((s) => ({
            provider: s.provider,
            model: s.model,
            totalTokens: s._sum.totalTokens || 0,
            promptTokens: s._sum.promptTokens || 0,
            outputTokens: s._sum.outputTokens || 0,
            requestCount: s._count.id,
            successCount: successMap[s.provider] || 0,
            failureCount: failureMap[s.provider] || 0,
        }));
    }
};
exports.AiUsageService = AiUsageService;
exports.AiUsageService = AiUsageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiUsageService);
//# sourceMappingURL=ai-usage.service.js.map