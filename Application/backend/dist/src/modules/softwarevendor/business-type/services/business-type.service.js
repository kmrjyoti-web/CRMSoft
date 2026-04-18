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
var BusinessTypeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessTypeService = void 0;
const common_1 = require("@nestjs/common");
const working_client_1 = require("@prisma/working-client");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const business_type_seed_data_1 = require("./business-type-seed-data");
let BusinessTypeService = BusinessTypeService_1 = class BusinessTypeService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(BusinessTypeService_1.name);
    }
    async seed() {
        const results = await Promise.all(business_type_seed_data_1.BUSINESS_TYPE_SEED_DATA.map((bt) => this.prisma.platform.businessTypeRegistry.upsert({
            where: { typeCode: bt.typeCode },
            update: {
                typeName: bt.typeName,
                industryCategory: bt.industryCategory,
                description: bt.description,
                icon: bt.icon,
                colorTheme: bt.colorTheme,
                terminologyMap: bt.terminologyMap,
                defaultModules: bt.defaultModules,
                recommendedModules: bt.recommendedModules,
                excludedModules: bt.excludedModules,
                dashboardWidgets: bt.dashboardWidgets,
                workflowTemplates: bt.workflowTemplates,
                extraFields: bt.extraFields ?? {},
                defaultLeadStages: bt.defaultLeadStages ?? working_client_1.Prisma.DbNull,
                defaultActivityTypes: bt.defaultActivityTypes ?? working_client_1.Prisma.DbNull,
                registrationFields: bt.registrationFields ?? working_client_1.Prisma.DbNull,
                isDefault: bt.isDefault ?? false,
            },
            create: {
                typeCode: bt.typeCode,
                typeName: bt.typeName,
                industryCategory: bt.industryCategory,
                description: bt.description,
                icon: bt.icon,
                colorTheme: bt.colorTheme,
                terminologyMap: bt.terminologyMap,
                defaultModules: bt.defaultModules,
                recommendedModules: bt.recommendedModules,
                excludedModules: bt.excludedModules,
                dashboardWidgets: bt.dashboardWidgets,
                workflowTemplates: bt.workflowTemplates,
                extraFields: bt.extraFields ?? {},
                defaultLeadStages: bt.defaultLeadStages ?? working_client_1.Prisma.DbNull,
                defaultActivityTypes: bt.defaultActivityTypes ?? working_client_1.Prisma.DbNull,
                registrationFields: bt.registrationFields ?? working_client_1.Prisma.DbNull,
                isDefault: bt.isDefault ?? false,
                sortOrder: business_type_seed_data_1.BUSINESS_TYPE_SEED_DATA.indexOf(bt),
            },
        })));
        this.logger.log(`Business types seeded: ${results.length}`);
        return results;
    }
    async listAll(activeOnly = true) {
        return this.prisma.platform.businessTypeRegistry.findMany({
            where: activeOnly ? { isActive: true } : {},
            orderBy: { sortOrder: 'asc' },
        });
    }
    async getByCode(typeCode) {
        const bt = await this.prisma.platform.businessTypeRegistry.findUnique({
            where: { typeCode },
            include: {
                industryPackages: { include: { package: true }, orderBy: { sortOrder: 'asc' } },
            },
        });
        if (!bt)
            throw new common_1.NotFoundException(`Business type '${typeCode}' not found`);
        return bt;
    }
    async getById(id) {
        const bt = await this.prisma.platform.businessTypeRegistry.findUnique({ where: { id } });
        if (!bt)
            throw new common_1.NotFoundException(`Business type ${id} not found`);
        return bt;
    }
    async resolveProfile(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        const bt = tenant.businessTypeId
            ? await this.prisma.platform.businessTypeRegistry.findUnique({ where: { id: tenant.businessTypeId } })
            : null;
        const terminologyMap = bt
            ? bt.terminologyMap ?? {}
            : {};
        const overrides = await this.prisma.terminologyOverride.findMany({
            where: { tenantId, isActive: true },
        });
        for (const ov of overrides) {
            terminologyMap[ov.termKey] = ov.customLabel;
        }
        return {
            tenantId,
            businessType: bt
                ? {
                    typeCode: bt.typeCode,
                    typeName: bt.typeName,
                    industryCategory: bt.industryCategory,
                    icon: bt.icon,
                    colorTheme: bt.colorTheme,
                }
                : null,
            terminology: terminologyMap,
            defaultModules: bt ? bt.defaultModules : [],
            recommendedModules: bt ? bt.recommendedModules : [],
            excludedModules: bt ? bt.excludedModules : [],
            dashboardWidgets: bt ? bt.dashboardWidgets : [],
            workflowTemplates: bt ? bt.workflowTemplates : [],
            tradeProfile: tenant.tradeProfileJson ?? {},
        };
    }
    async update(typeCode, data) {
        const bt = await this.getByCode(typeCode);
        const { typeName, description, icon, colorTheme, terminologyMap, extraFields, defaultModules, recommendedModules, excludedModules, defaultLeadStages, defaultActivityTypes, registrationFields, dashboardWidgets, isActive, sortOrder, } = data;
        return this.prisma.platform.businessTypeRegistry.update({
            where: { id: bt.id },
            data: {
                ...(typeName !== undefined && { typeName }),
                ...(description !== undefined && { description }),
                ...(icon !== undefined && { icon }),
                ...(colorTheme !== undefined && { colorTheme }),
                ...(terminologyMap !== undefined && { terminologyMap }),
                ...(extraFields !== undefined && { extraFields }),
                ...(defaultModules !== undefined && { defaultModules }),
                ...(recommendedModules !== undefined && { recommendedModules }),
                ...(excludedModules !== undefined && { excludedModules }),
                ...(defaultLeadStages !== undefined && { defaultLeadStages }),
                ...(defaultActivityTypes !== undefined && { defaultActivityTypes }),
                ...(registrationFields !== undefined && { registrationFields }),
                ...(dashboardWidgets !== undefined && { dashboardWidgets }),
                ...(isActive !== undefined && { isActive }),
                ...(sortOrder !== undefined && { sortOrder }),
            },
        });
    }
    async getTenants(typeCode) {
        const bt = await this.getByCode(typeCode);
        return this.prisma.tenant.findMany({
            where: { businessTypeId: bt.id },
            select: { id: true, name: true, slug: true, status: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async assignToTenant(tenantId, typeCode) {
        const bt = await this.getByCode(typeCode);
        return this.prisma.tenant.update({
            where: { id: tenantId },
            data: { businessTypeId: bt.id },
        });
    }
    async updateTradeProfile(tenantId, profile) {
        return this.prisma.tenant.update({
            where: { id: tenantId },
            data: { tradeProfileJson: profile },
        });
    }
};
exports.BusinessTypeService = BusinessTypeService;
exports.BusinessTypeService = BusinessTypeService = BusinessTypeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BusinessTypeService);
//# sourceMappingURL=business-type.service.js.map