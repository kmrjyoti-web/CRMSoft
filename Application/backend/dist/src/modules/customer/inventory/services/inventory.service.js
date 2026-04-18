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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let InventoryService = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateItem(tenantId, productId, inventoryType = 'SIMPLE') {
        let item = await this.prisma.working.inventoryItem.findUnique({
            where: { tenantId_productId: { tenantId, productId } },
        });
        if (!item) {
            item = await this.prisma.working.inventoryItem.create({
                data: { tenantId, productId, inventoryType: inventoryType },
            });
        }
        return item;
    }
    async getStockSummary(tenantId, filters) {
        const where = { tenantId };
        if (filters.productId)
            where.productId = filters.productId;
        if (filters.locationId)
            where.locationId = filters.locationId;
        const summaries = await this.prisma.working.stockSummary.findMany({
            where,
            include: { inventoryItem: true },
            orderBy: { lastUpdatedAt: 'desc' },
        });
        return summaries;
    }
    async getOpeningBalance(tenantId, productId, date) {
        const transactions = await this.prisma.working.stockTransaction.findMany({
            where: {
                tenantId,
                productId,
                transactionDate: { lt: date },
            },
            orderBy: { transactionDate: 'asc' },
        });
        let balance = 0;
        for (const txn of transactions) {
            balance += txn.quantity;
        }
        return { productId, date, openingBalance: balance };
    }
    async recalculateStock(tenantId, productId) {
        const transactions = await this.prisma.working.stockTransaction.findMany({
            where: { tenantId, productId },
            orderBy: { transactionDate: 'asc' },
        });
        const locationTotals = {};
        for (const txn of transactions) {
            if (!locationTotals[txn.locationId]) {
                locationTotals[txn.locationId] = { totalIn: 0, totalOut: 0 };
            }
            if (txn.quantity > 0) {
                locationTotals[txn.locationId].totalIn += txn.quantity;
            }
            else {
                locationTotals[txn.locationId].totalOut += Math.abs(txn.quantity);
            }
        }
        const item = await this.getOrCreateItem(tenantId, productId);
        let totalStock = 0;
        for (const [locationId, totals] of Object.entries(locationTotals)) {
            const currentStock = totals.totalIn - totals.totalOut;
            totalStock += currentStock;
            await this.prisma.working.stockSummary.upsert({
                where: { tenantId_productId_locationId: { tenantId, productId, locationId } },
                create: {
                    tenantId,
                    productId,
                    locationId,
                    inventoryItemId: item.id,
                    totalIn: totals.totalIn,
                    totalOut: totals.totalOut,
                    currentStock,
                    lastUpdatedAt: new Date(),
                },
                update: {
                    totalIn: totals.totalIn,
                    totalOut: totals.totalOut,
                    currentStock,
                    lastUpdatedAt: new Date(),
                },
            });
        }
        await this.prisma.working.inventoryItem.update({
            where: { id: item.id },
            data: { currentStock: totalStock },
        });
        return { productId, totalStock, locations: Object.keys(locationTotals).length };
    }
    async getDashboard(tenantId) {
        const [totalItems, totalSerials, lowStockItems, expiringSerials] = await Promise.all([
            this.prisma.working.inventoryItem.aggregate({
                where: { tenantId, isActive: true },
                _sum: { currentStock: true },
                _count: true,
            }),
            this.prisma.working.serialMaster.count({ where: { tenantId } }),
            this.prisma.working.inventoryItem.findMany({
                where: {
                    tenantId,
                    isActive: true,
                    reorderLevel: { not: null },
                },
            }),
            this.prisma.working.serialMaster.count({
                where: {
                    tenantId,
                    status: 'AVAILABLE',
                    expiryDate: {
                        not: null,
                        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);
        const lowStockCount = lowStockItems.filter((i) => i.reorderLevel !== null && i.currentStock <= (i.reorderLevel ?? 0)).length;
        const items = await this.prisma.working.inventoryItem.findMany({
            where: { tenantId, isActive: true },
        });
        const totalValue = items.reduce((sum, i) => {
            const price = Number(i.avgCostPrice ?? i.lastPurchasePrice ?? 0);
            return sum + price * i.currentStock;
        }, 0);
        return {
            totalStock: totalItems._sum.currentStock ?? 0,
            totalProducts: totalItems._count,
            totalSerials,
            stockValue: totalValue,
            expiringSoon: expiringSerials,
            lowStockAlerts: lowStockCount,
        };
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map