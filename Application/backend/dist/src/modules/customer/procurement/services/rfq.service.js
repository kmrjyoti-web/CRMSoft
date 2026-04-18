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
exports.RFQService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let RFQService = class RFQService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(tenantId, filters) {
        const page = filters?.page ?? 1;
        const limit = filters?.limit ?? 20;
        const where = { tenantId };
        if (filters?.status)
            where.status = filters.status;
        const [data, total] = await Promise.all([
            this.prisma.working.purchaseRFQ.findMany({
                where,
                include: {
                    items: true,
                    _count: { select: { quotations: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.purchaseRFQ.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async getById(tenantId, id) {
        const rfq = await this.prisma.working.purchaseRFQ.findFirst({
            where: { id, tenantId },
            include: {
                items: true,
                quotations: { include: { items: true } },
            },
        });
        if (!rfq)
            throw new common_1.NotFoundException('RFQ not found');
        return rfq;
    }
    async create(tenantId, userId, dto) {
        return this.prisma.working.purchaseRFQ.create({
            data: {
                tenantId,
                rfqNumber: dto.rfqNumber,
                title: `RFQ ${dto.rfqNumber}`,
                requiredByDate: dto.dueDate ? new Date(dto.dueDate) : null,
                remarks: dto.notes,
                status: 'DRAFT',
                createdById: userId,
                sentToVendorIds: dto.vendorIds ?? [],
                items: {
                    create: dto.items.map((item) => ({
                        tenantId,
                        productId: item.productId,
                        quantity: item.quantity,
                        unitId: item.unitId ?? '',
                        specifications: item.specifications,
                    })),
                },
            },
            include: { items: true },
        });
    }
    async update(tenantId, id, dto) {
        const rfq = await this.prisma.working.purchaseRFQ.findFirst({ where: { id, tenantId } });
        if (!rfq)
            throw new common_1.NotFoundException('RFQ not found');
        const data = {};
        if (dto.dueDate !== undefined)
            data.requiredByDate = dto.dueDate ? new Date(dto.dueDate) : null;
        if (dto.notes !== undefined)
            data.remarks = dto.notes;
        if (dto.status !== undefined)
            data.status = dto.status;
        return this.prisma.working.purchaseRFQ.update({ where: { id }, data });
    }
    async sendToVendors(tenantId, id, vendorIds) {
        const rfq = await this.prisma.working.purchaseRFQ.findFirst({ where: { id, tenantId } });
        if (!rfq)
            throw new common_1.NotFoundException('RFQ not found');
        return this.prisma.working.purchaseRFQ.update({
            where: { id },
            data: {
                status: 'SENT',
                sentToVendorIds: [...new Set([...rfq.sentToVendorIds, ...vendorIds])],
            },
        });
    }
    async close(tenantId, id) {
        const rfq = await this.prisma.working.purchaseRFQ.findFirst({ where: { id, tenantId } });
        if (!rfq)
            throw new common_1.NotFoundException('RFQ not found');
        return this.prisma.working.purchaseRFQ.update({
            where: { id },
            data: { status: 'CLOSED' },
        });
    }
    async generateNumber(tenantId) {
        const count = await this.prisma.working.purchaseRFQ.count({ where: { tenantId } });
        return `RFQ-${String(count + 1).padStart(5, '0')}`;
    }
};
exports.RFQService = RFQService;
exports.RFQService = RFQService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RFQService);
//# sourceMappingURL=rfq.service.js.map