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
exports.WarrantyRecordService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let WarrantyRecordService = class WarrantyRecordService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateNumber(tenantId) {
        const year = new Date().getFullYear();
        const count = await this.prisma.working.warrantyRecord.count({ where: { tenantId } });
        return `WR-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    async findAll(tenantId, filters) {
        return this.prisma.working.warrantyRecord.findMany({
            where: {
                tenantId,
                ...(filters?.customerId && { customerId: filters.customerId }),
                ...(filters?.productId && { productId: filters.productId }),
                ...(filters?.status && { status: filters.status }),
            },
            include: { template: true, _count: { select: { claims: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(tenantId, id) {
        const record = await this.prisma.working.warrantyRecord.findFirst({
            where: { id, tenantId },
            include: {
                template: true,
                claims: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!record)
            throw new common_1.NotFoundException('Warranty record not found');
        return record;
    }
    async findExpiring(tenantId, days = 30) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + days);
        return this.prisma.working.warrantyRecord.findMany({
            where: {
                tenantId,
                status: 'ACTIVE',
                endDate: { lte: cutoff, gte: new Date() },
            },
            include: { template: true },
            orderBy: { endDate: 'asc' },
        });
    }
    async checkBySerial(tenantId, serialMasterId) {
        return this.prisma.working.warrantyRecord.findFirst({
            where: { tenantId, serialMasterId, status: 'ACTIVE' },
            include: { template: true },
        });
    }
    async extend(tenantId, id, dto) {
        const record = await this.prisma.working.warrantyRecord.findFirst({ where: { id, tenantId } });
        if (!record)
            throw new common_1.NotFoundException('Warranty record not found');
        const base = record.extendedUntil ?? record.endDate;
        const extended = new Date(base);
        extended.setMonth(extended.getMonth() + dto.months);
        return this.prisma.working.warrantyRecord.update({
            where: { id },
            data: { extendedUntil: extended, status: 'EXTENDED', notes: dto.reason },
        });
    }
    async autoCreateFromInvoice(tenantId, invoice) {
        if (!invoice.lineItems?.length)
            return [];
        const created = [];
        for (const item of invoice.lineItems) {
            if (!item.productId)
                continue;
            const template = await this.prisma.working.warrantyTemplate.findFirst({
                where: {
                    tenantId,
                    OR: [
                        { productId: item.productId },
                        { applicationType: 'ALL_PRODUCTS' },
                    ],
                    isActive: true,
                    isSystemTemplate: false,
                },
            });
            if (!template)
                continue;
            const startDate = new Date();
            const endDate = this.calcEndDate(startDate, template.durationValue, template.durationType);
            const warrantyNumber = await this.generateNumber(tenantId);
            const record = await this.prisma.working.warrantyRecord.create({
                data: {
                    tenantId,
                    warrantyTemplateId: template.id,
                    warrantyNumber,
                    customerId: invoice.contactId ?? invoice.organizationId ?? 'unknown',
                    customerType: invoice.organizationId ? 'ORGANIZATION' : 'CONTACT',
                    customerName: invoice.billingName,
                    productId: item.productId,
                    productName: item.productName,
                    invoiceId: invoice.id,
                    startDate,
                    endDate,
                    status: 'ACTIVE',
                },
            });
            created.push(record);
        }
        return created;
    }
    calcEndDate(start, value, type) {
        const end = new Date(start);
        if (type === 'DAYS')
            end.setDate(end.getDate() + value);
        else if (type === 'MONTHS')
            end.setMonth(end.getMonth() + value);
        else if (type === 'YEARS')
            end.setFullYear(end.getFullYear() + value);
        return end;
    }
};
exports.WarrantyRecordService = WarrantyRecordService;
exports.WarrantyRecordService = WarrantyRecordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarrantyRecordService);
//# sourceMappingURL=warranty-record.service.js.map