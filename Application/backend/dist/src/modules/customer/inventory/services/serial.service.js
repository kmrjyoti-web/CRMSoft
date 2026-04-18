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
exports.SerialService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const inventory_service_1 = require("./inventory.service");
let SerialService = class SerialService {
    constructor(prisma, inventoryService) {
        this.prisma = prisma;
        this.inventoryService = inventoryService;
    }
    async list(tenantId, filters) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 50;
        const where = { tenantId };
        if (filters.productId)
            where.productId = filters.productId;
        if (filters.status)
            where.status = filters.status;
        if (filters.locationId)
            where.locationId = filters.locationId;
        const [data, total] = await Promise.all([
            this.prisma.working.serialMaster.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { inventoryItem: true },
            }),
            this.prisma.working.serialMaster.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async getById(tenantId, id) {
        const serial = await this.prisma.working.serialMaster.findFirst({
            where: { id, tenantId },
            include: { inventoryItem: true },
        });
        if (!serial)
            throw new common_1.NotFoundException('Serial not found');
        return serial;
    }
    async create(tenantId, dto) {
        const item = await this.inventoryService.getOrCreateItem(tenantId, dto.productId, 'SERIAL');
        const existing = await this.prisma.working.serialMaster.findUnique({
            where: { tenantId_serialNo: { tenantId, serialNo: dto.serialNo } },
        });
        if (existing)
            throw new common_1.BadRequestException(`Serial number "${dto.serialNo}" already exists`);
        const serial = await this.prisma.working.serialMaster.create({
            data: {
                tenantId,
                productId: dto.productId,
                inventoryItemId: item.id,
                serialNo: dto.serialNo,
                code1: dto.code1,
                code2: dto.code2,
                batchNo: dto.batchNo,
                expiryType: dto.expiryType ?? 'NEVER',
                expiryValue: dto.expiryValue,
                expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
                mrp: dto.mrp,
                purchaseRate: dto.purchaseRate,
                saleRate: dto.saleRate,
                costPrice: dto.costPrice,
                taxType: dto.taxType,
                taxRate: dto.taxRate,
                hsnCode: dto.hsnCode,
                locationId: dto.locationId,
                customFields: dto.customFields,
                industryCode: dto.industryCode,
            },
        });
        await this.prisma.working.inventoryItem.update({
            where: { id: item.id },
            data: { currentStock: { increment: 1 } },
        });
        return serial;
    }
    async bulkCreate(tenantId, items) {
        const results = [];
        const errors = [];
        const productIds = [...new Set(items.map((i) => i.productId))];
        const itemMap = {};
        for (const productId of productIds) {
            const invItem = await this.inventoryService.getOrCreateItem(tenantId, productId, 'SERIAL');
            itemMap[productId] = invItem.id;
        }
        for (let idx = 0; idx < items.length; idx++) {
            const dto = items[idx];
            try {
                const existing = await this.prisma.working.serialMaster.findUnique({
                    where: { tenantId_serialNo: { tenantId, serialNo: dto.serialNo } },
                });
                if (existing) {
                    errors.push({ row: idx + 1, serialNo: dto.serialNo, error: 'Duplicate serial number' });
                    continue;
                }
                const serial = await this.prisma.working.serialMaster.create({
                    data: {
                        tenantId,
                        productId: dto.productId,
                        inventoryItemId: itemMap[dto.productId],
                        serialNo: dto.serialNo,
                        code1: dto.code1,
                        code2: dto.code2,
                        batchNo: dto.batchNo,
                        expiryType: dto.expiryType ?? 'NEVER',
                        expiryValue: dto.expiryValue,
                        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
                        mrp: dto.mrp,
                        purchaseRate: dto.purchaseRate,
                        saleRate: dto.saleRate,
                        costPrice: dto.costPrice,
                        locationId: dto.locationId,
                        industryCode: dto.industryCode,
                    },
                });
                results.push(serial);
            }
            catch (err) {
                errors.push({ row: idx + 1, serialNo: dto.serialNo, error: err.message });
            }
        }
        for (const productId of productIds) {
            const count = results.filter((r) => r.productId === productId).length;
            if (count > 0) {
                await this.prisma.working.inventoryItem.update({
                    where: { id: itemMap[productId] },
                    data: { currentStock: { increment: count } },
                });
            }
        }
        return { created: results.length, errors, total: items.length };
    }
    async update(tenantId, id, dto) {
        const serial = await this.getById(tenantId, id);
        return this.prisma.working.serialMaster.update({
            where: { id: serial.id },
            data: {
                code1: dto.code1,
                code2: dto.code2,
                batchNo: dto.batchNo,
                expiryType: dto.expiryType,
                expiryValue: dto.expiryValue,
                expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
                mrp: dto.mrp,
                purchaseRate: dto.purchaseRate,
                saleRate: dto.saleRate,
                costPrice: dto.costPrice,
                taxType: dto.taxType,
                taxRate: dto.taxRate,
                hsnCode: dto.hsnCode,
                locationId: dto.locationId,
                customFields: dto.customFields,
                metadata: dto.metadata,
            },
        });
    }
    async changeStatus(tenantId, id, status, customerId, invoiceId) {
        const serial = await this.getById(tenantId, id);
        const updateData = { status };
        if (status === 'SOLD') {
            updateData.soldDate = new Date();
            if (customerId)
                updateData.customerId = customerId;
            if (invoiceId)
                updateData.invoiceId = invoiceId;
        }
        else if (status === 'ACTIVATED') {
            updateData.activationDate = new Date();
        }
        return this.prisma.working.serialMaster.update({
            where: { id: serial.id },
            data: updateData,
        });
    }
    async search(tenantId, query) {
        const q = query.trim();
        if (!q)
            return [];
        return this.prisma.working.serialMaster.findMany({
            where: {
                tenantId,
                OR: [
                    { serialNo: { contains: q, mode: 'insensitive' } },
                    { code1: { contains: q, mode: 'insensitive' } },
                    { code2: { contains: q, mode: 'insensitive' } },
                    { batchNo: { contains: q, mode: 'insensitive' } },
                ],
            },
            take: 50,
            include: { inventoryItem: true },
        });
    }
    async getExpiring(tenantId, days = 30) {
        const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        return this.prisma.working.serialMaster.findMany({
            where: {
                tenantId,
                status: 'AVAILABLE',
                expiryDate: {
                    not: null,
                    lte: futureDate,
                },
            },
            orderBy: { expiryDate: 'asc' },
            include: { inventoryItem: true },
        });
    }
};
exports.SerialService = SerialService;
exports.SerialService = SerialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_service_1.InventoryService])
], SerialService);
//# sourceMappingURL=serial.service.js.map