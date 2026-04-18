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
exports.WarrantyClaimService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let WarrantyClaimService = class WarrantyClaimService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateNumber(tenantId) {
        const year = new Date().getFullYear();
        const count = await this.prisma.working.warrantyClaim.count({ where: { tenantId } });
        return `WC-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    async findAll(tenantId, filters) {
        return this.prisma.working.warrantyClaim.findMany({
            where: {
                tenantId,
                ...(filters?.status && { status: filters.status }),
                ...(filters?.assignedToId && { assignedToId: filters.assignedToId }),
            },
            include: { warrantyRecord: { include: { template: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(tenantId, id) {
        const claim = await this.prisma.working.warrantyClaim.findFirst({
            where: { id, tenantId },
            include: { warrantyRecord: { include: { template: true } } },
        });
        if (!claim)
            throw new common_1.NotFoundException('Warranty claim not found');
        return claim;
    }
    async create(tenantId, dto) {
        const record = await this.prisma.working.warrantyRecord.findFirst({
            where: { id: dto.warrantyRecordId, tenantId, status: { in: ['ACTIVE', 'EXTENDED'] } },
            include: { template: true },
        });
        if (!record)
            throw new common_1.NotFoundException('Active warranty record not found');
        const template = record.template;
        if (template.maxClaims) {
            if (record.claimsUsed >= template.maxClaims) {
                throw new common_1.BadRequestException(`Maximum claims (${template.maxClaims}) reached for this warranty`);
            }
        }
        const claimNumber = await this.generateNumber(tenantId);
        const [claim] = await this.prisma.$transaction([
            this.prisma.working.warrantyClaim.create({
                data: { ...dto, tenantId, claimNumber, status: 'OPEN' },
            }),
            this.prisma.working.warrantyRecord.update({
                where: { id: dto.warrantyRecordId },
                data: { claimsUsed: { increment: 1 } },
            }),
        ]);
        return claim;
    }
    async update(tenantId, id, dto) {
        const claim = await this.prisma.working.warrantyClaim.findFirst({ where: { id, tenantId } });
        if (!claim)
            throw new common_1.NotFoundException('Claim not found');
        return this.prisma.working.warrantyClaim.update({ where: { id }, data: dto });
    }
    async reject(tenantId, id, reason) {
        const claim = await this.prisma.working.warrantyClaim.findFirst({ where: { id, tenantId } });
        if (!claim)
            throw new common_1.NotFoundException('Claim not found');
        return this.prisma.working.warrantyClaim.update({
            where: { id },
            data: { status: 'REJECTED', rejectionReason: reason, isCovered: false },
        });
    }
};
exports.WarrantyClaimService = WarrantyClaimService;
exports.WarrantyClaimService = WarrantyClaimService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarrantyClaimService);
//# sourceMappingURL=warranty-claim.service.js.map