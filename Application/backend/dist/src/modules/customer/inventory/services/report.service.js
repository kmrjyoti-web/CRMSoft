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
exports.InventoryReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let InventoryReportService = class InventoryReportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async stockLedger(tenantId, filters) {
        const where = { tenantId };
        if (filters.productId)
            where.productId = filters.productId;
        if (filters.locationId)
            where.locationId = filters.locationId;
        if (filters.startDate || filters.endDate) {
            where.transactionDate = {};
            if (filters.startDate)
                where.transactionDate.gte = new Date(filters.startDate);
            if (filters.endDate)
                where.transactionDate.lte = new Date(filters.endDate);
        }
        const transactions = await this.prisma.working.stockTransaction.findMany({
            where,
            orderBy: { transactionDate: 'asc' },
            include: { inventoryItem: true },
        });
        let runningBalance = 0;
        return transactions.map((txn) => {
            runningBalance += txn.quantity;
            return {
                id: txn.id,
                date: txn.transactionDate,
                productId: txn.productId,
                type: txn.transactionType,
                inQty: txn.quantity > 0 ? txn.quantity : 0,
                outQty: txn.quantity < 0 ? Math.abs(txn.quantity) : 0,
                balance: runningBalance,
                unitPrice: txn.unitPrice,
                totalAmount: txn.totalAmount,
                location: txn.locationId,
                remarks: txn.remarks,
            };
        });
    }
    async expiryReport(tenantId, days = 30) {
        const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        const serials = await this.prisma.working.serialMaster.findMany({
            where: {
                tenantId,
                expiryDate: { not: null, lte: futureDate },
                status: { in: ['AVAILABLE', 'RESERVED'] },
            },
            orderBy: { expiryDate: 'asc' },
            include: { inventoryItem: true },
        });
        return serials.map((s) => {
            const daysLeft = s.expiryDate
                ? Math.ceil((s.expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
                : null;
            return {
                id: s.id,
                serialNo: s.serialNo,
                productId: s.productId,
                expiryDate: s.expiryDate,
                daysLeft,
                status: s.status,
                isExpired: daysLeft !== null && daysLeft <= 0,
                locationId: s.locationId,
                costPrice: s.costPrice,
            };
        });
    }
    async valuation(tenantId, filters) {
        const where = { tenantId, isActive: true };
        const items = await this.prisma.working.inventoryItem.findMany({ where });
        let summaries = [];
        if (filters?.locationId) {
            summaries = await this.prisma.working.stockSummary.findMany({
                where: { tenantId, locationId: filters.locationId },
                include: { inventoryItem: true },
            });
        }
        const productValuations = items.map((item) => {
            const price = Number(item.avgCostPrice ?? item.lastPurchasePrice ?? 0);
            const stock = item.currentStock;
            return {
                productId: item.productId,
                inventoryType: item.inventoryType,
                currentStock: stock,
                avgCostPrice: price,
                totalValue: price * stock,
                hsnCode: item.hsnCode,
            };
        });
        const totalValue = productValuations.reduce((sum, p) => sum + p.totalValue, 0);
        const totalStock = productValuations.reduce((sum, p) => sum + p.currentStock, 0);
        return {
            totalValue,
            totalStock,
            totalProducts: productValuations.length,
            products: productValuations,
        };
    }
    async serialTracking(tenantId, filters) {
        const where = { tenantId };
        if (filters?.serialNo)
            where.serialNo = { contains: filters.serialNo, mode: 'insensitive' };
        if (filters?.productId)
            where.productId = filters.productId;
        if (filters?.status)
            where.status = filters.status;
        const serials = await this.prisma.working.serialMaster.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
        const serialIds = serials.map((s) => s.id);
        const transactions = serialIds.length > 0
            ? await this.prisma.working.stockTransaction.findMany({
                where: { tenantId, serialMasterId: { in: serialIds } },
                orderBy: { transactionDate: 'asc' },
            })
            : [];
        const txnMap = {};
        for (const txn of transactions) {
            if (txn.serialMasterId) {
                if (!txnMap[txn.serialMasterId])
                    txnMap[txn.serialMasterId] = [];
                txnMap[txn.serialMasterId].push(txn);
            }
        }
        return serials.map((s) => ({
            ...s,
            lifecycle: txnMap[s.id] ?? [],
        }));
    }
};
exports.InventoryReportService = InventoryReportService;
exports.InventoryReportService = InventoryReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryReportService);
//# sourceMappingURL=report.service.js.map