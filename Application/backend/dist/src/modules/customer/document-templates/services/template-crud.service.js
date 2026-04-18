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
var TemplateCrudService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateCrudService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let TemplateCrudService = TemplateCrudService_1 = class TemplateCrudService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TemplateCrudService_1.name);
    }
    async findAll(filters) {
        const where = {};
        if (filters.documentType)
            where.documentType = filters.documentType;
        if (filters.industryCode)
            where.industryCode = filters.industryCode;
        if (filters.isActive !== undefined)
            where.isActive = filters.isActive;
        if (filters.isSystem !== undefined)
            where.isSystem = filters.isSystem;
        if (filters.tenantId)
            where.tenantId = filters.tenantId;
        return this.prisma.working.documentTemplate.findMany({
            where,
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        });
    }
    async findById(id) {
        const template = await this.prisma.working.documentTemplate.findUnique({
            where: { id },
            include: { tenantCustomizations: true },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template with ID "${id}" not found`);
        }
        return template;
    }
    async findByType(type, tenantId, industryCode) {
        const documentType = type;
        const orConditions = [
            { isSystem: true, tenantId: null },
        ];
        if (industryCode) {
            orConditions.push({ industryCode, tenantId: null });
        }
        if (tenantId) {
            orConditions.push({ tenantId });
        }
        return this.prisma.working.documentTemplate.findMany({
            where: {
                documentType,
                isActive: true,
                OR: orConditions,
            },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        });
    }
    async create(data) {
        this.logger.log(`Creating template: ${data.name} (${data.documentType})`);
        return this.prisma.working.documentTemplate.create({ data });
    }
    async update(id, data) {
        await this.findById(id);
        this.logger.log(`Updating template: ${id}`);
        return this.prisma.working.documentTemplate.update({
            where: { id },
            data,
        });
    }
    async archive(id) {
        await this.findById(id);
        this.logger.log(`Archiving template: ${id}`);
        return this.prisma.working.documentTemplate.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async duplicate(id) {
        const original = await this.findById(id);
        this.logger.log(`Duplicating template: ${original.name}`);
        return this.prisma.working.documentTemplate.create({
            data: {
                code: `${original.code}-copy`,
                name: `${original.name} - Copy`,
                description: original.description,
                documentType: original.documentType,
                htmlTemplate: original.htmlTemplate,
                cssStyles: original.cssStyles,
                defaultSettings: original.defaultSettings ?? {},
                availableFields: original.availableFields ?? [],
                industryCode: original.industryCode,
                thumbnailUrl: original.thumbnailUrl,
                sortOrder: original.sortOrder,
                isDefault: false,
                isSystem: false,
                isActive: true,
                tenantId: original.tenantId,
            },
        });
    }
    async setDefault(templateId, tenantId, documentType) {
        this.logger.log(`Setting default template: ${templateId} for tenant ${tenantId}, type ${documentType}`);
        await this.prisma.$transaction(async (tx) => {
            const existingDefaults = await tx.tenantTemplateCustomization.findMany({
                where: {
                    tenantId,
                    isDefault: true,
                    template: { documentType },
                },
            });
            for (const existing of existingDefaults) {
                await tx.tenantTemplateCustomization.update({
                    where: { id: existing.id },
                    data: { isDefault: false },
                });
            }
            await tx.tenantTemplateCustomization.upsert({
                where: {
                    tenantId_templateId: { tenantId, templateId },
                },
                create: {
                    tenantId,
                    templateId,
                    isDefault: true,
                },
                update: {
                    isDefault: true,
                },
            });
        });
        return this.findById(templateId);
    }
};
exports.TemplateCrudService = TemplateCrudService;
exports.TemplateCrudService = TemplateCrudService = TemplateCrudService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplateCrudService);
//# sourceMappingURL=template-crud.service.js.map