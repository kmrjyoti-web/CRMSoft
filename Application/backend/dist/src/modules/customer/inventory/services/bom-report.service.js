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
exports.BOMReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const bom_calculation_service_1 = require("./bom-calculation.service");
let BOMReportService = class BOMReportService {
    constructor(prisma, calculationService) {
        this.prisma = prisma;
        this.calculationService = calculationService;
    }
    async productionReport(tenantId, filters) {
        const where = { tenantId };
        if (filters?.formulaId)
            where.formulaId = filters.formulaId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.startDate || filters?.endDate) {
            where.productionDate = {};
            if (filters?.startDate)
                where.productionDate.gte = new Date(filters.startDate);
            if (filters?.endDate)
                where.productionDate.lte = new Date(filters.endDate);
        }
        const productions = await this.prisma.working.bOMProduction.findMany({
            where,
            include: { formula: { include: { finishedProduct: true } } },
            orderBy: { productionDate: 'desc' },
        });
        const totalProduced = productions.reduce((s, p) => s + p.quantityProduced, 0);
        const totalOrdered = productions.reduce((s, p) => s + p.quantityOrdered, 0);
        const totalScrap = productions.reduce((s, p) => s + p.scrapQuantity, 0);
        return {
            runs: productions,
            summary: {
                totalRuns: productions.length,
                totalOrdered,
                totalProduced,
                totalScrap,
                completedRuns: productions.filter((p) => p.status === 'COMPLETED').length,
                cancelledRuns: productions.filter((p) => p.status === 'CANCELLED').length,
                yieldRate: totalOrdered > 0 ? Math.round((totalProduced / totalOrdered) * 10000) / 100 : 0,
            },
        };
    }
    async consumptionReport(tenantId, filters) {
        const where = {
            tenantId,
            transactionType: 'PRODUCTION_OUT',
        };
        if (filters?.productId)
            where.productId = filters.productId;
        if (filters?.startDate || filters?.endDate) {
            where.transactionDate = {};
            if (filters?.startDate)
                where.transactionDate.gte = new Date(filters.startDate);
            if (filters?.endDate)
                where.transactionDate.lte = new Date(filters.endDate);
        }
        const transactions = await this.prisma.working.stockTransaction.findMany({
            where,
            include: { inventoryItem: true },
            orderBy: { transactionDate: 'desc' },
        });
        const byProduct = {};
        for (const txn of transactions) {
            const pid = txn.productId;
            if (!byProduct[pid])
                byProduct[pid] = { productId: pid, totalConsumed: 0, totalCost: 0, count: 0 };
            byProduct[pid].totalConsumed += Math.abs(txn.quantity);
            byProduct[pid].totalCost += Number(txn.totalAmount ?? 0);
            byProduct[pid].count++;
        }
        return {
            transactions,
            summary: Object.values(byProduct).sort((a, b) => b.totalConsumed - a.totalConsumed),
        };
    }
    async costingReport(tenantId, formulaId) {
        return this.calculationService.calculateCost(tenantId, formulaId, 1);
    }
    async yieldReport(tenantId, filters) {
        const where = { tenantId, status: 'COMPLETED' };
        if (filters?.startDate || filters?.endDate) {
            where.productionDate = {};
            if (filters?.startDate)
                where.productionDate.gte = new Date(filters.startDate);
            if (filters?.endDate)
                where.productionDate.lte = new Date(filters.endDate);
        }
        const productions = await this.prisma.working.bOMProduction.findMany({
            where,
            include: { formula: true },
            orderBy: { productionDate: 'desc' },
        });
        const yieldData = productions.map((p) => ({
            id: p.id,
            formulaName: p.formula.formulaName,
            ordered: p.quantityOrdered,
            produced: p.quantityProduced,
            scrap: p.scrapQuantity,
            yieldRate: p.quantityOrdered > 0
                ? Math.round((p.quantityProduced / p.quantityOrdered) * 10000) / 100
                : 0,
            date: p.productionDate,
        }));
        const avgYield = yieldData.length > 0
            ? Math.round(yieldData.reduce((s, y) => s + y.yieldRate, 0) / yieldData.length * 100) / 100
            : 0;
        return { runs: yieldData, averageYieldRate: avgYield };
    }
};
exports.BOMReportService = BOMReportService;
exports.BOMReportService = BOMReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bom_calculation_service_1.BOMCalculationService])
], BOMReportService);
//# sourceMappingURL=bom-report.service.js.map