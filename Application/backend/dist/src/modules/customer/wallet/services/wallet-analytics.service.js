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
exports.WalletAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let WalletAnalyticsService = class WalletAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSpendByCategory(tenantId, days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const where = {
            type: 'DEBIT',
            status: 'WTX_COMPLETED',
            createdAt: { gte: since },
        };
        if (tenantId)
            where.tenantId = tenantId;
        const transactions = await this.prisma.walletTransaction.findMany({
            where,
            select: { serviceKey: true, tokens: true },
        });
        const byCategory = {};
        for (const txn of transactions) {
            const category = txn.serviceKey?.split('.')[0] ?? 'other';
            byCategory[category] = (byCategory[category] ?? 0) + Math.abs(txn.tokens);
        }
        return Object.entries(byCategory)
            .map(([category, tokens]) => ({ category, tokens }))
            .sort((a, b) => b.tokens - a.tokens);
    }
    async getTopServices(tenantId, days = 30, limit = 10) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const where = {
            type: 'DEBIT',
            status: 'WTX_COMPLETED',
            createdAt: { gte: since },
        };
        if (tenantId)
            where.tenantId = tenantId;
        const transactions = await this.prisma.walletTransaction.findMany({
            where,
            select: { serviceKey: true, tokens: true },
        });
        const byService = {};
        for (const txn of transactions) {
            const key = txn.serviceKey ?? 'unknown';
            if (!byService[key])
                byService[key] = { tokens: 0, count: 0 };
            byService[key].tokens += Math.abs(txn.tokens);
            byService[key].count += 1;
        }
        return Object.entries(byService)
            .map(([serviceKey, stats]) => ({ serviceKey, ...stats }))
            .sort((a, b) => b.tokens - a.tokens)
            .slice(0, limit);
    }
    async getDailySpendTrend(tenantId, days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const where = {
            type: 'DEBIT',
            status: 'WTX_COMPLETED',
            createdAt: { gte: since },
        };
        if (tenantId)
            where.tenantId = tenantId;
        const transactions = await this.prisma.walletTransaction.findMany({
            where,
            select: { tokens: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        });
        const byDay = {};
        for (const txn of transactions) {
            const day = txn.createdAt.toISOString().slice(0, 10);
            byDay[day] = (byDay[day] ?? 0) + Math.abs(txn.tokens);
        }
        return Object.entries(byDay)
            .map(([date, tokens]) => ({ date, tokens }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    async getRevenueSummary(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const [totalRecharge, totalSpend, activeWallets, totalWallets] = await Promise.all([
            this.prisma.walletTransaction.aggregate({
                where: { type: 'CREDIT', status: 'WTX_COMPLETED', createdAt: { gte: since } },
                _sum: { tokens: true },
            }),
            this.prisma.walletTransaction.aggregate({
                where: { type: 'DEBIT', status: 'WTX_COMPLETED', createdAt: { gte: since } },
                _sum: { tokens: true },
            }),
            this.prisma.wallet.count({ where: { isActive: true, balance: { gt: 0 } } }),
            this.prisma.wallet.count(),
        ]);
        return {
            totalRecharged: totalRecharge._sum.tokens ?? 0,
            totalSpent: Math.abs(totalSpend._sum.tokens ?? 0),
            activeWallets,
            totalWallets,
            periodDays: days,
        };
    }
};
exports.WalletAnalyticsService = WalletAnalyticsService;
exports.WalletAnalyticsService = WalletAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletAnalyticsService);
//# sourceMappingURL=wallet-analytics.service.js.map