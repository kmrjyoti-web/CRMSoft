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
exports.WarrantyTemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let WarrantyTemplateService = class WarrantyTemplateService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, filters) {
        return this.prisma.working.warrantyTemplate.findMany({
            where: {
                OR: [
                    { tenantId },
                    { isSystemTemplate: true },
                ],
                ...(filters?.industryCode && { industryCode: filters.industryCode }),
                ...(filters?.systemOnly && { isSystemTemplate: true }),
                isActive: true,
            },
            orderBy: [{ isSystemTemplate: 'asc' }, { industryCode: 'asc' }, { name: 'asc' }],
        });
    }
    async findById(tenantId, id) {
        const template = await this.prisma.working.warrantyTemplate.findFirst({
            where: { id, OR: [{ tenantId }, { isSystemTemplate: true }] },
            include: { _count: { select: { records: true } } },
        });
        if (!template)
            throw new common_1.NotFoundException('Warranty template not found');
        return template;
    }
    async findByIndustry(industryCode) {
        return this.prisma.working.warrantyTemplate.findMany({
            where: { industryCode, isSystemTemplate: true, isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async create(tenantId, dto) {
        const existing = await this.prisma.working.warrantyTemplate.findFirst({
            where: { tenantId, code: dto.code },
        });
        if (existing)
            throw new common_1.ConflictException(`Template with code ${dto.code} already exists`);
        return this.prisma.working.warrantyTemplate.create({
            data: { ...dto, tenantId, isSystemTemplate: false },
        });
    }
    async update(tenantId, id, dto) {
        const template = await this.prisma.working.warrantyTemplate.findFirst({
            where: { id, tenantId, isSystemTemplate: false },
        });
        if (!template)
            throw new common_1.NotFoundException('Template not found or cannot edit system template');
        return this.prisma.working.warrantyTemplate.update({ where: { id }, data: dto });
    }
    async importSystemTemplate(tenantId, systemTemplateId) {
        const systemTemplate = await this.prisma.working.warrantyTemplate.findFirst({
            where: { id: systemTemplateId, isSystemTemplate: true },
        });
        if (!systemTemplate)
            throw new common_1.NotFoundException('System template not found');
        const { id, tenantId: _, isSystemTemplate, createdAt, updatedAt, ...data } = systemTemplate;
        const newCode = `${data.code}-${tenantId.slice(0, 4).toUpperCase()}`;
        const existing = await this.prisma.working.warrantyTemplate.findFirst({
            where: { tenantId, code: newCode },
        });
        if (existing)
            throw new common_1.ConflictException('Template already imported');
        return this.prisma.working.warrantyTemplate.create({
            data: { ...data, tenantId, code: newCode, isSystemTemplate: false },
        });
    }
};
exports.WarrantyTemplateService = WarrantyTemplateService;
exports.WarrantyTemplateService = WarrantyTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarrantyTemplateService);
//# sourceMappingURL=warranty-template.service.js.map