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
var TemplateCustomizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateCustomizationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let TemplateCustomizationService = TemplateCustomizationService_1 = class TemplateCustomizationService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TemplateCustomizationService_1.name);
    }
    async getCustomization(tenantId, templateId) {
        return this.prisma.working.tenantTemplateCustomization.findUnique({
            where: {
                tenantId_templateId: { tenantId, templateId },
            },
        });
    }
    async saveCustomization(tenantId, templateId, data) {
        this.logger.log(`Saving customization for tenant ${tenantId}, template ${templateId}`);
        return this.prisma.working.tenantTemplateCustomization.upsert({
            where: {
                tenantId_templateId: { tenantId, templateId },
            },
            create: {
                tenantId,
                templateId,
                customSettings: data.customSettings ?? {},
                customHeader: data.customHeader,
                customFooter: data.customFooter,
                termsAndConditions: data.termsAndConditions,
                bankDetails: data.bankDetails,
                signatureUrl: data.signatureUrl,
                logoUrl: data.logoUrl,
                isDefault: data.isDefault ?? false,
            },
            update: {
                customSettings: data.customSettings,
                customHeader: data.customHeader,
                customFooter: data.customFooter,
                termsAndConditions: data.termsAndConditions,
                bankDetails: data.bankDetails,
                signatureUrl: data.signatureUrl,
                logoUrl: data.logoUrl,
                isDefault: data.isDefault,
            },
        });
    }
    async resetCustomization(tenantId, templateId) {
        this.logger.log(`Resetting customization for tenant ${tenantId}, template ${templateId}`);
        const existing = await this.prisma.working.tenantTemplateCustomization.findUnique({
            where: {
                tenantId_templateId: { tenantId, templateId },
            },
        });
        if (!existing) {
            return null;
        }
        return this.prisma.working.tenantTemplateCustomization.delete({
            where: {
                tenantId_templateId: { tenantId, templateId },
            },
        });
    }
    async getDefaultTemplate(tenantId, documentType) {
        const tenantDefault = await this.prisma.working.tenantTemplateCustomization.findFirst({
            where: {
                tenantId,
                isDefault: true,
                template: { documentType, isActive: true },
            },
            include: { template: true },
        });
        if (tenantDefault) {
            return tenantDefault.template;
        }
        const systemDefault = await this.prisma.working.documentTemplate.findFirst({
            where: {
                documentType,
                isSystem: true,
                isDefault: true,
                isActive: true,
            },
        });
        if (systemDefault) {
            return systemDefault;
        }
        return this.prisma.working.documentTemplate.findFirst({
            where: {
                documentType,
                isSystem: true,
                isActive: true,
            },
            orderBy: { sortOrder: 'asc' },
        });
    }
};
exports.TemplateCustomizationService = TemplateCustomizationService;
exports.TemplateCustomizationService = TemplateCustomizationService = TemplateCustomizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplateCustomizationService);
//# sourceMappingURL=template-customization.service.js.map