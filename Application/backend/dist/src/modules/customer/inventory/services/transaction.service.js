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
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const inventory_service_1 = require("./inventory.service");
let TransactionService = class TransactionService {
    constructor(prisma, inventoryService) {
        this.prisma = prisma;
        this.inventoryService = inventoryService;
    }
    async record(tenantId, dto) {
        const item = await this.inventoryService.getOrCreateItem(tenantId, dto.productId);
        const outTypes = ['SALE_OUT', 'DAMAGE', 'WRITE_OFF', 'PRODUCTION_OUT', 'SCRAP'];
        const signedQty = outTypes.includes(dto.transactionType)
            ? -Math.abs(dto.quantity)
            : Math.abs(dto.quantity);
        const totalAmount = dto.unitPrice ? dto.unitPrice * Math.abs(dto.quantity) : undefined;
        const txn = await this.prisma.working.stockTransaction.create({
            data: {
                tenantId,
                inventoryItemId: item.id,
                productId: dto.productId,
                transactionType: dto.transactionType,
                quantity: signedQty,
                unitPrice: dto.unitPrice,
                totalAmount,
                locationId: dto.locationId,
                toLocationId: dto.toLocationId,
                serialMasterId: dto.serialMasterId,
                batchId: dto.batchId,
                referenceType: dto.referenceType,
                referenceId: dto.referenceId,
                remarks: dto.remarks,
                createdById: dto.createdById,
            },
        });
        await this.prisma.working.inventoryItem.update({
            where: { id: item.id },
            data: { currentStock: { increment: signedQty } },
        });
        await this.updateSummary(tenantId, dto.productId, dto.locationId, item.id, signedQty);
        return txn;
    }
    async list(tenantId, filters) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 50;
        const where = { tenantId };
        if (filters.productId)
            where.productId = filters.productId;
        if (filters.transactionType)
            where.transactionType = filters.transactionType;
        if (filters.locationId)
            where.locationId = filters.locationId;
        if (filters.startDate || filters.endDate) {
            where.transactionDate = {};
            if (filters.startDate)
                where.transactionDate.gte = new Date(filters.startDate);
            if (filters.endDate)
                where.transactionDate.lte = new Date(filters.endDate);
        }
        const [data, total] = await Promise.all([
            this.prisma.working.stockTransaction.findMany({
                where,
                orderBy: { transactionDate: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { inventoryItem: true },
            }),
            this.prisma.working.stockTransaction.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async getLedger(tenantId, productId, filters) {
        const where = { tenantId, productId };
        if (filters?.locationId)
            where.locationId = filters.locationId;
        if (filters?.startDate || filters?.endDate) {
            where.transactionDate = {};
            if (filters?.startDate)
                where.transactionDate.gte = new Date(filters.startDate);
            if (filters?.endDate)
                where.transactionDate.lte = new Date(filters.endDate);
        }
        const transactions = await this.prisma.working.stockTransaction.findMany({
            where,
            orderBy: { transactionDate: 'asc' },
        });
        let runningBalance = 0;
        const ledger = transactions.map((txn) => {
            runningBalance += txn.quantity;
            return {
                ...txn,
                runningBalance,
            };
        });
        return ledger;
    }
    async getBySerial(tenantId, serialId) {
        return this.prisma.working.stockTransaction.findMany({
            where: { tenantId, serialMasterId: serialId },
            orderBy: { transactionDate: 'asc' },
        });
    }
    async transfer(tenantId, dto) {
        const item = await this.inventoryService.getOrCreateItem(tenantId, dto.productId);
        const outTxn = await this.prisma.working.stockTransaction.create({
            data: {
                tenantId,
                inventoryItemId: item.id,
                productId: dto.productId,
                transactionType: 'TRANSFER',
                quantity: -Math.abs(dto.quantity),
                unitPrice: dto.unitPrice,
                locationId: dto.fromLocationId,
                toLocationId: dto.toLocationId,
                remarks: dto.remarks ? `Transfer OUT: ${dto.remarks}` : 'Transfer OUT',
                createdById: dto.createdById,
            },
        });
        const inTxn = await this.prisma.working.stockTransaction.create({
            data: {
                tenantId,
                inventoryItemId: item.id,
                productId: dto.productId,
                transactionType: 'TRANSFER',
                quantity: Math.abs(dto.quantity),
                unitPrice: dto.unitPrice,
                locationId: dto.toLocationId,
                toLocationId: dto.fromLocationId,
                remarks: dto.remarks ? `Transfer IN: ${dto.remarks}` : 'Transfer IN',
                createdById: dto.createdById,
            },
        });
        await this.updateSummary(tenantId, dto.productId, dto.fromLocationId, item.id, -Math.abs(dto.quantity));
        await this.updateSummary(tenantId, dto.productId, dto.toLocationId, item.id, Math.abs(dto.quantity));
        return { outbound: outTxn, inbound: inTxn };
    }
    async updateSummary(tenantId, productId, locationId, inventoryItemId, quantityChange) {
        const existing = await this.prisma.working.stockSummary.findUnique({
            where: { tenantId_productId_locationId: { tenantId, productId, locationId } },
        });
        if (existing) {
            const update = { lastUpdatedAt: new Date() };
            if (quantityChange > 0) {
                update.totalIn = { increment: quantityChange };
                update.currentStock = { increment: quantityChange };
            }
            else {
                update.totalOut = { increment: Math.abs(quantityChange) };
                update.currentStock = { increment: quantityChange };
            }
            await this.prisma.working.stockSummary.update({ where: { id: existing.id }, data: update });
        }
        else {
            await this.prisma.working.stockSummary.create({
                data: {
                    tenantId,
                    productId,
                    locationId,
                    inventoryItemId,
                    totalIn: quantityChange > 0 ? quantityChange : 0,
                    totalOut: quantityChange < 0 ? Math.abs(quantityChange) : 0,
                    currentStock: quantityChange,
                    lastUpdatedAt: new Date(),
                },
            });
        }
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_service_1.InventoryService])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map